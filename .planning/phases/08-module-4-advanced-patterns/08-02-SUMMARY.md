---
phase: 08-module-4-advanced-patterns
plan: 02
subsystem: content
tags: [smt, masking, routing, pii, gdpr, multi-tenant, regional, groovy]

# Dependency graph
requires:
  - phase: 08-module-4-advanced-patterns
    provides: SMT overview, predicates, and filtering concepts (plan 01)
provides:
  - PII masking lesson using MaskField SMT for GDPR compliance
  - Content-based routing lesson with ByLogicalTableRouter and ContentBasedRouter
  - Groovy expression patterns for field-based topic routing
affects: [08-module-4-advanced-patterns, outbox-pattern, schema-registry]

# Tech tracking
tech-stack:
  added: [MaskField SMT, ByLogicalTableRouter, ContentBasedRouter, Groovy JSR223]
  patterns: [PII masking with SMTs, multi-tenant topic routing, regional data isolation]

key-files:
  created:
    - src/content/course/04-module-4/03-pii-masking.mdx
    - src/content/course/04-module-4/04-content-based-routing.mdx
  modified: []

key-decisions:
  - "MaskField for field-level masking, not encryption (downstream protection only)"
  - "Groovy as JSR 223 implementation for ContentBasedRouter expressions"
  - "ByLogicalTableRouter for regex-based consolidation, ContentBasedRouter for field-value routing"
  - "Predicates mandatory for routing SMTs to avoid heartbeat/tombstone failures"
  - "key.enforce.uniqueness for merged topics to prevent key collision"

patterns-established:
  - "unwrap + mask transformation chain for PII protection"
  - "Null-safe Groovy expressions with fallback defaults"
  - "Regional routing pattern for GDPR compliance"
  - "Multi-tenant topic isolation with tenant_id-based routing"

# Metrics
duration: 5min
completed: 2026-02-01
---

# Phase 08 Plan 02: SMT Application Patterns Summary

**PII masking with MaskField SMT and multi-tenant content-based routing using Groovy expressions for GDPR compliance and data isolation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-01T02:15:39Z
- **Completed:** 2026-02-01T02:20:39Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created comprehensive PII masking lesson covering MaskField SMT configuration for GDPR compliance
- Created content-based routing lesson with ByLogicalTableRouter and ContentBasedRouter SMT patterns
- Demonstrated regional data isolation for EU/US compliance requirements
- Established multi-tenant SaaS patterns with tenant-specific topic routing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create PII Masking Lesson (03-pii-masking.mdx)** - `f541cb1` (feat)
2. **Task 2: Create Content-Based Routing Lesson (04-content-based-routing.mdx)** - `b798cbc` (feat)

## Files Created/Modified

- `src/content/course/04-module-4/03-pii-masking.mdx` - MaskField SMT for GDPR/PII compliance, field type masking, selective masking with predicates, lab with customers_pii table
- `src/content/course/04-module-4/04-content-based-routing.mdx` - ByLogicalTableRouter regex consolidation, ContentBasedRouter Groovy expressions, regional/multi-tenant routing, key uniqueness, lab with regional orders

## Decisions Made

1. **MaskField for downstream protection only** - Clarified that MaskField masks data in Kafka/downstream systems but does not remove PII from PostgreSQL WAL. Original data remains in source until WAL retention expires. For full compliance, database-level encryption required.

2. **Groovy as standard JSR 223 implementation** - Selected Groovy for ContentBasedRouter scripting engine (most common in Debezium documentation). Mentioned JavaScript and Go/WASM as alternatives but recommended Groovy for lab consistency.

3. **Predicates mandatory for routing SMTs** - Established pattern of using TopicNameMatches predicate to protect routing SMTs from heartbeat/tombstone events that lack `after` field. Prevents NullPointerException failures.

4. **Regex groups vs field expressions** - ByLogicalTableRouter uses regex pattern matching for topic name transformation (consolidating sharded tables), while ContentBasedRouter uses Groovy field value expressions (routing based on content). Both serve different use cases.

5. **Key uniqueness for merged topics** - When consolidating multiple tables into single topic with ByLogicalTableRouter, use `key.enforce.uniqueness=true` to add source table prefix to keys, preventing collision in log compaction.

6. **Null safety in routing expressions** - Always include `value.field != null` checks in Groovy expressions to prevent NullPointerException when field is missing or null. Use fallback defaults for unknown values.

## Deviations from Plan

None - plan executed exactly as written.

Both lessons follow established course pattern:
- Russian explanatory text, English code/config
- Mermaid diagrams for visual flow
- Lab examples with step-by-step instructions
- Security callouts and production recommendations
- Frontmatter with order, difficulty, estimatedTime, topics, prerequisites

## Issues Encountered

None - lessons created without issues.

Content aligned with 08-RESEARCH.md patterns:
- MaskField pattern from Pattern 4 (PII Masking)
- ContentBasedRouter pattern from Pattern 5 (Content-Based Routing)
- ByLogicalTableRouter from research consolidation examples
- All code examples verified against Debezium 2.5.4 documentation

## Next Phase Readiness

**Ready for:**
- Phase 08-03: Outbox Event Router SMT (depends on routing concepts from this plan)
- Phase 08-04: Schema Registry integration (independent, can proceed in parallel)

**Provides:**
- SMT chaining patterns (unwrap + mask + route) for complex transformations
- Predicate usage patterns applicable to all SMT configurations
- Multi-tenant and regional isolation patterns for enterprise CDC

**No blockers** - Module 4 content progression continues smoothly.

---
*Phase: 08-module-4-advanced-patterns*
*Completed: 2026-02-01*
