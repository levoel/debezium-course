# Phase 11: Capstone Project - Research

**Researched:** 2026-02-01
**Domain:** Capstone project design, CDC pipeline production readiness, technical project assessment
**Confidence:** MEDIUM

## Summary

This research investigates how to design an effective capstone project for a Debezium/CDC course that validates students can integrate Aurora PostgreSQL, Outbox pattern, PyFlink, and BigQuery into a production-ready end-to-end pipeline. The research covers pedagogical best practices for capstone design, production readiness standards for CDC systems, technical assessment criteria, and the specific architecture patterns required for the Aurora → Outbox → PyFlink → BigQuery pipeline.

The standard approach for technical capstone projects follows a framework of clear problem definition, production-ready deliverables (not just proof-of-concept), comprehensive documentation, and self-assessment against standardized criteria. For CDC pipelines specifically, production readiness requires monitoring infrastructure, fault tolerance patterns, schema evolution handling, and operational runbooks.

The capstone should emphasize systems integration mastery rather than introducing new concepts. Students synthesize 6 modules of prior learning into a cohesive system that demonstrates production deployment competency across the entire data pipeline stack from source database through stream processing to analytics warehouse.

**Primary recommendation:** Structure the capstone as a production readiness validation exercise with clear deliverables (working pipeline, monitoring dashboards, documentation, architecture diagrams) and a self-assessment checklist covering the Four Golden Signals (latency, traffic, errors, saturation), fault tolerance, schema evolution, and operational procedures.

## Standard Stack

The established libraries/tools for this capstone architecture:

### Core Components
| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Debezium PostgreSQL Connector | 3.4+ | Capture CDC from Aurora | Industry standard for PostgreSQL CDC, mature replication slot management |
| Debezium Outbox Event Router SMT | Stable (3.4+) | Transform outbox table to events | Official Debezium pattern for reliable event publishing |
| PyFlink Table API | 1.18+ / 2.x | Stream processing and transformations | Python-first API for CDC processing, native Debezium format support |
| BigQuery Storage Write API | Current | Real-time CDC ingestion to warehouse | Native BigQuery CDC support with UPSERT/DELETE operations |
| Apache Kafka | 3.x | Event streaming backbone | Debezium's primary transport, mature ecosystem |

### Supporting Infrastructure
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Prometheus | Latest | Metrics collection | Standard for JMX metric export from Debezium/Kafka |
| Grafana | Latest | Metrics visualization | Standard dashboarding for operational metrics |
| Schema Registry | Confluent 7.x+ | Avro schema management | If using Avro format for outbox payloads |
| Docker / Docker Compose | Latest | Local development environment | Standard for course labs infrastructure |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PyFlink Table API | Flink DataStream API | DataStream offers more control but requires Java; Table API is Python-native and simpler for CDC |
| BigQuery Storage Write API | Dataflow templates | Dataflow adds transformation layer; direct Storage Write API is simpler for replication use case |
| Debezium Outbox SMT | Custom Kafka Streams app | Custom solution requires more code; SMT is standard, well-tested pattern |

**Installation:**
```bash
# PyFlink with Kafka connector
pip install apache-flink==1.18.0
pip install apache-flink-libraries

# Debezium (via Docker for course environment)
docker pull debezium/connect:3.4
docker pull debezium/postgres:15

# Monitoring stack
docker pull prom/prometheus:latest
docker pull grafana/grafana:latest
```

## Architecture Patterns

### Recommended Project Structure
```
capstone-project/
├── infrastructure/          # Docker Compose, Kubernetes manifests
│   ├── docker-compose.yml  # Local dev environment
│   ├── debezium/           # Connector configs
│   └── monitoring/         # Prometheus, Grafana configs
├── database/               # Aurora schema and migrations
│   ├── schema.sql          # Tables including outbox
│   ├── migrations/         # Schema evolution scripts
│   └── seed-data/          # Test data generation
├── pyflink-jobs/           # Stream processing applications
│   ├── cdc_processor.py    # Main PyFlink Table API job
│   ├── requirements.txt    # Python dependencies
│   └── tests/              # Unit and integration tests
├── bigquery/               # Warehouse schema and config
│   ├── schema.sql          # Table definitions with primary keys
│   └── ddl/                # BigQuery-specific DDL
├── monitoring/             # Dashboards and alerts
│   ├── dashboards/         # Grafana JSON exports
│   └── alerts/             # Alert rules (Prometheus)
├── docs/                   # Project documentation
│   ├── architecture.md     # C4 diagrams, system context
│   ├── runbook.md          # Operational procedures
│   └── testing-strategy.md # Validation approach
└── README.md               # Project overview and setup
```

### Pattern 1: Outbox Event Router Configuration
**What:** Debezium SMT that transforms outbox table changes into routed events
**When to use:** When implementing transactional outbox pattern with Aurora PostgreSQL
**Example:**
```json
{
  "transforms": "outbox",
  "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
  "transforms.outbox.table.fields.additional.placement": "type:header:eventType",
  "transforms.outbox.route.by.field": "aggregatetype",
  "transforms.outbox.route.topic.replacement": "outbox.event.${routedByValue}",
  "predicates": "isOutboxTable",
  "predicates.isOutboxTable.type": "org.apache.kafka.connect.transforms.predicates.TopicNameMatches",
  "predicates.isOutboxTable.pattern": ".*outbox",
  "transforms.outbox.predicate": "isOutboxTable"
}
```
**Source:** [Debezium Outbox Event Router Documentation](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html)

### Pattern 2: PyFlink Table API with Debezium Format
**What:** PyFlink Table API consuming Debezium-formatted CDC events from Kafka
**When to use:** When processing CDC streams in Python for transformation before BigQuery
**Example:**
```python
from pyflink.table import EnvironmentSettings, TableEnvironment

# Create table environment
env_settings = EnvironmentSettings.in_streaming_mode()
table_env = TableEnvironment.create(env_settings)

# Define Kafka source with Debezium format
source_ddl = """
    CREATE TABLE orders_cdc (
        order_id BIGINT,
        customer_id BIGINT,
        status STRING,
        total_amount DECIMAL(10, 2),
        created_at TIMESTAMP(3),
        PRIMARY KEY (order_id) NOT ENFORCED
    ) WITH (
        'connector' = 'kafka',
        'topic' = 'outbox.event.orders',
        'properties.bootstrap.servers' = 'kafka:9092',
        'properties.group.id' = 'pyflink-cdc-processor',
        'format' = 'debezium-json',
        'scan.startup.mode' = 'earliest-offset',
        'table.exec.source.cdc-events-duplicate' = 'true'
    )
"""
table_env.execute_sql(source_ddl)

# Define BigQuery sink (via Kafka connector or direct)
sink_ddl = """
    CREATE TABLE orders_bigquery (
        order_id BIGINT,
        customer_id BIGINT,
        status STRING,
        total_amount DECIMAL(10, 2),
        created_at TIMESTAMP(3),
        PRIMARY KEY (order_id) NOT ENFORCED
    ) WITH (
        'connector' = 'kafka',
        'topic' = 'bigquery.orders',
        'properties.bootstrap.servers' = 'kafka:9092',
        'format' = 'json'
    )
"""
table_env.execute_sql(sink_ddl)

# Execute transformation and routing
table_env.execute_sql("""
    INSERT INTO orders_bigquery
    SELECT order_id, customer_id, status, total_amount, created_at
    FROM orders_cdc
""")
```
**Source:** [Apache Flink Debezium Format](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/table/formats/debezium/)

### Pattern 3: BigQuery CDC Ingestion via Storage Write API
**What:** BigQuery table configured for CDC with primary keys and Storage Write API
**When to use:** When replicating CDC streams to BigQuery for analytics
**Example:**
```sql
-- BigQuery table with primary key for CDC
CREATE TABLE `project.dataset.orders` (
    order_id INT64 NOT NULL,
    customer_id INT64 NOT NULL,
    status STRING,
    total_amount NUMERIC(10, 2),
    created_at TIMESTAMP,
    PRIMARY KEY (order_id) NOT ENFORCED
) OPTIONS (
    max_staleness = INTERVAL 15 MINUTE,
    description = "Orders table with CDC ingestion"
);
```
**Configuration considerations:**
- Primary keys required (up to 16 columns for composite keys)
- `max_staleness` balances freshness vs cost (avoid very low values)
- Use protobuf format with Storage Write API
- No DML operations allowed on CDC-enabled tables
**Source:** [BigQuery CDC Documentation](https://docs.cloud.google.com/bigquery/docs/change-data-capture)

### Pattern 4: Production Monitoring Setup
**What:** JMX metrics exported to Prometheus with Grafana dashboards
**When to use:** All production CDC deployments
**Example:**
```yaml
# docker-compose.yml snippet for JMX export
services:
  kafka-connect:
    image: debezium/connect:3.4
    environment:
      - KAFKA_JMX_OPTS=-Dcom.sun.management.jmxremote=true
                       -Dcom.sun.management.jmxremote.port=9999
                       -Dcom.sun.management.jmxremote.authenticate=false
                       -Dcom.sun.management.jmxremote.ssl=false
      - JMX_PORT=9999
    ports:
      - "9999:9999"

  jmx-exporter:
    image: bitnami/jmx-exporter:latest
    ports:
      - "5556:5556"
    volumes:
      - ./monitoring/jmx-config.yml:/etc/jmx-exporter/config.yml
    command:
      - "5556"
      - "/etc/jmx-exporter/config.yml"
```
**Key metrics to monitor:**
- Replication lag (milliseconds behind source)
- Connector status (running/failed)
- Snapshot progress
- Kafka consumer lag
**Source:** [Debezium Monitoring Documentation](https://debezium.io/documentation/reference/stable/operations/monitoring.html)

### Anti-Patterns to Avoid
- **Superuser credentials for Debezium:** Create dedicated replication user with minimal privileges (REPLICATION, LOGIN only)
- **No primary keys in BigQuery:** BigQuery CDC requires explicit primary key declaration
- **Hand-rolled outbox polling:** Use Debezium Outbox SMT instead of custom polling code
- **Ignoring replication slot growth:** Monitor WAL retention and slot lag to prevent disk space issues
- **Missing duplicate handling:** Configure `table.exec.source.cdc-events-duplicate=true` in PyFlink for at-least-once semantics
- **Low max_staleness in BigQuery:** Causes expensive background jobs; set to 15+ minutes unless real-time queries required

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Outbox table polling | Custom polling service | Debezium Outbox Event Router SMT | WAL-based guarantees, no polling overhead, battle-tested at scale |
| CDC format parsing | Custom JSON/Avro parsers | PyFlink Debezium format connector | Handles schema evolution, duplicate detection, and transaction boundaries |
| BigQuery merge logic | Custom UPSERT scripts | BigQuery Storage Write API with CDC | Native primary key enforcement, automatic conflict resolution, cost-optimized |
| Metrics collection | Custom JMX readers | Prometheus JMX Exporter | Standard integration, compatible with Grafana, rich metric library |
| Replication slot management | Custom cleanup scripts | Debezium heartbeat and slot monitoring | Automatic heartbeats prevent slot deletion, built-in lag metrics |
| Schema evolution | Manual ALTER TABLE coordination | Schema Registry + Avro | Version compatibility rules, backward/forward compatibility checks |

**Key insight:** CDC systems have subtle failure modes (duplicate events, missing deletes, schema drift, replication lag spikes) that standard tools handle through years of production hardening. Custom solutions miss edge cases that only appear at scale or during failures.

## Common Pitfalls

### Pitfall 1: Aurora Replication Slot Exhaustion
**What goes wrong:** Replication slots consume WAL segments; if Debezium connector stops, WAL grows unbounded, filling disk
**Why it happens:** Aurora has `max_replication_slots` limit; stopped connectors hold slots but don't consume WAL
**How to avoid:**
- Set `heartbeat.interval.ms=10000` in connector config to keep slots active
- Monitor `pg_replication_slots` view for slot lag
- Configure reasonable `max_replication_slots` and `max_wal_senders` in Aurora parameter group
**Warning signs:**
- Disk space alerts in Aurora
- `pg_replication_slots.restart_lsn` not advancing
- Connector shows "too many replication slots" error

### Pitfall 2: Missing REPLICA IDENTITY FULL
**What goes wrong:** PostgreSQL CDC only captures changed columns by default; PyFlink can't reconstruct full row for updates/deletes
**Why it happens:** Default `REPLICA IDENTITY DEFAULT` only includes primary key in WAL; Debezium needs full row data
**How to avoid:**
```sql
ALTER TABLE outbox REPLICA IDENTITY FULL;
ALTER TABLE [your_tables] REPLICA IDENTITY FULL;
```
**Warning signs:**
- Debezium events missing "before" state for UPDATEs
- Downstream consumers receive incomplete data
- Errors in PyFlink when processing DELETE events

### Pitfall 3: BigQuery Primary Key Not Enforced
**What goes wrong:** BigQuery CDC requires `PRIMARY KEY (col) NOT ENFORCED` declaration; missing this causes ingestion failures
**Why it happens:** Students familiar with traditional databases assume primary keys are automatic constraints
**How to avoid:**
- Explicitly declare `PRIMARY KEY (cols) NOT ENFORCED` in CREATE TABLE
- Validate primary key uniqueness in source data (BigQuery doesn't enforce, but duplicate keys cause undefined behavior)
**Warning signs:**
- Storage Write API returns "primary key required" errors
- CDC merge operations fail silently
- Queries return duplicate rows

### Pitfall 4: Snapshot Mode Misunderstanding
**What goes wrong:** Using `snapshot.mode=initial` after WAL segments purged causes data loss; using `always` causes full re-snapshot on every restart
**Why it happens:** Students don't understand relationship between Kafka offsets, LSN positions, and WAL retention
**How to avoid:**
- Use `snapshot.mode=initial` for first run
- Use `snapshot.mode=when_needed` for production (auto-detects if snapshot required)
- Monitor WAL retention: `wal_keep_size` parameter in Aurora
**Warning signs:**
- Connector restarts from beginning, duplicating all data
- Connector fails with "requested WAL segment no longer exists"
- Massive lag spikes after connector restart

### Pitfall 5: PyFlink Job Parallelism Mismatch
**What goes wrong:** High parallelism with low-volume Kafka topics causes idle task managers; low parallelism bottlenecks throughput
**Why it happens:** Default parallelism settings don't match capstone project scale
**How to avoid:**
- Set parallelism to match Kafka topic partition count for balanced load
- For capstone (low volume), use parallelism 1-2
- Configure: `table_env.get_config().set("parallelism.default", "2")`
**Warning signs:**
- Task managers show 0% CPU utilization
- Single task manager saturated while others idle
- Checkpoints take longer than checkpoint interval

### Pitfall 6: Missing Idempotency in Downstream Consumers
**What goes wrong:** At-least-once delivery causes duplicate processing; non-idempotent operations (e.g., incrementing counters) produce incorrect results
**Why it happens:** Outbox + CDC uses at-least-once semantics; connector restarts replay events
**How to avoid:**
- Design all downstream operations to be idempotent (INSERT → UPSERT, increment → SET)
- Use `table.exec.source.cdc-events-duplicate=true` in PyFlink
- Deduplicate using PRIMARY KEY and windowing functions if needed
**Warning signs:**
- Aggregations double-count after restarts
- BigQuery shows duplicate rows with same primary key at different timestamps
- Metrics show spikes after connector restarts

### Pitfall 7: Insufficient Monitoring Coverage
**What goes wrong:** Production issues invisible until customers report data discrepancies
**Why it happens:** Students focus on "happy path" functionality, skip observability infrastructure
**How to avoid:**
- Implement Four Golden Signals: latency (replication lag), traffic (events/sec), errors (connector failures), saturation (CPU/memory)
- Set up alerts: lag > 10 seconds, connector status != RUNNING, error rate > 0
- Create runbook with common failure scenarios and remediation steps
**Warning signs:**
- Can't answer "when did replication lag spike?"
- No historical metrics for capacity planning
- Troubleshooting requires manual log searches

## Code Examples

Verified patterns from official sources:

### Aurora PostgreSQL Setup for Debezium
```sql
-- Source: Debezium PostgreSQL Connector Documentation
-- https://debezium.io/documentation/reference/stable/connectors/postgresql.html

-- Create replication user (principle of least privilege)
CREATE USER debezium_user WITH REPLICATION LOGIN PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO debezium_user;
GRANT USAGE ON SCHEMA public TO debezium_user;

-- Configure Aurora parameter group (via AWS Console or RDS API)
-- rds.logical_replication = 1
-- max_replication_slots = 10
-- max_wal_senders = 10
-- wal_keep_size = 2048  -- MB of WAL to retain

-- Create outbox table with REPLICA IDENTITY FULL
CREATE TABLE outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregatetype VARCHAR(255) NOT NULL,
    aggregateid VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE outbox REPLICA IDENTITY FULL;

-- Create index for cleanup queries
CREATE INDEX idx_outbox_created_at ON outbox(created_at);
```

### Debezium Connector Configuration
```json
{
  "name": "aurora-postgres-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "aurora-cluster.region.rds.amazonaws.com",
    "database.port": "5432",
    "database.user": "debezium_user",
    "database.password": "${file:/secrets/db-password.txt:password}",
    "database.dbname": "production",
    "database.server.name": "aurora_prod",
    "table.include.list": "public.outbox",
    "plugin.name": "pgoutput",
    "publication.autocreate.mode": "filtered",
    "slot.name": "debezium_slot",
    "heartbeat.interval.ms": "10000",
    "heartbeat.action.query": "INSERT INTO heartbeat (ts) VALUES (NOW()) ON CONFLICT (id) DO UPDATE SET ts=EXCLUDED.ts",
    "snapshot.mode": "when_needed",
    "snapshot.isolation.mode": "read_committed",
    "transforms": "outbox",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.route.by.field": "aggregatetype",
    "transforms.outbox.table.fields.additional.placement": "type:header:eventType,created_at:envelope:timestamp",
    "key.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "key.converter.schemas.enable": "false",
    "value.converter.schemas.enable": "false"
  }
}
```

### PyFlink CDC Processing with Transformations
```python
# Source: Apache Flink Debezium Format + Course Module 5 patterns
from pyflink.table import EnvironmentSettings, TableEnvironment
from pyflink.table.expressions import col, lit
import os

# Initialize Flink Table Environment
env_settings = EnvironmentSettings.in_streaming_mode()
table_env = TableEnvironment.create(env_settings)

# Set checkpoint interval for fault tolerance
table_env.get_config().set("execution.checkpointing.interval", "60000")  # 60 seconds
table_env.get_config().set("parallelism.default", "2")
table_env.get_config().set("table.exec.source.cdc-events-duplicate", "true")

# Define Kafka source with Debezium format
source_ddl = """
    CREATE TABLE orders_cdc (
        order_id BIGINT,
        customer_id BIGINT,
        product_id BIGINT,
        status STRING,
        total_amount DECIMAL(10, 2),
        created_at TIMESTAMP(3),
        updated_at TIMESTAMP(3),
        PRIMARY KEY (order_id) NOT ENFORCED
    ) WITH (
        'connector' = 'kafka',
        'topic' = 'outbox.event.orders',
        'properties.bootstrap.servers' = 'kafka:9092',
        'properties.group.id' = 'pyflink-cdc-processor',
        'format' = 'debezium-json',
        'scan.startup.mode' = 'earliest-offset',
        'debezium-json.schema-include' = 'false'
    )
"""
table_env.execute_sql(source_ddl)

# Define intermediate transformation table
transform_sql = """
    CREATE VIEW enriched_orders AS
    SELECT
        order_id,
        customer_id,
        product_id,
        status,
        total_amount,
        created_at,
        updated_at,
        CASE
            WHEN status = 'completed' THEN 'FULFILLED'
            WHEN status = 'cancelled' THEN 'CANCELLED'
            ELSE 'PENDING'
        END AS fulfillment_status,
        CURRENT_TIMESTAMP AS processed_at
    FROM orders_cdc
"""
table_env.execute_sql(transform_sql)

# Define BigQuery sink (via Kafka topic consumed by BigQuery connector)
sink_ddl = """
    CREATE TABLE orders_bigquery_sink (
        order_id BIGINT,
        customer_id BIGINT,
        product_id BIGINT,
        status STRING,
        total_amount DECIMAL(10, 2),
        created_at TIMESTAMP(3),
        updated_at TIMESTAMP(3),
        fulfillment_status STRING,
        processed_at TIMESTAMP(3),
        PRIMARY KEY (order_id) NOT ENFORCED
    ) WITH (
        'connector' = 'kafka',
        'topic' = 'bigquery.orders',
        'properties.bootstrap.servers' = 'kafka:9092',
        'format' = 'json'
    )
"""
table_env.execute_sql(sink_ddl)

# Execute streaming query
table_env.execute_sql("""
    INSERT INTO orders_bigquery_sink
    SELECT * FROM enriched_orders
""").wait()
```

### Production Readiness Self-Assessment Checklist Template
```markdown
# Capstone Project Production Readiness Checklist

## 1. Functionality
- [ ] Aurora outbox table created with REPLICA IDENTITY FULL
- [ ] Debezium connector successfully captures INSERT events from outbox
- [ ] Outbox Event Router SMT routes messages to correct Kafka topics
- [ ] PyFlink job consumes Debezium-formatted events
- [ ] PyFlink transformations execute correctly
- [ ] BigQuery table created with PRIMARY KEY declaration
- [ ] BigQuery Storage Write API ingests CDC events (verified with sample data)
- [ ] End-to-end latency < 5 seconds for test events

## 2. Fault Tolerance
- [ ] Kafka offsets tracked correctly (verified by connector restart)
- [ ] PyFlink checkpoints enabled and completing successfully
- [ ] Replication slot survives connector restart without data loss
- [ ] At-least-once delivery verified (no missing events after failures)
- [ ] Duplicate handling implemented (idempotent operations in BigQuery)
- [ ] Snapshot mode configured appropriately (`when_needed`)

## 3. Monitoring & Observability
- [ ] Prometheus scrapes JMX metrics from Kafka Connect
- [ ] Grafana dashboard shows:
  - [ ] Replication lag (ms behind source)
  - [ ] Events/second throughput
  - [ ] Connector status (running/failed)
  - [ ] PyFlink checkpoint duration
  - [ ] Kafka consumer lag
- [ ] Alert configured for: connector failure, lag > 10 seconds, error rate > 0
- [ ] Logs centralized and searchable
- [ ] Can answer "Four Golden Signals": latency, traffic, errors, saturation

## 4. Schema Evolution
- [ ] Schema Registry configured (if using Avro)
- [ ] Tested adding new column to outbox table (verified compatibility)
- [ ] Tested removing optional column (verified backward compatibility)
- [ ] PyFlink job handles missing fields gracefully
- [ ] BigQuery schema evolution documented

## 5. Operational Readiness
- [ ] Runbook documents common failure scenarios:
  - [ ] Connector fails with "too many replication slots"
  - [ ] WAL segments no longer exist
  - [ ] BigQuery ingestion failures
  - [ ] PyFlink job restarts with checkpoint recovery
- [ ] Capacity planning documented (expected events/day, storage growth)
- [ ] Backup and disaster recovery plan defined
- [ ] Security: no hardcoded credentials, least-privilege user permissions

## 6. Testing & Validation
- [ ] Source-to-target validation: sample data verified in BigQuery
- [ ] Data quality tests: no duplicates, no missing required fields
- [ ] Negative testing: confirmed pipeline handles malformed JSON
- [ ] Load testing: verified throughput under 10x expected load
- [ ] Chaos testing: killed connector during processing, verified recovery

## 7. Documentation
- [ ] README.md with project overview and setup instructions
- [ ] Architecture diagram (C4 model: System Context + Container diagrams)
- [ ] API documentation for outbox table schema
- [ ] Runbook with operational procedures
- [ ] Testing strategy document
- [ ] Known limitations and future improvements documented

## Scoring
- **Exemplary (90-100%)**: All sections complete, demonstrates advanced patterns (e.g., Avro schemas, custom transformations)
- **Above Average (75-89%)**: All critical sections complete (1-6), minor gaps in documentation
- **Meets Expectations (60-74%)**: Core functionality works (1, 2), monitoring/testing incomplete
- **Below Expectations (<60%)**: Pipeline works locally but lacks production patterns
```
**Source:** Synthesized from [Production Readiness Checklist (GitHub)](https://github.com/kgoralski/microservice-production-readiness-checklist) and [Mercari Production Readiness](https://github.com/mercari/production-readiness-checklist)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Polling outbox table with scheduled job | Debezium Outbox Event Router SMT | Debezium 1.0+ (2019) | WAL-based guarantees, no polling overhead, transactional consistency |
| Custom BigQuery merge scripts | BigQuery Storage Write API with native CDC | BigQuery CDC GA (2023) | Automatic UPSERT/DELETE handling, lower cost, simpler architecture |
| Flink DataStream API for CDC | Flink Table API with Debezium format | Flink 1.13+ (2021) | Declarative SQL/Python API, built-in state management, simpler code |
| Confluent Debezium connector (legacy) | Debezium v2 connectors | EOL March 31, 2026 | Performance improvements, better snapshot handling, migration required by 2026 |
| Manual JMX metric collection | Prometheus JMX Exporter | Standard since ~2018 | Automated scraping, Grafana integration, SRE best practices |

**Deprecated/outdated:**
- **Debezium PostgreSQL Connector (Legacy v1)**: Confluent Cloud legacy connectors reach EOL March 31, 2026; migrate to v2
- **Aurora Serverless v1**: Does not support logical replication; use Aurora Serverless v2 or provisioned Aurora for CDC
- **snapshot.mode=exported**: Deprecated in Debezium 2.x; use `when_needed` instead
- **BigQuery Streaming API (legacy)**: Replaced by Storage Write API for CDC workloads; legacy API has higher latency and cost

## Open Questions

Things that couldn't be fully resolved:

1. **BigQuery Storage Write API Python Client Maturity**
   - What we know: BigQuery CDC requires Storage Write API with protobuf format
   - What's unclear: Whether Python client library supports CDC-specific features as robustly as Java client
   - Recommendation: Research BigQuery Python SDK documentation; may require Kafka connector intermediary for capstone

2. **PyFlink Exactly-Once Semantics with BigQuery**
   - What we know: PyFlink supports exactly-once with Kafka sources via Flink checkpointing
   - What's unclear: Whether BigQuery sink supports exactly-once or only at-least-once delivery
   - Recommendation: Default to at-least-once with idempotent operations; document exactly-once as advanced pattern if BigQuery connector supports it

3. **Specific Alerting Thresholds for Capstone Scale**
   - What we know: Production systems monitor lag, error rates, and connector status
   - What's unclear: Appropriate thresholds for low-volume capstone project (e.g., is 10-second lag alert too sensitive?)
   - Recommendation: Provide threshold ranges in checklist (e.g., lag: 5-30 seconds, depending on use case) rather than prescriptive values

4. **Aurora Parameter Group Defaults for Course Labs**
   - What we know: `rds.logical_replication=1` required, need reasonable `max_replication_slots` and `max_wal_senders`
   - What's unclear: Optimal values for multi-student lab environment with shared Aurora instance vs dedicated instances
   - Recommendation: Document both approaches in lab infrastructure design; recommend dedicated Aurora instances for capstone if budget allows

## Sources

### Primary (HIGH confidence)
- [Debezium Outbox Event Router Documentation](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html) - Official SMT configuration and best practices
- [BigQuery Change Data Capture Documentation](https://docs.cloud.google.com/bigquery/docs/change-data-capture) - Official CDC requirements, Storage Write API configuration, limitations
- [Debezium Monitoring Documentation](https://debezium.io/documentation/reference/stable/operations/monitoring.html) - JMX metrics, Prometheus integration
- [Debezium PostgreSQL Connector Documentation](https://debezium.io/documentation/reference/stable/connectors/postgresql.html) - Aurora configuration, replication slots, snapshot modes
- [Apache Flink Debezium Format Documentation](https://nightlies.apache.org/flink/flink-docs-master/docs/connectors/table/formats/debezium/) - PyFlink Table API integration with Debezium

### Secondary (MEDIUM confidence)
- [Capstone Project Design (ScienceDirect 2023)](https://www.sciencedirect.com/science/article/pii/S0950584923000459) - Systematic literature review of software engineering capstone courses 2007-2022
- [Production-Ready Microservices Checklist (GitHub - kgoralski)](https://github.com/kgoralski/microservice-production-readiness-checklist) - Community-vetted production readiness standards
- [Mercari Production Readiness Checklist](https://github.com/mercari/production-readiness-checklist) - Real-world microservices checklist from production company
- [Debezium Production Deployment (Medium - Suchit Gupta)](https://suchit-g.medium.com/debezium-production-deployment-preparation-b12c5b9de767) - Production deployment best practices
- [Modern Data Warehouse Testing Strategy 2026 (QASource)](https://blog.qasource.com/how-to-build-an-end-to-end-data-warehouse-testing-strategy) - End-to-end pipeline validation strategies
- [Data Validation in ETL 2026 (Integrate.io)](https://www.integrate.io/blog/data-validation-etl/) - Data quality testing approaches

### Tertiary (LOW confidence)
- [Capstone Project Rubric (HelpForAssessment)](https://www.helpforassessment.com/blog/capstone-project-rubric/) - General rubric structure (not domain-specific)
- [PyFlink Best Practices (Alibaba Cloud Community)](https://www.alibabacloud.com/blog/everything-you-need-to-know-about-pyflink_599959) - Overview of PyFlink capabilities (publication date unclear)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All components verified via official documentation and current version numbers
- Architecture patterns: HIGH - Debezium and BigQuery patterns from official docs; PyFlink patterns synthesized from official docs but not explicitly validated for Python
- Pedagogical patterns: MEDIUM - Capstone design patterns from academic literature (2007-2022 review) and 2026 course examples, but not CDC-specific
- Production readiness: MEDIUM - Checklist items synthesized from GitHub community standards and official Debezium docs; specific thresholds lack authoritative source
- Assessment rubrics: MEDIUM - General capstone rubric structure from multiple sources, adapted for CDC domain

**Research date:** 2026-02-01
**Valid until:** 2026-04-01 (60 days - relatively stable domain, but Debezium 3.x and BigQuery CDC are active development areas)

**Key gaps requiring validation:**
1. BigQuery Python SDK capabilities for CDC (may require hands-on testing)
2. PyFlink-specific CDC production patterns (documentation emphasizes Java examples)
3. Specific alerting thresholds for low-volume capstone environment
4. Optimal Aurora parameter group values for multi-student lab setup
