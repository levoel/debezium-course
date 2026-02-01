---
phase: 15-production-operations
plan: 03
subsystem: education
tags: [debezium, mysql, incremental-snapshot, signal-table, aurora, gtid, kafka]

# Dependency graph
requires:
  - phase: 14-aurora-mysql-specifics
    provides: Aurora snapshot modes, binlog configuration, GTID setup
  - phase: 13-mysql-connector-architecture
    provides: Connector configuration patterns, schema history topic
provides:
  - Incremental snapshot lesson with signal table operations
  - Read-only snapshot configuration for Aurora replicas
  - Snapshot monitoring and troubleshooting guidance
affects: [16-performance-optimization, 17-multi-region-cdc]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Signal table schema with PRIMARY KEY requirement"
    - "Kafka signal channel for read-only environments"
    - "Chunk-based snapshot with binlog streaming parallelism"

key-files:
  created:
    - src/content/course/08-module-8/12-incremental-snapshots.mdx
  modified:
    - src/content/course/08-module-8/10-binlog-lag-monitoring.mdx

key-decisions:
  - "Signal table PRIMARY KEY mandatory - silent failure without PK documented as critical pitfall"
  - "Kafka signal channel positioned as solution for read-only Aurora replicas"
  - "GTID prerequisites (replica_preserve_commit_order) required for read-only snapshots"
  - "7-day binlog retention recommended for large table snapshots with safety margin"
  - "Chunk size default 2048 rows with tuning guidance based on row width"

patterns-established:
  - "Signal table operations follow database.include.list requirement pattern"
  - "Read-only snapshot workflow via Kafka aligns with Aurora read replica best practices"
  - "Binlog retention planning formula: Snapshot Duration + 2× Safety Margin + 3-day buffer"

# Metrics
duration: 7min
completed: 2026-02-01
---

# Phase 15 Plan 03: Incremental Snapshots Summary

**Comprehensive incremental snapshot guide with signal table DDL, Kafka-based signaling for Aurora replicas, chunk-based progress monitoring, and binlog retention planning**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-01T12:44:27Z
- **Completed:** 2026-02-01T12:51:40Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Created 1,394-line lesson covering complete incremental snapshot lifecycle
- Signal table setup with exact DDL and PRIMARY KEY requirement
- Read-only snapshot configuration via Kafka signal channel for Aurora replicas
- Comprehensive troubleshooting section for common signal table pitfalls
- Binlog retention planning for multi-hour large table snapshots

## Task Commits

Each task was committed atomically:

1. **Task 1: Create incremental snapshots lesson** - `0c54707` (feat)

**Additional fixes:**
- MDX parsing fix for lesson 10 - `2828bc3` (fix)

## Files Created/Modified

**Created:**
- `src/content/course/08-module-8/12-incremental-snapshots.mdx` - Incremental snapshot lesson with signal table operations, read-only snapshots, and monitoring

**Modified:**
- `src/content/course/08-module-8/10-binlog-lag-monitoring.mdx` - Fixed MDX parsing errors by escaping time units (60s, 10s) in backticks

## Decisions Made

**1. Signal table PRIMARY KEY as critical requirement**
- Positioned PRIMARY KEY as mandatory, not optional
- Documented silent failure mode when PK missing
- Added Callout danger block emphasizing criticality

**2. Kafka signal channel for read-only Aurora replicas**
- Provided alternative signaling mechanism for read-only environments
- Documented GTID prerequisites (replica_preserve_commit_order=ON)
- Explained why regular snapshots fail on read-only replicas

**3. Binlog retention planning formula**
- Established concrete formula: Snapshot Duration + 2× Safety Margin + 3-day buffer
- Recommended 7 days (604800 seconds) minimum for production
- Included CloudWatch monitoring guidance for Aurora (ChangeLogBytesUsed)

**4. Chunk size tuning guidance**
- Default 2048 rows documented with formula for customization
- Trade-offs table (1024 → 8192 range) based on row width and memory
- Memory estimation formula: (Desired Memory per Chunk MB) / (Average Row Size KB) * 1024

**5. Comprehensive pitfall documentation**
- Signal table not in database.include.list → silent failure
- Missing PRIMARY KEY → silent failure
- Binlog retention < snapshot duration → position loss
- Read-only environment without GTID prerequisites → out-of-order events

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed MDX parsing errors in lesson 10**
- **Found during:** Build verification after lesson creation
- **Issue:** Unescaped time units (60s, 10s, 10-60s) in Cyrillic text causing MDX parser errors
- **Fix:** Wrapped time units in backticks to prevent MDX character interpretation
- **Files modified:** src/content/course/08-module-8/10-binlog-lag-monitoring.mdx
- **Verification:** Build passes successfully
- **Committed in:** 2828bc3 (separate fix commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Pre-existing build error in lesson 10 prevented verification of lesson 12. Bug fix required for build to complete.

## Issues Encountered

None - lesson created and verified successfully after MDX fix.

## User Setup Required

None - no external service configuration required.

## Lesson Content Highlights

**Introduction:**
- Initial vs Incremental snapshot architectural comparison (Mermaid diagram)
- Real-world scenarios: adding tables, extended downtime, data inconsistency recovery
- Chunk-based reading with binlog streaming parallelism

**Signal Table:**
- Exact DDL with PRIMARY KEY requirement
- Column specifications (id VARCHAR(36), type VARCHAR(32), data TEXT)
- GRANT permissions for debezium user
- Common mistakes section with silent failure documentation

**Connector Configuration:**
- signal.data.collection property with database.include.list requirement
- incremental.snapshot.chunk.size tuning (1024-8192 range)
- Complete connector config examples

**Triggering Snapshots:**
- Basic snapshot: Single table via SQL INSERT
- Multiple tables: JSON array in data-collections
- Filtered snapshot: additional-conditions with WHERE clause
- Stop snapshot: stop-snapshot signal type
- UUID() for unique signal IDs

**Read-Only Snapshots:**
- GTID prerequisites for Aurora replicas (gtid_mode, enforce_gtid_consistency, replica_preserve_commit_order)
- Kafka signal channel setup (signal.kafka.topic, signal.kafka.bootstrap.servers)
- Triggering via kafka-console-producer instead of SQL INSERT
- Why regular snapshots fail on read-only (write access required for locking/metadata)

**Monitoring:**
- JMX metrics: SnapshotRunning, RemainingTableCount, ChunkId
- Connector logs: chunk windows, scanned rows
- Prometheus queries for snapshot status
- Grafana panel recommendations (references Phase 15 Plan 01)
- Completion time estimation formula

**Common Pitfalls:**
1. Signal table schema not in database.include.list → silent failure
2. Missing PRIMARY KEY → silent failure
3. Binlog retention < snapshot duration → purged binlog position
4. Read-only environment without replica_preserve_commit_order → out-of-order events

**Binlog Retention Planning:**
- Snapshot duration estimation: (Total Rows / Chunk Size) × Average Chunk Time
- Retention formula: Snapshot Duration + 2× Safety Margin + 3-day buffer
- Aurora limits: up to 90 days (2160 hours) for Aurora MySQL 3.x
- CloudWatch monitoring: ChangeLogBytesUsed metric with 80% threshold

**Hands-On Exercises:**
1. Setup signal table and trigger basic snapshot
2. Monitor snapshot progress and estimate completion
3. Stop in-progress snapshot
4. Advanced: Configure Kafka signal channel for read-only scenario

## Next Phase Readiness

**Ready for Phase 16 (Performance Optimization):**
- Incremental snapshot tuning (chunk size optimization) foundation established
- Monitoring patterns (JMX, Prometheus, Grafana) documented
- Binlog retention planning guidance available

**Ready for Phase 17 (Multi-Region CDC):**
- Read-only replica snapshot patterns applicable to multi-region Aurora Global Database
- GTID prerequisites documented for cross-region replication scenarios

**No blockers or concerns.**

## Build Verification

- Build passes: ✅
- Lesson file: 1,394 lines (exceeds 400-line minimum)
- Contains required keywords: ✅ (debezium_signal: 56 occurrences, execute-snapshot, signal.data.collection)
- References prior lessons: ✅ (09-aurora-snapshot-modes, 04-mysql-connector-configuration)
- Mermaid diagrams: 2 (Initial vs Incremental comparison, Signal table processing flow)
- Callout components: 6 (danger: 2, warning: 3, tip: 1)
- Code examples: SQL DDL, connector configs, signal INSERT statements, Kafka producer commands
- Decision tables: 1 (Initial vs Incremental Snapshot comparison)

---
*Phase: 15-production-operations*
*Completed: 2026-02-01*
