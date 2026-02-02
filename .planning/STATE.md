# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций
**Current focus:** Phase 26 - Flowchart Primitives + Tooltip Foundation

## Current Position

Phase: 26 of 36 (Flowchart Primitives + Tooltip Foundation)
Plan: 2 of 2 in current phase - PHASE COMPLETE
Status: Phase complete
Last activity: 2026-02-02 — Completed 26-02-PLAN.md (DiagramContainer + Tooltip)

Progress: v1.0-v1.3 [####################] 100% | v1.4 [##..................] 9%

## Performance Metrics

**Velocity:**
- Total plans completed: 74 (v1.0: 32 | v1.1: 19 | v1.2: 4 | v1.3: 13 | v1.4: 2)
- Average duration: ~7 min
- Total execution time: ~8 hours

**By Milestone:**

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v1.0 MVP | 1-11 | 32 | Complete (2026-02-01) |
| v1.1 MySQL/Aurora | 12-18 | 19 | Complete (2026-02-01) |
| v1.2 Reorganization | 19-21 | 4 | Complete (2026-02-01) |
| v1.3 UX Refresh | 22-25 | 13 | Complete (2026-02-02) |
| v1.4 Glass Diagrams | 26-36 | 2/23 | In Progress |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting v1.4 work:

- [Research]: Use @radix-ui/react-tooltip (~8KB) for accessible tooltips - WCAG compliant out of box
- [Research]: Custom React/SVG primitives (no React Flow or diagram libraries) - zero bundle cost
- [Research]: Primitives-first approach - build FlowNode/Arrow/Container before bulk migration
- [Research]: Glass design uses existing CSS variables (--glass-blur-md, --glass-border-color)
- [Research]: Click-to-open tooltips (not hover-only) for mobile accessibility
- [Research]: Sequence diagram primitives needed in Phase 27 before Module 2+ migration
- [26-01]: FlowNode uses forwardRef for Radix Tooltip.Trigger compatibility
- [26-01]: Arrow uses SVG path strings for 4 directions (right, down, left, up)
- [26-01]: Primitives directory at src/components/diagrams/primitives/
- [26-02]: Click-to-open pattern for mobile accessibility (not hover-only)
- [26-02]: DiagramTooltip wraps Radix Provider at component level
- [26-02]: DiagramContainer uses semantic HTML (figure/figcaption)
- [26-02]: Primitives library complete: FlowNode, Arrow, DiagramContainer, DiagramTooltip

### Pending Todos

None.

### Blockers/Concerns

- [Research]: Sequence diagram layout needs column width calculation algorithm (Phase 27)
- [Research]: SMT chain diagrams (Module 5) may need specialized multi-step components

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Fix hamburger navigation dual module display | 2026-02-01 | 19f5ea8 | [001-fix-hamburger-navigation](./quick/001-fix-hamburger-navigation/) |
| 002 | Remove duplicate course roadmap | 2026-02-01 | 642fe5f | [002-remove-course-roadmap](./quick/002-remove-course-roadmap/) |
| 003 | Collapsible sidebar modules | 2026-02-01 | 50b366a | [003-collapsible-sidebar-modules](./quick/003-collapsible-sidebar-modules/) |
| 004 | Apple glass style fixes | 2026-02-01 | 294f2aa | [004-apple-glass-style-fixes](./quick/004-apple-glass-style-fixes/) |
| 005 | Fix lesson navigation buttons | 2026-02-02 | 2cf3270 | [005-fix-lesson-navigation-buttons](./quick/005-fix-lesson-navigation-buttons/) |

## Session Continuity

Last session: 2026-02-02
Stopped at: Completed 26-02-PLAN.md (DiagramContainer + Tooltip + DeploymentModes)
Resume file: None

---
*State initialized: 2026-01-31*
*Last updated: 2026-02-02 — Completed Phase 26 (Flowchart Primitives + Tooltip Foundation)*
