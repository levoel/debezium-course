---
phase: 08-module-4-advanced-patterns
plan: 01
subsystem: content
tags: [smt, transformations, predicates, filtering, groovy, kafka-connect, debezium]

# Dependency graph
requires:
  - phase: 07-module-3-production-operations
    provides: Monitoring and operational patterns foundation
provides:
  - SMT foundation lessons (overview and predicates/filtering)
  - Single Message Transformations concept and built-in catalog
  - Predicate-based selective SMT application
  - Filter SMT with Groovy for content filtering
affects: [08-02, 08-03, 08-04, module-4-content]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SMT chaining pattern (Filter → Unwrap → Route → Mask)"
    - "Predicate-based conditional SMT application"
    - "Filter SMT with Groovy for content-based filtering"
    - "Negate pattern for predicate inversion"

key-files:
  created:
    - src/content/course/04-module-4/01-smt-overview.mdx
    - src/content/course/04-module-4/02-predicates-filtering.mdx
  modified: []

key-decisions:
  - "Teach Groovy for Filter SMT (most common in documentation examples)"
  - "Standard SMT order: Filter → Unwrap → Route → Mask"
  - "Predicates before Filter SMT for simple topic/tombstone filtering"
  - "Always check value.after != null in Groovy for DELETE events"

patterns-established:
  - "SMT chaining with order significance (each SMT receives output from previous)"
  - "Predicate configuration syntax (predicates.name.type and predicates.name.pattern)"
  - "Filter SMT works with Debezium envelope (value.op, value.after, value.source)"
  - "TopicNameMatches predicate for excluding heartbeat/system topics"

# Metrics
duration: 4min
completed: 2026-02-01
---

# Phase 08 Plan 01: SMT Foundation Summary

**SMT overview and predicates for selective transformation: built-in catalog, chaining patterns, Filter SMT with Groovy**

## Performance

- **Duration:** 4 minutes
- **Started:** 2026-02-01T00:15:34Z
- **Completed:** 2026-02-01T00:20:09Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created comprehensive SMT overview lesson covering 6 built-in Debezium SMTs with use cases
- Documented SMT chaining pattern with standard order (Filter → Unwrap → Route → Mask)
- Created predicates and filtering lesson with TopicNameMatches, RecordIsTombstone, HasHeaderKey
- Demonstrated Filter SMT with Groovy for content-based filtering with lab exercise
- Established decision framework for predicate vs Filter SMT selection

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SMT Overview Lesson** - `d491845` (feat)
2. **Task 2: Create Predicates and Filtering Lesson** - `005920e` (feat)

## Files Created/Modified

- `src/content/course/04-module-4/01-smt-overview.mdx` - SMT introduction, built-in catalog (Filter, Unwrap, Router, Outbox, Mask), chaining patterns, performance considerations, when NOT to use SMTs
- `src/content/course/04-module-4/02-predicates-filtering.mdx` - Predicate problem (SMTs fail on heartbeat/tombstone), 3 built-in predicates, negate pattern, Filter SMT with Groovy, lab exercise for INSERT/UPDATE filtering

## Decisions Made

1. **Groovy for Filter SMT** - Used jsr223.groovy in examples (most common in official documentation), mentioned JavaScript and Go/WASM as alternatives
2. **Standard SMT order** - Established Filter → Unwrap → Route → Mask as canonical pattern with order significance explanation
3. **Predicates before Filter** - TopicNameMatches/RecordIsTombstone for simple cases, Filter SMT for content-based logic
4. **Safety pattern for DELETE** - Always check `value.after != null` in Groovy to avoid NullPointerException on DELETE events
5. **Debezium 2.5.4 constraints** - Documented that ExtractNewRecordState `delete.handling.mode` unified in 2.5.0, ComputePartition removed (use PartitionRouting)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all content created according to established lesson patterns.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 08-02 (Outbox Pattern):**
- SMT foundation established (students understand what SMTs are)
- Predicate concept taught (needed for Outbox Event Router predicate application)
- Filter SMT pattern demonstrated (OutboxEventRouter uses similar conditional logic)

**Ready for Plan 08-03 (Schema Registry Integration):**
- ExtractNewRecordState SMT introduced (works with Avro converter)
- SMT chaining pattern established (converters + SMTs combination)

**No blockers or concerns.**

---
*Phase: 08-module-4-advanced-patterns*
*Completed: 2026-02-01*
