# Roadmap: Debezium Course

## Overview

This roadmap delivers an interactive Debezium course for middle+ data engineers through 11 phases. Platform phases (1-3) establish the static website foundation with navigation and progress tracking. Infrastructure phase (4) builds the Docker Compose lab environment needed for all course modules. Content phases (5-10) follow natural learning progression from CDC fundamentals through production operations, advanced patterns, data engineering integration, and cloud-native GCP deployment. Capstone phase (11) validates end-to-end mastery with a production-ready CDC pipeline project.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Platform Foundation** - Static site core with layout, syntax highlighting, diagrams, deployment ✓
- [x] **Phase 2: Navigation & Roadmap** - Interactive roadmap and module navigation system ✓
- [x] **Phase 3: Progress Tracking** - LocalStorage-based progress persistence and visualization ✓
- [ ] **Phase 4: Lab Infrastructure** - Docker Compose environment with Kafka, Debezium, PostgreSQL, monitoring
- [ ] **Phase 5: Module 1 - Foundations** - CDC fundamentals, Debezium architecture, first connector
- [ ] **Phase 6: Module 2 - PostgreSQL & Aurora** - Logical decoding, replication slots, WAL, Aurora specifics
- [ ] **Phase 7: Module 3 - Production Operations** - Monitoring, metrics, scaling, disaster recovery
- [ ] **Phase 8: Module 4 - Advanced Patterns** - SMTs, Outbox pattern, Schema Registry integration
- [ ] **Phase 9: Module 5 - Data Engineering** - Python consumers, PyFlink, PySpark, stream processing
- [ ] **Phase 10: Module 6 - Cloud-Native GCP** - Cloud SQL, Pub/Sub, Dataflow, Cloud Run integration
- [ ] **Phase 11: Capstone Project** - End-to-end production CDC pipeline integrating all learnings

## Phase Details

### Phase 1: Platform Foundation
**Goal**: Students can access a deployed static course website with properly rendered content, syntax highlighting, diagrams, and mobile-responsive design
**Depends on**: Nothing (first phase)
**Requirements**: PLAT-05, PLAT-06, PLAT-07, PLAT-08
**Success Criteria** (what must be TRUE):
  1. Course website deploys successfully to GitHub Pages or Vercel
  2. Code blocks render with syntax highlighting for Python, YAML, SQL, and JSON
  3. Mermaid diagrams render correctly from markdown code blocks
  4. Site displays properly on mobile devices (responsive layout)
  5. Students can navigate between pages using basic routing
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Initialize Astro project with React, Tailwind, MDX, and Shiki syntax highlighting
- [x] 01-02-PLAN.md — Create content schema, responsive layout, and Mermaid diagram component
- [x] 01-03-PLAN.md — Build sample course content and dynamic routing for lessons
- [ ] 01-04-PLAN.md — Configure GitHub Actions deployment and verify live site

### Phase 2: Navigation & Roadmap
**Goal**: Students can navigate the course structure through an interactive roadmap and structured menu system
**Depends on**: Phase 1
**Requirements**: PLAT-01, PLAT-02, PLAT-04
**Success Criteria** (what must be TRUE):
  1. Students see an interactive visual roadmap displaying all course modules
  2. Students can click roadmap elements to navigate to specific topics
  3. Students see a sidebar menu with clear module and topic organization
  4. Navigation adapts to screen size (hamburger menu on mobile, sidebar on desktop)
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Set up nanostores state management and navigation tree utility
- [x] 02-02-PLAN.md — Create MobileMenuToggle and Navigation sidebar components
- [x] 02-03-PLAN.md — Create interactive CourseRoadmap with Mermaid flowchart
- [x] 02-04-PLAN.md — Integrate navigation into BaseLayout and add roadmap to landing page

### Phase 3: Progress Tracking
**Goal**: Students can track their course progress across sessions with automatic persistence
**Depends on**: Phase 2
**Requirements**: PLAT-03
**Success Criteria** (what must be TRUE):
  1. Student progress persists when browser is closed and reopened
  2. Completed lessons display visual indicators on the roadmap
  3. Progress percentage appears on the course homepage
  4. Students can mark lessons as complete manually
  5. Progress data survives browser cache clearing (export/import option available)
**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md — Create persistent progress store with @nanostores/persistent
- [x] 03-02-PLAN.md — Create LessonCompleteButton, ProgressIndicator, and ProgressExport components
- [x] 03-03-PLAN.md — Add progress indicators to CourseRoadmap and Navigation components
- [x] 03-04-PLAN.md — Integrate progress components into pages and verify functionality

### Phase 4: Lab Infrastructure
**Goal**: Students can run hands-on Debezium labs in a local Docker environment on ARM64 macOS
**Depends on**: Phase 1 (needed for documentation, but can develop in parallel)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-07, INFRA-08
**Success Criteria** (what must be TRUE):
  1. Docker Compose successfully starts PostgreSQL 15+ with logical replication enabled
  2. Kafka 3.x runs in KRaft mode without ZooKeeper
  3. Debezium 3.x connectors connect to PostgreSQL and stream changes to Kafka
  4. Schema Registry accepts and validates Avro schemas
  5. Prometheus collects metrics from Debezium connectors
  6. Grafana displays Debezium monitoring dashboards
  7. JupyterLab environment runs with Python 3.11+ and required libraries (confluent-kafka, pandas)
  8. All services run on ARM64 architecture (macOS M-series compatible)
  9. README provides clear setup instructions that work first try
**Plans**: TBD

Plans:
- [ ] (Plans will be created during phase planning)

### Phase 5: Module 1 - Foundations
**Goal**: Students understand CDC fundamentals and can set up their first Debezium connector with Python consumer
**Depends on**: Phase 4 (requires lab environment)
**Requirements**: MOD1-01, MOD1-02, MOD1-03, MOD1-04, MOD1-05, MOD1-06
**Success Criteria** (what must be TRUE):
  1. Students can explain what CDC is and why log-based CDC is superior to polling
  2. Students can describe Debezium architecture components (Kafka Connect, Server, Embedded)
  3. Students can start the Docker Compose lab environment following instructions
  4. Students can configure and deploy a PostgreSQL connector step-by-step
  5. Students can write Python code to consume CDC events from Kafka using confluent-kafka
  6. Students can parse CDC event structure (envelope, before/after, metadata fields)
**Plans**: TBD

Plans:
- [ ] (Plans will be created during phase planning)

### Phase 6: Module 2 - PostgreSQL & Aurora
**Goal**: Students can configure production-grade PostgreSQL/Aurora CDC with understanding of replication slots, WAL, and snapshot strategies
**Depends on**: Phase 5
**Requirements**: MOD2-01, MOD2-02, MOD2-03, MOD2-04, MOD2-05, MOD2-06, MOD2-07
**Success Criteria** (what must be TRUE):
  1. Students can explain logical decoding and the pgoutput plugin's role
  2. Students can configure and monitor replication slots to prevent WAL accumulation
  3. Students can set WAL configuration (wal_level=logical) and understand performance impact
  4. Students can configure Aurora-specific settings (parameter groups, flags) for Debezium
  5. Students can predict and handle Aurora failover behavior with replication slots
  6. Students can choose appropriate snapshot strategies (initial vs incremental) for large tables
  7. Students can configure and execute an incremental snapshot on a multi-GB table
**Plans**: TBD

Plans:
- [ ] (Plans will be created during phase planning)

### Phase 7: Module 3 - Production Operations
**Goal**: Students can operate Debezium in production with monitoring, alerting, scaling, and disaster recovery
**Depends on**: Phase 6
**Requirements**: MOD3-01, MOD3-02, MOD3-03, MOD3-04, MOD3-05, MOD3-06, MOD3-07
**Success Criteria** (what must be TRUE):
  1. Students can interpret JMX metrics from Debezium connectors (lag, throughput, errors)
  2. Students can configure Prometheus to scrape Debezium metrics
  3. Students can deploy Grafana dashboards for CDC pipeline monitoring
  4. Students can set up alerts for replication lag exceeding SLO thresholds
  5. Students can prevent WAL bloat through heartbeat configuration and monitoring
  6. Students can scale Debezium connectors horizontally using task model
  7. Students can execute disaster recovery procedures (backup offsets, restore state)
**Plans**: TBD

Plans:
- [ ] (Plans will be created during phase planning)

### Phase 8: Module 4 - Advanced Patterns
**Goal**: Students can apply advanced transformations, implement Outbox pattern, and manage schema evolution
**Depends on**: Phase 7
**Requirements**: MOD4-01, MOD4-02, MOD4-03, MOD4-04, MOD4-05, MOD4-06, MOD4-07, MOD4-08
**Success Criteria** (what must be TRUE):
  1. Students can apply Single Message Transformations (SMTs) for filtering and routing
  2. Students can use predicates to selectively apply transformations
  3. Students can mask PII data using built-in SMTs
  4. Students can route events to different topics based on content
  5. Students can explain Outbox pattern and its role in microservices
  6. Students can implement Outbox pattern using Outbox Event Router SMT
  7. Students can integrate Schema Registry with Avro serialization
  8. Students can handle schema evolution with backward/forward compatibility
**Plans**: TBD

Plans:
- [ ] (Plans will be created during phase planning)

### Phase 9: Module 5 - Data Engineering
**Goal**: Students can integrate CDC events into data engineering workflows with Python, Pandas, PyFlink, and PySpark
**Depends on**: Phase 8
**Requirements**: MOD5-01, MOD5-02, MOD5-03, MOD5-04, MOD5-05, MOD5-06, MOD5-07
**Success Criteria** (what must be TRUE):
  1. Students can build production-grade Python consumers with error handling and exactly-once semantics
  2. Students can transform CDC events into Pandas DataFrames for analysis
  3. Students can configure PyFlink CDC connector and process streams
  4. Students can implement stateful stream processing in PyFlink (aggregations, joins)
  5. Students can consume CDC events with PySpark Structured Streaming
  6. Students can design ETL/ELT patterns using CDC data
  7. Students can build real-time feature engineering pipelines for ML models
**Plans**: TBD

Plans:
- [ ] (Plans will be created during phase planning)

### Phase 10: Module 6 - Cloud-Native GCP
**Goal**: Students can deploy Debezium on GCP with Cloud SQL, Pub/Sub, Dataflow, and Cloud Run
**Depends on**: Phase 9 (builds on all prior knowledge)
**Requirements**: MOD6-01, MOD6-02, MOD6-03, MOD6-04, MOD6-05, MOD6-06
**Success Criteria** (what must be TRUE):
  1. Students can configure Cloud SQL PostgreSQL for Debezium (flags, replication)
  2. Students can deploy Debezium Server with Pub/Sub sink (Kafka-less architecture)
  3. Students can set up IAM and Workload Identity for secure GCP access
  4. Students can use Dataflow templates to sync CDC data to BigQuery
  5. Students can deploy Cloud Run functions for event-driven CDC processing
  6. Students can monitor end-to-end CDC pipeline in Cloud Monitoring
**Plans**: TBD

Plans:
- [ ] (Plans will be created during phase planning)

### Phase 11: Capstone Project
**Goal**: Students can design and implement a production-ready end-to-end CDC pipeline integrating multiple technologies
**Depends on**: Phase 10
**Requirements**: CAP-01, CAP-02, CAP-03
**Success Criteria** (what must be TRUE):
  1. Students understand the capstone project requirements (Aurora -> Outbox -> PyFlink -> BigQuery)
  2. Students can self-assess their architecture against production readiness checklist
  3. Students can complete the capstone with monitoring, documentation, and working code
**Plans**: TBD

Plans:
- [ ] (Plans will be created during phase planning)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Platform Foundation | 3/4 | In Progress | - |
| 2. Navigation & Roadmap | 4/4 | ✓ Complete | 2026-01-31 |
| 3. Progress Tracking | 4/4 | ✓ Complete | 2026-01-31 |
| 4. Lab Infrastructure | 0/TBD | Not started | - |
| 5. Module 1 - Foundations | 0/TBD | Not started | - |
| 6. Module 2 - PostgreSQL & Aurora | 0/TBD | Not started | - |
| 7. Module 3 - Production Operations | 0/TBD | Not started | - |
| 8. Module 4 - Advanced Patterns | 0/TBD | Not started | - |
| 9. Module 5 - Data Engineering | 0/TBD | Not started | - |
| 10. Module 6 - Cloud-Native GCP | 0/TBD | Not started | - |
| 11. Capstone Project | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-31*
*Last updated: 2026-01-31*
