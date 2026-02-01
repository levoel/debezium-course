---
phase: 23-homepage-redesign-accordion-module-cards
plan: 01
subsystem: ui
tags: [react, accordion, glass-morphism, css, progress-tracking, accessibility]

# Dependency graph
requires:
  - phase: 22-foundation-glass-design-system-module-naming
    provides: Glass CSS variables and utilities, moduleNames.ts
provides:
  - ModuleAccordion React component with glass styling
  - glass-card CSS utility class with hover lift
  - Per-module progress calculation pattern
affects: [23-02-homepage-integration, homepage, progress-display]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Glass card hover lift animation (translateY -2px)"
    - "Per-module progress calculation from $progress store"
    - "SSR-safe progress display (mounted state pattern)"
    - "Accordion with max-height transition"

key-files:
  created:
    - src/components/ModuleAccordion.tsx
  modified:
    - src/styles/global.css

key-decisions:
  - "All modules collapsed by default for cleaner initial view"
  - "Progress shows 0% during SSR to avoid hydration mismatch"
  - "Difficulty badges translated to Russian with color coding"

patterns-established:
  - "Glass card pattern: .glass-card class with hover lift for interactive cards"
  - "Module progress calculation: filter lessons by completed array, calculate percentage"

# Metrics
duration: 2min
completed: 2026-02-01
---

# Phase 23 Plan 01: ModuleAccordion Component Summary

**React accordion component with glass-styled module cards, per-module progress indicators, and keyboard accessibility**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-01T19:36:35Z
- **Completed:** 2026-02-01T19:38:29Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created glass-card CSS utility with 16px blur and hover lift animation (-2px translateY)
- Built ModuleAccordion component with all modules collapsed by default
- Implemented per-module progress calculation from $progress store
- Added full keyboard accessibility (button with aria-expanded/aria-controls)
- Ensured SSR safety with mounted state pattern
- Added Russian difficulty labels (Beginner -> Начальный, etc.)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add glass-card CSS utility class** - `b972abd` (style)
2. **Task 2: Create ModuleAccordion component** - `2b51cd9` (feat)

## Files Created/Modified
- `src/styles/global.css` - Added .glass-card class with hover lift, accessibility fallbacks
- `src/components/ModuleAccordion.tsx` - New 214-line React component for homepage accordion

## Decisions Made
- All modules collapsed by default - cleaner initial view, user chooses what to expand
- Progress shows 0% during SSR - avoids hydration mismatch between server/client
- Difficulty badges with Russian translations and color coding (green/yellow/red)
- Lesson items include completion checkmark, title, time estimate, and difficulty badge

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ModuleAccordion component ready for homepage integration (Plan 23-02)
- Component accepts `modules` prop as array of [moduleId, lessons[]] tuples
- Component accepts optional `basePath` prop for URL prefix
- Glass card styling verified working in build

---
*Phase: 23-homepage-redesign-accordion-module-cards*
*Completed: 2026-02-01*
