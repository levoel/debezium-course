# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-31)

**Core value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций
**Current focus:** Phase 3 - Progress Tracking

## Current Position

Phase: 3 of 11 (Progress Tracking)
Plan: 2 of 3 complete
Status: In progress
Last activity: 2026-01-31 — Completed 03-02-PLAN.md (Progress UI Components)

Progress: [████████░░] 81%

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 2.7 minutes
- Total execution time: 0.40 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 - Platform Foundation | 3/4 | 12.5m | 4.2m |
| 02 - Navigation and Roadmap | 4/4 | 8.5m | 2.1m |
| 03 - Progress Tracking | 2/3 | 3.4m | 1.7m |

**Recent Trend:**
- Last 5 plans: 02-03 (1.5m), 02-04 (2m), 03-01 (1.4m), 03-02 (2m)
- Trend: Stable ~1.5-2min per plan

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap structure: 11 phases derived from requirements (3 platform phases, 1 infrastructure, 6 content modules, 1 capstone)
- Depth setting: Comprehensive (8-12 phases) to allow natural learning progression
- Phase ordering: Platform foundation → navigation → progress tracking → lab infrastructure → content modules following pedagogical progression
- Framework: Astro 5 for static site generation (01-01)
- Styling: Tailwind CSS 4 utility-first approach (01-01)
- Code highlighting: Shiki with github-dark theme, line wrapping enabled (01-01)
- React version: React 19 for interactive components (01-01)
- Content validation: Zod schema in content collections for course frontmatter (01-02)
- Responsive breakpoints: Mobile-first with lg:1024px for sidebar visibility (01-02)
- Diagram rendering: Mermaid with client:visible lazy hydration and dark theme (01-02)
- Dynamic routing: [...slug] pattern with getStaticPaths for content collections (01-03)
- Navigation patterns: Breadcrumb, prev/next, all-lessons link for course content (01-03)
- Metadata display: Difficulty badges with color coding, time estimates, topic tags (01-03)
- Localization: Full Russian UI strings for course interface (01-03)
- State management: nanostores for cross-island state sharing (02-01)
- Navigation tree: Content-derived navigation via getNavigationTree() (02-01)
- Inline SVG icons: Hamburger/X icons inline to avoid bundle bloat (02-02)
- Array tuples for props: [moduleId, lessons[]][] for serializable Astro island props (02-02)
- Mermaid click handlers: securityLevel 'loose' required for navigation (02-03)
- Roadmap serialization: Flat RoadmapLesson[] for Astro island compatibility (02-03)
- basePath prop pattern: All navigation components receive basePath for GitHub Pages deployment (02-04)
- Slug cleanup: entry.id cleaned of /index.mdx extension for clean URLs (02-04)
- Sidebar sync: Inline script subscribes to nanostores for DOM manipulation (02-04)
- Progress store: persistentMap with 'progress:' prefix, slugs-only storage (03-01)
- Toggle pattern: Single toggleLessonComplete for simpler UI binding (03-01)
- SSR-safe pattern: useEffect + mounted state for localStorage-dependent rendering (03-02)
- Status feedback: auto-dismiss messages after 3 seconds (03-02)

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-01-31 20:38:XX UTC
Stopped at: Completed 03-02-PLAN.md
Resume file: None

---
*State initialized: 2026-01-31*
*Last updated: 2026-01-31*
