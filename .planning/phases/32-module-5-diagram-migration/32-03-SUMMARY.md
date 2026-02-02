---
phase: 32
plan: 03
subsystem: ui-components
tags: [diagrams, module-5, schema-registry, schema-evolution, migration]
requires: [32-01, 32-02]
provides:
  - "Module 5 complete diagram migration (21 total diagrams)"
  - "Schema Registry integration diagram"
  - "Schema evolution compatibility matrix"
  - "Zero Mermaid code blocks in Module 5"
affects: []
tech-stack:
  added: []
  patterns: ["Color-coded compatibility modes", "Decision tree for schema changes", "Grid layout for compatibility types"]
key-files:
  created:
    - "src/components/diagrams/module5/SchemaRegistryDiagrams.tsx"
    - "src/components/diagrams/module5/SchemaEvolutionDiagrams.tsx"
  modified:
    - "src/components/diagrams/module5/index.ts"
    - "src/content/course/05-module-5/01-smt-overview.mdx"
    - "src/content/course/05-module-5/02-predicates-filtering.mdx"
    - "src/content/course/05-module-5/03-pii-masking.mdx"
    - "src/content/course/05-module-5/04-content-based-routing.mdx"
    - "src/content/course/05-module-5/05-outbox-pattern-theory.mdx"
    - "src/content/course/05-module-5/06-outbox-implementation.mdx"
    - "src/content/course/05-module-5/07-schema-registry-avro.mdx"
    - "src/content/course/05-module-5/08-schema-evolution.mdx"
    - "src/components/diagrams/module5/OutboxPatternDiagrams.tsx"
decisions:
  - id: schema-registry-color-purple
    decision: "Use purple variant for Schema Registry service nodes to distinguish from database (blue) and queue (default) nodes"
    rationale: "Schema Registry is a distinct service type in the architecture, deserves visual distinction"
    alternatives: ["Use default variant with className override", "Create new 'registry' variant"]
    impact: "Consistent visual language across all Schema Registry diagrams"
  - id: compatibility-grid-layout
    decision: "Use grid layout (2x2) for compatibility mode comparison instead of flowchart"
    rationale: "Four compatibility modes (BACKWARD/FORWARD/FULL/NONE) are parallel concepts, not sequential. Grid shows equality better than flow."
    alternatives: ["Linear flowchart", "Nested containers", "Table-based layout"]
    impact: "Users can compare modes at a glance without following arrows"
  - id: decision-tree-three-paths
    decision: "Evolution decision tree shows 3 parallel paths (add field, remove field, change type) instead of nested questions"
    rationale: "Most common schema change scenarios are clear: add/remove/change. Parallel paths are faster to scan than nested tree."
    alternatives: ["Single nested decision tree", "Linear checklist", "Flowchart with convergence"]
    impact: "Users can jump directly to their scenario without traversing multiple decision points"
metrics:
  duration: "9 minutes"
  completed: "2026-02-02"
---

# Phase 32 Plan 03: Module 5 Diagram Migration Summary

Schema Registry and Evolution diagrams with full MDX migration

## One-liner

Created Schema Registry integration and evolution diagrams (3 diagrams), updated barrel export, migrated all 8 Module 5 MDX files to glass components (21 diagrams total, zero Mermaid remaining)

## What Was Done

### Task 1: Schema Registry and Evolution Diagrams (3 diagrams)

Created 2 new component files:

**SchemaRegistryDiagrams.tsx:**
- **SchemaRegistryIntegrationDiagram**: Full architecture showing producer/consumer flow through Schema Registry
  - Purple Schema Registry service node (distinct from database/queue)
  - Arrows showing "Register schema" (producer) and "Get schema by ID" (consumer)
  - Message format visualization: `[magic_byte][schema_id][binary_data]`
  - Tooltips explaining schema-id optimization (300 bytes saved per message)

**SchemaEvolutionDiagrams.tsx:**
- **SchemaCompatibilityDiagram**: 2x2 grid of compatibility modes
  - BACKWARD (emerald): Old consumer + new data (default, recommended for CDC)
  - FORWARD (blue): New consumer + old data (producer-first upgrade)
  - FULL (purple): Both directions (max safety, any upgrade order)
  - NONE (rose): No validation (dangerous, dev only)
  - Each mode as clickable card with hover effects
  - Tooltips explaining upgrade order and safe changes

- **EvolutionDecisionTreeDiagram**: Three parallel decision paths
  - Path 1: Adding field → BACKWARD compatible (optional field with default)
  - Path 2: Removing field → FORWARD compatible (if was optional)
  - Path 3: Changing field type → BREAKING change (needs migration strategy)
  - Safe vs unsafe changes summary panels (green/rose borders)
  - Tooltips with migration strategies for breaking changes

**Key patterns:**
- Color-coded compatibility types (emerald=BACKWARD, blue=FORWARD, purple=FULL, rose=NONE)
- Grid layout for parallel concept comparison
- Decision tree with 3 independent paths (not nested)
- Russian tooltips throughout

### Task 2: Barrel Export Update

Updated `src/components/diagrams/module5/index.ts`:
- Added exports for SchemaRegistryDiagrams (1 diagram)
- Added exports for SchemaEvolutionDiagrams (2 diagrams)
- Updated comment to show 21 total diagrams across 8 files
- Complete barrel export for all Module 5 lessons (01-08)

### Task 3: MDX Migration (8 files)

Migrated all 8 Module 5 MDX files from Mermaid to glass components:

**01-smt-overview.mdx (5 diagrams):**
- ConsumerComplexityDiagram (problem: duplication)
- SmtSolutionDiagram (solution: centralized transforms)
- SmtExecutionModelDiagram (execution inside Kafka Connect)
- SmtChainOrderDiagram (standard order: Filter → Unwrap → Route → Mask)
- SmtDecisionFrameworkDiagram (SMT vs Kafka Streams decision tree)

**02-predicates-filtering.mdx (3 diagrams):**
- PredicateEvaluationDiagram (conditional SMT application)
- PredicateCombinationDiagram (chaining predicates)
- FilterDecisionTreeDiagram (Predicate vs Filter SMT choice)

**03-pii-masking.mdx (2 diagrams):**
- MaskFieldTransformDiagram (PII masking flow)
- UnwrapComparisonDiagram (order: unwrap then mask)

**04-content-based-routing.mdx (3 diagrams):**
- MultiTenantRoutingDiagram (tenant_id routing)
- ContentBasedRouterDiagram (shard consolidation)
- RegionBasedRoutingDiagram (EU vs US routing)

**05-outbox-pattern-theory.mdx (4 diagrams):**
- DualWriteProblemDiagram (dual-write failure scenario)
- OutboxSolutionDiagram (4-layer architecture: App/DB/CDC/Kafka)
- OutboxTransactionFlowDiagram (atomic transaction guarantee)
- MicroservicesOutboxDiagram (database-per-service pattern)

**06-outbox-implementation.mdx (1 diagram):**
- OutboxEventRouterSmtDiagram (SMT transformation flow)

**07-schema-registry-avro.mdx (1 diagram):**
- SchemaRegistryIntegrationDiagram (producer/consumer schema flow)

**08-schema-evolution.mdx (2 diagrams):**
- SchemaCompatibilityDiagram (4 compatibility modes)
- EvolutionDecisionTreeDiagram (schema change decision framework)

**Migration pattern:**
- Removed `import { Mermaid } from '../../../components/Mermaid.tsx';`
- Added glass component imports from `../../../components/diagrams/module5`
- Replaced all `<Mermaid chart={...} client:visible />` with `<ComponentName client:load />`
- Wrapped diagrams in `<div className="not-prose">` for full-width rendering
- Used `client:load` directive for immediate hydration (not client:visible)

**Bug fix:**
- Fixed JSX syntax error in OutboxPatternDiagrams.tsx (escaped curly braces in SQL: `&#123;...&#125;`)

**Verification:**
- `grep -r "Mermaid" src/content/course/05-module-5/` returns 0 results
- All 8 MDX files import from module5 barrel export
- Build passes without errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed JSX syntax error in OutboxPatternDiagrams.tsx**
- **Found during:** Task 3 (build verification)
- **Issue:** Curly braces `{...}` in SQL string were interpreted as JSX expressions, causing build error: "Unexpected '}'" at line 509
- **Fix:** Escaped curly braces as HTML entities: `&#123;...&#125;`
- **Files modified:** src/components/diagrams/module5/OutboxPatternDiagrams.tsx
- **Commit:** 96c6713 (included in Task 3 commit)
- **Rationale:** Build blocker preventing Task 3 completion. Curly braces in JSX strings must be escaped to prevent parser confusion.

## Technical Notes

### Schema Registry Integration Diagram

**Architecture flow:**
1. PostgreSQL → Debezium → Avro Serializer
2. Avro Serializer registers schema with Schema Registry (POST /subjects)
3. Schema Registry returns schema ID (4 bytes)
4. Message published to Kafka: `[magic_byte][schema_id][binary_data]`
5. Consumer reads message, extracts schema ID
6. Consumer requests schema from Registry (GET /schemas/ids/{id})
7. Schema Registry returns full schema (cached after first request)
8. Consumer deserializes binary data using schema

**Key optimization:**
- Schema stored once in Registry
- Messages contain only 4-byte schema ID
- ~300 bytes saved per message vs JSON
- Critical for CDC pipelines with millions of events

### Schema Compatibility Decision Framework

**BACKWARD (default for CDC):**
- Old consumers can read new data
- Safe changes: add optional field, remove field
- Upgrade order: consumers first, then producers
- Use case: CDC where consumers may lag behind schema changes

**FORWARD:**
- New consumers can read old data
- Safe changes: add field (any), remove optional field
- Upgrade order: producers first, then consumers
- Use case: pre-deployment testing, producer-driven changes

**FULL (recommended for production):**
- Both directions compatible
- Safe changes: only optional field add/remove
- Upgrade order: any (independent deployments)
- Use case: production-critical systems, microservices

**NONE (dangerous):**
- No validation
- Any change allowed (including breaking)
- Use case: development only, never production

### Evolution Decision Tree Strategy

Three independent paths for most common scenarios:

**Path 1: Adding field**
- Optional field with default value → BACKWARD compatible
- Required field → BREAKING (Schema Registry blocks)
- Solution: Always make new fields optional

**Path 2: Removing field**
- Optional field → FORWARD compatible
- Required field → BREAKING
- Solution: Deprecate first, remove later after migration

**Path 3: Changing field type**
- Any type change → BREAKING (incompatible)
- Solution: Multi-step migration (add new field, migrate, remove old)
- Example: age INT → BIGINT requires age_v2 field

**Safe changes summary:**
- Add optional field (with default)
- Remove optional field
- Add enum value (append only)
- Type promotion (int → long, float → double)

**Unsafe changes summary:**
- Add required field
- Remove required field
- Change field type (incompatible)
- Rename field (treated as remove + add)
- Remove enum value

## Verification

All verification criteria met:

- [x] `npm run build` completes without errors
- [x] All 8 MDX files migrated with glass component imports
- [x] `grep -r "Mermaid" src/content/course/05-module-5/` returns 0 results
- [x] SchemaRegistryDiagrams.tsx exports SchemaRegistryIntegrationDiagram
- [x] SchemaEvolutionDiagrams.tsx exports SchemaCompatibilityDiagram, EvolutionDecisionTreeDiagram
- [x] index.ts updated with all 8 component files (21 diagrams total)
- [x] All diagrams use client:load directive
- [x] Import path pattern: `../../../components/diagrams/module5` (3 levels up)

## Commits

| Task | Commit | Files Changed | Description |
|------|--------|---------------|-------------|
| 1 | 442d946 | 2 created | Schema Registry and Evolution diagrams (3 diagrams) |
| 2 | 34fd8f9 | 1 modified | Module5 barrel export updated (21 diagrams, 8 files) |
| 3 | 96c6713 | 9 modified | All 8 MDX files migrated, JSX syntax fix |

## Next Phase Readiness

Module 5 diagram migration **complete**. All preparation for Phase 32-04 (if exists) or Phase 33:

**Blockers:** None

**Dependencies satisfied:**
- All 21 Module 5 diagrams created and exported
- All 8 MDX files using glass components
- Zero Mermaid code blocks in Module 5
- Build passes without errors

**Recommendations for Phase 33 (Module 6+):**
- Continue same migration pattern: create diagrams → update barrel export → migrate MDX
- Watch for JSX syntax issues with curly braces in strings (use HTML entities)
- Keep using grid layouts for parallel concept comparisons
- Continue using color-coded decision trees for framework selection

## Lessons Learned

1. **Grid layout superiority for parallel concepts**: BACKWARD/FORWARD/FULL/NONE compatibility modes displayed as 2x2 grid is significantly clearer than flowchart. Users can compare at a glance without following arrows. Apply this pattern to other "type comparison" scenarios.

2. **Decision trees with 3 independent paths**: Evolution decision tree with 3 parallel paths (add/remove/change) is faster to scan than nested tree. Users jump directly to their scenario. Use this pattern for "scenario-based" decisions vs "sequential question" decisions.

3. **JSX string escaping**: Curly braces in JSX strings must be escaped as HTML entities (`&#123;` and `&#125;`). This applies to SQL examples, JSON snippets, and any text containing `{}`. Consider pre-emptive scanning for this pattern in future component creation.

4. **Python scripting for batch replacements**: Using Python for Mermaid→Component replacements saved significant time and tokens. Pattern-based replacements (regex + ordered component lists) worked reliably for all 8 files. Consider using this approach for remaining module migrations.

5. **Schema Registry visual distinction**: Purple variant for Schema Registry (vs blue for database, default for queue) proved highly effective. The central registry position + distinct color immediately communicates its role as the "schema hub". Apply similar visual hierarchy to other central services.

6. **client:load vs client:visible**: Switched from `client:visible` to `client:load` for immediate hydration. This ensures diagrams are interactive without waiting for scroll. Critical for above-the-fold diagrams and decision trees that users need to interact with immediately.

---

**Phase 32 Plan 03 Status:** ✅ Complete
**Duration:** 9 minutes
**Total Diagrams Created:** 3 (cumulative Module 5 total: 21)
**Zero Mermaid Code Blocks:** ✅ Verified across all 8 Module 5 MDX files
