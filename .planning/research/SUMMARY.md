# Project Research Summary

**Project:** Interactive Debezium Course for Middle+ Data Engineers
**Domain:** Technical Education Platform (Interactive Course Website)
**Researched:** 2026-01-31
**Confidence:** HIGH

## Executive Summary

This research synthesizes findings across technology stack, course features, platform architecture, and critical pitfalls to inform roadmap creation for an interactive Debezium course. The recommended approach is to build a **static-first interactive course website using Astro 5's islands architecture** with React islands for progress tracking, code playgrounds, and interactive diagrams. The course should cover **6 major modules** (12 weeks total) progressing from CDC fundamentals through production operations, GCP cloud integration, and advanced patterns like the Outbox pattern and schema evolution.

The key differentiator from existing Debezium courses is **production focus over toy examples**. Most courses teach basic MySQL connector setup with 100-row databases; this course will emphasize operational realities (WAL bloat prevention, monitoring with Prometheus/Grafana, Cloud SQL/Aurora-specific configurations, disaster recovery) and cloud-native deployments (Debezium Server to Pub/Sub, Dataflow templates, Cloud Run consumers). Research shows that production Debezium deployments face critical pitfalls around replication slot management (PostgreSQL), snapshot strategy selection, and Kafka Connect configuration that are rarely addressed in educational content.

The primary risk is **content becoming outdated in 18 months** (Debezium 3.4 released December 2025, ecosystem evolves rapidly). Mitigation strategy: version-pin all technologies explicitly, implement quarterly content review cycles, and build modular course structure enabling easy updates. Secondary risk: **insufficient hands-on practice** leading to theoretical knowledge without practical skills — mitigated through 80/20 hands-on/theory ratio, Docker Compose environments, GCP cloud labs, and debugging exercises with intentional failures.

## Key Findings

### Recommended Stack

**Astro 5 emerges as the optimal framework** over Docusaurus and Next.js for content-heavy course websites, offering 5x faster Markdown builds, zero JavaScript by default, and excellent MDX support for embedding React components in course content. Combined with React 19 for interactive islands, TypeScript for type safety, and Tailwind CSS for mobile-first styling, this stack delivers a professional, fast, and maintainable learning platform.

**Core technologies:**
- **Astro 5.0+**: Static site generator with islands architecture — ships zero JS by default, 5x faster Markdown builds, selective hydration of interactive components
- **React 19**: UI framework for interactive islands (quizzes, code editors, progress trackers) — stable since December 2024, largest ecosystem
- **TypeScript 5.9+**: Type safety — essential for large content sites, avoid 6.0 beta
- **Tailwind CSS 4.x**: Utility-first CSS — rapid UI development, excellent mobile-first support
- **Shiki**: Syntax highlighting — TextMate-based (VS Code engine), ships zero JS (renders at build time), supports SQL/Java/YAML
- **CodeMirror 6**: Interactive code editor — via @uiw/react-codemirror wrapper, TypeScript support, theme customization
- **Mermaid.js**: Diagrams as code — essential for visualizing CDC pipelines, data flows, Debezium architecture
- **localStorage**: Client-side progress tracking — browser-native, no backend required, 5-10MB sufficient
- **GitHub Pages/Vercel**: Deployment — free static hosting, official Astro support, automatic builds

**Alternative considered:** Docusaurus 3 is excellent for API documentation but designed for documentation paradigm, not interactive learning experiences. Astro's flexibility and performance advantages (zero JS baseline vs 87KB for Docusaurus) make it better suited for custom course features like roadmap navigation and progress tracking.

### Expected Features

Research reveals a clear gap in the Debezium course ecosystem: most existing courses focus narrowly on basic MySQL connector setup with toy databases. This course differentiates through **production operations focus, cloud-native integrations, and hands-on troubleshooting**.

**Must have (table stakes):**
- CDC fundamentals and log-based CDC explanation
- PostgreSQL connector deep-dive (logical decoding, replication slots, WAL configuration)
- Aurora/RDS/Cloud SQL specific configurations and limitations
- Kafka integration basics (topic structure, event envelope, consumer development)
- Snapshot strategies (initial vs incremental, large database handling)
- Basic monitoring and JMX metrics

**Should have (competitive differentiators):**
- **Production operational concerns:** WAL bloat prevention (4-6 FTE problem per Netflix/Robinhood references), Prometheus/Grafana monitoring, lag detection and alerting, disaster recovery procedures
- **GCP cloud-native integration:** Cloud SQL PostgreSQL setup, Debezium Server to Pub/Sub (Kafka-less), Dataflow templates for CDC, Cloud Run event processing, BigQuery sync patterns
- **Advanced transformations:** Single Message Transformations (SMTs), content-based routing, PII masking, Outbox Event Router
- **Stream processing integration:** Python Kafka consumers, Pandas DataFrame integration, PyFlink CDC processing, real-time feature engineering
- **Hands-on troubleshooting:** Replication slot recovery, offset desynchronization diagnosis, snapshot failure handling, debugging exercises with intentional errors
- **Architecture patterns:** Outbox pattern for reliable microservices communication, event-driven architecture, CQRS with Debezium

**Defer (v2+ or optional modules):**
- Kubernetes deployment (operational complexity, optional advanced module)
- MongoDB/Cassandra connectors (different architecture, niche use cases)
- Multi-region active-active CDC (extremely complex)
- Custom SMT development (requires Java programming)
- Kafka Streams integration (separate topic, not Debezium-specific)

**Content structure:** 6 core modules (Foundations, PostgreSQL/Aurora Deep-Dive, Production Operations, Advanced Patterns, Data Engineering Integration, Cloud-Native GCP Deployment) plus capstone project. Each module includes theory (20%), hands-on labs (60%), and troubleshooting exercises (20%). Progressive complexity: start with single table INSERT events on local Docker, build to multi-source CDC pipeline with cloud deployment and monitoring.

### Architecture Approach

The course website follows **islands architecture pattern** (static-first with selective client-side interactivity), where most content is pre-rendered HTML with interactive "islands" for progress tracking, code playgrounds, and diagrams. This approach delivers fast initial page load (minimal JavaScript) while enabling rich interactivity where needed.

**Major components:**

1. **Static Content Layer** (Astro components)
   - AppShell: Global layout wrapper with header, footer, navigation sidebar
   - ContentArea: Markdown/MDX course content renderer with syntax highlighting
   - NavigationSidebar: Module tree with conditional rendering (mobile hamburger menu, desktop persistent sidebar)
   - Breadcrumbs, NextPrevButtons: Sequential navigation through lessons

2. **Interactive Islands** (React components with client-side hydration)
   - ProgressTracker: Centralized state manager using localStorage, React Context for distribution
   - CodePlayground: Interactive code editor (CodeMirror 6) for hands-on exercises
   - DiagramViewer: Interactive Mermaid diagrams for CDC architectures, data flows
   - ExerciseCard: Practical exercises with validation, updates progress on completion
   - QuizQuestion: Knowledge checks with immediate feedback
   - RoadmapView: SVG/React Flow based interactive course roadmap with progress indicators

3. **State Management** (Hybrid approach)
   - Progress state: Zustand or React Context (lightweight, ~1KB) — avoids Redux overhead for simple use case
   - Persistent state: localStorage as single source of truth (schema-versioned JSON, debounced writes)
   - Router state: Framework-native routing (Astro file-based or React Router)
   - Local component state: useState for UI interactions (expandable sections, modals)

**Data flow:** Unidirectional flow (user action → state update → UI re-render) with optimistic updates (update UI immediately, persist to localStorage asynchronously). Progress structure stored as hierarchical JSON: `{ modules: { [moduleId]: { lessons: { [lessonId]: { completed, exercises: {...} } } } } }`.

**File structure:** Feature-based organization with course modules as top-level features. `/src/components/` contains reusable UI components organized by type (layout, content, navigation), while `/src/features/` contains domain-specific course modules (module-1-intro, module-2-setup, etc.) with co-located exercises.

**Mobile-first responsive design:** Breakpoints at 640px (mobile), 768px (tablet), 1024px (desktop). Navigation sidebar hidden on mobile (hamburger menu), collapsible on tablet, persistent on desktop. Code blocks with horizontal scroll on mobile, optimized font size on desktop. Interactive diagrams support pinch-to-zoom and pan gestures.

### Critical Pitfalls

Research identified **40+ production Debezium pitfalls** and **8 course creation pitfalls**. Top critical issues:

**Debezium Production Pitfalls:**

1. **PostgreSQL Replication Slot Growth (WAL Accumulation)** — Database disk space consumed by WAL files spikes indefinitely when replication slots aren't properly monitored. On RDS/Cloud SQL, stale connections and missing heartbeat configuration cause slots to hold logs indefinitely, leading to database outage. **Prevention:** Configure `heartbeat.interval.ms`, enable TCP keepalive settings, monitor `pg_replication_slots.confirmed_flush_lsn` lag, set WAL retention policies. **Course integration:** Phase 2 (PostgreSQL Connector) explains replication slots with monitoring demo, Phase 4 (Production Operations) configures heartbeat and alerts, Phase 7 (Troubleshooting) covers recovery from full disk scenarios.

2. **Node Replacement Data Loss (Cloud SQL/Aurora Failover)** — After database failover, replication slots are NOT automatically recreated on newly promoted primary. Changes occurring before Debezium recreates the slot are permanently lost with no warning. **Prevention:** Monitor failover events, configure slot recreation scripts, test failover procedures regularly, document acceptable RPO (Recovery Point Objective). **Course integration:** Phase 3 (Cloud Integrations) demonstrates Cloud SQL failover behavior, Phase 4 (Production) implements failover detection automation, Phase 7 (Troubleshooting) covers data loss assessment.

3. **Snapshot Failures on Large Databases** — Conventional snapshots are extremely slow (days for TB-scale), hold read locks blocking production writes, and restart from beginning on failure. Aurora/RDS privilege limitations (`FLUSH TABLES WITH READ LOCK` requires SUPER) cause snapshot initialization failures. **Prevention:** Use incremental snapshots (chunks in parallel with streaming), configure `snapshot.locking.mode=minimal` for RDS/Aurora, schedule off-peak snapshots, size workers appropriately. **Course integration:** Phase 5 (Snapshots) compares conventional vs incremental with hands-on demo, Phase 1 (Aurora) explains RDS privilege model.

4. **Offset Desynchronization After Failures** — After crashes or network failures, Debezium offset (last processed position) doesn't match database replication slot LSN, causing data gaps or duplicate events. Deleting internal Kafka topics (`connect-offsets`) creates catastrophic state loss. **Prevention:** Never delete internal topics (set retention to infinite), configure `offset.mismatch.strategy`, backup offsets regularly, monitor offset vs slot position divergence. **Course integration:** Phase 4 (Production) configures internal topics with infinite retention, Phase 7 (Troubleshooting) diagnoses and fixes offset desync, Phase 6 (Operations) implements backup/restore procedures.

5. **Infrastructure Burden (Kafka Ecosystem Complexity)** — Organizations not using Kafka must stand up entire ecosystem (Kafka, ZooKeeper/KRaft, Schema Registry, Connect) creating 3-6 month project before CDC begins, ongoing operational overhead, and high cost for small use cases. **Alternative:** Debezium Server supports Pub/Sub, Kinesis, HTTP without Kafka. **Course integration:** Phase 3 (Cloud Integrations) demonstrates Debezium Server with Pub/Sub (Kafka-less architecture), Phase 10 (Alternative Architectures) compares deployment models.

**Course Creation Pitfalls:**

6. **Outdated Examples and Technologies** — Tech content becomes outdated in 18 months (Debezium 3.4 released Dec 2025, Kafka deprecated ZooKeeper in 3.x). Students learn wrong patterns, examples don't run on current versions. **Prevention:** Version-pin with intention (document exact versions and why), quarterly review cadence, use current versions (Debezium 3.4+, Kafka with KRaft), flag version-specific content ("As of Debezium 3.4..."), test examples on launch day. **Course integration:** All phases use Debezium 3.4+, Kafka with KRaft (no ZooKeeper), current cloud provider UIs. Implement automated CI/CD testing of lab code weekly.

7. **Missing Hands-On Practice** — Theoretical courses explain concepts without practical application, leading to knowledge that doesn't translate to skills. Students fail technical interviews, can't configure connectors despite understanding CDC conceptually. **Prevention:** 80/20 hands-on/theory ratio, every concept = one exercise, provide Docker Compose environments for local labs, Terraform templates for cloud deployments, progressive complexity (start simple, add constraints), debugging exercises with intentional errors to fix. **Course integration:** Every phase includes hands-on lab with starter code, broken scenarios to debug, and solution walkthrough.

8. **Poor Prerequisite Management** — Unclear prerequisites cause frustration for beginners (lost) and experts (bored). Course assumes wrong level of prior knowledge about SQL, Kafka, Docker. **Prevention:** Define target audience precisely ("Middle+ data engineers, 2+ years experience, basic Kafka concepts, no prior CDC experience"), list explicit prerequisites (SQL JOINs/transactions, Docker basics, Python or Java scripting), prerequisite assessment quiz, optional refresher module. **Course integration:** Phase 0 prerequisite module with Kafka 101 refresher (15 min), Docker basics (10 min), assessment quiz before enrollment.

## Implications for Roadmap

Based on research synthesis, recommended phase structure aligns with **3 parallel tracks**: (1) Course website platform build, (2) Course content creation, (3) Supporting infrastructure (labs, monitoring). Platform phases 1-3 are sequential (layout → navigation → progress tracking), while phases 4-5 can parallelize (roadmap + rich content). Content phases follow learning progression (foundations → database-specific → production → advanced).

### Platform Development Track

**Phase 1: Static Foundation (Week 1-2)**
- **Rationale:** Establish basic content rendering and validate deployment pipeline before adding complexity. Static-first approach (islands architecture) requires HTML rendering foundation before interactive features.
- **Delivers:** Astro 5 project initialized with TypeScript, basic layout components (AppShell, Header, Footer, ContentArea), routing setup, responsive styles (mobile-first), deployable to GitHub Pages/Vercel with first sample lesson rendered.
- **Stack elements:** Astro 5, TypeScript 5.9, Tailwind CSS 4.x, Vite 6
- **Avoids pitfall:** Starting with complex interactivity before validating static rendering (architecture anti-pattern)
- **Dependencies:** None (foundation layer)

**Phase 2: Navigation System (Week 3)**
- **Rationale:** Navigation structure must be stable before adding progress tracking (progress depends on course structure data model). Multiple navigation patterns (sidebar, breadcrumbs, next/prev) need consistent course structure schema.
- **Delivers:** NavigationSidebar (module tree with mobile hamburger, desktop persistent), Breadcrumbs, NextPrevButtons, course structure data model (course-structure.ts defining module/lesson hierarchy), full navigation between lessons.
- **Architecture component:** Navigation layer (reads course structure, provides multiple UI patterns)
- **Dependencies:** Phase 1 (requires routing and layout)

**Phase 3: Progress Tracking Core (Week 4)**
- **Rationale:** Progress tracking is critical path — unblocks interactive roadmap (Phase 4) and exercise validation (Phase 5). Must be stable before dependent features. LocalStorage-based state management avoids backend complexity while enabling personalization.
- **Delivers:** ProgressTracker state manager, localStorage abstraction with schema versioning, ProgressProvider (React Context), CompletionMarker components, ProgressBar visual indicator, progress persists across sessions, export/import functionality.
- **Stack elements:** Zustand or React Context, localStorage API
- **Avoids pitfall:** Treating localStorage as a database (anti-pattern) — uses simple flat structure, debounced writes, schema versioning for migrations
- **Dependencies:** Phase 2 (requires course structure data for progress hierarchy)

**Phase 4: Interactive Roadmap (Week 5) [Can parallelize with Phase 5]**
- **Rationale:** Visual course overview enhances engagement but not blocking for course consumption. Can develop in parallel with rich content components.
- **Delivers:** RoadmapView component (SVG or React Flow based), integration with ProgressTracker for completion visualization, click-to-navigate functionality, mobile-responsive (pinch-to-zoom, pan gestures).
- **Stack elements:** React Flow or custom SVG, Mermaid.js for architecture diagrams
- **Dependencies:** Phase 3 (requires progress state for visualization)

**Phase 5: Rich Content Components (Week 5-6) [Can parallelize with Phase 4]**
- **Rationale:** Code examples, diagrams, and exercises are essential for course value but can develop incrementally. Start with CodeBlock (easiest), add diagrams, exercises, defer playground to post-MVP if needed.
- **Delivers:** CodeBlock (Shiki syntax highlighting, copy button), DiagramViewer (interactive Mermaid diagrams), ExerciseCard (validation, progress updates), QuizQuestion (knowledge checks with feedback), optionally CodePlayground (defer if time-constrained).
- **Stack elements:** Shiki, @uiw/react-codemirror, Mermaid.js
- **Avoids pitfall:** Over-componentizing (architecture anti-pattern) — group logically (e.g., LessonHeader contains title/description/metadata, not separate components for each)
- **Dependencies:** Phase 3 (exercises update progress)

**Phase 6: Enhancements & Polish (Week 7)**
- **Rationale:** UX improvements and accessibility after core functionality validated. Search, theme switcher, mobile refinements enhance existing features without changing core architecture.
- **Delivers:** Search functionality, dark/light theme switcher, ProgressExporter (backup/restore), mobile navigation refinements, accessibility audit (keyboard nav, ARIA labels, WCAG contrast ratios), production-ready deployment.
- **Dependencies:** Phases 1-5 complete (polish layer on top of core features)

### Content Creation Track

**Phase 7: Module 1 - Foundations (Week 3-4, parallel with platform Phases 2-3)**
- **Rationale:** Start content creation early to validate platform features with real content. Foundations module establishes course structure and can develop alongside platform navigation system.
- **Delivers:** CDC fundamentals content (what is CDC, log-based vs polling, Debezium architecture overview), Docker Compose environment setup, basic Kafka integration, first connector deployment (PostgreSQL local), Python consumer example. Labs: Docker stack setup, connector configuration via REST API, parse CDC events in Python.
- **Features addressed:** Table stakes - CDC fundamentals, Debezium architecture, Kafka integration basics
- **Avoids pitfall:** Missing hands-on practice — includes 3 labs with Docker environments, starter code, validation checkpoints
- **Prerequisites:** Documents explicitly (SQL, basic Kafka concepts, Docker, Python)

**Phase 8: Module 2 - PostgreSQL & Aurora Deep-Dive (Week 5-6)**
- **Rationale:** PostgreSQL is primary focus (per project context), must cover before advanced topics. Aurora/RDS specifics differentiate from toy example courses.
- **Delivers:** PostgreSQL internals (WAL, logical decoding, replication slots, publication/subscription), Aurora-specific configuration (parameter groups, binlog retention, privilege limitations), permissions & security, snapshot strategies (initial vs incremental), failover & HA considerations. Labs: Configure Aurora for Debezium, incremental snapshot on large table, simulate failover, WAL bloat scenario detection and remediation.
- **Features addressed:** Table stakes - PostgreSQL connector, Aurora/RDS specifics; Differentiator - cloud-specific configurations, production scenarios
- **Avoids pitfalls:** Replication slot growth (demonstrates monitoring), Aurora node replacement data loss (tests failover), snapshot failures (compares modes, uses incremental)
- **Dependencies:** Module 1 (builds on basic connector knowledge)

**Phase 9: Module 3 - Production Operations (Week 7-8)**
- **Rationale:** Production focus is key differentiator. Monitoring, scaling, disaster recovery separate professional course from beginner tutorials.
- **Delivers:** JMX metrics & monitoring setup, Prometheus/Grafana dashboards, lag detection & alerting, connector task model & scaling, backpressure handling, disaster recovery procedures, version upgrade strategies. Labs: Deploy Prometheus/Grafana with Debezium dashboards, configure alerts (lag, failures), scaling exercise (add tasks, observe), backup/restore connector state and offsets.
- **Features addressed:** Differentiators - production operational concerns, monitoring stack, disaster recovery
- **Avoids pitfalls:** Missing JMX monitoring (sets up from day one), insufficient alerting (configures SLO-based alerts), offset desynchronization (implements backup procedures)
- **Dependencies:** Module 2 (requires understanding of connector internals for monitoring metrics)

**Phase 10: Module 4 - Advanced Patterns (Week 9-10)**
- **Rationale:** Advanced transformations and architectural patterns appeal to middle+ engineers. Outbox pattern addresses real microservices challenges.
- **Delivers:** Single Message Transformations (filtering, routing, masking, content-based routing with predicates), Outbox pattern fundamentals, Outbox Event Router SMT, event-driven architecture patterns, schema evolution & Schema Registry integration, Avro compatibility rules, zero-downtime migrations. Labs: Build SMT pipeline (filter + mask + route), implement Outbox pattern for order service, Schema Registry integration with evolution testing, handle backward-incompatible schema change.
- **Features addressed:** Differentiators - advanced transformations, Outbox pattern, schema management
- **Avoids pitfalls:** Applying SMTs to wrong message types (demonstrates predicates), schema registry version mismatch (explains dual versioning), column swap not detected (shows safe migration patterns)
- **Dependencies:** Module 3 (requires production deployment knowledge for SMT configuration)

**Phase 11: Module 5 - Data Engineering Integration (Week 11-12)**
- **Rationale:** Python/Pandas/PyFlink integration reflects actual data engineering workflows, differentiates from Kafka-centric courses.
- **Delivers:** Python consumer development (confluent-kafka), Pandas DataFrame integration, PyFlink CDC connector & processing, PySpark Structured Streaming, stateful stream processing (joins, aggregations), ETL/ELT patterns with CDC, real-time feature engineering for ML. Labs: Python consumer with error handling and exactly-once semantics, PyFlink job (aggregate CDC events, maintain state), PySpark (join CDC streams with batch data), real-time feature pipeline for ML model.
- **Features addressed:** Differentiators - stream processing integration, real-world DE workflows
- **Avoids pitfalls:** Duplicate events (designs idempotent consumers), message ordering per table (explains guarantees, uses transaction markers)
- **Dependencies:** Module 4 (builds on event processing knowledge)

**Phase 12: Module 6 - Cloud-Native GCP Deployment (Week 13-14)**
- **Rationale:** Cloud-native deployment (GCP focus) is major differentiator, addresses infrastructure burden pitfall with Kafka-less architecture.
- **Delivers:** Cloud SQL PostgreSQL configuration (logical decoding, flags, VPC), Debezium Server to Pub/Sub (Kafka-less architecture), Dataflow templates for CDC (Cloud SQL to BigQuery sync), IAM & Workload Identity setup, Cloud Run event processing (serverless consumers), BigQuery sync patterns, cost optimization. Labs: Configure Cloud SQL for Debezium, deploy Debezium Server with Pub/Sub sink, Dataflow template (Cloud SQL to BigQuery), Cloud Run function triggered by CDC events, end-to-end monitoring in GCP (Cloud Monitoring).
- **Features addressed:** Differentiators - GCP cloud-native integration, Kafka-less deployment alternative
- **Avoids pitfalls:** Infrastructure burden (demonstrates Debezium Server alternative), Workload Identity configuration (hands-on IAM setup), Cloud SQL logical decoding (enables and verifies flags), ignoring cloud-specific gotchas (dedicates entire module)
- **Dependencies:** Modules 2 & 3 (PostgreSQL + production operations knowledge)

**Phase 13: Capstone Project (Week 15-16)**
- **Rationale:** Capstone integrates all learnings, validates ability to build production-ready pipeline, serves as portfolio piece for students.
- **Delivers:** End-to-end CDC pipeline project: Aurora PostgreSQL (multi-table source) → Outbox pattern + SMT filtering/routing → PyFlink aggregations and feature engineering → multiple destinations (BigQuery analytics, Pub/Sub real-time events, Cloud Run event-driven actions). Includes monitoring stack (full observability), documentation (architecture diagram, runbook, troubleshooting guide), working code repository, Docker Compose for local dev, GCP deployment scripts.
- **Features addressed:** Integrates all prior modules
- **Avoids pitfall:** Feature creep (scoped to 1-2 week project, builds on existing modules)
- **Dependencies:** All prior modules

### Phase Ordering Rationale

**Platform track (Phases 1-6):** Sequential dependencies through Phase 3 (layout → navigation → progress), then parallelization opportunity (Phases 4-5 independent). Progress tracking is critical path — unblocks all interactive features (roadmap, exercises, quizzes). Build order follows bottom-up approach (foundation → features → polish) enabling incremental value delivery (Phase 1 deployable, Phase 2 adds navigation, etc.).

**Content track (Phases 7-13):** Follows pedagogical progression (crawl → walk → run). Modules 1-3 are core path for all students (foundations, database-specific, production), Modules 4-6 add differentiation (advanced patterns, DE integration, cloud), Capstone validates mastery. Modules can develop in parallel with platform (start content creation at Phase 7 while platform Phase 2-3 in progress) to accelerate overall timeline.

**Dependencies across tracks:** Platform Phases 1-3 must complete before content can deploy to website, but content writing can begin earlier. Platform Phase 5 (rich content components) needed before Module 2+ content with interactive exercises. This suggests **hybrid schedule**: Platform Phases 1-2 (Weeks 1-3) → overlap Platform 3-6 with Content 7-9 (Weeks 4-10) → Content 10-13 (Weeks 11-16).

**Parallelization:** Platform Phase 4 (roadmap) and Phase 5 (rich content) can parallelize (Week 5-6). Content Modules 1-2 can develop while platform Phase 3-5 in progress (Weeks 4-6). GCP lab infrastructure (Cloud SQL, Pub/Sub) can provision during Module 1-5 development for Module 6 readiness.

**Risk management:** Core complexity (progress tracking, PostgreSQL connector, production monitoring) built early before dependent features. Content validation happens incrementally (Module 1 beta test before building Modules 2-6). Cloud costs managed by deferring GCP integration to Phase 12 (students can complete Modules 1-5 with local Docker, add GCP later).

### Research Flags

**Phases likely needing deeper research during planning:**

- **Phase 5 (Rich Content Components - Code Playground):** Complex integration decision (embed CodeSandbox/StackBlitz vs custom implementation). Research needed on: sandbox security, execution environment limitations, cost (for embedded solutions), maintenance burden. **Recommendation:** Start with static CodeBlock (Phase 5 MVP), defer interactive playground to Phase 6 or post-launch enhancement based on student feedback.

- **Phase 12 (Cloud-Native GCP - Dataflow Templates):** Limited real-world examples of Dataflow template capabilities and limitations found in research. May need phase-specific research on: template customization options, schema evolution handling in Dataflow, cost optimization patterns, comparison vs custom Dataflow jobs. **Recommendation:** Use `/gsd:research-phase` during Module 6 planning if gaps emerge.

**Phases with standard patterns (skip research-phase):**

- **Phases 1-3 (Platform Foundation):** Astro islands architecture, React state management, localStorage patterns are well-documented in 2026 with established best practices. No additional research needed.

- **Phases 7-9 (Content Modules 1-3):** Debezium PostgreSQL connector, Kafka Connect configuration, monitoring with Prometheus/Grafana are extensively documented in official sources. Pitfalls research already comprehensive.

- **Phase 10 (Module 4 - Advanced Patterns):** Outbox pattern, SMTs, Schema Registry integration covered thoroughly in existing research. Content creation can proceed without additional research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | **HIGH** | Astro 5, React 19, TypeScript verified from official sources. Versions confirmed current (Astro 5 released Dec 2024, React 19 stable Dec 2024). Islands architecture well-documented pattern with production usage at Cloudflare, Google, Microsoft, OpenAI. |
| **Features** | **HIGH** | Course topics derived from official Debezium documentation, production pitfall reports (Estuary, Red Hat, community blogs), and existing course analysis. Clear gap identified in market (production focus vs toy examples). Target audience well-defined (middle+ data engineers). |
| **Architecture** | **HIGH** | Component architecture follows 2026 established patterns (islands, composition, container/presenter). File structure aligns with React best practices (feature-based organization). State management approach (Zustand/Context + localStorage) appropriate for use case. Mobile-first responsive design well-documented. |
| **Pitfalls** | **MEDIUM-HIGH** | PostgreSQL, Aurora/RDS, Kafka Connect pitfalls verified from multiple authoritative sources (Debezium blog, Red Hat docs, AWS RDS documentation, recent 2025-2026 community reports). Course creation pitfalls derived from general educational best practices and extrapolated to Debezium domain. GCP integration pitfalls have fewer sources (newer/less common deployment). |

**Overall confidence:** **HIGH**

All core technical decisions validated with official documentation and recent (2025-2026) sources. Architecture patterns are industry-standard. Course structure aligns with research findings on production needs and competitive gaps. Main uncertainty areas (code playground implementation, Dataflow templates) flagged for phase-specific research during planning.

### Gaps to Address

**Technical gaps:**

- **ARM64/Apple Silicon Docker compatibility:** Research mentions Docker Desktop ARM64 support assumed but not verified for all components (Kafka, Debezium, PostgreSQL images). **Mitigation:** Verify multi-arch image availability during Phase 1 (Foundation) environment setup. Document platform-specific issues in course prerequisites.

- **GCP Dataflow template limitations:** Found documentation but limited real-world examples of schema evolution handling, customization boundaries. **Mitigation:** Validate with hands-on testing during Phase 12 (Module 6) development. Consider `/gsd:research-phase` if gaps emerge. Provide fallback content (custom Dataflow jobs) if templates insufficient.

- **Code playground security and cost:** Embedded playgrounds (CodeSandbox, StackBlitz) have cost implications and execution limitations not fully researched. **Mitigation:** Start with static CodeBlock + "run in your environment" approach (Phase 5). Add interactive playground as enhancement (Phase 6 or post-launch) after validating student demand and evaluating cost.

**Content gaps:**

- **Production case studies:** Research found references to Netflix/Robinhood scale issues (4-6 FTE for WAL management) but not detailed public write-ups. **Mitigation:** Use available pitfall documentation from Estuary, Red Hat, community blogs. Acknowledge limitation in course ("based on publicly available reports"). Consider inviting guest speakers from production Debezium users if connections available.

- **Multi-cloud comparison:** GCP integration researched deeply, AWS RDS/Aurora partially covered, Azure minimally addressed. **Mitigation:** Phase 1 (Aurora MySQL/PostgreSQL) covers AWS, Phase 12 (Cloud-Native) covers GCP. Document as "GCP-focused with AWS coverage" in course description. Consider Azure module as v1.1 update based on student requests.

**Process gaps:**

- **Market validation:** Research synthesized from ecosystem analysis (existing courses, Stack Overflow, GitHub issues) but no direct survey of target audience conducted yet. **Mitigation:** Implement validation checklist from pitfalls research before full-scale development (survey 50+ data engineers, analyze top Debezium questions, pre-sell or collect email signups). Build MVP (Modules 1-3) for beta testing before committing to full 6-module course.

- **Content maintenance cadence:** Quarterly review strategy defined but not tested. Debezium 3.4 released Dec 2025; next major version timeline unknown. **Mitigation:** Subscribe to Debezium blog and release notes immediately. Build content versioning into course structure ("As of Debezium 3.4..."). Implement automated lab testing CI/CD to catch breaking changes early.

## Sources

### Primary Sources (HIGH confidence)

**Technology Stack:**
- [Astro 5.0 Release Blog](https://astro.build/blog/astro-5/) — Verified Astro 5 features, release date (Dec 2024), performance improvements (5x faster Markdown, 2x faster MDX)
- [React 19 Release](https://react.dev/blog/2024/12/05/react-19) — Confirmed React 19 stable, release date, compatibility with Astro
- [Debezium Documentation](https://debezium.io/documentation/) — Connector configuration, features, architecture patterns
- [Debezium Blog](https://debezium.io/blog/) — Incremental snapshots, Outbox pattern, production deployment guides
- [Astro Documentation - Islands Architecture](https://docs.astro.build/) — Islands pattern, hydration directives, performance characteristics

**Debezium Pitfalls:**
- [Debezium PostgreSQL Connector Documentation](https://debezium.io/documentation/reference/stable/connectors/postgresql.html) — Replication slots, logical decoding, configuration options
- [Red Hat Knowledgebase - Stale Replication Slot Issue](https://access.redhat.com/solutions/7134051) — PostgreSQL connector fails to start replication stream, stale PID errors
- [Aiven Documentation - PostgreSQL Node Replacements](https://aiven.io/docs/products/kafka/kafka-connect/howto/debezium-source-connector-pg-node-replacement) — Replication slot data loss during failover
- [Debezium Blog - Lessons Learned from RDS](https://debezium.io/blog/2020/02/25/lessons-learned-running-debezium-with-postgresql-on-rds/) — Aurora/RDS specific issues, binlog retention, privilege limitations
- [Debezium Monitoring Documentation](https://debezium.io/documentation/reference/stable/operations/monitoring.html) — JMX metrics, lag detection, operational visibility

### Secondary Sources (MEDIUM confidence)

**Production Pitfalls:**
- [Estuary - Debezium CDC Pain Points](https://estuary.dev/blog/debezium-cdc-pain-points/) — Production deployment challenges, infrastructure burden, operational complexity
- [Medium - PostgreSQL Replication Lag with Debezium](https://medium.com/@pawanpg0963/postgres-replication-lag-using-debezium-connector-4ba50e330cd6) — Replication slot monitoring, lag detection patterns
- [PayU Engineering - Unlocking Power of Debezium](https://medium.com/payu-engineering/unlocking-the-power-of-debezium-69ce9170f101) — Production deployment experiences, snapshot strategies
- [Medium - CDC in Production with MongoDB](https://aabir-hassan.medium.com/cdc-in-production-breaking-bad-and-fixing-it-bdf49317cafa) — Production failure scenarios, recovery procedures

**GCP Integration:**
- [Medium - Change Data Capture with Debezium Server on GKE to Pub/Sub](https://medium.com/google-cloud/change-data-capture-with-debezium-server-on-gke-from-cloudsql-for-postgresql-to-pub-sub-d1c0b92baa98) — Cloud SQL configuration, Workload Identity setup, Pub/Sub integration
- [Infinite Lambda - Postgres CDC with Debezium & Google Pub/Sub](https://infinitelambda.com/postgres-cdc-debezium-google-pubsub/) — Kafka-less architecture, Debezium Server deployment patterns

**Architecture Patterns:**
- [The Complete Guide to Frontend Architecture Patterns in 2026](https://dev.to/sizan_mahmud0_e7c3fd0cb68/the-complete-guide-to-frontend-architecture-patterns-in-2026-3ioo) — Islands architecture, state management, localStorage patterns
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) — Zustand growth (30%+ YoY), Redux decline, Context API usage
- [Recommended Folder Structure for React 2025](https://dev.to/pramod_boda/recommended-folder-structure-for-react-2025-48mc) — Feature-based organization, component structure best practices

**Course Creation:**
- [The 7 Most Common Mistakes New Course Creators Make](https://medium.com/swlh/the-7-most-common-mistakes-new-course-creators-make-and-how-to-avoid-them-0debd19d4226) — Outdated content, missing hands-on practice, poor prerequisite management
- [Course Creation Pitfalls: Avoid the 5 Most Common Errors](https://www.amyporterfield.com/2023/08/601/) — Validation before building, perfectionism delays, feature creep

### Tertiary Sources (LOW confidence - needs validation)

- ARM64/M1 Docker compatibility — Assumed based on Docker Desktop ARM64 support, not explicitly verified for all Debezium/Kafka images
- GCP Dataflow template schema evolution handling — Limited real-world examples found, may need hands-on validation
- Production benchmark data for Kafka Connect vs Debezium Server vs Embedded Engine — Referenced but not detailed comparisons found

---

**Research completed:** 2026-01-31
**Ready for roadmap:** Yes

**Next steps:**
1. Market validation (survey 50+ data engineers, analyze Stack Overflow top questions, pre-sell or collect email signups)
2. MVP scope definition (Modules 1-3 for beta testing)
3. Platform Phase 1 kickoff (Astro 5 project initialization, basic layout)
4. Docker Compose environment setup for labs (PostgreSQL, Kafka, Debezium, Prometheus/Grafana)
5. Beta cohort recruitment (20 students at 50% discount for feedback)
