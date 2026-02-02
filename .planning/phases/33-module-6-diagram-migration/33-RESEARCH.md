# Phase 33: Module 6 Diagram Migration - Research

**Researched:** 2026-02-02
**Domain:** Data Engineering Integration (Streaming Architectures, PyFlink, PySpark)
**Confidence:** HIGH

## Summary

Module 6 (Data Engineering Integration) contains **26 Mermaid diagrams** across 7 lessons focused on advanced data engineering patterns: Python consumers, Pandas integration, PyFlink stream processing, PySpark Structured Streaming, ETL/ELT patterns, and ML feature engineering. This is the largest module in the course for diagram migration.

The diagrams showcase complex streaming architectures: multi-stage pipelines (Kafka → PyFlink/PySpark → sinks), batch vs streaming comparisons, watermark concepts, window aggregations, and ETL/ELT data flow patterns. These are fundamentally different from Module 5's linear SMT chains or Module 4's operational flowcharts—Module 6 diagrams are about **data flow through distributed systems**.

The good news: existing primitives (FlowNode, Arrow, DiagramContainer, SequenceDiagram) proven in Modules 1-5 are sufficient. The challenge: representing complex multi-layer architectures (Source → CDC → Kafka → Stream Processor → Sink) with clear separation of concerns and consistent terminology across Python/Flink/Spark ecosystems.

**Primary recommendation:** Use nested DiagramContainers for layered architectures (similar to Module 5 Outbox pattern), horizontal FlowNode chains for pipeline stages, side-by-side comparisons for Batch vs Streaming concepts, and SequenceDiagram for out-of-order event scenarios.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1+ | Component framework | Project standard, proven for Modules 1-5 |
| TypeScript | 5.3.3+ | Type safety | Existing primitives are typed |
| Astro MDX | 4.0+ | Content embedding | Course content standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| FlowNode primitive | Current | Pipeline stages (database, connector, app, sink) | All data flow nodes |
| Arrow primitive | Current | Data flow between stages | Connecting pipeline components |
| DiagramContainer | Current | Glass card wrapper for logical layers | Grouping architectures by concern |
| DiagramTooltip | Current | Hover/click explanations | Technical concepts (watermarks, windows, batching) |
| SequenceDiagram | Current | Time-based event flows | Out-of-order events, latency scenarios |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Nested DiagramContainers | New StreamPipeline component | Over-engineering; nesting already proven in Module 5 Outbox |
| FlowNode variants | Custom PyFlink/Spark nodes | Unnecessary; variant="app" with custom className works |
| Side-by-side for comparisons | Unified diagram with branching | Comparisons clearer when visually separated |

**Installation:**
```bash
# No new dependencies needed - reuse existing primitives
```

## Architecture Patterns

### Recommended Project Structure
```
src/components/diagrams/module6/
├── AdvancedConsumerDiagrams.tsx      # Lesson 01 (2 diagrams)
├── PandasIntegrationDiagrams.tsx     # Lesson 02 (1 diagram)
├── PyflinkConnectorDiagrams.tsx      # Lesson 03 (2 diagrams)
├── PyflinkStatefulDiagrams.tsx       # Lesson 04 (8 diagrams)
├── PysparkStreamingDiagrams.tsx      # Lesson 05 (4 diagrams)
├── EtlEltPatternDiagrams.tsx         # Lesson 06 (5 diagrams)
├── FeatureEngineeringDiagrams.tsx    # Lesson 07 (4 diagrams)
└── index.ts                          # Barrel export
```

### Pattern 1: Multi-Layer Data Pipeline (Nested Containers)
**What:** Vertical layered architecture showing data flow from source through processing to sink
**When to use:** Complex pipelines with distinct architectural layers (CDC Layer, Compute Layer, Storage Layer)
**Example:**
```typescript
// PyFlink CDC Pipeline architecture
<DiagramContainer title="PyFlink CDC Pipeline Architecture" color="purple">
  <div className="flex flex-col gap-6">
    {/* Source Layer */}
    <DiagramContainer title="Source Database" color="blue" className="flex-1">
      <FlowNode variant="database">PostgreSQL</FlowNode>
    </DiagramContainer>

    {/* CDC Layer */}
    <DiagramContainer title="CDC Stream" color="emerald" className="flex-1">
      <div className="flex items-center gap-3">
        <FlowNode variant="connector">Debezium</FlowNode>
        <Arrow direction="right" />
        <FlowNode variant="app">Kafka Topic</FlowNode>
      </div>
    </DiagramContainer>

    {/* Processing Layer */}
    <DiagramContainer title="PyFlink Job" color="purple" className="flex-1">
      <div className="flex flex-col items-center gap-2">
        <FlowNode variant="app">Kafka Connector</FlowNode>
        <Arrow direction="down" label="orders_cdc table" />
        <FlowNode variant="app">VIEW orders_current</FlowNode>
        <Arrow direction="down" label="extract after state" />
        <FlowNode variant="app">SQL Aggregations</FlowNode>
      </div>
    </DiagramContainer>

    {/* Sink Layer */}
    <DiagramContainer title="Output" color="rose" className="flex-1">
      <FlowNode variant="sink">Kafka / Database / File</FlowNode>
    </DiagramContainer>
  </div>
</DiagramContainer>
```

### Pattern 2: Batch vs Streaming Comparison (Side-by-Side)
**What:** Two separate architectures showing fundamental differences between approaches
**When to use:** Explaining conceptual differences (Pandas batch vs PyFlink streaming, ETL vs ELT)
**Example:**
```typescript
// Pandas vs PyFlink comparison
<div className="flex flex-col lg:flex-row gap-6">
  {/* Batch (Pandas) */}
  <DiagramContainer title="Pandas (Batch)" color="amber" className="flex-1">
    <div className="flex flex-col items-center gap-3">
      <FlowNode variant="app" size="sm">1. Накопить события</FlowNode>
      <Arrow direction="down" />
      <FlowNode variant="app" size="sm">2. Загрузить в DataFrame</FlowNode>
      <Arrow direction="down" />
      <FlowNode variant="app" size="sm">3. Обработать batch</FlowNode>
      <Arrow direction="down" />
      <FlowNode variant="app" size="sm">4. Записать результат</FlowNode>
    </div>
  </DiagramContainer>

  {/* Streaming (PyFlink) */}
  <DiagramContainer title="PyFlink (Streaming)" color="emerald" recommended className="flex-1">
    <div className="flex flex-col items-center gap-3">
      <FlowNode variant="app" size="sm">Непрерывный поток</FlowNode>
      <Arrow direction="down" />
      <FlowNode variant="app" size="sm">Event-by-event обработка</FlowNode>
      <Arrow direction="down" />
      <FlowNode variant="app" size="sm">Stateful агрегации</FlowNode>
      <Arrow direction="down" />
      <FlowNode variant="app" size="sm">Непрерывный вывод</FlowNode>
    </div>
  </DiagramContainer>
</div>
```

### Pattern 3: Out-of-Order Event Timeline (SequenceDiagram)
**What:** Temporal visualization showing events arriving out of order (event_time vs processing_time)
**When to use:** Explaining watermarks, late data handling, distributed system delays
**Example:**
```typescript
// Out-of-order events causing late data problem
<SequenceDiagram
  actors={[
    { id: 'kafka1', label: 'Kafka Partition 1', variant: 'queue' },
    { id: 'kafka2', label: 'Kafka Partition 2', variant: 'queue' },
    { id: 'flink', label: 'PyFlink', variant: 'service' },
    { id: 'output', label: 'Aggregation Result', variant: 'database' }
  ]}
  messages={[
    { id: '1', from: 'kafka2', to: 'flink', label: 'E2 (10:01) arrives first' },
    { id: '2', from: 'kafka1', to: 'flink', label: 'E3 (10:02) arrives second' },
    { id: '3', from: 'flink', to: 'output', label: 'Window 10:00-10:05 closed' },
    { id: '4', from: 'kafka1', to: 'flink', label: 'E1 (10:00) arrives LATE!', variant: 'async' }
  ]}
  messageSpacing={50}
/>
```

### Pattern 4: Horizontal Pipeline Chain (Similar to SMT)
**What:** Left-to-right flow showing sequential processing stages
**When to use:** Linear pipelines (Read → Parse → Transform → Write)
**Example:**
```typescript
// PySpark Structured Streaming pipeline
<DiagramContainer title="PySpark CDC Pipeline" color="purple">
  <div className="flex items-center gap-4 flex-wrap justify-center">
    <DiagramTooltip content="Kafka source с CDC событиями в Debezium envelope формате">
      <FlowNode variant="app" tabIndex={0}>Kafka Source</FlowNode>
    </DiagramTooltip>

    <Arrow direction="right" label="raw JSON" />

    <DiagramTooltip content="from_json() парсит binary value в StructType схему">
      <FlowNode variant="app" className="border-blue-400" tabIndex={0}>Parse JSON</FlowNode>
    </DiagramTooltip>

    <Arrow direction="right" label="structured DataFrame" />

    <DiagramTooltip content="Извлекаем after state, применяем watermark для handling late data">
      <FlowNode variant="app" className="border-purple-400" tabIndex={0}>Transform</FlowNode>
    </DiagramTooltip>

    <Arrow direction="right" label="aggregated results" />

    <DiagramTooltip content="writeStream в Parquet с date partitioning для efficient queries">
      <FlowNode variant="sink" className="border-emerald-400" tabIndex={0}>Parquet Sink</FlowNode>
    </DiagramTooltip>
  </div>
</DiagramContainer>
```

### Pattern 5: Decision Tree for Architecture Choice
**What:** Vertical flowchart with branching decisions leading to recommendations
**When to use:** Choosing between technologies (PyFlink vs PySpark, ETL vs ELT)
**Example:**
```typescript
// PyFlink vs PySpark decision framework
<DiagramContainer title="Выбор Stream Processing Framework" color="purple">
  <div className="flex flex-col items-center gap-4">
    <FlowNode variant="app">Use Case</FlowNode>
    <Arrow direction="down" />

    <DiagramTooltip content="Latency требования определяют выбор engine">
      <FlowNode variant="app" className="border-amber-400" tabIndex={0}>
        Latency Requirements?
      </FlowNode>
    </DiagramTooltip>

    <div className="flex gap-8 mt-4">
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm font-semibold text-emerald-400">менее 100ms</div>
        <Arrow direction="down" />
        <DiagramTooltip content="PyFlink для low latency, exactly-once, complex CEP">
          <FlowNode variant="app" className="border-emerald-400" tabIndex={0}>
            PyFlink
            <span className="block text-xs text-gray-400 mt-1">Low latency</span>
          </FlowNode>
        </DiagramTooltip>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="text-sm font-semibold text-blue-400">1-10 seconds</div>
        <Arrow direction="down" />
        <DiagramTooltip content="PySpark для data lake integration, ML pipelines, unified batch/stream">
          <FlowNode variant="app" className="border-blue-400" tabIndex={0}>
            PySpark
            <span className="block text-xs text-gray-400 mt-1">Micro-batching</span>
          </FlowNode>
        </DiagramTooltip>
      </div>
    </div>
  </div>
</DiagramContainer>
```

### Pattern 6: Window Aggregation Timeline (Gantt-style visualization)
**What:** Timeline showing window boundaries and event placement
**When to use:** Explaining tumbling/sliding/session windows, watermark progress
**Note:** Mermaid gantt charts don't have direct primitive equivalent
**Alternative:** Use horizontal FlowNodes with spacing to represent time buckets
```typescript
// Tumbling windows visualization (5-minute windows)
<DiagramContainer title="Tumbling Windows (5 минут)" color="blue">
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-2">
      <DiagramTooltip content="Window 1: события с event_time между 10:00-10:05">
        <FlowNode variant="app" size="sm" className="border-blue-400" tabIndex={0}>
          10:00-10:05
          <span className="block text-xs text-emerald-400 mt-1">Window 1</span>
        </FlowNode>
      </DiagramTooltip>

      <DiagramTooltip content="Window 2: события с event_time между 10:05-10:10">
        <FlowNode variant="app" size="sm" className="border-purple-400" tabIndex={0}>
          10:05-10:10
          <span className="block text-xs text-emerald-400 mt-1">Window 2</span>
        </FlowNode>
      </DiagramTooltip>

      <DiagramTooltip content="Window 3: события с event_time между 10:10-10:15">
        <FlowNode variant="app" size="sm" className="border-amber-400" tabIndex={0}>
          10:10-10:15
          <span className="block text-xs text-emerald-400 mt-1">Window 3</span>
        </FlowNode>
      </DiagramTooltip>
    </div>

    <div className="text-xs text-gray-400">
      Неперекрывающиеся окна фиксированного размера. Каждое событие попадает ровно в одно окно.
    </div>
  </div>
</DiagramContainer>
```

### Anti-Patterns to Avoid
- **Over-nesting containers:** Keep maximum 3 levels (outer container → layer containers → content). More = visual clutter.
- **Missing technology labels:** Each FlowNode should indicate what it represents (Kafka, PyFlink, PySpark, Redis, Parquet).
- **Inconsistent arrow labels:** Data flow arrows must show what format flows (raw events, DataFrame, aggregated results).
- **Mixing perspectives:** Don't mix logical architecture (layers) with physical deployment (servers) in same diagram.
- **English technical terms:** Maintain Russian tooltips consistent with course language, but keep English for code/library names.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gantt-style window timeline | Custom Timeline component | Horizontal FlowNode chain with color-coding | Gantt charts are visual sugar; buckets convey same info |
| Technology-specific node variants | PyflinkNode, PysparkNode components | FlowNode with custom className | className override sufficient for branding |
| Complex nested pipeline | Custom StreamArchitecture component | Nested DiagramContainers | Module 5 Outbox pattern already proven this works |
| Before/after state comparison | New ComparisonView | Side-by-side DiagramContainers | Module 3/5 pattern, consistent styling |

**Key insight:** Module 6 diagrams are compositionally complex but primitively simple. The complexity comes from **nesting and layout**, not from requiring new components. Resist the urge to create "StreamPipeline" or "DataFlowGraph" components—compose with existing primitives.

## Common Pitfalls

### Pitfall 1: Overcomplicating Multi-Layer Architectures
**What goes wrong:** Trying to show entire stack (DB → CDC → Kafka → Flink → Window → Sink → Downstream) in single flat diagram
**Why it happens:** Desire to show complete picture in one view
**How to avoid:** Break into separate diagrams by concern: (1) Data capture layer, (2) Processing layer, (3) Storage layer
**Warning signs:** More than 10 FlowNodes in single DiagramContainer, arrows crossing multiple layers

### Pitfall 2: Confusing Event Time vs Processing Time
**What goes wrong:** Diagrams don't clearly distinguish between when event happened (event_time) and when it was processed (processing_time)
**Why it happens:** Watermark and late data concepts are inherently temporal
**How to avoid:** Use SequenceDiagram for temporal flows, explicitly label arrows with time context
**Warning signs:** Watermark explanations that don't show time progression

### Pitfall 3: Inconsistent Technology Naming
**What goes wrong:** Mixing library names (apache-flink vs PyFlink vs Flink Table API) without consistency
**Why it happens:** Module 6 introduces many new technologies with multiple naming variants
**How to avoid:** Establish glossary: PyFlink (Python API), PySpark (Python API), Kafka Connector (generic), Pandas DataFrame
**Warning signs:** Tooltip using "Flink" when node says "PyFlink", or vice versa

### Pitfall 4: Missing Batch vs Streaming Context
**What goes wrong:** Presenting streaming patterns without explaining why not batch
**Why it happens:** Assuming reader understands streaming value proposition
**How to avoid:** Use side-by-side comparison pattern for Pandas (batch) vs PyFlink (stream) in early lessons
**Warning signs:** Introducing watermarks without first explaining out-of-order event problem

### Pitfall 5: Unclear Data Format in Pipeline Arrows
**What goes wrong:** Arrows between pipeline stages without labels showing data format
**Why it happens:** Assuming format is obvious from context
**How to avoid:** Every arrow must have label: "raw JSON", "structured DataFrame", "aggregated results", "Parquet files"
**Warning signs:** Arrow with no label property in code

### Pitfall 6: Ignoring Russian Terminology Consistency
**What goes wrong:** Mixing English and Russian in tooltips, or using different Russian translations for same concept across lessons
**Why it happens:** Module 6 introduces many new concepts not present in earlier modules
**How to avoid:** Establish and maintain terminology glossary (see Code Examples section)
**Warning signs:** "Batch" translated as "пакет" in one lesson, "batch" left untranslated in another

## Code Examples

Verified patterns from Module 5 adapted for Module 6:

### Multi-Layer Architecture (PyFlink CDC Pipeline)
```typescript
// From PyflinkConnectorDiagrams.tsx
export function PyflinkCdcArchitectureDiagram() {
  return (
    <DiagramContainer
      title="Архитектура PyFlink CDC Pipeline"
      color="purple"
      description="Полный data flow от PostgreSQL до sink через PyFlink Table API"
    >
      <div className="flex flex-col gap-6">
        {/* Source Layer */}
        <DiagramContainer title="PostgreSQL" color="blue" className="flex-1">
          <DiagramTooltip content="Источник CDC событий. Генерирует изменения через WAL (Write-Ahead Log).">
            <FlowNode variant="database" tabIndex={0}>orders table</FlowNode>
          </DiagramTooltip>
        </DiagramContainer>

        <Arrow direction="down" label="CDC events" />

        {/* CDC Layer */}
        <DiagramContainer title="Debezium Connector" color="emerald" className="flex-1">
          <div className="flex items-center gap-3 justify-center">
            <DiagramTooltip content="Debezium читает WAL и конвертирует в Debezium envelope формат (before, after, op, ts_ms, source).">
              <FlowNode variant="connector" tabIndex={0}>CDC events</FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <Arrow direction="down" label="Publish" />

        {/* Kafka Layer */}
        <DiagramContainer title="Kafka" color="rose" className="flex-1">
          <DiagramTooltip content="Kafka topic хранит Debezium envelope события. Durable log для stream processing.">
            <FlowNode variant="app" tabIndex={0}>
              dbserver1.public.orders
              <span className="block text-xs text-gray-400 mt-1">Debezium envelope</span>
            </FlowNode>
          </DiagramTooltip>
        </DiagramContainer>

        <Arrow direction="down" label="Read stream" />

        {/* PyFlink Processing Layer */}
        <DiagramContainer title="PyFlink Job" color="purple" className="flex-1">
          <div className="flex flex-col items-center gap-3">
            <DiagramTooltip content="Kafka Connector через SQL DDL: CREATE TABLE orders_cdc (...) WITH ('connector' = 'kafka', ...).">
              <FlowNode variant="app" className="border-purple-400" tabIndex={0}>
                Kafka Connector
                <span className="block text-xs text-gray-400 mt-1">orders_cdc table</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip content="VIEW orders_current извлекает payload.after для c/u/r операций. Фильтрует DELETE (op='d').">
              <FlowNode variant="app" className="border-blue-400" tabIndex={0}>
                VIEW orders_current
                <span className="block text-xs text-gray-400 mt-1">extract after state</span>
              </FlowNode>
            </DiagramTooltip>

            <Arrow direction="down" />

            <DiagramTooltip content="SQL Query для aggregations, joins, windowing. Table API оптимизирует execution plan.">
              <FlowNode variant="app" className="border-emerald-400" tabIndex={0}>
                SQL Query
                <span className="block text-xs text-gray-400 mt-1">aggregations/joins</span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </DiagramContainer>

        <Arrow direction="down" />

        {/* Sink Layer */}
        <DiagramContainer title="Output" color="amber" className="flex-1">
          <DiagramTooltip content="Результаты пишутся в Kafka topic, database или file system в зависимости от sink connector.">
            <FlowNode variant="sink" tabIndex={0}>
              Kafka topic / Database / File
            </FlowNode>
          </DiagramTooltip>
        </DiagramContainer>
      </div>
    </DiagramContainer>
  );
}
```

### Batch vs Streaming Comparison
```typescript
// From PandasIntegrationDiagrams.tsx
export function PandasVsFlinkComparisonDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Pandas Batch */}
      <DiagramContainer
        title="Pandas (Batch)"
        color="amber"
        className="flex-1"
        description="Накопить события → обработать batch → записать"
      >
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip content="Накопить N событий из Kafka (polling loop до достижения batch size).">
            <FlowNode variant="app" size="sm" tabIndex={0}>
              1. Накопить события
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Загрузить в Pandas DataFrame через cdc_events_to_dataframe() функцию.">
            <FlowNode variant="app" size="sm" tabIndex={0}>
              2. Загрузить в DataFrame
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Применить groupBy, agg, filter к DataFrame. Batch операции.">
            <FlowNode variant="app" size="sm" tabIndex={0}>
              3. Обработать batch
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Записать результаты в target (database, file). Повторить цикл для следующего batch.">
            <FlowNode variant="app" size="sm" tabIndex={0}>
              4. Записать результат
            </FlowNode>
          </DiagramTooltip>

          <div className="mt-4 text-xs text-gray-400">
            Latency: минуты/часы (batch interval)
          </div>
        </div>
      </DiagramContainer>

      {/* PyFlink Streaming */}
      <DiagramContainer
        title="PyFlink (Streaming)"
        color="emerald"
        recommended
        className="flex-1"
        description="Непрерывная обработка event-by-event с stateful aggregations"
      >
        <div className="flex flex-col items-center gap-3">
          <DiagramTooltip content="Kafka Connector читает события непрерывно (unbounded stream).">
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Непрерывный поток
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Обработка каждого события по мере прибытия. Micro-batch или event-by-event.">
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Event-by-event обработка
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Stateful aggregations с управляемым состоянием. Flink сохраняет state между событиями.">
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Stateful агрегации
            </FlowNode>
          </DiagramTooltip>

          <Arrow direction="down" />

          <DiagramTooltip content="Результаты пишутся непрерывно в sink. Changelog stream (+I, -U, +U, -D).">
            <FlowNode variant="app" size="sm" tabIndex={0}>
              Непрерывный вывод
            </FlowNode>
          </DiagramTooltip>

          <div className="mt-4 text-xs text-emerald-400">
            Latency: миллисекунды/секунды
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}
```

### Out-of-Order Events Sequence
```typescript
// From PyflinkStatefulDiagrams.tsx
export function OutOfOrderEventsSequenceDiagram() {
  return (
    <DiagramContainer
      title="Out-of-Order Events: Проблема поздних данных"
      color="amber"
      description="Distributed systems доставляют события не в порядке event_time"
    >
      <SequenceDiagram
        actors={[
          { id: 'db', label: 'PostgreSQL', variant: 'database', tooltip: 'Генерирует события в порядке transaction commit' },
          { id: 'k1', label: 'Kafka Partition 1', variant: 'queue', tooltip: 'Partition 1 с network delay' },
          { id: 'k2', label: 'Kafka Partition 2', variant: 'queue', tooltip: 'Partition 2 без задержки' },
          { id: 'flink', label: 'PyFlink', variant: 'service', tooltip: 'Stream processor читает из обоих partitions' }
        ]}
        messages={[
          { id: '1', from: 'db', to: 'k1', label: 'E1 (event_time=10:00)', tooltip: 'Первое событие отправлено в K1' },
          { id: '2', from: 'db', to: 'k2', label: 'E2 (event_time=10:01)', tooltip: 'Второе событие в K2' },
          { id: '3', from: 'db', to: 'k1', label: 'E3 (event_time=10:02)', tooltip: 'Третье событие в K1' },
          { id: '4', from: 'k2', to: 'flink', label: 'E2 (10:01) arrives first', variant: 'async', tooltip: 'K2 доставил раньше из-за отсутствия задержки' },
          { id: '5', from: 'k1', to: 'flink', label: 'E3 (10:02) arrives second', variant: 'async', tooltip: 'E3 прибыл раньше E1!' },
          { id: '6', from: 'k1', to: 'flink', label: 'E1 (10:00) arrives LATE!', tooltip: 'E1 задержался из-за network delay на K1' }
        ]}
        messageSpacing={60}
      />
      <div className="mt-4 text-xs text-gray-400">
        Processing time порядок: E2 → E3 → E1<br />
        Event time порядок: E1 → E2 → E3<br />
        <span className="text-amber-400">Без watermark E1 может быть отброшен как late event!</span>
      </div>
    </DiagramContainer>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Mermaid static diagrams | Glass primitive components | Phase 26-28 (v1.4) | Interactive tooltips, consistent styling |
| Inline Mermaid code | Separate component files | Phase 28-32 | Better maintainability, reusability |
| English tooltips | Russian tooltips | Phase 26+ | Consistency with course language |
| Hover-only tooltips | Click + hover tooltips | Phase 26-02 | Mobile accessibility, Safari compatibility |
| Module-specific primitives | Shared primitives from /primitives | Phase 28+ | DRY, consistent UX across modules |

**Deprecated/outdated:**
- Mermaid flowchart/sequence/gantt syntax in MDX: Replaced with React glass components
- Inline diagram definitions: Moved to organized component files in module6/
- Gantt charts for windows: Replaced with horizontal FlowNode chains (simpler, more flexible)

## Module 6 Terminology Glossary (Russian)

For consistent tooltip content across all lessons:

| English | Russian | Context | Notes |
|---------|---------|---------|-------|
| **Consumer** | Консьюмер | Kafka consumer | Keep English for code (consumer.poll()), Russian in explanations |
| **DataFrame** | DataFrame | Pandas/PySpark | Leave as is (technical term) |
| **Batch processing** | Пакетная обработка | Pandas, periodic ETL | "batch" = пакет |
| **Stream processing** | Потоковая обработка | PyFlink, PySpark Streaming | "stream" = поток |
| **Watermark** | Watermark (маркер прогресса) | Late data handling | Leave English, add Russian explanation |
| **Late data** | Поздние данные | Out-of-order events | Данные с event_time < watermark |
| **Event time** | Event time (время события) | When event occurred | vs Processing time |
| **Processing time** | Processing time (время обработки) | When event processed | vs Event time |
| **Window** | Окно | Tumbling, sliding, session | "окно агрегации" |
| **Tumbling window** | Tumbling window (неперекрывающееся окно) | Fixed-size, non-overlapping | |
| **Sliding window** | Sliding window (скользящее окно) | Fixed-size, overlapping | |
| **Session window** | Session window (окно сессии) | Gap-based, dynamic size | |
| **Micro-batching** | Micro-batching (микропакеты) | PySpark processing mode | |
| **Continuous processing** | Continuous processing | Experimental low-latency | |
| **ETL** | ETL (Extract-Transform-Load) | Traditional pipeline | Transform before load |
| **ELT** | ELT (Extract-Load-Transform) | Modern pipeline | Load raw, transform in warehouse |
| **Data Lake** | Data Lake (озеро данных) | Raw data storage | Parquet, Delta, Iceberg |
| **Feature Store** | Feature Store (хранилище признаков) | ML features | Online (Redis) + Offline (Parquet) |
| **Feature Engineering** | Feature Engineering (разработка признаков) | ML features from CDC | |
| **Parquet** | Parquet | Columnar format | Leave as is |
| **Delta Lake** | Delta Lake | ACID data lake | Leave as is |
| **Checkpoint** | Checkpoint | Fault tolerance | "контрольная точка" for state |

## Diagram Inventory by Lesson

| Lesson | File | Diagrams | Primary Concepts | Complexity |
|--------|------|----------|------------------|------------|
| 01 | advanced-python-consumer.mdx | 2 | At-least-once vs exactly-once, rebalancing | Medium |
| 02 | pandas-integration.mdx | 1 | CDC event structure flattening | Low |
| 03 | pyflink-cdc-connector.mdx | 2 | Pandas vs PyFlink, PyFlink architecture | Medium |
| 04 | pyflink-stateful-processing.mdx | 8 | Stateful operations, watermarks, out-of-order events, windows | **High** |
| 05 | pyspark-structured-streaming.mdx | 4 | PySpark vs PyFlink, watermark late data, micro-batching | High |
| 06 | etl-elt-patterns.mdx | 5 | ETL vs ELT, CDC data lake, operation separation | High |
| 07 | feature-engineering.mdx | 4 | Batch vs real-time features, pipeline layers | High |

**Total:** 26 diagrams

**Complexity breakdown:**
- **Low:** 1 diagram (simple structure flattening)
- **Medium:** 4 diagrams (comparisons, basic architectures)
- **High:** 21 diagrams (multi-layer systems, temporal flows, distributed concepts)

**Key insight:** Module 6 has highest proportion of high-complexity diagrams. This reflects the advanced nature of stream processing and distributed systems concepts.

## Recommended Plan Structure

Given 26 diagrams across 7 files with varying complexity, split into 4 plans:

**Plan 33-01 (Python Foundations):** Lessons 01-02 (3 diagrams)
- AdvancedConsumerDiagrams.tsx (2 from lesson 01)
- PandasIntegrationDiagrams.tsx (1 from lesson 02)
- Rationale: Foundational concepts, relatively simple diagrams

**Plan 33-02 (PyFlink Streaming):** Lessons 03-04 (10 diagrams)
- PyflinkConnectorDiagrams.tsx (2 from lesson 03)
- PyflinkStatefulDiagrams.tsx (8 from lesson 04)
- Rationale: Largest lesson (8 diagrams), complex watermark/window concepts deserve focused attention

**Plan 33-03 (PySpark & ETL):** Lessons 05-06 (9 diagrams)
- PysparkStreamingDiagrams.tsx (4 from lesson 05)
- EtlEltPatternDiagrams.tsx (5 from lesson 06)
- Rationale: PySpark and ETL/ELT patterns are conceptually related (data lake focus)

**Plan 33-04 (Feature Engineering & MDX):** Lesson 07 + all MDX migration (4 diagrams)
- FeatureEngineeringDiagrams.tsx (4 from lesson 07)
- Update all 7 MDX files to import glass components
- Remove all Mermaid code blocks
- Rationale: Final ML-focused lesson + complete MDX cleanup across module

## Open Questions

None. All architectural patterns map to proven primitives from Modules 1-5.

**Note on Gantt charts:** Mermaid gantt charts (used for window timeline visualization in lesson 04) don't have direct primitive equivalent. Research recommends horizontal FlowNode chains with color-coding to represent time buckets—this is actually **clearer** than gantt bars for explaining windowing concepts.

## Sources

### Primary (HIGH confidence)
- Existing codebase: src/components/diagrams/module5/*.tsx (SMT multi-step patterns)
- Existing codebase: src/components/diagrams/module4/*.tsx (operational flowcharts, sequences)
- Existing codebase: src/components/diagrams/primitives/*.tsx (primitive APIs)
- Module 6 MDX content: 7 lessons with 26 Mermaid diagrams audited
- Prior phase research: 32-RESEARCH.md (Module 5 patterns)

### Secondary (MEDIUM confidence)
- Phase 31 RESEARCH.md: Similar multi-layer architecture patterns for Module 4

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Reusing proven Module 1-5 primitives
- Architecture patterns: HIGH - Direct application of established patterns (nested containers from Module 5, side-by-side from Module 3)
- Pitfalls: HIGH - Based on actual Module 1-5 migration experience
- Diagram inventory: HIGH - Manual audit of all 7 Module 6 lessons

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - stable domain)

---

## Key Findings for Planner

1. **26 diagrams total:** Largest module for diagram migration (previous max: Module 3 with 49, but simpler diagrams)
2. **High complexity ratio:** 21/26 diagrams are high complexity (multi-layer architectures, distributed systems)
3. **No new primitives needed:** All patterns map to existing primitives (FlowNode, Arrow, DiagramContainer, SequenceDiagram)
4. **Nested containers key pattern:** Multi-layer architectures use nested DiagramContainers (Source → CDC → Processing → Sink)
5. **Side-by-side comparisons critical:** Batch vs Stream concepts require visual separation, not branching
6. **SequenceDiagram for temporal flows:** Out-of-order events and watermark concepts need time-based visualization
7. **Gantt charts → FlowNode chains:** Window timelines better represented as horizontal node chains than gantt bars
8. **4-plan split recommended:** Python Foundations → PyFlink (largest) → PySpark/ETL → ML + MDX
9. **Russian terminology expansion:** Module 6 introduces many new terms not in Modules 1-5 (watermark, micro-batching, feature store)
10. **Technology branding via className:** PyFlink/PySpark use same FlowNode variant="app" but different className for visual distinction
