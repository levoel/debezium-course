# Phase 11 Plan 01: Capstone Overview and Architecture Summary

**One-liner:** Created Module 7 capstone project lessons defining production-ready CDC pipeline requirements (Aurora → Outbox → PyFlink → BigQuery) with architecture diagrams, deliverables checklist, and anti-patterns

---

## Frontmatter

```yaml
phase: 11-capstone-project
plan: 01
subsystem: content-capstone
tags: [capstone, architecture, production-readiness, cdc, aurora, pyflink, bigquery]

requires:
  - "10-03: Cloud Run Event Processing & Monitoring lessons"
  - "04-01: Lab infrastructure with PostgreSQL, Kafka, Debezium"
  - "08-03: Outbox pattern lesson"
  - "09-02: PyFlink basics lesson"
  - "10-02: BigQuery CDC lesson"

provides:
  - "Module 7 capstone project overview lesson"
  - "Capstone architecture and deliverables specification"
  - "Production readiness framework for CDC pipelines"
  - "C4 architecture diagrams (System Context + Container)"
  - "Technical requirements for all pipeline components"

affects:
  - "11-02: Capstone implementation guide lessons"
  - "Future student capstone projects"

tech-stack:
  added:
    - name: "Module 7 (Capstone)"
      version: "n/a"
      purpose: "Final course module synthesizing all prior learnings"
  patterns:
    - "Capstone project pedagogical structure"
    - "Production readiness assessment framework"
    - "C4 architecture modeling for CDC pipelines"
    - "Outbox Pattern + Debezium SMT + PyFlink + BigQuery integration"

key-files:
  created:
    - path: "src/content/course/07-module-7/01-capstone-overview.mdx"
      lines: 293
      purpose: "Capstone project introduction, business scenario, architecture overview, success criteria"
    - path: "src/content/course/07-module-7/02-architecture-deliverables.mdx"
      lines: 652
      purpose: "Detailed architecture requirements, code examples, deliverables checklist, anti-patterns"
  modified: []

decisions:
  - id: "CAP-01"
    what: "Capstone scope: Aurora → Outbox → PyFlink → BigQuery pipeline"
    why: "Synthesizes all 6 prior modules (PostgreSQL CDC, Outbox, PyFlink, BigQuery, monitoring) into production-ready integration"
    alternatives: ["Kafka Streams instead of PyFlink (less pedagogically aligned with Module 5)", "Dataflow instead of PyFlink (less hands-on Python coding)"]
    impact: "Students demonstrate mastery of entire CDC stack, not individual components"

  - id: "CAP-02"
    what: "Production readiness as primary success criterion"
    why: "Capstone validates real-world deployment competency, not just 'hello world' demos"
    alternatives: ["Focus on functionality only (lower bar)", "Add performance benchmarking (higher bar but time-intensive)"]
    impact: "Students create portfolio-worthy projects demonstrating operational maturity"

  - id: "CAP-03"
    what: "C4 architecture diagrams (System Context + Container) mandatory"
    why: "Industry-standard architecture documentation pattern; teaches communication of system design"
    alternatives: ["Freeform diagrams", "UML diagrams (outdated)", "No diagrams (insufficient documentation)"]
    impact: "Students learn professional architecture documentation practices"

  - id: "CAP-04"
    what: "Deliverables include: code + monitoring + documentation + testing evidence"
    why: "Production systems require operational infrastructure, not just application code"
    alternatives: ["Code only (insufficient for production)", "Add CI/CD (too broad for capstone scope)"]
    impact: "Students understand operational complexity beyond writing code"

  - id: "CAP-05"
    what: "Time estimate: 15-20 hours over 2-3 weeks"
    why: "Realistic for comprehensive capstone with quality deliverables; prevents rushed submissions"
    alternatives: ["1-week sprint (too rushed)", "4+ weeks (diminishing returns on learning)"]
    impact: "Students have sufficient time for quality work without excessive project creep"

metrics:
  duration: "4m 34s"
  completed: "2026-02-01"
  tasks_completed: 2
  files_created: 2
  lines_of_code: 945
---

## What Was Built

Created the first two lessons of Module 7 (Capstone Project):

1. **01-capstone-overview.mdx:** Introduces the capstone project concept, business scenario (e-commerce order processing), end-to-end architecture diagram (Aurora → Outbox → Debezium → Kafka → PyFlink → BigQuery), technology stack mapping to prior modules, deliverables list, success criteria, and recommended execution phases.

2. **02-architecture-deliverables.mdx:** Provides detailed technical requirements for each component (Aurora/PostgreSQL, Debezium connector, PyFlink job, BigQuery table, monitoring infrastructure), complete code examples (SQL, JSON, Python), C4 architecture diagrams, deliverables checklist, anti-patterns to avoid, and production patterns to follow.

**Key features:**
- **Mermaid architecture diagrams:** End-to-end pipeline flowchart (lesson 1), C4 System Context and Container diagrams (lesson 2)
- **Code examples:** Outbox table DDL, Debezium connector JSON config, PyFlink Table API job, BigQuery CDC table DDL, Prometheus config
- **Production patterns:** Outbox Event Router SMT, Debezium format in PyFlink, BigQuery PRIMARY KEY NOT ENFORCED, heartbeat for replication slot health
- **Anti-patterns documentation:** Missing REPLICA IDENTITY FULL, no primary key in BigQuery, snapshot.mode=always, hardcoded credentials
- **Success criteria framework:** Functionality + fault tolerance + monitoring + documentation

## Decisions Made

### CAP-01: Pipeline Architecture Scope
**Decision:** Capstone requires Aurora → Outbox → Debezium (Outbox Event Router SMT) → Kafka → PyFlink → BigQuery

**Context:** Needed to select a project that synthesizes all 6 prior modules without introducing new concepts

**Options considered:**
- Option A (chosen): Aurora/PostgreSQL → Outbox → PyFlink → BigQuery
  - Synthesizes Module 2 (PostgreSQL CDC), Module 4 (Outbox Pattern), Module 5 (PyFlink), Module 6 (BigQuery), Module 3 (Monitoring)
  - Realistic production use case (transactional event publishing + real-time analytics)
- Option B: Kafka Streams instead of PyFlink
  - Doesn't align with Module 5 Python focus
  - Less accessible to data engineers (Java-heavy)
- Option C: Dataflow instead of PyFlink
  - Google-managed but less hands-on Python coding
  - Students lose control over transformation logic visibility

**Rationale:** Option A covers the full CDC stack from source database through stream processing to analytics warehouse, directly mapping to course modules

**Impact:** Students demonstrate end-to-end mastery; capstone validates they can independently design production CDC pipelines

### CAP-02: Production Readiness as Success Criterion
**Decision:** Success measured by production readiness (fault tolerance, monitoring, documentation), not just functionality

**Context:** Capstone must differentiate from learning labs by requiring operational maturity

**Options considered:**
- Option A (chosen): Production readiness framework (functionality + fault tolerance + monitoring + docs)
  - Validates students can deploy systems that survive failures
  - Teaches operational responsibility beyond writing code
- Option B: Functionality only
  - Lower bar, easier to complete
  - Doesn't prepare students for real-world deployment challenges
- Option C: Add performance benchmarking
  - More rigorous validation
  - Time-intensive; diminishing pedagogical returns for capstone scope

**Rationale:** Production readiness teaches the "last mile" of system design that separates proof-of-concept from deployable systems

**Impact:** Students create portfolio-worthy projects demonstrating operational competency employers value

### CAP-03: Mandatory C4 Architecture Diagrams
**Decision:** Capstone requires C4 System Context and Container diagrams in documentation

**Context:** Students need to learn professional architecture communication practices

**Options considered:**
- Option A (chosen): C4 Model (System Context + Container levels)
  - Industry-standard architecture documentation pattern
  - Mermaid supports C4 diagrams (tooling consistency with course)
  - Teaches abstraction levels (external context vs internal components)
- Option B: Freeform diagrams
  - No standard; inconsistent quality
  - Difficult to assess completeness
- Option C: UML diagrams
  - Outdated; rarely used in modern system design
  - Overly formal for streaming architectures

**Rationale:** C4 provides clear hierarchy and is widely adopted in industry for documenting distributed systems

**Impact:** Students learn to communicate system design to technical and non-technical stakeholders

### CAP-04: Multi-Dimensional Deliverables
**Decision:** Deliverables include code + monitoring + documentation + testing evidence

**Context:** Production systems require infrastructure beyond application code

**Options considered:**
- Option A (chosen): Code + monitoring + docs + testing
  - Reflects real production deployment requirements
  - Validates observability and operational readiness
- Option B: Code only
  - Insufficient for production deployment
  - Students miss critical operational aspects
- Option C: Add CI/CD pipeline
  - Too broad for capstone scope (separate DevOps skillset)
  - Dilutes focus from CDC domain

**Rationale:** Monitoring and documentation are first-class deliverables in production systems; students must demonstrate operational infrastructure competency

**Impact:** Students understand that "done" means observable, documented, and testable, not just "runs locally"

### CAP-05: Time Estimate 15-20 Hours Over 2-3 Weeks
**Decision:** Recommend students allocate 15-20 hours over 2-3 weeks for capstone completion

**Context:** Needed realistic time estimate balancing quality with reasonable scope

**Options considered:**
- Option A (chosen): 15-20 hours over 2-3 weeks
  - Sufficient time for quality work (infrastructure setup, coding, testing, documentation)
  - Prevents rushed submissions with missing deliverables
- Option B: 1-week sprint
  - Too rushed for comprehensive deliverables
  - Students likely to cut corners on documentation or testing
- Option C: 4+ weeks
  - Diminishing returns on learning; project creep risk
  - Students may over-engineer beyond capstone scope

**Rationale:** 15-20 hours aligns with estimates from research (2-3h per phase × 6 phases); 2-3 weeks allows working around other commitments

**Impact:** Students have realistic expectations; reduces incomplete submissions due to time pressure

## Deviations from Plan

None - plan executed exactly as written. Both tasks completed with all required elements:
- Module 7 directory created
- Lesson 1: capstone overview with architecture diagram, technology stack, deliverables, success criteria
- Lesson 2: architecture requirements with C4 diagrams, code examples, anti-patterns, deliverables checklist
- All code blocks have syntax highlighting tags (sql, json, python, yaml)
- Mermaid diagrams included in both lessons
- Prerequisites chain established (lesson 2 requires lesson 1)

## Technical Highlights

### Architecture Patterns Documented

1. **Outbox Event Router SMT Configuration**
   - Route by `aggregatetype` field to dynamic topics
   - Additional placement for event metadata in headers
   - Predicate filtering for outbox table only

2. **PyFlink Table API with Debezium Format**
   - Declarative SQL DDL for Kafka sources
   - `format = 'debezium-json'` for automatic CDC envelope parsing
   - Checkpointing configuration for fault tolerance
   - `table.exec.source.cdc-events-duplicate=true` for at-least-once semantics

3. **BigQuery CDC Ingestion Pattern**
   - `PRIMARY KEY (col) NOT ENFORCED` declaration required
   - `max_staleness = INTERVAL 15 MINUTE` for cost-freshness balance
   - UPSERT/DELETE operations via BigQuery Storage Write API

4. **Production Monitoring Setup**
   - Prometheus JMX scraping for Debezium metrics
   - Four Golden Signals: latency (replication lag), traffic (events/sec), errors (connector status), saturation (resource utilization)
   - Grafana dashboard structure with key panels

### Anti-Patterns and Mitigations

| Anti-Pattern | Impact | Mitigation |
|--------------|--------|------------|
| Missing `REPLICA IDENTITY FULL` | UPDATE/DELETE events incomplete | `ALTER TABLE outbox REPLICA IDENTITY FULL;` |
| No PRIMARY KEY in BigQuery | CDC ingestion fails | `CREATE TABLE ... PRIMARY KEY (col) NOT ENFORCED` |
| `snapshot.mode=always` | Full re-snapshot on every restart | Use `snapshot.mode=when_needed` |
| No replication slot monitoring | WAL bloat fills disk | Monitor `pg_replication_slots` view regularly |
| Hardcoded credentials | Security risk | Use `${file:/secrets/password.txt:password}` pattern |
| No PyFlink checkpointing | State loss on restart | Set `execution.checkpointing.interval` |

### Code Examples Quality

All code examples include:
- **Complete configurations:** No placeholder values (except credentials)
- **Production patterns:** Heartbeat, checkpointing, idempotency
- **Explanatory comments:** Parameter purpose documented
- **Validation steps:** How to verify each component works

## Testing Evidence

### Verification Checks Completed

✅ Directory `src/content/course/07-module-7/` created
✅ `01-capstone-overview.mdx` exists (14KB, 293 lines)
✅ `02-architecture-deliverables.mdx` exists (24KB, 652 lines)
✅ Frontmatter valid in both files (title, order, difficulty, prerequisites)
✅ Prerequisites chain: lesson 2 requires lesson 1 (`module-7/01-capstone-overview`)
✅ Mermaid diagrams present (1 in lesson 1, 2 in lesson 2)
✅ Code blocks have syntax highlighting: `json` (5×), `python` (3×), `sql` (7×), `yaml` (1×)
✅ Content pattern followed: Russian explanatory text, English code/config
✅ Pipeline components mentioned: Aurora, Outbox, PyFlink, BigQuery in both lessons

### File Statistics

```
01-capstone-overview.mdx:        293 lines, 13,995 bytes
02-architecture-deliverables.mdx: 652 lines, 23,705 bytes
Total:                           945 lines, 37,700 bytes
```

## Next Phase Readiness

### Blockers for 11-02
None. All prerequisites satisfied:
- Module 7 directory structure established
- Capstone overview and architecture lessons complete
- Technical requirements documented for all components
- Code examples provide templates for implementation guide

### Recommendations for 11-02

1. **Implementation guide lessons:** Create step-by-step guides for each component setup (following the architecture requirements from 11-01)
2. **Troubleshooting lesson:** Common failure scenarios and debugging strategies
3. **Reference implementations:** Sample project repository structure students can clone as starting point
4. **Assessment rubric:** Detailed scoring criteria aligned with success criteria from lesson 01

### Open Questions

None requiring resolution before 11-02. Plan 11-02 can proceed immediately.

## Commits

| Commit | Message | Files | Impact |
|--------|---------|-------|--------|
| `1588299` | feat(11-01): create capstone overview lesson | 01-capstone-overview.mdx | Capstone project introduction, architecture overview, success criteria |
| `cf78e2c` | feat(11-01): create architecture and deliverables lesson | 02-architecture-deliverables.mdx | Technical requirements, code examples, deliverables checklist |

**Total commits:** 2 (1 per task, atomic commits following plan)

## Lessons Learned

### What Went Well

1. **Synthesis approach:** Capstone lessons effectively reference prior modules (Module 2-6) without repeating content
2. **Code example completeness:** All code snippets are production-ready (not toy examples)
3. **Architecture diagrams:** C4 diagrams clearly communicate system structure at appropriate abstraction levels
4. **Anti-patterns documentation:** Explicit warning of common pitfalls saves students debugging time

### What Could Be Improved

1. **BigQuery connector details:** Could expand on BigQuery-specific CDC limitations (e.g., no DML on CDC-enabled tables)
2. **Aurora vs PostgreSQL distinction:** Could clarify when to use local PostgreSQL for testing vs Aurora for production patterns
3. **Testing strategy depth:** Could provide more guidance on chaos testing scenarios (specific failure injection techniques)

### Process Insights

- **Reference material quality:** 11-RESEARCH.md provided excellent code examples and anti-patterns that transferred directly into lesson content
- **Module 7 positioning:** Capstone as final module creates natural synthesis point; no new concepts introduced
- **Deliverables clarity:** Explicit checklist format reduces ambiguity about capstone completion criteria

## Production Readiness

This plan delivers production-ready content:

✅ **Complete specifications:** All technical requirements documented with validation checklists
✅ **Code quality:** All examples follow production patterns (no toy code)
✅ **Documentation patterns:** C4 diagrams, runbook structure align with industry practices
✅ **Anti-patterns covered:** Explicit warnings prevent common production failures
✅ **Monitoring included:** Four Golden Signals framework teaches SRE best practices

Students following these lessons will build capstone projects that demonstrate production deployment competency.

---

**Status:** ✅ Complete
**Duration:** 4m 34s
**Next:** Plan 11-02 (Capstone Implementation Guide)
