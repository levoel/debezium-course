---
phase: 10-module-6-cloud-native-gcp
plan: 01
subsystem: content-module
tags: [gcp, cloud-sql, debezium-server, pubsub, kafka-less, postgresql]

dependency_graph:
  requires:
    - phase: 06
      plans: [01, 02, 03]
      reason: "Module 2 foundation on logical decoding, replication slots, and pgoutput plugin"
  provides:
    - "Cloud SQL PostgreSQL CDC configuration lesson"
    - "Debezium Server Pub/Sub sink lesson"
  affects:
    - phase: 10
      plans: [02, 03]
      reason: "Subsequent GCP lessons build on Cloud SQL and Debezium Server setup"

tech_stack:
  added:
    - name: "Cloud SQL PostgreSQL"
      purpose: "Managed PostgreSQL with logical replication support"
      version: "14/15/16"
    - name: "Debezium Server"
      purpose: "Standalone CDC engine with Pub/Sub sink"
      version: "2.5"
    - name: "Google Cloud Pub/Sub"
      purpose: "GCP-native message broker for CDC events"
      version: "N/A (managed service)"
  patterns:
    - "Kafka-less CDC architecture (PostgreSQL → Debezium Server → Pub/Sub)"
    - "Cloud SQL database flags configuration for logical replication"
    - "File-based offset storage for single-instance deployment"
    - "Topic naming convention: {prefix}.{schema}.{table}"

key_files:
  created:
    - path: "src/content/course/06-module-6/01-cloud-sql-setup.mdx"
      purpose: "Cloud SQL PostgreSQL CDC setup lesson"
      lines: 308
    - path: "src/content/course/06-module-6/02-debezium-server-pubsub.mdx"
      purpose: "Debezium Server Pub/Sub sink lesson"
      lines: 594
  modified: []

decisions:
  - id: "cloudsql-logical-decoding-flag"
    choice: "cloudsql.logical_decoding flag instead of direct postgresql.conf"
    rationale: "Cloud SQL managed service doesn't provide direct postgresql.conf access"
    alternatives: ["Self-managed PostgreSQL with direct config"]
    impact: "Requires instance restart, configuration via gcloud CLI or Console"

  - id: "pgoutput-plugin-standard"
    choice: "pgoutput as logical decoding plugin"
    rationale: "Built-in since PostgreSQL 10+, no dependencies, Aurora/RDS compatible"
    alternatives: ["wal2json (deprecated in Debezium 2.5)", "decoderbufs"]
    impact: "Standard plugin reduces setup complexity, future-proof"

  - id: "debezium-server-over-kafka-connect"
    choice: "Debezium Server with Pub/Sub sink for Kafka-less architecture"
    rationale: "Simpler infrastructure for GCP-native CDC, no Kafka cluster required"
    alternatives: ["Kafka Connect with Debezium PostgreSQL connector"]
    impact: "Lower operational burden, GCP-native integration, but no Kafka ecosystem (Streams, ksqlDB)"

  - id: "file-based-offset-storage"
    choice: "File-based offset storage as primary teaching pattern"
    rationale: "Simpler for single-instance deployments, requires persistent volume"
    alternatives: ["Redis offset storage for HA"]
    impact: "Requires PersistentVolumeClaim in Kubernetes, single replica limitation"

  - id: "heartbeat-interval-10s"
    choice: "10-second heartbeat interval for low-traffic tables"
    rationale: "Prevents WAL bloat by advancing replication slot on inactive tables"
    alternatives: ["No heartbeat (risks WAL accumulation)", "Longer intervals (5min)"]
    impact: "Mandatory for production to prevent disk exhaustion"

  - id: "topic-naming-convention"
    choice: "Topic naming pattern: {prefix}.{schema}.{table}"
    rationale: "Standard Debezium convention, clear table-to-topic mapping"
    alternatives: ["Single topic for all tables", "Custom routing"]
    impact: "Requires pre-creating topics in Pub/Sub, topics must match exactly (case-sensitive)"

metrics:
  duration: 3.5
  completed: "2026-02-01"

commits:
  - hash: "377c02c"
    message: "feat(10-01): create Cloud SQL PostgreSQL CDC setup lesson"
    files: ["src/content/course/06-module-6/01-cloud-sql-setup.mdx"]
  - hash: "c1d2333"
    message: "feat(10-01): create Debezium Server Pub/Sub lesson"
    files: ["src/content/course/06-module-6/02-debezium-server-pubsub.mdx"]
---

# Phase 10 Plan 01: GCP Cloud SQL and Debezium Server Foundation Summary

**One-liner:** Cloud SQL PostgreSQL CDC setup with cloudsql.logical_decoding flag and Debezium Server Kafka-less architecture publishing to Pub/Sub

## What Was Built

Created two foundational lessons for Module 6 (Cloud-Native GCP CDC):

1. **Cloud SQL PostgreSQL CDC Setup** - Configuration of managed PostgreSQL for logical replication using GCP-specific database flags, replication user creation with cloudsqlsuperuser role, publication setup, and replication slot monitoring queries to prevent WAL bloat.

2. **Debezium Server with Pub/Sub Sink** - Kafka-less CDC architecture using standalone Debezium Server as a Quarkus application, complete application.properties configuration for Pub/Sub sink, offset storage strategies (file-based vs Redis), topic naming conventions, and verification steps for CDC events.

## Technical Substance

### Cloud SQL CDC Configuration

**cloudsql.logical_decoding flag** - Cloud SQL doesn't provide direct postgresql.conf access, so logical replication is enabled via database flag:

```bash
gcloud sql instances patch INSTANCE_NAME \
  --database-flags=cloudsql.logical_decoding=on
```

This flag sets `wal_level=logical` internally and requires instance restart. Verification: `SHOW wal_level;` should return 'logical'.

**Replication user setup** - Uses cloudsqlsuperuser role (Cloud SQL's limited superuser) with REPLICATION privilege:

```sql
CREATE USER debezium_user WITH REPLICATION
  IN ROLE cloudsqlsuperuser LOGIN PASSWORD 'secure_password';

GRANT SELECT ON ALL TABLES IN SCHEMA public TO debezium_user;
```

**Publication configuration** - Defines tables for replication with pgoutput plugin (built-in since PostgreSQL 10+):

```sql
CREATE PUBLICATION debezium_publication
  FOR TABLE public.orders, public.customers;
```

**Replication slot monitoring** - Critical query for preventing WAL bloat:

```sql
SELECT slot_name, active,
  pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn)) AS lag
FROM pg_replication_slots;
```

Monitors lag between current WAL position and confirmed flush LSN. Growing lag indicates replication falling behind or inactive slot accumulating WAL.

### Debezium Server Kafka-less Architecture

**Architecture shift** - Traditional Debezium: PostgreSQL → Debezium Connector → Kafka Connect → Kafka. Kafka-less: PostgreSQL → Debezium Server → Pub/Sub. Eliminates Kafka infrastructure (brokers, Zookeeper/KRaft, Connect workers) in favor of GCP-native Pub/Sub.

**Debezium Server runtime** - Standalone Quarkus application combining source connector (PostgreSQL) and sink adapter (Pub/Sub) in single container. Image: `debezium/server:2.5`.

**application.properties configuration** - Complete production-ready configuration:

```properties
# Sink: Pub/Sub
debezium.sink.type=pubsub
debezium.sink.pubsub.project.id=your-gcp-project
debezium.sink.pubsub.ordering.enabled=true

# Source: PostgreSQL
debezium.source.connector.class=io.debezium.connector.postgresql.PostgresConnector
debezium.source.offset.storage.file.filename=/debezium/data/offsets.dat
debezium.source.plugin.name=pgoutput
debezium.source.publication.name=debezium_publication
debezium.source.slot.name=debezium_slot

# Heartbeat (critical!)
debezium.source.heartbeat.interval.ms=10000
```

**Offset storage strategies**:
- **File-based** (`/debezium/data/offsets.dat`) - For single instance, requires PersistentVolumeClaim in Kubernetes. Loss of PVC = offset loss = duplicate processing or data loss.
- **Redis** (`io.debezium.storage.redis.offset.RedisOffsetBackingStore`) - For HA multi-replica deployments, automatic offset replication.

**Topic naming convention** - Pattern: `{topic.prefix}.{schema}.{table}`. Example: `cdc.public.orders`. Topics must be pre-created in Pub/Sub - Debezium Server doesn't auto-create. Case-sensitive matching required.

**Heartbeat mechanism** - Generates synthetic events every 10 seconds on low-traffic tables to advance replication slot position, preventing WAL bloat. Without heartbeat, inactive slot references old LSN forever, PostgreSQL can't delete WAL segments.

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

**Key decision: Kafka-less architecture as primary teaching pattern** - Traditional Kafka Connect architecture has richer ecosystem (Kafka Streams, ksqlDB) but higher operational complexity. For GCP-native CDC pipelines where Kafka ecosystem isn't required, Debezium Server + Pub/Sub significantly reduces infrastructure burden. Taught both architectures with comparison table to help students choose appropriately.

**cloudsql.logical_decoding flag emphasis** - Unlike self-managed PostgreSQL where students edit postgresql.conf directly, Cloud SQL requires database flags via gcloud CLI or Console. This managed service pattern is critical for GCP CDC success - included explicit gcloud commands and Console navigation steps.

**Offset storage pitfall documentation** - File-based offset storage without persistent volume is common mistake leading to data loss or duplicates on pod restart. Emphasized PersistentVolumeClaim requirement for Kubernetes deployments and Redis alternative for HA scenarios.

**Heartbeat as mandatory, not optional** - Many tutorials treat heartbeat as optional configuration. Made it clear this is **critical** for production - 10-second interval recommended to prevent WAL bloat on low-traffic tables. Included monitoring queries to detect bloat early.

**Topic naming case sensitivity warning** - PostgreSQL defaults to lowercase table names, but quoted identifiers preserve case. This mismatch causes events to publish to wrong topic (or no topic). Added explicit warning and recommended lowercase naming convention.

## Challenges and Solutions

**Challenge: Explaining Kafka-less tradeoffs**
- **Issue:** Students might think Debezium Server is "better" than Kafka Connect, or vice versa. Both have valid use cases.
- **Solution:** Created detailed comparison table showing when to use each approach. Kafka Connect for multi-sink, stream processing, Kafka ecosystem. Debezium Server for simple CDC, GCP-native, operational simplicity. Clear guidance based on requirements, not dogma.

**Challenge: Offset storage is abstract concept**
- **Issue:** Students unfamiliar with distributed systems might not understand why offset persistence matters.
- **Solution:** Concrete scenario explanation - "Without persistent storage, pod restart loses offset file. Debezium either re-processes all events (duplicates) or starts from current position (data loss)." Added PersistentVolumeClaim example for Kubernetes.

**Challenge: WAL bloat prevention**
- **Issue:** Replication slot WAL bloat is invisible until disk fills, then catastrophic.
- **Solution:** Dedicated section on monitoring with exact SQL queries. Explained heartbeat mechanism with visual Mermaid diagram showing WAL accumulation without heartbeat. Emphasized this as production-critical, not optional.

## Lessons Learned

**Managed service constraints require explicit documentation** - Cloud SQL's lack of postgresql.conf access is obvious to GCP experts but confusing to students coming from self-managed PostgreSQL. Included comparison table (self-managed vs Cloud SQL) showing configuration approach differences.

**Configuration file examples must be complete** - Incomplete application.properties examples lead to confusion ("which parameters are required vs optional?"). Provided full production-ready configuration with inline comments explaining each section.

**Architecture diagrams clarify flow** - Mermaid diagrams showing traditional (Kafka Connect) vs Kafka-less (Debezium Server) architectures made the architectural shift immediately clear. Visual comparison more effective than text explanation.

**Pub/Sub topic pre-creation isn't obvious** - Debezium Server silently fails if topics don't exist (no auto-creation like Kafka). Included bash script for topic creation based on table.include.list to prevent this pitfall.

## Next Phase Readiness

**Ready to proceed to Plan 02** - These lessons establish the foundation (Cloud SQL + Debezium Server) that all subsequent GCP lessons build upon. Next lessons can assume:

- Students understand Cloud SQL database flags for logical replication
- Students can create replication users with cloudsqlsuperuser role
- Students understand Debezium Server architecture and configuration
- Students can deploy Debezium Server with Pub/Sub sink
- Students understand offset storage importance

**Prerequisites for Plan 02 (GKE Deployment):**
- Workload Identity for secure GCP authentication
- Kubernetes deployment patterns for Debezium Server
- Cloud Monitoring integration for observability

**Prerequisites for Plan 03 (Dataflow & BigQuery):**
- Pub/Sub subscriptions and consumers
- BigQuery streaming and CDC patterns
- Dataflow templates for CDC processing

## Performance Notes

**Duration: 3.5 minutes** - Faster than average (4.7m for Module 5 content) due to clear research document with complete code examples and well-defined lesson structure.

**Content quality** - Both lessons include:
- Russian explanatory text with English code/config (project pattern)
- Complete working examples (not fragments)
- Mermaid architecture diagrams
- Comparison tables for decision-making
- Critical pitfalls documented
- Verification steps for hands-on learning

**Research utilization** - 10-RESEARCH.md provided excellent foundation with production patterns from official Debezium documentation, Infinite Lambda blog, and Gunnar Morling (Debezium lead). All code examples verified against official sources.

## Files Changed

```
src/content/course/06-module-6/01-cloud-sql-setup.mdx         | 308 lines (new)
src/content/course/06-module-6/02-debezium-server-pubsub.mdx  | 594 lines (new)
```

Total: 902 lines of educational content covering Cloud SQL CDC setup and Debezium Server Kafka-less architecture.
