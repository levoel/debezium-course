# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций
**Current focus:** v1.4 Complete - Interactive Glass Diagrams shipped

## Current Position

Phase: 37 of 37 (Visual Verification)
Plan: 1 of 1 completed
Status: v1.4 COMPLETE
Last activity: 2026-02-02 — Completed 36-03 (Bundle verification + v1.4 finalization)

Progress: v1.0-v1.4 [████████████████████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 108 (v1.0: 32 | v1.1: 19 | v1.2: 4 | v1.3: 13 | v1.4: 36)
- Average duration: ~6 min
- Total execution time: ~9.5 hours

**By Milestone:**

| Milestone | Phases | Plans | Status |
|-----------|--------|-------|--------|
| v1.0 MVP | 1-11 | 32 | Complete (2026-02-01) |
| v1.1 MySQL/Aurora | 12-18 | 19 | Complete (2026-02-01) |
| v1.2 Reorganization | 19-21 | 4 | Complete (2026-02-01) |
| v1.3 UX Refresh | 22-25 | 13 | Complete (2026-02-02) |
| v1.4 Glass Diagrams | 26-36 | 36/36 | Complete (2026-02-02) |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting v1.4 work:

- [Research]: Use @radix-ui/react-tooltip (~8KB) for accessible tooltips - WCAG compliant out of box
- [Research]: Custom React/SVG primitives (no React Flow or diagram libraries) - zero bundle cost
- [Research]: Primitives-first approach - build FlowNode/Arrow/Container before bulk migration
- [Research]: Glass design uses existing CSS variables (--glass-blur-md, --glass-border-color)
- [Research]: Click-to-open tooltips (not hover-only) for mobile accessibility
- [Research]: Sequence diagram primitives needed in Phase 27 before Module 2+ migration
- [26-01]: FlowNode uses forwardRef for Radix Tooltip.Trigger compatibility
- [26-01]: Arrow uses SVG path strings for 4 directions (right, down, left, up)
- [26-01]: Primitives directory at src/components/diagrams/primitives/
- [26-02]: Click-to-open pattern for mobile accessibility (not hover-only)
- [26-02]: DiagramTooltip wraps Radix Provider at component level
- [26-02]: DiagramContainer uses semantic HTML (figure/figcaption)
- [26-02]: Primitives library complete: FlowNode, Arrow, DiagramContainer, DiagramTooltip
- [27-01]: SequenceActor uses same glass styling as FlowNode (4 variants: database, service, queue, external)
- [27-01]: SequenceMessage uses SVG g element with forwardRef for Radix Tooltip compatibility
- [27-01]: Primitives library expanded to 7 components (added SequenceActor, SequenceLifeline, SequenceMessage)
- [27-02]: SequenceDiagram uses percentage layout with pixel conversion for arrow precision
- [27-02]: Primitives library complete with 8 components (4 flowchart + 4 sequence)
- [28-01]: Module 1 diagrams use responsive layouts (flex-col mobile, flex-row/grid desktop)
- [28-01]: Comparison diagrams pattern: side-by-side DiagramContainers with contrasting colors
- [28-01]: Complex architectures: nested DiagramContainers with 2x2 grid for 4 subgroups
- [28-01]: Data flow legends separate from diagrams with Arrow components showing connections
- [28-01]: Quick reference panels with code snippets for user convenience
- [28-02]: Sequence diagrams for connector flow (5 actors, 6 messages with tooltips)
- [28-02]: Horizontal flowcharts for linear pipelines (4 nodes with labeled arrows)
- [28-02]: 2x2 grid layout for operation type comparisons (r/c/u/d with color coding)
- [28-02]: Nested DiagramContainer for hierarchical structures (event envelope visualization)
- [28-02]: MDX import path pattern: ../../../components/diagrams/moduleN (3 levels up)
- [29-01]: State diagrams as flowcharts with status colors (emerald=active, amber=inactive, rose=danger)
- [29-01]: Critical step emphasis with border-2 and animate-pulse (Aurora reboot step)
- [29-01]: Danger/safe path layouts for state transitions (slot lifecycle)
- [29-01]: Parameter comparison with side-by-side containers showing apply scope
- [29-02]: Aurora failover sequence with 6 actors showing crash/recovery flow
- [29-02]: Heartbeat monitoring as data flow pattern (not sequence diagram)
- [29-02]: Global Database with two regions and Aurora replication arrow
- [29-02]: Snapshot decision tree with nested FlowNodes and color-coded paths
- [29-02]: Lab completion as numbered step list with tooltip summaries
- [30-01]: BinlogEventSequenceDiagram uses messageSpacing=38 for 16 messages
- [30-01]: GtidReplicationDiagram uses messageSpacing=55 for failover clarity
- [30-01]: HeartbeatMonitoringDiagram as SequenceDiagram for 4-actor heartbeat flow
- [30-01]: MysqlConnectorDataFlowDiagram combines phase headers with sequence diagram
- [30-02]: Blue for PostgreSQL, emerald for MySQL in comparison diagrams
- [30-02]: Critical steps (Aurora reboot) use animate-pulse with border-rose-400
- [30-02]: Recovery decision tree uses emerald (success) and rose (failure) paths
- [30-02]: AWS performance claims shown with explanatory tooltips
- [30-03]: FailoverWithoutGtidSequence and FailoverWithGtidSequence use messageSpacing=50
- [30-03]: Vertical timeline pattern with color-coded dots for failover events
- [30-03]: GTID set comparison with side-by-side containers and UUID highlighting
- [30-03]: Chunk watermarks (LOW/HIGH) with interleaving binlog events
- [30-03]: Three-tier monitoring architecture (JMX amber, CloudWatch blue, Operational emerald)
- [31-01]: JMX Exporter uses amber className override (not new variant) for one-off color
- [31-01]: Health states color scheme: emerald (healthy), amber (attention), rose (critical)
- [31-01]: Decision tree uses nested divs with flex for branching (not SVG)
- [31-02]: Alert severity uses custom color classes (yellow/orange/rose) via className overrides
- [31-02]: LowTrafficWalScenarioDiagram uses SequenceDiagram with 4 actors, 9 messages, messageSpacing=45
- [31-02]: MultiLayerDefenseDiagram as vertical flowchart emphasizing defense-in-depth
- [31-03]: TasksMaxMythDiagram uses rose (myth) vs emerald (reality) side-by-side comparison
- [31-03]: ScalingDecisionFrameworkDiagram uses flex-based decision tree with nested branches
- [31-03]: StateStorageLocationsDiagram uses nested DiagramContainers for Kafka/PostgreSQL/Connect
- [31-03]: OrphanedSlotCleanupDiagram uses color-coded outcomes (emerald=safe, amber=escalate, blue=wait)
- [31-04]: Module 4 MDX import pattern: import from ../../../components/diagrams/module4
- [31-04]: client:load directive for React hydration in Astro MDX
- [32-01]: SMT chain diagrams use horizontal FlowNode chains (logical order, not temporal)
- [32-01]: Color scheme: rose=filter, blue=unwrap, purple=route, amber=mask
- [32-01]: Predicate evaluation with TRUE/FALSE branches (emerald=apply, gray=skip)
- [32-02]: Nested DiagramContainers for multi-subsystem architecture (App/DB/CDC/Kafka)
- [32-02]: Rose color for failure scenarios (dual-write problem visualization)
- [32-02]: Side-by-side field mapping pattern for SMT transformations
- [32-02]: Multi-service architecture with grid layout and separate containers per service
- [32-03]: Purple variant for Schema Registry service (distinct from database/queue)
- [32-03]: Grid layout (2x2) for compatibility mode comparison (BACKWARD/FORWARD/FULL/NONE)
- [32-03]: Decision tree with 3 independent paths for schema changes (add/remove/change)
- [32-03]: Color-coded compatibility: emerald=BACKWARD, blue=FORWARD, purple=FULL, rose=NONE
- [32-03]: Module 5 complete: 21 diagrams, 8 MDX files, zero Mermaid code blocks
- [33-02]: SequenceDiagram for out-of-order events (messageSpacing=60) and temporal joins (messageSpacing=55)
- [33-02]: Horizontal FlowNode chains for window timelines (simpler than Gantt, proven pattern)
- [33-02]: Color progression for state growth: emerald (Day 1) → amber (Day 7/30) → rose with animate-pulse (Day 90 OOM)
- [33-02]: Multi-layer nested containers for CDC architecture (Source/CDC/Processing/Output layers)
- [33-02]: Russian tooltips with streaming terminology (watermark, event time, processing time, window types)
- [33-01]: Amber for at-least-once (caution), emerald for exactly-once (recommended) in delivery semantics
- [33-01]: SequenceDiagram for consumer rebalancing with max.poll.interval.ms timeout (8 messages, messageSpacing=55)
- [33-01]: Hierarchical tree layout for CDC envelope structure (nested DiagramContainers with horizontal arrows)
- [33-01]: Color-coded CDC fields: blue=payload, emerald=before/after, rose=op, amber=ts_ms, purple=source
- [33-03]: Side-by-side comparison for PySpark vs PyFlink philosophy (blue vs purple containers)
- [33-03]: Timeline visualization for watermark events (vertical with threshold line and late event highlighting)
- [33-03]: Three-layer data lake architecture (nested DiagramContainers for raw/snapshot/history)
- [33-03]: Operation separation with color-coded branching (emerald=INSERT, amber=UPDATE, rose=DELETE)
- [33-03]: Metadata columns grid (2x2) for append-only pattern (_operation, _cdc_timestamp, _processed_at, _source_db/_source_table)
- [33-04]: Feature staleness visualization: amber for batch (12h old) vs emerald for real-time (seconds old)
- [33-04]: Multi-layer architecture pattern for feature engineering (4 layers: Source → CDC → Computation → Store)
- [33-04]: Dual-write pattern for feature stores (side-by-side: Redis online + Parquet offline)
- [33-04]: Module 6 complete: 26 diagrams, 7 MDX files, zero Mermaid code blocks
- [34-01]: 6 GCP FlowNode variants added to primitives (gcp-database, gcp-messaging, gcp-compute, gcp-storage, gcp-monitoring, gcp-security)
- [34-01]: GCP brand colors for service categories (blue #4285f4 data, amber #fbbc04 messaging, emerald #34a853 compute)
- [34-01]: Amber for Traditional Kafka (complexity), emerald for Kafka-less (simplicity) comparison pattern
- [34-01]: Nested DiagramContainer for Debezium Server internal architecture (Quarkus app boundary visualization)
- [34-02]: SequenceDiagram for authentication flows (messageSpacing=55 for 6-message Workload Identity flow)
- [34-02]: Multi-stage pipeline visualization with nested DiagramContainers (Source/CDC Engine/Messaging/Processing/Storage)
- [34-02]: Changelog vs Replica table dual-write pattern for BigQuery CDC
- [34-02]: Anti-pattern comparison footer (Workload Identity vs Service Account Keys warning)
- [34-03]: AutoScalingBehaviorSequence with 4 actors and 6 messages (messageSpacing=45) showing Cloud Run dynamic scaling
- [34-03]: 3-column grid layout for monitoring points hierarchy (not nested containers) for flat service-to-metrics mapping
- [34-03]: Alert hierarchy with nested DiagramContainers for severity levels (rose=Critical, amber=Warning, blue=Info)
- [34-03]: Module 7 complete: 14 diagrams, 6 MDX files, zero Mermaid code blocks
- [35-01]: C4 Model: Map Person to FlowNode variant='app' with rounded-full className (no custom icon)
- [35-01]: C4 Model: Map System_Ext to FlowNode variant='sink' with border-dashed className
- [35-01]: Hero diagram: Use vertical stacking of DiagramContainers for 5 architectural layers
- [35-01]: Outbox table: Use red color override (bg-red-500/20 border-red-400/30) as Outbox Pattern signature
- [35-01]: Four Golden Signals: Map Latency->Replication Lag, Traffic->Event Throughput, Errors->Connector Failures, Saturation->Queue Capacity
- [35-02]: PostgreSQL blue (bg-blue-500/20 border-blue-400/30), MySQL red (bg-red-500/20 border-red-400/30) in multi-database diagrams
- [35-02]: Metric heterogeneity footer explaining PostgreSQL WAL bytes vs MySQL binlog milliseconds
- [35-02]: Module 8 complete: 8 diagrams, 5 MDX files, zero Mermaid code blocks
- [36-01]: Filter React hydration error #418 in error-tracking fixture (pre-existing SSR issue)
- [36-01]: Use role="tooltip" selector for custom DiagramTooltip (not Radix Popover)
- [36-02]: Mobile viewport test checks element bounding boxes (not page scrollWidth) for accuracy
- [36-02]: Code blocks may overflow intentionally with horizontal scroll - diagrams must fit
- [36-03]: Mermaid removed - 2.6MB bundle reduction (72% JS reduction, 3.6MB to 1.0MB)

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
| 004 | Apple glass style fixes | 2026-02-01 | 294f2aa | [004-apple-glass-style-fixes](./quick/004-apple-glass-style-fixes/) |
| 005 | Fix lesson navigation buttons | 2026-02-02 | 2cf3270 | [005-fix-lesson-navigation-buttons](./quick/005-fix-lesson-navigation-buttons/) |
| 006 | Fix 13 visual diagram issues | 2026-02-02 | 3ad0c40 | [006-fix-visual-diagram-issues](./quick/006-fix-visual-diagram-issues/) |
| 007 | Add noncommercial license attribution | 2026-02-02 | 444f1e0 | [007-add-noncommercial-license-attribution](./quick/007-add-noncommercial-license-attribution/) |

## Session Continuity

Last session: 2026-02-02
Stopped at: Completed quick-007 (Add noncommercial license attribution)
Resume file: None

---
*State initialized: 2026-01-31*
*Last updated: 2026-02-02 — Quick task 007: CC BY-NC 4.0 license with Lev Neganov attribution*
