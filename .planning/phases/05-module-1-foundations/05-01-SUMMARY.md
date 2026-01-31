---
phase: 05
plan: 01
subsystem: course-content
tags: [CDC, Debezium, MDX, Mermaid, educational-content]

dependency-graph:
  requires: [01-02, 01-03]  # Content collection schema, lesson routing
  provides: [CDC-fundamentals-lesson, Debezium-architecture-lesson]
  affects: [05-02, 05-03, 05-04, 05-05, 05-06]  # Subsequent Module 1 lessons

tech-stack:
  added: []
  patterns: [progressive-disclosure, hands-on-first-pedagogy, Mermaid-architecture-diagrams]

key-files:
  created:
    - src/content/course/module-1/01-cdc-fundamentals.mdx
    - src/content/course/module-1/02-debezium-architecture.mdx
  modified: []

decisions:
  - id: lesson-language-pattern
    choice: Russian explanatory text, English code/config
    rationale: Course is for Russian-speaking engineers; code stays in English for international compatibility

metrics:
  duration: 2.5m
  completed: 2026-01-31
---

# Phase 5 Plan 1: Module 1 Foundation Lessons Summary

**One-liner:** Created CDC fundamentals and Debezium architecture lessons with 5 Mermaid diagrams explaining log-based CDC superiority and three deployment modes.

## What Was Built

### Lesson 1: CDC Fundamentals (01-cdc-fundamentals.mdx)
- **155 lines** of comprehensive CDC theory
- **Problem-solution structure:** Opens with polling limitations, introduces log-based CDC as solution
- **Comparison table:** Polling vs log-based across 6 dimensions (latency, DELETE detection, DB load, completeness, updated_at requirement, intermediate states)
- **2 Mermaid diagrams:**
  1. Flowchart comparing polling approach vs CDC architecture
  2. Sequence diagram showing CDC event flow from INSERT to Consumer
- **5 use cases covered:** Data sync, event-driven architecture, audit/compliance, zero-downtime migration, materialized views
- **Key insight emphasized:** WAL is database's own durability mechanism - CDC leverages fundamental DBMS functionality

### Lesson 2: Debezium Architecture (02-debezium-architecture.mdx)
- **297 lines** of Debezium architecture deep-dive
- **Three deployment modes explained:**
  1. Kafka Connect (recommended) - with REST API examples
  2. Debezium Server - for cloud-native sinks without Kafka
  3. Embedded Engine - for Java apps needing maximum control
- **3 Mermaid diagrams:**
  1. Three deployment modes comparison flowchart
  2. Kafka Connect cluster architecture (workers, internal topics)
  3. Full CDC event flow sequence diagram (App -> PG -> WAL -> Debezium -> Kafka -> Consumer)
- **Kafka Connect internals:** Workers, connectors, tasks, internal topics (configs, offsets, status)
- **REST API examples:** Create, status, restart, delete connector operations
- **Version documentation:** Debezium 2.5.4, Kafka 7.8.1 (KRaft), pgoutput rationale

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 5802cb9 | feat | Create CDC fundamentals lesson with polling vs log-based comparison |
| f5950a9 | feat | Create Debezium architecture lesson with 3 deployment modes |

## Technical Decisions

### Lesson Language Pattern
**Decision:** Russian explanatory text, English code/config examples
**Rationale:** Course targets Russian-speaking engineers, but code should remain in English for:
- Copy-paste compatibility with documentation
- International standard for variable/config names
- Easier troubleshooting with English error messages

### Content Structure
**Decision:** Progressive disclosure following hands-on-first pedagogy from research
**Structure:**
1. Hook with problem (polling limitations)
2. Solution demonstration (CDC concept)
3. How it works (WAL, log-based mechanism)
4. Architecture details (Debezium modes, Kafka Connect)

### Mermaid Diagrams
**Decision:** Use flowcharts for architecture, sequence diagrams for event flow
**Rationale:** Visual learners benefit from both structural (flowchart) and temporal (sequence) representations

## Verification Results

| Check | Status | Details |
|-------|--------|---------|
| File existence | PASS | Both MDX files in src/content/course/module-1/ |
| Build validation | PASS | `npm run build` completes without errors |
| Mermaid import path | PASS | Both use `../../../components/Mermaid.tsx` |
| Frontmatter schema | PASS | Content collection validation passes |
| Line count | PASS | 155 lines (>150) and 297 lines (>200) |
| Mermaid diagrams | PASS | 2 + 3 = 5 total diagrams |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

### Ready for 05-02 (Lab Setup Lesson)
- Module 1 directory structure established
- Content pattern proven (Mermaid imports, frontmatter schema)
- Foundation lessons reference lab environment that 05-03 will create

### Prerequisites Satisfied
- CDC concept explained (required for understanding lab exercises)
- Debezium architecture covered (required for connector configuration)
- Three deployment modes documented (students know why we use Kafka Connect)

### No Blockers
All technical infrastructure working. Content collection validates. Build passes.
