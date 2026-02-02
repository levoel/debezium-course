---
phase: 27-sequence-diagram-primitives
plan: 02
subsystem: ui
tags: [react, svg, sequence-diagram, glass-design, primitives, layout]

# Dependency graph
requires:
  - phase: 27-01-sequence-diagram-primitives
    provides: SequenceActor, SequenceLifeline, SequenceMessage primitives
  - phase: 26-flowchart-primitives
    provides: DiagramTooltip click-to-open pattern
provides:
  - SequenceDiagram layout container component
  - Declarative API for sequence diagrams (actors/messages arrays)
  - TypeScript interfaces for diagram definitions
affects: [module-2-diagrams, module-3-diagrams, module-4-diagrams]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Percentage-based layout with pixel conversion for SVG arrows"
    - "useLayoutEffect for responsive SVG width tracking"
    - "Declarative actor/message definitions via typed props"

key-files:
  created:
    - src/components/diagrams/primitives/SequenceDiagram.tsx
  modified:
    - src/components/diagrams/primitives/types.ts
    - src/components/diagrams/primitives/index.ts

key-decisions:
  - "Use useLayoutEffect to track SVG width for pixel-based arrow calculations"
  - "Lifelines use percentage positioning (SVG supports percentages)"
  - "Messages use pixel coordinates (calculated from percentage for arrowhead precision)"
  - "Default messageSpacing of 40px provides good readability for typical 5-10 messages"

patterns-established:
  - "SequenceActorDef: Declarative actor with id, label, variant, optional tooltip"
  - "SequenceMessageDef: Message with from/to actor IDs, variant, optional tooltip"
  - "Layout algorithm: columnWidth = 100/actorCount, centerX = columnWidth*index + columnWidth/2"

# Metrics
duration: 3min
completed: 2026-02-02
---

# Phase 27 Plan 02: SequenceDiagram Layout Container Summary

**SequenceDiagram layout component composing primitives with percentage-based responsive layout and declarative actor/message API**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-02T11:08:00Z
- **Completed:** 2026-02-02T11:11:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created SequenceDiagram component that composes Wave 1 primitives into complete diagrams
- Implemented percentage-based responsive layout with pixel conversion for arrow precision
- Added declarative TypeScript API (SequenceActorDef, SequenceMessageDef, SequenceDiagramProps)
- Integrated DiagramTooltip for click-to-open tooltips on actors and messages
- Exported all 8 primitives from barrel file

## Task Commits

Each task was committed atomically:

1. **Task 1: Add SequenceDiagram types to types.ts** - `d6840f5` (feat)
2. **Task 2: Create SequenceDiagram layout component** - `62fb9e2` (feat)
3. **Task 3: Update barrel exports and verify** - `30d6d35` (feat)

## Files Created/Modified

- `src/components/diagrams/primitives/types.ts` - Added SequenceActorDef, SequenceMessageDef, SequenceDiagramProps
- `src/components/diagrams/primitives/SequenceDiagram.tsx` - Layout container composing primitives
- `src/components/diagrams/primitives/index.ts` - Added SequenceDiagram export

## Decisions Made

- **Pixel conversion approach:** Lifelines use percentage positioning directly in SVG (which supports percentages), but message arrows use calculated pixel values from SVG width for precise arrowhead positioning
- **useLayoutEffect for width tracking:** Needed to convert percentage positions to pixels for arrow path calculations, with resize listener for responsiveness
- **Actor row with flex justify-around:** Matches column center calculations for consistent lifeline alignment

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - followed established patterns from Phase 26 and Wave 1.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Sequence diagram primitives library complete with 8 components
- Ready for Module 2+ sequence diagram migrations
- DiagramContainer can wrap SequenceDiagram for titled glass panels
- Example usage pattern:
  ```tsx
  <DiagramContainer title="CDC Event Flow" color="emerald">
    <SequenceDiagram
      actors={[
        { id: 'pg', label: 'PostgreSQL', variant: 'database' },
        { id: 'db', label: 'Debezium', variant: 'service' },
        { id: 'kafka', label: 'Kafka', variant: 'queue' }
      ]}
      messages={[
        { id: '1', from: 'pg', to: 'db', label: 'WAL stream', variant: 'async' },
        { id: '2', from: 'db', to: 'kafka', label: 'CDC event', variant: 'sync' }
      ]}
    />
  </DiagramContainer>
  ```

---
*Phase: 27-sequence-diagram-primitives*
*Completed: 2026-02-02*
