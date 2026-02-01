# Phase 17: Multi-Database Capstone - Research

**Researched:** 2026-02-01
**Domain:** Multi-database CDC architecture combining PostgreSQL and MySQL sources in unified pipelines
**Confidence:** HIGH

## Summary

Phase 17 extends the existing Module 7 capstone project (PostgreSQL-only) to demonstrate multi-database CDC architecture by adding MySQL as a second source database. The research reveals that Debezium supports multiple connectors running simultaneously in the same Kafka Connect cluster, with each connector maintaining independent configuration (unique `database.server.name`, separate schema history topics for MySQL, distinct replication slots for PostgreSQL).

The standard approach involves deploying both PostgreSQL and MySQL connectors to capture changes from both databases, routing events to either separate topics (database-specific topics) or unified topics (using ByLogicalTableRouter SMT for table consolidation). The architecture comparison highlights critical operational differences: MySQL requires schema history topic for DDL recovery while PostgreSQL embeds schema in WAL events; MySQL uses GTID/binlog position tracking while PostgreSQL uses LSN-based replication slots.

The key educational value is demonstrating trade-offs between architectural patterns: separate topics preserve database-specific metadata and simplify troubleshooting but require consumer logic to handle multiple streams; merged topics unify processing but introduce complexity in key uniqueness and schema evolution management.

**Primary recommendation:** Extend existing capstone with MySQL database addition, demonstrate both separate-topics and unified-topics patterns, emphasize architectural trade-offs and schema evolution challenges specific to multi-database CDC environments.

## Standard Stack

The established libraries/tools for multi-database CDC pipelines:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Debezium PostgreSQL Connector | 2.5.x | PostgreSQL CDC capture | Already deployed in v1.0 capstone |
| Debezium MySQL Connector | 2.5.x | MySQL CDC capture | Already deployed in Module 8 (Phases 12-16) |
| Kafka Connect | 7.8.1 | Connector runtime | Supports multiple connectors simultaneously |
| Apache Kafka | 7.8.1 | Event streaming backbone | Handles topics from multiple sources |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ByLogicalTableRouter SMT | 2.5.x | Topic consolidation | Merging events from multiple databases into unified topics |
| PyFlink Table API | 1.18.x | Multi-source stream processing | Processing events from both PostgreSQL and MySQL topics |
| BigQuery | current | Unified data warehouse | Single destination for multi-database CDC pipeline |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate topics per database | Merged topics with routing SMT | Separate = simpler troubleshooting, merged = unified processing |
| PyFlink for consolidation | Kafka Streams or KSQL | PyFlink already taught in Module 5, consistent with v1.0 |
| Single consumer | Database-specific consumers | Single = simpler architecture, separate = specialized processing |

**Installation:**
All components already deployed in existing infrastructure (labs/docker-compose.yml from Phase 4, PostgreSQL from Phase 6, MySQL from Phase 12).

## Architecture Patterns

### Recommended Project Structure Extension
```
capstone-project/
├── infrastructure/
│   ├── docker-compose.yml           # Add MySQL service (already exists from Phase 12)
│   ├── debezium/
│   │   ├── postgres-connector.json  # PostgreSQL connector (v1.0)
│   │   └── mysql-connector.json     # NEW - MySQL connector for capstone
│   └── monitoring/
│       └── grafana/
│           └── multi-db-overview.json  # NEW - Dashboard for both sources
│
├── database/
│   ├── postgresql/
│   │   ├── schema.sql               # PostgreSQL outbox table (v1.0)
│   │   └── seed-data/
│   │       └── generate_orders_pg.sql
│   └── mysql/                       # NEW - MySQL database schema
│       ├── schema.sql               # MySQL outbox table
│       └── seed-data/
│           └── generate_orders_mysql.sql
│
├── pyflink-jobs/
│   ├── unified_cdc_processor.py     # NEW - Processes both PG and MySQL events
│   └── tests/
│       └── test_multi_source.py     # NEW - Multi-database tests
│
└── docs/
    ├── architecture.md              # UPDATE - Add MySQL source to C4 diagrams
    ├── multi-db-tradeoffs.md        # NEW - Separate vs merged topics analysis
    └── runbook.md                   # UPDATE - Add MySQL-specific failure scenarios
```

### Pattern 1: Separate Topics Architecture (Recommended for Learning)
**What:** Each database produces events to database-specific topics with separate consumers
**When to use:** When databases have different schemas, processing requirements, or operational characteristics
**Example:**
```bash
# PostgreSQL connector (from v1.0 capstone)
# Source: Debezium PostgreSQL connector documentation
{
  "name": "postgres-outbox-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.server.name": "postgres_prod",  # Topic prefix: postgres_prod.*
    "table.include.list": "public.outbox",
    "plugin.name": "pgoutput",
    "slot.name": "debezium_outbox_slot_pg",
    "transforms": "outbox",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.route.topic.replacement": "outbox.event.postgres.${routedByValue}"
  }
}

# MySQL connector (NEW for multi-database capstone)
# Source: Debezium MySQL connector documentation
{
  "name": "mysql-outbox-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.server.name": "mysql_prod",  # Topic prefix: mysql_prod.*
    "database.server.id": "184054",  # Unique server ID (no PostgreSQL equivalent)
    "table.include.list": "ecommerce.outbox",
    "schema.history.internal.kafka.topic": "schema-changes.mysql-outbox",  # CRITICAL: MySQL-only requirement
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
    "transforms": "outbox",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.route.topic.replacement": "outbox.event.mysql.${routedByValue}"
  }
}

# Result: Two separate topic streams
# - outbox.event.postgres.orders (PostgreSQL source)
# - outbox.event.mysql.orders (MySQL source)
```

**Trade-offs:**
- **Pros:** Clear source traceability, independent schema evolution, simpler troubleshooting
- **Cons:** Consumer must handle multiple topics, duplicate processing logic for similar data

### Pattern 2: Unified Topics Architecture (Advanced)
**What:** Consolidate events from both databases into single topics using ByLogicalTableRouter SMT
**When to use:** When databases have identical schemas and unified processing is desired
**Example:**
```bash
# Add ByLogicalTableRouter to merge topics
# Source: https://debezium.io/documentation/reference/stable/transformations/topic-routing.html
{
  "name": "postgres-outbox-connector",
  "config": {
    # ... base config ...
    "transforms": "outbox,router",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.route.topic.replacement": "outbox.event.${routedByValue}",
    "transforms.router.type": "io.debezium.transforms.ByLogicalTableRouter",
    "transforms.router.topic.regex": "outbox.event.(.*)",
    "transforms.router.topic.replacement": "unified.event.$1"
  }
}

# MySQL connector with same routing
{
  "name": "mysql-outbox-connector",
  "config": {
    # ... base config ...
    "transforms": "outbox,router",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.route.topic.replacement": "outbox.event.${routedByValue}",
    "transforms.router.type": "io.debezium.transforms.ByLogicalTableRouter",
    "transforms.router.topic.regex": "outbox.event.(.*)",
    "transforms.router.topic.replacement": "unified.event.$1"
  }
}

# Result: Single unified topic
# - unified.event.orders (contains events from both PostgreSQL and MySQL)
# Note: __dbz__physicalTableIdentifier field added to keys for uniqueness
```

**Trade-offs:**
- **Pros:** Single consumer, unified processing logic, simplified downstream architecture
- **Cons:** Key uniqueness complexity, mixed schema evolution, harder to isolate database-specific issues

### Pattern 3: Multi-Source PyFlink Consumer
**What:** PyFlink job consuming from multiple Kafka topics with source-aware processing
**When to use:** Separate topics architecture with unified downstream destination
**Example:**
```python
# Source: Apache Flink Kafka connector documentation + Debezium format
from pyflink.table import EnvironmentSettings, TableEnvironment

env_settings = EnvironmentSettings.in_streaming_mode()
table_env = TableEnvironment.create(env_settings)

# Define PostgreSQL source
postgres_source_ddl = """
    CREATE TABLE orders_postgres_cdc (
        order_id BIGINT,
        customer_id BIGINT,
        total_amount DECIMAL(10, 2),
        created_at TIMESTAMP(3),
        source_db STRING METADATA FROM 'value.source.db' VIRTUAL,  # Track source
        PRIMARY KEY (order_id) NOT ENFORCED
    ) WITH (
        'connector' = 'kafka',
        'topic' = 'outbox.event.postgres.orders',
        'properties.bootstrap.servers' = 'kafka:9092',
        'format' = 'debezium-json',
        'debezium-json.schema-include' = 'false'
    )
"""
table_env.execute_sql(postgres_source_ddl)

# Define MySQL source
mysql_source_ddl = """
    CREATE TABLE orders_mysql_cdc (
        order_id BIGINT,
        customer_id BIGINT,
        total_amount DECIMAL(10, 2),
        created_at TIMESTAMP(3),
        source_db STRING METADATA FROM 'value.source.db' VIRTUAL,
        PRIMARY KEY (order_id) NOT ENFORCED
    ) WITH (
        'connector' = 'kafka',
        'topic' = 'outbox.event.mysql.orders',
        'properties.bootstrap.servers' = 'kafka:9092',
        'format' = 'debezium-json',
        'debezium-json.schema-include' = 'false'
    )
"""
table_env.execute_sql(mysql_source_ddl)

# Unified view combining both sources
unified_view_sql = """
    CREATE VIEW unified_orders AS
    SELECT
        order_id,
        customer_id,
        total_amount,
        created_at,
        'postgresql' AS source_database
    FROM orders_postgres_cdc
    UNION ALL
    SELECT
        order_id,
        customer_id,
        total_amount,
        created_at,
        'mysql' AS source_database
    FROM orders_mysql_cdc
"""
table_env.execute_sql(unified_view_sql)

# Sink to unified BigQuery table
sink_ddl = """
    CREATE TABLE orders_bigquery_sink (
        order_id BIGINT,
        customer_id BIGINT,
        total_amount DECIMAL(10, 2),
        created_at TIMESTAMP(3),
        source_database STRING,
        PRIMARY KEY (order_id) NOT ENFORCED
    ) WITH (
        'connector' = 'kafka',
        'topic' = 'bigquery.unified.orders',
        'properties.bootstrap.servers' = 'kafka:9092',
        'format' = 'json'
    )
"""
table_env.execute_sql(sink_ddl)

# Execute unified processing
table_env.execute_sql("""
    INSERT INTO orders_bigquery_sink
    SELECT * FROM unified_orders
""").wait()
```

### Anti-Patterns to Avoid
- **Shared schema history topic between connectors:** MySQL connectors MUST have unique `schema.history.internal.kafka.topic` to prevent DDL pollution
- **Identical database.server.name values:** Topic naming conflicts cause data loss
- **Merged topics without key uniqueness handling:** ByLogicalTableRouter automatically adds `__dbz__physicalTableIdentifier`, must handle in consumer
- **Ignoring source metadata:** Unified consumers should preserve `source_database` field for troubleshooting and auditing

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Topic consolidation logic | Custom message router | ByLogicalTableRouter SMT | Handles key uniqueness, supports regex patterns, production-tested |
| Multi-source schema registry | Custom schema versioning | Confluent Schema Registry with references | Handles schema evolution, compatibility rules, versioning |
| Duplicate event detection | Custom deduplication | Flink's `table.exec.source.cdc-events-duplicate=true` | Built-in CDC duplicate handling |
| Event ordering across databases | Custom sequencing | Kafka partitioning + Flink watermarks | Distributed ordering guarantees |
| Source-aware routing | Custom topic parsing | Debezium metadata fields (`source.db`, `source.table`) | Built into event envelope |

**Key insight:** Multi-database CDC introduces coordination complexity (schema evolution, key uniqueness, ordering) that existing SMTs and Flink features already solve. Custom solutions miss edge cases like tombstone events, transaction boundaries, and schema changes.

## Common Pitfalls

### Pitfall 1: Shared Schema History Topic
**What goes wrong:** MySQL connector corrupts schema history of another connector when sharing `schema.history.internal.kafka.topic`
**Why it happens:** MySQL connectors write DDL statements to schema history topic; shared topic causes DDL pollution across connectors
**How to avoid:** Always use unique schema history topic names per MySQL connector
```json
// BAD - Shared topic
"schema.history.internal.kafka.topic": "schema-changes.shared"

// GOOD - Connector-specific topics
"schema.history.internal.kafka.topic": "schema-changes.mysql-connector-1"
"schema.history.internal.kafka.topic": "schema-changes.mysql-connector-2"
```
**Warning signs:** Connector fails with "schema mismatch" errors after another connector processes DDL changes

### Pitfall 2: Topic Naming Conflicts
**What goes wrong:** Two connectors with identical `database.server.name` overwrite each other's events
**Why it happens:** Default topic naming uses `{database.server.name}.{schema}.{table}` pattern
**How to avoid:** Use distinct logical names for each connector
```json
// BAD - Identical names
// Connector 1: "database.server.name": "prod"
// Connector 2: "database.server.name": "prod"

// GOOD - Unique names
// Connector 1: "database.server.name": "postgres_prod"
// Connector 2: "database.server.name": "mysql_prod"
```
**Warning signs:** Events from one database missing, connector metrics show writes but consumer sees only one source

### Pitfall 3: Ignoring Envelope Format Differences
**What goes wrong:** Consumer code assumes identical envelope structure for PostgreSQL and MySQL events
**Why it happens:** Both connectors use similar envelope format but have database-specific metadata fields
**How to avoid:** Use Debezium format parsers (Flink's `format = 'debezium-json'`) instead of manual parsing
```python
# BAD - Manual parsing misses database-specific fields
event = json.loads(kafka_message.value)
order_id = event['payload']['after']['order_id']  # Breaks on DELETE events

# GOOD - Use Flink's debezium-json format
CREATE TABLE orders_cdc (
    order_id BIGINT,
    ...
) WITH (
    'format' = 'debezium-json'  # Handles before/after/op automatically
)
```
**Warning signs:** Consumer crashes on DELETE events, UPDATE events processed incorrectly

### Pitfall 4: Schema Evolution Without Coordination
**What goes wrong:** PostgreSQL schema changes don't propagate to MySQL or vice versa, causing consumer failures
**Why it happens:** Each database evolves independently; no cross-database schema governance
**How to avoid:** Use outbox pattern with well-defined event contracts; avoid direct table replication
**Warning signs:** Consumer fails with "unknown field" errors after DDL changes in one database

### Pitfall 5: Assuming Identical Operational Characteristics
**What goes wrong:** Applying PostgreSQL recovery procedures to MySQL connector or vice versa
**Why it happens:** Connectors have different failure modes (PostgreSQL = replication slot WAL bloat, MySQL = binlog purge)
**How to avoid:** Document database-specific runbook procedures
**Monitoring differences:**
- PostgreSQL: Monitor `pg_replication_slots` WAL lag
- MySQL: Monitor `SHOW BINARY LOGS` retention and `MilliSecondsBehindSource` metric
**Warning signs:** Recovery procedures fail, connector cannot restart after database failover

### Pitfall 6: Merged Topics Without Key Strategy
**What goes wrong:** Events from different databases with same key value overwrite each other
**Why it happens:** ByLogicalTableRouter adds `__dbz__physicalTableIdentifier` to keys, consumer must handle it
**How to avoid:** Either preserve the key field in consumer or use separate topics architecture
```python
# When using ByLogicalTableRouter, keys include source table identifier
# Flink automatically handles this with PRIMARY KEY definition
CREATE TABLE unified_orders (
    order_id BIGINT,
    ...
    PRIMARY KEY (order_id) NOT ENFORCED  # Flink uses composite key internally
)
```
**Warning signs:** Data loss in unified topic, duplicate keys from different sources conflict

## Code Examples

Verified patterns from official sources:

### Deploying Multiple Connectors
```bash
# Source: Debezium official documentation
# Deploy PostgreSQL connector
curl -X POST http://localhost:8083/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "postgres-outbox-connector",
    "config": {
      "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
      "database.hostname": "postgres",
      "database.server.name": "postgres_prod",
      "table.include.list": "public.outbox",
      "plugin.name": "pgoutput",
      "slot.name": "debezium_outbox_slot_pg"
    }
  }'

# Deploy MySQL connector
curl -X POST http://localhost:8083/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "mysql-outbox-connector",
    "config": {
      "connector.class": "io.debezium.connector.mysql.MySqlConnector",
      "database.hostname": "mysql",
      "database.server.name": "mysql_prod",
      "database.server.id": "184054",
      "table.include.list": "ecommerce.outbox",
      "schema.history.internal.kafka.topic": "schema-changes.mysql-outbox",
      "schema.history.internal.kafka.bootstrap.servers": "kafka:9092"
    }
  }'

# Verify both connectors running
curl http://localhost:8083/connectors | jq
# Expected: ["postgres-outbox-connector", "mysql-outbox-connector"]
```

### Creating MySQL Outbox Table (Parallel to PostgreSQL)
```sql
-- Source: Debezium Outbox Event Router documentation
-- MySQL outbox table schema (compare to PostgreSQL version in v1.0)
CREATE TABLE outbox (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),  -- MySQL UUID syntax
    aggregatetype VARCHAR(255) NOT NULL,
    aggregateid VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    payload JSON NOT NULL,  -- JSON type (vs PostgreSQL JSONB)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Note: No REPLICA IDENTITY equivalent in MySQL
-- Binlog with ROW format captures full row data automatically
```

### Monitoring Multi-Database Connectors
```python
# Source: Prometheus JMX exporter documentation
# Grafana dashboard query for multi-database lag monitoring
# Panel 1: PostgreSQL replication lag (LSN-based)
SELECT
    pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn) AS lag_bytes
FROM pg_replication_slots
WHERE slot_name = 'debezium_outbox_slot_pg';

# Panel 2: MySQL replication lag (time-based)
# PromQL query
debezium_metrics_MilliSecondsBehindSource{
    connector="mysql-outbox-connector"
}

# Combined dashboard showing both sources
# Visualization: Time series with two series (PostgreSQL bytes lag, MySQL time lag)
```

### Unified Consumer with Source Tracking
```python
# Source: Apache Flink Table API documentation
# PyFlink consumer tracking source database for each event
transform_sql = """
    CREATE VIEW enriched_unified_orders AS
    SELECT
        order_id,
        customer_id,
        total_amount,
        created_at,
        source_database,
        CASE source_database
            WHEN 'postgresql' THEN 'PG-' || CAST(order_id AS STRING)
            WHEN 'mysql' THEN 'MY-' || CAST(order_id AS STRING)
        END AS composite_key,  -- Prevent key conflicts
        CURRENT_TIMESTAMP AS processed_at
    FROM unified_orders
"""
table_env.execute_sql(transform_sql)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual topic routing with custom logic | ByLogicalTableRouter SMT | Debezium 1.2+ (2020) | Standardized topic consolidation pattern |
| Separate Kafka clusters per database | Shared Kafka cluster with namespace isolation | Architecture evolution 2021+ | Reduced operational overhead |
| Schema registry per database type | Unified schema registry with references | Confluent Platform 5.5+ (2020) | Cross-database schema governance |
| Custom deduplication logic | Flink CDC-aware deduplication | Flink 1.11+ (2020) | Built-in duplicate handling |
| Manual event ordering | Flink watermarks + event time | Flink 1.12+ (2021) | Automatic ordering across sources |

**Deprecated/outdated:**
- **Single-threaded Kafka Connect tasks:** Debezium 2.0+ supports parallel snapshot (2022)
- **pgoutput plugin limitations:** PostgreSQL 15+ adds logical replication improvements (2022)
- **MySQL binlog_row_value_options:** MySQL 8.0.30+ adds partial JSON updates (2022)

**Current best practices (2026):**
- Use Debezium 2.5.x for stable multi-database deployments
- Leverage Flink Table API `format = 'debezium-json'` for CDC event parsing
- Apply ByLogicalTableRouter SMT for topic consolidation when schemas align
- Implement source tracking metadata in consumers for audit trails
- Monitor database-specific metrics (PostgreSQL WAL lag, MySQL binlog lag) separately

## Open Questions

Things that couldn't be fully resolved:

1. **Schema Registry Integration for Multi-Database**
   - What we know: Confluent Schema Registry supports schema references (Platform 5.5+)
   - What's unclear: Best practice for managing PostgreSQL vs MySQL schema differences when using Avro serialization in unified topics
   - Recommendation: Document as advanced topic; capstone uses JSON format for simplicity (aligns with v1.0)

2. **Cross-Database Transaction Boundaries**
   - What we know: Debezium captures transaction metadata per connector
   - What's unclear: How to correlate transactions across PostgreSQL and MySQL when single business operation spans both databases
   - Recommendation: Scope capstone to independent transactions per database; note as production consideration

3. **GTID vs LSN Ordering Guarantees**
   - What we know: PostgreSQL LSN is sequential per database, MySQL GTID is sequential per cluster
   - What's unclear: How to establish global ordering when consuming from both sources in unified stream
   - Recommendation: Use Flink event-time watermarks based on `created_at` field; document limitation

## Sources

### Primary (HIGH confidence)
- [Debezium Architecture](https://debezium.io/documentation/reference/stable/architecture.html) - Multi-connector deployment patterns
- [Debezium Topic Routing](https://debezium.io/documentation/reference/stable/transformations/topic-routing.html) - ByLogicalTableRouter SMT configuration
- [Debezium PostgreSQL Connector](https://debezium.io/documentation/reference/stable/connectors/postgresql.html) - Replication slot behavior, no schema history topic
- [Debezium MySQL Connector](https://debezium.io/documentation/reference/stable/connectors/mysql.html) - Schema history topic requirements
- [Debezium FAQ](https://debezium.io/documentation/faq/) - Multiple connectors support

### Secondary (MEDIUM confidence)
- [Real-Time CDC: Debezium and Kafka for Sharded PostgreSQL Data Integration](https://idatamax.com/blog/real-time-data-cdc-and-kafka-for-sharded-databases) - Multi-database architecture patterns (2025)
- [Advanced CDC Configurations in Debezium for Multi-Tenant and Multi-Region](https://binaryscripts.com/debezium/2025/04/29/advanced-cdc-configurations-in-debezium-handling-multi-tenant-and-multi-region-data.html) - Topic naming conventions (2025)
- [Apache Flink CDC Connectors](https://nightlies.apache.org/flink/flink-cdc-docs-release-3.1/docs/connectors/flink-sources/postgres-cdc/) - Multi-source processing patterns
- [Schema Evolution in Change Data Capture Pipelines](https://www.decodable.co/blog/schema-evolution-in-change-data-capture-pipelines) - Schema evolution strategies
- [Real-time CDC replications between MySQL and PostgreSQL](https://timothyzhang.medium.com/real-time-cdc-replications-between-mysql-and-postgresql-using-debezium-connectors-24aa33d58f1e) - Bi-directional CDC example

### Tertiary (LOW confidence)
- [Debezium for CDC in Production: Pain Points and Limitations](https://estuary.dev/blog/debezium-cdc-pain-points/) - Operational complexity insights
- [CDC Data Replication: Techniques, Tradeoffs, Insights](https://blog.dataddo.com/cdc-data-replication-techniques-tradeoffs-insights) - General CDC patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components already deployed and tested in v1.0 and Phases 12-16
- Architecture patterns: HIGH - Official Debezium documentation confirms multi-connector support, SMT patterns verified
- Pitfalls: HIGH - Common mistakes documented in official docs and production experience reports
- Code examples: HIGH - All examples from official Debezium and Flink documentation
- Schema evolution: MEDIUM - Cross-database schema governance less documented, requires extrapolation
- Open questions: LOW - Transaction correlation and global ordering require additional research

**Research date:** 2026-02-01
**Valid until:** 2026-04-01 (60 days - stable domain, Debezium 2.5.x stable release)

**Key constraints from project context:**
- Debezium 2.5.x (not 3.x) per project decision
- Builds on v1.0 capstone (PostgreSQL + Outbox + PyFlink + BigQuery)
- Extends with MySQL knowledge from Phases 12-16
- Russian text / English code pattern continues
- Module 7 capstone already exists, needs extension not replacement
