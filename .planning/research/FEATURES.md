# Feature Landscape: MySQL/Aurora MySQL CDC Module

**Domain:** Debezium Change Data Capture - MySQL/Aurora MySQL
**Researched:** 2026-02-01
**Context:** Subsequent milestone adding MySQL content to existing PostgreSQL-focused Debezium course
**Target Audience:** Middle+ data engineers
**Depth:** Production-focused, deeper than PostgreSQL module

## Table Stakes

Features users expect. Missing = course feels incomplete for MySQL CDC coverage.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **MySQL Binlog Architecture** | Core foundation - different from PostgreSQL WAL | Medium | Row-based, statement-based, mixed formats; binlog event types (WRITE_ROWS, UPDATE_ROWS, DELETE_ROWS); binlog rotation and purging |
| **GTID (Global Transaction Identifiers)** | Essential for production HA/failover | Medium | GTID vs position-based tracking; GTID benefits for multi-server topologies; migration from position to GTID |
| **Binlog Format Configuration** | Critical for CDC reliability | Low | ROW format requirement; deprecated statement/mixed formats; binlog_row_image=FULL rationale |
| **Initial Snapshot Modes** | Starting point for CDC pipeline | Medium | initial, always, when_needed, no_data, schema_only, recovery; blocking vs non-blocking |
| **Binlog Retention Management** | Production reliability requirement | Medium | expire_logs_days vs binlog_expire_logs_seconds; AWS RDS/Aurora specific retention (24h-90d); binlog purged error recovery |
| **Schema History Topic** | Debezium MySQL-specific requirement | Low | Internal Kafka topic for DDL tracking; rebuild on restart; recovery scenarios |
| **Connector Offset Management** | Resume capability after failures | Medium | Kafka Connect offset storage; position vs GTID tracking; offset reset scenarios |
| **DDL Schema Evolution** | Real-world production requirement | High | Automatic schema change detection; online DDL handling; ALTER TABLE during streaming; schema history topic role |
| **Data Type Handling** | Correctness for diverse schemas | Medium | TINYINT(1) to Boolean; JSON type handling; BLOB/TEXT types; spatial data types; timezone handling for TIMESTAMP vs DATETIME |
| **Table/Database Filtering** | Performance and scope control | Low | Include/exclude patterns; replica-side vs source-side filtering; performance implications |

## Differentiators

Features that make this course stand out. Not expected everywhere, but highly valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Incremental Snapshots** | Game-changer for large tables | High | Read-only incremental snapshots; chunk-based parallelization; concurrent with streaming; ad-hoc snapshot signaling via signal table or Kafka topic |
| **Aurora MySQL Enhanced Binlog** | AWS-specific performance optimization | Medium | Separate storage architecture; 50%→13% overhead reduction; 99% faster recovery; incompatible with Backtrack |
| **Multi-Master/Group Replication** | Advanced HA topologies | High | MySQL Group Replication concepts; multi-source replication; CDC with active-active setups |
| **GTID Failover Deep Dive** | Production HA mastery | High | Automatic failover with GTID; errant transactions; Aurora cluster endpoint routing; DNS/VIP strategies |
| **Binlog Lag Monitoring** | Production observability | Medium | AuroraBinlogReplicaLag metric; SHOW REPLICA STATUS; binlog I/O cache metrics; lag-based alerting |
| **Parallel Snapshot Chunking** | Large table performance | High | Primary key-based chunking; surrogate key support for keyless tables; chunk size tuning; Flink CDC vs Debezium approaches |
| **Signal Table Operations** | Advanced operational control | Medium | execute-snapshot signals; incremental vs blocking snapshots; ad-hoc table-specific snapshots during streaming |
| **MySQL vs PostgreSQL CDC Comparison** | Architectural understanding | Medium | Binlog vs WAL+logical decoding; GTID vs replication slots; HA failover differences; storage architecture differences |
| **Heartbeat Events** | Binlog retention protection | Low | Preventing binlog purge during idle periods; 30s default interval; configuration tuning |
| **Advanced Recovery Scenarios** | Production resilience patterns | High | Binlog purged recovery; schema history topic reconstruction; schema_only_recovery mode; offset corruption handling |

## MySQL vs PostgreSQL Differences

Key content to emphasize - what's architecturally different from PostgreSQL module.

| Area | PostgreSQL | MySQL | Why It Matters |
|------|-----------|-------|----------------|
| **Change Log Mechanism** | WAL (Write-Ahead Log) + Logical Decoding | Binlog (Binary Log) | MySQL binlog is purpose-built for replication; PostgreSQL WAL serves recovery first, replication second |
| **Position Tracking** | Replication Slots (LSN) | GTID or binlog position | PostgreSQL slots are durable primary-local objects; MySQL GTID is globally consistent across cluster |
| **Format Options** | Physical vs Logical replication | Row vs Statement vs Mixed | MySQL deprecated statement/mixed in 8.0.34; PostgreSQL only supports row-level logical decoding for CDC |
| **Snapshot Blocking** | Can use exported snapshots | Requires table locks or read-only incremental | PostgreSQL's MVCC makes snapshot easier; MySQL requires careful lock management |
| **Schema History** | Uses output plugin (pgoutput) | Requires separate Kafka topic | MySQL connector must track DDL separately; PostgreSQL embeds schema in WAL |
| **Failover Complexity** | Slot replication required | GTID auto-handles | PostgreSQL slots don't auto-replicate; MySQL GTID inherently multi-node aware |
| **Cloud Variations** | Aurora PostgreSQL (mostly compatible) | Aurora MySQL (enhanced binlog, different storage) | Aurora MySQL has fundamentally different binlog architecture; Aurora PostgreSQL is closer to standard |
| **Retention Model** | Replication slot prevents WAL cleanup | Time-based binlog expiration | PostgreSQL can fill disk if slot not consumed; MySQL purges by time regardless |
| **Read Replica CDC** | Can read from replica with logical slot | Not supported (binlog on primary only) | PostgreSQL allows offloading CDC reads; MySQL CDC must connect to primary (or Aurora cluster endpoint) |

## Anti-Features

Features to explicitly NOT include. Common mistakes or out-of-scope topics.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Deep Maxwell's Daemon coverage** | Different tool ecosystem; Debezium is focus | Brief mention as alternative, link to Maxwell docs, focus on Debezium |
| **Statement-based binlog format** | Deprecated in MySQL 8.0.34, unreliable for CDC | Explicitly call out as anti-pattern; always use ROW format |
| **Binlog filtering on source** | Not recommended by MySQL docs; limits recovery options | Use Debezium table.include.list and replica-side filtering |
| **Backtrack + Enhanced Binlog** | Mutually exclusive Aurora features | Explain incompatibility; choose based on use case (operational undo vs CDC) |
| **Trigger-based CDC** | Performance overhead, complexity | Mention as legacy approach; emphasize binlog-based superiority |
| **Query-based CDC (timestamp polling)** | Misses deletes, high latency, query overhead | Contrast with binlog benefits: true CDC, all operations, minimal overhead |
| **Mixed binlog format** | Deprecated, inconsistent CDC behavior | ROW format only for reliable CDC |
| **Global read locks for snapshot** | Blocks writes in production | Use incremental snapshots or minimal table locks |
| **Ignoring binlog retention** | Causes unrecoverable connector failures | Proactive monitoring, heartbeat events, adequate retention periods |
| **Single-region Aurora only** | Misses Global Database CDC complexity | Cover Aurora Global Database binlog implications if time permits |

## Feature Dependencies

```
MySQL Binlog Architecture (Lesson 1)
  ├─→ Binlog Format Configuration (Lesson 1)
  ├─→ Binlog Event Types (Lesson 1)
  └─→ Binlog Retention Management (Lesson 3)
       └─→ Heartbeat Events (Lesson 3)

GTID Fundamentals (Lesson 2)
  ├─→ GTID Failover Deep Dive (Lesson 4)
  └─→ Multi-Master/Group Replication (Lesson 4 - optional)

Connector Configuration (Lesson 2)
  ├─→ Schema History Topic (Lesson 2)
  ├─→ Offset Management (Lesson 2)
  └─→ Table/Database Filtering (Lesson 2)

Initial Snapshot Modes (Lesson 2)
  └─→ Incremental Snapshots (Lesson 5)
       ├─→ Signal Table Operations (Lesson 5)
       └─→ Parallel Snapshot Chunking (Lesson 5)

DDL Schema Evolution (Lesson 3)
  ├─→ Schema History Topic (from Lesson 2)
  └─→ Data Type Handling (Lesson 3)

Aurora MySQL Specifics (Lesson 6)
  ├─→ Enhanced Binlog Architecture (Lesson 6)
  ├─→ Aurora Cluster Failover (Lesson 6)
  └─→ Aurora Parameter Groups (Lesson 6)

Production Operations (Lesson 7)
  ├─→ Binlog Lag Monitoring (Lesson 7)
  ├─→ Advanced Recovery Scenarios (Lesson 7)
  └─→ Binlog Purged Error Recovery (Lesson 7)

PostgreSQL Comparison (Throughout)
  └─→ Architectural context in each lesson
```

## Depth Guidance (Exceeding PostgreSQL Module)

To deliver "even more depth" than PostgreSQL module, emphasize:

### 1. **Binlog Internals** (Deeper than WAL coverage)
- Binlog file structure and rotation mechanics
- Event type byte-level structure
- mysqlbinlog utility deep dive
- Binlog position vs GTID implementation details

### 2. **Production Failure Scenarios** (More scenarios than PostgreSQL)
- Binlog purged during connector downtime
- Schema history topic loss and reconstruction
- GTID errant transactions in multi-master
- Aurora writer instance failover mid-snapshot
- Offset corruption and manual recovery

### 3. **Performance Optimization** (More tuning than PostgreSQL)
- Chunk size optimization for incremental snapshots
- Parallel snapshot reader configuration
- Binlog I/O cache tuning (Aurora)
- Network bandwidth optimization for large binlogs
- Table lock minimization strategies

### 4. **Aurora MySQL Deep Dive** (More cloud depth)
- Enhanced binlog architecture internals
- Aurora storage-separated binlog nodes
- Global Database binlog propagation
- Multi-region CDC considerations
- RDS vs Aurora binlog differences

### 5. **Operational Runbooks** (More runbooks than PostgreSQL)
- Step-by-step binlog purged recovery
- GTID gap handling procedures
- Schema history topic rebuild from scratch
- Connector offset manual reset procedures
- Zero-downtime connector upgrades

## Course Flow Recommendation

For comprehensive MySQL CDC coverage matching 7-lesson PostgreSQL depth:

**Lesson 1: MySQL Binlog Fundamentals**
- Table stakes: Binlog architecture, formats, event types
- Differentiator: Deep dive into binlog file structure
- PostgreSQL contrast: Binlog vs WAL architectural differences

**Lesson 2: Debezium MySQL Connector Setup**
- Table stakes: Configuration, schema history topic, offset management
- Table stakes: Initial snapshot modes
- Table stakes: Table/database filtering

**Lesson 3: Schema Evolution & Data Types**
- Table stakes: DDL handling, data type mapping
- Table stakes: Binlog retention management
- Differentiator: Heartbeat events for retention protection

**Lesson 4: GTID & High Availability**
- Table stakes: GTID fundamentals
- Differentiator: GTID failover deep dive
- Optional differentiator: Group Replication CDC

**Lesson 5: Advanced Snapshots**
- Differentiator: Incremental snapshots (deep dive)
- Differentiator: Signal table operations
- Differentiator: Parallel chunking strategies

**Lesson 6: Aurora MySQL Specifics**
- Differentiator: Enhanced binlog architecture
- Differentiator: Aurora cluster failover with CDC
- Table stakes: Parameter group configuration

**Lesson 7: Production Operations**
- Differentiator: Binlog lag monitoring
- Differentiator: Advanced recovery scenarios
- Table stakes: Troubleshooting binlog purged errors

## Confidence Assessment

| Topic | Confidence | Source Basis |
|-------|-----------|--------------|
| MySQL Binlog Fundamentals | HIGH | Official MySQL docs (dev.mysql.com), Debezium official docs |
| GTID Architecture | HIGH | Official MySQL docs, AWS official docs, multiple verified sources |
| Debezium MySQL Connector | HIGH | Official Debezium documentation, Confluent official docs |
| Incremental Snapshots | HIGH | Debezium blog posts, official documentation, Apache Flink CDC docs |
| Aurora Enhanced Binlog | HIGH | AWS official blogs and documentation (2023-2026) |
| Schema Evolution | MEDIUM | Multiple sources agree but some edge cases need validation |
| Data Type Handling | MEDIUM | Official MySQL docs for types; CDC-specific handling needs more verification |
| Multi-Master/Group Replication CDC | MEDIUM | MySQL docs for Group Replication; CDC-specific patterns less documented |

## Sources

### Official Documentation (HIGH Confidence)
- [Debezium MySQL Connector](https://debezium.io/documentation/reference/stable/connectors/mysql.html)
- [MySQL Binary Log Documentation](https://dev.mysql.com/doc/refman/8.0/en/binary-log.html)
- [MySQL Replication Formats](https://dev.mysql.com/doc/refman/8.0/en/replication-formats.html)
- [Aurora MySQL Binary Logging](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_LogAccess.MySQL.BinaryFormat.html)
- [Debezium Signaling](https://debezium.io/documentation/reference/stable/configuration/signalling.html)

### Technical Guides & Blogs (MEDIUM-HIGH Confidence)
- [Incremental Snapshots in Debezium](https://debezium.io/blog/2021/10/07/incremental-snapshots/)
- [Read-only Incremental Snapshots for MySQL](https://debezium.io/blog/2022/04/07/read-only-incremental-snapshots/)
- [Binary Logging Optimizations in Aurora MySQL](https://aws.amazon.com/blogs/database/binary-logging-optimizations-in-amazon-aurora-mysql-version-3/)
- [Enhanced Binlog for Aurora MySQL](https://aws.amazon.com/blogs/database/introducing-amazon-aurora-mysql-enhanced-binary-log-binlog/)
- [MySQL CDC Complete Guide](https://datacater.io/blog/2021-08-25/mysql-cdc-complete-guide.html)
- [Understanding CDC: BinLog vs WAL](https://medium.com/data-science/understanding-change-data-capture-cdc-in-mysql-and-postgresql-binlog-vs-wal-logical-decoding-ac76adb0861f)

### Community & Production Guides (MEDIUM Confidence)
- [MySQL CDC with Debezium in Production](https://materialize.com/guides/mysql-cdc/)
- [Replicating MySQL: Binlog and GTIDs](https://airbyte.com/blog/replicating-mysql-a-look-at-the-binlog-and-gtids)
- [Aurora MySQL CDC Setup Guide](https://olake.io/docs/connectors/mysql/setup/aurora/)
- [Apache Flink CDC MySQL Connector](https://nightlies.apache.org/flink/flink-cdc-docs-master/docs/connectors/flink-sources/mysql-cdc/)
- [How We Migrated from Binlogs to GTID](https://observabilityguy.medium.com/how-we-migrated-from-mysql-binlogs-to-gtid-in-a-live-cdc-kafka-setup-e0ac366d9467)

### Configuration References (HIGH Confidence)
- [Confluent Debezium MySQL Connector Config](https://docs.confluent.io/kafka-connectors/debezium-mysql-source/current/mysql_source_connector_config.html)
- [Aurora MySQL Replication](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Replication.html)
- [MySQL Replication Options](https://dev.mysql.com/doc/mysql-replication-excerpt/8.0/en/replication-options-binary-log.html)

### Troubleshooting & Operations (MEDIUM Confidence)
- [Optimizing Binary Log Replication for Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/binlog-optimization.html)
- [Monitoring Multithreaded Replication](https://aws.amazon.com/blogs/database/monitoring-multithreaded-replication-in-amazon-rds-for-mysql-amazon-rds-for-mariadb-and-aurora-mysql/)
- [MySQL Replication and GTID-Based Failover](https://severalnines.com/blog/mysql-replication-and-gtid-based-failover-deep-dive-errant-transactions/)
- [Aurora Backtrack vs Binlog](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Managing.Backtrack.html)
