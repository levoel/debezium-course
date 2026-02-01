# Roadmap: Debezium Course

## Milestones

- [x] **v1.0 MVP** - Phases 1-11 (shipped 2026-02-01)
- [ ] **v1.1 MySQL/Aurora MySQL + Deployment** - Phases 12-18 (in progress)

## Overview

v1.1 extends the course with comprehensive MySQL/Aurora MySQL CDC coverage (Module 8) and deploys the course to GitHub Pages. This milestone adds 8+ lessons covering binlog internals, Aurora-specific configurations, production operations, and a multi-database capstone extension that integrates PostgreSQL and MySQL CDC pipelines.

## Phases

**Phase Numbering:**
- Continues from v1.0 (Phases 1-11 complete)
- v1.1 phases: 12-18

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

### v1.1 MySQL/Aurora MySQL + Deployment (In Progress)

**Milestone Goal:** Add comprehensive MySQL/Aurora MySQL CDC module (Module 8) and deploy the course to GitHub Pages.

- [x] **Phase 12: MySQL Infrastructure + Binlog Fundamentals** - Docker MySQL service and binlog theory ✓
- [x] **Phase 13: Connector Setup + Comparison** - MySQL connector configuration and WAL comparison ✓
- [x] **Phase 14: Aurora MySQL Specifics** - Aurora Enhanced Binlog and limitations ✓
- [ ] **Phase 15: Production Operations** - Monitoring, failover, incremental snapshots
- [ ] **Phase 16: Advanced Topics + Recovery** - Recovery procedures, multi-connector, DDL tools
- [ ] **Phase 17: Multi-Database Capstone** - PostgreSQL + MySQL unified pipeline
- [ ] **Phase 18: GitHub Pages Deployment** - Static site deployment with CI/CD

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
**Plans**: TBD

Plans:
- [ ] 15-01: TBD
- [ ] 15-02: TBD

### Phase 16: Advanced Topics + Recovery
**Goal**: Course learner can handle advanced MySQL CDC scenarios and recover from failures
**Depends on**: Phase 15
**Requirements**: MYSQL-13, MYSQL-14, MYSQL-15
**Success Criteria** (what must be TRUE):
  1. Learner can recover from binlog position loss (purged binlogs) using snapshot restart
  2. Learner can recover from schema history topic corruption using Kafka topic restoration
  3. Learner can deploy multiple MySQL connectors with proper server.id registry (conflict prevention)
  4. Learner understands gh-ost and pt-online-schema-change patterns for zero-downtime DDL with CDC
**Plans**: TBD

Plans:
- [ ] 16-01: TBD
- [ ] 16-02: TBD

### Phase 17: Multi-Database Capstone
**Goal**: Course learner can design and implement a multi-database CDC pipeline combining PostgreSQL and MySQL
**Depends on**: Phase 16
**Requirements**: MYSQL-16
**Success Criteria** (what must be TRUE):
  1. Capstone extension clearly explains multi-database CDC architecture (PostgreSQL + MySQL sources)
  2. Learner can configure both connectors to produce to unified topic naming scheme
  3. Unified consumer processes events from both databases with schema awareness
  4. Learner understands trade-offs: separate vs merged topics, schema evolution challenges
**Plans**: TBD

Plans:
- [ ] 17-01: TBD

### Phase 18: GitHub Pages Deployment
**Goal**: Debezium course is publicly accessible via GitHub Pages
**Depends on**: Phase 17 (content complete)
**Requirements**: PLAT-07
**Success Criteria** (what must be TRUE):
  1. GitHub Actions workflow builds Astro site on push to main
  2. Course is accessible at `https://<username>.github.io/debezium-course/` (or custom domain)
  3. All pages render correctly (MDX, Mermaid diagrams, syntax highlighting)
  4. Build passes consistently (no flaky failures)
**Plans**: TBD

Plans:
- [ ] 18-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 12 -> 13 -> 14 -> 15 -> 16 -> 17 -> 18

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 12. MySQL Infra + Binlog | v1.1 | 3/3 | ✓ Complete | 2026-02-01 |
| 13. Connector Setup | v1.1 | 3/3 | ✓ Complete | 2026-02-01 |
| 14. Aurora MySQL | v1.1 | 3/3 | ✓ Complete | 2026-02-01 |
| 15. Production Ops | v1.1 | 0/TBD | Not started | - |
| 16. Advanced + Recovery | v1.1 | 0/TBD | Not started | - |
| 17. Multi-DB Capstone | v1.1 | 0/TBD | Not started | - |
| 18. GitHub Deployment | v1.1 | 0/TBD | Not started | - |

## Coverage

### v1.1 Requirement Mapping

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
