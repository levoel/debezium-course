# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций
**Current focus:** Phase 29 - Module 2 Diagram Migration

## Current Position

Phase: 29 of 36 (Module 2 Diagram Migration) — VERIFIED COMPLETE
Plan: 2 of 2 complete
Status: Ready for Phase 30
Last activity: 2026-02-02 — Phase 29 verified (19 diagrams, 177 tooltips, Mermaid removed)

Progress: v1.0-v1.3 [####################] 100% | v1.4 [##########..........] 45%

## Performance Metrics

**Velocity:**
- Total plans completed: 80 (v1.0: 32 | v1.1: 19 | v1.2: 4 | v1.3: 13 | v1.4: 8)
- Average duration: ~7 min
- Total execution time: ~8.4 hours

**By Milestone:**

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v1.0 MVP | 1-11 | 32 | Complete (2026-02-01) |
| v1.1 MySQL/Aurora | 12-18 | 19 | Complete (2026-02-01) |
| v1.2 Reorganization | 19-21 | 4 | Complete (2026-02-01) |
| v1.3 UX Refresh | 22-25 | 13 | Complete (2026-02-02) |
| v1.4 Glass Diagrams | 26-36 | 10/23 | In Progress |

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
- [27-01]: SequenceActor uses same glass styling as FlowNode (4 variants: database, service, queue, external)
- [27-01]: SequenceMessage uses SVG g element with forwardRef for Radix Tooltip compatibility
- [27-01]: Primitives library expanded to 7 components (added SequenceActor, SequenceLifeline, SequenceMessage)
- [27-02]: SequenceDiagram uses percentage layout with pixel conversion for arrow precision
- [27-02]: Primitives library complete with 8 components (4 flowchart + 4 sequence)
- [28-01]: Module 1 diagrams use responsive layouts (flex-col mobile, flex-row/grid desktop)
- [28-01]: Comparison diagrams pattern: side-by-side DiagramContainers with contrasting colors
- [28-01]: Complex architectures: nested DiagramContainers with 2x2 grid for 4 subgroups
- [28-01]: Data flow legends separate from diagrams with Arrow components showing connections
- [28-01]: Quick reference panels with code snippets for user convenience
- [28-02]: Sequence diagrams for connector flow (5 actors, 6 messages with tooltips)
- [28-02]: Horizontal flowcharts for linear pipelines (4 nodes with labeled arrows)
- [28-02]: 2x2 grid layout for operation type comparisons (r/c/u/d with color coding)
- [28-02]: Nested DiagramContainer for hierarchical structures (event envelope visualization)
- [28-02]: MDX import path pattern: ../../../components/diagrams/moduleN (3 levels up)
- [29-01]: State diagrams as flowcharts with status colors (emerald=active, amber=inactive, rose=danger)
- [29-01]: Critical step emphasis with border-2 and animate-pulse (Aurora reboot step)
- [29-01]: Danger/safe path layouts for state transitions (slot lifecycle)
- [29-01]: Parameter comparison with side-by-side containers showing apply scope
- [29-02]: Aurora failover sequence with 6 actors showing crash/recovery flow
- [29-02]: Heartbeat monitoring as data flow pattern (not sequence diagram)
- [29-02]: Global Database with two regions and Aurora replication arrow
- [29-02]: Snapshot decision tree with nested FlowNodes and color-coded paths
- [29-02]: Lab completion as numbered step list with tooltip summaries

### Pending Todos

None.

### Blockers/Concerns

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
Stopped at: Phase 29 verified complete, ready for Phase 30
Resume file: None

---
*State initialized: 2026-01-31*
*Last updated: 2026-02-02 — Phase 29 verified complete (Module 2: 19 diagrams, 177 tooltips)*
