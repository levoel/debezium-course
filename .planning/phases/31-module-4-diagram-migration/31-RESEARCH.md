# Phase 31: Module 4 Diagram Migration - Research

**Researched:** 2026-02-02
**Domain:** Mermaid to Glass Diagram Migration (Production Operations)
**Confidence:** HIGH

## Summary

Module 4 (Production Operations) contains **25 Mermaid diagrams** across 7 MDX files focused on monitoring, alerting, scaling, and disaster recovery. The diagrams heavily feature operational concepts: metrics pipelines, alert hierarchies, decision trees, and recovery procedures.

This module has consistent patterns that map well to existing primitives:
- Flowcharts for monitoring pipelines and decision frameworks
- Sequence diagrams for recovery procedures and WAL bloat scenarios
- Graph layouts for alert hierarchies and connector architectures

The three-tier monitoring pattern (JMX amber, CloudWatch/Prometheus blue, Operational emerald) established in Phase 30 research applies directly to Module 4's monitoring architecture diagrams.

**Primary recommendation:** Reuse existing primitives from Phases 28-30. No new primitives needed. Focus on consistent tooltip content for operations-specific explanations.

## Diagram Audit

### Total Count: 25 Mermaid diagrams

| Lesson | File | Diagrams | Primary Types |
|--------|------|----------|---------------|
| 01 | jmx-metrics-interpretation.mdx | 4 | flowchart (metrics pipeline, lag flow, decision tree, scenarios) |
| 02 | prometheus-metrics-collection.mdx | 1 | flowchart (Prometheus scraping architecture) |
| 03 | grafana-dashboard-lab.mdx | 3 | graph (dashboard structure, row layout, health states) |
| 04 | lag-detection-alerting.mdx | 4 | graph/flowchart (alert hierarchy, alert flow, batch INSERT, notification routing) |
| 05 | wal-bloat-heartbeat.mdx | 3 | sequenceDiagram + flowchart (low-traffic scenario, defense layers, heartbeat flow) |
| 06 | connector-scaling-tasks.mdx | 6 | flowchart (tasks.max myth, WAL architecture, scaling strategies, decision framework) |
| 07 | disaster-recovery-procedures.mdx | 4 | flowchart (failures, state storage, slot cleanup, DR drill) |

### Diagram Types Distribution

- **Flowcharts (flowchart TB/LR/TD):** 18 diagrams
- **Simple graphs (graph TB/LR):** 5 diagrams
- **Sequence diagrams:** 2 diagrams

## Diagram Inventory by File

### 01-jmx-metrics-interpretation.mdx (4 diagrams)

1. **JMX Metrics Pipeline** (flowchart LR)
   - Shows: DBZ -> JMX -> Exporter -> Prometheus -> Grafana/Alertmanager
   - Node colors: purple (DBZ), blue (JMX), amber (Exporter), rose (Prom), emerald (Grafana)
   - Tooltip concepts: JMX MBeans, Prometheus format, scraping

2. **MilliSecondsBehindSource Flow** (flowchart LR)
   - Shows: DB transaction -> Debezium processing -> Lag calculation
   - Simple 3-node flow
   - Tooltip: Explains lag calculation formula

3. **Staleness Scenarios** (flowchart TB with 3 subgraphs)
   - Shows: Normal work vs No activity vs Stuck connector
   - Color-coded: green/blue/red scenarios
   - Tooltip: Explains each scenario's meaning

4. **Diagnostic Decision Tree** (flowchart TD)
   - Shows: Problem diagnosis flow with branching questions
   - End states: Kafka bottleneck, WAL slow, Connection loss, Staleness
   - Color-coded outcomes: amber/blue/red/purple/green

### 02-prometheus-metrics-collection.mdx (1 diagram)

1. **Prometheus Scraping Architecture** (flowchart LR)
   - Shows: Connect container (JVM -> JMX -> Exporter) -> Prom (Scraper -> TSDB) -> Clients
   - Similar to JMX pipeline but more detail on Prometheus internals
   - Tooltip: Explains scrape intervals, retention

### 03-grafana-dashboard-lab.mdx (3 diagrams)

1. **Dashboard Architecture** (graph TB)
   - Shows: 3 rows structure (Health Overview, Time Series, Details)
   - 9 panels total: Status, Lag, Events/sec, Queue, trends...
   - Tooltip: Panel purpose and query type

2. **Panel Row Layout** (graph LR)
   - Shows: 4 panels in Row 1 with sample values
   - Simple inline layout

3. **Health States Comparison** (graph TB with 3 subgraphs)
   - Shows: Healthy vs Attention vs Critical states
   - 4 metrics per state with values
   - Color progression: green -> amber -> red

### 04-lag-detection-alerting.mdx (4 diagrams)

1. **Alerting vs No Alerting** (graph LR with 2 subgraphs)
   - Comparison: Reactive (bad) vs Proactive (good) alert handling
   - Color: red path vs green path

2. **Alert Severity Hierarchy** (graph TB)
   - Shows: Warning -> Critical -> Emergency escalation
   - Color: yellow -> orange -> red

3. **Batch INSERT Spike** (graph LR)
   - Shows: INSERT -> Lag spike -> Processing -> Recovery
   - Explains transient vs sustained lag

4. **Notification Routing** (graph TD)
   - Shows: Alert fires -> severity check -> email/Slack routing
   - Decision tree structure

### 05-wal-bloat-heartbeat.mdx (3 diagrams)

1. **Low-Traffic Table Scenario** (sequenceDiagram)
   - Actors: Orders, Slot, WAL, Disk
   - Shows: Normal flow then problematic accumulation
   - Rectangle highlight for problem area
   - Tooltip: Explains WAL retention mechanism

2. **Multi-Layer Defense** (flowchart TB)
   - Shows: Threats -> Defense layers (4 layers)
   - Layers: max_slot_wal_keep_size, Heartbeat, Monitoring, Runbooks
   - Color-coded layers: green/blue/amber/purple

3. **Heartbeat Flow** (flowchart LR)
   - Shows: Debezium timer -> pg_logical_emit_message -> WAL -> Slot -> Kafka
   - Explains slot advancement mechanism
   - Tooltip: Why heartbeat prevents WAL bloat

### 06-connector-scaling-tasks.mdx (6 diagrams)

1. **tasks.max Myth vs Reality** (flowchart TB with 2 subgraphs)
   - Shows: Myth (4 parallel tasks) vs Reality (1 task, ignored config)
   - Color: red (myth) vs green (reality), amber (ignored)

2. **WAL Sequential Architecture** (flowchart LR)
   - Shows: WAL events with LSN -> Sequential read through slot
   - Explains why parallelization impossible

3. **Single-Task Architecture** (flowchart TB)
   - Shows: PostgreSQL -> Debezium (Reader -> Queue -> Writer) -> Kafka
   - Highlights Reader as bottleneck

4. **Multiple Connectors Strategy** (flowchart LR)
   - Shows: 3 DB tables -> 3 connectors -> 3 Kafka topic groups
   - Color-coded by domain: blue/purple/emerald

5. **Downstream Parallelization** (flowchart LR)
   - Shows: Single connector -> Multi-partition topic -> Multiple consumers
   - Explains partition-based scaling

6. **Decision Framework** (flowchart TD)
   - Shows: Throughput decision tree for scaling strategy selection
   - Outcomes: Tuning, Multiple connectors, Downstream, Hybrid

### 07-disaster-recovery-procedures.mdx (4 diagrams)

1. **Failure Modes** (flowchart TB)
   - Shows: 4 failure types -> 4 impact types
   - Failures: Connect crash, Deletion, DB failover, Kafka loss
   - Color: blue/amber/red/purple for different failures

2. **State Storage Locations** (flowchart LR)
   - Shows: Kafka (configs, offsets, statuses) + PostgreSQL (slot, WAL) + Connect
   - Explains distributed state

3. **Orphaned Slot Cleanup** (flowchart TD)
   - Shows: Decision tree for safe slot cleanup
   - Branches: Connector exists? PAUSED? Documentation?
   - Outcomes: DROP (safe), ESCALATE, WAIT

4. **DR Drill Checklist** (embedded markdown, not a diagram)
   - This is actually a markdown checklist, not Mermaid

**Correction:** 07 has 3 diagrams + 1 markdown checklist = 3 actual diagrams

**Revised total: 24 Mermaid diagrams** (not 25)

## Diagram Patterns to Primitives Mapping

### Flowcharts -> FlowNode + Arrow + DiagramContainer

Most diagrams are flowcharts that map directly to existing primitives:

| Mermaid Pattern | Primitive Composition |
|-----------------|----------------------|
| `flowchart LR` with subgraphs | DiagramContainer(color) + FlowNode chain |
| `flowchart TB` decision tree | Vertical FlowNode layout with branching |
| `style X fill:#color` | FlowNode variant (database/connector/app/etc) |
| Direction arrows | Arrow component with direction prop |

### Sequence Diagrams -> SequenceDiagram

Only 1-2 true sequence diagrams (WAL bloat scenario). Use SequenceDiagram primitive with:
- Actors: Orders (database), Slot (service), WAL (service), Disk (external)
- Messages with tooltips explaining each interaction

### Comparison Diagrams -> Side-by-side DiagramContainers

Multiple diagrams use subgraphs for comparison:
- "Myth vs Reality"
- "Without Alerts vs With Alerts"
- "Healthy vs Attention vs Critical"

Use side-by-side DiagramContainer pattern from Module 3:
```tsx
<div className="grid grid-cols-2 gap-4">
  <DiagramContainer color="rose" title="Myth">...</DiagramContainer>
  <DiagramContainer color="emerald" title="Reality">...</DiagramContainer>
</div>
```

### Decision Trees -> Vertical FlowNode with Branches

Decision trees (6 diagrams) use this pattern:
```tsx
<DiagramContainer title="Decision Framework">
  <div className="flex flex-col items-center gap-2">
    <FlowNode variant="connector">Start Question</FlowNode>
    <Arrow direction="down" />
    <div className="flex gap-4">
      <FlowNode variant="app">Yes Path</FlowNode>
      <FlowNode variant="sink">No Path</FlowNode>
    </div>
  </div>
</DiagramContainer>
```

## Standard Stack

### Core (Already Established)

| Component | Location | Purpose | Usage |
|-----------|----------|---------|-------|
| FlowNode | primitives/FlowNode.tsx | Node boxes with variants | All flowchart nodes |
| Arrow | primitives/Arrow.tsx | Directional arrows | Connections between nodes |
| DiagramContainer | primitives/DiagramContainer.tsx | Glass wrapper | Every diagram |
| DiagramTooltip | primitives/Tooltip.tsx | Click/hover tooltips | All interactive nodes |
| SequenceDiagram | primitives/SequenceDiagram.tsx | Sequence layouts | WAL bloat scenario |

### FlowNode Variants for Module 4

| Variant | Color | Use For |
|---------|-------|---------|
| database | Purple | PostgreSQL, JMX MBeans |
| connector | Emerald | Debezium, Kafka Connect |
| cluster | Emerald (brighter) | Kafka cluster |
| sink | Blue | Prometheus, Grafana, AlertManager |
| app | Rose | Alerting outcomes, failure states |
| target | Rose (brighter) | Critical states |

### DiagramContainer Colors for Module 4

| Color | Use For |
|-------|---------|
| emerald | Healthy states, recommended approaches |
| rose | Critical states, problems, myths |
| amber | Warning states, defense layers |
| blue | Monitoring components, Prometheus |
| purple | Database components |
| neutral | Generic containers |

## Architecture Patterns

### Recommended File Structure

```
src/components/diagrams/module4/
├── JmxMetricsDiagrams.tsx           # Lesson 01 (4 diagrams)
├── PrometheusCollectionDiagrams.tsx # Lesson 02 (1 diagram)
├── GrafanaDashboardDiagrams.tsx     # Lesson 03 (3 diagrams)
├── AlertingDiagrams.tsx             # Lesson 04 (4 diagrams)
├── WalBloatHeartbeatDiagrams.tsx    # Lesson 05 (3 diagrams)
├── ConnectorScalingDiagrams.tsx     # Lesson 06 (6 diagrams)
├── DisasterRecoveryDiagrams.tsx     # Lesson 07 (3 diagrams)
└── index.ts                         # Barrel export
```

### Pattern: Monitoring Pipeline

Common pattern in Module 4 - linear data flow with processing stages:

```tsx
export function MetricsPipelineDiagram() {
  return (
    <DiagramContainer title="JMX Metrics Pipeline" color="blue">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <DiagramTooltip content="Debezium регистрирует метрики как JMX MBeans">
          <FlowNode variant="database">Debezium</FlowNode>
        </DiagramTooltip>
        <Arrow direction="right" label="MBeans" />
        <DiagramTooltip content="JMX Exporter конвертирует в Prometheus формат">
          <FlowNode variant="connector">JMX Exporter</FlowNode>
        </DiagramTooltip>
        <Arrow direction="right" label="/metrics" />
        <DiagramTooltip content="Prometheus скрапит каждые 15 секунд">
          <FlowNode variant="sink">Prometheus</FlowNode>
        </DiagramTooltip>
        <Arrow direction="right" />
        <DiagramTooltip content="Grafana визуализирует и алертит">
          <FlowNode variant="connector">Grafana</FlowNode>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}
```

### Pattern: Severity Hierarchy

Alert escalation pattern - vertical with color progression:

```tsx
export function AlertHierarchyDiagram() {
  return (
    <DiagramContainer title="Alert Severity Hierarchy" color="amber">
      <div className="flex flex-col items-center gap-2">
        <FlowNode variant="connector" className="bg-yellow-500/20 border-yellow-400/30">
          Warning
        </FlowNode>
        <Arrow direction="down" label="30 min unresolved" />
        <FlowNode variant="app" className="bg-orange-500/20 border-orange-400/30">
          Critical
        </FlowNode>
        <Arrow direction="down" label="15 min unresolved" />
        <FlowNode variant="target">
          Emergency
        </FlowNode>
      </div>
    </DiagramContainer>
  );
}
```

### Pattern: Myth vs Reality Comparison

Side-by-side containers with contrasting colors:

```tsx
export function TasksMaxMythDiagram() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DiagramContainer title="MYTH: tasks.max=4" color="rose">
        {/* Multiple parallel tasks (incorrect) */}
      </DiagramContainer>
      <DiagramContainer title="REALITY" color="emerald" recommended>
        {/* Single task only */}
      </DiagramContainer>
    </div>
  );
}
```

### Pattern: Decision Tree

Vertical layout with branching decisions:

```tsx
export function DiagnosticDecisionTree() {
  return (
    <DiagramContainer title="Diagnostic Framework" color="neutral">
      <div className="flex flex-col items-center gap-2">
        <FlowNode variant="connector">MilliSecondsBehindSource растет?</FlowNode>
        <div className="flex gap-8">
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="Да" />
            <FlowNode variant="connector">Queue utilization >80%?</FlowNode>
            {/* Further branching */}
          </div>
          <div className="flex flex-col items-center gap-2">
            <Arrow direction="down" label="Нет" />
            <FlowNode variant="sink">MilliSecondsSinceLastEvent >30s?</FlowNode>
            {/* Further branching */}
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tooltip state | Custom useState/hover logic | DiagramTooltip | Safari compatibility, accessibility |
| Node styling | Inline Tailwind per node | FlowNode variants | Consistency, maintainability |
| Container borders | Custom div styling | DiagramContainer | Glass aesthetic, responsive |
| Sequence lifelines | Custom SVG | SequenceDiagram | Responsive, self-message support |
| Arrow rendering | SVG arrows manually | Arrow component | Direction props, labels |

## Common Pitfalls

### Pitfall 1: Missing not-prose Class
**What goes wrong:** Prose styles bleed into diagrams, breaking layout
**Why it happens:** Astro's typography plugin applies styles to all content
**How to avoid:** DiagramContainer already includes `not-prose` class
**Warning signs:** Text sizing inconsistent, margins unexpected

### Pitfall 2: Forgetting client:load
**What goes wrong:** React components don't hydrate, tooltips don't work
**Why it happens:** Astro SSR requires explicit hydration directive
**How to avoid:** Always add `client:load` to diagram imports in MDX
**Warning signs:** Click handlers don't fire, no tooltip on hover

### Pitfall 3: Incorrect Import Paths
**What goes wrong:** Module not found errors
**Why it happens:** MDX files are 3 levels deep from components
**How to avoid:** Use `../../../components/diagrams/module4/` prefix
**Warning signs:** Build errors, red squiggles in editor

### Pitfall 4: Hardcoding Comparison Layout
**What goes wrong:** Comparison diagrams break on mobile
**Why it happens:** Fixed grid columns
**How to avoid:** Use `grid-cols-1 md:grid-cols-2` for responsive
**Warning signs:** Horizontal scroll on mobile, cramped layout

### Pitfall 5: Missing Tooltip Content
**What goes wrong:** Clicking node does nothing
**Why it happens:** DiagramTooltip wrapper present but no content prop
**How to avoid:** Every interactive FlowNode needs meaningful tooltip text
**Warning signs:** Empty tooltip popup, pointer cursor with no response

## Code Examples

### Complete Monitoring Pipeline Diagram

```tsx
// src/components/diagrams/module4/JmxMetricsDiagrams.tsx
import { DiagramContainer } from '../primitives/DiagramContainer';
import { DiagramTooltip } from '../primitives/Tooltip';
import { FlowNode } from '../primitives/FlowNode';
import { Arrow } from '../primitives/Arrow';

export function JmxMetricsPipelineDiagram() {
  return (
    <DiagramContainer
      title="JMX Metrics Pipeline"
      color="blue"
      description="Поток метрик от Debezium до визуализации"
    >
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <DiagramTooltip content={
          <div>
            <strong>Debezium Connector</strong>
            <p>Регистрирует метрики как JMX MBeans внутри JVM</p>
          </div>
        }>
          <FlowNode variant="database">Debezium</FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="MBeans" />

        <DiagramTooltip content={
          <div>
            <strong>JMX MBeans</strong>
            <p>Стандартный механизм мониторинга Java-приложений</p>
          </div>
        }>
          <FlowNode variant="connector">JMX</FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label=":9404" />

        <DiagramTooltip content={
          <div>
            <strong>JMX Exporter</strong>
            <p>Java agent, конвертирует JMX в Prometheus формат</p>
            <p>HTTP endpoint на порту 9404</p>
          </div>
        }>
          <FlowNode variant="connector" className="bg-amber-500/20 border-amber-400/30">
            JMX Exporter
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="/metrics" />

        <DiagramTooltip content={
          <div>
            <strong>Prometheus</strong>
            <p>Pull-модель: скрапит метрики каждые 15 секунд</p>
            <p>Хранит time series данные</p>
          </div>
        }>
          <FlowNode variant="sink">Prometheus</FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" />

        <DiagramTooltip content={
          <div>
            <strong>Grafana</strong>
            <p>Визуализация и dashboards</p>
            <p>Alerting rules</p>
          </div>
        }>
          <FlowNode variant="connector">Grafana</FlowNode>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}
```

### MDX Integration Example

```mdx
---
title: "JMX Метрики Debezium"
---

import { JmxMetricsPipelineDiagram, LagCalculationDiagram } from '../../../components/diagrams/module4/JmxMetricsDiagrams';

# JMX Метрики Debezium

## Архитектура JMX метрик

Debezium экспортирует метрики через JMX:

<JmxMetricsPipelineDiagram client:load />

## MilliSecondsBehindSource

<LagCalculationDiagram client:load />
```

## Suggested Wave Groupings

Given 24 diagrams across 7 files, recommend 3 plans:

### Plan 31-01 (Wave 1): Lessons 01-03 (8 diagrams)
- JmxMetricsDiagrams.tsx (4 diagrams)
- PrometheusCollectionDiagrams.tsx (1 diagram)
- GrafanaDashboardDiagrams.tsx (3 diagrams)
- **Theme:** Metrics collection and visualization

### Plan 31-02 (Wave 1): Lessons 04-05 (7 diagrams)
- AlertingDiagrams.tsx (4 diagrams)
- WalBloatHeartbeatDiagrams.tsx (3 diagrams)
- **Theme:** Alerting and WAL management

### Plan 31-03 (Wave 2): Lessons 06-07 + MDX Migration (9 diagrams)
- ConnectorScalingDiagrams.tsx (6 diagrams)
- DisasterRecoveryDiagrams.tsx (3 diagrams)
- Update all 7 MDX files to use glass components
- **Theme:** Scaling and recovery

## Russian Tooltip Content Examples

### JMX Metrics
- "MilliSecondsBehindSource - PRIMARY metric для lag мониторинга"
- "JMX Exporter конвертирует MBeans в Prometheus формат на порту 9404"
- "Scrape interval 15 секунд - оптимальный баланс между свежестью и нагрузкой"

### Alerting
- "Warning на 5s - время среагировать. Critical на 30s - SLO уже нарушен"
- "Duration (for clause) предотвращает ложные срабатывания на spike-и"
- "Alert fatigue - когда операторы игнорируют алерты из-за частых ложных срабатываний"

### WAL Bloat
- "Slot не продвигается если таблица не меняется - WAL накапливается"
- "max_slot_wal_keep_size - жесткий лимит, инвалидирует slot при превышении"
- "pg_logical_emit_message() - рекомендуемый подход для PostgreSQL 14+"

### Scaling
- "tasks.max игнорируется для PostgreSQL - WAL читается последовательно"
- "Performance ceiling ~7,000 events/sec per connector"
- "Downstream parallelization - масштабирование через Kafka partitions"

### Disaster Recovery
- "Состояние хранится в двух местах: connect-offsets (Kafka) и slot (PostgreSQL)"
- "wal_status='lost' означает point of no return - требуется полный resnapshot"
- "DR drill обязателен - практикуйте восстановление ежеквартально"

## Open Questions

1. **Custom FlowNode colors for severity**
   - What we know: Warning (yellow), Critical (orange), Emergency (red) need distinct colors
   - What's unclear: Should these be new variants or className overrides?
   - Recommendation: Use className overrides for one-off colors, keep variants limited

2. **Checklist representation in disaster-recovery**
   - What we know: 07-disaster-recovery has markdown checklist, not Mermaid
   - What's unclear: Should this become an interactive component?
   - Recommendation: Keep as markdown checklist - not a diagram migration concern

## Sources

### Primary (HIGH confidence)
- Module 4 MDX files (audited directly)
- Phase 30 RESEARCH.md (established patterns)
- Existing primitives source code (types.ts, FlowNode.tsx, SequenceDiagram.tsx)

### Secondary (MEDIUM confidence)
- Prior phase implementations (Module 2, Module 3 patterns)

## Metadata

**Confidence breakdown:**
- Diagram audit: HIGH - Direct file inspection
- Primitive mapping: HIGH - Established patterns from Phases 28-30
- Tooltip content: HIGH - Extracted from MDX text
- Wave groupings: MEDIUM - Based on complexity estimates

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (stable patterns)
