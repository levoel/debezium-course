# Phase 7: Module 3 - Production Operations - Research

**Researched:** 2026-02-01
**Domain:** Debezium production operations - JMX metrics, Prometheus/Grafana monitoring, lag alerting, WAL management, connector scaling, disaster recovery
**Confidence:** HIGH

## Summary

This phase creates educational content teaching production-grade Debezium operations. The research reveals that **JMX-based monitoring via Prometheus/Grafana is the standard approach**, with `MilliSecondsBehindSource` as the primary lag metric. The critical insights: (1) Debezium PostgreSQL connector is **fundamentally limited to a single task** due to WAL sequential nature - scaling requires multiple connectors or downstream parallelization; (2) WAL bloat prevention requires a multi-layer defense including `max_slot_wal_keep_size`, heartbeat configuration, and active slot monitoring; (3) Disaster recovery involves backing up Kafka Connect's offset topic and understanding slot recreation behavior.

The monitoring stack is already in place from Phase 4 (Prometheus at localhost:9090, Grafana at localhost:3000, JMX Exporter on Connect port 9404). This module focuses on **interpreting metrics**, **building alerts**, and **operational procedures** rather than infrastructure setup. Key metrics include queue capacity utilization, lag trends, and event throughput per table.

Connector scaling misconception is critical to address: unlike sink connectors, Debezium source connectors for PostgreSQL **cannot use tasks.max > 1** because PostgreSQL streams WAL sequentially. The "task model" lesson should clarify this and teach the actual scaling strategies (multiple connectors, downstream partitioning).

**Primary recommendation:** Structure lessons around operational scenarios: "connector is lagging" -> interpret metrics -> identify root cause -> apply fix. Teach heartbeat configuration (already decided as 10s interval) for Aurora failover detection and WAL slot advancement. Include hands-on labs creating alerts in Grafana and executing DR procedures.

## Standard Stack

The established tools for production Debezium operations:

### Core (Already Deployed)
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Prometheus | latest | Metrics collection from JMX Exporter | Industry standard, PromQL for alerting, 15s scrape (prior decision) |
| Grafana | latest | Visualization and alerting | Debezium official examples use Grafana, provisioning via JSON |
| JMX Exporter | Built into Debezium Connect image | Expose JMX as Prometheus metrics | quay.io/debezium/connect includes exporter on port 9404 |
| Debezium Connect | 2.5.4 | CDC connector (project standard) | Stable, avoids 3.x ARM64 issues noted in Phase 4 |

### Monitoring Extensions (For This Module)
| Tool | Purpose | When to Use |
|------|---------|-------------|
| Grafana Alerting | Alert rules in Grafana | Lag threshold breaches, connector failures |
| PostgreSQL pg_replication_slots | Direct slot monitoring | WAL retention queries, slot health verification |
| kafka-console-consumer | Offset inspection | DR verification, debugging |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Grafana Alerting | Prometheus Alertmanager | Alertmanager adds complexity; Grafana alerting sufficient for course scope |
| JMX Exporter agent | JConsole manual inspection | Agent enables continuous collection; JConsole useful for debugging |
| kafka-console-consumer | kafkacat/kcat | kafkacat more powerful but less common in tutorials |

**No Additional Installation Required:**
Lab infrastructure from Phase 4 already includes:
- Prometheus scraping `connect:9404` (JMX metrics)
- Grafana with provisioned datasource
- Debezium Connect with JMX enabled (JMXPORT=9404)

## Architecture Patterns

### Recommended Content Structure
```
src/content/course/03-module-3/
├── 01-jmx-metrics-interpretation.mdx      # MOD3-01: JMX metrics deep dive
├── 02-prometheus-metrics-collection.mdx   # MOD3-02: Prometheus scraping config
├── 03-grafana-dashboard-lab.mdx           # MOD3-03: Dashboard building
├── 04-lag-detection-alerting.mdx          # MOD3-04: MilliSecondsBehindSource alerting
├── 05-wal-bloat-heartbeat.mdx             # MOD3-05: WAL management strategies
├── 06-connector-scaling-tasks.mdx         # MOD3-06: Task model truth vs myth
├── 07-disaster-recovery-procedures.mdx    # MOD3-07: Offset backup/restore
```

### Pattern 1: JMX Metrics Interpretation Framework
**What:** Systematic approach to reading Debezium metrics
**When to use:** Teaching metrics interpretation (MOD3-01)
**Key Metrics:**
```
# Streaming Metrics (debezium.streaming context)
MilliSecondsBehindSource          # Lag in ms - PRIMARY alert metric
TotalNumberOfEventsSeen           # Cumulative event counter
NumberOfCommittedTransactions     # Transaction throughput
QueueTotalCapacity               # Internal queue size (default 8192)
QueueRemainingCapacity           # Available queue slots
MilliSecondsSinceLastEvent       # Time since last event - staleness indicator
Connected                         # Boolean - database connection status

# Snapshot Metrics (debezium.snapshot context)
RowsScanned                       # Progress during snapshot
TotalTableCount                   # Tables to snapshot
RemainingTableCount              # Remaining tables
SnapshotCompleted                # Boolean - snapshot done
SnapshotDurationInSeconds        # Elapsed time
```

**Prometheus Query Examples:**
```promql
# Source: Debezium monitoring documentation
# https://debezium.io/documentation/reference/stable/operations/monitoring.html

# Current lag in milliseconds
debezium_metrics_MilliSecondsBehindSource{connector="inventory-connector"}

# Queue utilization percentage
100 * (1 - (debezium_metrics_QueueRemainingCapacity / debezium_metrics_QueueTotalCapacity))

# Events per second (rate over 5 minutes)
rate(debezium_metrics_TotalNumberOfEventsSeen{connector="inventory-connector"}[5m])

# Detect stale connector (no events in 30 seconds)
debezium_metrics_MilliSecondsSinceLastEvent > 30000
```

### Pattern 2: Lag Detection and Alerting Strategy
**What:** Alert hierarchy for CDC pipeline health
**When to use:** Teaching alerting (MOD3-04)
**Example Grafana Alert Rules:**
```yaml
# Source: Production CDC monitoring best practices
# https://www.sderosiaux.com/articles/2020/01/06/learnings-from-using-kafka-connect-debezium-postgresql/

# Warning: Lag > 5 seconds (investigate)
- name: CDC Lag Warning
  condition: debezium_metrics_MilliSecondsBehindSource > 5000
  for: 2m
  severity: warning
  annotations:
    summary: "CDC lag exceeding 5s for {{ $labels.connector }}"

# Critical: Lag > 30 seconds (SLO breach)
- name: CDC Lag Critical
  condition: debezium_metrics_MilliSecondsBehindSource > 30000
  for: 5m
  severity: critical
  annotations:
    summary: "CDC SLO breach - lag {{ $value }}ms for {{ $labels.connector }}"

# Error: Connector disconnected
- name: CDC Connector Disconnected
  condition: debezium_metrics_Connected == 0
  for: 1m
  severity: critical
  annotations:
    summary: "Connector {{ $labels.connector }} lost database connection"

# Warning: Queue saturation (backpressure)
- name: CDC Queue Near Full
  condition: (debezium_metrics_QueueRemainingCapacity / debezium_metrics_QueueTotalCapacity) < 0.1
  for: 5m
  severity: warning
  annotations:
    summary: "Queue >90% full for {{ $labels.connector }}"
```

### Pattern 3: WAL Bloat Prevention Stack
**What:** Multi-layer defense against disk exhaustion from replication slots
**When to use:** Teaching WAL management (MOD3-05)
**Layers:**
```sql
-- Source: Gunnar Morling's blog on mastering Postgres replication slots
-- https://www.morling.dev/blog/mastering-postgres-replication-slots/

-- Layer 1: PostgreSQL parameter (mandatory for production)
-- Set in postgresql.conf or Aurora parameter group
max_slot_wal_keep_size = 10GB  -- Invalidates slots exceeding this

-- Layer 2: Heartbeat configuration (Debezium connector)
-- Advances slot even when monitored tables have no activity
{
  "heartbeat.interval.ms": "10000",
  "heartbeat.action.query": "SELECT pg_logical_emit_message(false, 'heartbeat', now()::varchar)"
}

-- Layer 3: Monitoring query (run in Prometheus postgres_exporter or cron)
SELECT
    slot_name,
    active,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained_wal,
    wal_status
FROM pg_replication_slots
WHERE slot_type = 'logical';

-- Layer 4: Alert on wal_status
-- wal_status values: 'reserved' (normal), 'extended', 'unreserved', 'lost' (invalidated)
-- Alert if wal_status != 'reserved' or retained_wal > threshold
```

**Teaching Point:** The `pg_logical_emit_message()` function (PostgreSQL 14+) is the modern approach - no dedicated heartbeat table needed. For PostgreSQL 13 and earlier, use the heartbeat table approach:
```sql
CREATE TABLE IF NOT EXISTS heartbeat (id INT PRIMARY KEY, ts TIMESTAMPTZ);
INSERT INTO heartbeat (id, ts) VALUES (1, NOW()) ON CONFLICT (id) DO UPDATE SET ts = NOW();
```

### Pattern 4: Connector Scaling Reality
**What:** Clarify single-task limitation and actual scaling strategies
**When to use:** Teaching task model (MOD3-06)
**Critical Distinction:**
```
# MYTH: "Set tasks.max=4 to scale PostgreSQL connector"
# REALITY: PostgreSQL connector ONLY supports tasks.max=1

# Why: PostgreSQL WAL is sequential. One reader must process events in order.
# Unlike: SQL Server, MongoDB which support multiple tasks (databases/shards)
```

**Actual Scaling Strategies:**
```yaml
# Strategy 1: Multiple connectors for different table sets
# When: Different tables have independent consumers
connector-orders:
  table.include.list: "public.orders,public.order_items"
  topic.prefix: "orders"

connector-inventory:
  table.include.list: "public.products,public.inventory"
  topic.prefix: "inventory"

# Strategy 2: Downstream parallelization
# When: Single table needs parallel processing
# - Debezium writes to Kafka topic with N partitions (via transforms or key routing)
# - N consumer instances process in parallel

# Strategy 3: Performance tuning (single connector)
# When: Maximize single task throughput
{
  "max.queue.size": "16384",      # Double default (8192)
  "max.batch.size": "4096",       # Increase batch (default 2048)
  "poll.interval.ms": "500"       # Reduce poll interval
}
```

**Performance Ceiling:** A single Debezium PostgreSQL connector task can process approximately **7,000 events/second** under optimal conditions. Beyond this, architectural changes are required.

### Pattern 5: Disaster Recovery Procedures
**What:** Offset backup, restoration, and slot recreation
**When to use:** Teaching DR (MOD3-07)
**Offset Backup:**
```bash
# Source: Kafka Connect offset storage documentation
# https://debezium.io/documentation/reference/stable/configuration/storage.html

# Kafka Connect stores offsets in internal topic: connect-offsets
# These must be backed up for DR

# Option 1: Topic backup to file (simple)
kafka-console-consumer \
  --bootstrap-server kafka:9092 \
  --topic connect-offsets \
  --from-beginning \
  --property print.key=true \
  --property key.separator=":::" \
  > offsets-backup-$(date +%Y%m%d).txt

# Option 2: Using kafka-backup tool (comprehensive)
# https://github.com/itadventurer/kafka-backup
# Preserves consumer offsets correctly
```

**Offset Restoration (Kafka Connect 3.6+):**
```bash
# Use REST API for offset management
# https://cwiki.apache.org/confluence/display/KAFKA/KIP-875

# Get current offsets
curl -X GET http://localhost:8083/connectors/inventory-connector/offsets

# Stop connector first
curl -X PUT http://localhost:8083/connectors/inventory-connector/pause

# Modify offsets (reset to specific position)
curl -X PATCH http://localhost:8083/connectors/inventory-connector/offsets \
  -H "Content-Type: application/json" \
  -d '{
    "offsets": [{
      "partition": {"server": "inventory"},
      "offset": {"lsn": "0/1234567"}
    }]
  }'

# Resume connector
curl -X PUT http://localhost:8083/connectors/inventory-connector/resume
```

**Slot Recreation After Failure:**
```sql
-- When connector recreates slot after crash/failover:
-- 1. Old slot may be orphaned (if connector didn't clean up)
-- 2. New slot starts from current WAL position (data loss risk!)

-- Check for orphaned slots
SELECT slot_name, active,
       pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained
FROM pg_replication_slots
WHERE active = false;

-- Manual cleanup (ONLY after confirming connector is permanently removed)
SELECT pg_drop_replication_slot('debezium_inventory');
```

### Anti-Patterns to Avoid
- **Setting tasks.max > 1 for PostgreSQL connector:** No effect; connector always uses 1 task
- **Not setting max_slot_wal_keep_size:** Allows unbounded WAL growth, disk exhaustion
- **Alert on lag without duration:** Brief spikes normal; alert on sustained lag (e.g., >5m)
- **Ignoring queue metrics:** Queue saturation indicates Kafka write bottleneck
- **Deleting slots without stopping connector:** Causes data loss, connector crash
- **No heartbeat on low-traffic databases:** Slot never advances, WAL accumulates

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lag calculation | Custom timestamp diff logic | MilliSecondsBehindSource JMX metric | Debezium calculates correctly from event timestamps |
| Queue monitoring | Custom buffer tracking | QueueTotalCapacity/QueueRemainingCapacity | Built into Debezium, exposed via JMX |
| Slot health check | Custom pg_stat_replication parser | pg_replication_slots + wal_status column | PostgreSQL provides slot status directly |
| Heartbeat for slot advancement | Cron job updating tables | heartbeat.action.query config | Debezium handles timing, error retry |
| Offset backup | Custom Kafka consumer script | kafka-backup tool or REST API | Handles consumer offset preservation correctly |
| Dashboard building | Custom metric aggregation | Official Debezium Grafana dashboards | Tested visualizations, correct PromQL |

**Key insight:** Debezium exposes comprehensive JMX metrics. The challenge is interpretation and alerting thresholds, not metric collection. Focus lessons on "what this metric means" and "when to act" rather than custom monitoring code.

## Common Pitfalls

### Pitfall 1: Misunderstanding MilliSecondsBehindSource
**What goes wrong:** Alert fires constantly, operators ignore it; or lag grows unnoticed
**Why it happens:** MilliSecondsBehindSource is NEVER zero - there's always processing time. Also, metric only updates when events arrive.
**How to avoid:**
1. Set baseline thresholds based on typical lag (e.g., 100-500ms normal)
2. Alert on sustained high lag (>5s for 2 minutes), not instantaneous spikes
3. Combine with MilliSecondsSinceLastEvent to detect "no events" vs "falling behind"
**Warning signs:**
- MilliSecondsBehindSource static for long periods (no events, or metric not updating)
- MilliSecondsSinceLastEvent growing while MilliSecondsBehindSource stays low

### Pitfall 2: Expecting tasks.max to Scale PostgreSQL Connector
**What goes wrong:** Set tasks.max=4, expect 4x throughput, see no improvement
**Why it happens:** PostgreSQL CDC requires sequential WAL reading; connector ignores tasks.max setting
**How to avoid:**
1. Teach the limitation explicitly with WAL architecture explanation
2. Show actual scaling strategies: multiple connectors, downstream parallelism
3. Demonstrate performance tuning: max.queue.size, max.batch.size
**Warning signs:**
- Configuration has tasks.max > 1 for PostgreSQL connector (has no effect)
- Throughput plateau despite adding Kafka Connect workers

### Pitfall 3: No Heartbeat on Low-Traffic Tables
**What goes wrong:** Replication slot retains weeks of WAL, disk fills, database becomes read-only
**Why it happens:** Slot only advances when Debezium reads events; no events = no advancement
**How to avoid:**
1. Always configure heartbeat.interval.ms (10s recommended for Aurora - prior decision)
2. Use pg_logical_emit_message() for table-less heartbeat (PostgreSQL 14+)
3. Monitor retained_wal per slot, alert at thresholds
**Warning signs:**
- pg_replication_slots shows inactive=false but large retained_wal
- TransactionLogsDiskUsage CloudWatch metric growing (Aurora)
- PostgreSQL logs: "no space left on device"

### Pitfall 4: Alert on Instantaneous Metrics
**What goes wrong:** PagerDuty storms from brief lag spikes during bulk operations
**Why it happens:** Bulk INSERT/UPDATE causes temporary lag; without "for" duration, every spike alerts
**How to avoid:**
1. Use Grafana "for" clause: condition must be true for duration before firing
2. Separate warning (2m) from critical (5m) durations
3. Adjust thresholds during known batch windows (or use silencing)
**Warning signs:**
- Multiple alert/resolve cycles in short period
- Operators ignoring alerts due to noise
- Lag alerts during nightly ETL jobs

### Pitfall 5: DR Without Testing Offset Restoration
**What goes wrong:** Disaster occurs, team attempts recovery, discovers offset backup corrupt or unusable
**Why it happens:** Kafka Connect offset format is complex; simple kafka-console-consumer may miss consumer group offsets
**How to avoid:**
1. Practice DR regularly in staging environment
2. Verify backup by restoring to test cluster
3. Document step-by-step runbook with actual commands
4. Consider kafka-backup tool for comprehensive backup
**Warning signs:**
- No DR runbook exists
- Last DR test was "never" or "6+ months ago"
- Team unsure where offsets are stored

### Pitfall 6: Ignoring Queue Saturation
**What goes wrong:** Connector appears healthy (Connected=true) but events delayed; eventually OOM or stuck
**Why it happens:** Internal queue full, Debezium blocks reading from WAL, backpressure builds
**How to avoid:**
1. Monitor QueueRemainingCapacity, alert when <10% of QueueTotalCapacity
2. If frequently saturated: increase max.queue.size OR investigate Kafka write latency
3. Check Kafka producer metrics for broker throttling
**Warning signs:**
- QueueRemainingCapacity near zero for extended periods
- MilliSecondsBehindSource growing while throughput stays constant
- JVM heap usage high on Connect container

## Code Examples

Verified patterns from official sources:

### JMX Exporter Configuration for Debezium
```yaml
# Source: Debezium examples repository
# https://github.com/debezium/debezium-examples/blob/main/monitoring/debezium-jmx-exporter/config.yml

startDelaySeconds: 0
ssl: false
lowercaseOutputName: false
lowercaseOutputLabelNames: false

rules:
  # Kafka Connect Worker metrics
  - pattern: "kafka.connect<type=connect-worker-metrics>([^:]+):"
    name: "kafka_connect_worker_$1"

  # Kafka Connect Source Task metrics
  - pattern: "kafka.connect<type=source-task-metrics, connector=([^,]+), task=([^>]+)><>([^:]+)"
    name: "kafka_connect_source_task_$3"
    labels:
      connector: "$1"
      task: "$2"

  # Debezium Streaming metrics
  - pattern: "debezium.([^:]+)<type=connector-metrics, context=([^,]+), server=([^>]+)><>([^:]+)"
    name: "debezium_metrics_$4"
    labels:
      plugin: "$1"
      context: "$2"
      server: "$3"

  # Debezium Streaming metrics per table (Debezium 3.0+)
  - pattern: "debezium.([^:]+)<type=connector-metrics, context=([^,]+), server=([^,]+), table=([^>]+)><>([^:]+)"
    name: "debezium_metrics_$5"
    labels:
      plugin: "$1"
      context: "$2"
      server: "$3"
      table: "$4"
```

### Grafana Alert Rule for Lag SLO
```json
{
  "alert": {
    "name": "CDC Lag SLO Breach",
    "conditions": [
      {
        "evaluator": {
          "type": "gt",
          "params": [30000]
        },
        "operator": {
          "type": "and"
        },
        "query": {
          "params": ["A", "5m", "now"]
        },
        "reducer": {
          "type": "avg"
        },
        "type": "query"
      }
    ],
    "executionErrorState": "alerting",
    "for": "5m",
    "frequency": "1m",
    "handler": 1,
    "message": "CDC connector {{ $labels.connector }} lag exceeds 30s SLO. Current: {{ $value }}ms",
    "noDataState": "no_data",
    "notifications": []
  },
  "targets": [
    {
      "expr": "debezium_metrics_MilliSecondsBehindSource{connector=~\"$connector\"}",
      "refId": "A"
    }
  ]
}
```

### PostgreSQL Replication Slot Health Query
```sql
-- Source: PostgreSQL documentation + Gunnar Morling's production recommendations
-- https://www.postgresql.org/docs/15/view-pg-replication-slots.html
-- https://www.morling.dev/blog/mastering-postgres-replication-slots/

-- Comprehensive slot monitoring
SELECT
    slot_name,
    plugin,
    database,
    active,
    restart_lsn,
    confirmed_flush_lsn,
    -- WAL retention metrics
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained_wal,
    pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) AS retained_bytes,
    -- Slot health status (PostgreSQL 14+)
    wal_status,  -- 'reserved', 'extended', 'unreserved', 'lost'
    safe_wal_size,
    -- For identifying problematic slots
    CASE
        WHEN NOT active AND pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) > 1073741824
        THEN 'WARNING: Inactive slot retaining >1GB'
        WHEN wal_status = 'lost'
        THEN 'CRITICAL: Slot invalidated'
        WHEN wal_status != 'reserved'
        THEN 'WARNING: WAL status degraded'
        ELSE 'OK'
    END AS health_status
FROM pg_replication_slots
WHERE slot_type = 'logical'
ORDER BY retained_bytes DESC NULLS LAST;
```

### Heartbeat Configuration (PostgreSQL 14+)
```json
{
  "name": "inventory-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "postgres",
    "database.password": "postgres",
    "database.dbname": "inventory",
    "topic.prefix": "inventory",
    "table.include.list": "public.orders",
    "plugin.name": "pgoutput",

    "heartbeat.interval.ms": "10000",
    "heartbeat.action.query": "SELECT pg_logical_emit_message(false, 'heartbeat', now()::varchar)"
  }
}
```

### Disaster Recovery: Offset Inspection
```bash
#!/bin/bash
# Source: Kafka Connect offset management
# View current connector offsets

CONNECTOR_NAME="inventory-connector"
KAFKA_BOOTSTRAP="localhost:9092"
OFFSETS_TOPIC="connect-offsets"

# List all keys in offset topic
kafka-console-consumer \
  --bootstrap-server $KAFKA_BOOTSTRAP \
  --topic $OFFSETS_TOPIC \
  --from-beginning \
  --property print.key=true \
  --property print.timestamp=true \
  --property key.separator=" | " \
  --timeout-ms 5000 2>/dev/null | \
  grep "$CONNECTOR_NAME"

# Example output:
# CreateTime:1706745600000 | ["inventory-connector",{"server":"inventory"}] | {"lsn":123456789}
```

### Performance Tuning Configuration
```json
{
  "name": "high-throughput-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",

    "max.queue.size": "16384",
    "max.batch.size": "4096",
    "poll.interval.ms": "500",

    "snapshot.fetch.size": "10240",

    "producer.override.batch.size": "131072",
    "producer.override.linger.ms": "10",
    "producer.override.compression.type": "lz4"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Heartbeat table with UPDATE | pg_logical_emit_message() | PostgreSQL 14 (2021) | No table needed, cleaner slot advancement |
| No WAL retention limit | max_slot_wal_keep_size | PostgreSQL 13 (2020) | Automatic protection against disk exhaustion |
| Custom metric scraping | JMX Exporter as Java agent | Debezium 1.0+ | Standard Prometheus integration |
| Per-table metrics disabled | Per-table metrics (opt-in) | Debezium 3.0 (2024) | Granular CREATE/UPDATE/DELETE counts |
| Manual offset manipulation | REST API offset endpoints | Kafka Connect 3.6 (2023) | Safe offset management without topic editing |

**Deprecated/outdated:**
- **Heartbeat table approach:** Still works but pg_logical_emit_message() preferred for PostgreSQL 14+
- **JConsole for production monitoring:** Use Prometheus/Grafana for persistent metrics, alerting
- **kafka-consumer-groups.sh for offset reset:** Use REST API for Connect offsets (safer, documented)

**Current best practices (2026):**
- JMX Exporter on Connect, Prometheus scraping at 15s, Grafana dashboards
- Alert on sustained lag (MilliSecondsBehindSource > threshold for duration)
- max_slot_wal_keep_size mandatory in production
- Heartbeat.interval.ms = 10s for Aurora failover detection (prior decision)
- Regular DR drills including offset restoration
- Per-table metrics enabled for debugging (Debezium 3.0+ with internal.advanced.metrics.enable=true)

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal lag alert thresholds for course exercises**
   - What we know: Production SLOs vary widely (5s to 60s depending on use case)
   - What's unclear: What threshold makes sense for lab exercises?
   - Recommendation: Use 10s warning, 30s critical for exercises; explain these are adjustable per business requirement

2. **Debezium 2.5.4 vs 3.x per-table metrics**
   - What we know: Per-table metrics (events per table) require Debezium 3.0+ with opt-in flag
   - What's unclear: Project uses 2.5.4 for stability; should we mention 3.x features as "coming soon"?
   - Recommendation: Teach with 2.5.4 metrics available; add note about 3.x per-table metrics as future enhancement

3. **Grafana alerting vs Prometheus Alertmanager**
   - What we know: Both work; Alertmanager more powerful for complex routing
   - What's unclear: Is Grafana alerting sufficient for course scope?
   - Recommendation: Use Grafana alerting (simpler, already deployed). Mention Alertmanager for production scaling.

4. **Offset backup frequency recommendation**
   - What we know: Offsets should be backed up for DR
   - What's unclear: How often? What retention? This is business-specific.
   - Recommendation: Teach the mechanism (backup command, restore procedure); let students determine frequency based on their RPO

5. **Aurora-specific CloudWatch metrics vs PostgreSQL queries**
   - What we know: Aurora exposes TransactionLogsDiskUsage, OldestReplicationSlotLag via CloudWatch
   - What's unclear: Exact mapping to pg_replication_slots queries; which is authoritative?
   - Recommendation: Teach PostgreSQL queries first (portable), show Aurora CloudWatch equivalents. Note that both should agree.

## Sources

### Primary (HIGH confidence)
- Debezium Monitoring Documentation - https://debezium.io/documentation/reference/stable/operations/monitoring.html
- Debezium PostgreSQL Connector Documentation - https://debezium.io/documentation/reference/stable/connectors/postgresql.html
- Debezium Examples Repository (monitoring) - https://github.com/debezium/debezium-examples/tree/main/monitoring
- PostgreSQL pg_replication_slots View - https://www.postgresql.org/docs/15/view-pg-replication-slots.html
- Gunnar Morling: Mastering Postgres Replication Slots - https://www.morling.dev/blog/mastering-postgres-replication-slots/
- Debezium Offset Storage Documentation - https://debezium.io/documentation/reference/stable/configuration/storage.html

### Secondary (MEDIUM confidence)
- S. Derosiaux: Learnings from using Kafka Connect - Debezium - PostgreSQL - https://www.sderosiaux.com/articles/2020/01/06/learnings-from-using-kafka-connect-debezium-postgresql/
- AWS Blog: Export JMX metrics from Kafka connectors in MSK Connect - https://aws.amazon.com/blogs/big-data/export-jmx-metrics-from-kafka-connectors-in-amazon-managed-streaming-for-apache-kafka-connect-with-a-custom-plugin/
- The Data Guy: Monitor Debezium MySQL Connector With Prometheus And Grafana - https://thedataguy.in/monitor-debezium-mysql-connector-with-prometheus-and-grafana/
- Debezium Blog: JMX Signaling and Notifications - https://debezium.io/blog/2023/10/05/Debezium-JMX-signaling-and-notifications/
- kafka-backup Tool - https://github.com/itadventurer/kafka-backup

### Tertiary (LOW confidence)
- Medium articles on Debezium disk space issues, lag monitoring (multiple authors)
- Debezium Google Group discussions on performance, metrics interpretation
- Grafana Labs dashboard repository (community contributed dashboards)

## Metadata

**Confidence breakdown:**
- JMX Metrics: HIGH - Official Debezium documentation, JMX Exporter config examples
- Prometheus/Grafana: HIGH - Already deployed in Phase 4, documented patterns
- Lag Alerting: HIGH - Well-documented metric, multiple production references
- WAL Management: HIGH - PostgreSQL official docs, Gunnar Morling's authoritative blog
- Task Model: HIGH - Debezium FAQ explicitly states single-task limitation
- Disaster Recovery: MEDIUM - Offset mechanism documented, but specific procedures vary by deployment
- Alert Thresholds: MEDIUM - Business-dependent, recommendations based on common practices

**Research date:** 2026-02-01
**Valid until:** 2026-04-01 (60 days - stable domain; Debezium 3.x may add features)

**Notes:**
- Lab infrastructure already exists with Prometheus, Grafana, JMX Exporter configured
- 15s Prometheus scrape interval is prior decision from Phase 4
- 10s heartbeat interval is prior decision for Aurora failover detection
- max_slot_wal_keep_size mandatory per Phase 6 research
- Debezium 2.5.4 is project standard (avoids 3.x ARM64 issues)
- Russian explanatory text, English code/config per project standards
- Existing Grafana dashboard in labs/monitoring/grafana/dashboards/debezium-connect.json already has MilliSecondsBehindSource panel - can be extended for this module
