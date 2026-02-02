---
phase: 26-flowchart-primitives-tooltip-foundation
plan: 02
subsystem: ui
tags: [react, radix-ui, tooltip, glass-design, accessibility, primitives]

# Dependency graph
requires:
  - phase: 26-01
    provides: FlowNode and Arrow primitives with Radix UI Tooltip installed
provides:
  - DiagramContainer component with 6 color variants
  - DiagramTooltip component with click-to-open pattern
  - Updated DeploymentModes as reference implementation
affects: [phase-27-sequence-primitives, phase-28-36-migrations]

# Tech tracking
tech-stack:
  added: []
  patterns: ["click-to-open tooltips for mobile accessibility", "Radix Tooltip primitives"]

key-files:
  created:
    - src/components/diagrams/primitives/DiagramContainer.tsx
    - src/components/diagrams/primitives/Tooltip.tsx
  modified:
    - src/components/diagrams/primitives/types.ts
    - src/components/diagrams/primitives/index.ts
    - src/components/diagrams/DeploymentModes.tsx

key-decisions:
  - "Click-to-open pattern (not hover-only) for mobile accessibility"
  - "DiagramTooltip wraps Radix Tooltip.Provider at component level"
  - "DiagramContainer uses figure/figcaption for semantic HTML"
  - "All nodes get tabIndex={0} for keyboard navigation"

patterns-established:
  - "Tooltip wrapping pattern: <DiagramTooltip><FlowNode tabIndex={0}></DiagramTooltip>"
  - "Container wrapping pattern: <DiagramContainer title color recommended>"
  - "Russian tooltip content for all diagram explanations"

# Metrics
duration: 4min
completed: 2026-02-02
---

# Phase 26 Plan 02: DiagramContainer and Tooltip Foundation Summary

**DiagramContainer and DiagramTooltip primitives complete the primitives library with glass styling and accessible tooltips; DeploymentModes updated as reference implementation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-02T10:42:00Z
- **Completed:** 2026-02-02T10:46:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Created DiagramContainer with 6 color variants (emerald, blue, rose, amber, purple, neutral)
- Created DiagramTooltip with Radix UI integration and click-to-open pattern
- Updated DeploymentModes.tsx to use all 4 primitives as reference implementation
- Added Russian tooltip explanations to all 12 diagram nodes
- Full keyboard accessibility: Tab between nodes, Enter/Space to open, Escape to close

## Task Commits

Each task was committed atomically:

1. **Task 1: Create DiagramContainer component** - `13043d3` (feat)
2. **Task 2: Create DiagramTooltip with Radix integration** - `c8c14e9` (feat)
3. **Task 3: Update DeploymentModes to use primitives** - `c0692e6` (feat)

## Files Created/Modified

- `src/components/diagrams/primitives/DiagramContainer.tsx` - Glass wrapper with title pill, 6 colors, recommended badge
- `src/components/diagrams/primitives/Tooltip.tsx` - Radix-based tooltip with glass styling
- `src/components/diagrams/primitives/types.ts` - Added ContainerColor, DiagramContainerProps, DiagramTooltipProps
- `src/components/diagrams/primitives/index.ts` - Updated barrel exports (now 4 components)
- `src/components/diagrams/DeploymentModes.tsx` - Refactored to use primitives with tooltips

## Primitives Library Complete

The primitives directory now provides:

```typescript
import { FlowNode, Arrow, DiagramContainer, DiagramTooltip } from './primitives';
```

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| FlowNode | Diagram nodes | 6 variants, 3 sizes, forwardRef for Radix |
| Arrow | Directional connectors | 4 directions, optional labels, dashed variant |
| DiagramContainer | Glass wrapper | 6 colors, title pill, recommended badge |
| DiagramTooltip | Interactive tooltips | Click-to-open, keyboard accessible, glass styling |

## Accessibility Features

- **Keyboard navigation:** Tab between FlowNodes (tabIndex={0})
- **Activation:** Enter/Space opens tooltip on focused node
- **Dismissal:** Escape closes tooltip
- **Mobile:** Click-to-open pattern (not hover-only)
- **Screen readers:** ARIA labels on containers, Radix provides tooltip aria

## Tooltip Content (Russian)

| Node | Tooltip |
|------|---------|
| Database | Исходная база данных с WAL/binlog для захвата изменений |
| Debezium Connector | Считывает transaction log и преобразует изменения в события |
| Kafka Connect Cluster | Распределённый кластер для масштабируемой обработки коннекторов |
| Kafka | Message broker для хранения и передачи CDC событий |
| Debezium Server | Standalone сервер без зависимости от Kafka |
| Cloud Sink | Облачные сервисы для получения событий |
| Your Java App | Встроенный движок для кастомной обработки событий |
| Any Target | Произвольная система-получатель событий |

## Decisions Made

- Used click-to-open pattern for tooltips (required for mobile accessibility)
- DiagramTooltip wraps Radix Provider at component level for consistent behavior
- DiagramContainer uses semantic HTML (figure/figcaption) with ARIA labels
- All FlowNodes wrapped in tooltips get tabIndex={0} for keyboard focus

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully with build verification passing.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Primitives library complete for flowchart diagrams
- Ready for Phase 27: Sequence diagram primitives (SequenceNode, Lifeline, Message)
- Ready for Phase 28+: Bulk migration of Module 1-8 diagrams
- DeploymentModes serves as reference implementation pattern

---
*Phase: 26-flowchart-primitives-tooltip-foundation*
*Completed: 2026-02-02*
