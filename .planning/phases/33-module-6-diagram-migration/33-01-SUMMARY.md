---
phase: 33
plan: 01
subsystem: ui-diagrams
completed: 2026-02-02
duration: 3min
tags: [react, diagrams, module-6, python, pandas, consumer, glass-design]

requires:
  - "26-02-PLAN.md (primitives library: FlowNode, Arrow, DiagramContainer, DiagramTooltip)"
  - "27-02-PLAN.md (SequenceDiagram primitive)"
provides:
  - "Module 6 diagram patterns established (Python consumer semantics, CDC event structure)"
  - "AdvancedConsumerDiagrams.tsx with 2 diagrams (at-least-once vs exactly-once, rebalancing)"
  - "PandasIntegrationDiagrams.tsx with 1 diagram (CDC event structure)"
affects:
  - "33-02 to 33-04 (remaining Module 6 diagrams will follow these patterns)"

tech-stack:
  added: []
  patterns:
    - "Side-by-side comparison for delivery semantics (at-least-once vs exactly-once)"
    - "SequenceDiagram for temporal flows (consumer rebalancing with max.poll.interval.ms)"
    - "Hierarchical tree layout for nested structures (CDC event envelope)"
    - "Color-coded fields by type (blue=payload, emerald=before/after, rose=op, amber=ts_ms, purple=source)"

decisions:
  - id: "comparison-amber-vs-emerald"
    what: "Use amber for at-least-once (problematic) and emerald for exactly-once (recommended)"
    why: "Amber signals caution (potential duplicate processing), emerald signals recommended practice"
    alternatives: ["Rose for at-least-once (too harsh), neutral colors (loses semantic meaning)"]
    status: applied

  - id: "sequence-for-rebalancing"
    what: "Use SequenceDiagram primitive for rebalancing flow visualization"
    why: "Rebalancing is temporal interaction between Consumer, Group Coordinator, and Kafka broker"
    alternatives: ["Flowchart with decision nodes (loses temporal aspect)", "Prose explanation only (less clear)"]
    status: applied

  - id: "hierarchical-tree-for-envelope"
    what: "Use nested DiagramContainers with horizontal layout for CDC event structure"
    why: "Clearly shows before/after/op/ts_ms/source as sibling fields within payload, with nested field details"
    alternatives: ["Vertical tree (too tall, wastes space)", "Flat list (loses hierarchy)", "JSON code block (not interactive)"]
    status: applied

key-files:
  created:
    - path: "src/components/diagrams/module6/AdvancedConsumerDiagrams.tsx"
      lines: 445
      exports: ["AtLeastOnceVsExactlyOnceDiagram", "RebalancingSequenceDiagram"]
    - path: "src/components/diagrams/module6/PandasIntegrationDiagrams.tsx"
      lines: 377
      exports: ["CdcEventStructureDiagram"]
  modified: []
---

# Phase 33 Plan 01: Module 6 Python Foundations Diagrams

**One-liner:** Interactive glass diagrams for Python consumer delivery semantics, rebalancing flow, and CDC event envelope structure

## What Was Built

Created React glass diagram components for Module 6 lessons 01-02 (Advanced Python Consumer and Pandas Integration):

### AdvancedConsumerDiagrams.tsx (2 diagrams)

**1. AtLeastOnceVsExactlyOnceDiagram**
- Side-by-side comparison of delivery semantics
- Left: At-Least-Once (amber) with manual offset store pattern
- Right: Exactly-Once (emerald, recommended) with transactional API
- Shows crash scenarios: "До commit" → повторная обработка vs "После commit" → OK
- Russian tooltips explaining offset management, transaction lifecycle, idempotence

**2. RebalancingSequenceDiagram**
- SequenceDiagram with 3 actors: Consumer, Group Coordinator, Kafka
- 8 messages showing poll() cycle and max.poll.interval.ms timeout
- Visual flow: poll() → process 3 min → poll() → timeout check → poll() after 6 min → rebalancing triggered
- Bottom notes with 4 solutions to prevent rebalancing

### PandasIntegrationDiagrams.tsx (1 diagram)

**CdcEventStructureDiagram**
- Hierarchical tree showing CDC Event JSON → schema/payload split
- Nested DiagramContainer for payload fields: before, after, op, ts_ms, source
- Color-coded by type:
  - Blue: payload (main container)
  - Emerald: before/after (state fields)
  - Rose: op (operation type: c/u/d/r)
  - Amber: ts_ms (timestamp)
  - Purple: source (metadata)
- Horizontal arrows showing nested field contents (id, customer_id, total, ...)
- Critical notes section: DELETE operations have after=null, use before instead!

## Tasks Completed

| # | Task | Commit | Files | Status |
|---|------|--------|-------|--------|
| 1 | Create AdvancedConsumerDiagrams.tsx | e57b1c6 | AdvancedConsumerDiagrams.tsx (445 lines) | ✅ Complete |
| 2 | Create PandasIntegrationDiagrams.tsx | 1a58062 | PandasIntegrationDiagrams.tsx (377 lines) | ✅ Complete |

**Total:** 2 tasks, 2 components, 3 diagrams, 822 lines of code

## Deviations from Plan

None - plan executed exactly as written.

## Implementation Notes

### Pattern Applications

**1. Side-by-side comparison (from Module 3/5 patterns)**
- Used for at-least-once vs exactly-once delivery semantics
- Amber (caution) vs emerald (recommended) color scheme
- Vertical flowcharts within each container showing sequential steps
- Crash point visualization with branching paths (rose=failure, emerald=success)

**2. SequenceDiagram primitive (from Phase 27)**
- Applied to consumer rebalancing temporal flow
- messageSpacing=55 for 8 messages with clear separation
- Self-message for "Обработка (3 минуты)" showing local processing time
- Return message variant for "❌ Rebalancing triggered" error response

**3. Hierarchical tree layout (new pattern for Module 6)**
- Top-down structure: Event → schema/payload → payload fields → nested details
- Nested DiagramContainers for logical grouping (payload fields container)
- Horizontal arrows with inline text showing field examples
- Color-coding by semantic type rather than by level depth

### Technical Details

**Russian tooltip quality:**
- All tooltips in Russian with engineering context (not just translations)
- Explains *when* fields are present/null (critical for Pandas processing)
- Provides use cases: "Используйте для: window aggregations, late data detection"
- Includes code references: `store_offsets()`, `begin_transaction()`, `isolation.level=read_committed`

**Accessibility:**
- All interactive FlowNodes have `tabIndex={0}` for keyboard navigation
- Clickable elements use DiagramTooltip wrapper for accessible click-to-open
- Inline text tooltips use cursor-pointer + hover styles + tabIndex
- Sequence diagram messages automatically get tabIndex when tooltip provided

**Import pattern:**
```typescript
import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { SequenceDiagram } from '../primitives/SequenceDiagram';
```

Consistent with Modules 1-5 (3 levels up from module6/ to primitives/).

## Testing & Verification

1. **TypeScript compilation:** Clean build with `npm run build` (no errors)
2. **File structure:** Components created in `src/components/diagrams/module6/`
3. **Exports verified:** Each diagram component properly exported
4. **Build output:** 66 pages built in 9.40s (no increase in build time)

## Next Phase Readiness

**Ready for 33-02 (PyFlink Streaming):**
- Established Module 6 patterns for:
  - Python/stream processing concepts (comparison diagrams)
  - Temporal flows (SequenceDiagram for interactions)
  - Nested data structures (hierarchical trees)
- Color scheme extended: purple for metadata, amber for timestamps
- Russian terminology foundation for stream processing terms

**Blockers:** None

**Concerns:** None

## Performance Metrics

- **Duration:** 3 minutes (fast - simple diagrams, established patterns)
- **Velocity:** 3 diagrams / 3 min = 1 diagram/min
- **Code output:** 822 lines / 3 min = 274 lines/min
- **Commit count:** 2 (one per task - atomic commits maintained)

## Key Learnings

1. **Side-by-side comparisons highly effective** for "old way vs new way" concepts (at-least-once vs exactly-once)
2. **SequenceDiagram primitives** naturally fit consumer group coordination patterns (poll cycles, rebalancing)
3. **Hierarchical tree layout** works well for nested envelope structures (CDC events, JSON schemas)
4. **Color-coding by semantic type** (operation=rose, timestamp=amber, metadata=purple) clearer than by depth level
5. **DELETE operation edge case** critical to visualize - many developers miss that after=null for deletes

## References

- **Research:** `.planning/phases/33-module-6-diagram-migration/33-RESEARCH.md`
- **Source MDX:** `src/content/course/06-module-6/01-advanced-python-consumer.mdx`, `02-pandas-integration.mdx`
- **Primitives:** `src/components/diagrams/primitives/` (FlowNode, Arrow, DiagramContainer, Tooltip, SequenceDiagram)
- **Pattern reference:** `src/components/diagrams/module5/SmtOverviewDiagrams.tsx` (side-by-side comparisons)

---

**Status:** ✅ Complete
**Next plan:** 33-02 (PyFlink Connector and Stateful Processing diagrams - 10 diagrams total)
