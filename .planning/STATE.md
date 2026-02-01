# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций
**Current focus:** v1.2 Course Reorganization — MySQL module moving to position 3

## Current Position

Phase: 21 of 21 (Verification and QA)
Plan: 1 of 2 in current phase
Status: In progress
Last activity: 2026-02-01 — Completed 21-01-PLAN.md

Progress: v1.0 [████████████████████] 100% | v1.1 [████████████████████] 100% | v1.2 [███████████████░░░░░] 75%

## Performance Metrics

**Velocity:**
- Total plans completed: 32 (v1.0)
- Average duration: ~15 min
- Total execution time: ~8 hours

**By Phase (v1.0):**

| Phase | Plans | Status |
|-------|-------|--------|
| 1-11 | 32 | Complete (v1.0 shipped) |
| 12-18 | TBD | Not started (v1.1) |

**v1.1 Metrics:**
- Plans completed: 19
- Average duration: 6 min
- Phase 12: 3/3 plans complete (phase complete)
- Phase 13: 3/3 plans complete (phase complete)
- Phase 14: 3/3 plans complete (phase complete)
- Phase 15: 3/3 plans complete (phase complete)
- Phase 16: 3/3 plans complete (phase complete)
- Phase 17: 3/3 plans complete (phase complete)
- Phase 18: 2/2 plans complete (phase complete)

**v1.2 Metrics:**
- Plans completed: 3
- Average duration: 5 min
- Phase 19: 1/1 plans complete (phase complete)
- Phase 20: 1/1 plans complete (phase complete)
- Phase 21: 1/2 plans complete (in progress)

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.0]: Debezium 2.5.x (not 3.x) for Java 21 ARM64 compatibility
- [v1.0]: Confluent Kafka 7.8.1 for ARM64 native support
- [v1.0]: Russian text / English code for target audience
- [v1.1]: MySQL 8.0.40 (stable, ARM64 compatible, binlog features complete)
- [12-01]: Use port 3307 externally to avoid conflicts with local MySQL
- [12-01]: Inline command configuration for MySQL binlog (avoids MySQL Bug #78957)
- [12-01]: binlog-row-image=FULL for educational clarity
- [12-01]: 7-day binlog retention for lab exercises
- [12-02]: ROW format positioned as mandatory for CDC (STATEMENT/MIXED discouraged)
- [12-02]: 5 Mermaid diagrams for visual learning in binlog architecture lesson
- [12-02]: PostgreSQL WAL comparison table to bridge Module 2 knowledge
- [12-03]: GTID mode as primary tracking mechanism (not optional alternative to file:position)
- [12-03]: Heartbeat events as mandatory pattern for idle table protection
- [12-03]: Retention planning formula: Max Expected Downtime + Safety Margin
- [13-01]: Schema history topic infinite retention (retention.ms=-1) as critical prerequisite
- [13-01]: database.server.id range 184000-184999 for Debezium connectors (avoid MySQL cluster conflicts)
- [13-01]: Single partition for schema history topic (preserves DDL ordering)
- [13-01]: Heartbeat configuration as recommended (not optional) for production deployments
- [13-02]: Position tracking as core architectural difference (PostgreSQL server-side slots vs MySQL client-side offsets)
- [13-02]: Schema history topic positioned as MySQL-only requirement (PostgreSQL embeds schema in WAL)
- [13-02]: GTID mode mandatory for production failover (vs complex PostgreSQL slot migration)
- [13-02]: Common misconceptions table addresses PostgreSQL-to-MySQL knowledge transfer issues
- [13-03]: Schema history topic retention.ms=-1 positioned as critical requirement ("7-day bomb")
- [13-03]: Recovery scenarios prioritized by frequency (normal restart → purged → corrupted → shared topic)
- [13-03]: Backup procedures emphasized for fast recovery vs resnapshot (minutes vs hours)
- [13-03]: Callout component created to support pedagogical callout pattern in course content
- [14-01]: DB Cluster Parameter Group (not DB Parameter Group) for all binlog-related parameters
- [14-01]: Explicit binlog_format=ROW setting recommended even though MySQL 8.0.34+ defaults to ROW
- [14-01]: 168 hours (7 days) binlog retention for course labs (Aurora 3.x supports up to 2160 hours)
- [14-01]: Manual reader instance reboot required for Aurora 2.10+ after cluster parameter group changes
- [14-02]: Enhanced Binlog suitable for single-region Aurora with high write throughput and no backtrack requirement
- [14-02]: Resnapshot mandatory after Aurora restore/clone when using Enhanced Binlog (binlog files not in backups)
- [14-02]: CloudWatch metrics (ChangeLogBytesUsed, ChangeLogReadIOPs, ChangeLogWriteIOPs) required for Enhanced Binlog monitoring
- [14-03]: snapshot.locking.mode=minimal as safe default for Aurora (<100GB tables)
- [14-03]: snapshot.locking.mode=none only with schema change freeze guarantee
- [14-03]: Backup-based approach recommended for 500GB+ tables with zero lock tolerance
- [14-03]: extended mode never compatible with Aurora (FLUSH TABLES prohibition)
- [15-01]: MilliSecondsBehindSource positioned as preferred lag metric over SecondsBehindMaster (millisecond precision, more reliable)
- [15-01]: Three-tier monitoring required for production (JMX for connector, CloudWatch for infrastructure, operational for application)
- [15-01]: Alert grace periods aligned with Aurora failover timing (2-minute threshold for connection alerts)
- [15-01]: SecondsBehindMaster=-1 during failover documented as normal behavior (not error condition)
- [15-01]: Heartbeat interval <60s with 60s alert threshold (6x tolerance for false positive prevention)
- [15-02]: GTID enables automatic failover - connector resumes from saved GTID without manual position finding
- [15-02]: gtid.source.includes=".*" recommended for Aurora Global Database (multi-region UUID support)
- [15-02]: snapshot.mode=when_needed prevents unnecessary resnapshot after failover
- [15-02]: heartbeat.interval.ms positioned as mandatory for production failover (prevents position loss on idle tables)
- [15-03]: Signal table PRIMARY KEY mandatory - silent failure without PK documented as critical pitfall
- [15-03]: Kafka signal channel positioned as solution for read-only Aurora replicas
- [15-03]: GTID prerequisites (replica_preserve_commit_order) required for read-only snapshots
- [15-03]: 7-day binlog retention recommended for large table snapshots with safety margin
- [15-03]: Chunk size default 2048 rows with tuning guidance based on row width
- [16-01]: snapshot.mode=when_needed positioned as default for automatic binlog recovery
- [16-01]: snapshot.mode=recovery requires manual DDL verification via SHOW BINLOG EVENTS
- [16-01]: Defense-in-depth approach: prevention cheaper than recovery (infinite retention costs MB, resnapshot costs hours)
- [16-01]: Backup frequency: daily for active databases, before schema changes, before connector upgrades
- [16-01]: Recovery mode dangerous if DDL happened since last offset - silent data corruption risk documented
- [16-02]: Server ID range 184000-184999 enforced for multi-connector deployments (registry pattern)
- [16-02]: 30-day reuse embargo on decommissioned server_id values (prevents stale connection conflicts)
- [16-02]: Three mandatory unique properties per connector: database.server.id, database.server.name, schema.history.internal.kafka.topic
- [16-02]: Registry template uses markdown table format for version control tracking
- [16-02]: Shared schema history topic = data corruption (DDL pollution across connectors)
- [16-03]: Filter SMT as recommended approach for helper table exclusion (removes before Kafka, saves storage)
- [16-03]: Helper table patterns: _gho, _ghc (gh-ost), _new, _old (pt-osc)
- [16-03]: gh-ost doubles binlog read load during migration (triggerless approach)
- [16-03]: pt-osc supports foreign keys, gh-ost does not
- [17-01]: Multi-database CDC architecture lesson created with separate-topics vs unified-topics comparison
- [17-01]: Separate topics pattern (database-specific topics) recommended for learning and traceability
- [17-01]: Unified topics pattern (ByLogicalTableRouter SMT) documented as advanced pattern for identical schemas
- [17-01]: Key uniqueness complexity in unified topics requires __dbz__physicalTableIdentifier handling
- [17-02]: Separate topics architecture chosen as primary pattern for capstone extension
- [17-02]: Topic naming convention: outbox.event.{database}.{aggregate} for source traceability
- [17-02]: PyFlink UNION ALL pattern for multi-source stream consolidation with source_database tracking
- [17-02]: Composite key strategy (PG-/MY- prefix) prevents order_id conflicts across databases
- [17-02]: Database-specific monitoring: PostgreSQL WAL lag (bytes) vs MySQL time lag (milliseconds)
- [17-02]: Isolation testing emphasized - verify each connector independently before unified processing
- [17-03]: MySQL outbox payload type JSON (not JSONB like PostgreSQL)
- [17-03]: Multi-database unique identifiers mandatory: database.server.id (184000-184999), database.server.name ({database_type}_{environment}), schema.history.internal.kafka.topic (unique per MySQL connector)
- [17-03]: Shared schema history topic = critical error for MySQL multi-connector (DDL pollution)
- [17-03]: Recovery procedures differ by connector type: PostgreSQL (replication slots) vs MySQL (schema history topic + GTID/binlog position)
- [17-03]: Self-assessment Section 8 provides multi-database verification checklist for capstone extension
- [18-01]: withastro/action@v5 over manual npm steps (auto-detection, caching, simplified maintenance)
- [18-01]: actions/checkout@v6 for latest stable version
- [18-02]: GitHub Actions as deployment source (not branch-based deployment)
- [19-01]: Two-stage rename (temp names) prevents filesystem collision during directory swap
- [19-01]: Clear .astro/ cache before and after renames to prevent stale path references
- [19-01]: Navigation auto-discovers module numbers from directory structure - no code changes needed
- [20-01]: sed replacement order matters - module-8 first to prevent circular mapping
- [20-01]: Progress migration uses prefix matching (not full slug map) for maintainability
- [20-01]: Migration flag (course-progress-v1.2-migrated) prevents re-running on every page load
- [21-01]: Chromium-only Playwright install (sufficient for local verification, saves disk space)
- [21-01]: Base path testing uses explicit constant (Playwright baseURL path component ignored for absolute paths)
- [21-01]: Progress tests use native Playwright test (avoid false positives from intentional hydration mismatches)
- [21-01]: Sample link testing (first lesson per module) for faster CI

### Pending Todos

None.

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Fix hamburger navigation dual module display | 2026-02-01 | 19f5ea8 | [001-fix-hamburger-navigation](./quick/001-fix-hamburger-navigation/) |
| 002 | Remove duplicate course roadmap | 2026-02-01 | 642fe5f | [002-remove-course-roadmap](./quick/002-remove-course-roadmap/) |
| 003 | Collapsible sidebar modules | 2026-02-01 | 50b366a | [003-collapsible-sidebar-modules](./quick/003-collapsible-sidebar-modules/) |

## Session Continuity

Last session: 2026-02-01
Stopped at: Completed 21-01-PLAN.md
Resume file: None

---
*State initialized: 2026-01-31*
*Last updated: 2026-02-01 — Phase 21 plan 1 complete, Playwright E2E tests for v1.2 verification*
