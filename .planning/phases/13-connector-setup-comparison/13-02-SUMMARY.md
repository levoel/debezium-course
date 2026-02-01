---
phase: 13-connector-setup-comparison
plan: 02
subsystem: education-content
tags: [mysql, postgresql, binlog, wal, cdc, comparison, debezium]

# Dependency graph
requires:
  - phase: 12-mysql-infrastructure
    provides: MySQL binlog fundamentals (architecture, GTID, retention)
  - phase: 02-postgresql-aurora
    provides: PostgreSQL WAL and replication slots knowledge
provides:
  - Comprehensive architectural comparison between MySQL binlog and PostgreSQL WAL for CDC
  - Understanding of position tracking differences (server-side vs client-side)
  - Schema evolution handling comparison (implicit vs explicit)
  - Failover behavior patterns for both databases
  - Common misconceptions documentation
affects:
  - 13-03 (schema history topic deep dive)
  - Future MySQL production operations lessons
  - Learners transitioning between PostgreSQL and MySQL CDC

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Comparison-based learning leveraging Module 2 PostgreSQL knowledge"
    - "Side-by-side Mermaid sequence diagrams for architectural differences"
    - "Common misconceptions table format"

key-files:
  created:
    - src/content/course/08-module-8/05-binlog-wal-comparison.mdx
  modified: []

key-decisions:
  - "Position tracking presented as fundamental architectural difference (server-side vs client-side)"
  - "Schema history topic positioned as MySQL-only requirement (no PostgreSQL equivalent)"
  - "GTID mode emphasized for failover advantages over file:offset"
  - "Common misconceptions table addresses PostgreSQL-to-MySQL knowledge transfer issues"

patterns-established:
  - "Comparison table followed by deep-dive sections for each aspect"
  - "Mermaid diagrams show side-by-side behavior for PostgreSQL vs MySQL"
  - "References to Module 2 throughout to bridge knowledge"

# Metrics
duration: 5min
completed: 2026-02-01
---

# Phase 13 Plan 02: Binlog vs WAL Comparison Summary

**Comprehensive architectural comparison (619 lines) bridging PostgreSQL WAL knowledge from Module 2 to MySQL binlog concepts with position tracking, schema evolution, failover, and monitoring differences**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-01T12:50:47Z
- **Completed:** 2026-02-01T12:55:51Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created comprehensive binlog vs WAL comparison lesson (619 lines, 350+ target met)
- Documented position tracking differences: server-side (PostgreSQL slots) vs client-side (MySQL Kafka offsets)
- Explained schema evolution handling: implicit (PostgreSQL WAL) vs explicit (MySQL schema.history topic)
- 5 Mermaid diagrams visualizing architectural differences
- Common misconceptions table addressing PostgreSQL-to-MySQL knowledge transfer issues
- Multiple references to Module 2 PostgreSQL lessons throughout

## Task Commits

1. **Task 1: Create binlog vs WAL comparison lesson** - `aab5188` (feat)

## Files Created/Modified

- `src/content/course/08-module-8/05-binlog-wal-comparison.mdx` - Comprehensive architectural comparison between MySQL binlog and PostgreSQL WAL for CDC

## Decisions Made

**Position tracking as core difference:** Emphasized that PostgreSQL uses server-side position tracking (replication slots hold WAL) while MySQL uses client-side tracking (Kafka Connect offsets). This is the most fundamental architectural difference affecting all other behaviors.

**Schema history topic as MySQL-only requirement:** Clearly documented that PostgreSQL embeds schema in each WAL message (no external dependency) while MySQL requires dedicated `schema.history.internal.kafka.topic` with infinite retention.

**GTID mode for production MySQL:** Positioned GTID as mandatory for production failover scenarios, contrasting with PostgreSQL replication slot migration complexity.

**Common misconceptions table:** Created dedicated section addressing false assumptions when transferring PostgreSQL knowledge to MySQL (e.g., "MySQL has replication slots" - false, "PostgreSQL needs schema history topic" - false).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Content created following established lesson structure from Phase 12 MySQL lessons and Module 2 PostgreSQL lessons.

## Next Phase Readiness

**Ready for 13-03:** Schema history topic deep dive can now reference this lesson's explanation of why MySQL needs it (vs PostgreSQL which doesn't).

**Learner context established:** Students transitioning from PostgreSQL (Module 2) to MySQL (Module 8) now have explicit architectural comparison preventing common misconceptions.

**No blockers:** All comparison aspects documented. Monitoring metrics table provides operational reference. Failover behavior diagrams show both databases' approaches.

---
*Phase: 13-connector-setup-comparison*
*Completed: 2026-02-01*
