---
phase: 07-module-3-production-operations
plan: 03
subsystem: content
tags: [wal-management, heartbeat, scaling, tasks.max, disaster-recovery, offsets, runbooks]

# Dependency graph
requires:
  - phase: 06-module-2-postgresql-aurora
    provides: WAL configuration, replication slots, max_slot_wal_keep_size decision
  - phase: 07-module-3-production-operations
    plan: 01
    provides: JMX metrics interpretation
  - phase: 07-module-3-production-operations
    plan: 02
    provides: Prometheus collection, Grafana dashboards, alerting
provides:
  - Multi-layer WAL bloat defense (heartbeat + monitoring + runbooks)
  - tasks.max myth busted for PostgreSQL connector
  - Three real scaling strategies (multiple connectors, downstream, tuning)
  - Offset backup/restore procedures (REST API and kafka-console-consumer)
  - Orphaned slot cleanup procedures
  - DR drill checklist and runbook template
affects: [capstone-project, future-production-deployments]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - pg_logical_emit_message for heartbeat (PostgreSQL 14+)
    - REST API offset management (Kafka Connect 3.6+)
    - Quarterly DR drill practice

key-files:
  created:
    - src/content/course/03-module-3/05-wal-bloat-heartbeat.mdx
    - src/content/course/03-module-3/06-connector-scaling-tasks.mdx
    - src/content/course/03-module-3/07-disaster-recovery-procedures.mdx
  modified: []

key-decisions:
  - "pg_logical_emit_message() recommended over heartbeat table for PostgreSQL 14+"
  - "10s heartbeat interval standard for Aurora failover detection"
  - "tasks.max limitation explicitly documented as PostgreSQL architectural constraint"
  - "REST API offset management (Kafka 3.6+) as primary method for production"
  - "Quarterly DR drill schedule recommended"

patterns-established:
  - "Multi-layer defense pattern for WAL bloat (parameter + heartbeat + monitoring + runbooks)"
  - "Decision framework pattern for scaling strategy selection"
  - "DR drill checklist pattern for quarterly practice"

# Metrics
duration: 10min
completed: 2026-02-01
---

# Phase 7 Plan 3: Operational Procedures Summary

**WAL bloat prevention with heartbeat configuration, PostgreSQL single-task scaling strategies, and production DR runbooks with offset backup/restore procedures**

## Performance

- **Duration:** 10 min
- **Started:** 2026-01-31T23:40:04Z
- **Completed:** 2026-01-31T23:50:51Z
- **Tasks:** 3
- **Files created:** 3

## Accomplishments

- Multi-layer WAL bloat defense documentation with heartbeat configuration via pg_logical_emit_message()
- Explicitly busted tasks.max myth for PostgreSQL connector with architectural explanation
- Three real scaling strategies: multiple connectors, downstream parallelization, performance tuning
- Complete offset backup/restore procedures using both kafka-console-consumer and REST API (Kafka 3.6+)
- Orphaned slot detection and safe cleanup procedures
- DR drill checklist template for quarterly practice

## Task Commits

Each task was committed atomically:

1. **Task 1: Create WAL Bloat and Heartbeat lesson** - `3bf58a9` (feat)
2. **Task 2: Create Connector Scaling and Tasks lesson** - `47fdebc` (feat)
3. **Task 3: Create Disaster Recovery Procedures lesson** - `01e9d7b` (feat)

## Files Created

- `src/content/course/03-module-3/05-wal-bloat-heartbeat.mdx` - Multi-layer WAL defense, heartbeat configuration, slot monitoring (534 lines)
- `src/content/course/03-module-3/06-connector-scaling-tasks.mdx` - tasks.max myth busted, scaling strategies, performance tuning (537 lines)
- `src/content/course/03-module-3/07-disaster-recovery-procedures.mdx` - Offset backup/restore, slot cleanup, DR drill procedures (588 lines)

**Total:** 1659 lines, 12 Mermaid diagrams

## Decisions Made

1. **pg_logical_emit_message() over heartbeat table** - Cleaner approach for PostgreSQL 14+, no table needed
2. **10s heartbeat interval** - Consistent with prior Aurora failover detection decision
3. **REST API as primary offset management** - Kafka Connect 3.6+ provides clean API for backup/restore
4. **Quarterly DR drill schedule** - Regular practice ensures procedures work when needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all three lessons built and validated successfully.

## Next Phase Readiness

- Module 3 content complete (7 lessons total across 3 plans)
- All lessons link appropriately to Phase 6 WAL/slot content
- Ready for Phase 8 (Module 4) or capstone project
- Lab environment fully documented for all operational procedures

---
*Phase: 07-module-3-production-operations*
*Completed: 2026-02-01*
