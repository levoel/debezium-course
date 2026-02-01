# Roadmap: Debezium Course

## Milestones

- [x] **v1.0 MVP** - Phases 1-11 (shipped 2026-02-01)
- [x] **v1.1 MySQL/Aurora MySQL + Deployment** - Phases 12-18 (shipped 2026-02-01)
- [x] **v1.2 Course Reorganization** - Phases 19-21 (shipped 2026-02-01)
- [ ] **v1.3 UX/Design Refresh** - Phases 22-25 (in progress)

## Overview

v1.3 applies liquid glass (glassmorphism) design to the course website and improves navigation with descriptive module names and accordion-based homepage. This milestone transforms the visual experience while maintaining WCAG accessibility standards and mobile performance.

## Phases

**Phase Numbering:**
- v1.0: Phases 1-11 (complete)
- v1.1: Phases 12-18 (complete)
- v1.2: Phases 19-21 (complete)
- v1.3: Phases 22-25

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
- [ ] 24-01-PLAN.md — Glass table styles + solid code block styles (global.css)
- [ ] 24-02-PLAN.md — Glass callout component enhancement (Callout.tsx)

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
**Plans**: TBD

Plans:
- [ ] 25-01-PLAN.md — TBD

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

- [x] **Phase 12: MySQL Infrastructure + Binlog Fundamentals** - Docker MySQL service and binlog theory ✓
- [x] **Phase 13: Connector Setup + Comparison** - MySQL connector configuration and WAL comparison ✓
- [x] **Phase 14: Aurora MySQL Specifics** - Aurora Enhanced Binlog and limitations ✓
- [x] **Phase 15: Production Operations** - Monitoring, failover, incremental snapshots ✓
- [x] **Phase 16: Advanced Topics + Recovery** - Recovery procedures, multi-connector, DDL tools ✓
- [x] **Phase 17: Multi-Database Capstone** - PostgreSQL + MySQL unified pipeline ✓
- [x] **Phase 18: GitHub Pages Deployment** - Static site deployment with CI/CD (complete)

## Phase Details

### Phase 12: MySQL Infrastructure + Binlog Fundamentals
**Goal**: Course learner can understand MySQL binlog architecture and has working MySQL Docker environment for hands-on labs
**Depends on**: Phase 11 (v1.0 complete)
**Requirements**: INFRA-09, INFRA-10, INFRA-11, MYSQL-01, MYSQL-02, MYSQL-03
**Success Criteria** (what must be TRUE):
  1. MySQL 8.0.40 Docker service starts successfully alongside existing PostgreSQL/Kafka infrastructure
  2. Binlog is enabled with ROW format and GTID mode active (verifiable via `SHOW VARIABLES`)
  3. Learner can explain ROW vs STATEMENT vs MIXED binlog formats and when to use each
  4. Learner understands GTID mode benefits for CDC (failover, position tracking) and configuration requirements
  5. Learner knows how to configure binlog retention and heartbeat events to prevent position loss
**Plans**: 3 plans (Wave 1 - all parallel)

Plans:
- [x] 12-01-PLAN.md — MySQL Docker infrastructure with binlog configuration
- [x] 12-02-PLAN.md — Binlog architecture lesson (ROW/STATEMENT/MIXED formats)
- [x] 12-03-PLAN.md — GTID mode and retention/heartbeat lessons

### Phase 13: Connector Setup + Comparison
**Goal**: Course learner can configure MySQL CDC connector and understand architectural differences from PostgreSQL
**Depends on**: Phase 12
**Requirements**: MYSQL-04, MYSQL-05, MYSQL-06
**Success Criteria** (what must be TRUE):
  1. Learner can deploy MySQL CDC connector via Kafka Connect REST API with working configuration
  2. Learner can articulate key differences between MySQL binlog and PostgreSQL WAL (replication approach, monitoring metrics, position tracking)
  3. Schema history topic is properly configured and learner understands its critical role for connector recovery
  4. CDC events flow from MySQL to Kafka topics with correct schema
**Plans**: 3 plans (Wave 1 - all parallel)

Plans:
- [x] 13-01-PLAN.md — MySQL connector configuration lesson (REST API deployment, properties)
- [x] 13-02-PLAN.md — Binlog vs WAL architectural comparison lesson
- [x] 13-03-PLAN.md — Schema history topic and recovery procedures lesson

### Phase 14: Aurora MySQL Specifics
**Goal**: Course learner can configure Debezium for Aurora MySQL and understands Aurora-specific behaviors
**Depends on**: Phase 13
**Requirements**: MYSQL-07, MYSQL-08, MYSQL-09
**Success Criteria** (what must be TRUE):
  1. Learner can configure Aurora MySQL parameter groups for CDC (binlog format, retention)
  2. Learner understands Aurora Enhanced Binlog architecture (storage nodes, 99% faster recovery claims)
  3. Learner knows Aurora MySQL CDC limitations (global read lock prohibition, affected snapshot modes)
  4. Learner can choose appropriate snapshot.mode for Aurora MySQL based on table size and lock tolerance
**Plans**: 3 plans (Wave 1 - all parallel)

Plans:
- [x] 14-01-PLAN.md — Aurora MySQL parameter groups and binlog retention (stored procedures)
- [x] 14-02-PLAN.md — Aurora Enhanced Binlog architecture and trade-offs
- [x] 14-03-PLAN.md — Aurora snapshot mode selection and large table strategies

### Phase 15: Production Operations
**Goal**: Course learner can monitor, troubleshoot, and operate MySQL CDC in production
**Depends on**: Phase 14
**Requirements**: MYSQL-10, MYSQL-11, MYSQL-12
**Success Criteria** (what must be TRUE):
  1. Learner can set up binlog lag monitoring using JMX metrics and AuroraBinlogReplicaLag CloudWatch metric
  2. Learner can execute MySQL/Aurora MySQL failover procedure with GTID mode (position preservation)
  3. Learner can configure and trigger incremental snapshots using signal table operations
  4. Prometheus/Grafana dashboard includes MySQL-specific metrics (binlog position, gtid set)
**Plans**: 3 plans (Wave 1 - all parallel)

Plans:
- [x] 15-01-PLAN.md — Binlog lag monitoring lesson (JMX, CloudWatch, Grafana dashboard)
- [x] 15-02-PLAN.md — GTID failover procedures lesson (runbook, validation)
- [x] 15-03-PLAN.md — Incremental snapshots lesson (signal table, read-only snapshots)

### Phase 16: Advanced Topics + Recovery
**Goal**: Course learner can handle advanced MySQL CDC scenarios and recover from failures
**Depends on**: Phase 15
**Requirements**: MYSQL-13, MYSQL-14, MYSQL-15
**Success Criteria** (what must be TRUE):
  1. Learner can recover from binlog position loss (purged binlogs) using snapshot restart
  2. Learner can recover from schema history topic corruption using Kafka topic restoration
  3. Learner can deploy multiple MySQL connectors with proper server.id registry (conflict prevention)
  4. Learner understands gh-ost and pt-online-schema-change patterns for zero-downtime DDL with CDC
**Plans**: 3 plans (Wave 1 - all parallel)

Plans:
- [x] 16-01-PLAN.md — Recovery procedures lesson (binlog loss + schema history corruption)
- [x] 16-02-PLAN.md — Multi-connector deployments lesson (server.id registry)
- [x] 16-03-PLAN.md — DDL tools integration lesson (gh-ost + pt-osc patterns)

### Phase 17: Multi-Database Capstone
**Goal**: Course learner can design and implement a multi-database CDC pipeline combining PostgreSQL and MySQL
**Depends on**: Phase 16
**Requirements**: MYSQL-16
**Success Criteria** (what must be TRUE):
  1. Capstone extension clearly explains multi-database CDC architecture (PostgreSQL + MySQL sources)
  2. Learner can configure both connectors to produce to unified topic naming scheme
  3. Unified consumer processes events from both databases with schema awareness
  4. Learner understands trade-offs: separate vs merged topics, schema evolution challenges
**Plans**: 3 plans (Wave 1: 01, 02 parallel | Wave 2: 03)

Plans:
- [x] 17-01-PLAN.md — Multi-database CDC architecture lesson (patterns, operational differences)
- [x] 17-02-PLAN.md — Connector configuration + PyFlink unified consumer lesson
- [x] 17-03-PLAN.md — Self-assessment checklist extension for multi-database

### Phase 18: GitHub Pages Deployment
**Goal**: Debezium course is publicly accessible via GitHub Pages
**Depends on**: Phase 17 (content complete)
**Requirements**: PLAT-07
**Success Criteria** (what must be TRUE):
  1. GitHub Actions workflow builds Astro site on push to main
  2. Course is accessible at `https://<username>.github.io/debezium-course/` (or custom domain)
  3. All pages render correctly (MDX, Mermaid diagrams, syntax highlighting)
  4. Build passes consistently (no flaky failures)
**Plans**: 2 plans (Wave 1: 01 | Wave 2: 02)

Plans:
- [x] 18-01-PLAN.md — Update workflow to use withastro/action + local verification
- [x] 18-02-PLAN.md — Push, configure GitHub Pages, verify live deployment

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
Phases execute in numeric order: 22 -> 23 -> 24 -> 25

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 22. Foundation | v1.3 | 2/2 | Complete | 2026-02-01 |
| 23. Homepage Redesign | v1.3 | 2/2 | Complete | 2026-02-01 |
| 24. Content Components | v1.3 | 0/2 | Not started | - |
| 25. Polish | v1.3 | 0/TBD | Not started | - |

## Coverage

### v1.3 Requirement Mapping

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
