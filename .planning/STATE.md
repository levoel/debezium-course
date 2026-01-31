# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-31)

**Core value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций
**Current focus:** Phase 6 - Module 2 PostgreSQL/Aurora (complete)

## Current Position

Phase: 6 of 11 (Module 2 PostgreSQL/Aurora)
Plan: 3 of 3 complete
Status: Phase complete
Last activity: 2026-02-01 — Completed Phase 6 (7 lessons, 2780 lines, 19 Mermaid diagrams)

Progress: [███████████░░░░░░░░░] 55% (6/11 phases complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 17
- Average duration: 3.2 minutes
- Total execution time: 0.9 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 - Platform Foundation | 3/4 | 12.5m | 4.2m |
| 02 - Navigation and Roadmap | 4/4 | 8.5m | 2.1m |
| 03 - Progress Tracking | 4/4 | 7.5m | 1.9m |
| 04 - Lab Infrastructure | 4/4 | 19m | 4.8m |
| 05 - Module 1 Foundations | 3/3 ✓ | 8.5m | 2.8m |
| 06 - Module 2 PostgreSQL/Aurora | 3/3 ✓ | 14.5m | 4.8m |

**Recent Trend:**
- Last 5 plans: 05-03 (3m), 06-01 (6.3m), 06-02 (4m), 06-03 (4m)
- Trend: Content creation averaging 4.6m/plan for deep technical content

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap structure: 11 phases derived from requirements (3 platform phases, 1 infrastructure, 6 content modules, 1 capstone)
- Depth setting: Comprehensive (8-12 phases) to allow natural learning progression
- Phase ordering: Platform foundation -> navigation -> progress tracking -> lab infrastructure -> content modules following pedagogical progression
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
- Progress store: persistentAtom with JSON encode/decode for reliable array serialization (03-01, fixed 03-04)
- Toggle pattern: Single toggleLessonComplete for simpler UI binding (03-01)
- SSR-safe pattern: useEffect + mounted state for localStorage-dependent rendering (03-02)
- Status feedback: auto-dismiss messages after 3 seconds (03-02)
- Green completion color: #10b981 (emerald-500) for completed nodes/checkmarks (03-03)
- Reactive progress display: useStore($progress) for automatic UI updates (03-03)
- Safe array access: Array.isArray() checks in all progress consumers (03-04)
- Reset button: ProgressExport includes reset for clearing corrupted data (03-04)
- 15s Prometheus scrape interval for JMX metrics (04-02)
- Grafana datasource non-editable via provisioning (04-02)
- Metric relabeling to kafka_connect_* and debezium_* only (04-02)
- jupyter/scipy-notebook as base image for JupyterLab (04-03)
- confluent-kafka 2.13.0+ for ARM64 native wheel support (04-03)
- Docker network names for internal services (postgres, kafka, connect) (04-03)
- Confluent Kafka 7.8.1 instead of quay.io/debezium/kafka due to Java 21 ARM64 crash (04-01)
- Debezium Connect 2.5.4 instead of 3.0.8 for same Java 21 compatibility (04-01)
- PostgreSQL external port 5433 (5432 in use on host) (04-01)
- 7 services in single docker-compose.yml for lab simplicity (04-04)
- Russian documentation language for course consistency (04-04)
- Human verification checkpoint for production-quality lab environment (04-04)
- Lesson language pattern: Russian explanatory text, English code/config (05-01)
- Internal vs external port distinction: database.port 5432 internal, 5433 external (05-02)
- Two-terminal demo pattern for live CDC capture (05-02)
- Replication slot monitoring for operational awareness (05-02)
- confluent-kafka over kafka-python for performance and Confluent support (05-03)
- Prominent kafka:9092 vs localhost:9092 hostname warning for Docker networking clarity (05-03)
- parse_cdc_event function handles all operation types (r, c, u, d) explicitly (05-03)
- pgoutput as standard plugin - built-in since PG 10+, no dependencies, Aurora/RDS compatible (06-01)
- REPLICA IDENTITY DEFAULT recommended - FULL only for full row history (30-50% additional WAL overhead) (06-01)
- max_slot_wal_keep_size mandatory for production CDC - prevents disk exhaustion (06-01)
- pg_replication_slots monitoring query with lag_bytes and wal_status for slot health (06-01)
- DB Cluster vs DB Instance parameter group distinction critical for Aurora CDC (06-02)
- Heartbeat interval 10 seconds recommended for Aurora failover detection (06-02)
- Four mitigation strategies for Aurora failover data loss: accept risk, incremental snapshot, global db, outbox (06-02)
- PostgreSQL 17 failover slots as future solution, Aurora adoption timeline unclear (06-02)
- Chunk size 512 for lab demo visibility, production uses 2048-4096 (06-03)
- Signaling table pattern: id/type/data schema for Debezium commands (06-03)
- snapshot.mode=never with manual incremental trigger for teaching clarity (06-03)

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Fix hamburger navigation dual module display | 2026-02-01 | 19f5ea8 | [001-fix-hamburger-navigation](./quick/001-fix-hamburger-navigation/) |
| 002 | Remove duplicate course roadmap | 2026-02-01 | 642fe5f | [002-remove-course-roadmap](./quick/002-remove-course-roadmap/) |
| 003 | Collapsible sidebar modules | 2026-02-01 | 50b366a | [003-collapsible-sidebar-modules](./quick/003-collapsible-sidebar-modules/) |

## Session Continuity

Last session: 2026-02-01
Stopped at: Completed Phase 6 - Module 2 PostgreSQL/Aurora (all 3 plans, 7 lessons)
Resume file: None

---
*State initialized: 2026-01-31*
*Last updated: 2026-02-01*
