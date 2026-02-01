# Phase 16: Advanced Topics + Recovery - Research

**Researched:** 2026-02-01
**Domain:** Debezium MySQL CDC - Advanced Operations, Recovery, Multi-Connector Deployments
**Confidence:** HIGH

## Summary

This research covers advanced operational scenarios for Debezium MySQL CDC: recovery from binlog position loss and schema history corruption, multi-connector deployments with server.id management, and integration patterns for online DDL tools (gh-ost and pt-online-schema-change).

Recovery procedures are well-documented in official Debezium sources. The standard approach uses `snapshot.mode=when_needed` for automatic recovery from purged binlogs, and `snapshot.mode=recovery` (formerly `schema_only_recovery`) for schema history topic corruption. Multi-connector deployments require strict server.id registry management to prevent MySQL replication conflicts. Online DDL tools create helper tables that must be captured and optionally filtered using SMT (Single Message Transform).

Key findings indicate that prevention is cheaper than recovery: infinite retention on schema history topics, proper binlog retention configuration, and regular backups of both schema history and offset topics are critical. The research identifies specific configuration patterns, recovery workflows, and common mistakes that lead to data loss.

**Primary recommendation:** Implement defense-in-depth: configure infinite retention on schema history topics (`retention.ms=-1`, `retention.bytes=-1`), maintain server.id registry for multi-connector deployments (range 184000-184999 per project decisions), configure adequate binlog retention (minimum 7 days, ideally 14+), and establish backup procedures for schema history topics before they're needed.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Debezium MySQL Connector | 2.5.x | MySQL CDC connector | Official MySQL CDC solution with production-proven recovery capabilities |
| Kafka Connect | 3.x (with Debezium 2.5) | Connector runtime | Standard deployment model for Debezium |
| MySQL Server | 8.0.40 | Source database | Target version per project requirements |
| Kafka | 3.x | Event streaming platform | Stores offsets, schema history, and CDC events |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gh-ost | Latest stable | Online schema migration | Zero-downtime DDL on large tables (triggerless, binlog-based) |
| pt-online-schema-change | Latest from Percona Toolkit | Online schema migration | DDL with foreign key support (trigger-based) |
| kafka-console-consumer | Bundled with Kafka | Schema history backup | Manual backup/inspection of schema history topics |
| Debezium SMT (Filter) | Bundled with Debezium | Filter helper table events | Remove gh-ost/pt-osc helper table events from consumer streams |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| snapshot.mode=when_needed | Manual snapshot triggering | Automatic recovery vs manual intervention during binlog loss |
| File-based offset storage | Kafka topic offset storage | Simple testing vs production-grade durability |
| GTID mode | Binlog filename/position | Easier failover/multi-primary vs simpler setup for single-primary |

**Installation:**
```bash
# Debezium MySQL connector already in project
# gh-ost installation (if teaching DDL integration)
wget https://github.com/github/gh-ost/releases/download/v1.1.6/gh-ost-binary-linux-amd64-20230825144400.tar.gz
tar -xzf gh-ost-binary-linux-amd64-20230825144400.tar.gz

# pt-online-schema-change (Percona Toolkit)
wget https://downloads.percona.com/downloads/percona-toolkit/3.5.5/binary/tarball/percona-toolkit-3.5.5_x86_64.tar.gz
tar -xzf percona-toolkit-3.5.5_x86_64.tar.gz
```

## Architecture Patterns

### Recommended Project Structure
```
debezium-advanced/
├── recovery/
│   ├── binlog-purged/          # snapshot.mode=when_needed scenarios
│   ├── schema-history-corrupt/ # snapshot.mode=recovery scenarios
│   └── backups/                # Schema history topic backup scripts
├── multi-connector/
│   ├── server-id-registry.md   # Server ID allocation tracking
│   └── connectors/             # Multiple connector configs
└── ddl-integration/
    ├── gh-ost/                 # gh-ost patterns with CDC
    └── pt-osc/                 # pt-online-schema-change patterns
```

### Pattern 1: Automatic Recovery from Binlog Purge
**What:** Configure connector to automatically trigger snapshot when binlog position is lost
**When to use:** All production deployments to handle binlog retention expiration gracefully
**Example:**
```json
// Source: https://debezium.io/documentation/reference/2.5/connectors/mysql.html
{
  "name": "mysql-connector-auto-recovery",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.server.id": "184001",
    "database.server.name": "mysql_server",
    "snapshot.mode": "when_needed",
    "schema.history.internal.kafka.topic": "schema-history.mysql_server",
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092"
  }
}
```

### Pattern 2: Schema History Topic Recovery
**What:** Rebuild schema history from current database schema when topic is corrupted or lost
**When to use:** When schema history topic is accidentally deleted or corrupted
**Example:**
```json
// Source: https://debezium.io/documentation/reference/2.5/connectors/mysql.html
{
  "name": "mysql-connector-schema-recovery",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.server.id": "184002",
    "database.server.name": "mysql_server",
    "snapshot.mode": "recovery",
    "schema.history.internal.kafka.topic": "schema-history.mysql_server",
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092"
  }
}
```

**CRITICAL:** After recovery completes, update connector to `snapshot.mode: when_needed` or `initial` for normal operation.

### Pattern 3: Multi-Connector Server ID Registry
**What:** Maintain centralized registry of server.id allocations to prevent conflicts
**When to use:** When deploying multiple Debezium connectors to same MySQL cluster
**Example:**
```markdown
# server-id-registry.md

## Server ID Allocation Registry
Range: 184000-184999 (Debezium connectors only, avoids MySQL cluster conflicts)

| Connector Name | Server ID | Database | Status | Owner |
|----------------|-----------|----------|--------|-------|
| orders-cdc     | 184001    | ecommerce | Active | Team A |
| users-cdc      | 184002    | ecommerce | Active | Team A |
| inventory-cdc  | 184003    | warehouse | Active | Team B |
| analytics-cdc  | 184004    | analytics | Testing | Team C |

## Allocation Rules
- Increment sequentially from 184000
- Document before deployment
- Never reuse IDs from decommissioned connectors within 30 days
- MySQL cluster uses 1-183999 for actual replicas
```

### Pattern 4: Capturing Online DDL Helper Tables
**What:** Configure connector to capture gh-ost/pt-osc helper tables, then filter events with SMT
**When to use:** When using online schema change tools that create temporary helper tables
**Example:**
```json
// Source: https://debezium.io/documentation/reference/2.5/connectors/mysql.html
{
  "name": "mysql-connector-with-ddl-tools",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.server.id": "184005",
    "database.server.name": "mysql_server",
    "table.include.list": "mydb.*",
    "snapshot.mode": "when_needed",
    "schema.history.internal.kafka.topic": "schema-history.mysql_server",
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
    "transforms": "FilterHelperTables",
    "transforms.FilterHelperTables.type": "io.debezium.transforms.Filter",
    "transforms.FilterHelperTables.language": "jsr223.groovy",
    "transforms.FilterHelperTables.condition": "!value.source.table.matches('.*_(gho|ghc|new|old)$')"
  }
}
```

**Helper table naming patterns:**
- gh-ost: `_tablename_gho` (ghost table), `_tablename_ghc` (changelog table)
- pt-online-schema-change: `_tablename_new`, `_tablename_old`

### Pattern 5: Schema History Topic Backup
**What:** Regular backup of schema history topic to enable fast recovery vs full resnapshot
**When to use:** Production deployments where resnapshot would take hours/days
**Example:**
```bash
# Source: Community best practice, https://debezium.io/blog/2018/03/16/note-on-database-history-topic-configuration/

# Backup schema history topic to file
kafka-console-consumer \
  --bootstrap-server kafka:9092 \
  --topic schema-history.mysql_server \
  --from-beginning \
  --timeout-ms 30000 \
  > schema-history-backup-$(date +%Y%m%d-%H%M%S).json

# Restore schema history topic from backup
kafka-console-producer \
  --bootstrap-server kafka:9092 \
  --topic schema-history.mysql_server \
  < schema-history-backup-20260201-143000.json
```

**Backup frequency:** Daily for active databases, before major schema changes, before connector upgrades.

### Anti-Patterns to Avoid
- **Partitioning schema history topic:** Schema history requires global ordering. Multiple partitions break chronological DDL sequence.
- **Ignoring helper tables during DDL:** Connector crashes if gh-ost/pt-osc tables aren't included in `table.include.list`.
- **Reusing server.id values immediately:** MySQL replication may reject reconnection if previous session not fully terminated.
- **Using snapshot.mode=recovery for normal operation:** Recovery mode is for one-time fixes only, not continuous operation.
- **Short binlog retention with large tables:** If snapshot takes longer than binlog retention, connector can't recover from restart.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Detecting binlog position loss | Custom offset validation | `snapshot.mode=when_needed` | Debezium automatically detects unavailable positions and triggers snapshot |
| Rebuilding schema history | Manual DDL replay scripts | `snapshot.mode=recovery` | Debezium reads current schema from database and rebuilds history topic |
| Filtering helper table events | Custom consumer logic | Debezium Filter SMT with regex | Built-in transformation with performance optimizations |
| Server ID conflict tracking | Spreadsheet registry | Database-backed registry with validation | Prevent race conditions, enforce uniqueness constraints |
| Schema history backup | Custom Kafka consumer | kafka-console-consumer with scheduling | Standard tool, well-tested, handles edge cases |
| Incremental re-snapshot | Drop connector and restart | Debezium incremental snapshot via signaling | No offset loss, concurrent with streaming, resumable |

**Key insight:** Recovery scenarios have edge cases (partial corruption, race conditions during reconnection, schema evolution during downtime) that Debezium handles internally. Custom solutions miss these cases and create silent data loss risks.

## Common Pitfalls

### Pitfall 1: Schema History Topic Deleted by Kafka Retention
**What goes wrong:** Kafka's default 7-day retention deletes schema history topic content, connector fails on restart with "db history topic or its content is fully or partially missing"
**Why it happens:** Debezium auto-creates topic with `retention.ms=-1` but NOT `retention.bytes=-1`. If broker has `log.retention.bytes` set globally, topic gets purged.
**How to avoid:**
```bash
# After connector creates topic, explicitly set both retention properties
kafka-configs.sh --bootstrap-server kafka:9092 \
  --entity-type topics \
  --entity-name schema-history.mysql_server \
  --alter \
  --add-config retention.ms=-1,retention.bytes=-1
```
**Warning signs:**
- Topic exists but has fewer messages than expected
- Connector starts successfully first time, fails after restarts
- Error message mentions "partially missing" (not fully missing)

### Pitfall 2: Binlog Purged During Long-Running Snapshot
**What goes wrong:** Snapshot takes 6 hours on large table, binlog retention is 7 days, connector restarts, snapshot takes 6 hours again, binlog position from 12 hours ago is purged, connector enters infinite snapshot loop.
**Why it happens:** Snapshot doesn't advance binlog position until completion. If snapshot duration > binlog retention, position is always stale on restart.
**How to avoid:**
```sql
-- Before snapshot, increase binlog retention temporarily
SET GLOBAL binlog_expire_logs_seconds = 1209600; -- 14 days

-- After snapshot completes, return to normal
SET GLOBAL binlog_expire_logs_seconds = 604800; -- 7 days
```
Or use incremental snapshot which advances position per chunk.
**Warning signs:**
- Snapshot restarts from beginning after connector failure
- Binlog position in offsets topic older than oldest available binlog
- Error: "Connector requires binlog file 'mysql-bin.001134', but MySQL only has mysql-bin.001255"

### Pitfall 3: Multiple Connectors with Same server.id
**What goes wrong:** Deploy second connector with duplicate server.id, MySQL rejects connection: "A slave with the same server_uuid/server_id as this slave has connected to the master"
**Why it happens:** MySQL maintains active replication sessions by server.id. Duplicate IDs conflict even if one connector is stopped (session timeout delays).
**How to avoid:**
- Maintain server.id registry (Pattern 3)
- Never reuse server.id within 30 days of connector decommission
- Use range allocation: team A gets 184000-184099, team B gets 184100-184199, etc.
**Warning signs:**
- Connector fails on startup with slave error
- MySQL `SHOW SLAVE HOSTS` shows unexpected entries
- Previous connector's session still active in MySQL processlist

### Pitfall 4: No Schema Changes Since Last Offset (recovery mode assumption)
**What goes wrong:** Use `snapshot.mode=recovery` to rebuild schema history, but schema actually changed since last offset, connector processes events with wrong schema, data corruption in consumers.
**Why it happens:** Recovery mode reads *current* database schema, assumes it matches schema at last offset position. If DDL occurred between last offset and now, mismatch occurs.
**How to avoid:**
- Only use recovery mode if you're certain no DDL happened
- Prefer full resnapshot (`snapshot.mode=initial` with new connector name) if uncertain
- Check binary logs for DDL statements between last offset and current position:
```sql
-- Find DDL in binlogs since specific position
SHOW BINLOG EVENTS IN 'mysql-bin.001234' FROM 4567890 LIMIT 1000;
-- Look for CREATE, ALTER, DROP statements
```
**Warning signs:**
- Consumer schema validation errors after recovery
- Deserialization errors in consumers
- Field mismatch errors (expected field not found)

### Pitfall 5: Filtering Helper Tables in table.include.list
**What goes wrong:** Add `table.include.list=mydb.orders,mydb.users` to optimize capture, run gh-ost on orders table, connector crashes: "Table _orders_gho not found in schema history"
**Why it happens:** Online DDL tools create temporary tables not in include list. Connector sees binlog events for these tables but can't process them.
**How to avoid:**
- Use broad include patterns: `table.include.list=mydb.*` when using DDL tools
- OR dynamically add helper tables before migration:
```json
// Before gh-ost migration
"table.include.list": "mydb.orders,mydb.users,mydb._.*_gho,mydb._.*_ghc"
```
- Filter events with SMT (Pattern 4) instead of excluding tables
**Warning signs:**
- Connector stops during online schema migration
- Error mentions tables with _gho, _ghc, _new, _old suffixes
- Schema history topic shows table creation events for helper tables

### Pitfall 6: Shared Schema History Topic Across Connectors
**What goes wrong:** Two connectors share same `schema.history.internal.kafka.topic`, connector A processes DDL from connector B's database, schema mismatch, data corruption.
**Why it happens:** Cost-saving attempt or misconfiguration. Schema history topic is connector-specific, not database-specific.
**How to avoid:**
- Every connector gets unique schema history topic
- Naming convention: `schema-history.{database.server.name}` ensures uniqueness
- Never modify schema.history.internal.kafka.topic to reuse existing topic
**Warning signs:**
- Connector processes tables it shouldn't know about
- Schema history contains DDL for multiple database.server.name values
- Unexpected schema evolution in downstream consumers

## Code Examples

Verified patterns from official sources:

### Binlog Retention Check and Configuration
```sql
-- Source: https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html

-- Check current binlog retention (MySQL 8.0+)
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
-- Default: 2592000 (30 days)

-- Set retention to 14 days (recommended minimum for Debezium)
SET GLOBAL binlog_expire_logs_seconds = 1209600;

-- Make persistent (add to my.cnf)
-- binlog_expire_logs_seconds = 1209600

-- Check available binlogs
SHOW BINARY LOGS;

-- Find oldest binlog file and position
SELECT * FROM performance_schema.replication_connection_status\G
```

### Schema History Topic Configuration Verification
```bash
# Source: https://debezium.io/blog/2018/03/16/note-on-database-history-topic-configuration/

# Describe topic configuration
kafka-topics.sh --bootstrap-server kafka:9092 \
  --describe \
  --topic schema-history.mysql_server

# Expected output should show:
# - Partitions: 1
# - Replication Factor: 3 (or cluster minimum)
# - Configs: retention.ms=-1, retention.bytes=-1, cleanup.policy=delete

# Fix missing retention.bytes configuration
kafka-configs.sh --bootstrap-server kafka:9092 \
  --entity-type topics \
  --entity-name schema-history.mysql_server \
  --alter \
  --add-config retention.bytes=-1

# Verify configuration applied
kafka-configs.sh --bootstrap-server kafka:9092 \
  --entity-type topics \
  --entity-name schema-history.mysql_server \
  --describe
```

### Recovery Workflow: Binlog Purged Scenario
```bash
# Source: https://debezium.io/documentation/reference/2.5/connectors/mysql.html

# Step 1: Connector fails with binlog position unavailable
# Error: "Connector requires binlog file 'mysql-bin.001134', but MySQL only has mysql-bin.001255"

# Step 2: Update connector to use when_needed mode
curl -X PUT http://localhost:8083/connectors/mysql-connector/config \
  -H "Content-Type: application/json" \
  -d '{
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.server.id": "184001",
    "database.server.name": "mysql_server",
    "snapshot.mode": "when_needed",
    "schema.history.internal.kafka.topic": "schema-history.mysql_server",
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092"
  }'

# Step 3: Restart connector - automatic snapshot triggered
curl -X POST http://localhost:8083/connectors/mysql-connector/restart

# Step 4: Monitor snapshot progress
curl -X GET http://localhost:8083/connectors/mysql-connector/status | jq

# Step 5: After snapshot completes, connector resumes streaming automatically
```

### Recovery Workflow: Schema History Topic Corrupted
```bash
# Source: https://debezium.io/documentation/reference/2.5/connectors/mysql.html

# Step 1: Connector fails with schema history error
# Error: "The db history topic or its content is fully or partially missing"

# Step 2: Verify no schema changes since last offset
# Check offset topic for last position
kafka-console-consumer \
  --bootstrap-server kafka:9092 \
  --topic connect-offsets \
  --from-beginning \
  --property print.key=true \
  | grep mysql-connector

# Last offset shows: binlog file mysql-bin.001255, position 4567890

# Step 3: Check MySQL for DDL since that position
mysql -u root -p -e "SHOW BINLOG EVENTS IN 'mysql-bin.001255' FROM 4567890 LIMIT 1000" \
  | grep -E "CREATE|ALTER|DROP"

# Step 4: If no DDL found, safe to use recovery mode
curl -X PUT http://localhost:8083/connectors/mysql-connector/config \
  -H "Content-Type: application/json" \
  -d '{
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.server.id": "184001",
    "database.server.name": "mysql_server",
    "snapshot.mode": "recovery",
    "schema.history.internal.kafka.topic": "schema-history.mysql_server",
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092"
  }'

# Step 5: Restart connector to rebuild schema history
curl -X POST http://localhost:8083/connectors/mysql-connector/restart

# Step 6: After recovery completes, change back to when_needed
curl -X PUT http://localhost:8083/connectors/mysql-connector/config \
  -H "Content-Type: application/json" \
  -d '{
    "snapshot.mode": "when_needed"
  }'
```

### gh-ost Integration Pattern
```bash
# Source: https://github.com/github/gh-ost

# Step 1: Ensure connector captures all tables (including helper tables)
# Connector config includes: "table.include.list": "mydb.*"

# Step 2: Run gh-ost migration
gh-ost \
  --host=mysql \
  --user=gh-ost \
  --password=ghp \
  --database=mydb \
  --table=orders \
  --alter="ADD COLUMN status VARCHAR(20)" \
  --assume-rbr \
  --allow-on-master \
  --exact-rowcount \
  --concurrent-rowcount \
  --default-retries=120 \
  --execute

# gh-ost creates:
# - _orders_gho (ghost table - receives migrated data)
# - _orders_ghc (changelog table - tracks migration state)

# Step 3: Debezium captures events from original table + helper tables
# Events flow to Kafka topics:
# - mysql_server.mydb.orders (original table)
# - mysql_server.mydb._orders_gho (helper table)
# - mysql_server.mydb._orders_ghc (helper table)

# Step 4: Consumers with Filter SMT only see original table events
# Helper table events filtered out by regex transform

# Step 5: After gh-ost completes, helper tables dropped automatically
# Debezium processes DROP events, schema history updated
```

### pt-online-schema-change Integration Pattern
```bash
# Source: Percona Toolkit documentation + https://debezium.io/documentation/reference/2.5/connectors/mysql.html

# Step 1: Run pt-online-schema-change
pt-online-schema-change \
  --alter="ADD COLUMN priority INT" \
  --execute \
  h=mysql,u=pt-osc,p=ptp,D=mydb,t=orders

# pt-osc creates:
# - _orders_new (new table with altered schema)
# - Triggers on orders table to copy changes to _orders_new

# Step 2: Debezium captures:
# - INSERT/UPDATE/DELETE on orders (original table)
# - INSERT/UPDATE/DELETE on _orders_new (triggered by pt-osc)

# Step 3: After pt-osc completes:
# - Renames orders to _orders_old
# - Renames _orders_new to orders
# - Drops _orders_old

# Step 4: Debezium handles rename/drop in schema history
# Consumers see continuous stream with schema evolution
```

### Multi-Connector Deployment Check
```bash
# Source: https://debezium.io/documentation/faq/

# Check MySQL for active replication connections
mysql -u root -p -e "SHOW SLAVE HOSTS"

# Expected output shows all Debezium connectors:
# +-------------+------+------+-----------+
# | Server_id   | Host | Port | Master_id |
# +-------------+------+------+-----------+
# |      184001 |      | 3306 |         1 |
# |      184002 |      | 3306 |         1 |
# |      184003 |      | 3306 |         1 |
# +-------------+------+------+-----------+

# Verify no duplicate server_ids
mysql -u root -p -e "SELECT Server_id, COUNT(*) FROM performance_schema.replication_connection_configuration GROUP BY Server_id HAVING COUNT(*) > 1"

# Should return empty result (no duplicates)
```

### GTID Mode Configuration (Optional Advanced Topic)
```json
// Source: https://debezium.io/documentation/reference/2.5/connectors/mysql.html

// MySQL must have GTID enabled:
// gtid_mode = ON
// enforce_gtid_consistency = ON

{
  "name": "mysql-connector-gtid",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.server.id": "184001",
    "database.server.name": "mysql_server",
    "snapshot.mode": "when_needed",
    "schema.history.internal.kafka.topic": "schema-history.mysql_server",
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
    "gtid.source.includes": "mysql-server-uuid",
    "gtid.source.excludes": ""
  }
}

// Advantages:
// - Automatic failover to new primary (connector finds position by GTID)
// - Multi-primary topology support
// - Simpler offset management (GTID vs filename:position)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual snapshot triggering on binlog loss | `snapshot.mode=when_needed` | Debezium 0.7+ | Automatic recovery, no manual intervention |
| `schema_only_recovery` mode | `snapshot.mode=recovery` | Debezium 2.6 (2024) | Consistent naming, `schema_only_recovery` deprecated in 3.3 |
| Schema history backup ignored | Regular backups recommended | 2018 (blog post) | Minutes recovery vs hours resnapshot |
| Filename:position tracking | GTID mode preferred | Always supported, increasingly adopted 2020+ | Easier failover in HA setups |
| Full resnapshot for new tables | Incremental snapshot via signaling | Debezium 1.6+ (2021) | Add tables without stopping streams |
| retention.ms only | retention.ms AND retention.bytes | 2018 fix (0.7.5) | Prevents broker-level retention.bytes purging |

**Deprecated/outdated:**
- `snapshot.mode=schema_only_recovery`: Use `recovery` instead (removed in Debezium 3.3)
- `expire_logs_days`: Use `binlog_expire_logs_seconds` in MySQL 8.0+ (more precise control)
- Shared schema history topics: Never recommended, explicitly warned against in FAQ

## Open Questions

Things that couldn't be fully resolved:

1. **Incremental snapshot triggering mechanism**
   - What we know: Uses signaling table or Kafka topic to send signals
   - What's unclear: Exact SQL syntax for signaling table in MySQL connector for course examples
   - Recommendation: Include both approaches (signaling table + Kafka topic signal) with simple examples, flag that signaling is advanced topic for optional deep-dive

2. **Schema history topic size growth patterns**
   - What we know: Infinite retention required, topic stores all DDL
   - What's unclear: Typical growth rate for production databases, when it becomes operational concern
   - Recommendation: Mention monitoring topic size, provide example (1 year DDL ≈ thousands of events, typically <100MB), note compaction not supported

3. **Recovery mode validation**
   - What we know: Recovery mode assumes no schema changes since last offset
   - What's unclear: Does Debezium validate this assumption or silently proceed?
   - Recommendation: Emphasize manual validation step (checking binlogs for DDL), treat recovery mode as "use at own risk" requiring operator verification

4. **gh-ost vs pt-osc tradeoffs for CDC**
   - What we know: Both create helper tables, gh-ost is triggerless (binlog-based), pt-osc uses triggers
   - What's unclear: Performance impact on Debezium (does gh-ost double event volume since it reads same binlog?)
   - Recommendation: Document that gh-ost generates events from both original table and ghost table during migration (event duplication), pt-osc only original table, filter both with SMT

## Sources

### Primary (HIGH confidence)
- https://debezium.io/documentation/reference/2.5/connectors/mysql.html - MySQL connector configuration, snapshot modes, recovery procedures
- https://debezium.io/blog/2018/03/16/note-on-database-history-topic-configuration/ - Schema history topic retention configuration
- https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html - MySQL binlog retention configuration
- https://github.com/github/gh-ost - gh-ost official documentation
- https://debezium.io/documentation/reference/2.5/transformations/filtering.html - SMT filtering documentation
- https://debezium.io/documentation/reference/2.5/configuration/signalling.html - Incremental snapshot signaling

### Secondary (MEDIUM confidence)
- [Debezium unable to start if binlog is purged](https://groups.google.com/g/debezium/c/di3jWxMzq9c) - Community recovery patterns
- [when_needed starts & continues snapshot with purged binlogs](https://groups.google.com/g/debezium/c/hivJFzxwTLY) - Known issue discussion
- [The db history topic or its content is fully or partially missing](https://groups.google.com/g/debezium/c/IO55ZeAEM14) - Recovery procedure discussion
- [Are there problems when running multiple debezium connectors on one server?](https://groups.google.com/g/debezium/c/Xx_w1mZvuT8) - Multi-connector patterns
- [gh-ost vs pt-online-schema-change in 2025](https://www.bytebase.com/blog/gh-ost-vs-pt-online-schema-change/) - Tool comparison
- [How We Migrated from MySQL Binlogs to GTID in a Live CDC Kafka Setup](https://observabilityguy.medium.com/how-we-migrated-from-mysql-binlogs-to-gtid-in-a-live-cdc-kafka-setup-e0ac366d9467) - GTID migration experience
- [Advanced CDC Configurations in Debezium for Multi-Tenant and Multi-Region Data Handling](https://binaryscripts.com/debezium/2025/04/29/advanced-cdc-configurations-in-debezium-handling-multi-tenant-and-multi-region-data.html) - Multi-tenant patterns
- [MySQL CDC with Debezium in Production](https://materialize.com/guides/mysql-cdc/) - Production deployment guide
- [Handling Database Failures and Recoveries with Debezium](https://binaryscripts.com/debezium/2025/04/27/handling-database-failures-and-recoveries-with-debezium-ensuring-reliable-cdc.html) - Recovery best practices

### Tertiary (LOW confidence)
- WebSearch results for incremental snapshot use cases - flagged for validation with official docs
- Community forum discussions on server.id conflicts - patterns validated against official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools officially documented, versions verified
- Architecture: HIGH - Patterns from official Debezium documentation and verified community sources
- Pitfalls: HIGH - Documented in official sources (schema history retention) and verified community reports (server.id conflicts)
- Recovery procedures: HIGH - Official Debezium documentation with specific configuration examples
- DDL tool integration: MEDIUM - Official Debezium docs confirm pattern, tool-specific details from gh-ost/pt-osc repos
- GTID benefits: MEDIUM - Official support documented, benefits confirmed by multiple community sources

**Research date:** 2026-02-01
**Valid until:** 2026-03-15 (45 days - stable domain, Debezium 2.5.x is mature, unlikely breaking changes)
