---
phase: 14-aurora-mysql-specifics
plan: 01
subsystem: database
tags: [aurora-mysql, aws, parameter-groups, binlog, rds, stored-procedures]

# Dependency graph
requires:
  - phase: 12-mysql-binlog-architecture
    provides: Community MySQL binlog configuration patterns (my.cnf, SET PERSIST, binlog_expire_logs_seconds)
  - phase: 13-connector-setup-comparison
    provides: Schema history topic configuration (infinite retention, single partition)
provides:
  - Aurora MySQL parameter group configuration knowledge (cluster vs instance scope)
  - AWS CLI commands for creating and modifying custom parameter groups
  - Aurora-specific binlog retention via mysql.rds_set_configuration stored procedure
  - Aurora 2.10+ reboot requirements (manual reader instance reboot)
  - Verification procedures for parameter group application
affects: [14-02-enhanced-binlog, 14-03-snapshot-modes, module-8-labs]

# Tech tracking
tech-stack:
  added:
    - mysql.rds_set_configuration (Aurora stored procedure for binlog retention)
    - mysql.rds_show_configuration (Aurora stored procedure for config verification)
  patterns:
    - Custom DB cluster parameter group creation for CDC configuration
    - AWS CLI-based parameter group management (create → modify → associate → reboot → verify)
    - Aurora 2.10+ manual reader reboot procedure
    - Binlog retention via stored procedures (not SET PERSIST)

key-files:
  created:
    - src/content/course/08-module-8/07-aurora-parameter-groups.mdx (Aurora parameter groups lesson, 843 lines)
  modified: []

key-decisions:
  - "DB Cluster Parameter Group (not DB Parameter Group) for all binlog-related parameters"
  - "Explicit binlog_format=ROW setting recommended even though MySQL 8.0.34+ defaults to ROW"
  - "168 hours (7 days) binlog retention for course labs (Aurora 3.x supports up to 2160 hours)"
  - "Manual reader instance reboot required for Aurora 2.10+ after cluster parameter group changes"

patterns-established:
  - "Parameter group configuration workflow: create custom PG → modify parameters → associate with cluster → reboot writer + readers → verify in-sync status"
  - "Aurora-specific binlog retention: CALL mysql.rds_set_configuration('binlog retention hours', N) instead of binlog_expire_logs_seconds parameter"
  - "Verification checklist: parameter group status (in-sync), binlog_format on writer and readers, GTID mode, retention configuration, binlog files present"
  - "Writer endpoint for Debezium (not reader endpoint - readers use physical replication, not binlog)"

# Metrics
duration: 4min
completed: 2026-02-01
---

# Phase 14 Plan 01: Aurora MySQL Parameter Groups Summary

**Aurora MySQL CDC configuration via DB cluster parameter groups with stored procedure-based binlog retention (168 hours) and Aurora 2.10+ manual reader reboot procedure**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-01T12:07:08Z
- **Completed:** 2026-02-01T12:10:53Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created comprehensive Aurora MySQL parameter groups configuration lesson (843 lines)
- Documented cluster vs instance parameter group scope (critical distinction for binlog configuration)
- Provided AWS CLI commands for full parameter group lifecycle (create → modify → associate → reboot → verify)
- Explained Aurora-specific binlog retention via mysql.rds_set_configuration stored procedure
- Documented Aurora 2.10+ reboot behavior change (manual reader reboot required)
- Created verification checklist for parameter group application on writer and reader instances

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Aurora parameter groups configuration lesson** - `480f3b6` (feat)

**Plan metadata:** (will be committed with STATE.md update)

## Files Created/Modified

- `src/content/course/08-module-8/07-aurora-parameter-groups.mdx` - Aurora MySQL parameter groups configuration lesson covering managed service model, cluster vs instance parameter group types, AWS CLI workflow, Aurora-specific stored procedures for binlog retention, Aurora 2.10+ reboot requirements, common pitfalls, and verification checklist

## Decisions Made

**1. DB Cluster Parameter Group scope for binlog parameters**
- **Decision:** All binlog-related parameters (binlog_format, binlog_row_image, gtid_mode, aurora_enhanced_binlog) configured via DB Cluster Parameter Group, not DB Parameter Group
- **Rationale:** Cluster-level parameters apply to writer and all reader instances; instance-level parameter groups for binlog settings either fail with AWS error or are ignored

**2. Explicit binlog_format=ROW setting**
- **Decision:** Explicitly set binlog_format=ROW via parameter group even though MySQL 8.0.34+ (Aurora MySQL 8.0.40 base) defaults to ROW
- **Rationale:** Clarity and protection against future default changes; aligns with Phase 12 decision [12-02]

**3. 168 hours binlog retention for course**
- **Decision:** Configure 7 days (168 hours) binlog retention via mysql.rds_set_configuration for course labs
- **Rationale:** Aligns with Phase 12 decision [12-01] for consistency across community MySQL and Aurora MySQL lessons; Aurora 3.x supports up to 2160 hours (90 days) but 7 days sufficient for educational exercises

**4. Manual reader reboot documentation**
- **Decision:** Prominently document Aurora 2.10+ behavior change requiring manual reader instance reboot after cluster parameter group changes
- **Rationale:** Most common pitfall - readers show old parameter values after writer reboot; Aurora MySQL 8.0.40 (Aurora 3.09.0) requires manual reader reboot

**5. Verification checklist on both writer and readers**
- **Decision:** Include verification steps for both writer and reader instances (SHOW VARIABLES on each endpoint)
- **Rationale:** Prevents false confidence from checking only writer; ensures all instances in-sync with parameter group

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Lesson provides AWS CLI commands and SQL stored procedure calls for Aurora configuration.

## Next Phase Readiness

**Ready for Phase 14 Plan 02 (Enhanced Binlog architecture):**
- Aurora parameter group foundation established
- Learner understands cluster vs instance scope
- Stored procedure-based configuration pattern introduced
- Reboot requirements and verification procedures documented

**Prerequisites for Enhanced Binlog lesson:**
- Parameter group creation workflow understood (Plan 01 provides foundation)
- Aurora 3.x version awareness (Plan 01 covers version detection via AURORA_VERSION())
- Cluster parameter group modification skills (Plan 01 teaches AWS CLI workflow)

**No blockers or concerns.**

## Content Highlights

**Lesson structure (10 sections):**
1. Managed Service Model (community MySQL vs Aurora abstraction)
2. Parameter Group Types (cluster vs instance, scope table)
3. Creating Custom Parameter Group for CDC (AWS CLI step-by-step)
4. Associating Parameter Group with Aurora Cluster (modify-db-cluster)
5. Reboot Requirements (Aurora 2.10+ critical change)
6. Binlog Retention via Stored Procedures (mysql.rds_set_configuration)
7. Verification Checklist (8-step checklist for complete validation)
8. Common Pitfalls (6 pitfalls with symptoms, causes, solutions)
9. Key Takeaways (12 bullet points)
10. What's Next (preview Enhanced Binlog)

**Pedagogical elements:**
- 3 Mermaid diagrams (parameter scope, configuration workflow, reboot decision flow)
- 4 Callout components (note, tip, danger, warning)
- Common pitfalls table (6 entries with symptoms/causes/solutions)
- Parameter scope comparison table (cluster vs instance)
- Aurora version mapping table (2.09, 2.10+, 3.x reboot behavior)

**Key differentiators from community MySQL:**
- No SSH access or /etc/my.cnf editing (managed service abstraction)
- Parameter groups instead of direct server configuration
- Stored procedures for retention (not SET PERSIST binlog_expire_logs_seconds)
- AWS CLI for configuration management
- Reboot requirements different from standard MySQL restart
- Backup retention affects binlog retention (Aurora-specific constraint)

---
*Phase: 14-aurora-mysql-specifics*
*Completed: 2026-02-01*
