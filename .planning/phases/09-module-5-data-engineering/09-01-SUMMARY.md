---
phase: 09-module-5-data-engineering
plan: 01
subsystem: education-content
tags: [python, pandas, confluent-kafka, data-engineering, exactly-once, error-handling]

requires:
  - phase: 05-module-1-foundations
    reason: Basic Python consumer patterns as prerequisite
  - phase: 04-lab-infrastructure
    reason: JupyterLab environment for running Python code

provides:
  - Advanced Python consumer patterns (at-least-once, exactly-once)
  - Pandas DataFrame integration for CDC events
  - Production error handling patterns
  - CDC analytics workflows

affects:
  - phase: 09-module-5-data-engineering (plans 02-04)
    reason: PyFlink and PySpark lessons build on these consumer patterns

tech-stack:
  added:
    - pandas 3.0 with CoW and str dtype
    - confluent-kafka transactional API
  patterns:
    - Manual offset store for at-least-once guarantee
    - Transactional consumer-producer for exactly-once
    - Fatal vs non-fatal error handling
    - CDC event flattening to DataFrame
    - json_normalize for nested structures

key-files:
  created:
    - src/content/course/05-module-5/01-advanced-python-consumer.mdx
    - src/content/course/05-module-5/02-pandas-integration.mdx
  modified: []

decisions:
  - id: PANDAS-3-BREAKING-CHANGES
    choice: Teach pandas 3.0 patterns from start (str dtype, CoW, .loc[])
    why: Pandas 3.0 released Jan 2026, breaking changes affect CDC processing
    impact: Course content is future-proof, students learn current best practices
    alternatives: [Teach pandas < 3.0 patterns (outdated), Support both versions (complexity)]

  - id: AT-LEAST-ONCE-DEFAULT
    choice: Teach at-least-once as default pattern, exactly-once as advanced
    why: At-least-once simpler, more common for CDC (with idempotent consumers)
    impact: Students start with practical pattern, understand tradeoffs before complexity
    alternatives: [Teach exactly-once first (overwhelming), Skip at-least-once (incomplete)]

  - id: MANUAL-FLATTENING-OVER-JSON-NORMALIZE
    choice: Teach manual flattening as primary pattern, json_normalize as alternative
    why: More control, better understanding of CDC structure, clearer for students
    impact: Students understand before/after handling deeply before automation
    alternatives: [Only json_normalize (black box), Only manual (missing tool)]

metrics:
  duration: 4.5m
  completed: 2026-02-01
---

# Phase 09 Plan 01: Python Consumers & Pandas Integration Summary

**One-liner:** At-least-once/exactly-once consumer patterns and Pandas 3.0 DataFrame integration for CDC analytics

## What Was Built

### Lesson 1: Advanced Python Consumer Patterns (01-advanced-python-consumer.mdx)
Production-ready consumer patterns for CDC event processing:

**At-Least-Once Semantics:**
- `enable.auto.offset.store=False` + manual `consumer.store_offsets(msg)` pattern
- Guarantees no data loss (events may be processed twice on crash)
- Suitable for idempotent operations (upsert to DB, cache updates)

**Exactly-Once Semantics:**
- Transactional API with `isolation.level='read_committed'`
- `producer.send_offsets_to_transaction()` for atomic offset commit
- `transactional.id` for idempotent producer across restarts
- Guarantees no loss, no duplicates (for Kafka → process → Kafka pipeline)

**Error Handling:**
- Fatal vs non-fatal error distinction using `msg.error().fatal()`
- Fatal errors (auth, unknown topic) → stop consumer
- Non-fatal errors (network, partition EOF) → log and continue

**Rebalancing Management:**
- `max.poll.interval.ms` (default 5 minutes) timeout between poll() calls
- `max.poll.records` to limit batch size and prevent timeout
- Explained pitfall: consumer evicted from group during long processing

**Lab Exercise:**
Resilient consumer that survives Kafka stop/start, demonstrates at-least-once guarantee

### Lesson 2: Pandas DataFrame Integration (02-pandas-integration.mdx)
CDC event transformation for batch analysis and ETL:

**Pandas 3.0 Breaking Changes:**
- String dtype changed from `object` to `str`
- Copy-on-Write (CoW) requires `.loc[]` for modifications (chained assignment broken)
- Datetime resolution changed from nanosecond to microsecond
- Warning callout box for students to avoid old code patterns

**Manual Flattening Pattern:**
- `cdc_events_to_dataframe()` function with before/after prefix columns
- Handles all operation types (c, u, d, r)
- Timestamp conversion with `pd.to_datetime(df['ts_ms'], unit='ms')`

**json_normalize Alternative:**
- Automatic flattening for complex nested structures
- `sep='_'` and `max_level=3` parameters
- When to use: complex schemas vs manual control

**Operation Type Handling:**
- Critical: DELETE events have `after=null`, must use `before` field
- Filter by operation: `df[df['op'] == 'c']` for inserts only
- Change detection: `after_total - before_total` for UPDATE diffs

**Lab Exercise:**
Collect 100 CDC events, build DataFrame, analyze events by type and time

## Technical Decisions Made

### 1. At-Least-Once as Default Teaching Pattern
**Context:** Two delivery semantics available (at-least-once vs exactly-once)

**Decision:** Teach at-least-once as primary pattern, exactly-once as advanced

**Reasoning:**
- At-least-once is more common in production CDC (simpler, lower overhead)
- Most consumers can be idempotent (upsert to DB, update cache)
- Exactly-once requires transactional infrastructure (Kafka → Kafka only)
- Pedagogically better: simple concept first, complexity after understanding tradeoffs

**Implementation:**
- Dedicated section for each pattern with clear use-case matrix
- Lab focuses on at-least-once (easier to test)
- Exactly-once documented with full transactional code example

### 2. Pandas 3.0 Modern Patterns Only
**Context:** Pandas 3.0 released Jan 21, 2026 with breaking changes

**Decision:** Teach only pandas 3.0 patterns (str dtype, CoW, .loc[])

**Reasoning:**
- Course is forward-looking (students will use this for years)
- Old patterns (object dtype, chained assignment) now incorrect
- Warning box helps students identify outdated internet examples
- Lab environment has pandas 3.0 installed

**Impact:**
- Students learn current best practices
- No confusion from mixed old/new patterns
- Explicit callout of breaking changes prevents common errors

### 3. Manual Flattening Over json_normalize as Primary
**Context:** Two approaches to flatten CDC events into DataFrame

**Decision:** Teach manual flattening first, json_normalize as alternative

**Reasoning:**
- Manual approach forces understanding of CDC structure (before/after/op)
- More control over column naming and null handling
- json_normalize is "magic" - students should understand problem before automation
- Performance: manual is slightly faster for simple schemas

**Tradeoff:**
- More code to write initially
- Harder to handle schema changes

**Mitigation:**
- Document json_normalize immediately after manual pattern
- Provide decision matrix: when to use which approach

## Deviations from Plan

None - plan executed exactly as written.

All tasks completed as specified:
- Both lessons created in src/content/course/05-module-5/
- Module 5 directory created
- All frontmatter fields present and correct
- Russian explanatory text, English code/config
- Mermaid diagrams for message flow and rebalancing
- Lab exercises integrated into lessons
- Code examples verified for pandas 3.0 compatibility

## Commits

| Hash | Message | Files |
|------|---------|-------|
| a69aa01 | feat(09-01): create advanced Python consumer lesson | 01-advanced-python-consumer.mdx |
| a948da1 | feat(09-01): create Pandas integration lesson | 02-pandas-integration.mdx |

## Metrics

- **Duration:** 4.5 minutes
- **Files created:** 2 lesson files (1210 total lines)
- **Code examples:** 15+ complete working examples
- **Mermaid diagrams:** 3 (at-least-once vs exactly-once flow, CDC event structure, rebalancing sequence)

## Next Phase Readiness

**Phase 09 Plans 02-04 (PyFlink and PySpark):**
- ✅ Python consumer patterns established
- ✅ DataFrame transformation patterns documented
- ✅ Error handling patterns for students to extend
- ✅ Lab environment (JupyterLab) confirmed working

**Key patterns for next plans:**
1. At-least-once consumer pattern (basis for PyFlink/PySpark consumers)
2. DataFrame flattening (similar patterns in PyFlink Table API)
3. Operation type handling (required for streaming SQL filters)
4. Error handling (extends to PyFlink/PySpark error strategies)

**No blockers.** Ready to proceed with PyFlink CDC connector lesson (09-02).

## Course Integration

**Prerequisites met:**
- Module 1 basic consumer (created in Phase 05) is referenced
- Lab infrastructure (Phase 04) provides JupyterLab environment

**Provides for future modules:**
- Production consumer patterns (error handling, semantics)
- DataFrame analytics workflows (basis for ETL/ELT patterns)
- Pandas 3.0 knowledge (used throughout data engineering workflows)

**Student journey:**
- Module 1: Basic consumer (tutorial level)
- Module 5 Plan 01: Production consumer + analytics (intermediate/advanced)
- Module 5 Plans 02-04: Stream processing frameworks (advanced)

Pedagogical progression complete. Students now ready for distributed stream processing.
