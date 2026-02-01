---
phase: 17-multi-database-capstone
plan: 03
subsystem: course-content
tags: [multi-database, self-assessment, production-readiness, checklist, mysql, postgresql]

# Dependency graph
requires:
  - phase: 17-01
    provides: Multi-database architecture lesson (separate vs unified topics patterns)
  - phase: 17-02
    provides: Multi-database configuration lesson (PostgreSQL + MySQL implementation)
provides:
  - Extended self-assessment with Section 8 multi-database checklist
  - Multi-database common mistakes (shared schema history, duplicate server.name, recovery procedures)
  - Recovery comparison table (PostgreSQL vs MySQL)
  - Multi-database scoring criteria
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - src/content/course/07-module-7/03-self-assessment.mdx

key-decisions:
  - "Separate topics architecture chosen as primary pattern for capstone extension (referenced in lesson 04)"
  - "MySQL outbox table uses JSON type (not JSONB like PostgreSQL)"
  - "PyFlink UNION ALL pattern for multi-source stream consolidation"
  - "source_database column mandatory for tracing event origin in unified consumer"

patterns-established:
  - "Multi-database checklist follows same structure as single-database sections (consistency)"
  - "Common mistakes include connector-specific recovery procedure differences"
  - "Recovery comparison table format for documenting PostgreSQL vs MySQL differences"

# Metrics
duration: 2min
completed: 2026-02-01
---

# Phase 17 Plan 03: Multi-Database Self-Assessment Summary

**Self-assessment extended with Section 8 multi-database checklist, 3 multi-database common mistakes, recovery comparison table, and multi-database scoring criteria**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-01T14:10:23Z
- **Completed:** 2026-02-01T14:12:58Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Section 8: Multi-Database Integration checklist with 6 verification categories (MySQL outbox, connector unique identifiers, topic naming, PyFlink UNION ALL, monitoring, trade-offs)
- Common mistakes 7-9 for multi-database scenarios (shared schema history topic, duplicate database.server.name, connector-specific recovery)
- Recovery comparison table documenting PostgreSQL vs MySQL differences
- Multi-database extension scoring criteria (Exemplary and Meets Expectations)
- Cross-references to lessons 04-multi-database-architecture and 05-multi-database-configuration

## Task Commits

Each task was committed atomically:

1. **Task 1: Add multi-database capstone extension section to self-assessment** - `40c789b` (feat)
2. **Task 2: Add multi-database common mistakes and update key takeaways** - `8807316` (feat)

## Files Created/Modified
- `src/content/course/07-module-7/03-self-assessment.mdx` - Extended with multi-database capstone section (Section 8 checklist, mistakes 7-9, recovery table, key takeaways 11-14)

## Decisions Made

**1. MySQL outbox payload type: JSON (not JSONB)**
- Rationale: MySQL 8.0 uses JSON type (not JSONB like PostgreSQL)
- Documented in Section 8 checklist for learner awareness

**2. Unique identifiers mandatory for multi-database**
- `database.server.id` range 184000-184999 for Debezium connectors (avoid MySQL cluster conflicts)
- `database.server.name` with naming convention: `{database_type}_{environment}` (e.g., `postgres_prod`, `mysql_prod`)
- `schema.history.internal.kafka.topic` unique per MySQL connector (CRITICAL: shared topic = DDL pollution)

**3. Topic naming scheme for traceability**
- PostgreSQL: `outbox.event.postgres.{aggregate}`
- MySQL: `outbox.event.mysql.{aggregate}`
- Pattern enables source identification and troubleshooting

**4. Recovery procedure documentation split by connector type**
- PostgreSQL: replication slots (server-side position tracking)
- MySQL: schema history topic + GTID/binlog position (client-side tracking)
- Comparison table documents key differences (position loss, WAL/binlog purge, restart)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - both tasks completed without issues. Build passed successfully.

## Next Phase Readiness

Phase 17 complete (3/3 plans done).

**Multi-database capstone extension fully documented:**
- Lesson 04: Architecture patterns (separate vs unified topics)
- Lesson 05: Configuration implementation (PostgreSQL + MySQL)
- Lesson 03: Self-assessment checklist (Section 8 + mistakes + scoring)

**Learners who complete Module 8 (MySQL) now have:**
- Clear architecture comparison (17-01)
- Practical implementation guide (17-02)
- Concrete verification checklist (17-03 Section 8)
- Common pitfalls documented (mistakes 7-9)
- Scoring criteria for self-evaluation

**Ready for:** Phase 18 (final phase in v1.1 roadmap)

---
*Phase: 17-multi-database-capstone*
*Completed: 2026-02-01*
