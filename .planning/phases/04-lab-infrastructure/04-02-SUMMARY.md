---
phase: 04-lab-infrastructure
plan: 02
subsystem: infra
tags: [prometheus, grafana, jmx, debezium, monitoring, docker]

# Dependency graph
requires:
  - phase: 04-lab-infrastructure
    provides: docker-compose.yml with JMX port 9404 exposed on connect service
provides:
  - Prometheus scrape configuration for Kafka Connect JMX metrics
  - Grafana auto-provisioning for datasources and dashboards
  - Debezium monitoring dashboard with connector status, metrics, and lag panels
affects: [04-lab-infrastructure, content-modules]

# Tech tracking
tech-stack:
  added: [prometheus, grafana]
  patterns: [grafana-provisioning, prometheus-scrape-config, jmx-metrics-export]

key-files:
  created:
    - labs/monitoring/prometheus.yml
    - labs/monitoring/grafana/provisioning/datasources/datasource.yml
    - labs/monitoring/grafana/provisioning/dashboards/dashboard.yml
    - labs/monitoring/grafana/dashboards/debezium-connect.json

key-decisions:
  - "15s scrape interval for Prometheus (balanced between granularity and overhead)"
  - "Metric relabeling to keep only kafka_connect_* and debezium_* metrics"
  - "Grafana datasource set to non-editable (provisioned, not user-created)"
  - "Dashboard includes connector variable for filtering multiple connectors"

patterns-established:
  - "Grafana provisioning: apiVersion 1 format for datasources and dashboard providers"
  - "Dashboard path: /var/lib/grafana/dashboards for provisioned dashboards"
  - "JMX scrape target: connect:9404 as Docker network hostname"

# Metrics
duration: 2.6min
completed: 2026-01-31
---

# Phase 04 Plan 02: Monitoring Stack Summary

**Prometheus and Grafana monitoring stack for Debezium CDC metrics with auto-provisioned dashboard showing connector status, records polled rate, and lag metrics**

## Performance

- **Duration:** 2.6 min (158 seconds)
- **Started:** 2026-01-31T21:15:31Z
- **Completed:** 2026-01-31T21:18:09Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Prometheus configuration scraping JMX metrics from Kafka Connect at connect:9404
- Grafana auto-provisioning setup with Prometheus datasource and dashboard discovery
- Comprehensive Debezium dashboard with 7 panels covering connector health and performance

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Prometheus configuration** - `5fa7530` (feat)
2. **Task 2: Create Grafana provisioning configuration** - `cb21507` (feat)
3. **Task 3: Create Debezium monitoring dashboard** - `4d02664` (feat)

## Files Created/Modified
- `labs/monitoring/prometheus.yml` - Prometheus scrape config for JMX metrics
- `labs/monitoring/grafana/provisioning/datasources/datasource.yml` - Prometheus datasource auto-config
- `labs/monitoring/grafana/provisioning/dashboards/dashboard.yml` - Dashboard auto-discovery provider
- `labs/monitoring/grafana/dashboards/debezium-connect.json` - 7-panel Debezium monitoring dashboard

## Dashboard Panels

The Debezium Connect Monitoring dashboard includes:
1. **Connector Status** - Running/Paused/Failed state indicator
2. **Task Count** - Number of active connector tasks
3. **Total Records Polled** - Cumulative record count
4. **Records Polled Rate** - Per-minute poll rate graph
5. **Active Records in Buffer** - Current buffer utilization
6. **Connector Lag** - MilliSecondsBehindSource timeseries
7. **Poll Batch Average Time** - Batch processing latency

## Decisions Made
- 15s scrape interval balances granularity with overhead
- Metric relabeling filters to kafka_connect_* and debezium_* only
- Grafana datasource marked non-editable (managed via provisioning)
- Dashboard uses connector variable for multi-connector filtering

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. Monitoring stack starts with docker compose.

## Next Phase Readiness
- Monitoring configuration complete and ready for integration testing
- Dashboard will auto-provision when Grafana container starts
- Next: Docker Compose integration to add prometheus and grafana services

---
*Phase: 04-lab-infrastructure*
*Completed: 2026-01-31*
