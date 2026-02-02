---
quick: 005
type: bugfix
subsystem: ui
tags: [astro, navigation, routing]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - src/pages/course/[...slug].astro

key-decisions:
  - "Sort lessons by entry.id (module-prefixed filenames) instead of frontmatter order field"

# Metrics
duration: 1min
completed: 2026-02-02
---

# Quick Task 005: Fix Lesson Navigation Buttons Summary

**Lesson prev/next navigation now sorts by entry.id to maintain module boundaries instead of mixing lessons across modules**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-02T05:14:45Z
- **Completed:** 2026-02-02T05:15:32Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Fixed lesson navigation buttons that incorrectly jumped between modules
- Changed sort logic from `a.data.order - b.data.order` to `a.id.localeCompare(b.id)`
- Navigation now respects module boundaries (all Module 1 lessons, then Module 2, etc.)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix lesson sorting logic** - `2cf3270` (fix)

## Files Modified
- `src/pages/course/[...slug].astro` - Changed lesson sort logic from order field to entry ID comparison

## Root Cause

The `order` field in lesson frontmatter resets to 1, 2, 3... within each module. When sorting by order alone, lessons with the same order number from different modules would get mixed together, causing navigation to jump between modules.

The `entry.id` format like `01-module-1/01-cdc-fundamentals.mdx` naturally encodes both module prefix and lesson order, so string comparison via `localeCompare` maintains the correct global sequence.

## Decisions Made

- Sort by entry.id instead of frontmatter order field - entry ID format inherently maintains correct sequence

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Impact

Navigation buttons now work correctly:
- Clicking "Next" from any Module 1 lesson goes to the next Module 1 lesson
- Only at module boundaries (last lesson of Module 1) does navigation move to Module 2
- Same pattern for all modules

---
*Quick Task: 005-fix-lesson-navigation-buttons*
*Completed: 2026-02-02*
