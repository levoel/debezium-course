---
phase: 16-advanced-topics-recovery
plan: 03
subsystem: documentation
tags: [mysql, debezium, ddl, gh-ost, pt-online-schema-change, schema-migration, cdc, smt, filter]

# Dependency graph
requires:
  - phase: 12-mysql-aurora-setup
    provides: MySQL binlog architecture and ROW format requirements
  - phase: 13-debezium-mysql-setup
    provides: Schema history topic architecture and DDL tracking
provides:
  - DDL tools integration lesson covering gh-ost and pt-online-schema-change for zero-downtime migrations
  - Helper table pattern (_gho, _ghc, _new, _old) explanation and handling strategies
  - Filter SMT configuration pattern for removing helper table events
  - Complete integration walkthroughs with executable commands
affects: [advanced-recovery, multi-connector, production-operations]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Broad capture + Filter SMT pattern for DDL tool helper tables"
    - "Helper table naming conventions (_gho, _ghc, _new, _old)"
    - "Regex filtering in Debezium transforms"

key-files:
  created:
    - src/content/course/08-module-8/15-ddl-tools-integration.mdx
  modified: []

key-decisions:
  - "Filter SMT positioned as recommended approach vs dynamic include list"
  - "gh-ost presented as triggerless (binlog reading) vs pt-osc trigger-based approach"
  - "Helper table filtering happens before Kafka to save storage and bandwidth"
  - "Foreign key support distinguishes pt-osc from gh-ost for CDC environments"

patterns-established:
  - "Pattern 1: Broad Capture + SMT Filter - capture all tables, filter helper events before Kafka"
  - "Pattern 2: Dynamic Include List - manually add/remove helper tables (not recommended)"
  - "Helper table regex: `.*_(gho|ghc|new|old)$` covers both gh-ost and pt-osc"

# Metrics
duration: 4min
completed: 2026-02-01
---

# Phase 16-03: DDL Tools Integration Summary

**Comprehensive gh-ost and pt-online-schema-change integration patterns for zero-downtime schema migrations with Filter SMT and helper table handling**

## Performance

- **Duration:** 4 minutes
- **Started:** 2026-02-01T13:21:53Z
- **Completed:** 2026-02-01T13:25:41Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Complete DDL tools integration lesson (1222 lines)
- gh-ost vs pt-online-schema-change comparison with trade-offs for CDC
- Helper table problem explained with crash scenarios
- Filter SMT configuration with regex covering all helper table patterns
- Complete gh-ost and pt-osc integration walkthroughs
- Schema evolution handling in consumers (Avro vs JSON)
- Hands-on exercise with verification steps

## Task Commits

1. **Task 1: Create DDL tools integration lesson** - `2fc267d` (feat)

## Files Created/Modified

- `src/content/course/08-module-8/15-ddl-tools-integration.mdx` - DDL tools integration lesson covering gh-ost and pt-online-schema-change patterns for zero-downtime migrations with CDC

## Decisions Made

**1. Filter SMT as recommended pattern over dynamic include list**
- Rationale: Filtering before Kafka producer saves storage and bandwidth, avoids manual connector config updates

**2. Helper table naming pattern coverage**
- gh-ost: `_gho` (ghost table), `_ghc` (changelog table)
- pt-osc: `_new` (new table), `_old` (old table post-rename)
- Regex: `.*_(gho|ghc|new|old)$` covers all patterns

**3. gh-ost positioned as triggerless approach**
- Reads binlog directly (doubles binlog read load)
- No foreign key support
- Better for tables without FK constraints

**4. pt-osc positioned as trigger-based approach**
- Uses AFTER INSERT/UPDATE/DELETE triggers
- Supports foreign keys
- Lower binlog read load (no binlog reading)

**5. Schema evolution patterns**
- Compatible changes (ADD COLUMN) are seamless
- Incompatible changes (DROP COLUMN, CHANGE TYPE) require consumer coordination
- Avro + Schema Registry recommended for automatic compatibility handling

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - lesson creation followed established Module 8 patterns (Russian text, English code, Mermaid diagrams, Callout components).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for:**
- Advanced recovery scenarios (binlog position loss, schema history corruption)
- Multi-connector deployment patterns (server.id management)
- Production troubleshooting lessons

**Content quality:**
- Comprehensive DDL tools integration lesson with 5 Mermaid diagrams
- Hands-on exercise executable in Docker lab environment
- All must_haves artifacts met (450+ lines, keywords present)
- Links to schema history (06) and binlog architecture (01) lessons established

---
*Phase: 16-advanced-topics-recovery*
*Completed: 2026-02-01*
