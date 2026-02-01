# Phase 15: Production Operations - Research

**Researched:** 2026-02-01
**Domain:** Debezium MySQL CDC Production Operations (Monitoring, Failover, Incremental Snapshots)
**Confidence:** HIGH

## Summary

Phase 15 focuses on production-ready operational procedures for MySQL CDC with Debezium, specifically covering monitoring binlog lag, executing MySQL/Aurora MySQL failover with GTID mode, and managing incremental snapshots through signal table operations. The standard approach combines three operational pillars: (1) JMX-based metrics exposed through Prometheus/Grafana for real-time monitoring of binlog position, lag, and GTID state, (2) GTID-based failover procedures that enable automatic replica switching without manual position tracking, and (3) incremental snapshot operations triggered via signal tables for on-demand data synchronization.

The research confirms that Debezium 2.5.x provides comprehensive production monitoring through JMX metrics including `MilliSecondsBehindSource`, `SecondsBehindMaster`, `BinlogPosition`, and `IsGtidModeEnabled`. Aurora MySQL adds CloudWatch metric `AuroraBinlogReplicaLag` for cross-region replication monitoring. For failover scenarios, GTID mode (`gtid_mode=ON` or `ON_PERMISSIVE`) is mandatory for production Aurora deployments, as it enables the connector to automatically locate its position on a new replica after primary failure. Incremental snapshots use a three-column signal table (`id`, `type`, `data`) and can be triggered via SQL INSERT statements, with read-only incremental snapshots available for replica environments using GTID-based watermarks instead of database writes.

**Primary recommendation:** Implement a three-tier monitoring strategy: (1) JMX metrics via Prometheus/Grafana for connector health (lag, position, events), (2) Aurora CloudWatch metrics for infrastructure-level binlog monitoring (AuroraBinlogReplicaLag, ChangeLogBytesUsed), and (3) Debezium signal table for operational commands (incremental snapshots, log signals). Combine with GTID-mandatory configuration for Aurora production deployments to ensure automatic failover capability.

## Standard Stack

The established tools for Debezium MySQL CDC production operations:

### Core
| Library/Tool | Version | Purpose | Why Standard |
|--------------|---------|---------|--------------|
| Debezium MySQL Connector | 2.5.x | MySQL CDC connector | Target version for Java 21 ARM64 compatibility |
| JMX Prometheus Exporter | 0.19.0+ | JMX-to-Prometheus bridge | Industry standard for exposing JMX metrics to Prometheus |
| Prometheus | Latest stable | Metrics collection | De facto standard for time-series monitoring in Kafka ecosystems |
| Grafana | 9.3.6+ | Metrics visualization | Standard dashboard solution, official Debezium dashboards available |
| Aurora MySQL | 2.10+ / 3.x | Database platform | Production environment with enhanced binlog support |

### Supporting
| Library/Tool | Version | Purpose | When to Use |
|--------------|---------|---------|-------------|
| CloudWatch | AWS native | Aurora-specific metrics | Monitor AuroraBinlogReplicaLag, ChangeLog* metrics for Aurora deployments |
| Debezium Signal Table | 2.5.x native | Operational commands | Trigger incremental snapshots, control connector behavior |
| MySQL GTID | MySQL 5.7+ / Aurora 2.x+ | Position-independent replication | Required for production failover scenarios |
| Heartbeat Events | Debezium 2.5.x | Idle table protection | Prevent offset drift on low-activity tables (already established in Phase 12-14) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| JMX Prometheus Exporter | CloudWatch custom metrics | CloudWatch adds cost and AWS lock-in; JMX exporter free and portable |
| Signal Table (database) | Kafka Signal Channel | Kafka signal channel available in 2.3+, but signal table is simpler for MySQL-centric ops |
| Grafana Dashboards | CloudWatch Dashboards | Grafana provides richer Debezium-specific dashboards and cross-cloud support |

**Installation:**
```bash
# Download JMX Prometheus Exporter (Kafka Connect environment)
wget https://repo1.maven.org/maven2/io/prometheus/jmx/jmx_prometheus_javaagent/0.19.0/jmx_prometheus_javaagent-0.19.0.jar -O /opt/kafka/jmx_prometheus_javaagent.jar

# No npm installation - infrastructure already exists from Module 3 (Prometheus/Grafana from v1.0)
# Grafana dashboard import from: https://grafana.com/grafana/dashboards/11523-mysql-connector/
```

## Architecture Patterns

### Recommended Operational Structure
```
production-operations/
├── monitoring/
│   ├── jmx-exporter-config.yaml      # JMX metrics configuration
│   ├── prometheus-rules.yaml          # Alert rules for lag, disconnects, errors
│   └── grafana-dashboards/
│       └── debezium-mysql.json        # Dashboard ID 11523 or custom
├── failover/
│   ├── failover-procedure.md          # Step-by-step GTID failover runbook
│   ├── gtid-validation.sql            # Scripts to verify GTID mode and sources
│   └── recovery-playbook.md           # Connector restart procedures
└── snapshots/
    ├── signal-table-ddl.sql           # CREATE TABLE debezium_signal
    ├── incremental-snapshot-examples.sql  # Sample INSERT statements
    └── snapshot-monitoring-queries.sql    # Progress tracking queries
```

### Pattern 1: Three-Tier Monitoring Architecture
**What:** Layered monitoring combining JMX metrics (connector health), CloudWatch metrics (Aurora infrastructure), and operational signals (control plane)

**When to use:** All production Debezium MySQL deployments, especially Aurora

**Example:**
```yaml
# jmx-exporter-config.yaml (Prometheus JMX Exporter configuration)
# Source: https://github.com/debezium/debezium-examples/blob/main/monitoring/
---
lowercaseOutputName: true
lowercaseOutputLabelNames: true
whitelistObjectNames:
  - "debezium.mysql:type=connector-metrics,context=*,server=*,key=*"
  - "debezium.mysql:type=connector-metrics,context=streaming,server=*"
  - "debezium.mysql:type=connector-metrics,context=snapshot,server=*"
  - "debezium.mysql:type=connector-metrics,context=schema-history,server=*"
```

```yaml
# prometheus-rules.yaml (Alert rules)
# Source: Community best practices, verified with Debezium monitoring docs
groups:
  - name: debezium_mysql_alerts
    interval: 30s
    rules:
      - alert: DebeziumHighBinlogLag
        expr: debezium_metrics_MilliSecondsBehindSource > 60000  # 1 minute
        for: 5m
        annotations:
          summary: "Debezium connector lagging >1 min behind source"

      - alert: DebeziumConnectorDisconnected
        expr: debezium_metrics_Connected == 0
        for: 2m
        annotations:
          summary: "Debezium connector disconnected from MySQL"

      - alert: AuroraBinlogLagHigh
        expr: aws_aurora_binlog_replica_lag_seconds > 300  # 5 minutes
        for: 5m
        annotations:
          summary: "Aurora binlog replication lagging >5 min"
```

### Pattern 2: GTID-Based Failover Procedure
**What:** Standardized failover procedure for Aurora MySQL primary failure using GTID mode for position preservation

**When to use:** Any Aurora MySQL production deployment with multi-AZ or cross-region replication

**Example:**
```sql
-- Pre-failover validation (run on current primary before planned failover)
-- Source: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-replication-gtid.html

-- 1. Verify GTID mode is enabled
SHOW VARIABLES LIKE 'gtid_mode';
-- Expected: ON or ON_PERMISSIVE

SHOW VARIABLES LIKE 'enforce_gtid_consistency';
-- Expected: ON

-- 2. Check current GTID executed set
SHOW MASTER STATUS;
-- Record the Executed_Gtid_Set value

-- 3. Verify connector's last known position (from Kafka Connect offset storage)
-- Compare with database GTID set to ensure no gap
```

```bash
# Failover procedure (Aurora automatic failover scenario)
# Source: Debezium MySQL connector docs + AWS Aurora GTID best practices

# Step 1: Aurora performs automatic failover (1-2 minutes)
# Writer instance switches to highest-priority reader
# No manual intervention needed for Aurora cluster failover

# Step 2: Debezium connector auto-reconnects (if GTID enabled)
# Connector finds position using GTID set from Kafka Connect offsets
# Verifies new replica has all transactions from Executed_Gtid_Set

# Step 3: Monitor connector recovery
curl -s http://localhost:8083/connectors/mysql-connector/status | jq '.connector.state'
# Expected: "RUNNING" within 2-5 minutes

# Step 4: Verify lag metrics
curl -s http://localhost:9090/api/v1/query?query=debezium_metrics_MilliSecondsBehindSource
# Should return to <1000ms within 5-10 minutes depending on backlog
```

**Connector configuration for GTID failover:**
```json
{
  "name": "mysql-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "aurora-cluster-endpoint.region.rds.amazonaws.com",
    "database.server.id": "184000",
    "database.server.name": "mysql_source",

    "gtid.source.includes": ".*",
    "gtid.source.excludes": "",

    "snapshot.mode": "when_needed",

    "heartbeat.interval.ms": "10000",
    "heartbeat.action.query": "INSERT INTO heartbeat_table (ts) VALUES (NOW())"
  }
}
```

### Pattern 3: Incremental Snapshot Signal Table Operations
**What:** Signal table-based incremental snapshot triggering for on-demand data synchronization without connector restart

**When to use:** Adding new tables to capture list, recovering from extended downtime, re-syncing specific tables after data issues

**Example:**
```sql
-- Signal table DDL
-- Source: https://debezium.io/documentation/reference/stable/configuration/signalling.html

CREATE TABLE debezium_signal (
  id VARCHAR(42) PRIMARY KEY,
  type VARCHAR(32) NOT NULL,
  data VARCHAR(2048) NULL
);

-- Grant permissions (if using separate Debezium user)
GRANT INSERT, SELECT, UPDATE, DELETE ON debezium_signal TO 'debezium_user'@'%';
```

```sql
-- Trigger incremental snapshot for specific tables
-- Source: https://debezium.io/documentation/reference/2.5/connectors/mysql.html#mysql-incremental-snapshots

INSERT INTO debezium_signal (id, type, data)
VALUES (
  'snapshot-001',  -- Unique identifier for tracking
  'execute-snapshot',
  '{"data-collections": ["inventory.products", "inventory.orders"], "type": "incremental"}'
);

-- Trigger incremental snapshot with filtering
INSERT INTO debezium_signal (id, type, data)
VALUES (
  'snapshot-002',
  'execute-snapshot',
  '{"data-collections": ["inventory.customers"], "type": "incremental", "additional-conditions": [{"data-collection": "inventory.customers", "filter": "region=''US''"}]}'
);

-- Stop in-progress snapshot
INSERT INTO debezium_signal (id, type, data)
VALUES (
  'snapshot-stop-001',
  'stop-snapshot',
  '{"data-collections": ["inventory.products"], "type": "incremental"}'
);
```

**Connector configuration for signal table:**
```json
{
  "name": "mysql-connector",
  "config": {
    "signal.data.collection": "inventory.debezium_signal",
    "incremental.snapshot.chunk.size": "2048",
    "snapshot.mode": "initial"
  }
}
```

### Pattern 4: Read-Only Incremental Snapshots (Aurora Read Replicas)
**What:** GTID-based incremental snapshots for read replica environments without write access to signal table

**When to use:** Reading CDC from Aurora read replicas, production environments with strict read-only policies

**Example:**
```json
{
  "name": "mysql-reader-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "aurora-reader-endpoint.region.rds.amazonaws.com",
    "read.only": "true",

    "signal.kafka.topic": "debezium-signals",
    "signal.kafka.bootstrap.servers": "kafka:9092",

    "gtid.source.includes": ".*"
  }
}
```

```bash
# Trigger incremental snapshot via Kafka topic (instead of database signal table)
# Source: https://debezium.io/blog/2022/04/07/read-only-incremental-snapshots/

echo '{"type":"execute-snapshot","data":{"data-collections":["inventory.products"],"type":"incremental"}}' | \
  kafka-console-producer --broker-list kafka:9092 --topic debezium-signals
```

### Anti-Patterns to Avoid
- **Manual binlog position tracking**: Never manually set binlog filename/position in GTID-enabled environments. Use GTID automatic positioning.
- **Ignoring heartbeat configuration**: Without `heartbeat.interval.ms`, idle tables can cause connector lag detection issues and delayed failure detection.
- **Signal table without monitoring**: Signal operations are asynchronous. Always monitor snapshot progress via JMX metrics (`debezium_metrics_SnapshotRunning`, `debezium_metrics_SnapshotCompleted`).
- **Binlog retention < 72 hours**: Production CDC requires minimum 72-hour retention (preferably 7 days) to recover from extended connector downtime.
- **Single-layer monitoring**: Relying only on JMX or only on CloudWatch. Aurora-specific issues may not surface in JMX metrics (e.g., binlog disk pressure).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JMX metric collection | Custom Java agent or REST wrapper | JMX Prometheus Exporter (jmx_prometheus_javaagent) | Handles metric naming, label conversion, type mapping; battle-tested with Kafka ecosystem |
| Binlog lag calculation | Custom queries comparing binlog positions | Debezium JMX metrics: `MilliSecondsBehindSource`, `SecondsBehindMaster` | Debezium already tracks replication lag accurately; handles GTID and position-based modes |
| Incremental snapshot scheduling | Custom cron jobs running full table scans | Debezium signal table with `execute-snapshot` | Chunk-based processing, resume capability, no duplicate events, integrated with offset tracking |
| Failover automation | Custom scripts parsing SHOW MASTER STATUS and updating offsets | GTID mode (`gtid_mode=ON`) with `gtid.source.includes` | Automatic position resolution across replicas; no manual intervention needed |
| Grafana dashboards for Debezium | Custom panels and queries from scratch | Official Debezium Grafana dashboard (ID 11523) | Pre-configured panels for binlog metrics, snapshot progress, lag, errors; community-maintained |
| Aurora binlog monitoring | Custom CloudWatch queries | AuroraBinlogReplicaLag CloudWatch metric | Native Aurora metric; tracks Seconds_Behind_Master accurately for cross-region/blue-green scenarios |

**Key insight:** Debezium production operations have mature, battle-tested tooling. The complexity lies in metric semantics (e.g., distinguishing `MilliSecondsBehindSource` from `SecondsBehindMaster`), GTID source filtering for multi-primary topologies, and snapshot chunk sizing for large tables. Custom solutions miss these edge cases and fail under production load or failover scenarios.

## Common Pitfalls

### Pitfall 1: Misinterpreting `SecondsBehindMaster` in Multi-Primary Scenarios
**What goes wrong:** Connector reports -1 for `SecondsBehindMaster` during failover or when replica is promoting to primary, causing false alarms in monitoring.

**Why it happens:** `SecondsBehindMaster` metric reflects MySQL's `SHOW SLAVE STATUS` output. During failover or when reading from a new primary, MySQL temporarily returns -1 until replication state stabilizes. This is NOT a connector error.

**How to avoid:**
- Use `MilliSecondsBehindSource` as primary lag metric (more reliable, calculated by Debezium internally)
- Configure alerts with 2-5 minute grace period before firing
- Add alert suppression during planned failover windows

**Warning signs:**
- Alert storm during Aurora automatic failover events
- Lag metric oscillating between valid values and -1
- `Connected=0` followed by `SecondsBehindMaster=-1` in metrics

### Pitfall 2: Signal Table Without Primary Key or Incorrect Schema
**What goes wrong:** Signal INSERT succeeds but connector never processes the signal; incremental snapshot doesn't start.

**Why it happens:** Debezium requires exact schema: `id VARCHAR PRIMARY KEY`, `type VARCHAR`, `data VARCHAR`. Missing primary key or wrong column types cause silent failures. Additionally, if signal table is in a schema not included in `database.include.list`, connector won't capture signals.

**How to avoid:**
- Use exact DDL from Debezium documentation (VARCHAR sizes can vary but types must match)
- Ensure signal table schema is in `database.include.list` or use fully-qualified name in `signal.data.collection`
- Test signal processing with `log` signal type before production use:
  ```sql
  INSERT INTO debezium_signal (id, type, data) VALUES ('test-001', 'log', '{"message": "Signal test"}');
  ```
- Monitor connector logs for signal processing confirmations

**Warning signs:**
- Signal INSERTs succeed but no snapshot activity in JMX metrics
- Connector logs show no mention of signal processing
- `debezium_metrics_SnapshotRunning=0` despite sending `execute-snapshot` signal

### Pitfall 3: Insufficient Binlog Retention for Incremental Snapshot Duration
**What goes wrong:** Incremental snapshot starts successfully but fails midway with "binlog position no longer available" error. Large tables (>10M rows) take hours to snapshot; if binlog retention is 24 hours and snapshot takes 6 hours, active CDC events during snapshot can push oldest binlog past retention.

**Why it happens:** Incremental snapshots run in parallel with streaming. If snapshot takes longer than binlog retention window, connector's streaming position (needed for incremental snapshot deduplication) gets purged.

**How to avoid:**
- Set Aurora binlog retention to minimum 7 days for production (168 hours):
  ```sql
  CALL mysql.rds_set_configuration('binlog retention hours', 168);
  ```
- Calculate expected snapshot duration: `(table_rows / incremental.snapshot.chunk.size) * avg_chunk_query_time`
- For very large tables (>100M rows), consider increasing `incremental.snapshot.chunk.size` to 4096-8192 to reduce total snapshot time
- Monitor `ChangeLogBytesUsed` CloudWatch metric during snapshot to ensure binlog disk space

**Warning signs:**
- Connector fails with "Cannot replicate because the master purged required binary logs" during incremental snapshot
- `ChangeLogBytesUsed` CloudWatch metric approaching cluster storage limits
- Snapshots consistently fail on large tables but succeed on small tables

### Pitfall 4: GTID Source Filtering Misconfiguration in Multi-Region Aurora
**What goes wrong:** After failover to cross-region replica, connector restarts but reports "GTID set doesn't match" or replicates duplicate events.

**Why it happens:** Aurora Global Database uses separate GTID source UUIDs for primary region and secondary region. If `gtid.source.includes` is too restrictive (e.g., only primary region UUID), connector can't find position on secondary after failover. If `gtid.source.excludes` is too broad, connector may include non-CDC transactions.

**How to avoid:**
- For Aurora Global Database, use `gtid.source.includes: ".*"` (match all sources) unless you have specific multi-primary topology
- If using `gtid.source.includes` with specific UUIDs, include ALL potential primary UUIDs (primary region + all secondary regions)
- Verify GTID sources before failover:
  ```sql
  -- On primary region
  SELECT @@server_uuid;
  -- On secondary region
  SELECT @@server_uuid;
  ```
- Test failover in staging environment with same GTID source configuration

**Warning signs:**
- Connector fails to start after cross-region failover with GTID-related errors
- Duplicate events in Kafka topics after failover (indicates GTID position reset)
- `IsGtidModeEnabled=1` but connector logs show "falling back to binlog position" warnings

### Pitfall 5: Read-Only Incremental Snapshot Without GTID Prerequisites
**What goes wrong:** Setting `read.only=true` but connector fails with "Cannot execute snapshot without write access" even though GTID is supposedly enabled.

**Why it happens:** Read-only incremental snapshots require three prerequisites: `gtid_mode=ON`, `enforce_gtid_consistency=ON`, AND `replica_preserve_commit_order=ON` (if `replica_parallel_workers > 0`). Missing any one of these causes fallback to standard incremental snapshot which requires write access.

**How to avoid:**
- Verify ALL three GTID prerequisites on Aurora reader instance:
  ```sql
  SHOW VARIABLES LIKE 'gtid_mode';                      -- Must be ON
  SHOW VARIABLES LIKE 'enforce_gtid_consistency';       -- Must be ON
  SHOW VARIABLES LIKE 'replica_preserve_commit_order';  -- Must be ON if replica_parallel_workers > 0
  SHOW VARIABLES LIKE 'replica_parallel_workers';       -- Check if > 0
  ```
- For Aurora, these are DB Cluster Parameter Group settings (not instance-level)
- Use Kafka signal channel (`signal.kafka.topic`) instead of signal table for read-only environments
- Test on reader endpoint, not cluster endpoint (cluster endpoint may route to writer)

**Warning signs:**
- Connector logs show "GTID mode not fully enabled" despite `gtid_mode=ON`
- Read-only snapshot fails with write permission errors
- `read.only=true` connector works on writer but fails on reader with same config

### Pitfall 6: Heartbeat Interval Too High for Idle Table Detection
**What goes wrong:** Connector appears healthy (`Connected=1`) but has actually lost connection to MySQL. Discovery happens hours later when manual verification shows no recent events despite database changes.

**Why it happens:** Default `heartbeat.interval.ms` may be too high (or disabled). Without regular heartbeat events, idle tables don't generate change events, so connector can be disconnected but Kafka Connect reports it as running. Network partitions or stale MySQL connections go undetected.

**How to avoid:**
- Set `heartbeat.interval.ms` to 10000 (10 seconds) for production
- Configure `heartbeat.action.query` to generate detectable events:
  ```json
  {
    "heartbeat.interval.ms": "10000",
    "heartbeat.action.query": "INSERT INTO heartbeat_table (ts, connector_id) VALUES (NOW(), '${database.server.id}')"
  }
  ```
- Monitor `debezium_metrics_SecondsSinceLastEvent` - alert if > 60 seconds
- Use Prometheus alert rule:
  ```yaml
  - alert: DebeziumNoRecentEvents
    expr: debezium_metrics_SecondsSinceLastEvent > 60
    for: 2m
  ```

**Warning signs:**
- `Connected=1` but `SecondsSinceLastEvent` increasing unbounded
- No change events in Kafka topics despite known database activity
- Connector restart suddenly floods Kafka with backlog of hours of events

## Code Examples

Verified patterns from official sources:

### Complete Monitoring Stack Setup
```yaml
# docker-compose.yml excerpt for JMX Prometheus Exporter
# Source: https://github.com/debezium/debezium-examples/blob/main/monitoring/

services:
  kafka-connect:
    image: debezium/connect:2.5
    environment:
      # Enable JMX
      KAFKA_JMX_OPTS: "-Dcom.sun.management.jmxremote=true
                       -Dcom.sun.management.jmxremote.authenticate=false
                       -Dcom.sun.management.jmxremote.ssl=false
                       -Djava.rmi.server.hostname=kafka-connect
                       -Dcom.sun.management.jmxremote.port=9999
                       -Dcom.sun.management.jmxremote.rmi.port=9999"

      # Enable Prometheus JMX Exporter
      KAFKA_OPTS: "-javaagent:/opt/kafka/jmx_prometheus_javaagent.jar=8080:/opt/kafka/jmx-exporter-config.yaml"

    volumes:
      - ./jmx_prometheus_javaagent.jar:/opt/kafka/jmx_prometheus_javaagent.jar
      - ./jmx-exporter-config.yaml:/opt/kafka/jmx-exporter-config.yaml
    ports:
      - "8080:8080"  # Prometheus metrics endpoint
      - "9999:9999"  # JMX port
```

```yaml
# prometheus.yml excerpt
# Source: https://github.com/debezium/debezium-examples/blob/main/monitoring/

scrape_configs:
  - job_name: 'kafka-connect'
    static_configs:
      - targets: ['kafka-connect:8080']
    scrape_interval: 15s
    scrape_timeout: 10s
```

### Grafana Dashboard Query Examples
```promql
# Binlog lag in milliseconds
# Source: https://grafana.com/grafana/dashboards/11523-mysql-connector/
debezium_metrics_MilliSecondsBehindSource{context="streaming"}

# Number of events filtered (excluded from capture)
debezium_metrics_NumberOfEventsFiltered{context="streaming"}

# Current binlog position
debezium_metrics_BinlogPosition{context="streaming"}

# GTID mode enabled status
debezium_metrics_IsGtidModeEnabled{context="streaming"}

# Snapshot running status
debezium_metrics_SnapshotRunning{context="snapshot"}

# Queue remaining capacity (backpressure indicator)
debezium_metrics_QueueRemainingCapacity{context="streaming"}
```

### Aurora MySQL GTID Configuration (DB Cluster Parameter Group)
```sql
-- Verify current GTID configuration
-- Source: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-replication-gtid.html

SELECT
  @@gtid_mode AS gtid_mode,
  @@enforce_gtid_consistency AS enforce_gtid_consistency,
  @@replica_preserve_commit_order AS replica_preserve_commit_order,
  @@replica_parallel_workers AS replica_parallel_workers,
  @@server_uuid AS server_uuid;

-- Expected output for production CDC:
-- gtid_mode: ON or ON_PERMISSIVE
-- enforce_gtid_consistency: ON
-- replica_preserve_commit_order: ON (if replica_parallel_workers > 0)
-- server_uuid: unique per instance
```

```bash
# AWS CLI: Modify DB Cluster Parameter Group for GTID
# Source: AWS Aurora GTID best practices

# Create custom parameter group (if not exists)
aws rds create-db-cluster-parameter-group \
  --db-cluster-parameter-group-name aurora-mysql-gtid \
  --db-parameter-group-family aurora-mysql5.7 \
  --description "Aurora MySQL with GTID enabled for CDC"

# Enable GTID mode
aws rds modify-db-cluster-parameter-group \
  --db-cluster-parameter-group-name aurora-mysql-gtid \
  --parameters \
    "ParameterName=gtid_mode,ParameterValue=ON,ApplyMethod=pending-reboot" \
    "ParameterName=enforce_gtid_consistency,ParameterValue=ON,ApplyMethod=pending-reboot"

# Apply parameter group to cluster
aws rds modify-db-cluster \
  --db-cluster-identifier mysql-cluster \
  --db-cluster-parameter-group-name aurora-mysql-gtid \
  --apply-immediately

# Reboot cluster instances (required for GTID mode change)
aws rds reboot-db-instance --db-instance-identifier mysql-cluster-instance-1
```

### Signal Table Operations with Monitoring
```sql
-- Create signal table
-- Source: https://debezium.io/documentation/reference/stable/configuration/signalling.html

CREATE TABLE inventory.debezium_signal (
  id VARCHAR(42) PRIMARY KEY,
  type VARCHAR(32) NOT NULL,
  data VARCHAR(2048) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

GRANT SELECT, INSERT, UPDATE, DELETE ON inventory.debezium_signal TO 'debezium_user'@'%';
```

```sql
-- Trigger incremental snapshot with progress monitoring
-- Source: https://debezium.io/documentation/reference/2.5/connectors/mysql.html#mysql-incremental-snapshots

-- Step 1: Trigger snapshot
INSERT INTO inventory.debezium_signal (id, type, data)
VALUES (
  UUID(),
  'execute-snapshot',
  JSON_OBJECT(
    'data-collections', JSON_ARRAY('inventory.products', 'inventory.orders'),
    'type', 'incremental'
  )
);

-- Step 2: Monitor snapshot progress via JMX metrics (Prometheus query)
-- debezium_metrics_SnapshotRunning == 1 indicates snapshot in progress
-- debezium_metrics_SnapshotCompleted == 1 indicates snapshot finished

-- Step 3: Check for snapshot errors in connector logs
-- docker logs kafka-connect | grep -i snapshot
```

### Failover Runbook (Aurora MySQL Multi-AZ)
```bash
# Production failover procedure with GTID
# Source: Debezium MySQL connector docs + Aurora GTID documentation

# === PRE-FAILOVER VALIDATION ===

# 1. Verify connector is healthy and lag is acceptable
curl -s http://localhost:8083/connectors/mysql-connector/status | jq '{
  connector_state: .connector.state,
  tasks: [.tasks[].state]
}'
# Expected: connector_state="RUNNING", all tasks="RUNNING"

# 2. Check current binlog lag
curl -s http://localhost:9090/api/v1/query?query=debezium_metrics_MilliSecondsBehindSource | \
  jq '.data.result[0].value[1]'
# Expected: <5000 (less than 5 seconds) before planned failover

# 3. Verify GTID mode on primary
mysql -h aurora-cluster.region.rds.amazonaws.com -u admin -p -e "
  SELECT @@gtid_mode, @@enforce_gtid_consistency, @@server_uuid;
"
# Expected: gtid_mode=ON, enforce_gtid_consistency=ON

# === FAILOVER EXECUTION ===

# 4. Trigger Aurora failover (manual or automatic)
aws rds failover-db-cluster --db-cluster-identifier mysql-cluster

# 5. Monitor Aurora failover completion (1-2 minutes)
watch -n 5 'aws rds describe-db-clusters \
  --db-cluster-identifier mysql-cluster \
  --query "DBClusters[0].[Status,Endpoint]" \
  --output table'
# Wait for Status=available

# === POST-FAILOVER VALIDATION ===

# 6. Verify connector auto-reconnected (GTID enables automatic position finding)
sleep 30  # Allow connector to detect failover and reconnect
curl -s http://localhost:8083/connectors/mysql-connector/status | jq '.connector.state'
# Expected: "RUNNING" (connector auto-reconnects to new primary)

# 7. Check GTID continuity (verify new primary has all transactions)
mysql -h aurora-cluster.region.rds.amazonaws.com -u admin -p -e "
  SHOW MASTER STATUS\G
" | grep Executed_Gtid_Set
# Verify Executed_Gtid_Set includes all UUIDs from previous primary

# 8. Monitor lag recovery
for i in {1..12}; do
  curl -s http://localhost:9090/api/v1/query?query=debezium_metrics_MilliSecondsBehindSource | \
    jq -r '.data.result[0].value[1]'
  sleep 10
done
# Expected: Lag returns to <1000ms within 2-5 minutes

# 9. Verify event flow (check recent events in Kafka)
kafka-console-consumer --bootstrap-server kafka:9092 \
  --topic mysql_source.inventory.products \
  --from-latest --max-messages 10 --timeout-ms 30000
# Expected: New change events flowing post-failover
```

### CloudWatch Metrics Integration
```python
# Example: Query Aurora CloudWatch metrics for binlog lag
# Source: AWS CloudWatch SDK + Aurora monitoring best practices

import boto3
from datetime import datetime, timedelta

cloudwatch = boto3.client('cloudwatch', region_name='us-east-1')

# Query AuroraBinlogReplicaLag metric (cross-region replication lag)
response = cloudwatch.get_metric_statistics(
    Namespace='AWS/RDS',
    MetricName='AuroraBinlogReplicaLag',
    Dimensions=[
        {'Name': 'DBClusterIdentifier', 'Value': 'mysql-cluster'}
    ],
    StartTime=datetime.utcnow() - timedelta(hours=1),
    EndTime=datetime.utcnow(),
    Period=300,  # 5-minute intervals
    Statistics=['Average', 'Maximum']
)

# Alert if max lag > 300 seconds (5 minutes)
for datapoint in response['Datapoints']:
    if datapoint['Maximum'] > 300:
        print(f"ALERT: Binlog lag {datapoint['Maximum']}s at {datapoint['Timestamp']}")
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual binlog position tracking (file+position) | GTID-based automatic positioning | Debezium 0.8+ (2018), Aurora GTID support (2019) | Eliminates manual failover intervention; connector auto-finds position on new replica |
| Initial snapshot only (restart connector for new tables) | Incremental snapshots via signal table | Debezium 1.6+ (2021) | On-demand snapshots without connector restart; parallel snapshot+streaming |
| Database signal table only | Kafka signal channel + database signals | Debezium 2.3+ (2023) | Read-only replicas can use Kafka topic for signals; no write access needed |
| Single `SecondsBehindMaster` metric | Dual lag metrics: `MilliSecondsBehindSource` + `SecondsBehindMaster` | Debezium 1.4+ (2020) | More accurate lag measurement; `MilliSecondsBehindSource` calculated by Debezium, not MySQL |
| 24-hour binlog retention default | 7-90 day retention for CDC workloads | Aurora 2.11+ (90 days), best practices evolved 2020-2023 | Supports longer connector downtime recovery; incremental snapshots for large tables |
| Read-only snapshots impossible | GTID-based read-only incremental snapshots | Debezium 1.9+ (2022) | CDC from read replicas without write permissions; Shopify contribution |

**Deprecated/outdated:**
- **Binlog filename+position in connector configuration**: Use GTID mode instead. Manual position tracking fails during failover and requires precise binlog file availability.
- **`snapshot.mode=initial` for adding tables**: Use incremental snapshots via signal table. Connector restart disrupts streaming and requires full re-snapshot of all tables.
- **CloudWatch-only monitoring for Debezium**: JMX metrics via Prometheus provide richer connector-specific insights (event counts, queue depth, schema changes) not available in CloudWatch.
- **`gtid.source.includes` with single UUID for Aurora Global Database**: Multi-region failover requires matching all source UUIDs. Restrictive filtering breaks cross-region failover.

## Open Questions

Things that couldn't be fully resolved:

1. **ChangeLog* CloudWatch Metrics Availability**
   - What we know: Phase 14 context mentions `ChangeLogBytesUsed`, `ChangeLogReadIOPs`, `ChangeLogWriteIOPs` metrics for Enhanced Binlog monitoring
   - What's unclear: AWS official documentation (Aurora.AuroraMonitoring.Metrics.html) does not list these metrics as standard Aurora MySQL metrics as of 2026-02-01
   - Recommendation: Verify metric availability in target Aurora MySQL version (2.10+ or 3.x) via AWS Console → CloudWatch → RDS metrics. If unavailable, use `BinLogDiskUsage` (confirmed available) as primary binlog storage metric. Consider these may be Aurora 3.x specific or require Enhanced Monitoring enablement.

2. **Debezium 2.5.x vs 3.x Feature Compatibility**
   - What we know: Course uses Debezium 2.5.x for Java 21 ARM64 compatibility. Research uncovered features in Debezium 3.x (2025 releases: 3.1, 3.3, 3.4) with improvements to heartbeat behavior and MySQL monitoring.
   - What's unclear: Whether 2.5.x has feature gaps in incremental snapshots, read-only GTID snapshots, or signal processing compared to 3.x
   - Recommendation: Document that research references 2.5.x stable documentation. If 3.x-specific features are needed, flag for future migration planning. For Phase 15, all core features (JMX metrics, GTID failover, signal table) are confirmed available in 2.5.x.

3. **Prometheus/Grafana Infrastructure from Module 3**
   - What we know: Context states "Course already has Prometheus/Grafana infrastructure from v1.0 (Module 3)"
   - What's unclear: Exact version, configuration, existing dashboards, whether JMX exporter is already configured
   - Recommendation: Phase 15 planning should include discovery step to inventory existing Prometheus/Grafana setup. Tasks may need to extend existing configuration rather than deploy from scratch. If Module 3 covered PostgreSQL CDC monitoring, MySQL-specific JMX exporter config is still needed.

4. **Aurora Reader Instance Manual Reboot Requirement (from Phase 14)**
   - What we know: Phase 14 decision [14-01] states "Manual reader instance reboot required for Aurora 2.10+"
   - What's unclear: Whether this reboot requirement applies to GTID mode enablement (parameter group changes) or only to enhanced binlog configuration
   - Recommendation: Failover runbook should include reboot procedure for DB Cluster Parameter Group changes. Coordinate with AWS RDS maintenance windows for production GTID enablement.

## Sources

### Primary (HIGH confidence)
- Debezium 2.5 MySQL Connector Documentation: https://debezium.io/documentation/reference/2.5/connectors/mysql.html
- Debezium Operations Monitoring: https://debezium.io/documentation/reference/2.5/operations/monitoring.html
- Debezium Signaling Configuration: https://debezium.io/documentation/reference/stable/configuration/signalling.html
- AWS Aurora GTID-Based Replication: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-replication-gtid.html
- AWS Aurora CloudWatch Metrics: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.AuroraMonitoring.Metrics.html
- Debezium Blog: Read-Only Incremental Snapshots: https://debezium.io/blog/2022/04/07/read-only-incremental-snapshots/
- Debezium Blog: Adding New Tables Best Practices: https://debezium.io/blog/2025/10/06/add-new-table-to-capture-list/

### Secondary (MEDIUM confidence)
- Debezium Examples GitHub (monitoring dashboards): https://github.com/debezium/debezium-examples/blob/main/monitoring/debezium-grafana/debezium-mysql-connector-dashboard.json
- Grafana Labs Debezium MySQL Dashboard (ID 11523): https://grafana.com/grafana/dashboards/11523-mysql-connector/
- AWS Blog: JMX Metrics Export from MSK Connect: https://aws.amazon.com/blogs/big-data/export-jmx-metrics-from-kafka-connectors-in-amazon-managed-streaming-for-apache-kafka-connect-with-a-custom-plugin/
- AWS Blog: Aurora MySQL GTID Migration: https://aws.amazon.com/blogs/database/migrating-to-amazon-aurora-mysql-with-fallback-option-using-gtid-based-replication/
- AWS re:Post: Aurora Binlog Retention: https://repost.aws/knowledge-center/aurora-mysql-increase-binlog-retention
- Community Guide: Monitor Debezium MySQL with Prometheus/Grafana: https://thedataguy.in/monitor-debezium-mysql-connector-with-prometheus-and-grafana/

### Tertiary (LOW confidence)
- Medium: Grafana Dashboard for Debezium MySQL Connector: https://medium.com/searce/grafana-dashboard-for-monitoring-debezium-mysql-connector-d5c28acf905b
- BinaryScripts: Handling Database Failures with Debezium: https://binaryscripts.com/debezium/2025/04/27/handling-database-failures-and-recoveries-with-debezium-ensuring-reliable-cdc.html
- Materialize Guide: MySQL CDC with Debezium in Production: https://materialize.com/guides/mysql-cdc/

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - JMX Prometheus Exporter, Prometheus/Grafana, Debezium signal table are industry standard and officially documented
- Architecture: HIGH - Monitoring patterns verified with official Debezium examples repository; GTID failover procedure from AWS Aurora docs; signal table operations from Debezium 2.5 docs
- Pitfalls: MEDIUM - Common issues extracted from Debezium FAQ, GitHub issues, and community guides; some pitfalls based on production experience reports (not firsthand verification)

**Research date:** 2026-02-01
**Valid until:** 2026-04-01 (60 days) - Debezium monitoring APIs and Aurora GTID support are stable; JMX metric names unlikely to change in 2.5.x maintenance releases
