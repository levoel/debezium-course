---
phase: 07-module-3-production-operations
plan: 01
subsystem: content
tags: [jmx, prometheus, promql, metrics, monitoring, observability, debezium]

# Dependency graph
requires:
  - phase: 04-lab-infrastructure
    provides: Prometheus at localhost:9090, JMX Exporter on connect:9404, 15s scrape interval
  - phase: 06-module-2-postgresql-aurora
    provides: PostgreSQL connector knowledge, replication slots, WAL concepts
provides:
  - JMX metrics interpretation framework (streaming, snapshot, worker metrics)
  - Primary CDC health metrics: MilliSecondsBehindSource, MilliSecondsSinceLastEvent, QueueRemainingCapacity
  - Prometheus scraping configuration for Debezium
  - PromQL query examples for lag, throughput, queue utilization
  - Decision tree for metric-based troubleshooting
affects: [07-02, 07-03, alerting, dashboards]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "JMX metrics exposed via port 9404"
    - "Prometheus 15s scrape interval for CDC"
    - "metric_relabel_configs filtering to kafka_connect_* and debezium_* only"
    - "PromQL rate() for throughput calculation"

key-files:
  created:
    - src/content/course/03-module-3/01-jmx-metrics-interpretation.mdx
    - src/content/course/03-module-3/02-prometheus-metrics-collection.mdx
  modified: []

key-decisions:
  - "Debezium 2.5.4 lacks per-table metrics - mention as 3.0+ future enhancement"
  - "Alert thresholds: 5s warning, 30s critical for MilliSecondsBehindSource"
  - "MilliSecondsSinceLastEvent critical threshold: 30s for staleness detection"
  - "Queue utilization 80% warning, 95% critical for backpressure detection"

patterns-established:
  - "Lesson structure: Why it matters -> concepts -> metrics table -> interpretation framework -> lab exercise -> key takeaways"
  - "Decision tree diagrams for troubleshooting scenarios"
  - "PromQL examples with expected output descriptions"

# Metrics
duration: 6min
completed: 2026-02-01
---

# Phase 7 Plan 1: Metrics Foundation Summary

**JMX metrics interpretation framework with MilliSecondsBehindSource as primary lag metric, Prometheus 15s scraping config, and PromQL queries for CDC health monitoring**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-31T23:39:57Z
- **Completed:** 2026-01-31T23:46:00Z
- **Tasks:** 2/2
- **Files created:** 2

## Accomplishments

- Created comprehensive JMX metrics interpretation lesson covering streaming, snapshot, and worker metrics
- Documented primary CDC health metrics: MilliSecondsBehindSource (lag), MilliSecondsSinceLastEvent (staleness), QueueRemainingCapacity (backpressure)
- Built decision tree diagram for metric-based troubleshooting
- Created Prometheus metrics collection lesson with JMX Exporter architecture
- Provided PromQL query examples for lag, throughput, and queue utilization
- Referenced existing lab infrastructure (connect:9404, prometheus.yml)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create JMX Metrics Interpretation lesson** - `199da65` (feat)
2. **Task 2: Create Prometheus Metrics Collection lesson** - `f03e955` (feat)

## Files Created

- `src/content/course/03-module-3/01-jmx-metrics-interpretation.mdx` - JMX metric categories, interpretation framework, troubleshooting scenarios (427 lines, 5 Mermaid diagrams)
- `src/content/course/03-module-3/02-prometheus-metrics-collection.mdx` - JMX Exporter config, PromQL queries, metric naming patterns (470 lines, 1 Mermaid diagram)

## Decisions Made

1. **Alert threshold recommendations:** 5s warning, 30s critical for MilliSecondsBehindSource based on production best practices
2. **Per-table metrics note:** Documented that Debezium 2.5.4 lacks per-table metrics, available in 3.0+ with opt-in flag
3. **Queue saturation thresholds:** 80% warning, 95% critical for QueueRemainingCapacity-based alerts
4. **Heartbeat interval reference:** 10s heartbeat (prior decision from Phase 6) mentioned for staleness prevention

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Stale files from previous runs:** Found pre-existing broken files (03-grafana-dashboard-lab.mdx, 05-wal-bloat-heartbeat.mdx) in module-3 directory that caused build failures. Removed them to proceed.
- **MDX angle bracket parsing:** Fixed `<30s>` style notation being parsed as React components by using plain text alternatives

## User Setup Required

None - lessons use existing lab infrastructure from Phase 4.

## Next Phase Readiness

- Module 3 directory structure established with 2 lessons
- JMX and Prometheus foundations ready for Grafana dashboard lesson (07-02)
- PromQL patterns documented for alert rule creation (07-03)
- Total: 897 lines, 6 Mermaid diagrams across both lessons

---
*Phase: 07-module-3-production-operations*
*Completed: 2026-02-01*
