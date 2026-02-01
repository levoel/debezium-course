---
phase: 17-multi-database-capstone
plan: 02
subsystem: education
tags: [debezium, postgresql, mysql, pyflink, kafka-connect, multi-database, cdc]

# Dependency graph
requires:
  - phase: 17-01
    provides: Multi-database CDC architecture concepts and patterns
  - phase: 12-01
    provides: MySQL/Aurora MySQL connector configuration knowledge
  - phase: 13-01
    provides: PostgreSQL connector configuration knowledge
provides:
  - Complete PostgreSQL connector configuration for multi-database deployment
  - Complete MySQL connector configuration with unique server.id and schema history topic
  - PyFlink multi-source consumer with UNION ALL pattern
  - Unified topic naming scheme for source traceability
  - Monitoring guidance for multi-database connectors
  - Troubleshooting guide for common multi-database issues
affects: [17-03-multi-database-checklist, capstone-extension]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Separate topics architecture with database prefix (postgres/mysql)"
    - "PyFlink UNION ALL for multi-source stream consolidation"
    - "source_database tracking column for audit trail"
    - "Composite key strategy (PG-/MY- prefix) to prevent conflicts"
    - "Database-specific monitoring (PostgreSQL WAL lag bytes vs MySQL time lag ms)"

key-files:
  created:
    - src/content/course/07-module-7/05-multi-database-configuration.mdx
  modified: []

key-decisions:
  - "Separate topics per database (postgres/mysql prefix) for source traceability"
  - "PyFlink UNION ALL pattern for unified processing with source tracking"
  - "Composite key strategy to prevent order_id conflicts across databases"
  - "Database-specific monitoring metrics (WAL lag vs time lag)"

patterns-established:
  - "MySQL Outbox Table: UUID() syntax, JSON type (not JSONB), no REPLICA IDENTITY needed"
  - "PostgreSQL connector: database.server.name=postgres_prod, slot.name=debezium_outbox_slot_pg"
  - "MySQL connector: database.server.id=184054, schema.history.internal.kafka.topic=schema-changes.mysql-outbox"
  - "Topic naming: outbox.event.{database}.{aggregate} pattern"
  - "PyFlink source_database column for origin tracking"
  - "Isolation testing: verify each connector independently before unified processing"

# Metrics
duration: 5min
completed: 2026-02-01
---

# Phase 17 Plan 02: Multi-Database Configuration Summary

**Complete copy-paste ready configuration for PostgreSQL and MySQL connectors with PyFlink unified consumer, monitoring, and troubleshooting**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-01T14:01:58Z
- **Completed:** 2026-02-01T14:06:30Z
- **Tasks:** 2 (executed as 1 atomic file creation + 1 fix)
- **Files modified:** 1

## Accomplishments

- Created comprehensive multi-database configuration lesson (695 lines)
- Complete PostgreSQL connector JSON config with Outbox Event Router SMT
- Complete MySQL connector JSON config with unique server.id (184054) and schema history topic
- PyFlink multi-source consumer with UNION ALL pattern and source tracking
- Monitoring architecture with database-specific metrics (PostgreSQL WAL lag, MySQL time lag)
- Verification checklist for infrastructure and event flow
- Troubleshooting guide with 8 common issues and remediation steps

## Task Commits

Each task was committed atomically:

1. **Task 1: Create configuration lesson structure with connector configs** - `312dad3` (feat)
   - Included MySQL outbox DDL, PostgreSQL connector config, MySQL connector config
   - Also included PyFlink consumer, monitoring, verification checklist, troubleshooting (originally planned for Task 2)

2. **Task 1 Fix: Correct Callout component type prop** - `5be4b59` (fix)
   - Fixed Callout type="info" → type="note" (component only supports note/tip/warning/danger)
   - Removed title prop (not supported), used bold text instead
   - Build now passes

**Plan metadata:** Not yet committed (will be committed in final_commit step)

_Note: Tasks 1 and 2 were executed atomically - full lesson content created in single file write for efficiency_

## Files Created/Modified

- `src/content/course/07-module-7/05-multi-database-configuration.mdx` (695 lines) - Complete configuration guide with:
  - MySQL Outbox Table Schema DDL
  - PostgreSQL Connector Configuration (full JSON)
  - MySQL Connector Configuration (full JSON with server.id and schema history topic)
  - Deploying Both Connectors (curl commands, verification)
  - PyFlink Multi-Source Consumer (complete Python code with UNION ALL)
  - Monitoring Multi-Database Connectors (architecture diagram, metrics)
  - Verification Checklist (infrastructure + event flow)
  - Common Issues and Troubleshooting (8 issues with remediation)
  - Key Takeaways (10 critical points)

## Decisions Made

1. **Separate topics architecture chosen as primary pattern** - Clear source traceability, independent schema evolution, simpler troubleshooting (vs unified topics with ByLogicalTableRouter complexity)

2. **Database prefix in topic naming** - `outbox.event.postgres.{aggregate}` vs `outbox.event.mysql.{aggregate}` enables quick source identification

3. **source_database column in PyFlink consumer** - Mandatory for troubleshooting, audit trail, conditional processing, and monitoring

4. **Composite key strategy documented** - `PG-{order_id}` vs `MY-{order_id}` prevents conflicts if same IDs exist in both databases

5. **Database-specific monitoring approach** - PostgreSQL WAL lag (bytes) vs MySQL time lag (milliseconds) require separate alert thresholds

6. **Isolation testing emphasized** - Verify each connector independently before unified processing to simplify troubleshooting

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Callout component type prop**
- **Found during:** Build verification after Task 1
- **Issue:** Used `type="info"` but Callout component only supports 'note' | 'tip' | 'warning' | 'danger'
- **Fix:** Changed all `type="info"` to `type="note"`, removed `title` prop (not supported)
- **Files modified:** src/content/course/07-module-7/05-multi-database-configuration.mdx
- **Verification:** npm run build passes without TypeError
- **Committed in:** 5be4b59 (separate fix commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Component API compliance fix, no scope change. Build error would have blocked deployment.

## Issues Encountered

None - plan executed smoothly. Task 1 included all Task 2 content atomically for efficiency (PyFlink consumer, monitoring, verification, troubleshooting all created in single file write).

## User Setup Required

None - no external service configuration required. Lesson provides copy-paste ready configuration for learners to use in their capstone extension.

## Next Phase Readiness

**Ready for 17-03 (Multi-Database Checklist Extension):**
- Complete connector configurations documented
- PyFlink consumer pattern established
- Monitoring guidance provided
- Troubleshooting reference available

**Learner can now:**
- Deploy both PostgreSQL and MySQL connectors
- Create unified PyFlink consumer processing events from both databases
- Monitor multi-database CDC pipeline
- Diagnose common multi-database issues

**Extension points for 17-03:**
- Checklist items for multi-database success criteria
- Testing procedures for cross-database scenarios
- Documentation templates for multi-database architecture
- Production readiness requirements for multi-connector deployments

---
*Phase: 17-multi-database-capstone*
*Completed: 2026-02-01*
