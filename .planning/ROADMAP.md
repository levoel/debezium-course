# Roadmap: Debezium Course

## Milestones

- [x] **v1.0 MVP** - Phases 1-11 (shipped 2026-02-01)
- [x] **v1.1 MySQL/Aurora MySQL + Deployment** - Phases 12-18 (shipped 2026-02-01)
- [x] **v1.2 Course Reorganization** - Phases 19-21 (shipped 2026-02-01)
- [x] **v1.3 UX/Design Refresh** - Phases 22-25 (shipped 2026-02-02)
- [ ] **v1.4 Interactive Glass Diagrams** - Phases 26-36 (in progress)

## Overview

v1.4 replaces all 170 Mermaid diagrams with interactive React components using the liquid glass design system. The migration follows a primitives-first approach: build reusable FlowNode, Arrow, Container, and Tooltip components (Phase 26), then sequence diagram primitives (Phase 27), then migrate diagrams module-by-module (Phases 28-35), and finalize with testing and Mermaid removal (Phase 36). This delivers full interactivity, visual consistency, and ~1MB bundle size reduction.

## Phases

**Phase Numbering:**
- v1.0: Phases 1-11 (complete)
- v1.1: Phases 12-18 (complete)
- v1.2: Phases 19-21 (complete)
- v1.3: Phases 22-25 (complete)
- v1.4: Phases 26-36

### Phase 26: Flowchart Primitives + Tooltip Foundation
**Goal**: Reusable diagram primitives exist for building interactive flowchart diagrams with accessible tooltips
**Depends on**: Phase 25 (v1.3 complete)
**Requirements**: PRIM-01, PRIM-02, PRIM-03, TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05
**Success Criteria** (what must be TRUE):
  1. FlowNode component renders glass-styled nodes with 6 variants (database, connector, cluster, sink, app, target)
  2. Arrow component renders SVG directional connectors between nodes (right, down, left, up) with optional labels
  3. DiagramContainer component wraps diagrams in glass card with title and optional description
  4. User can click any FlowNode to reveal tooltip with explanation text
  5. User can navigate between nodes using Tab key and activate tooltip with Enter/Space
  6. Tooltips position correctly without overlapping target elements on both desktop and mobile
**Plans**: 2 plans (Wave 1: 01 | Wave 2: 02)

Plans:
- [x] 26-01-PLAN.md — Install Radix, extract FlowNode and Arrow primitives with TypeScript interfaces
- [x] 26-02-PLAN.md — DiagramContainer + Radix tooltip with glass styling and keyboard accessibility

### Phase 27: Sequence Diagram Primitives
**Goal**: Reusable diagram primitives exist for building interactive sequence diagrams
**Depends on**: Phase 26
**Requirements**: PRIM-04, PRIM-05, PRIM-06
**Success Criteria** (what must be TRUE):
  1. SequenceActor component renders participant boxes at top of sequence diagrams
  2. SequenceMessage component renders arrows between actors with message labels
  3. SequenceLifeline component renders vertical dashed lines from actors
  4. User can click sequence diagram elements to reveal tooltips with explanations
  5. Sequence diagram layout handles variable message count and actor positioning
**Plans**: 2 plans (Wave 1: 01 | Wave 2: 02)

Plans:
- [ ] 27-01-PLAN.md — SequenceActor, SequenceLifeline, SequenceMessage primitives
- [ ] 27-02-PLAN.md — SequenceDiagram layout container with column calculation and tooltip integration

### Phase 28: Module 1 Diagram Migration
**Goal**: All Mermaid diagrams in Module 1 (Введение в CDC) are replaced with interactive glass components
**Depends on**: Phase 27
**Requirements**: MOD1-01, MOD1-02, MOD1-03, MOD1-04
**Success Criteria** (what must be TRUE):
  1. Module 1 diagram audit complete with count and types documented
  2. All flowchart diagrams in Module 1 use FlowNode/Arrow/DiagramContainer components
  3. User can click nodes in Module 1 diagrams to see contextual explanations
  4. No Mermaid code blocks remain in Module 1 MDX files
  5. Module 1 lessons render correctly with new diagram components
**Plans**: TBD

Plans:
- [ ] 28-01-PLAN.md — Audit Module 1 diagrams and create glass component versions
- [ ] 28-02-PLAN.md — Add tooltips and remove Mermaid from Module 1

### Phase 29: Module 2 Diagram Migration
**Goal**: All Mermaid diagrams in Module 2 (PostgreSQL/Aurora PostgreSQL) are replaced with interactive glass components
**Depends on**: Phase 28
**Requirements**: MOD2-01, MOD2-02, MOD2-03, MOD2-04
**Success Criteria** (what must be TRUE):
  1. Module 2 diagram audit complete (WAL architecture, replication slots, etc.)
  2. All diagrams in Module 2 use glass primitives including sequence diagrams
  3. User can click nodes to see PostgreSQL-specific explanations
  4. No Mermaid code blocks remain in Module 2 MDX files
  5. Complex WAL/replication diagrams render clearly on mobile
**Plans**: TBD

Plans:
- [ ] 29-01-PLAN.md — Audit Module 2 diagrams and create glass component versions
- [ ] 29-02-PLAN.md — Add tooltips and remove Mermaid from Module 2

### Phase 30: Module 3 Diagram Migration
**Goal**: All Mermaid diagrams in Module 3 (MySQL/Aurora MySQL) are replaced with interactive glass components
**Depends on**: Phase 29
**Requirements**: MOD3-01, MOD3-02, MOD3-03, MOD3-04
**Success Criteria** (what must be TRUE):
  1. Module 3 diagram audit complete (binlog architecture, GTID, etc.)
  2. All diagrams in Module 3 use glass primitives
  3. User can click nodes to see MySQL-specific explanations
  4. No Mermaid code blocks remain in Module 3 MDX files
  5. Binlog/GTID flow diagrams render clearly
**Plans**: TBD

Plans:
- [ ] 30-01-PLAN.md — Audit Module 3 diagrams and create glass component versions
- [ ] 30-02-PLAN.md — Add tooltips and remove Mermaid from Module 3

### Phase 31: Module 4 Diagram Migration
**Goal**: All Mermaid diagrams in Module 4 (Production Operations) are replaced with interactive glass components
**Depends on**: Phase 30
**Requirements**: MOD4-01, MOD4-02, MOD4-03, MOD4-04
**Success Criteria** (what must be TRUE):
  1. Module 4 diagram audit complete (monitoring, alerting flows)
  2. All diagrams in Module 4 use glass primitives
  3. User can click nodes to see operations-specific explanations
  4. No Mermaid code blocks remain in Module 4 MDX files
  5. Monitoring/alerting architecture diagrams are interactive
**Plans**: TBD

Plans:
- [ ] 31-01-PLAN.md — Audit Module 4 diagrams and create glass component versions
- [ ] 31-02-PLAN.md — Add tooltips and remove Mermaid from Module 4

### Phase 32: Module 5 Diagram Migration
**Goal**: All Mermaid diagrams in Module 5 (Advanced Patterns - SMT) are replaced with interactive glass components
**Depends on**: Phase 31
**Requirements**: MOD5-01, MOD5-02, MOD5-03, MOD5-04
**Success Criteria** (what must be TRUE):
  1. Module 5 diagram audit complete (SMT chains, transformation pipelines)
  2. Complex SMT chain diagrams use glass primitives with clear data flow
  3. User can click transformation nodes to see SMT-specific explanations
  4. No Mermaid code blocks remain in Module 5 MDX files
  5. Multi-step transformation pipelines render clearly
**Plans**: TBD

Plans:
- [ ] 32-01-PLAN.md — Audit Module 5 diagrams and create glass component versions
- [ ] 32-02-PLAN.md — Add tooltips and remove Mermaid from Module 5

### Phase 33: Module 6 Diagram Migration
**Goal**: All Mermaid diagrams in Module 6 (Data Engineering Integration) are replaced with interactive glass components
**Depends on**: Phase 32
**Requirements**: MOD6-01, MOD6-02, MOD6-03, MOD6-04
**Success Criteria** (what must be TRUE):
  1. Module 6 diagram audit complete (streaming architectures, Flink/Spark)
  2. All diagrams in Module 6 use glass primitives
  3. User can click nodes to see data engineering explanations
  4. No Mermaid code blocks remain in Module 6 MDX files
  5. Streaming architecture diagrams show data flow clearly
**Plans**: TBD

Plans:
- [ ] 33-01-PLAN.md — Audit Module 6 diagrams and create glass component versions
- [ ] 33-02-PLAN.md — Add tooltips and remove Mermaid from Module 6

### Phase 34: Module 7 Diagram Migration
**Goal**: All Mermaid diagrams in Module 7 (Cloud-Native GCP) are replaced with interactive glass components
**Depends on**: Phase 33
**Requirements**: MOD7-01, MOD7-02, MOD7-03, MOD7-04
**Success Criteria** (what must be TRUE):
  1. Module 7 diagram audit complete (GCP architecture, Pub/Sub, Dataflow)
  2. All diagrams in Module 7 use glass primitives with cloud service styling
  3. User can click nodes to see GCP-specific explanations
  4. No Mermaid code blocks remain in Module 7 MDX files
  5. Cloud architecture diagrams show service relationships clearly
**Plans**: TBD

Plans:
- [ ] 34-01-PLAN.md — Audit Module 7 diagrams and create glass component versions
- [ ] 34-02-PLAN.md — Add tooltips and remove Mermaid from Module 7

### Phase 35: Module 8 Diagram Migration
**Goal**: All Mermaid diagrams in Module 8 (Capstone) are replaced with interactive glass components
**Depends on**: Phase 34
**Requirements**: MOD8-01, MOD8-02, MOD8-03, MOD8-04
**Success Criteria** (what must be TRUE):
  1. Module 8 diagram audit complete (full pipeline architecture)
  2. All capstone diagrams use glass primitives
  3. User can click nodes to see capstone-specific explanations
  4. No Mermaid code blocks remain in Module 8 MDX files
  5. Full pipeline architecture diagram is interactive and comprehensive
**Plans**: TBD

Plans:
- [ ] 35-01-PLAN.md — Audit Module 8 diagrams and create glass component versions
- [ ] 35-02-PLAN.md — Add tooltips and remove Mermaid from Module 8

### Phase 36: Finalization (Testing + Mermaid Removal)
**Goal**: All diagrams pass quality verification and Mermaid dependency is removed
**Depends on**: Phase 35
**Requirements**: FINAL-01, FINAL-02, FINAL-03, FINAL-04, FINAL-05
**Success Criteria** (what must be TRUE):
  1. Visual regression tests pass for all 170 diagrams across all modules
  2. Accessibility audit shows zero WCAG violations for keyboard navigation
  3. Mobile responsiveness verified on iPhone 12 equivalent viewport
  4. Mermaid package removed from package.json and node_modules
  5. Bundle size reduced by approximately 1MB (verified via build comparison)
**Plans**: TBD

Plans:
- [ ] 36-01-PLAN.md — Visual regression and accessibility testing setup
- [ ] 36-02-PLAN.md — Mobile verification and Mermaid removal
- [ ] 36-03-PLAN.md — Bundle size verification and final optimization

<details>
<summary>[x] v1.3 UX/Design Refresh (Phases 22-25) - SHIPPED 2026-02-02</summary>

### Phase 22: Foundation (Glass Design System + Module Naming)
**Goal**: Design system established with CSS variables, gradient backgrounds, glass utilities, and descriptive module names throughout interface
**Depends on**: Phase 21 (v1.2 complete)
**Requirements**: UX-01a, UX-01b, UX-01c, UX-04a, UX-04b
**Success Criteria** (what must be TRUE):
  1. CSS custom properties define all glass parameters (blur values, opacity levels, shadows) with single source of truth
  2. Tailwind custom utilities (`glass-panel`, `glass-panel-elevated`) work consistently across components
  3. Vibrant gradient background layer (purple/blue/pink radial gradients on dark base) renders behind all glass elements
  4. Sidebar navigation displays with glass effect (16px blur desktop, 8px mobile) and elevated opacity
  5. Module names are descriptive throughout interface (sidebar, breadcrumbs, homepage) instead of "Module N"
  6. Responsive media queries reduce blur on mobile (8px) from desktop (12-16px) automatically
  7. Accessibility media queries (`prefers-reduced-transparency`, `prefers-reduced-motion`) disable glass effects when requested
**Plans**: 2 plans (Wave 1: 01 | Wave 2: 02)

Plans:
- [x] 22-01-PLAN.md — CSS foundation: variables, glass utilities, gradient background, accessibility fallbacks
- [x] 22-02-PLAN.md — Glass sidebar + descriptive module names (sidebar, homepage)

### Phase 23: Homepage Redesign (Accordion + Module Cards)
**Goal**: Homepage displays modules in accordion menu with glass-styled cards and progress indicators
**Depends on**: Phase 22
**Requirements**: UX-02a, UX-02b, UX-02c, UX-04d
**Success Criteria** (what must be TRUE):
  1. Homepage accordion menu displays all modules collapsed by default with descriptive titles
  2. User can click module header to expand/collapse lesson list for that module
  3. Module cards use strong glass effect (12-16px blur) with hover lift animation
  4. Progress indicator shows completion percentage per module (calculated from lesson checkmarks)
  5. Expanded module reveals all lessons for that module with navigation links
**Plans**: 2 plans (Wave 1: 01 | Wave 2: 02)

Plans:
- [x] 23-01-PLAN.md — ModuleAccordion component with glass cards and per-module progress
- [x] 23-02-PLAN.md — Homepage integration with ModuleAccordion

### Phase 24: Content Components (Tables + Callouts with Glass)
**Goal**: Tables and callout components use light glass effect with optimized readability
**Depends on**: Phase 23
**Requirements**: UX-03a, UX-03b, UX-03c, UX-04c
**Success Criteria** (what must be TRUE):
  1. All MDX tables render with clear 1px solid borders between cells for data tracking
  2. Table text meets WCAG 4.5:1 contrast minimum (verified with WebAIM Contrast Checker)
  3. Tables use light glass effect (8-10px blur) to avoid overwhelming data content
  4. Table header row has elevated opacity compared to data rows (visual hierarchy)
  5. Callout components (info, warning, tip) render with type-specific colored glass tints and left border accent
  6. Code blocks inside content use solid backgrounds (no glass) to preserve syntax highlighting readability
**Plans**: 2 plans (Wave 1: 01, 02 parallel)

Plans:
- [x] 24-01-PLAN.md — Glass table styles + solid code block styles (global.css)
- [x] 24-02-PLAN.md — Glass callout component enhancement (Callout.tsx)

### Phase 25: Polish (Mobile + Accessibility + Verification)
**Goal**: Glass design performs well on mobile devices, respects accessibility preferences, and passes comprehensive audit
**Depends on**: Phase 24
**Requirements**: UX-04e, UX-04f
**Success Criteria** (what must be TRUE):
  1. All glass effects use responsive blur reduction (8px mobile vs 12-16px desktop) automatically
  2. Performance testing on low-end device (iPhone 12 equivalent) maintains 60fps with no GPU overload
  3. `prefers-reduced-transparency` media query increases opacity to 95% and disables blur when user requests reduced transparency
  4. `prefers-reduced-motion` media query disables all glass animations when user requests reduced motion
  5. Accessibility audit (axe DevTools, WAVE, Lighthouse) shows zero violations for WCAG 4.5:1 contrast
  6. Manual contrast testing confirms all text readable against glass backgrounds in all contexts
  7. Cross-browser testing (Chrome, Firefox, Safari) confirms glass effects render correctly
**Plans**: 3 plans (Wave 1: 01 | Wave 2: 02, 03 parallel)

Plans:
- [x] 25-01-PLAN.md — Fix Safari CSS variable bug with hardcoded webkit values
- [x] 25-02-PLAN.md — Add @axe-core/playwright accessibility tests
- [x] 25-03-PLAN.md — Manual verification via user acceptance testing (quick tasks)

</details>

<details>
<summary>[x] v1.2 Course Reorganization (Phases 19-21) - SHIPPED 2026-02-01</summary>

### Phase 19: Module Directory Renaming
**Goal**: Module directories are renumbered with MySQL (08) becoming Module 3
**Depends on**: Phase 18 (v1.1 complete)
**Requirements**: STRUCT-01a, STRUCT-01b
**Success Criteria** (what must be TRUE):
  1. Module 08 directory renamed to 03 (MySQL becomes third module)
  2. Modules 03-07 renumbered to 04-08
  3. Navigation auto-discovers new structure (no code changes needed)
  4. Site builds successfully with new structure
**Plans**: 1 plan (Wave 1)

Plans:
- [x] 19-01-PLAN.md — Directory renaming via two-stage git mv with build verification

### Phase 20: Cross-Reference Updates
**Goal**: All internal links and UI components reflect new module order
**Depends on**: Phase 19
**Requirements**: STRUCT-01c, STRUCT-01d (N/A - no component), STRUCT-01e
**Success Criteria** (what must be TRUE):
  1. All inter-lesson links updated to new paths
  2. Roadmap component displays correct module order (N/A - no separate component exists, navigation auto-discovers)
  3. Progress tracking uses updated localStorage keys
  4. No broken internal links
**Plans**: 1 plan (Wave 1)

Plans:
- [x] 20-01-PLAN.md — Fix cross-references and add progress migration

### Phase 21: Verification and QA
**Goal**: All navigation works correctly and progress persists
**Depends on**: Phase 20
**Requirements**: STRUCT-01f, STRUCT-01g
**Success Criteria** (what must be TRUE):
  1. All navigation links verified working
  2. Progress tracking verified after reorganization
  3. Site deployed and verified on GitHub Pages
  4. No console errors, all pages accessible
**Plans**: 2 plans (Wave 1: 01 | Wave 2: 02)

Plans:
- [x] 21-01-PLAN.md — Setup Playwright E2E tests for navigation and progress verification
- [x] 21-02-PLAN.md — Deploy and verify on GitHub Pages

</details>

<details>
<summary>[x] v1.1 MySQL/Aurora MySQL + Deployment (Phases 12-18) - SHIPPED 2026-02-01</summary>

**Milestone Goal:** Add comprehensive MySQL/Aurora MySQL CDC module (Module 8) and deploy the course to GitHub Pages.

**Stats:** 7 phases, 20 plans, 20/20 requirements (100%)
**Live:** https://levoel.github.io/debezium-course/

- [x] **Phase 12: MySQL Infrastructure + Binlog Fundamentals** - Docker MySQL service and binlog theory
- [x] **Phase 13: Connector Setup + Comparison** - MySQL connector configuration and WAL comparison
- [x] **Phase 14: Aurora MySQL Specifics** - Aurora Enhanced Binlog and limitations
- [x] **Phase 15: Production Operations** - Monitoring, failover, incremental snapshots
- [x] **Phase 16: Advanced Topics + Recovery** - Recovery procedures, multi-connector, DDL tools
- [x] **Phase 17: Multi-Database Capstone** - PostgreSQL + MySQL unified pipeline
- [x] **Phase 18: GitHub Pages Deployment** - Static site deployment with CI/CD

</details>

<details>
<summary>[x] v1.0 MVP (Phases 1-11) - SHIPPED 2026-02-01</summary>

See `.planning/milestones/v1.0-MILESTONE-AUDIT.md` for full details.

**Phases completed:**
- Phase 1: Platform Foundation (4 plans)
- Phase 2: Navigation & Roadmap (4 plans)
- Phase 3: Progress Tracking (4 plans)
- Phase 4: Lab Infrastructure (4 plans)
- Phase 5: Module 1 Foundations (3 plans)
- Phase 6: Module 2 PostgreSQL/Aurora (3 plans)
- Phase 7: Module 3 Production Operations (3 plans)
- Phase 8: Module 4 Advanced Patterns (4 plans)
- Phase 9: Module 5 Data Engineering (4 plans)
- Phase 10: Module 6 Cloud-Native GCP (3 plans)
- Phase 11: Module 7 Capstone (2 plans)

**Stats:** 11 phases, 32 plans, 59/60 requirements (98.3%)

</details>

## Progress

**Execution Order:**
Phases execute in numeric order: 26 -> 27 -> 28 -> 29 -> 30 -> 31 -> 32 -> 33 -> 34 -> 35 -> 36

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 26. Flowchart Primitives + Tooltip | v1.4 | 2/2 | Complete | 2026-02-02 |
| 27. Sequence Diagram Primitives | v1.4 | 0/2 | Not started | - |
| 28. Module 1 Migration | v1.4 | 0/2 | Not started | - |
| 29. Module 2 Migration | v1.4 | 0/2 | Not started | - |
| 30. Module 3 Migration | v1.4 | 0/2 | Not started | - |
| 31. Module 4 Migration | v1.4 | 0/2 | Not started | - |
| 32. Module 5 Migration | v1.4 | 0/2 | Not started | - |
| 33. Module 6 Migration | v1.4 | 0/2 | Not started | - |
| 34. Module 7 Migration | v1.4 | 0/2 | Not started | - |
| 35. Module 8 Migration | v1.4 | 0/2 | Not started | - |
| 36. Finalization | v1.4 | 0/3 | Not started | - |

## Coverage

### v1.4 Requirement Mapping

| Requirement | Phase | Description |
|-------------|-------|-------------|
| PRIM-01 | 26 | FlowNode component (glass-styled with 6 variants) |
| PRIM-02 | 26 | Arrow/Connector component (SVG between nodes) |
| PRIM-03 | 26 | DiagramContainer component (glass wrapper) |
| PRIM-04 | 27 | SequenceActor component (participant) |
| PRIM-05 | 27 | SequenceMessage component (arrows between actors) |
| PRIM-06 | 27 | SequenceLifeline component (vertical dashed lines) |
| TOOL-01 | 26 | Radix UI Tooltip integration |
| TOOL-02 | 26 | Click-to-open pattern (mobile friendly) |
| TOOL-03 | 26 | Keyboard navigation (Tab, Enter/Space) |
| TOOL-04 | 26 | Tooltip positioning (no overlap) |
| TOOL-05 | 26 | Glass-styled tooltip content |
| MOD1-01 | 28 | Module 1 diagram audit |
| MOD1-02 | 28 | Module 1 glass diagram creation |
| MOD1-03 | 28 | Module 1 tooltip addition |
| MOD1-04 | 28 | Module 1 Mermaid removal |
| MOD2-01 | 29 | Module 2 diagram audit |
| MOD2-02 | 29 | Module 2 glass diagram creation |
| MOD2-03 | 29 | Module 2 tooltip addition |
| MOD2-04 | 29 | Module 2 Mermaid removal |
| MOD3-01 | 30 | Module 3 diagram audit |
| MOD3-02 | 30 | Module 3 glass diagram creation |
| MOD3-03 | 30 | Module 3 tooltip addition |
| MOD3-04 | 30 | Module 3 Mermaid removal |
| MOD4-01 | 31 | Module 4 diagram audit |
| MOD4-02 | 31 | Module 4 glass diagram creation |
| MOD4-03 | 31 | Module 4 tooltip addition |
| MOD4-04 | 31 | Module 4 Mermaid removal |
| MOD5-01 | 32 | Module 5 diagram audit |
| MOD5-02 | 32 | Module 5 glass diagram creation |
| MOD5-03 | 32 | Module 5 tooltip addition |
| MOD5-04 | 32 | Module 5 Mermaid removal |
| MOD6-01 | 33 | Module 6 diagram audit |
| MOD6-02 | 33 | Module 6 glass diagram creation |
| MOD6-03 | 33 | Module 6 tooltip addition |
| MOD6-04 | 33 | Module 6 Mermaid removal |
| MOD7-01 | 34 | Module 7 diagram audit |
| MOD7-02 | 34 | Module 7 glass diagram creation |
| MOD7-03 | 34 | Module 7 tooltip addition |
| MOD7-04 | 34 | Module 7 Mermaid removal |
| MOD8-01 | 35 | Module 8 diagram audit |
| MOD8-02 | 35 | Module 8 glass diagram creation |
| MOD8-03 | 35 | Module 8 tooltip addition |
| MOD8-04 | 35 | Module 8 Mermaid removal |
| FINAL-01 | 36 | Visual regression testing |
| FINAL-02 | 36 | Accessibility audit (WCAG keyboard) |
| FINAL-03 | 36 | Mobile responsiveness verification |
| FINAL-04 | 36 | Remove mermaid dependency |
| FINAL-05 | 36 | Bundle size optimization verification |

**Coverage:** 48/48 requirements mapped

### v1.3 Requirement Mapping (Complete)

| Requirement | Phase | Description |
|-------------|-------|-------------|
| UX-01a | 22 | Descriptive module names in sidebar |
| UX-01b | 22 | Descriptive module names in breadcrumbs |
| UX-01c | 22 | Descriptive module names on homepage |
| UX-02a | 23 | Accordion menu of modules (collapsed by default) |
| UX-02b | 23 | Lesson list expands on click |
| UX-02c | 23 | Progress indicator per module |
| UX-03a | 24 | Clear cell borders (1px solid) |
| UX-03b | 24 | Readable text contrast (WCAG 4.5:1) |
| UX-03c | 24 | Light glass effect (blur 8px) |
| UX-04a | 22 | Gradient background (foundation for glass effect) |
| UX-04b | 22 | Glass sidebar navigation |
| UX-04c | 24 | Glass callouts (info, warning, tip) |
| UX-04d | 23 | Glass module cards on homepage |
| UX-04e | 25 | Responsive blur (less on mobile) |
| UX-04f | 25 | Accessibility fallbacks (prefers-reduced-transparency) |

**Coverage:** 15/15 requirements mapped

### v1.2 Requirement Mapping (Complete)

| Requirement | Phase | Description |
|-------------|-------|-------------|
| STRUCT-01a | 19 | Rename module directories (08->03, shift 03-07->04-08) |
| STRUCT-01b | 19 | Navigation auto-discovers new structure (no config changes needed) |
| STRUCT-01c | 20 | Update all internal cross-references |
| STRUCT-01d | 20 | Update roadmap component (module order) |
| STRUCT-01e | 20 | Update progress tracking (localStorage keys) |
| STRUCT-01f | 21 | Verify all navigation links work |
| STRUCT-01g | 21 | Verify progress persistence after reorg |

**Coverage:** 7/7 requirements mapped

### v1.1 Requirement Mapping (Complete)

| Requirement | Phase | Description |
|-------------|-------|-------------|
| INFRA-09 | 12 | MySQL 8.0.40 Docker service (port 3307) |
| INFRA-10 | 12 | Binlog configuration (ROW, GTID, retention) |
| INFRA-11 | 12 | ARM64 compatibility for MySQL Docker |
| MYSQL-01 | 12 | MySQL binlog architecture (formats, events, rotation) |
| MYSQL-02 | 12 | GTID mode and CDC impact |
| MYSQL-03 | 12 | Binlog retention and heartbeat events |
| MYSQL-04 | 13 | MySQL connector Docker Compose setup |
| MYSQL-05 | 13 | MySQL binlog vs PostgreSQL WAL comparison |
| MYSQL-06 | 13 | Schema history topic configuration |
| MYSQL-07 | 14 | Aurora MySQL parameter groups configuration |
| MYSQL-08 | 14 | Aurora Enhanced Binlog architecture |
| MYSQL-09 | 14 | Aurora MySQL CDC limitations |
| MYSQL-10 | 15 | Binlog lag monitoring (JMX, CloudWatch) |
| MYSQL-11 | 15 | Failover procedures with GTID |
| MYSQL-12 | 15 | Incremental snapshot and signal table |
| MYSQL-13 | 16 | Recovery: binlog position loss, schema history corruption |
| MYSQL-14 | 16 | Multi-connector deployments (server ID registry) |
| MYSQL-15 | 16 | DDL tool integration (gh-ost, pt-osc) |
| MYSQL-16 | 17 | Multi-database CDC pipeline (PostgreSQL + MySQL) |
| PLAT-07 | 18 | GitHub Pages deployment with CI/CD |

**Coverage:** 20/20 requirements mapped
