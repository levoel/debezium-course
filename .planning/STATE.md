# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций
**Current focus:** v1.3 UX/Design Refresh — Phase 25 Polish (Mobile + Accessibility + Verification)

## Current Position

Phase: 25 of 25 (Polish - Mobile + Accessibility + Verification)
Plan: 02 of TBD complete
Status: In progress
Last activity: 2026-02-01 — Completed 25-02-PLAN.md (Automated accessibility testing)

Progress: v1.0 [████████████████████] 100% | v1.1 [████████████████████] 100% | v1.2 [████████████████████] 100% | v1.3 [██████████████████░░] 94%

## Performance Metrics

**Velocity:**
- Total plans completed: 64 (v1.0: 32 | v1.1: 19 | v1.2: 4 | v1.3: 9)
- Average duration: ~7 min
- Total execution time: ~7.5 hours

**By Milestone:**

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v1.0 MVP | 1-11 | 32 | Complete (2026-02-01) |
| v1.1 MySQL/Aurora | 12-18 | 19 | Complete (2026-02-01) |
| v1.2 Reorganization | 19-21 | 4 | Complete (2026-02-01) |
| v1.3 UX Refresh | 22-25 | 10/TBD | In progress (Phase 25: 2 plans complete) |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting v1.3 work:

- [v1.3 Research]: Tailwind 4 native utilities (backdrop-blur-*) sufficient — no third-party plugins needed
- [v1.3 Research]: Three-tier CSS architecture — CSS variables → Tailwind utilities → scoped styles
- [v1.3 Research]: Blur budget enforcement — max 12px desktop, 8px mobile (performance constraint)
- [v1.3 Research]: Vibrant gradient backgrounds mandatory — glass invisible on solid black
- [v1.3 Research]: WCAG 4.5:1 contrast non-negotiable — test all text with WebAIM Contrast Checker
- [v1.3 Research]: Accessibility media queries required — prefers-reduced-transparency, prefers-reduced-motion
- [22-01]: CSS custom properties centralize all glass parameters for consistency
- [22-01]: Three glass variants (standard panel, elevated panel, darker sidebar) for different UI contexts
- [22-01]: Mobile blur reduction (10px → 8px) for performance on mobile devices
- [22-01]: Accessibility-first approach - glass effects are enhancement, not requirement
- [22-02]: Module names stored in single source of truth (moduleNames.ts) imported by all components
- [22-02]: Module display format: 'NN. Descriptive Name' (e.g., '01. Введение в CDC')
- [22-02]: Homepage organized by modules with left border visual grouping
- [22-02]: Glass sidebar uses 10px blur desktop, 8px mobile (from 22-01 foundation)
- [22-02]: Lesson cards made more compact (p-4 vs p-6) for better density
- [23-01]: All modules collapsed by default for cleaner initial homepage view
- [23-01]: Progress shows 0% during SSR to avoid hydration mismatch
- [23-01]: Glass card hover lift pattern (-2px translateY) for interactive cards
- [23-02]: React islands receive serializable data (arrays not Maps)
- [23-02]: Glass styling hierarchy: glass-panel for static containers, glass-card for interactive elements
- [24-01]: Light glass for tables (8px blur, 0.05 opacity) - lighter than standard panels for readability
- [24-01]: Visible 1px solid cell borders in tables for data tracking
- [24-01]: Code blocks use solid 0.95 opacity backgrounds (no glass) to preserve syntax highlighting
- [24-01]: Table header rows have elevated opacity (0.1 vs 0.05) for visual hierarchy
- [24-02]: Callout components use bg-{color}-500/10 glass tints (blue/green/yellow/red)
- [24-02]: Remove dark mode variants - glass design is universal theme
- [25-01]: Safari CSS variable workaround - hardcoded -webkit-backdrop-filter values (Safari 18 bug)
- [25-01]: Mobile webkit overrides in media query - explicit class rules, not just CSS variable updates
- [25-02]: Exclude Shiki code blocks from accessibility tests (third-party theme contrast limitation)
- [25-02]: Conditional text-white for duration on active sidebar links (WCAG 4.5:1 contrast)
- [25-02]: Topic tags use text-gray-200 on bg-gray-700 for adequate contrast

### Pending Todos

None.

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Fix hamburger navigation dual module display | 2026-02-01 | 19f5ea8 | [001-fix-hamburger-navigation](./quick/001-fix-hamburger-navigation/) |
| 002 | Remove duplicate course roadmap | 2026-02-01 | 642fe5f | [002-remove-course-roadmap](./quick/002-remove-course-roadmap/) |
| 003 | Collapsible sidebar modules | 2026-02-01 | 50b366a | [003-collapsible-sidebar-modules](./quick/003-collapsible-sidebar-modules/) |
| 004 | Apple glass style fixes | 2026-02-01 | 294f2aa | [004-apple-glass-style-fixes](./quick/004-apple-glass-style-fixes/) |

## Session Continuity

Last session: 2026-02-01
Stopped at: Completed 25-02-PLAN.md (Automated accessibility testing)
Resume file: None

---
*State initialized: 2026-01-31*
*Last updated: 2026-02-01 — Completed quick-004 (Apple glass style fixes)*
