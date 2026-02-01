---
phase: 09-module-5-data-engineering
plan: 03
type: execution-summary
subsystem: data-engineering
tags: [pyspark, structured-streaming, etl, elt, data-lake, parquet, delta-lake]

dependencies:
  requires:
    - "08-04-SUMMARY.md (Schema Registry patterns for CDC schema management)"
    - "04-01-SUMMARY.md (Kafka infrastructure for streaming source)"
  provides:
    - "PySpark Structured Streaming patterns for CDC processing"
    - "ETL/ELT architecture patterns for data lake integration"
    - "Watermark-based aggregation patterns"
    - "Parquet/Delta Lake write patterns"
  affects:
    - "09-04-PLAN.md (Real-time ML features build on PySpark patterns)"
    - "Future analytics workloads (data lake foundation)"

tech-stack:
  added:
    - PySpark 4.1.1 (Structured Streaming API)
    - Delta Lake (ACID upserts for CDC)
  patterns:
    - "Micro-batch processing with configurable triggers"
    - "Watermark-based late data handling"
    - "Append-only history with metadata columns"
    - "Operation-based stream separation (INSERT/UPDATE/DELETE)"
    - "MERGE upserts for stateful data lake"
    - "Date-based partitioning for query efficiency"

key-files:
  created:
    - src/content/course/05-module-5/05-pyspark-structured-streaming.mdx (520 lines)
    - src/content/course/05-module-5/06-etl-elt-patterns.mdx (684 lines)
  modified: []

decisions:
  - id: PYSPARK_WATERMARK_DEFAULT
    what: "10-minute watermark as recommended default for CDC aggregations"
    why: "Balances completeness vs latency for typical CDC use cases"
    alternatives: ["1 minute (low latency)", "1 hour (high completeness)"]
    impact: "Students understand watermark tuning tradeoffs"

  - id: ELT_OVER_ETL_EMPHASIS
    what: "Focus on ELT pattern (load raw, transform in warehouse) over traditional ETL"
    why: "Modern trend with cloud warehouses and cheap storage, preserves raw data"
    alternatives: ["ETL pattern (transform before load)"]
    impact: "Curriculum reflects modern data engineering practices"

  - id: DELTA_LAKE_FOR_UPSERTS
    what: "Delta Lake recommended for ACID upserts, Parquet for append-only"
    why: "Delta Lake provides MERGE command for atomic operations, versioning"
    alternatives: ["Iceberg", "Pure Parquet with overwrite"]
    impact: "Students learn production-ready upsert patterns"

  - id: AT_LEAST_ONCE_ACKNOWLEDGMENT
    what: "Explicitly document PySpark at-least-once limitation for Kafka sink"
    why: "Critical limitation vs PyFlink, students must know for architecture decisions"
    alternatives: ["Hide limitation", "Only teach PyFlink"]
    impact: "Transparent about technology tradeoffs"

  - id: METADATA_COLUMNS_STANDARD
    what: "Standard metadata columns: _operation, _cdc_timestamp, _processed_at"
    why: "Enable troubleshooting, audit trail, reprocessing scenarios"
    alternatives: ["No metadata", "Different naming convention"]
    impact: "Consistent pattern across course for CDC metadata tracking"

metrics:
  duration: "5 minutes"
  completed: "2026-02-01"
  tasks: 2
  commits: 2
  files_created: 2
  lines_added: 1204

status: complete
---

# Phase 09 Plan 03: PySpark Streaming and ETL/ELT Patterns Summary

**One-liner:** PySpark Structured Streaming for CDC processing with watermark-based aggregations and data lake ETL/ELT patterns (Parquet, Delta Lake)

## What Was Built

Created two comprehensive lessons covering PySpark Structured Streaming integration with Kafka CDC sources and production ETL/ELT patterns for data lake pipelines.

**Lesson 05: PySpark Structured Streaming с Kafka**
- PySpark vs PyFlink decision framework (latency, exactly-once, ML integration, data lake)
- SparkSession configuration with checkpoint location
- Explicit StructType schema definition for Debezium CDC envelope
- Kafka source integration with `readStream.format("kafka")`
- JSON parsing with `from_json()` and schema validation
- Watermark configuration for late data handling (`withWatermark`)
- Windowed aggregations (tumbling windows with `window()` function)
- Checkpoint fault recovery patterns
- Output modes: append, update, complete
- Lab exercise: 5-minute revenue aggregation per customer
- Mermaid diagrams: PySpark vs PyFlink philosophy, execution model, latency breakdown

**Lesson 06: ETL/ELT паттерны с CDC данными**
- ETL vs ELT architecture comparison with modern cloud warehouse context
- CDC as incremental source for data lake (advantages and challenges)
- Append-only history pattern with metadata columns (`_operation`, `_cdc_timestamp`, `_processed_at`)
- Separate streams by operation type (INSERT/UPDATE/DELETE routing)
- Delta Lake MERGE for atomic upserts with CDC events
- Parquet streaming with date-based partitioning
- Exactly-once limitations in PySpark (at-least-once to Kafka sink)
- StreamingQueryListener for monitoring `processedRowsPerSecond`, `batchDuration`
- Compression codecs comparison (snappy, gzip, zstd)
- Trigger configuration (processingTime, once, availableNow)
- Lab exercise: CDC to Parquet data lake with partitioning
- Mermaid diagrams: ETL vs ELT flows, operation separation, exactly-once limitations

**Course Pattern Compliance:**
- ✅ Russian explanatory text for concepts
- ✅ English code, config, technical terms
- ✅ MDX with complete frontmatter (title, description, order, difficulty, estimatedTime, topics, prerequisites)
- ✅ Mermaid diagrams for architecture visualization
- ✅ Lab exercises integrated into lessons
- ✅ Production warnings for critical pitfalls

## Deviations from Plan

None - plan executed exactly as written.

All must_haves verified:
- ✅ Student can configure PySpark to read CDC events from Kafka
- ✅ Student can define Debezium schema using StructType
- ✅ Student can parse JSON CDC events with from_json
- ✅ Student can configure checkpoints for fault tolerance
- ✅ Student can implement watermark-based aggregations
- ✅ Student can design CDC-to-data-lake ETL pipeline
- ✅ Student can separate INSERT/UPDATE/DELETE operations for different sinks

## Key Technical Decisions

**1. Watermark Default (10 minutes)**
Established 10-minute watermark as recommended default for CDC aggregations. This balances completeness (waiting for late events) with latency (finalizing windows promptly). Students learn tuning tradeoffs through decision table.

**2. ELT Over ETL Emphasis**
Focused on modern ELT pattern (load raw, transform in warehouse) over traditional ETL. Reflects industry trend with cloud warehouses (Snowflake, BigQuery) and cheap storage (S3). Raw data preservation enables reprocessing.

**3. Delta Lake for Upserts**
Recommended Delta Lake for ACID upserts, Parquet for append-only scenarios. Delta Lake MERGE command provides atomic operations, versioning, time travel. Production-ready pattern for stateful data lake updates.

**4. Transparent At-Least-Once Limitation**
Explicitly documented PySpark at-least-once limitation for Kafka sink (vs PyFlink exactly-once). Critical for architecture decisions. Provided solutions: idempotent consumers, deduplication, or PyFlink alternative.

**5. Standard Metadata Columns**
Established naming convention: `_operation`, `_cdc_timestamp`, `_processed_at`. Enables troubleshooting, audit trail, reprocessing scenarios. Consistent pattern for all CDC data lake workflows.

## Testing Performed

**Verification checks (from plan):**
- ✅ Both lesson files exist in src/content/course/05-module-5/
- ✅ Lesson order field is sequential (5, 6)
- ✅ Prerequisites chain correctly (05 → module-5/04, 06 → module-5/05)
- ✅ PySpark 4.1.1 compatible syntax
- ✅ StructType schema matches Debezium envelope
- ✅ Watermark and checkpoint patterns correct
- ✅ ETL/ELT patterns are practical and actionable
- ✅ Mermaid diagrams render properly (syntax validated)
- ✅ Russian language for explanatory text
- ✅ English for code, config, technical terms

**File metrics:**
- 05-pyspark-structured-streaming.mdx: 520 lines (requirement: 220+)
- 06-etl-elt-patterns.mdx: 684 lines (requirement: 200+)

**Pattern verification:**
- `readStream.format('kafka')` pattern found (4 occurrences in lesson 05)
- `withWatermark` configuration present (2 occurrences)
- `writeStream` to Parquet pattern found (6 occurrences in lesson 06)
- Operation filtering (c, u, d) demonstrated
- Metadata columns pattern consistent

## Integration Points

**Builds on:**
- Schema Registry patterns from 08-04 (Avro schema for CDC parsing alternative)
- Kafka infrastructure from 04-01 (bootstrap.servers configuration)
- PyFlink patterns from 09-02 (comparison context for PySpark vs PyFlink)

**Enables:**
- 09-04 real-time ML features (builds on PySpark streaming aggregations)
- Future analytics workloads (data lake foundation with Parquet/Delta)
- Production CDC pipelines (complete streaming to data lake patterns)

**Cross-module references:**
- Module 3 monitoring patterns (StreamingQueryListener metrics)
- Module 4 SMT patterns (alternative to PySpark transformations)

## Next Phase Readiness

**Blockers:** None

**Concerns:** None

**Ready for 09-04:** Yes - PySpark patterns established, ready for feature engineering patterns

**Remaining in phase:**
- 09-04: Real-time ML feature engineering (final plan in Module 5)

## Lessons Learned

**What Worked Well:**
1. **PySpark vs PyFlink decision table** - Clear framework for technology selection based on requirements
2. **Explicit at-least-once limitation** - Transparent about Kafka sink semantics prevents production surprises
3. **Metadata columns pattern** - Consistent `_operation`, `_cdc_timestamp` naming enables troubleshooting
4. **Mermaid diagrams** - Architecture flows (ETL vs ELT, operation separation) clarify complex patterns
5. **Lab exercises** - Hands-on aggregation and data lake pipeline reinforce learning

**Challenges:**
1. **Complex nested schema** - StructType definition verbose, considered Schema Registry alternative
2. **Watermark tuning** - Tradeoff between completeness and latency requires experience to optimize
3. **Delta Lake vs Parquet choice** - Students need clear decision criteria for format selection

**Improvements for Future:**
1. Consider Schema Registry integration example for automatic schema generation
2. Add watermark impact visualization (late data drop scenarios)
3. Expand Delta Lake section with Z-ordering and optimization patterns

## Artifacts

**Created:**
- `.planning/phases/09-module-5-data-engineering/09-03-SUMMARY.md` (this file)
- `src/content/course/05-module-5/05-pyspark-structured-streaming.mdx` (520 lines)
- `src/content/course/05-module-5/06-etl-elt-patterns.mdx` (684 lines)

**Commits:**
- `a9f1aaa` - feat(09-03): create PySpark Structured Streaming lesson
- `407f31d` - feat(09-03): create ETL/ELT patterns lesson

**Documentation:**
- Research patterns referenced: Pattern 5 (PySpark Structured Streaming), Pattern 6 (ETL to Data Lake)
- Pitfalls addressed: Pitfall 3 (checkpoint directories), Pitfall 4 (missing watermarks)
- Open Question 3 acknowledged (exactly-once limitations)

---

**Phase 09 Progress:** 3 of 4 plans complete
**Next:** 09-04 Real-time ML Feature Engineering
