---
phase: 14-aurora-mysql-specifics
plan: 03
subsystem: database
tags: [aurora-mysql, debezium, cdc, snapshot, locks, aws]

# Dependency graph
requires:
  - phase: 14-aurora-mysql-specifics
    provides: "14-02: Enhanced Binlog architecture documentation"
  - phase: 13-connector-setup-comparison
    provides: "13-04: MySQL connector configuration patterns"
  - phase: 12-mysql-binlog-fundamentals
    provides: "12-01: MySQL binlog architecture, GTID mode, retention"
provides:
  - Aurora MySQL snapshot strategy selection guide
  - snapshot.locking.mode decision matrix based on table size
  - Backup-based initial load workflow for very large tables
  - Aurora-specific snapshot monitoring and troubleshooting patterns
affects: [14-aurora-production-operations, mysql-aurora-comparison, production-cdc-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Aurora snapshot mode selection based on table size and lock tolerance"
    - "Backup-based initial load via Aurora snapshot + JDBC bulk load + Debezium streaming"
    - "Table-level lock fallback detection and handling"

key-files:
  created:
    - src/content/course/08-module-8/09-aurora-snapshot-modes.mdx
  modified: []

key-decisions:
  - "snapshot.locking.mode=minimal as safe default for Aurora (<100GB tables)"
  - "snapshot.locking.mode=none only with schema change freeze guarantee"
  - "Backup-based approach recommended for 500GB+ tables with zero lock tolerance"
  - "extended mode never compatible with Aurora (FLUSH TABLES prohibition)"

patterns-established:
  - "Decision matrix pattern: table size × lock tolerance × schema freeze → recommended mode"
  - "Backup-based workflow: binlog position capture → Aurora snapshot → restore → bulk load → Debezium streaming"
  - "Monitoring snapshot via connector logs, SHOW PROCESSLIST, CloudWatch metrics"

# Metrics
duration: 5min
completed: 2026-02-01
---

# Phase 14 Plan 03: Aurora Snapshot Modes Summary

**Comprehensive Aurora MySQL snapshot mode selection lesson covering lock prohibition, table-level fallback strategy, decision matrix for locking modes, and backup-based initial load for very large tables**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-01T12:08:35Z
- **Completed:** 2026-02-01T12:13:02Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Complete Aurora MySQL snapshot strategy guide (1193 lines)
- Explains Aurora's FLUSH TABLES WITH READ LOCK prohibition and automatic table-level lock fallback
- Decision matrix for choosing snapshot.locking.mode based on table size (< 10GB, 10-100GB, 100GB+, 500GB+)
- Step-by-step backup-based workflow with AWS CLI commands for zero-lock scenarios
- Comprehensive monitoring and troubleshooting guide with SHOW PROCESSLIST, connector logs, CloudWatch

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Aurora snapshot modes selection lesson** - `3a741c8` (feat)

## Files Created/Modified

- `src/content/course/08-module-8/09-aurora-snapshot-modes.mdx` - Aurora MySQL snapshot mode selection lesson with lock prohibition explanation, three locking modes (minimal/none/extended), decision matrix, backup-based approach, monitoring, and troubleshooting

## Content Structure

The lesson includes:

1. **Introduction** - Why Aurora requires special snapshot strategy (FLUSH TABLES prohibition)
2. **Community MySQL vs Aurora comparison** - Global lock vs table-level locks (Mermaid diagrams)
3. **Debezium Aurora adaptation** - Automatic fallback workflow (sequence diagram)
4. **Three snapshot.locking.mode options:**
   - minimal (default, recommended for <100GB tables)
   - none (zero locks, requires schema freeze)
   - extended (NOT compatible with Aurora)
5. **Decision matrix** - Table size × lock tolerance × schema freeze → recommended mode
6. **Connector configuration examples** - Small tables (minimal) and large tables (none)
7. **Backup-based initial load strategy:**
   - Aurora snapshot creation
   - Restore to temporary cluster
   - Bulk load via JDBC source connector
   - Debezium streaming with snapshot.mode=never
   - Step-by-step AWS CLI commands
8. **Monitoring snapshot progress** - Connector logs, SHOW PROCESSLIST, CloudWatch metrics
9. **Troubleshooting table** - Common issues with root causes and solutions
10. **Key takeaways** - 6 critical points
11. **Hands-on exercises** - Minimal mode, none mode, backup-based, schema change simulation

## Pedagogical Highlights

- **Callout components:**
  - type="warning": Aurora automatic fallback is normal behavior
  - type="danger": Schema change risk with snapshot.locking.mode=none
  - type="warning": extended mode incompatible with Aurora
  - type="danger": Binlog position must be captured BEFORE snapshot
  - type="warning": Schema history topic required for snapshot.mode=never
  - type="tip": Lock duration monitoring threshold (5 minutes)

- **Mermaid diagrams:**
  - Lock scope comparison (Community MySQL global vs Aurora table-level)
  - Aurora snapshot workflow sequence diagram
  - Backup-based approach sequence diagram

- **Code examples:**
  - Connector configs for small tables (minimal mode)
  - Connector configs for large tables (none mode)
  - AWS CLI commands for snapshot workflow
  - JDBC source connector for bulk load
  - Debezium connector with snapshot.mode=never

- **Decision matrix table** - 7 scenarios with recommendations
- **Troubleshooting table** - 6 common problems with solutions

## Decisions Made

None - followed plan as specified. All content decisions align with Phase 14 research:
- snapshot.locking.mode=minimal as safe default (per 14-RESEARCH.md)
- snapshot.locking.mode=none only with schema freeze controls
- Backup-based approach for 500GB+ tables (per research Pattern 3)
- Aurora FLUSH TABLES prohibition explanation (per research Pattern 1)

## Deviations from Plan

None - plan executed exactly as written.

All content areas specified in plan task were implemented:
- ✅ Aurora lock prohibition and automatic fallback
- ✅ Three snapshot.locking.mode options with detailed explanations
- ✅ Decision matrix for mode selection
- ✅ Backup-based initial load strategy with AWS CLI workflow
- ✅ Monitoring snapshot progress (logs, PROCESSLIST, CloudWatch)
- ✅ Troubleshooting table with 6 common issues

## Issues Encountered

None - lesson content creation proceeded smoothly. Build passed on first attempt.

## Must-Haves Verification

**Truths:**
- ✅ Learner knows Aurora MySQL prohibits FLUSH TABLES WITH READ LOCK (Section 2)
- ✅ Learner can choose appropriate snapshot.locking.mode for Aurora based on table size (Section 5: Decision Matrix)
- ✅ Learner understands snapshot.locking.mode=none risks (Section 4.2: Callout about schema change danger)
- ✅ Learner knows backup-based initial load strategy for very large tables (Section 7: Complete workflow)

**Artifacts:**
- ✅ File: `src/content/course/08-module-8/09-aurora-snapshot-modes.mdx` (1193 lines, min 400 required)
- ✅ Contains: "snapshot.locking.mode" (23 occurrences)
- ✅ Contains: "FLUSH TABLES WITH READ LOCK" (9 occurrences)
- ✅ Contains: "backup-based" / "Backup-based" (18 occurrences)

**Key links:**
- ✅ References snapshot.mode from Phase 13 connector configuration (04-mysql-connector-configuration.mdx)
- ✅ Pattern matches established in Phase 13 (snapshot configuration properties)

## Next Phase Readiness

Ready for Phase 14 Plan 04 (Aurora production operations):
- Snapshot strategy documented, learners understand Aurora-specific constraints
- Monitoring patterns established (SHOW PROCESSLIST, CloudWatch metrics)
- Troubleshooting knowledge base created

**Foundation provided for production operations:**
- Snapshot mode selection decision framework
- Lock tolerance understanding
- Backup-based workflow for enterprise scenarios

No blockers. Aurora MySQL comprehensive coverage progressing as planned (Lessons 07-08-09 complete, production operations lesson next).

---
*Phase: 14-aurora-mysql-specifics*
*Completed: 2026-02-01*
