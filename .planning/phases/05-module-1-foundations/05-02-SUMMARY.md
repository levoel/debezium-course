---
phase: 05-module-1-foundations
plan: 02
subsystem: content
tags: [docker, lab-setup, debezium, postgresql, kafka-connect, rest-api]

# Dependency graph
requires:
  - phase: 05-01
    provides: "Foundation lessons (CDC fundamentals, Debezium architecture)"
  - phase: 04-lab-infrastructure
    provides: "Docker Compose stack with PostgreSQL, Kafka, Connect, monitoring"
provides:
  - "Lab setup lesson with Docker Compose instructions and port reference"
  - "First connector lesson with PostgreSQL deployment via REST API"
  - "Step-by-step verification commands for all services"
  - "Live CDC capture demonstration (INSERT/UPDATE/DELETE)"
affects: ["05-03", "05-04", "05-05", "05-06", "module-2"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Internal vs external Docker ports documentation"
    - "Service verification tables in lessons"
    - "Sequential Mermaid diagrams for event flow"

key-files:
  created:
    - "src/content/course/module-1/03-lab-setup.mdx"
    - "src/content/course/module-1/04-first-connector.mdx"
  modified: []

key-decisions:
  - "Explicit internal/external port distinction in documentation"
  - "Two-terminal pattern for live change capture demo"
  - "Include replication slot monitoring for operational awareness"

patterns-established:
  - "Port reference table: external port for host access, internal port for Docker networking"
  - "Connector config explanation via table format"
  - "Troubleshooting section with common errors and solutions"

# Metrics
duration: 3min
completed: 2026-01-31
---

# Phase 5 Plan 2: Lab Setup and First Connector Summary

**Docker Compose lab setup instructions with correct port mappings (5433/5432) and PostgreSQL connector deployment via Kafka Connect REST API with live CDC capture demo**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-31T22:11:26Z
- **Completed:** 2026-01-31T22:14:02Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments

- Lab setup lesson with complete Docker Compose workflow (up, down, ps, logs)
- Service verification table covering all 7 services with commands and expected results
- First connector lesson with copy-pasteable curl commands for PostgreSQL connector
- Clear distinction between internal Docker ports (5432) and external host ports (5433)
- Live change capture demonstration with INSERT/UPDATE/DELETE examples
- Troubleshooting guides for common issues (port conflicts, replication slots)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Lab Setup Lesson** - `4ddab98` (feat)
2. **Task 2: Create First Connector Lesson** - `d1ee419` (feat)

## Files Created

- `src/content/course/module-1/03-lab-setup.mdx` (273 lines) - Docker Compose setup, service verification, troubleshooting
- `src/content/course/module-1/04-first-connector.mdx` (347 lines) - PostgreSQL connector deployment, live CDC demo

## Decisions Made

1. **Internal vs external port emphasis** - Explicitly called out that database.port: 5432 is internal Docker port, not external 5433
2. **Two-terminal demo pattern** - Used parallel terminals (consumer + producer) for live change capture demonstration
3. **Replication slot monitoring** - Included pg_replication_slots query to teach operational awareness
4. **Conflict handling in test data** - Added ON CONFLICT DO NOTHING to customers INSERT for idempotent lesson execution

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all services and verification commands verified against existing lab infrastructure.

## User Setup Required

None - no external service configuration required. All services run in Docker.

## Next Phase Readiness

- Lab setup and first connector lessons complete
- Students can now start Docker environment and deploy working connector
- Ready for Python consumer lesson (05-03) which will read from the topics created here
- Connector configuration patterns established for future lessons

---
*Phase: 05-module-1-foundations*
*Completed: 2026-01-31*
