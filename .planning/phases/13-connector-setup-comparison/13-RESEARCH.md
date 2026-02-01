# Phase 13: Connector Setup + Comparison - Research

**Researched:** 2026-02-01
**Domain:** Debezium MySQL CDC connector configuration and architectural comparison with PostgreSQL
**Confidence:** HIGH

## Summary

Phase 13 focuses on MySQL connector deployment via Kafka Connect REST API and architectural comparison between MySQL binlog and PostgreSQL WAL approaches. The research reveals that MySQL connector configuration is simpler in some ways (binlog is already logical) but requires critical MySQL-specific properties that have no PostgreSQL equivalents, particularly `schema.history.internal.kafka.topic` for DDL tracking and `database.server.id` for cluster integration.

The standard approach follows the same REST API pattern as PostgreSQL connector deployment (POST to :8083/connectors) but with MySQL-specific configuration properties. The architecture comparison highlights fundamental differences: MySQL uses binlog position tracking (file:offset or GTID) vs PostgreSQL LSN, and MySQL requires schema history topic for DDL recovery while PostgreSQL uses replication slots.

**Primary recommendation:** Deploy MySQL connector using GTID mode (already configured in Phase 12) with mandatory schema history topic configuration, emphasizing architectural differences in lesson content to leverage learner's PostgreSQL knowledge from Module 2.

## Standard Stack

The established libraries/tools for MySQL CDC connector deployment:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Debezium MySQL Connector | 2.5.x | MySQL CDC capture | Bundled in quay.io/debezium/connect:2.5 image |
| Kafka Connect REST API | 7.8.1 | Connector deployment | Built into Confluent/Debezium Connect clusters |
| MySQL Server | 8.0.40 | Source database | Already deployed in Phase 12 with binlog enabled |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| curl / httpie | any | REST API client | Manual connector deployment (lab exercises) |
| jq | any | JSON parsing | Verifying connector status responses |
| kafka-console-consumer | 7.8.1 | Event verification | Testing CDC event flow |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| REST API deployment | Confluent Control Center UI | REST API is portable, UI requires enterprise license |
| Debezium 2.5.x | Debezium 3.x | 3.x has breaking changes, 2.5.x is stable for Java 21 ARM64 |

**Installation:**
Already deployed in Phase 12 - MySQL and Debezium Connect services running in labs/docker-compose.yml.

## Architecture Patterns

### Recommended Lesson Structure
```
src/content/course/08-module-8/
├── 01-binlog-architecture.mdx          # Already exists (Phase 12)
├── 02-gtid-mode-fundamentals.mdx       # Already exists (Phase 12)
├── 03-binlog-retention-heartbeat.mdx   # Already exists (Phase 12)
├── 04-mysql-connector-configuration.mdx # NEW - Phase 13
├── 05-binlog-wal-comparison.mdx        # NEW - Phase 13
└── 06-schema-history-recovery.mdx      # NEW - Phase 13
```

### Pattern 1: MySQL Connector Deployment (REST API)
**What:** Deploy MySQL CDC connector via Kafka Connect REST API with MySQL-specific configuration
**When to use:** Initial connector setup for MySQL databases with binlog enabled
**Example:**
```bash
# Source: Debezium official documentation
curl -X POST http://localhost:8083/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "mysql-inventory-connector",
    "config": {
      "connector.class": "io.debezium.connector.mysql.MySqlConnector",
      "database.hostname": "mysql",
      "database.port": "3306",
      "database.user": "debezium",
      "database.password": "dbz",
      "database.server.id": "184054",
      "database.server.name": "mysql-server",
      "table.include.list": "inventory.customers,inventory.orders",
      "schema.history.internal.kafka.topic": "schema-changes.mysql-server",
      "schema.history.internal.kafka.bootstrap.servers": "kafka:9092"
    }
  }'
```

### Pattern 2: Schema History Topic Configuration
**What:** Configure dedicated Kafka topic for MySQL DDL statement tracking
**When to use:** ALWAYS for MySQL connectors (mandatory, no PostgreSQL equivalent)
**Example:**
```bash
# Source: Debezium blog post on database history
# Create schema history topic with infinite retention
kafka-topics --bootstrap-server kafka:9092 \
  --create \
  --topic schema-changes.mysql-server \
  --partitions 1 \
  --replication-factor 1 \
  --config retention.ms=-1 \
  --config retention.bytes=-1

# Verify configuration
kafka-topics --bootstrap-server kafka:9092 \
  --describe \
  --topic schema-changes.mysql-server
```

### Pattern 3: Position Tracking - GTID vs File:Offset
**What:** MySQL supports two position tracking modes - GTID (recommended) and file:offset (legacy)
**When to use:** GTID for production/failover scenarios, file:offset only for single-server dev environments
**Example:**
```sql
-- Source: Phase 12 GTID lesson
-- Verify GTID mode enabled
SHOW VARIABLES LIKE 'gtid_mode';

-- Check current position (GTID)
SHOW GLOBAL VARIABLES LIKE 'gtid_executed';

-- Check purged GTIDs (critical for recovery)
SHOW GLOBAL VARIABLES LIKE 'gtid_purged';

-- Alternative: File position (legacy)
SHOW MASTER STATUS;
```

### Pattern 4: Connector Configuration - PostgreSQL vs MySQL Comparison
**What:** Side-by-side configuration showing architectural differences
**When to use:** Teaching material to highlight MySQL-specific properties
**Example:**
```json
// PostgreSQL Connector (from Module 2)
{
  "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
  "plugin.name": "pgoutput",                    // Logical decoding plugin
  "slot.name": "debezium_customers",            // Replication slot (PG-specific)
  "publication.name": "dbz_publication"         // Publication (PG-specific)
}

// MySQL Connector (Phase 13)
{
  "connector.class": "io.debezium.connector.mysql.MySqlConnector",
  "database.server.id": "184054",               // Cluster member ID (MySQL-specific)
  "schema.history.internal.kafka.topic": "...", // DDL tracking (MySQL-specific)
  "schema.history.internal.kafka.bootstrap.servers": "kafka:9092"
}

// Common properties (both connectors)
{
  "database.hostname": "...",
  "database.port": "...",
  "database.user": "...",
  "database.password": "...",
  "table.include.list": "...",
  "topic.prefix": "..."
}
```

### Anti-Patterns to Avoid
- **Changing topic.prefix after deployment:** Breaks offset tracking and creates new topics
- **Omitting schema.history.internal.kafka.topic:** Connector will fail on restart
- **Using default retention for schema history topic:** Will be purged after 7 days (Confluent default)
- **Deploying without database.server.id:** Connector cannot join MySQL cluster
- **Partitioning schema history topic:** Must be single partition for consistent DDL ordering

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Binlog position tracking | Custom offset storage | Kafka Connect offset storage | Handles GTID and file:offset, atomic commits, fault tolerance |
| DDL change detection | Parse binlog events manually | schema.history.internal.kafka.topic | Debezium rebuilds schemas on restart, handles TABLE_MAP events |
| Connector deployment automation | Shell scripts with hardcoded JSON | Kafka Connect REST API + version control | Declarative, idempotent, supports updates |
| Failover handling | Manual position recalculation | GTID mode + Debezium automatic failover | GTID is globally unique across MySQL cluster |
| Heartbeat events for idle tables | Custom UPDATE queries | heartbeat.interval.ms + heartbeat.topics.prefix | Prevents binlog purge, no schema pollution |

**Key insight:** MySQL CDC requires coordination between binlog position, schema evolution, and Kafka offsets. Debezium's schema history topic solves complex recovery scenarios that custom solutions would need months to handle correctly.

## Common Pitfalls

### Pitfall 1: Schema History Topic Not Configured with Infinite Retention
**What goes wrong:** Connector deploys successfully, works for 7 days, then fails on restart with "database history topic is missing or incomplete"
**Why it happens:** Confluent Kafka defaults to 7-day retention (log.retention.ms=604800000). Schema history topic gets purged, connector cannot rebuild table schemas.
**How to avoid:** Explicitly create schema history topic with retention.ms=-1 and retention.bytes=-1 BEFORE deploying connector
**Warning signs:**
- Connector runs fine initially but fails after 1 week uptime
- Error message: "The db history topic or its content is fully or partially missing"
- Schema history topic size grows then suddenly drops to zero

### Pitfall 2: Using database.server.id from Existing MySQL Server
**What goes wrong:** Connector connects, but MySQL replication breaks or binlog reading fails with "server ID already in use"
**Why it happens:** database.server.id must be unique across entire MySQL cluster (all primaries, replicas, AND Debezium connectors). Reusing an ID causes conflict.
**How to avoid:** Choose unique server ID (e.g., 184054 for Debezium, different from MySQL server-id=1)
**Warning signs:**
- MySQL logs show: "Slave has the same server UUID as this server"
- Binlog position doesn't advance
- Connector status shows RUNNING but no events published

### Pitfall 3: Forgetting Binlog vs WAL Architectural Difference
**What goes wrong:** Learners expect replication slots (PostgreSQL pattern) and get confused when MySQL connector config has no slot.name property
**Why it happens:** PostgreSQL uses server-side replication slots for position tracking. MySQL uses client-side position tracking (GTID or file:offset stored in Kafka Connect offsets).
**How to avoid:** Explicitly teach the architectural difference - PostgreSQL is "server remembers position", MySQL is "client remembers position"
**Warning signs:**
- Questions like "Where is the MySQL replication slot?"
- Confusion about why connector restart doesn't need slot cleanup
- Misunderstanding of gtid_purged impact

### Pitfall 4: Not Monitoring gtid_purged vs Connector Offset
**What goes wrong:** Connector offline for extended period. MySQL purges old binlog files. Connector restart fails: "Cannot replicate because master purged required binary logs"
**Why it happens:** binlog_expire_logs_seconds (7 days in Phase 12 config) deletes old binlog files. If connector's saved GTID is in purged range, recovery impossible without full snapshot.
**How to avoid:**
- Monitor gap between gtid_executed (current) and gtid_purged (deleted)
- Configure heartbeat.interval.ms to advance connector position even on idle tables
- Alert when connector lag > 50% of binlog retention period
**Warning signs:**
- gtid_purged advancing while connector is paused
- Connector lag metrics showing hours/days behind
- Binlog file count decreasing while connector offline

### Pitfall 5: Schema Changes Without Understanding History Topic Role
**What goes wrong:** DBA runs ALTER TABLE, Debezium events suddenly have incorrect schema, consumers fail
**Why it happens:** Schema history topic records DDL statements with binlog position. If topic is corrupted/incomplete, Debezium cannot reconstruct schema at specific binlog position.
**How to avoid:** Understand schema history topic contains ENTIRE DDL history from first snapshot. Never delete or compact this topic.
**Warning signs:**
- Events have columns that don't exist in current table schema
- Debezium emits events with old column names after ALTER TABLE
- Connector restart shows different schema than expected

### Pitfall 6: Using STATEMENT or MIXED Binlog Format
**What goes wrong:** Connector deploys but events contain incorrect data or connector fails with "ROW binlog format required"
**Why it happens:** STATEMENT format records SQL text (e.g., "UPDATE products SET price = price * 1.1"), not actual row values. Non-deterministic functions (NOW(), RAND()) produce different values.
**How to avoid:** Verify binlog_format=ROW in MySQL configuration BEFORE deploying connector (already configured in Phase 12)
**Warning signs:**
- Connector error: "binlog_format is not ROW"
- CDC events missing before/after values
- Inconsistent data between MySQL and Kafka topics

## Code Examples

Verified patterns from official sources:

### Complete MySQL Connector Configuration
```json
// Source: https://debezium.io/documentation/reference/stable/connectors/mysql.html
{
  "name": "mysql-inventory-connector",
  "config": {
    // Connector class (required)
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",

    // Database connection (required)
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "dbz",

    // Cluster integration (required, MySQL-specific)
    "database.server.id": "184054",
    "database.server.name": "mysql-server",

    // Table filtering (required)
    "table.include.list": "inventory.customers,inventory.orders",

    // Schema history (required, MySQL-specific)
    "schema.history.internal.kafka.topic": "schema-changes.mysql-server",
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",

    // Snapshot configuration (optional)
    "snapshot.mode": "initial",

    // Heartbeat for idle table protection (recommended)
    "heartbeat.interval.ms": "10000",
    "heartbeat.topics.prefix": "__debezium-heartbeat"
  }
}
```

### Verifying MySQL Connector Deployment
```bash
# Source: Module 1 PostgreSQL connector lesson pattern
# 1. Deploy connector
curl -X POST http://localhost:8083/connectors \
  -H "Content-Type: application/json" \
  -d @mysql-connector-config.json

# 2. Check connector status
curl -s http://localhost:8083/connectors/mysql-inventory-connector/status | jq .

# Expected output:
# {
#   "name": "mysql-inventory-connector",
#   "connector": {
#     "state": "RUNNING",
#     "worker_id": "connect:8083"
#   },
#   "tasks": [
#     {
#       "id": 0,
#       "state": "RUNNING",
#       "worker_id": "connect:8083"
#     }
#   ]
# }

# 3. Verify topics created
docker compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list | grep mysql-server

# Expected topics:
# mysql-server.inventory.customers
# mysql-server.inventory.orders
# schema-changes.mysql-server
```

### Comparing Position Tracking - MySQL vs PostgreSQL
```bash
# Source: Phase 12 GTID lesson + Module 2 PostgreSQL lessons
# PostgreSQL - LSN tracking (server-side)
docker compose exec postgres psql -U postgres -c "
SELECT slot_name, active, restart_lsn, confirmed_flush_lsn
FROM pg_replication_slots;
"

# Output shows server-side position:
# slot_name          | active | restart_lsn | confirmed_flush_lsn
# debezium_customers | t      | 0/1A2B3C4   | 0/1A2B3C8

# MySQL - GTID tracking (client-side, stored in Kafka Connect offsets)
# Check MySQL's current position
docker compose exec mysql mysql -u root -pmysql -e "
SHOW GLOBAL VARIABLES LIKE 'gtid_executed';
"

# Output shows server's executed GTIDs:
# gtid_executed | 3E11FA47-71CA-11E1-9E33-C80AA9429562:1-150

# Debezium stores its position in Kafka Connect offset topic
# (not in MySQL server)
```

### Monitoring Binlog Health
```sql
-- Source: Debezium MySQL connector documentation
-- Check binlog configuration
SHOW VARIABLES LIKE 'binlog_format';
-- Expected: ROW

SHOW VARIABLES LIKE 'gtid_mode';
-- Expected: ON

SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
-- Expected: 604800 (7 days from Phase 12)

-- Monitor binlog file accumulation
SHOW BINARY LOGS;
-- Lists all binlog files with sizes

-- Critical: Monitor purged GTIDs
SHOW GLOBAL VARIABLES LIKE 'gtid_purged';
-- If this approaches connector's offset, alert!

-- Check heartbeat topic (after connector deployed)
-- Prevents binlog purge for idle tables
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| File:offset position tracking | GTID position tracking | MySQL 5.6 (2013) | Enables automatic failover, simplified replica management |
| database.history.* prefix | schema.history.internal.* prefix | Debezium 2.0 (2022) | Breaking config change, better naming clarity |
| Blocking snapshots | Incremental snapshots | Debezium 1.6 (2021) | Non-blocking reads, resumable snapshots |
| Read-write incremental snapshots | Read-only incremental snapshots (GTID-based) | Debezium 1.9 (2022) | Works with AWS RDS/Aurora (no SUPER privileges) |
| Global read lock for snapshots | Table-level locks | Automatic for RDS/Aurora | Required for managed MySQL (no LOCK TABLES FOR BACKUP) |

**Deprecated/outdated:**
- `database.history.internal.kafka.topic`: Use `schema.history.internal.kafka.topic` (Debezium 2.0+)
- `database.serverTimezone`: Use `database.connectionTimeZone` (Debezium 1.9+)
- `snapshot.mode=never`: Use `snapshot.mode=no_data` for schema-only capture
- Separate `table.whitelist`: Use `table.include.list` for consistency with PostgreSQL connector

## Open Questions

Things that couldn't be fully resolved:

1. **AWS Aurora MySQL specific behavior with schema history topic**
   - What we know: Aurora MySQL has different binlog purging behavior than vanilla MySQL
   - What's unclear: Exact impact on schema history topic retention in Aurora environments
   - Recommendation: Document as note in lesson "Aurora MySQL considerations TBD in Module 9 (cloud-native)"

2. **Performance impact of heartbeat.interval.ms on high-volume databases**
   - What we know: 10-second interval is common recommendation
   - What's unclear: Optimal interval for different database sizes/transaction rates
   - Recommendation: Start with 10000ms (10 seconds), let learners experiment in production ops module

3. **Schema evolution compatibility between Debezium 2.5.x and 3.x**
   - What we know: Debezium 3.x has breaking changes, but schema history format compatibility uncertain
   - What's unclear: Can schema history topic created by 2.5.x be read by 3.x connector?
   - Recommendation: Note "migration path to Debezium 3.x out of scope for this course"

## Sources

### Primary (HIGH confidence)
- [Debezium MySQL Connector Official Documentation](https://debezium.io/documentation/reference/stable/connectors/mysql.html) - Connector configuration reference
- [Debezium Blog: Database History Topic Configuration](https://debezium.io/blog/2018/03/16/note-on-database-history-topic-configuration/) - Retention settings and recovery
- [Confluent: Debezium MySQL Source Connector Configuration](https://docs.confluent.io/kafka-connectors/debezium-mysql-source/current/mysql_source_connector_config.html) - Complete property reference
- Phase 12 deliverables: binlog architecture, GTID mode, retention/heartbeat lessons (HIGH confidence - created in previous phase)
- Module 1 PostgreSQL connector lesson (HIGH confidence - verified existing content)

### Secondary (MEDIUM confidence)
- [MySQL CDC with Debezium in Production](https://materialize.com/guides/mysql-cdc/) - Production best practices
- [Medium: Understanding CDC in MySQL and PostgreSQL](https://medium.com/data-science/understanding-change-data-capture-cdc-in-mysql-and-postgresql-binlog-vs-wal-logical-decoding-ac76adb0861f) - Binlog vs WAL comparison
- [Debezium GitHub: MySQL Connector Grafana Dashboard](https://github.com/debezium/debezium-examples/blob/main/monitoring/debezium-grafana/debezium-mysql-connector-dashboard.json) - JMX metrics reference
- [Sylhare's Blog: Troubleshoot Debezium MySQL Connector](https://sylhare.github.io/2023/11/07/Debezium-configuration.html) - Common errors and solutions

### Tertiary (LOW confidence)
- WebSearch results on binlog monitoring metrics - general patterns confirmed but specifics need verification in hands-on lab

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Debezium 2.5.x documentation, verified in docker-compose.yml
- Architecture: HIGH - Official docs + Phase 12 lessons provide complete binlog/GTID foundation
- Pitfalls: HIGH - Multiple authoritative sources (Debezium blog, production guides) confirm common mistakes
- Code examples: HIGH - All examples verified against official Debezium documentation

**Research date:** 2026-02-01
**Valid until:** 2026-03-15 (30 days for stable technology - Debezium 2.5.x is mature)

**Key finding:** MySQL connector configuration is fundamentally different from PostgreSQL due to architectural differences (binlog vs WAL, client-side vs server-side position tracking). The schema.history.internal.kafka.topic is the most critical MySQL-specific property with no PostgreSQL equivalent. Lessons should emphasize comparison to leverage Module 2 PostgreSQL knowledge.
