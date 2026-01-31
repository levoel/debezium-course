---
phase: 01-platform-foundation
plan: 03
subsystem: ui
tags: [astro, mdx, mermaid, shiki, content-collections, routing]

# Dependency graph
requires:
  - phase: 01-02
    provides: Content schema, BaseLayout, Mermaid component
provides:
  - Landing page with course overview and lesson cards
  - Dynamic routing for course content with [...slug] pattern
  - Sample CDC intro lesson demonstrating all Phase 1 features
  - Navigation system (breadcrumbs, prev/next, all-lessons link)
affects: [02-navigation, 03-progress-tracking]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dynamic routing with getStaticPaths for content collections"
    - "Metadata display (difficulty badges, time estimates, topic tags)"
    - "Prev/next navigation between sequential lessons"
    - "Russian localization for UI elements"

key-files:
  created:
    - src/pages/index.astro
    - src/pages/course/[...slug].astro
    - src/content/course/01-intro/index.mdx
  modified: []

key-decisions:
  - "Dynamic routing uses [...slug] to handle nested content paths (e.g., 01-intro/index.mdx)"
  - "Landing page shows lesson cards sorted by order field with metadata preview"
  - "Lesson pages include breadcrumb, metadata banner, and bidirectional navigation"
  - "Full Russian localization for UI elements (Все уроки, Начальный, etc.)"

patterns-established:
  - "Lesson metadata display: difficulty badge with color coding, time estimate with icon, topic tags"
  - "Navigation pattern: breadcrumb → content → prev/next → all-lessons link"
  - "Responsive lesson cards with hover states and complete metadata"

# Metrics
duration: 4min
completed: 2026-01-31
---

# Phase 01 Plan 03: Course Content Pages Summary

**Landing page with lesson cards, dynamic routing for course content, and sample CDC intro demonstrating syntax highlighting and Mermaid diagrams**

## Performance

- **Duration:** 4 minutes
- **Started:** 2026-01-31T18:50:54Z
- **Completed:** 2026-01-31T18:55:06Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created comprehensive sample lesson covering CDC fundamentals with all Phase 1 features
- Implemented dynamic routing system generating pages for all course content
- Built landing page listing lessons with metadata, difficulty badges, and topic tags
- Established navigation patterns (breadcrumbs, prev/next, all-lessons link)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create sample course content with all features** - `e06829f` (feat)
   - Sample MDX lesson with valid frontmatter schema
   - Code blocks with syntax highlighting for JSON, SQL, Python, YAML
   - Two Mermaid diagrams (flowchart and sequence)
   - Russian language content on CDC fundamentals

2. **Task 2: Create dynamic routing and landing page** - `331a45e` (feat)
   - Landing page with course overview and sorted lesson cards
   - Dynamic [...slug] routing for course content
   - Prev/next navigation between lessons
   - Breadcrumb and "Все уроки" link
   - Prerequisites display when defined

## Files Created/Modified

- `src/content/course/01-intro/index.mdx` - Sample lesson: CDC introduction with Debezium architecture, config examples, code blocks (JSON connector config, SQL replication setup, Python consumer, Docker Compose), two Mermaid diagrams (architecture flowchart, event sequence)
- `src/pages/index.astro` - Landing page with lesson list, metadata cards (difficulty, time, topics), sorted by order field, Russian localization
- `src/pages/course/[...slug].astro` - Dynamic routing with getStaticPaths, metadata display, prev/next navigation, breadcrumb, prerequisites section

## Decisions Made

- **Import path correction**: Fixed Mermaid import path in MDX from `../../` to `../../../` to account for content directory structure (deviation Rule 3 - blocking issue)
- **Full Russian localization**: All UI strings translated (Все уроки, Начальный/Средний/Продвинутый, минут) for Russian-speaking audience
- **Metadata-rich lesson cards**: Landing page shows complete metadata preview (difficulty with color-coded badge, estimated time with icon, topic tags) to help users assess lesson content before clicking

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Mermaid component import path**
- **Found during:** Task 1 (Building sample content)
- **Issue:** Build failed with "Could not resolve ../../components/Mermaid.tsx from src/content/course/01-intro/index.mdx"
- **Fix:** Updated import path from `../../components/Mermaid.tsx` to `../../../components/Mermaid.tsx` to account for content directory nesting
- **Files modified:** src/content/course/01-intro/index.mdx
- **Verification:** `npm run build` succeeded, Mermaid diagrams rendered in output
- **Committed in:** 331a45e (Task 2 commit, combined with import fix)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix to unblock build. No scope changes.

## Issues Encountered

None - plan executed smoothly after import path correction.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 01 Plan 04:**
- Course content infrastructure complete and validated end-to-end
- Sample content demonstrates all features working: schema validation, MDX rendering, syntax highlighting (JSON, SQL, Python, YAML), Mermaid diagrams (flowchart, sequence)
- Navigation patterns established for future enhancement

**Validation complete:**
- Build succeeds without errors
- Syntax highlighting active with Shiki (github-dark theme)
- Mermaid diagrams render with client:visible hydration
- Landing page lists lessons with metadata
- Lesson pages show breadcrumb, content, prev/next navigation
- "Все уроки" link returns to homepage

**Next plan (01-04) will add:**
- Interactive sidebar navigation
- Progress tracking
- Search functionality

---
*Phase: 01-platform-foundation*
*Completed: 2026-01-31*
