# Project Milestones: Debezium Course

## v1.6 Full-Text Search (Shipped: 2026-02-03)

**Delivered:** Instant full-text search across all course content via Cmd+K modal with Pagefind indexing, Russian morphology support, and glass design integration.

**Phases completed:** 41-45 (5 phases, search implemented in batched commits)

**Key accomplishments:**

- Built Pagefind search index (1.5MB) covering 65+ lessons with Russian stemming
- Created SearchModal with Cmd+K/Ctrl+K keyboard shortcut and 200ms debounce
- Added SearchButton for click access (Brave browser Cmd+K intercept workaround)
- Integrated glass design (backdrop-blur, rgba borders, yellow highlighting)
- Updated Module 0 with search usage documentation

**Stats:**

- 3 source files created (SearchModal.tsx, SearchButton.tsx, stores/search.ts)
- 396 lines of TypeScript/React
- 17/21 requirements complete (3 skipped as UX trade-offs, 1 partial)

**Git range:** `feat(41-01)` → `feat(41-43)`

**What's next:** v1.7 with theme toggle, search enhancements, or MongoDB module

---

## v1.5 Onboarding & Polish (Shipped: 2026-02-03)

**Delivered:** Module 0 platform guide, GitHub repository link, and 8 glass-styled module summary mini-lessons for improved onboarding.

**Phases completed:** 38-40 (3 plans total)

**Key accomplishments:**

- Created Module 0 "Как пользоваться" with 4 onboarding lessons (navigation, progress, lab, structure)
- Added GitHub repository link to header with glass hover effect
- Built 8 module summary mini-lessons with glass-card styling
- Standardized "Что дальше?" sections linking modules together

**Stats:**

- 13 MDX files created
- 3 phases, 3 plans
- 7/7 requirements complete

**Git range:** `feat(38-01)` → `feat(40-01)`

**What's next:** v1.6 with search functionality, theme toggle, or MongoDB module

---

## v1.4 Interactive Glass Diagrams (Shipped: 2026-02-03)

**Delivered:** Replaced all 170 Mermaid diagrams with interactive React glass components featuring tooltips, keyboard accessibility, and 72% bundle size reduction.

**Phases completed:** 26-37 (32 plans total)

**Key accomplishments:**

- Built primitives library: FlowNode, Arrow, DiagramContainer, DiagramTooltip (Phase 26)
- Built sequence diagram primitives: SequenceActor, SequenceLifeline, SequenceMessage, SequenceDiagram (Phase 27)
- Migrated all 8 modules (170 diagrams) to interactive glass components (Phases 28-35)
- Added Russian-language tooltips with contextual explanations to all diagram nodes
- Removed Mermaid dependency: 2.6MB JavaScript bundle reduction (72%)
- Verified accessibility (keyboard navigation) and mobile responsiveness (390x844 viewport)

**Stats:**

- 70 diagram component files created
- 24,386 lines of diagram code (TypeScript/React)
- 12 phases, 32 plans, 169+ commits
- 1 day execution (2026-02-02)

**Git range:** `feat(26-01)` → `feat(37-01)`

**What's next:** v1.5 with search functionality, theme toggle, or additional content modules

---

## v1.3 UX/Design Refresh (Shipped: 2026-02-02)

**Delivered:** Liquid glass design system with gradient backgrounds, glass-styled components, and accessibility fallbacks.

**Phases completed:** 22-25 (13 plans total)

**Key accomplishments:**

- CSS custom properties for glass design system (blur, opacity, shadows)
- Gradient background layer (purple/blue/pink radials on dark base)
- Glass-styled sidebar, tables, callouts, and module cards
- Descriptive module names instead of "Module N"
- Homepage accordion menu with progress indicators
- Responsive blur reduction for mobile performance
- Accessibility fallbacks (prefers-reduced-transparency, prefers-reduced-motion)

**Stats:**

- 4 phases, 13 plans
- 15/15 requirements complete (1 deferred: breadcrumbs)

**Git range:** `feat(22-01)` → `feat(25-03)`

---

## v1.2 Course Reorganization (Shipped: 2026-02-01)

**Delivered:** MySQL module moved to position 3 (Database Track with PostgreSQL), with cross-reference updates and E2E test suite.

**Phases completed:** 19-21 (4 plans total)

**Key accomplishments:**

- Renumbered modules: MySQL (08→03), PostgreSQL track adjacent
- Updated all internal cross-references
- Added progress migration for existing localStorage
- Created Playwright E2E test suite

**Stats:**

- 3 phases, 4 plans
- 7/7 requirements complete

**Git range:** `feat(19-01)` → `feat(21-02)`

---

## v1.1 MySQL/Aurora MySQL + Deployment (Shipped: 2026-02-01)

**Delivered:** Comprehensive MySQL/Aurora MySQL CDC module (15 lessons) and GitHub Pages deployment with CI/CD.

**Phases completed:** 12-18 (19 plans total)

**Key accomplishments:**

- MySQL binlog deep-dive (formats, GTID, rotation, retention)
- Aurora MySQL specifics (parameter groups, Enhanced Binlog, limitations)
- Production operations (monitoring, failover, incremental snapshots)
- Multi-database capstone (PostgreSQL + MySQL unified pipeline)
- GitHub Pages deployment with withastro/action@v5

**Stats:**

- 7 phases, 19 plans
- 20/20 requirements complete

**Git range:** `feat(12-01)` → `feat(18-02)`

---

## v1.0 Complete Course (Shipped: 2026-02-01)

**Delivered:** Production-ready Debezium CDC course covering fundamentals through cloud-native GCP deployment, with 7 modules, 42+ lessons, and interactive lab environment.

**Phases completed:** 1-11 (32 plans total)

**Key accomplishments:**

- Built interactive course platform with progress tracking and visual roadmap
- Created complete Docker Compose lab (PostgreSQL, Kafka KRaft, Debezium 2.5.x, monitoring)
- Authored comprehensive content: CDC fundamentals → production operations → advanced patterns
- Covered data engineering integration: Python, Pandas, PyFlink, PySpark
- Delivered GCP cloud-native content: Cloud SQL, Pub/Sub, Dataflow, Cloud Run
- Designed capstone project with production readiness self-assessment

**Stats:**

- 59 source files created
- 24,273 lines of code (TypeScript, MDX, Astro)
- 11 phases, 32 plans, 160 commits
- 2 days from start to ship (2026-01-31 → 2026-02-01)

**Git range:** `c760d11` (first commit) → `48c6256` (audit report)

**What's next:** Deploy to GitHub Pages, gather user feedback, plan v1.1 enhancements

---
