# Phase 14: Aurora MySQL Specifics - Research

**Researched:** 2026-02-01
**Domain:** AWS Aurora MySQL with Debezium CDC
**Confidence:** HIGH

## Summary

Aurora MySQL is a cloud-native database with unique architectural differences from community MySQL that significantly impact CDC configuration. The research focused on three critical areas: Aurora-specific parameter group configuration, the Enhanced Binlog architecture introduced in Aurora MySQL 3.03.1+, and Aurora's global read lock prohibition that affects Debezium snapshot strategies.

Key findings reveal that Aurora MySQL requires different configuration approaches compared to community MySQL covered in Phases 12-13. Most notably: (1) Aurora uses stored procedures (`mysql.rds_set_configuration`) rather than direct parameter modification for binlog retention, (2) Enhanced Binlog (Aurora MySQL 3.03.1+) fundamentally changes binlog architecture by separating storage to specialized storage nodes with parallel writes, achieving 99% faster recovery and reducing compute overhead from ~50% to ~13%, and (3) Aurora prohibits `FLUSH TABLES WITH READ LOCK`, forcing Debezium to use table-level locks during snapshots which impacts large table strategies.

The research established Aurora MySQL 8.0.40 (Aurora version 3.09.0+) as the target platform, aligning with Phase 11 decision [11-01]. This version supports Enhanced Binlog, has `binlog_format=ROW` as default, and provides 90-day maximum binlog retention.

**Primary recommendation:** Structure Phase 14 lessons around three distinct Aurora differences: parameter group/procedure-based configuration (Lesson 07), Enhanced Binlog architecture and tradeoffs (Lesson 08), and snapshot mode selection based on Aurora's locking constraints (Lesson 09).

## Standard Stack

Aurora MySQL CDC with Debezium requires the same core stack as Phase 13 but with Aurora-specific configuration patterns.

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Debezium MySQL Connector | 2.5.x | MySQL CDC connector | Phase decision [v1.0] - Java 21 ARM64 compatible |
| Aurora MySQL | 8.0.40 (Aurora 3.09.0+) | Source database | Phase decision [11-01], supports Enhanced Binlog |
| AWS Aurora Parameter Groups | N/A | Configuration management | AWS-managed, required for binlog settings |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| mysql.rds_set_configuration | Built-in procedure | Binlog retention config | Always for Aurora (replaces SET GLOBAL) |
| mysql.rds_show_configuration | Built-in procedure | Show current settings | Verification, troubleshooting |
| Aurora Enhanced Binlog | Aurora 3.03.1+ | Optimized binlog storage | Optional, production workloads with high write throughput |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Enhanced Binlog | Standard binlog | Standard binlog: works with Aurora Global Database and backtrack, but 50% compute overhead vs 13%; Enhanced: 99% faster recovery, parallel writes, but incompatible with backtrack and binlog not in backups |
| snapshot.locking.mode=minimal | snapshot.locking.mode=none | minimal: safer, uses table locks but prevents concurrent schema changes; none: no locks, faster, but risk of schema change inconsistency during snapshot |
| 7-day retention | 90-day retention (Aurora 2.11.0+/3.x max) | 7 days: sufficient for lab/course exercises per Phase 12 decision [12-01]; 90 days: production safety margin but increases storage costs |

### Configuration

Aurora MySQL parameter group configuration (prerequisite):

```sql
-- Enable binlog via custom DB cluster parameter group
-- binlog_format = ROW (default in MySQL 8.0.34+)
-- Requires reboot of writer + all reader instances

-- Set binlog retention (Aurora-specific stored procedure)
CALL mysql.rds_set_configuration('binlog retention hours', 168);  -- 7 days

-- Verify configuration
CALL mysql.rds_show_configuration;
```

Enhanced Binlog activation (Aurora 3.03.1+):

```sql
-- DB cluster parameter group settings (requires reboot)
aurora_enhanced_binlog = 1
binlog_format = ROW (or STATEMENT/MIXED, not OFF)
binlog_backup = 0
binlog_replication_globaldb = 0

-- Verify Enhanced Binlog is active
SHOW STATUS LIKE 'aurora_enhanced_binlog';
-- Expected: aurora_enhanced_binlog | ACTIVE
```

## Architecture Patterns

### Pattern 1: Aurora Parameter Group Strategy

**What:** Aurora MySQL requires custom DB cluster parameter groups for binlog configuration because default parameter groups cannot be modified.

**When to use:** Always for Aurora MySQL CDC setup (prerequisite).

**Aurora-specific differences:**
- **Community MySQL:** Direct `SET PERSIST` statements or editing `/etc/my.cnf`
- **Aurora MySQL:** Custom parameter group → associate with cluster → reboot

**Example workflow:**
```bash
# 1. Create custom DB cluster parameter group (AWS Console/CLI)
aws rds create-db-cluster-parameter-group \
  --db-cluster-parameter-group-name debezium-aurora-mysql-80 \
  --db-parameter-group-family aurora-mysql8.0 \
  --description "Aurora MySQL 8.0 for Debezium CDC"

# 2. Modify parameters
aws rds modify-db-cluster-parameter-group \
  --db-cluster-parameter-group-name debezium-aurora-mysql-80 \
  --parameters "ParameterName=binlog_format,ParameterValue=ROW,ApplyMethod=pending-reboot"

# 3. Associate with cluster
aws rds modify-db-cluster \
  --db-cluster-identifier my-aurora-cluster \
  --db-cluster-parameter-group-name debezium-aurora-mysql-80

# 4. Reboot writer instance (Aurora 2.10+: also reboot all readers manually)
aws rds reboot-db-instance --db-instance-identifier my-aurora-instance

# 5. Set binlog retention via stored procedure (connect to writer)
mysql> CALL mysql.rds_set_configuration('binlog retention hours', 168);
mysql> CALL mysql.rds_show_configuration;
```

**Reference:** [Configuring Aurora MySQL binary logging](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_LogAccess.MySQL.BinaryFormat.html)

### Pattern 2: Enhanced Binlog Architecture

**What:** Aurora MySQL 3.03.1+ separates binlog storage to specialized storage nodes that handle sorting/ordering, enabling parallel writes of transaction log and binlog.

**When to use:** Production workloads with high write concurrency where binlog overhead is a concern AND when you don't need backtrack feature or cross-region binlog replication in Aurora Global Database.

**Architecture diagram (conceptual):**
```
┌─────────────────────────────────────────────────────────────┐
│                    Aurora MySQL Engine                      │
│  ┌───────────────┐              ┌──────────────────┐        │
│  │ Transaction   │──parallel──▶ │  Binlog Events   │        │
│  │ Log Events    │   writes     │  (unsorted)      │        │
│  └───────────────┘              └──────────────────┘        │
│         │                                 │                 │
│         ▼                                 ▼                 │
└─────────────────────────────────────────────────────────────┘
          │                                 │
          │                                 │
          ▼                                 ▼
┌─────────────────┐              ┌──────────────────────────┐
│  Transaction    │              │  Enhanced Binlog         │
│  Log Storage    │              │  Storage Nodes           │
│  (Standard)     │              │  (Specialized for binlog)│
└─────────────────┘              └──────────────────────────┘
                                           │
                                           ▼
                                 ┌─────────────────────┐
                                 │  Sorting & Ordering │
                                 │  (Storage Layer)    │
                                 └─────────────────────┘
                                           │
                                           ▼
                                 ┌─────────────────────┐
                                 │  Ordered Binlog     │
                                 │  Files              │
                                 └─────────────────────┘
```

**Key characteristics:**
- **Parallel writes:** Transaction log and binlog written simultaneously (not sequentially)
- **Storage-level ordering:** Binlog sorting pushed to storage layer, reducing engine overhead
- **Performance gains:**
  - Compute overhead: ~50% → ~13%
  - Write throughput: +40% on highly concurrent workloads
  - Recovery time: +99% improvement (after restarts/failovers)

**Critical limitations:**
| Limitation | Impact | Workaround |
|------------|--------|------------|
| Not in Aurora backups | After restore/clone, binlog sequence starts fresh from `.000001` | Use snapshot-based initial load, not binlog position from backup |
| Backtrack incompatible | Cannot enable Enhanced Binlog if backtrack ever enabled | Choose: backtrack OR Enhanced Binlog (not both) |
| Global Database: no replication | Secondary regions don't get binlog files; after failover, new primary starts fresh sequence | Don't depend on binlog continuity across regions |
| `max_binlog_size` read-only | Auto-changed from 128MB to 256MB | Accept Aurora's value |

**Example configuration:**
```sql
-- Parameter group settings (requires reboot)
aurora_enhanced_binlog = 1
binlog_backup = 0                    -- MUST disable
binlog_replication_globaldb = 0      -- MUST disable

-- Verification
SHOW STATUS LIKE 'aurora_enhanced_binlog';
-- aurora_enhanced_binlog | ACTIVE

SHOW BINARY LOGS;
-- mysql-bin-changelog.000001  (Enhanced Binlog naming)
-- mysql-bin-changelog.000002
```

**CloudWatch metrics for monitoring:**
- `ChangeLogBytesUsed` - Enhanced binlog storage usage
- `ChangeLogReadIOPs` - Read operations per 5 minutes
- `ChangeLogWriteIOPs` - Write operations per 5 minutes

**Reference:** [Setting up enhanced binlog for Aurora MySQL](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Enhanced.binlog.html)

### Pattern 3: Snapshot Mode Selection for Aurora

**What:** Aurora prohibits `FLUSH TABLES WITH READ LOCK` (global read lock), forcing Debezium to use table-level locks during snapshots. Snapshot mode choice depends on table size and tolerance for lock duration.

**When to use:** Always when configuring Debezium MySQL connector for Aurora.

**Decision matrix:**

| Scenario | Recommended Mode | Locking Strategy | Rationale |
|----------|------------------|------------------|-----------|
| Initial setup, small tables (<10GB) | `snapshot.mode=initial`<br>`snapshot.locking.mode=minimal` | Table-level locks held only during schema read; data read via REPEATABLE READ | Default safe mode; locks released quickly |
| Large tables (>10GB), can tolerate brief locks | `snapshot.mode=initial`<br>`snapshot.locking.mode=minimal` | Same as above | Locks only during metadata phase |
| Very large tables, zero lock tolerance | `snapshot.mode=initial`<br>`snapshot.locking.mode=none` | No locks; uses REPEATABLE READ | **WARNING:** Schema changes during snapshot cause inconsistency |
| Restore from Aurora backup snapshot | `snapshot.mode=when_needed`<br>+ manual binlog position | No snapshot if valid offset exists | Use Aurora backup for data, resume CDC from binlog position |
| Schema-only (data already synced) | `snapshot.mode=no_data` | Schema capture only | Useful for schema history rebuild |
| Never snapshot | `snapshot.mode=never` | No snapshot; stream from current position | Recovery scenarios, schema history exists |

**Aurora-specific snapshot workflow:**

```properties
# Connector configuration for Aurora (small-medium tables)
snapshot.mode=initial
snapshot.locking.mode=minimal

# Debezium behavior on Aurora:
# Step 1: Detect Aurora (no FLUSH TABLES WITH READ LOCK permission)
# Step 2: Fall back to table-level locks
# Step 3: FOR EACH TABLE in table.include.list:
#         - LOCK TABLES <table> READ
#         - Read table schema
#         - UNLOCK TABLES
# Step 4: Start REPEATABLE READ transaction (consistent snapshot)
# Step 5: Read binlog position from writer
# Step 6: Stream table data (no locks held)
# Step 7: Commit transaction
# Step 8: Resume from binlog position
```

**Large table strategy (zero lock tolerance):**

```properties
# WARNING: Only use if you can guarantee no schema changes during snapshot
snapshot.mode=initial
snapshot.locking.mode=none

# Benefits:
# - No table locks acquired
# - Concurrent writes not blocked
# - Faster snapshot for large tables

# Risks:
# - If ALTER TABLE, ADD COLUMN, DROP COLUMN occurs during snapshot:
#   → Data inconsistency
#   → Snapshot must be restarted
```

**Aurora backup-based approach:**

```bash
# 1. Create Aurora backup snapshot (AWS Console/CLI)
aws rds create-db-cluster-snapshot \
  --db-cluster-snapshot-identifier aurora-cdc-baseline \
  --db-cluster-identifier my-aurora-cluster

# 2. Restore to new cluster for bulk load
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier aurora-restore-cdc \
  --snapshot-identifier aurora-cdc-baseline

# 3. Bulk load data from restored cluster (e.g., via Kafka Connect JDBC source)

# 4. Configure Debezium with snapshot.mode=never + specific binlog position
# Get binlog position from source cluster BEFORE snapshot:
mysql> SHOW MASTER STATUS;
# +--------------------------+----------+
# | File                     | Position |
# +--------------------------+----------+
# | mysql-bin-changelog.005  | 154      |
# +--------------------------+----------+

# 5. Debezium connector config
{
  "snapshot.mode": "never",
  "database.history.skip.unparseable.ddl": "true"
  # Resume streaming from binlog position captured in step 4
}
```

**Reference:** [Debezium MySQL connector snapshots](https://debezium.io/documentation/reference/connectors/mysql.html)

### Anti-Patterns to Avoid

- **Anti-pattern 1: Using reader endpoint for CDC**
  - **Why it's bad:** Aurora read replicas don't have full binlog; binlog generated on writer only
  - **What to do instead:** Always connect Debezium to Aurora writer endpoint

- **Anti-pattern 2: Enabling Enhanced Binlog on clusters with backtrack**
  - **Why it's bad:** Enhanced Binlog is incompatible with backtrack feature; cannot enable if backtrack ever enabled (even if currently disabled)
  - **What to do instead:** Choose backtrack OR Enhanced Binlog before cluster creation; cannot change later

- **Anti-pattern 3: Depending on binlog after Aurora restore/clone**
  - **Why it's bad:** Enhanced Binlog files not included in backups; cloned cluster starts fresh binlog sequence from `.000001`
  - **What to do instead:** Use snapshot-based initial load; don't rely on binlog continuity across restore/clone operations

- **Anti-pattern 4: Using `snapshot.locking.mode=none` without schema change controls**
  - **Why it's bad:** Concurrent schema changes during snapshot cause data inconsistency
  - **What to do instead:** Use `minimal` mode, or ensure deployment freeze/schema change controls during snapshot window

- **Anti-pattern 5: Setting binlog retention via parameter group**
  - **Why it's bad:** Aurora doesn't support `binlog_expire_logs_seconds` parameter; retention managed via stored procedures
  - **What to do instead:** Use `CALL mysql.rds_set_configuration('binlog retention hours', N)`

## Don't Hand-Roll

Problems that look simple but have existing Aurora-specific solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Binlog retention management | Custom cron job to purge old binlogs | `mysql.rds_set_configuration` stored procedure | Aurora manages purging automatically; manual purge not supported |
| Monitoring binlog lag | Custom queries to calculate lag | CloudWatch metrics: `AuroraBinlogReplicaLag`, `ChangeLogBytesUsed` (Enhanced Binlog) | AWS-native, integrated with Aurora architecture |
| Snapshot consistency without locks | Custom application-level versioning | `snapshot.locking.mode=minimal` with REPEATABLE READ | Debezium handles MVCC snapshot automatically |
| Enhanced Binlog performance monitoring | Parse binlog files for write patterns | CloudWatch: `ChangeLogWriteIOPs`, `ChangeLogReadIOPs`, `VolumeWriteIOPs` | Aurora exposes storage-level metrics |
| Cross-region binlog replication (Aurora Global DB) | Manually sync binlog files | Don't use Enhanced Binlog for Global DB | Enhanced Binlog doesn't replicate to secondary regions; use standard binlog if cross-region binlog needed |

**Key insight:** Aurora is a managed service with fundamental architectural differences from community MySQL. Don't treat it as "MySQL in the cloud"—use Aurora's stored procedures, CloudWatch integration, and understand Enhanced Binlog's distributed storage model.

## Common Pitfalls

### Pitfall 1: Confusing Parameter Scopes (Cluster vs Instance)

**What goes wrong:** Attempting to set `binlog_format` on individual Aurora instance instead of DB cluster parameter group.

**Why it happens:** Community MySQL uses instance-level configuration; Aurora MySQL has cluster-wide parameters for replication settings.

**How to avoid:**
- `binlog_format`, `binlog_row_image`, `aurora_enhanced_binlog` → **DB Cluster Parameter Group** (cluster-wide)
- `max_connections`, `innodb_buffer_pool_size` → **DB Parameter Group** (instance-level)

**Warning signs:**
```bash
# ERROR: Trying to modify on instance parameter group
aws rds modify-db-parameter-group \
  --db-parameter-group-name aurora-instance-pg \
  --parameters "ParameterName=binlog_format,ParameterValue=ROW"
# Result: Parameter not found (binlog_format is cluster-level)

# CORRECT: Use cluster parameter group
aws rds modify-db-cluster-parameter-group \
  --db-cluster-parameter-group-name aurora-cluster-pg \
  --parameters "ParameterName=binlog_format,ParameterValue=ROW"
```

**Reference:** [Aurora parameter groups](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.html)

### Pitfall 2: Forgetting to Reboot Reader Instances (Aurora 2.10+)

**What goes wrong:** After modifying cluster parameter group and rebooting writer, reader instances still use old parameter values.

**Why it happens:** Aurora MySQL 2.10+ changed behavior—readers no longer automatically reboot when writer reboots.

**How to avoid:**
- Aurora 2.09 and lower: Reboot writer → readers auto-reboot
- Aurora 2.10 and higher: Reboot writer → **manually reboot all readers**

**Warning signs:**
```sql
-- On writer instance
SHOW VARIABLES LIKE 'binlog_format';
-- binlog_format | ROW

-- On reader instance (not rebooted)
SHOW VARIABLES LIKE 'binlog_format';
-- binlog_format | MIXED  (old value!)
```

**Reference:** [Configuring Aurora MySQL binary logging](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_LogAccess.MySQL.BinaryFormat.html)

### Pitfall 3: Enhanced Binlog Limitations Not Understood

**What goes wrong:** Enabling Enhanced Binlog on Aurora Global Database, then surprised when secondary region has no binlog files after cross-region failover.

**Why it happens:** Enhanced Binlog documentation mentions "not replicated to secondary regions" but implications not fully considered.

**How to avoid:**
- **Before enabling Enhanced Binlog, confirm:**
  - [ ] Backtrack feature NOT needed (incompatible)
  - [ ] Aurora Global Database NOT used, OR secondary regions don't need binlog
  - [ ] Point-in-time recovery via binlog NOT required (use Aurora automated backups instead)
  - [ ] Cluster never had backtrack enabled (even if disabled now, Enhanced Binlog still blocked)

**Warning signs:**
```sql
-- Attempting to enable Enhanced Binlog on cluster with backtrack history
SET GLOBAL aurora_enhanced_binlog = 1;
-- ERROR: Cannot enable enhanced binlog on clusters with backtrack enabled

-- After Aurora Global Database failover to secondary region
SHOW BINARY LOGS;
-- mysql-bin-changelog.000001  (fresh sequence, old binlog files not replicated)
```

**Reference:** [Enhanced binlog limitations](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Enhanced.binlog.html)

### Pitfall 4: Binlog Retention Exceeds Actual Retention

**What goes wrong:** Set `binlog retention hours = 168` (7 days), but Aurora deletes binlog files after 24-48 hours.

**Why it happens:** Aurora's binlog retention is tied to **backup retention**; if automated backups disabled or retention period shorter than binlog retention, binlog files purged sooner.

**How to avoid:**
- Automated backups enabled (Aurora has continuous backups by default)
- Backup retention period ≥ binlog retention period
- Monitor `SHOW BINARY LOGS` to verify actual retention

**Warning signs:**
```sql
CALL mysql.rds_show_configuration;
-- binlog retention hours | 168  (7 days configured)

SHOW BINARY LOGS;
-- mysql-bin-changelog.000045 | 2 days ago
-- mysql-bin-changelog.000046 | 1 day ago
-- mysql-bin-changelog.000047 | current
-- (Only 2 days of binlog, not 7!)
```

**Reference:** [Aurora binlog retention procedures](https://repost.aws/knowledge-center/aurora-mysql-increase-binlog-retention)

### Pitfall 5: Snapshot Mode Mismatch with Table Size

**What goes wrong:** Using `snapshot.locking.mode=minimal` on 500GB table causes hours-long table lock, blocking application writes.

**Why it happens:** Misunderstanding "minimal" mode—it still acquires table locks during schema read phase; on very large tables with many columns/indexes, schema read takes significant time.

**How to avoid:**

| Table Size | Recommended Locking Mode | Lock Duration |
|------------|-------------------------|---------------|
| < 10 GB | `minimal` | Seconds |
| 10-100 GB | `minimal` (monitor lock duration) | Seconds to minutes |
| > 100 GB | Consider `none` OR Aurora backup-based approach | No locks (none) or N/A (backup-based) |

**Alternative for large tables:**
1. Use Aurora backup snapshot for bulk load (no locks)
2. Start Debezium with `snapshot.mode=never` from known binlog position
3. Or use `snapshot.locking.mode=none` with schema change freeze window

**Warning signs:**
```sql
-- During snapshot with minimal mode on large table
SHOW PROCESSLIST;
-- | 123 | debezium | Locked | 1800 | Waiting for table metadata lock | LOCK TABLES inventory.large_table READ |
-- (30 minutes lock time!)
```

**Reference:** [Debezium snapshot locking modes](https://debezium.io/documentation/reference/connectors/mysql.html)

### Pitfall 6: Connecting to Reader Endpoint for CDC

**What goes wrong:** Debezium connector configured with Aurora reader endpoint; connector fails to read binlog position or binlog files incomplete.

**Why it happens:** Aurora read replicas use physical replication (storage-level), not binlog replication; binlog generated only on writer instance.

**How to avoid:**
- **Always use writer endpoint** for Debezium MySQL connector
- Reader endpoint only for read queries, not CDC

**Warning signs:**
```properties
# INCORRECT connector config
database.hostname=my-aurora-cluster.cluster-ro-abc123.us-east-1.rds.amazonaws.com  # Reader endpoint!

# CORRECT connector config
database.hostname=my-aurora-cluster.cluster-abc123.us-east-1.rds.amazonaws.com     # Writer (cluster) endpoint
```

```bash
# Connector log error
ERROR: Could not find binlog file 'mysql-bin-changelog.000005' on server
# Root cause: Connected to reader, which doesn't maintain binlog
```

**Reference:** [Aurora MySQL replication](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Replication.html)

## Code Examples

Verified patterns from official sources.

### Example 1: Aurora MySQL Parameter Group Configuration

```bash
# Source: AWS Aurora documentation
# Create custom DB cluster parameter group for Aurora MySQL 8.0

# 1. Create parameter group
aws rds create-db-cluster-parameter-group \
  --db-cluster-parameter-group-name debezium-aurora-mysql-80 \
  --db-parameter-group-family aurora-mysql8.0 \
  --description "Aurora MySQL 8.0 parameter group for Debezium CDC"

# 2. Set binlog_format to ROW (required for CDC)
# Note: MySQL 8.0.34+ defaults to ROW, but explicit setting recommended
aws rds modify-db-cluster-parameter-group \
  --db-cluster-parameter-group-name debezium-aurora-mysql-80 \
  --parameters "ParameterName=binlog_format,ParameterValue=ROW,ApplyMethod=pending-reboot"

# 3. Associate with Aurora cluster
aws rds modify-db-cluster \
  --db-cluster-identifier my-aurora-cluster \
  --db-cluster-parameter-group-name debezium-aurora-mysql-80 \
  --apply-immediately

# 4. Reboot writer instance
aws rds reboot-db-instance \
  --db-instance-identifier my-aurora-instance-1

# 5. For Aurora 2.10+, manually reboot all reader instances
aws rds reboot-db-instance \
  --db-instance-identifier my-aurora-instance-2-reader
```

**SQL configuration via stored procedures:**

```sql
-- Source: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html

-- Set binlog retention to 7 days (168 hours)
-- Maximum: 168 hours (Aurora < 2.11.0), 2160 hours (Aurora >= 2.11.0 and 3.x)
CALL mysql.rds_set_configuration('binlog retention hours', 168);

-- Verify configuration
CALL mysql.rds_show_configuration;
-- Output:
-- +------------------------+-------+----------------------------------------------------------------------+
-- | name                   | value | description                                                          |
-- +------------------------+-------+----------------------------------------------------------------------+
-- | binlog retention hours | 168   | binlog retention hours specifies the duration in hours before...     |
-- +------------------------+-------+----------------------------------------------------------------------+

-- Check binlog files
SHOW BINARY LOGS;
-- Output:
-- +---------------------------+-----------+
-- | Log_name                  | File_size |
-- +---------------------------+-----------+
-- | mysql-bin-changelog.000001| 177       |
-- | mysql-bin-changelog.000002| 154       |
-- | mysql-bin-changelog.000003| 201       |
-- +---------------------------+-----------+

-- Check current binlog position
SHOW MASTER STATUS;
-- Output:
-- +---------------------------+----------+--------------+------------------+-------------------+
-- | File                      | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
-- +---------------------------+----------+--------------+------------------+-------------------+
-- | mysql-bin-changelog.000003| 201      |              |                  |                   |
-- +---------------------------+----------+--------------+------------------+-------------------+
```

### Example 2: Enhanced Binlog Configuration

```sql
-- Source: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Enhanced.binlog.html

-- Prerequisites (verify before enabling):
-- 1. Aurora MySQL version 3.03.1 or higher
SELECT AURORA_VERSION();
-- Expected: 3.03.1 or higher

-- 2. Backtrack never enabled on this cluster (cannot undo)
SHOW VARIABLES LIKE 'aurora_lab_mode';
-- aurora_lab_mode should not show backtrack settings

-- Enable Enhanced Binlog via DB cluster parameter group:
-- aurora_enhanced_binlog = 1
-- binlog_format = ROW (or STATEMENT/MIXED, NOT OFF)
-- binlog_backup = 0
-- binlog_replication_globaldb = 0

-- After parameter group modified and instance rebooted:

-- Verify Enhanced Binlog is active
SHOW STATUS LIKE 'aurora_enhanced_binlog';
-- +------------------------+--------+
-- | Variable_name          | Value  |
-- +------------------------+--------+
-- | aurora_enhanced_binlog | ACTIVE |
-- +------------------------+--------+

-- Check max_binlog_size (auto-adjusted with Enhanced Binlog)
SHOW VARIABLES LIKE 'max_binlog_size';
-- +------------------+-----------+
-- | Variable_name    | Value     |
-- +------------------+-----------+
-- | max_binlog_size  | 268435456 |  -- 256 MB (was 128 MB)
-- +------------------+-----------+

-- Enhanced Binlog files use 'mysql-bin-changelog' naming
SHOW BINARY LOGS;
-- +---------------------------+-----------+
-- | Log_name                  | File_size |
-- +---------------------------+-----------+
-- | mysql-bin-changelog.000001| 177       |
-- | mysql-bin-changelog.000002| 201       |
-- +---------------------------+-----------+

-- Monitor Enhanced Binlog via CloudWatch (not SQL)
-- Metrics: ChangeLogBytesUsed, ChangeLogReadIOPs, ChangeLogWriteIOPs
```

**Disable Enhanced Binlog (if needed):**

```sql
-- Modify DB cluster parameter group:
-- aurora_enhanced_binlog = 0
-- binlog_backup = 1
-- binlog_replication_globaldb = 1

-- After reboot, verify
SHOW STATUS LIKE 'aurora_enhanced_binlog';
-- +------------------------+----------+
-- | Variable_name          | Value    |
-- +------------------------+----------+
-- | aurora_enhanced_binlog | INACTIVE |
-- +------------------------+----------+

-- Binlog files revert to standard naming
SHOW BINARY LOGS;
-- +------------------+-----------+
-- | Log_name         | File_size |
-- +------------------+-----------+
-- | mysql-bin.000001 | 154       |
-- +------------------+-----------+
```

### Example 3: Debezium Connector for Aurora MySQL (Small Tables)

```json
// Source: Debezium documentation + Context7
// Connector configuration for Aurora MySQL with small-medium tables

{
  "name": "aurora-mysql-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "tasks.max": "1",

    // Database connection (use WRITER endpoint)
    "database.hostname": "my-aurora-cluster.cluster-abc123.us-east-1.rds.amazonaws.com",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "${file:/secrets/mysql-password.txt:password}",
    "database.server.id": "184054",

    // Database/table filtering
    "database.include.list": "inventory",
    "table.include.list": "inventory.customers,inventory.orders",

    // Topic naming
    "topic.prefix": "aurora-mysql",

    // Snapshot configuration (Aurora-specific)
    // Aurora prohibits global read lock → table-level locks used
    "snapshot.mode": "initial",
    "snapshot.locking.mode": "minimal",

    // Binlog configuration
    "binlog.buffer.size": "8192",

    // GTID mode (recommended, per Phase 12 decision [12-03])
    "database.connectionTimeZone": "UTC",

    // Schema history (infinite retention, per Phase 13 decision [13-01])
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
    "schema.history.internal.kafka.topic": "schema-history.aurora-mysql",
    "schema.history.internal.store.only.captured.tables.ddl": "true",

    // Heartbeat (detect idle periods, prevent binlog position loss)
    "heartbeat.interval.ms": "30000",
    "heartbeat.topics.prefix": "__debezium-heartbeat",

    // Data type handling
    "decimal.handling.mode": "precise",
    "binary.handling.mode": "bytes",
    "time.precision.mode": "adaptive_time_microseconds",

    // Include schema changes in events
    "include.schema.changes": "true",

    // Signal table for incremental snapshots (optional)
    "signal.data.collection": "inventory.debezium_signal"
  }
}
```

### Example 4: Debezium Connector for Aurora MySQL (Large Tables, No Locks)

```json
// Source: Debezium documentation
// WARNING: Only use if schema changes can be prevented during snapshot

{
  "name": "aurora-mysql-large-tables-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "tasks.max": "1",

    "database.hostname": "my-aurora-cluster.cluster-abc123.us-east-1.rds.amazonaws.com",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "${file:/secrets/mysql-password.txt:password}",
    "database.server.id": "184055",

    "database.include.list": "analytics",
    "table.include.list": "analytics.user_events",  // Very large table (500GB)

    "topic.prefix": "aurora-mysql-analytics",

    // NO LOCKS snapshot mode (Aurora-specific for large tables)
    // CRITICAL: Ensure no schema changes during snapshot window
    "snapshot.mode": "initial",
    "snapshot.locking.mode": "none",

    // Longer snapshot query timeout for large tables
    "snapshot.query.timeout.ms": "600000",  // 10 minutes

    // Binlog configuration
    "binlog.buffer.size": "16384",  // Larger buffer for high throughput

    // Schema history
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
    "schema.history.internal.kafka.topic": "schema-history.aurora-mysql-analytics",

    // Heartbeat (critical for large tables with infrequent updates)
    "heartbeat.interval.ms": "10000",  // More frequent heartbeats

    // Signal table
    "signal.data.collection": "analytics.debezium_signal",

    // Data type handling
    "decimal.handling.mode": "precise",
    "time.precision.mode": "adaptive_time_microseconds"
  }
}
```

### Example 5: Aurora Backup-Based Initial Load (No Snapshot)

```bash
# Source: Community best practices
# Strategy: Bulk load from Aurora backup, then start CDC from binlog position

# 1. Capture binlog position BEFORE creating backup
mysql -h my-aurora-cluster.cluster-abc123.us-east-1.rds.amazonaws.com -u admin -p

mysql> SHOW MASTER STATUS;
# +---------------------------+----------+--------------+------------------+-------------------------------------------+
# | File                      | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set                         |
# +---------------------------+----------+--------------+------------------+-------------------------------------------+
# | mysql-bin-changelog.000005| 154      |              |                  | 3e11fa47-71ca-11e1-9e33-c80aa9429562:1-5  |
# +---------------------------+----------+--------------+------------------+-------------------------------------------+

# Save: File=mysql-bin-changelog.000005, Position=154, GTID=3e11fa47-71ca-11e1-9e33-c80aa9429562:1-5

# 2. Create Aurora backup snapshot
aws rds create-db-cluster-snapshot \
  --db-cluster-snapshot-identifier aurora-cdc-baseline-2026-02-01 \
  --db-cluster-identifier my-aurora-cluster

# 3. Wait for snapshot completion
aws rds wait db-cluster-snapshot-available \
  --db-cluster-snapshot-identifier aurora-cdc-baseline-2026-02-01

# 4. Restore snapshot to new cluster for bulk data extraction
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier aurora-restore-cdc \
  --snapshot-identifier aurora-cdc-baseline-2026-02-01 \
  --engine aurora-mysql

# 5. Bulk load data from restored cluster using JDBC source connector
# (or other bulk load mechanism)

# 6. Configure Debezium with NO snapshot, start from saved binlog position
```

**Debezium connector config (no snapshot):**

```json
{
  "name": "aurora-mysql-no-snapshot-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "tasks.max": "1",

    "database.hostname": "my-aurora-cluster.cluster-abc123.us-east-1.rds.amazonaws.com",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "${file:/secrets/mysql-password.txt:password}",
    "database.server.id": "184056",

    "database.include.list": "inventory",

    "topic.prefix": "aurora-mysql",

    // NO snapshot - assume data already loaded from backup
    "snapshot.mode": "never",

    // Schema history still required (rebuild from source if needed)
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
    "schema.history.internal.kafka.topic": "schema-history.aurora-mysql",

    // Optional: Skip unparseable DDL if schema history incomplete
    "database.history.skip.unparseable.ddl": "true",

    "heartbeat.interval.ms": "30000",
    "include.schema.changes": "true"

    // Connector will resume from last committed offset
    // If no offset exists, fails (as expected - manual intervention required)
  }
}
```

**Note:** When using `snapshot.mode=never`, must ensure:
1. Schema history topic populated (manually or from previous connector run)
2. Offset topic has valid binlog position (from saved position in step 1)
3. Binlog file still exists on Aurora (within retention period)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `binlog_format` parameter for MySQL | Deprecated in MySQL 8.0.34; defaults to ROW | MySQL 8.0.34 (2023) | Aurora MySQL 8.0.40 defaults to ROW; explicit setting still supported but optional |
| Community MySQL binlog (single storage) | Aurora Enhanced Binlog (separate storage nodes, parallel writes) | Aurora MySQL 3.03.1 (May 2023) | 99% faster recovery, 50% → 13% compute overhead; opt-in via parameter group |
| `snapshot.mode=schema_only` | `snapshot.mode=no_data` | Debezium 2.x | Renamed for clarity; functionally equivalent |
| `snapshot.mode=schema_only_recovery` | `snapshot.mode=recovery` | Debezium 2.x | Renamed for clarity; functionally equivalent |
| Aurora binlog retention max 168 hours (7 days) | Aurora 2.11.0+/3.x: max 2160 hours (90 days) | Aurora 2.11.0 (2021) | Longer retention window for CDC resilience |
| Manual binlog file purging | Aurora stored procedure: `mysql.rds_set_configuration` | Always (Aurora-specific) | Managed service; manual PURGE BINARY LOGS not supported |

**Deprecated/outdated:**

- **`snapshot.mode=schema_only`**: Renamed to `no_data` in Debezium 2.x (still works as alias, but use `no_data`)
- **`snapshot.mode=schema_only_recovery`**: Renamed to `recovery` in Debezium 2.x (still works as alias, but use `recovery`)
- **Setting binlog retention via `binlog_expire_logs_seconds`**: Not supported in Aurora; use `mysql.rds_set_configuration('binlog retention hours', N)` stored procedure
- **`FLUSH TABLES WITH READ LOCK` on Aurora**: Prohibited; Debezium automatically falls back to table-level locks
- **Backtrack with Enhanced Binlog**: Mutually exclusive; if cluster ever had backtrack enabled (even if disabled), Enhanced Binlog cannot be enabled

## Open Questions

Things that couldn't be fully resolved:

1. **Enhanced Binlog performance benchmarks for CDC workloads**
   - **What we know:** AWS claims 99% faster recovery, 40% throughput increase on highly concurrent writes, 50% → 13% compute overhead
   - **What's unclear:** Specific CDC performance impact (e.g., does Debezium connector read binlog faster from Enhanced Binlog storage nodes? Are there additional metrics to monitor?)
   - **Recommendation:** Present AWS's official claims in Lesson 08; note that Debezium connector interacts with binlog via standard MySQL protocol, so read performance likely unchanged; primary benefits are server-side (recovery, write throughput)

2. **Aurora Global Database CDC strategy with Enhanced Binlog**
   - **What we know:** Enhanced Binlog files not replicated to secondary regions; after failover, new primary starts fresh binlog sequence from `.000001`
   - **What's unclear:** Best practice for maintaining CDC continuity across cross-region failover (do you run dual Debezium connectors in both regions? How to handle sequence reset?)
   - **Recommendation:** Document limitation clearly in Lesson 08; defer Global Database CDC strategy to advanced topics (out of scope for Phase 14)

3. **`snapshot.locking.mode=none` schema change detection**
   - **What we know:** `none` mode skips all table locks but risks inconsistency if schema changes occur during snapshot
   - **What's unclear:** Can Debezium detect mid-snapshot schema changes and fail gracefully, or does it silently produce inconsistent data?
   - **Recommendation:** Test in lab (Phase 14 exercises); document as "WARNING: use only with schema change freeze controls"; prefer `minimal` mode unless zero-lock requirement proven

4. **Aurora backtrack and binlog interaction (non-Enhanced Binlog)**
   - **What we know:** Backtrack incompatible with Enhanced Binlog
   - **What's unclear:** With standard binlog, if you backtrack Aurora cluster to earlier point-in-time, what happens to binlog sequence? Does CDC break?
   - **Recommendation:** Document Enhanced Binlog + backtrack incompatibility clearly; note that backtrack is separate feature and using standard binlog with backtrack is possible (though binlog behavior during backtrack operation unclear and out of scope)

## Sources

### Primary (HIGH confidence)

- **AWS Official Documentation:**
  - [Setting up enhanced binlog for Aurora MySQL](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Enhanced.binlog.html) - Enhanced Binlog architecture, configuration, limitations
  - [Configuring Aurora MySQL binary logging for Single-AZ databases](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_LogAccess.MySQL.BinaryFormat.html) - Parameter groups, binlog_format, reboot requirements
  - [Setting and showing binary log configuration](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html) - mysql.rds_set_configuration stored procedure

- **Debezium Official Documentation:**
  - [Debezium connector for MySQL](https://debezium.io/documentation/reference/connectors/mysql.html) - Snapshot modes, locking modes, Aurora-specific behaviors

- **Context7:**
  - `/debezium/debezium` (v2.7.1.final) - MySQL connector configuration, snapshot modes, table locking strategies

### Secondary (MEDIUM confidence)

- **AWS Database Blog:**
  - [Introducing Amazon Aurora MySQL enhanced binary log (binlog)](https://aws.amazon.com/blogs/database/introducing-amazon-aurora-mysql-enhanced-binary-log-binlog/) - Enhanced Binlog announcement, 99% recovery claim, 40% throughput increase
  - [Binary logging optimizations in Amazon Aurora MySQL version 3](https://aws.amazon.com/blogs/database/binary-logging-optimizations-in-amazon-aurora-mysql-version-3/) - Binlog I/O cache (separate from Enhanced Binlog)
  - [Introducing binlog I/O cache in Amazon Aurora MySQL to improve binlog performance](https://aws.amazon.com/blogs/database/introducing-binlog-i-o-cache-in-amazon-aurora-mysql-to-improve-binlog-performance/) - Note: I/O cache disabled when Enhanced Binlog enabled

- **AWS Knowledge Center (re:Post):**
  - [Increase binlog retention in an Aurora MySQL cluster](https://repost.aws/knowledge-center/aurora-mysql-increase-binlog-retention) - Binlog retention procedures, max values by version
  - [Turn on binary logging for an Aurora MySQL cluster](https://repost.aws/knowledge-center/enable-binary-logging-aurora) - Parameter group setup workflow

- **Community Documentation:**
  - [Aurora MySQL CDC Setup Guide | OLake](https://olake.io/docs/connectors/mysql/setup/aurora/) - Aurora-specific CDC configuration patterns
  - [MySQL CDC with Debezium in Production | Materialize](https://materialize.com/guides/mysql-cdc/) - Best practices: heartbeat interval, binlog retention

### Tertiary (LOW confidence - for exploration only)

- **WebSearch findings:**
  - Debezium GitHub issues/PRs discussing `snapshot.locking.mode=none` (DBZ-602)
  - Community blog posts about Aurora CDC strategies
  - Marked for validation: Enhanced Binlog "99% faster recovery" claim (AWS blog, not independently verified)

## Metadata

**Confidence breakdown:**
- **Standard stack:** HIGH - Aurora MySQL 8.0.40, Debezium 2.5.x confirmed via AWS/Debezium docs and Context7
- **Architecture patterns:** HIGH - Parameter groups, Enhanced Binlog, snapshot modes verified via AWS official docs + Debezium docs
- **Pitfalls:** HIGH - All pitfalls derived from official documentation sections on limitations, requirements, and community patterns (OLake, Materialize guides)
- **Performance claims (Enhanced Binlog):** MEDIUM - AWS blog claims (99% recovery, 40% throughput) not independently benchmarked; accepted as authoritative but marked for awareness

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - Aurora/Debezium stable platforms, infrequent breaking changes)

**Phase 14 lesson structure recommendation:**
- **Lesson 07:** Aurora MySQL parameter groups and binlog retention (stored procedures vs. community MySQL)
- **Lesson 08:** Aurora Enhanced Binlog architecture, performance claims, and limitations
- **Lesson 09:** Snapshot mode selection for Aurora (table locks, large table strategies, backup-based approach)

**Alignment with prior decisions:**
- [v1.0] Debezium 2.5.x ✓
- [11-01] MySQL 8.0.40 ✓ (Aurora MySQL compatible with MySQL 8.0.40)
- [12-01] binlog-row-image=FULL ✓ (Aurora default when binlog_format=ROW)
- [12-01] 7-day binlog retention ✓ (Aurora supports 168 hours via stored procedure)
- [12-03] GTID mode ✓ (Aurora supports GTID)
- [13-01] Schema history infinite retention ✓
- [13-01] database.server.id range 184000-184999 ✓
- [13-02] Position tracking (MySQL vs PostgreSQL) ✓
