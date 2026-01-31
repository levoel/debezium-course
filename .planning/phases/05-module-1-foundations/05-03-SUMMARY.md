---
phase: 05-module-1-foundations
plan: 03
subsystem: content
tags: [python, confluent-kafka, cdc, debezium, consumer, event-structure]

# Dependency graph
requires:
  - phase: 05-02
    provides: Lab setup lesson and first connector lesson
  - phase: 04-03
    provides: JupyterLab container with confluent-kafka installed
provides:
  - Python CDC consumer lesson with confluent-kafka
  - CDC event structure parsing lesson with parse_cdc_event function
  - Complete Module 1 learning path (6 lessons)
affects: [module-2-postgresql, module-3-advanced-connectors]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - confluent-kafka Consumer pattern with poll() loop
    - parse_cdc_event function for envelope parsing
    - kafka:9092 vs localhost:9092 hostname distinction

key-files:
  created:
    - src/content/course/module-1/05-python-consumer.mdx
    - src/content/course/module-1/06-event-structure.mdx
  modified: []

key-decisions:
  - "confluent-kafka over kafka-python for performance and Confluent support"
  - "Prominent warning about kafka:9092 (Docker internal) vs localhost:9092 (host machine)"
  - "All operation types (r, c, u, d) explicitly handled in parse_cdc_event"

patterns-established:
  - "Complete runnable code examples - no '...' placeholders"
  - "parse_cdc_event returns structured dict with operation_code for switching"
  - "Timestamp handling with ms conversion"

# Metrics
duration: 3min
completed: 2026-01-31
---

# Phase 5 Plan 3: Python Consumer and Event Structure Summary

**Python CDC consumer with confluent-kafka and complete parse_cdc_event function handling all operation types (r/c/u/d)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-31T22:16:07Z
- **Completed:** 2026-01-31T22:19:10Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments

- Created Python consumer lesson with confluent-kafka library and Docker hostname warning
- Created event structure lesson with complete envelope documentation
- Implemented parse_cdc_event function handling snapshot, create, update, delete operations
- Completed Module 1 learning path with 6 lessons

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Python Consumer Lesson** - `eb75b81` (feat)
2. **Task 2: Create Event Structure Lesson** - `1302f07` (feat)

## Files Created

- `src/content/course/module-1/05-python-consumer.mdx` - Python CDC consumer with confluent-kafka, consumer groups, poll() timeout, prominent kafka:9092 vs localhost:9092 warning
- `src/content/course/module-1/06-event-structure.mdx` - Debezium envelope format, operation types (r/c/u/d), parse_cdc_event function, snapshot vs streaming distinction, Module 1 summary

## Decisions Made

- **confluent-kafka library:** Used instead of kafka-python for 10x better performance (librdkafka-based) and official Confluent support
- **Hostname warning prominence:** Created dedicated section with table explaining when to use kafka:9092 vs localhost:9092
- **Complete operation handling:** parse_cdc_event explicitly handles all four operation types with descriptive names

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Module 1 complete with all 6 lessons: CDC fundamentals, Debezium architecture, lab setup, first connector, Python consumer, event structure
- Students can now consume and parse CDC events programmatically
- Ready for Module 2: PostgreSQL deep dive (WAL configuration, replication slots, Aurora specifics)

---
*Phase: 05-module-1-foundations*
*Completed: 2026-01-31*
