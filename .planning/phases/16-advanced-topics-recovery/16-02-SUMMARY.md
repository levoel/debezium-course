---
phase: 16-advanced-topics-recovery
plan: 02
subsystem: cdc-operations
tags: [mysql, debezium, multi-connector, server-id, registry, topology, schema-history]

# Dependency graph
requires:
  - phase: 13-connector-setup-comparison
    provides: database.server.id property and schema.history.internal.kafka.topic configuration
  - phase: 13-connector-setup-comparison
    provides: Schema history topic infinite retention requirement
provides:
  - Server ID registry pattern with 184000-184999 range allocation
  - Topic isolation rules for multi-connector deployments
  - Verification procedures for detecting server_id conflicts
  - Troubleshooting workflows for duplicate server_id errors
  - Registry template with 30-day reuse embargo
affects: [17-production-hardening, multi-tenant-deployments, disaster-recovery]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server ID registry pattern with centralized allocation tracking"
    - "Range allocation strategy (184000-184999 for Debezium connectors)"
    - "30-day reuse embargo on decommissioned server_id values"
    - "Topic isolation rules (database.server.name + schema.history.internal.kafka.topic uniqueness)"

key-files:
  created:
    - src/content/course/08-module-8/14-multi-connector-deployments.mdx
  modified: []

key-decisions:
  - "Server ID range 184000-184999 established for Debezium connectors (avoids MySQL cluster conflicts)"
  - "30-day reuse embargo enforced on decommissioned server_id values (prevents stale connection conflicts)"
  - "Three mandatory unique properties: database.server.id, database.server.name, schema.history.internal.kafka.topic"
  - "Registry template uses markdown table format for version control tracking"

patterns-established:
  - "Pattern 1: Server ID registry workflow (allocate before deployment, document status, enforce embargo)"
  - "Pattern 2: Multi-connector verification checklist (SHOW SLAVE HOSTS, duplicate checks, topic listing)"
  - "Pattern 3: Topic naming convention (schema-history.{database.server.name})"

# Metrics
duration: 10min
completed: 2026-02-01
---

# Phase 16 Plan 02: Multi-Connector Deployments Summary

**Server ID registry pattern with 184000-184999 range allocation, topic isolation rules, and comprehensive verification procedures for safe multi-connector MySQL CDC deployments**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-01T13:21:26Z
- **Completed:** 2026-02-01T13:31:11Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Comprehensive multi-connector deployments lesson (1,397 lines) covering server.id registry management
- Server ID registry template with allocation rules, status tracking, and 30-day reuse embargo
- Topic isolation rules documentation (database.server.name, schema.history.internal.kafka.topic uniqueness)
- Configuration examples for two connectors to same MySQL with complete comparison table
- Verification procedures using SHOW SLAVE HOSTS, duplicate detection queries, and topic listing
- Troubleshooting workflows for server ID conflicts with three resolution options
- Scaling considerations (resource planning, connection limits, snapshot parallelism, monitoring)
- Hands-on exercise deploying two connectors with intentional conflict scenario
- Multi-connector checklists for pre-deployment, during deployment, post-deployment, and maintenance

## Task Commits

Each task was committed atomically:

1. **Task 1: Create multi-connector deployments lesson** - `e6e7e0c` (feat)

## Files Created/Modified

- `src/content/course/08-module-8/14-multi-connector-deployments.mdx` - Multi-connector deployments lesson with server.id registry pattern, topic isolation rules, configuration examples, verification procedures, troubleshooting workflows, scaling considerations, hands-on exercise, and maintenance checklists

## Decisions Made

**Server ID Range Allocation (184000-184999)**
- Rationale: Avoids conflicts with typical MySQL cluster deployments (usually use 1-1000 range for real replicas)
- Impact: Provides 999 unique allocations for Debezium connectors
- Pattern: Documented in STATE.md as standard project decision

**30-Day Reuse Embargo on Decommissioned server_id Values**
- Rationale: MySQL replication sessions not killed instantly; timeout delays, stale connections, and failover scenarios can leave old server_id registered
- Implementation: Registry template tracks decommissioned date and reuse-after date
- Enforcement: Manual verification during allocation workflow

**Three Mandatory Unique Properties**
- `database.server.id`: MySQL replication protocol requirement (duplicate blocks connection)
- `database.server.name`: Kafka topic prefix (shared prefix = topic collision)
- `schema.history.internal.kafka.topic`: Schema isolation (shared topic = DDL pollution)
- Documented with comparison table showing which properties must be unique

**Registry Template Format**
- Markdown table format for human readability and version control tracking
- Columns: Connector Name, Server ID, Database, Status, Owner, Deployed, Notes
- Separate sections: Active Allocations, Decommissioned (Reuse After), Team Sub-Ranges
- Rationale: Git-friendly, easy to review in pull requests, simple tooling integration

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**MDX Parsing Error with < Character**
- Found during: Build verification after lesson creation
- Issue: Line 163 contained `<1000` which MDX interpreted as HTML tag opening
- Fix: Changed to "менее 1000" (less than 1000 in Russian)
- Impact: Build passes successfully
- Resolution time: <1 min

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Multi-connector deployment knowledge complete**
- Learners can allocate server.id without conflicts using registry pattern
- Topic isolation rules prevent schema history topic sharing errors
- Verification procedures enable confirmation of correct deployment
- Troubleshooting workflows handle duplicate server_id conflicts

**Foundation for next lessons**
- Recovery procedures (16-03) will reference multi-connector scenarios
- Production hardening will build on registry maintenance patterns
- Disaster recovery planning will include multi-connector coordination

**No blockers or concerns**
- All verification procedures tested (SHOW SLAVE HOSTS, duplicate checks)
- Configuration examples are copy-paste ready with proper unique values
- Registry template practical for real-world use
- Hands-on exercise deployable in existing Docker lab environment

---
*Phase: 16-advanced-topics-recovery*
*Completed: 2026-02-01*
