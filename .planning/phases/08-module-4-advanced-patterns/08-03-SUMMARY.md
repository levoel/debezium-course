---
phase: 08-module-4-advanced-patterns
plan: 03
subsystem: course-content
tags: [outbox-pattern, microservices, smt, transactional-messaging, debezium, event-router]

# Dependency graph
requires:
  - phase: 08-module-4-advanced-patterns
    provides: Content-based routing SMT lesson for transformation context
provides:
  - Outbox Pattern theory lesson explaining dual-write problem and transactional solution
  - Outbox Event Router SMT implementation guide with complete configuration
  - Outbox table DDL for lab exercises
  - Transactional event emission pattern for microservices
  - Consumer idempotency pattern with database-backed deduplication
affects: [09-module-5-kafka-streams, 10-module-6-capstone, microservices-architecture]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Outbox Pattern for reliable event publishing in microservices"
    - "Outbox Event Router SMT transformation for CDC to domain events"
    - "Transactional event emission with INSERT into outbox table"
    - "Consumer idempotency with event ID deduplication"
    - "Cleanup strategies: DELETE in transaction vs external job"

key-files:
  created:
    - src/content/course/04-module-4/05-outbox-pattern-theory.mdx
    - src/content/course/04-module-4/06-outbox-implementation.mdx
    - labs/schemas/outbox-table.sql
  modified: []

key-decisions:
  - "Outbox Pattern taught as eventual consistency solution, NOT distributed transactions"
  - "At-least-once delivery requires consumer idempotency (database-backed for production)"
  - "DELETE-in-transaction cleanup recommended for course simplicity, external job for scale"
  - "table.expand.json.payload=true for structured JSON (not string)"
  - "Single outbox table supports multiple aggregate types via aggregatetype routing"

patterns-established:
  - "Outbox table schema: id, aggregatetype, aggregateid, type, payload, created_at"
  - "SMT field mapping: aggregatetype→topic, aggregateid→key, payload→value, id/type→headers"
  - "Application pattern: BEGIN, UPDATE business data, INSERT outbox, COMMIT (atomic)"
  - "Consumer pattern: Extract event ID from headers, deduplication check, process, mark processed"
  - "Lab structure: schemas/outbox-table.sql for DDL, connectors/*.json for config"

# Metrics
duration: 4min
completed: 2026-02-01
---

# Phase 08 Plan 03: Outbox Pattern - Theory and Implementation Summary

**Outbox Pattern для reliable event publishing в микросервисах через transactional outbox и Debezium Outbox Event Router SMT**

## Performance

- **Duration:** 4 minutes
- **Started:** 2026-02-01T00:15:47Z
- **Completed:** 2026-02-01T00:19:54Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Outbox Pattern theory lesson explaining dual-write problem and CDC-based solution with transactional guarantees
- Complete Outbox Event Router SMT implementation guide with field mapping, routing, and JSON payload expansion
- Production-ready outbox table DDL with proper schema and indexes for cleanup optimization
- Transactional event emission pattern for Python applications with atomic UPDATE + INSERT
- Consumer idempotency pattern with database-backed deduplication for at-least-once delivery handling

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Outbox Pattern Theory Lesson** - `e7612aa` (feat)
2. **Task 2: Create Outbox Implementation Lesson + DDL** - `189f356` (feat)

## Files Created/Modified

### Created
- `src/content/course/04-module-4/05-outbox-pattern-theory.mdx` - Dual-write problem, Outbox solution architecture, guarantees/limitations, cleanup strategies, microservices event flow diagrams
- `src/content/course/04-module-4/06-outbox-implementation.mdx` - Outbox Event Router SMT configuration, field mapping, application pattern, consumer idempotency, full lab demo with troubleshooting
- `labs/schemas/outbox-table.sql` - Outbox table DDL with id, aggregatetype, aggregateid, type, payload, created_at columns and created_at index

## Decisions Made

**1. Outbox Pattern NOT distributed transactions**
- Explicitly taught that Outbox provides eventual consistency with at-least-once delivery, NOT distributed ACID
- Critical callout emphasizes this is reliable messaging, not cross-service transactions
- Documented that cross-service rollback is not supported (Saga pattern for that use case)

**2. Consumer idempotency is mandatory**
- At-least-once delivery means duplicates are possible (Debezium retry scenarios)
- Taught database-backed deduplication using event ID from message headers for production
- In-memory `processed_events` set shown for demo, database table recommended for real use

**3. DELETE-in-transaction cleanup for course**
- Strategy 1 (DELETE in same transaction) recommended for course simplicity
- Strategy 2 (external cleanup job) mentioned as production alternative for high volume
- Debezium ignores DELETE events by default, making inline cleanup safe

**4. table.expand.json.payload for structured data**
- Always use `table.expand.json.payload = true` for structured JSON objects
- Without it, consumers receive JSON string instead of parsed object (poor DX)
- Enables type-safe consumer code

**5. Single outbox table for multiple aggregates**
- One outbox table can handle Order, Customer, Payment events via `aggregatetype` routing
- SMT routes to different topics: outbox.event.Order, outbox.event.Customer, etc.
- Simplifies schema management vs per-aggregate outbox tables

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - both lessons and DDL created without issues.

## User Setup Required

None - no external service configuration required. Lessons reference existing lab environment (PostgreSQL, Kafka Connect, Debezium connector deployment).

## Next Phase Readiness

**Ready for next advanced patterns:**
- Outbox Pattern foundation complete for microservices event publishing lessons
- Schema Registry integration (plan 08-04) can reference Outbox as example use case for Avro serialization
- Module 5 (Kafka Streams) can consume from outbox.event.* topics for stream processing

**Teaching outcomes verified:**
- ✅ Student can explain dual-write problem and Outbox solution
- ✅ Student understands at-least-once delivery vs exactly-once (idempotency requirement)
- ✅ Student can create outbox table with proper schema
- ✅ Student can configure Outbox Event Router SMT with field mappings
- ✅ Student can implement transactional event emission in application code
- ✅ Student can implement consumer idempotency with event ID deduplication

**Lab artifacts ready:**
- `labs/schemas/outbox-table.sql` for quick table creation
- Complete connector JSON config in lesson for copy-paste deployment
- Python code examples for both producer (event emission) and consumer (idempotency)

---
*Phase: 08-module-4-advanced-patterns*
*Completed: 2026-02-01*
