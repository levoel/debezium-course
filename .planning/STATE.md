# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-31)

**Core value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций
**Current focus:** Phase 7 - Module 3 Production Operations (complete)

## Current Position

Phase: 10 of 11 (Module 6 - Cloud-Native GCP)
Plan: 3 of 3 complete
Status: Phase complete
Last activity: 2026-02-01 — Completed 10-03-PLAN.md (Cloud Run Event Processing & Monitoring)

Progress: [█████████████████░░░] 91% (29/32 plans complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 29
- Average duration: 4.0 minutes
- Total execution time: 2.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 - Platform Foundation | 3/4 | 12.5m | 4.2m |
| 02 - Navigation and Roadmap | 4/4 | 8.5m | 2.1m |
| 03 - Progress Tracking | 4/4 | 7.5m | 1.9m |
| 04 - Lab Infrastructure | 4/4 | 19m | 4.8m |
| 05 - Module 1 Foundations | 3/3 ✓ | 8.5m | 2.8m |
| 06 - Module 2 PostgreSQL/Aurora | 3/3 ✓ | 14.5m | 4.8m |
| 07 - Module 3 Production Operations | 3/3 ✓ | 27m | 9m |
| 08 - Module 4 Advanced Patterns | 4/4 ✓ | 16.7m | 4.2m |
| 09 - Module 5 Data Engineering | 4/4 ✓ | 18.7m | 4.7m |
| 10 - Module 6 Cloud-Native GCP | 3/3 ✓ | 14m | 4.7m |

**Recent Trend:**
- Last 5 plans: 10-03 (5.7m), 10-02 (4.8m), 10-01 (3.5m), 09-04 (3.2m), 09-01 (4.5m)
- Trend: Content creation consistently efficient at ~4-5m/plan

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap structure: 11 phases derived from requirements (3 platform phases, 1 infrastructure, 6 content modules, 1 capstone)
- Depth setting: Comprehensive (8-12 phases) to allow natural learning progression
- Phase ordering: Platform foundation -> navigation -> progress tracking -> lab infrastructure -> content modules following pedagogical progression
- Framework: Astro 5 for static site generation (01-01)
- Styling: Tailwind CSS 4 utility-first approach (01-01)
- Code highlighting: Shiki with github-dark theme, line wrapping enabled (01-01)
- React version: React 19 for interactive components (01-01)
- Content validation: Zod schema in content collections for course frontmatter (01-02)
- Responsive breakpoints: Mobile-first with lg:1024px for sidebar visibility (01-02)
- Diagram rendering: Mermaid with client:visible lazy hydration and dark theme (01-02)
- Dynamic routing: [...slug] pattern with getStaticPaths for content collections (01-03)
- Navigation patterns: Breadcrumb, prev/next, all-lessons link for course content (01-03)
- Metadata display: Difficulty badges with color coding, time estimates, topic tags (01-03)
- Localization: Full Russian UI strings for course interface (01-03)
- State management: nanostores for cross-island state sharing (02-01)
- Navigation tree: Content-derived navigation via getNavigationTree() (02-01)
- Inline SVG icons: Hamburger/X icons inline to avoid bundle bloat (02-02)
- Array tuples for props: [moduleId, lessons[]][] for serializable Astro island props (02-02)
- Mermaid click handlers: securityLevel 'loose' required for navigation (02-03)
- Roadmap serialization: Flat RoadmapLesson[] for Astro island compatibility (02-03)
- basePath prop pattern: All navigation components receive basePath for GitHub Pages deployment (02-04)
- Slug cleanup: entry.id cleaned of /index.mdx extension for clean URLs (02-04)
- Sidebar sync: Inline script subscribes to nanostores for DOM manipulation (02-04)
- Progress store: persistentAtom with JSON encode/decode for reliable array serialization (03-01, fixed 03-04)
- Toggle pattern: Single toggleLessonComplete for simpler UI binding (03-01)
- SSR-safe pattern: useEffect + mounted state for localStorage-dependent rendering (03-02)
- Status feedback: auto-dismiss messages after 3 seconds (03-02)
- Green completion color: #10b981 (emerald-500) for completed nodes/checkmarks (03-03)
- Reactive progress display: useStore($progress) for automatic UI updates (03-03)
- Safe array access: Array.isArray() checks in all progress consumers (03-04)
- Reset button: ProgressExport includes reset for clearing corrupted data (03-04)
- 15s Prometheus scrape interval for JMX metrics (04-02)
- Grafana datasource non-editable via provisioning (04-02)
- Metric relabeling to kafka_connect_* and debezium_* only (04-02)
- jupyter/scipy-notebook as base image for JupyterLab (04-03)
- confluent-kafka 2.13.0+ for ARM64 native wheel support (04-03)
- Docker network names for internal services (postgres, kafka, connect) (04-03)
- Confluent Kafka 7.8.1 instead of quay.io/debezium/kafka due to Java 21 ARM64 crash (04-01)
- Debezium Connect 2.5.4 instead of 3.0.8 for same Java 21 compatibility (04-01)
- PostgreSQL external port 5433 (5432 in use on host) (04-01)
- 7 services in single docker-compose.yml for lab simplicity (04-04)
- Russian documentation language for course consistency (04-04)
- Human verification checkpoint for production-quality lab environment (04-04)
- Lesson language pattern: Russian explanatory text, English code/config (05-01)
- Internal vs external port distinction: database.port 5432 internal, 5433 external (05-02)
- Two-terminal demo pattern for live CDC capture (05-02)
- Replication slot monitoring for operational awareness (05-02)
- confluent-kafka over kafka-python for performance and Confluent support (05-03)
- Prominent kafka:9092 vs localhost:9092 hostname warning for Docker networking clarity (05-03)
- parse_cdc_event function handles all operation types (r, c, u, d) explicitly (05-03)
- pgoutput as standard plugin - built-in since PG 10+, no dependencies, Aurora/RDS compatible (06-01)
- REPLICA IDENTITY DEFAULT recommended - FULL only for full row history (30-50% additional WAL overhead) (06-01)
- max_slot_wal_keep_size mandatory for production CDC - prevents disk exhaustion (06-01)
- pg_replication_slots monitoring query with lag_bytes and wal_status for slot health (06-01)
- DB Cluster vs DB Instance parameter group distinction critical for Aurora CDC (06-02)
- Heartbeat interval 10 seconds recommended for Aurora failover detection (06-02)
- Four mitigation strategies for Aurora failover data loss: accept risk, incremental snapshot, global db, outbox (06-02)
- PostgreSQL 17 failover slots as future solution, Aurora adoption timeline unclear (06-02)
- Chunk size 512 for lab demo visibility, production uses 2048-4096 (06-03)
- Signaling table pattern: id/type/data schema for Debezium commands (06-03)
- snapshot.mode=never with manual incremental trigger for teaching clarity (06-03)
- Debezium 2.5.4 lacks per-table metrics - mention as 3.0+ future enhancement (07-01)
- Alert thresholds: 5s warning, 30s critical for MilliSecondsBehindSource (07-01)
- Queue utilization thresholds: 80% warning, 95% critical (07-01)
- Dashboard threshold alignment: gauge/graph thresholds match alert thresholds (07-02)
- Alert "for" duration: 2m warning, 5m critical to prevent alert storms (07-02)
- Queue utilization formula: 100 * (1 - Remaining/Total) for percentage display (07-02)
- 15s auto-refresh for Grafana dashboards matching Prometheus scrape interval (07-02)
- pg_logical_emit_message() over heartbeat table for PostgreSQL 14+ (07-03)
- tasks.max=1 for PostgreSQL connector is architectural constraint, not configurable (07-03)
- REST API offset management (Kafka 3.6+) as primary method for production DR (07-03)
- Quarterly DR drill schedule recommended (07-03)
- Groovy for Filter SMT (most common in documentation examples) (08-01)
- Standard SMT order: Filter → Unwrap → Route → Mask (08-01)
- Predicates before Filter SMT for simple topic/tombstone filtering (08-01)
- Always check value.after != null in Groovy for DELETE events (08-01)
- Outbox Pattern taught as eventual consistency solution, NOT distributed transactions (08-03)
- At-least-once delivery requires consumer idempotency (database-backed for production) (08-03)
- DELETE-in-transaction cleanup recommended for course simplicity, external job for scale (08-03)
- table.expand.json.payload=true for structured JSON (not string) (08-03)
- Single outbox table supports multiple aggregate types via aggregatetype routing (08-03)
- BACKWARD compatibility mode default for CDC (consumers easier to upgrade than producers) (08-04)
- Debezium 2.x requires manual Avro converter JAR installation (5 libraries from Confluent) (08-04)
- Type changes never safe - require ADD new column → backfill → DROP old workflow (08-04)
- Compatibility testing API mandatory before production schema changes (08-04)
- Nullable columns with defaults for BACKWARD-safe additions (08-04)
- At-least-once as default teaching pattern, exactly-once as advanced (09-01)
- Manual offset store pattern: enable.auto.offset.store=False + consumer.store_offsets() (09-01)
- Transactional API for exactly-once: isolation.level=read_committed + send_offsets_to_transaction (09-01)
- Fatal vs non-fatal error distinction using msg.error().fatal() (09-01)
- Pandas 3.0 patterns only: str dtype, CoW with .loc[], microsecond datetime (09-01)
- Manual CDC flattening as primary, json_normalize as alternative for complex schemas (09-01)
- DELETE event handling: after=null, use before field for data extraction (09-01)
- foreachBatch pattern for PySpark writes to external stores (no direct feature store connectors) (09-04)
- Dual write strategy: online store (Redis) + offline store (Parquet) for ML consistency (09-04)
- 30-day window for customer behavior features, 7-day for product metrics (09-04)
- Watermark 1 hour for late-arriving events in feature pipelines (09-04)
- PyFlink Table API preferred over DataStream API for CDC (SQL DDL more accessible to data engineers) (09-02)
- Watermark allowed lateness 5-10 seconds for CDC workloads (balances completeness and latency) (09-02)
- Teach all three window types (tumbling, sliding, session) for comprehensive analytics capabilities (09-02)
- Temporal join (FOR SYSTEM_TIME AS OF) as correct pattern for versioned dimension enrichment (09-02)
- 10-minute watermark as default for CDC aggregations balancing completeness vs latency (09-03)
- ELT pattern (load raw, transform in warehouse) emphasized over traditional ETL for modern data engineering (09-03)
- Delta Lake recommended for ACID upserts, Parquet for append-only CDC history (09-03)
- PySpark at-least-once limitation for Kafka sink explicitly documented (vs PyFlink exactly-once) (09-03)
- Standard metadata columns: _operation, _cdc_timestamp, _processed_at for CDC data lake (09-03)
- cloudsql.logical_decoding flag for Cloud SQL instead of direct postgresql.conf (10-01)
- pgoutput plugin standard for Cloud SQL CDC - built-in, no dependencies (10-01)
- cloudsqlsuperuser role instead of full SUPERUSER for managed PostgreSQL (10-01)
- Debezium Server Kafka-less architecture as GCP-native CDC pattern (10-01)
- File-based offset storage with PersistentVolumeClaim for single-instance Debezium Server (10-01)
- 10-second heartbeat interval mandatory for WAL bloat prevention (10-01)
- Topic naming convention {prefix}.{schema}.{table} requires exact case-sensitive matching (10-01)
- Workload Identity over service account key files for GKE authentication (10-02)
- Secret Manager for database credentials instead of environment variables (10-02)
- At-least-once Dataflow mode recommended for cost optimization (MERGE handles duplicates) (10-02)
- Two-table BigQuery pattern: changelog (staging) + replica for current state (10-02)
- updateFrequencySecs=60 as default MERGE frequency for near-real-time consistency (10-02)
- Managed template preferred over custom Dataflow pipeline for standard CDC use cases (10-02)
- Separate triggers per topic recommended for independent scaling and isolation (10-03)
- At-least-once Pub/Sub delivery requires idempotent handler design with message_id tracking (10-03)
- Cloud Run concurrency 80 for I/O-bound processing, 10-20 for CPU-bound (10-03)
- Custom replication slot monitoring via Cloud Function for WAL lag tracking (10-03)
- PodMonitoring CRD for Debezium JMX metrics export to Cloud Monitoring (10-03)
- Alert hierarchy: CRITICAL (PagerDuty) vs WARNING (email/Slack) (10-03)

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Fix hamburger navigation dual module display | 2026-02-01 | 19f5ea8 | [001-fix-hamburger-navigation](./quick/001-fix-hamburger-navigation/) |
| 002 | Remove duplicate course roadmap | 2026-02-01 | 642fe5f | [002-remove-course-roadmap](./quick/002-remove-course-roadmap/) |
| 003 | Collapsible sidebar modules | 2026-02-01 | 50b366a | [003-collapsible-sidebar-modules](./quick/003-collapsible-sidebar-modules/) |

## Session Continuity

Last session: 2026-02-01
Stopped at: Completed 10-03-PLAN.md (Cloud Run Event Processing & Monitoring)
Resume file: None

---
*State initialized: 2026-01-31*
*Last updated: 2026-02-01*
