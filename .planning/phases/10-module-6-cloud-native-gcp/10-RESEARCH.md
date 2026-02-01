# Phase 10: Module 6 - Cloud-Native GCP - Research

**Researched:** 2026-02-01
**Domain:** Cloud-native CDC deployment on GCP (Kafka-less architecture)
**Confidence:** MEDIUM-HIGH

## Summary

This module teaches students how to deploy Debezium in a cloud-native, Kafka-less architecture on Google Cloud Platform using Debezium Server with Pub/Sub as the message broker. The standard pattern is: Cloud SQL PostgreSQL (logical decoding enabled) -> Debezium Server (containerized on GKE or Cloud Run) -> Pub/Sub topics -> downstream consumers (Dataflow for BigQuery, Cloud Run for event-driven processing).

The key architectural shift from traditional Debezium deployments is eliminating Kafka/Kafka Connect in favor of Debezium Server (a standalone Quarkus-based application) that publishes change events directly to Pub/Sub. This simplifies infrastructure significantly while maintaining CDC capabilities. GCP provides native integrations through Workload Identity for secure authentication, Dataflow templates for BigQuery replication, and Cloud Monitoring for observability.

Critical success factors include proper Cloud SQL logical replication configuration (cloudsql.logical_decoding flag, replication slot management), Debezium Server offset storage strategy (file-based for single instance, Redis for distributed), Pub/Sub topic naming conventions (prefix.schema.table), and comprehensive monitoring of replication slots to prevent WAL bloat.

**Primary recommendation:** Use Debezium Server 2.5.4 with pgoutput plugin, containerized deployment with persistent offset storage, Workload Identity for GCP authentication, and proactive replication slot monitoring to prevent production incidents.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Debezium Server | 2.5.4 | Standalone CDC engine with Pub/Sub sink | Eliminates Kafka dependency, Quarkus-based, official GCP integration |
| Cloud SQL PostgreSQL | 14/15/16 | Source database with logical replication | Managed service, native logical decoding support, WAL management |
| Google Cloud Pub/Sub | N/A | Message broker for CDC events | GCP-native, serverless, integrates with Dataflow/Cloud Run |
| pgoutput | Built-in | PostgreSQL logical decoding plugin | Native to PostgreSQL 10+, no additional installation, recommended over wal2json (deprecated in 2.5) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Google Cloud Dataflow | Templates v2 | Stream CDC to BigQuery with MERGE/UPSERT | When target is BigQuery, need staging + replica table pattern |
| Cloud Run (2nd gen) | N/A | Event-driven CDC processing | When need custom business logic per change event |
| Workload Identity | N/A | GKE pod to GCP service account binding | When deploying on GKE (recommended over service account keys) |
| Redis | 7.x | Distributed offset storage | When running multiple Debezium Server instances for HA |
| Cloud Monitoring | N/A | Metrics, logs, alerts | All deployments - monitor lag, throughput, errors |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Debezium Server + Pub/Sub | Google Datastream | Datastream is fully managed but costs more ($50/TiB), limited to specific sources (MySQL, Oracle, AlloyDB, SQL Server), no PostgreSQL support |
| Debezium Server | Kafka Connect + Debezium Connector | Traditional Kafka architecture more complex/expensive, better for multi-sink patterns |
| File-based offset storage | Redis offset storage | File requires persistent volumes but simpler; Redis enables HA but adds dependency |
| Dataflow template | Custom Pub/Sub subscriber | Templates handle BigQuery schema DDL automatically, custom code more flexible but more maintenance |

**Installation:**
```bash
# Debezium Server container (official image includes Pub/Sub sink)
docker pull debezium/server:2.5

# GCP CLI for infrastructure
gcloud components install kubectl
gcloud components install pubsub-emulator  # For local testing

# Optional: Redis for distributed offset storage
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis --version 18.x
```

## Architecture Patterns

### Recommended Project Structure
```
gcp-cdc-infrastructure/
├── debezium-server/
│   ├── Dockerfile                    # Custom Debezium Server image
│   ├── application.properties        # Core configuration
│   ├── k8s/
│   │   ├── deployment.yaml          # Kubernetes deployment
│   │   ├── service-account.yaml     # Workload Identity binding
│   │   └── persistent-volume.yaml   # Offset storage (if file-based)
│   └── config/
│       └── cloud-monitoring.yaml    # Custom metrics config
├── cloud-sql/
│   ├── setup-logical-replication.sql
│   └── terraform/
│       └── cloudsql.tf              # IaC for Cloud SQL flags
├── pub-sub/
│   ├── create-topics.sh             # Topic creation script
│   └── dead-letter-config.yaml      # DLQ configuration
├── dataflow/
│   ├── launch-template.sh           # Dataflow job launcher
│   └── parameters.json              # Template parameters
└── cloud-run/
    ├── cdc-processor/
    │   ├── main.py                  # Event handler
    │   ├── Dockerfile
    │   └── requirements.txt
    └── eventarc-trigger.yaml        # Pub/Sub -> Cloud Run
```

### Pattern 1: Debezium Server Configuration (PostgreSQL to Pub/Sub)
**What:** Standalone Debezium Server publishing CDC events to Pub/Sub topics
**When to use:** Kafka-less architecture, simpler operational model, GCP-native infrastructure
**Example:**
```properties
# Source: https://debezium.io/documentation/reference/stable/operations/debezium-server.html
# Verified: https://infinitelambda.com/postgres-cdc-debezium-google-pubsub/

# Sink Configuration (Google Cloud Pub/Sub)
debezium.sink.type=pubsub
debezium.sink.pubsub.project.id=your-gcp-project
debezium.sink.pubsub.ordering.enabled=true
debezium.sink.pubsub.retry.total.timeout.ms=600000
debezium.sink.pubsub.retry.initial.delay.ms=100
debezium.sink.pubsub.retry.delay.multiplier=2.0

# Source Configuration (PostgreSQL)
debezium.source.connector.class=io.debezium.connector.postgresql.PostgresConnector
debezium.source.offset.storage.file.filename=/debezium/data/offsets.dat
debezium.source.offset.flush.interval.ms=5000

# Database Connection
debezium.source.database.hostname=10.x.x.x  # Cloud SQL private IP
debezium.source.database.port=5432
debezium.source.database.user=debezium_user
debezium.source.database.password=${DB_PASSWORD}  # From Secret Manager
debezium.source.database.dbname=production

# Logical Replication Configuration
debezium.source.topic.prefix=cdc
debezium.source.plugin.name=pgoutput
debezium.source.publication.name=debezium_publication
debezium.source.publication.autocreate.mode=filtered
debezium.source.slot.name=debezium_slot

# Table Filtering
debezium.source.table.include.list=public.orders,public.customers,inventory.*
debezium.source.tombstones.on.delete=false

# Performance Tuning
debezium.source.max.batch.size=2048
debezium.source.poll.interval.ms=100
debezium.source.max.queue.size=8192

# Heartbeat (critical for low-traffic tables to prevent WAL bloat)
debezium.source.heartbeat.interval.ms=10000
debezium.source.heartbeat.topics.prefix=__debezium-heartbeat
```

### Pattern 2: Cloud SQL PostgreSQL CDC Setup
**What:** Configure Cloud SQL for logical replication
**When to use:** All Debezium PostgreSQL deployments on Cloud SQL
**Example:**
```sql
-- Source: https://docs.cloud.google.com/sql/docs/postgres/replication/configure-logical-replication

-- 1. Enable logical decoding flag (via gcloud or Console)
-- gcloud sql instances patch INSTANCE_NAME --database-flags=cloudsql.logical_decoding=on
-- NOTE: Requires instance restart

-- 2. Create replication user with proper permissions
CREATE USER debezium_user WITH REPLICATION IN ROLE cloudsqlsuperuser LOGIN PASSWORD 'secure_password';

-- 3. Grant table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO debezium_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO debezium_user;

-- 4. Create publication (if autocreate.mode not used)
CREATE PUBLICATION debezium_publication FOR TABLE public.orders, public.customers;
-- Or for all tables: CREATE PUBLICATION debezium_publication FOR ALL TABLES;

-- 5. Verify logical replication setup
SELECT * FROM pg_replication_slots;
SELECT * FROM pg_publication;
SELECT * FROM pg_publication_tables WHERE pubname = 'debezium_publication';

-- 6. Monitor replication slot health (run periodically)
SELECT
    slot_name,
    plugin,
    slot_type,
    database,
    active,
    restart_lsn,
    confirmed_flush_lsn,
    pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn) AS lag_bytes
FROM pg_replication_slots
WHERE slot_name = 'debezium_slot';
```

### Pattern 3: Workload Identity Configuration
**What:** Bind Kubernetes service account to GCP service account for secure authentication
**When to use:** Debezium Server deployed on GKE
**Example:**
```yaml
# Source: https://docs.cloud.google.com/kubernetes-engine/docs/how-to/workload-identity

# 1. Create GCP service account
# gcloud iam service-accounts create debezium-server-sa \
#   --project=your-project

# 2. Grant Pub/Sub Publisher role
# gcloud projects add-iam-policy-binding your-project \
#   --member="serviceAccount:debezium-server-sa@your-project.iam.gserviceaccount.com" \
#   --role="roles/pubsub.publisher"

# 3. Kubernetes Service Account with Workload Identity annotation
apiVersion: v1
kind: ServiceAccount
metadata:
  name: debezium-server
  namespace: cdc
  annotations:
    iam.gke.io/gcp-service-account: debezium-server-sa@your-project.iam.gserviceaccount.com
---
# 4. Bind K8s SA to GCP SA
# gcloud iam service-accounts add-iam-policy-binding \
#   debezium-server-sa@your-project.iam.gserviceaccount.com \
#   --role=roles/iam.workloadIdentityUser \
#   --member="serviceAccount:your-project.svc.id.goog[cdc/debezium-server]"

# 5. Deployment using the service account
apiVersion: apps/v1
kind: Deployment
metadata:
  name: debezium-server
  namespace: cdc
spec:
  replicas: 1  # Single replica for file-based offset storage
  selector:
    matchLabels:
      app: debezium-server
  template:
    metadata:
      labels:
        app: debezium-server
    spec:
      serviceAccountName: debezium-server  # Use Workload Identity SA
      containers:
      - name: server
        image: debezium/server:2.5
        env:
        - name: GOOGLE_APPLICATION_CREDENTIALS
          value: ""  # Not needed with Workload Identity
        volumeMounts:
        - name: config
          mountPath: /debezium/conf
        - name: data
          mountPath: /debezium/data
      volumes:
      - name: config
        configMap:
          name: debezium-config
      - name: data
        persistentVolumeClaim:
          claimName: debezium-offset-storage
```

### Pattern 4: Dataflow Template for BigQuery Replication
**What:** Use managed Dataflow template to stream Pub/Sub CDC events to BigQuery
**When to use:** Target is BigQuery, need automatic schema evolution and MERGE operations
**Example:**
```bash
# Source: https://docs.cloud.google.com/dataflow/docs/guides/templates/provided/mysql-change-data-capture-to-bigquery
# Adapted for PostgreSQL

# Launch Dataflow job from template
gcloud dataflow flex-template run "cdc-to-bigquery-$(date +%Y%m%d-%H%M%S)" \
    --template-file-gcs-location gs://dataflow-templates-us-central1/latest/flex/Mysql_Change_Data_Capture_to_BigQuery \
    --region us-central1 \
    --parameters \
inputSubscriptions="projects/your-project/subscriptions/cdc.public.orders-sub,projects/your-project/subscriptions/cdc.public.customers-sub",\
changeLogDataset="cdc_staging",\
replicaDataset="cdc_replica",\
updateFrequencySecs=60,\
useStorageWriteApi=true,\
useStorageWriteApiAtLeastOnce=false  # Exactly-once for correctness

# Note: Template creates two tables per source table:
# - cdc_staging.orders_changelog - raw events with metadata
# - cdc_replica.orders - replicated table (MERGE applied every updateFrequencySecs)
```

### Pattern 5: Cloud Run Event-Driven Processor
**What:** Cloud Run service triggered by Pub/Sub for custom CDC processing
**When to use:** Need business logic per change event (notifications, enrichment, routing)
**Example:**
```python
# Source: https://docs.cloud.google.com/run/docs/triggering/pubsub-triggers

# main.py - Cloud Run Pub/Sub handler
import base64
import json
from flask import Flask, request

app = Flask(__name__)

@app.route("/", methods=["POST"])
def handle_cdc_event():
    envelope = request.get_json()

    # Pub/Sub message format
    if not envelope:
        return "Bad Request: no Pub/Sub message received", 400

    if not isinstance(envelope, dict) or "message" not in envelope:
        return "Bad Request: invalid Pub/Sub message format", 400

    pubsub_message = envelope["message"]

    # Decode Debezium event
    if "data" in pubsub_message:
        data = base64.b64decode(pubsub_message["data"]).decode("utf-8")
        event = json.loads(data)

        # Debezium envelope structure
        operation = event.get("op")  # c=create, u=update, d=delete, r=read (snapshot)
        before = event.get("before")
        after = event.get("after")
        source = event.get("source", {})

        table = source.get("table")
        timestamp_ms = source.get("ts_ms")

        # Custom processing logic
        if operation == "c" and table == "orders":
            send_order_notification(after)
        elif operation == "u" and table == "customers":
            update_search_index(after)

        return ("", 204)

    return ("Bad Request: no data in message", 400)

def send_order_notification(order_data):
    # Your business logic
    pass

def update_search_index(customer_data):
    # Your business logic
    pass

if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
```

```yaml
# eventarc-trigger.yaml
# Deploy with: gcloud eventarc triggers create cdc-order-processor \
#   --location=us-central1 \
#   --destination-run-service=cdc-processor \
#   --destination-run-region=us-central1 \
#   --event-filters="type=google.cloud.pubsub.topic.v1.messagePublished" \
#   --transport-topic=projects/your-project/topics/cdc.public.orders
```

### Anti-Patterns to Avoid

- **Anti-pattern: No replication slot monitoring** - Inactive slots cause unbounded WAL growth, can fill disk and crash database. Always monitor `pg_replication_slots` and set up alerts on `pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn)`.

- **Anti-pattern: No heartbeat on low-traffic tables** - Replication slot LSN doesn't advance without changes, WAL accumulates. Always configure `heartbeat.interval.ms` (recommended: 10000ms).

- **Anti-pattern: Using service account keys instead of Workload Identity** - Keys are security risk (leakage, rotation). On GKE always use Workload Identity Federation.

- **Anti-pattern: Single topic for all tables** - Schema conflicts, no per-table backpressure control, complex routing. Use one topic per table with naming convention `prefix.schema.table`.

- **Anti-pattern: No dead letter queue on Pub/Sub subscriptions** - Poison messages block processing, can cause data loss. Always configure DLQ with 5-100 max delivery attempts.

- **Anti-pattern: Ignoring offset storage strategy** - File-based offsets lost on pod restart without persistent volume, leads to duplicate processing or data loss. Use PersistentVolumeClaim or Redis for HA deployments.

- **Anti-pattern: Not testing Cloud SQL flag changes** - `cloudsql.logical_decoding=on` requires instance restart, causes downtime. Test in dev/staging, plan maintenance window.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CDC to BigQuery replication | Custom Pub/Sub subscriber with INSERT/UPDATE logic | Dataflow CDC templates | Templates handle schema evolution, DDL callbacks to Datastream, automatic MERGE operations, staging + replica table pattern |
| Pub/Sub authentication from GKE | Service account key files, rotation scripts | Workload Identity Federation | Built-in credential rotation, no key management, audit trail, principle of least privilege |
| Debezium offset management | Custom checkpointing in Cloud Storage | Debezium's built-in offset storage (file/Redis) | Handles atomic offset commits, exactly-once semantics, recovery from failures |
| Replication slot monitoring | Custom pg_stat queries | Monitor `MilliSecondsBehindSource` metric + Cloud Monitoring alerts | Debezium exposes JMX metrics, integrates with Prometheus/Cloud Monitoring, standard dashboards available |
| Pub/Sub message retry logic | Manual ack/nack with backoff | Pub/Sub dead letter topics + retry policies | Automatic exponential backoff, DLQ for poison messages, built-in delivery attempts tracking |
| CDC event schema validation | Custom JSON schema checks | Debezium's built-in schema registry support | Handles schema evolution, Avro/JSON Schema/Protobuf support, version compatibility |

**Key insight:** GCP provides managed integrations (Dataflow templates, Workload Identity, BigQuery Storage Write API) specifically designed for CDC pipelines. These handle edge cases like schema evolution, DDL changes, exactly-once delivery, authentication rotation, and operational metrics that custom solutions miss. Debezium itself is complex distributed systems software - use official offset storage, don't rebuild it.

## Common Pitfalls

### Pitfall 1: Replication Slot WAL Bloat
**What goes wrong:** Database runs out of disk space due to unbounded WAL file accumulation. Replication slot references old LSN forever, preventing PostgreSQL from deleting WAL segments. Performance degrades, eventually crashes.

**Why it happens:**
- Replication slot created but Debezium connector stopped/failed - slot stays active but doesn't advance `confirmed_flush_lsn`
- Low-traffic tables monitored without heartbeat - no changes to commit, LSN doesn't move
- Forgotten/orphaned replication slots from testing/previous deployments
- Single message processing failure locks connector, slot accumulates

**How to avoid:**
- Enable heartbeat: `debezium.source.heartbeat.interval.ms=10000` (10s)
- Monitor replication slot lag:
```sql
SELECT slot_name,
       pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn)) AS lag_size,
       active,
       restart_lsn
FROM pg_replication_slots
WHERE slot_name = 'debezium_slot';
```
- Set Cloud Monitoring alert on lag > 10GB
- Implement automated cleanup job for inactive slots (check `active=false` + age > 1 hour)
- Configure Cloud SQL auto-storage increase limits to prevent silent cost spikes
- PostgreSQL 13+: Set `max_slot_wal_keep_size` limit (e.g., 100GB) to drop inactive slots

**Warning signs:**
- Cloud SQL storage usage increasing without corresponding data growth
- Alert: "Disk usage > 80%"
- Query in `pg_replication_slots` shows `confirmed_flush_lsn` not advancing
- Debezium log: connector stopped but slot still exists

### Pitfall 2: Pub/Sub Topic Naming Mismatch
**What goes wrong:** Debezium publishes events but they disappear into void. No errors in Debezium logs, but data never arrives in subscribers. Topic not found errors or messages published to wrong topic.

**Why it happens:**
- Debezium's topic naming convention is `<topic.prefix>.<schema>.<table>` (e.g., `cdc.public.orders`)
- Topics must be pre-created in Pub/Sub with exact matching names
- Case sensitivity differences (PostgreSQL schema names lowercase by default)
- Forgetting to create topics for new tables added to `table.include.list`

**How to avoid:**
- Script topic creation based on `table.include.list`:
```bash
#!/bin/bash
# create-topics.sh
PREFIX="cdc"
TABLES=("public.orders" "public.customers" "inventory.products")

for table in "${TABLES[@]}"; do
  topic="${PREFIX}.${table}"
  gcloud pubsub topics create "$topic" --project=your-project
  echo "Created topic: $topic"
done
```
- Use consistent naming: lowercase, schema-qualified
- Enable Debezium Server health endpoint monitoring (`:8080/q/health`) to detect publishing failures
- Create Cloud Monitoring metric filter for log pattern: "Topic not found"
- For dynamic table discovery, use Terraform/Pulumi to sync topics with database schema

**Warning signs:**
- Debezium Server running without errors but zero messages in Pub/Sub topics
- Cloud Monitoring shows Pub/Sub publish errors
- `gcloud pubsub topics list` shows missing expected topics

### Pitfall 3: Cloud SQL Connection Limits Exhausted
**What goes wrong:** Debezium can't connect to Cloud SQL, gets "too many connections" errors. Other applications also affected. Database becomes unresponsive.

**Why it happens:**
- Cloud SQL connection limit based on instance tier (shared-core: 25, db-standard-1: 100, scales with memory)
- Debezium holds persistent connection + replication slot connection
- Application connection pools not sized appropriately
- No connection monitoring or alerts

**How to avoid:**
- Right-size Cloud SQL instance tier: calculate max connections needed = (app pools * replicas) + Debezium + admin buffer
- Use Cloud SQL Proxy for connection pooling from applications
- Monitor connection count:
```sql
SELECT count(*), state, usename
FROM pg_stat_activity
GROUP BY state, usename;
```
- Set Cloud Monitoring alert: `database/postgresql/num_backends` > 80% of `max_connections`
- Configure Debezium connector for single connection reuse (default behavior)
- Reserve admin connections: set `reserved_connections` in Cloud SQL flags

**Warning signs:**
- Error in Debezium logs: "FATAL: sorry, too many clients already"
- Cloud SQL metrics spike in `num_backends`
- Application connection pool exhaustion errors

### Pitfall 4: Offset Storage Loss on Pod Restart
**What goes wrong:** Debezium Server restarts, processes entire snapshot again (duplicate events) or skips events (data loss). Inconsistent state between runs.

**Why it happens:**
- File-based offset storage (`offset.storage.file.filename`) on ephemeral pod filesystem
- Pod restart/crash/eviction loses `/debezium/data/offsets.dat`
- No PersistentVolumeClaim configured
- Assuming Kubernetes "just handles" state

**How to avoid:**
For single-instance deployment:
```yaml
# Use PersistentVolumeClaim for offset storage
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: debezium-offset-storage
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi  # Small size, critical data
  storageClassName: standard-rwo  # Regional persistent disk
```

For HA/multi-instance:
```properties
# Use Redis offset storage instead of file
debezium.source.offset.storage=io.debezium.storage.redis.offset.RedisOffsetBackingStore
debezium.source.offset.storage.redis.address=redis-master:6379
debezium.source.offset.storage.redis.password=${REDIS_PASSWORD}
```

- Test pod restart behavior in staging: `kubectl delete pod debezium-server-xxx` and verify no duplicate processing
- Monitor offset commit frequency: `offset.flush.interval.ms=5000` (5s)

**Warning signs:**
- Debezium starts from snapshot after restart (log: "Starting snapshot")
- Duplicate events detected in downstream systems
- Offset file not found warnings in logs

### Pitfall 5: Exactly-Once vs At-Least-Once Semantic Confusion
**What goes wrong:** Duplicates in BigQuery despite expecting exactly-once. Or paying 2x Dataflow costs for exactly-once when not needed. Incorrect business logic due to semantic misunderstanding.

**Why it happens:**
- Pub/Sub BigQuery subscriptions are always at-least-once (cannot do exactly-once)
- Dataflow exactly-once mode costs ~2x more (deterministic shuffling, persistent state)
- Confusion between Debezium's exactly-once offset commits vs downstream delivery semantics
- Not understanding where deduplication happens

**How to avoid:**
- **Understand semantic layers:**
  1. Debezium offset commits: exactly-once (won't skip source events)
  2. Pub/Sub delivery: at-least-once (can deliver duplicates on retry)
  3. BigQuery ingestion: depends on method (Storage Write API supports exactly-once)
  4. Application logic: must handle idempotency

- **For Dataflow CDC to BigQuery:**
  - Use exactly-once mode (`useStorageWriteApiAtLeastOnce=false`) when correctness critical
  - Use at-least-once mode for cost optimization when BigQuery can deduplicate (e.g., MERGE with primary key)
  - Dataflow template already handles MERGE operations, so at-least-once often sufficient

- **For Cloud Run Pub/Sub triggers:**
  - Design idempotent handlers (check if operation already applied)
  - Use unique event IDs for deduplication table
  - Pub/Sub will retry on non-2xx response, so same event delivered multiple times

- **Cost optimization:**
  - At-least-once Dataflow mode can reduce costs by 50%
  - BigQuery Storage Write API removes per-row costs and supports exactly-once

**Warning signs:**
- Unexpectedly high Dataflow costs
- Duplicate rows in BigQuery despite exactly-once configuration
- Business logic failures from processing same event twice

### Pitfall 6: Ignoring Cloud SQL Logical Replication Performance Settings
**What goes wrong:** Replication lag increases over time, Debezium falls behind source database changes. Subscriber sees stale data. Backlog accumulates in Pub/Sub.

**Why it happens:**
- Default PostgreSQL worker process settings too low for high-volume CDC
- `max_worker_processes` (default: 8) limits parallel query execution
- `max_logical_replication_workers` not tuned for replication workload
- Cloud SQL instance tier undersized for combined OLTP + CDC load

**How to avoid:**
- Tune Cloud SQL flags for CDC workload:
  - `max_worker_processes`: 2 processes per GB memory (e.g., 16 for 8GB instance)
  - `max_logical_replication_workers`: Set to number of expected replication slots (e.g., 4)
  - `max_sync_workers_per_subscription`: Increase if subscriber struggles to apply changes
  - `shared_buffers`: 25% of instance memory for high-read CDC workload

- PostgreSQL 16+ optimizations (Cloud SQL supports):
  - Binary format logical replication (faster than text): configure in publication
  - B-tree index usage for tables without primary keys (enable by default)
  - Logical decoding on read replicas: offload CDC from primary to replica

- Monitor Debezium lag metric:
  - `MilliSecondsBehindSource` JMX metric (expose via Prometheus)
  - Alert if lag > 60 seconds
  - Cloud Monitoring custom metric: `custom.googleapis.com/debezium/lag_ms`

- Right-size Cloud SQL tier:
  - Enable HA after migration for better performance (backfilling/CDC optimization)
  - Use db-standard-4 or higher for production CDC workloads
  - Monitor CPU utilization, scale up if consistently > 70%

**Warning signs:**
- Debezium `MilliSecondsBehindSource` metric increasing
- Pub/Sub subscription backlog growing
- Cloud SQL CPU/memory consistently high
- Slow query log shows replication-related queries

## Code Examples

Verified patterns from official sources:

### Complete Debezium Server Configuration
```properties
# Source: https://debezium.io/documentation/reference/stable/operations/debezium-server.html
# Verified: https://infinitelambda.com/postgres-cdc-debezium-google-pubsub/

# Quarkus logging configuration
quarkus.log.level=INFO
quarkus.log.console.json=false

# Health endpoint
quarkus.http.port=8080

# Sink: Google Cloud Pub/Sub
debezium.sink.type=pubsub
debezium.sink.pubsub.project.id=${GCP_PROJECT_ID}
debezium.sink.pubsub.ordering.enabled=true

# Optional: Regional endpoint for lower latency
debezium.sink.pubsub.region=us-central1

# Retry configuration
debezium.sink.pubsub.retry.total.timeout.ms=600000
debezium.sink.pubsub.retry.max.rpc.timeout.ms=30000
debezium.sink.pubsub.retry.initial.delay.ms=100
debezium.sink.pubsub.retry.delay.multiplier=2.0

# Optional: Flow control for rate limiting
# debezium.sink.pubsub.flowcontrol.enabled=true
# debezium.sink.pubsub.flowcontrol.maxoutstandingmessages=1000

# Source: PostgreSQL
debezium.source.connector.class=io.debezium.connector.postgresql.PostgresConnector
debezium.source.offset.storage.file.filename=/debezium/data/offsets.dat
debezium.source.offset.flush.interval.ms=5000

# Database connection
debezium.source.database.hostname=${DB_HOST}
debezium.source.database.port=5432
debezium.source.database.user=${DB_USER}
debezium.source.database.password=${DB_PASSWORD}
debezium.source.database.dbname=${DB_NAME}

# Server identification
debezium.source.topic.prefix=cdc
debezium.source.database.server.name=cloudsql-prod

# Logical replication settings
debezium.source.plugin.name=pgoutput
debezium.source.publication.name=debezium_publication
debezium.source.publication.autocreate.mode=filtered
debezium.source.slot.name=debezium_slot

# Table filtering
debezium.source.table.include.list=public.orders,public.customers,public.payments
debezium.source.tombstones.on.delete=false

# Snapshot mode
debezium.source.snapshot.mode=initial

# Performance tuning
debezium.source.max.batch.size=2048
debezium.source.poll.interval.ms=100
debezium.source.max.queue.size=8192

# Heartbeat (critical!)
debezium.source.heartbeat.interval.ms=10000
debezium.source.heartbeat.topics.prefix=__debezium-heartbeat

# Schema changes
debezium.source.include.schema.changes=true
```

### Cloud SQL Replication Slot Monitoring Query
```sql
-- Source: https://www.morling.dev/blog/mastering-postgres-replication-slots/
-- Monitor replication slot health and WAL accumulation

SELECT
    slot_name,
    slot_type,
    plugin,
    database,
    active,
    restart_lsn,
    confirmed_flush_lsn,
    -- Calculate bytes behind current WAL position
    pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) AS restart_lag_bytes,
    pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn) AS flush_lag_bytes,
    -- Human-readable sizes
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS restart_lag,
    pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn)) AS flush_lag
FROM pg_replication_slots
WHERE slot_name = 'debezium_slot';

-- Alert conditions:
-- 1. flush_lag_bytes > 10GB (10737418240) - replication falling behind
-- 2. active = false AND slot exists > 1 hour - orphaned slot
-- 3. restart_lag_bytes growing continuously - slot not advancing
```

### Pub/Sub Dead Letter Queue Configuration
```bash
# Source: https://docs.cloud.google.com/pubsub/docs/dead-letter-topics

# 1. Create dead letter topic
gcloud pubsub topics create cdc-dead-letter --project=your-project

# 2. Create subscription for DLQ monitoring
gcloud pubsub subscriptions create cdc-dead-letter-sub \
  --topic=cdc-dead-letter \
  --project=your-project

# 3. Create main subscription with DLQ
gcloud pubsub subscriptions create cdc.public.orders-sub \
  --topic=cdc.public.orders \
  --dead-letter-topic=cdc-dead-letter \
  --max-delivery-attempts=5 \
  --dead-letter-topic-project=your-project \
  --project=your-project

# 4. Grant Pub/Sub service account permissions for DLQ
PROJECT_NUMBER=$(gcloud projects describe your-project --format="value(projectNumber)")
PUBSUB_SA="service-${PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com"

gcloud pubsub topics add-iam-policy-binding cdc-dead-letter \
  --member="serviceAccount:${PUBSUB_SA}" \
  --role="roles/pubsub.publisher" \
  --project=your-project

gcloud pubsub subscriptions add-iam-policy-binding cdc.public.orders-sub \
  --member="serviceAccount:${PUBSUB_SA}" \
  --role="roles/pubsub.subscriber" \
  --project=your-project
```

### Cloud Monitoring Alert Policy for Replication Lag
```yaml
# Source: https://docs.cloud.google.com/dataflow/docs/guides/using-cloud-monitoring

# Create custom metric from Debezium JMX (via Prometheus exporter)
# Alert on Debezium lag

displayName: "Debezium Replication Lag High"
conditions:
  - displayName: "Lag > 60 seconds"
    conditionThreshold:
      filter: |
        resource.type="k8s_pod"
        metric.type="custom.googleapis.com/debezium/milliseconds_behind_source"
      comparison: COMPARISON_GT
      thresholdValue: 60000
      duration: 300s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_MEAN

notificationChannels:
  - projects/your-project/notificationChannels/email-oncall

documentation:
  content: |
    Debezium replication lag exceeds 60 seconds.

    Runbook:
    1. Check Cloud SQL CPU/memory utilization
    2. Query pg_replication_slots for slot health
    3. Check Debezium Server logs for errors
    4. Verify Pub/Sub publish throughput
    5. Consider scaling Cloud SQL instance
```

### Terraform: Cloud SQL with Logical Replication Enabled
```hcl
# Source: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_database_instance

resource "google_sql_database_instance" "cdc_source" {
  name             = "cdc-postgres-prod"
  database_version = "POSTGRES_16"
  region           = "us-central1"

  settings {
    tier = "db-standard-4"  # Sufficient for production CDC

    # Enable logical replication (requires restart)
    database_flags {
      name  = "cloudsql.logical_decoding"
      value = "on"
    }

    # Tune for CDC workload
    database_flags {
      name  = "max_worker_processes"
      value = "16"  # 2 per GB for 8GB instance
    }

    database_flags {
      name  = "max_logical_replication_workers"
      value = "4"
    }

    database_flags {
      name  = "max_replication_slots"
      value = "10"
    }

    # PostgreSQL 13+ WAL size limit
    database_flags {
      name  = "max_slot_wal_keep_size"
      value = "102400"  # 100GB limit
    }

    backup_configuration {
      enabled = true
      start_time = "03:00"  # Low-traffic window
      point_in_time_recovery_enabled = true
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
      require_ssl     = true
    }

    maintenance_window {
      day  = 7  # Sunday
      hour = 3
    }
  }

  deletion_protection = true
}

# Create replication user
resource "google_sql_user" "debezium" {
  name     = "debezium_user"
  instance = google_sql_database_instance.cdc_source.name
  password = var.debezium_password  # Store in Secret Manager

  # Note: REPLICATION privilege requires manual SQL execution
  # or use null_resource provisioner
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| wal2json plugin | pgoutput (native) | Debezium 2.5 (2023) | wal2json deprecated, no external plugin installation needed, better performance |
| Kafka + Kafka Connect | Debezium Server + Pub/Sub | Debezium 2.0+ (2021) | Eliminates Kafka infrastructure, simpler ops, cloud-native messaging |
| Service account keys | Workload Identity | GKE 1.12+ (2019) | No key rotation burden, automatic credential management, better security |
| Manual BigQuery schema evolution | Dataflow template DDL callbacks | Dataflow v2 templates (2020) | Automatic schema sync with source database changes |
| At-least-once only | Storage Write API exactly-once | BigQuery Storage Write API GA (2021) | Exactly-once BigQuery streaming without deduplication logic |
| PostgreSQL 15 read replica limitations | PostgreSQL 16 logical replication on replicas | PostgreSQL 16 (2023), Cloud SQL support (2024) | Offload CDC from primary to replica, better performance |
| Google Datastream MySQL/Oracle only | Datastream supports AlloyDB, SQL Server | 2024-2025 | Still no PostgreSQL - Debezium Server remains best option for Cloud SQL PostgreSQL |

**Deprecated/outdated:**
- **wal2json plugin**: Deprecated in Debezium 2.5, use pgoutput instead
- **decoderbufs plugin**: Legacy, not recommended for new deployments
- **Service account key files**: Use Workload Identity on GKE, Service Account Impersonation elsewhere
- **Pub/Sub synchronous pull API**: Use streaming pull or push delivery for better performance
- **Manual topic creation per table**: Use Infrastructure-as-Code (Terraform/Pulumi) to sync with schema

## Open Questions

Things that couldn't be fully resolved:

1. **Debezium Server HA deployment with file-based offsets**
   - What we know: Single-instance file-based offset storage works with PersistentVolumeClaim. Redis offset storage enables multi-instance HA.
   - What's unclear: Production patterns for active-passive failover with file-based offsets. Does ReadWriteMany PVC work safely? Official docs emphasize Redis for HA but don't detail file-based alternatives.
   - Recommendation: For HA requirements, use Redis offset storage. For simpler deployments, single instance with PVC + pod anti-affinity. Need to test active-passive with shared PVC in staging environment.

2. **Dataflow template support for PostgreSQL CDC**
   - What we know: Official "MySQL Change Data Capture to BigQuery" template exists. Documentation shows MySQL-specific configuration.
   - What's unclear: Does template actually work with PostgreSQL? Debezium event format is similar across connectors, so likely compatible, but not officially documented.
   - Recommendation: Test template with PostgreSQL-sourced Pub/Sub events in dev environment. If incompatible, use generic "Pub/Sub to BigQuery" template with custom transforms, or build custom Dataflow pipeline referencing MySQL template structure.

3. **Cost optimization: Pub/Sub vs Datastream for PostgreSQL**
   - What we know: Datastream pricing is $50/TiB for CDC data, doesn't support Cloud SQL PostgreSQL (only MySQL, Oracle, AlloyDB, SQL Server). Debezium + Pub/Sub pricing is Pub/Sub ($40/TiB message throughput) + compute (GKE/Cloud Run).
   - What's unclear: Exact cost comparison for typical workloads. Pub/Sub pricing includes publish + subscribe, message storage. Debezium Server compute costs vary by deployment model.
   - Recommendation: For PostgreSQL, Debezium Server + Pub/Sub is the only viable option. Model costs: estimate event size * table change rate * 2 (publish + subscribe) for Pub/Sub, add GKE node costs (~$75/month for e2-standard-2) or Cloud Run costs (CPU allocation time). Likely cheaper than Datastream for low-medium volume.

4. **Schema Registry integration with Pub/Sub**
   - What we know: Debezium supports Avro/JSON Schema/Protobuf serialization. Pub/Sub has Schema service (https://cloud.google.com/pubsub/docs/schemas). Debezium Server documentation mentions schema registry but primarily Confluent Schema Registry examples.
   - What's unclear: Best practice for integrating Debezium Server with Pub/Sub Schema service. Does Debezium Server support Pub/Sub Schemas natively, or need custom serialization?
   - Recommendation: For MVP, use JSON serialization (default). For production at scale, investigate Pub/Sub Avro schemas with Debezium Avro converter. Test compatibility in dev environment. May need custom SerDe implementation.

5. **Cloud Monitoring integration for Debezium JMX metrics**
   - What we know: Debezium exposes JMX metrics. Prometheus JMX exporter can scrape and convert to Prometheus format. Cloud Monitoring can ingest Prometheus metrics via GKE workloads.
   - What's unclear: Recommended architecture for Debezium metrics in GCP. Use Prometheus + Grafana in-cluster, or export to Cloud Monitoring? What's the standard GCP-native pattern?
   - Recommendation: For GKE deployments, use Google Cloud Managed Service for Prometheus (GMP) to auto-collect Debezium metrics. Configure PodMonitoring CRD to scrape JMX exporter sidecar. For Cloud Run deployments, export critical metrics as Cloud Monitoring custom metrics via HTTP endpoint. Need to create dashboard templates for course materials.

## Sources

### Primary (HIGH confidence)
- **Debezium Documentation**: [Debezium Server](https://debezium.io/documentation/reference/stable/operations/debezium-server.html) - Official architecture and configuration reference
- **Google Cloud Documentation**: [Cloud SQL Logical Replication](https://docs.cloud.google.com/sql/docs/postgres/replication/configure-logical-replication) - Cloud SQL PostgreSQL CDC setup (Last updated 2026-01-26)
- **Google Cloud Documentation**: [Workload Identity for GKE](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/workload-identity) - Secure authentication pattern (Last updated 2026-01-22)
- **Google Cloud Documentation**: [Dataflow CDC Templates](https://docs.cloud.google.com/dataflow/docs/guides/templates/provided/mysql-change-data-capture-to-bigquery) - BigQuery replication templates
- **Google Cloud Documentation**: [Cloud Run Pub/Sub Triggers](https://docs.cloud.google.com/run/docs/triggering/pubsub-triggers) - Event-driven processing (Last updated 2026-01-29)
- **Google Cloud Documentation**: [Pub/Sub Dead Letter Topics](https://docs.cloud.google.com/pubsub/docs/dead-letter-topics) - Error handling pattern
- **Google Cloud Documentation**: [Dataflow Monitoring](https://docs.cloud.google.com/dataflow/docs/guides/using-cloud-monitoring) - Observability integration
- **Debezium Documentation**: [PostgreSQL Connector 2.5](https://debezium.io/documentation/reference/2.5/connectors/postgresql.html) - Connector-specific configuration
- **Debezium Documentation**: [Storage Configuration](https://debezium.io/documentation/reference/stable/configuration/storage.html) - Offset and schema history storage options

### Secondary (MEDIUM confidence)
- **Infinite Lambda Blog**: [Postgres CDC Solution with Debezium & Google Pub/Sub](https://infinitelambda.com/postgres-cdc-debezium-google-pubsub/) - Verified complete application.properties example
- **Gunnar Morling Blog**: [Mastering Postgres Replication Slots](https://www.morling.dev/blog/mastering-postgres-replication-slots/) - Replication slot monitoring best practices from Debezium project lead
- **Zalando Engineering Blog**: [Contributing to Debezium: Fixing Logical Replication at Scale](https://engineering.zalando.com/posts/2025/12/contributing-to-debezium.html) - Production lessons learned at scale (December 2025)
- **Google Cloud Blog**: [Dataflow at-least-once vs. exactly-once streaming modes](https://cloud.google.com/blog/products/data-analytics/dataflow-at-least-once-vs-exactly-once-streaming-modes) - Cost optimization guidance
- **Google Cloud Blog**: [Using BigQuery's new CDC capability in Dataflow](https://cloud.google.com/blog/products/data-analytics/using-bigquerys-new-cdc-capability-in-dataflow/) - BigQuery CDC patterns
- **Medium**: [Building a Production-Grade CDC Pipeline: SQL Server to PostgreSQL via Debezium](https://medium.com/@andersonk/building-a-production-grade-cdc-pipeline-sql-server-to-postgresql-via-debezium-and-azure-event-hub-fdde83a6e09b) - Production deployment lessons (December 2025)
- **Medium**: [3 Pro Tips For Datastream](https://medium.com/google-cloud/3-pro-tips-for-datastream-4cc4f0ef774c) - Cost optimization for CDC pipelines

### Tertiary (LOW confidence)
- **Medium Community Posts**: Various CDC implementation examples from Google Cloud Community - practical patterns but not officially verified
- **GitHub Examples**: [debezium/debezium-examples](https://github.com/debezium/debezium-examples) - Reference configurations, not production-hardened
- **Google Developer Forums**: Community discussions on Datastream pricing, CDC setup - helpful context but needs verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Debezium and Google Cloud documentation, well-established patterns
- Architecture: MEDIUM-HIGH - Debezium Server + Pub/Sub pattern documented and used in production, but some GCP-specific integrations (Dataflow template for PostgreSQL) need testing
- Pitfalls: HIGH - Based on official Debezium documentation, production blog posts from companies running at scale (Zalando), and PostgreSQL replication best practices
- Cost optimization: MEDIUM - Official pricing documentation available, but cost modeling for specific workloads needs validation
- Monitoring: MEDIUM - Cloud Monitoring integration patterns exist but need custom configuration for Debezium-specific metrics

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable technology, but GCP services update frequently)

**Notes:**
- Debezium 2.5.4 is current stable version, course constraint due to Java 21 ARM64 issues with 3.x
- PostgreSQL pgoutput plugin is standard and future-proof (wal2json deprecated in 2.5)
- GCP documentation actively maintained (multiple updates in January 2026)
- Workload Identity is GKE-specific; for Cloud Run use service account impersonation
- Datastream doesn't support Cloud SQL PostgreSQL, making Debezium Server the only viable CDC option for this use case
