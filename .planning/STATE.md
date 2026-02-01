# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-01)

**Core value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций
**Current focus:** v1.1 MySQL/Aurora MySQL + Deployment (Phase 12)

## Current Position

Phase: 13 of 18 (Connector Setup + Comparison)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-02-01 — Completed 13-01-PLAN.md

Progress: v1.0 [████████████████████] 100% | v1.1 [████░░░░░░░░░░░░░░░░] 20%

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
- Plans completed: 4
- Average duration: 3 min
- Phase 12: 3/3 plans complete (phase complete)
- Phase 13: 1/3 plans complete (in progress)

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

Last session: 2026-02-01T10:54:16Z
Stopped at: Completed 13-01-PLAN.md (MySQL Connector Configuration Lesson)
Resume file: None

---
*State initialized: 2026-01-31*
*Last updated: 2026-02-01 — Completed 13-01-PLAN.md (Phase 13 in progress)*
