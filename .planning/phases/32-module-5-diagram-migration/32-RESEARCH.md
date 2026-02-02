# Phase 32: Module 5 Diagram Migration - Research

**Researched:** 2026-02-02
**Domain:** SMT (Single Message Transformations) diagram migration
**Confidence:** HIGH

## Summary

Module 5 contains 21 Mermaid diagrams across 8 lessons focused on SMT (Single Message Transformations) patterns. These diagrams visualize multi-step transformation pipelines, which are the core challenge mentioned in STATE.md: "SMT chain diagrams (Module 5) may need specialized multi-step components."

The research confirms that existing primitives (FlowNode, Arrow, SequenceDiagram, DiagramContainer) are sufficient for all Module 5 diagrams. No specialized components needed. SMT chains are best represented as horizontal flowcharts with transformation nodes connected by arrows, similar to Module 3's data flow patterns.

Key insight: SMT diagrams are conceptually simpler than Module 3's complex sequence diagrams. The "multi-step" nature maps cleanly to horizontal FlowNode chains with labeled arrows showing data transformation stages.

**Primary recommendation:** Use horizontal FlowNode chains for SMT pipelines, with color-coding to distinguish transformation types (filter=rose, unwrap=blue, route=purple, mask=amber).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1+ | Component framework | Already in project, proven for Module 1-4 |
| TypeScript | 5.3.3+ | Type safety | Existing primitives are typed |
| Astro MDX | 4.0+ | Content embedding | Project standard for course content |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| FlowNode primitive | Current | SMT transformation nodes | All transformation steps in pipelines |
| Arrow primitive | Current | Data flow between steps | Connecting transformations |
| SequenceDiagram primitive | Current | Time-based SMT execution | When showing temporal order matters |
| DiagramContainer | Current | Glass card wrapper | Grouping related transformations |
| DiagramTooltip | Current | Hover/click explanations | SMT-specific parameter details |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Horizontal FlowNode chains | New SMTPipeline component | Over-engineering; FlowNode already handles this |
| SequenceDiagram for execution | Timeline component | Sequence already proven in Module 3 |
| Custom colors per SMT | Extend FlowNode variants | Color override via className sufficient |

**Installation:**
```bash
# No new dependencies needed - reuse existing primitives
```

## Architecture Patterns

### Recommended Project Structure
```
src/components/diagrams/module5/
├── SmtOverviewDiagrams.tsx          # Lesson 01 (5 diagrams)
├── PredicateFilterDiagrams.tsx      # Lesson 02 (3 diagrams)
├── PiiMaskingDiagrams.tsx           # Lesson 03 (2 diagrams)
├── ContentRoutingDiagrams.tsx       # Lesson 04 (3 diagrams)
├── OutboxPatternDiagrams.tsx        # Lesson 05 (4 diagrams)
├── OutboxImplementationDiagrams.tsx # Lesson 06 (1 diagram)
├── SchemaRegistryDiagrams.tsx       # Lesson 07 (1 diagram)
├── SchemaEvolutionDiagrams.tsx      # Lesson 08 (2 diagrams)
└── index.ts                         # Barrel export
```

### Pattern 1: SMT Chain Pipeline (Horizontal Flow)
**What:** Multi-step transformation represented as left-to-right FlowNode chain
**When to use:** Showing SMT execution order (Filter → Unwrap → Route → Mask)
**Example:**
```typescript
// Horizontal SMT chain with color-coded transformation types
<div className="flex items-center gap-4">
  <FlowNode variant="connector" className="border-rose-400">
    Filter
  </FlowNode>
  <Arrow direction="right" label="envelope" />
  <FlowNode variant="connector" className="border-blue-400">
    Unwrap
  </FlowNode>
  <Arrow direction="right" label="flat JSON" />
  <FlowNode variant="connector" className="border-purple-400">
    Route
  </FlowNode>
  <Arrow direction="right" label="topic change" />
  <FlowNode variant="connector" className="border-amber-400">
    Mask
  </FlowNode>
</div>
```

### Pattern 2: Before/After Comparison (Side-by-Side)
**What:** Two DiagramContainers showing data transformation result
**When to use:** Demonstrating SMT effect (e.g., envelope before unwrap vs after)
**Example:**
```typescript
<div className="flex flex-col lg:flex-row gap-6">
  <DiagramContainer title="Before Unwrap" color="rose" className="flex-1">
    {/* Complex Debezium envelope structure */}
  </DiagramContainer>
  <DiagramContainer title="After Unwrap" color="emerald" className="flex-1">
    {/* Simplified flat JSON */}
  </DiagramContainer>
</div>
```

### Pattern 3: Decision Tree (Predicate Evaluation)
**What:** Nested FlowNodes with conditional paths
**When to use:** Showing predicate logic (if topic matches → apply SMT, else skip)
**Example:**
```typescript
<FlowNode variant="app">
  Message
  <div className="mt-4 flex gap-4">
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-emerald-400">TRUE</div>
      <FlowNode variant="connector" size="sm">Apply SMT</FlowNode>
    </div>
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-gray-400">FALSE</div>
      <FlowNode variant="app" size="sm">Pass through</FlowNode>
    </div>
  </div>
</FlowNode>
```

### Pattern 4: Sequence Diagram for Execution Flow
**What:** SequenceDiagram showing temporal order of SMT execution
**When to use:** When timing/order matters (e.g., showing SMT latency contribution)
**Example:**
```typescript
<SequenceDiagram
  actors={[
    { id: 'debezium', label: 'Debezium', variant: 'service' },
    { id: 'filter', label: 'Filter SMT', variant: 'service' },
    { id: 'unwrap', label: 'Unwrap SMT', variant: 'service' },
    { id: 'kafka', label: 'Kafka', variant: 'queue' }
  ]}
  messages={[
    { id: '1', from: 'debezium', to: 'filter', label: 'CDC event' },
    { id: '2', from: 'filter', to: 'unwrap', label: 'Filtered event' },
    { id: '3', from: 'unwrap', to: 'kafka', label: 'Flattened event' }
  ]}
  messageSpacing={40}
/>
```

### Pattern 5: Multi-Tenant Routing (Content-Based)
**What:** Single source splitting into multiple destinations based on field value
**When to use:** Showing ContentBasedRouter SMT (tenant_id → topic routing)
**Example:**
```typescript
<div className="flex flex-col items-center gap-4">
  <FlowNode variant="database">PostgreSQL (multi-tenant)</FlowNode>
  <Arrow direction="down" />
  <FlowNode variant="connector">ContentBasedRouter</FlowNode>
  <div className="flex gap-4 mt-4">
    <div className="flex flex-col items-center gap-2">
      <Arrow direction="down" label="tenant=acme" />
      <FlowNode variant="app" className="border-blue-400">orders-acme</FlowNode>
    </div>
    <div className="flex flex-col items-center gap-2">
      <Arrow direction="down" label="tenant=globex" />
      <FlowNode variant="app" className="border-purple-400">orders-globex</FlowNode>
    </div>
  </div>
</div>
```

### Pattern 6: Outbox Pattern (Transaction + CDC)
**What:** Vertical flow showing transactional write → CDC capture → Kafka publish
**When to use:** Demonstrating Outbox Event Router SMT pattern
**Example:**
```typescript
<div className="flex flex-col items-center gap-4">
  <FlowNode variant="app">Application</FlowNode>
  <Arrow direction="down" label="BEGIN TX" />
  <div className="flex gap-4">
    <FlowNode variant="database" size="sm">Update orders</FlowNode>
    <FlowNode variant="database" size="sm">Insert outbox</FlowNode>
  </div>
  <Arrow direction="down" label="COMMIT" />
  <FlowNode variant="connector">Debezium CDC</FlowNode>
  <Arrow direction="down" label="Outbox Event Router" />
  <FlowNode variant="app">Kafka topic</FlowNode>
</div>
```

### Anti-Patterns to Avoid
- **Over-complicated nesting:** Keep transformation chains linear (horizontal) for readability
- **Missing labels on arrows:** Every arrow must show what data format flows through it
- **Inconsistent colors:** Use established color scheme (rose=filter, blue=unwrap, purple=route, amber=mask)
- **Sequence diagrams for static transforms:** Use sequence only when timing matters, otherwise use flowchart

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-step transformation visualization | Custom SMTPipeline component | Horizontal FlowNode chain | Already proven pattern, no new abstraction needed |
| Before/after comparison | Custom ComparisonView | Side-by-side DiagramContainers | Module 3 pattern, consistent styling |
| Conditional routing | Custom RouterDiagram | Nested FlowNodes with flex layout | Decision tree pattern from Module 4 |
| Timeline of SMT execution | Custom TimelineComponent | SequenceDiagram primitive | Already handles temporal ordering |

**Key insight:** Module 5 diagrams are conceptually simpler than Module 3's complex sequences. The "SMT chain" concept maps directly to horizontal FlowNode chains—no new abstractions needed.

## Common Pitfalls

### Pitfall 1: Treating SMT Chains as Sequences
**What goes wrong:** Using SequenceDiagram for every SMT chain visualization
**Why it happens:** Misunderstanding that SMT order is logical, not necessarily temporal
**How to avoid:** Use horizontal FlowNode chains for logical pipelines; reserve SequenceDiagram for when timing/latency matters
**Warning signs:** Sequence diagram with no timing labels, arrows that don't show temporal causation

### Pitfall 2: Over-Engineering Color Schemes
**What goes wrong:** Creating new FlowNode variants for each SMT type (filterNode, unwrapNode, routeNode)
**Why it happens:** Desire for type safety and consistency
**How to avoid:** Use className overrides with established color palette (rose/blue/purple/amber)
**Warning signs:** Modifying primitives/types.ts to add SMT-specific variants

### Pitfall 3: Nested Complexity in Outbox Diagrams
**What goes wrong:** Trying to show entire outbox pattern (app + DB + CDC + SMT + Kafka) in single nested diagram
**Why it happens:** Desire to show complete picture in one view
**How to avoid:** Break into multiple diagrams: (1) Transaction flow, (2) CDC capture, (3) SMT transformation
**Warning signs:** More than 3 levels of nested DiagramContainers

### Pitfall 4: Missing Data Format Labels
**What goes wrong:** Arrows between SMT nodes without labels showing what data format flows
**Why it happens:** Assuming reader knows implicit transformations
**How to avoid:** Every arrow must have label: "envelope" → "flat JSON" → "masked data"
**Warning signs:** Arrow with no label property in code

### Pitfall 5: Inconsistent Tooltip Russian Language
**What goes wrong:** Mixing English and Russian in tooltips, or inconsistent terminology
**Why it happens:** Copy-paste from different sources
**How to avoid:** Establish glossary: SMT = "Трансформация", Filter = "Фильтр", Unwrap = "Разворачивание"
**Warning signs:** Tooltip content with English technical terms not translated

## Code Examples

Verified patterns from Module 3/4 migrations:

### SMT Chain with Tooltips
```typescript
// From SmtOverviewDiagrams.tsx
export function SmtChainOrderDiagram() {
  return (
    <DiagramContainer
      title="Стандартный порядок SMT Chain"
      color="purple"
    >
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <DiagramTooltip content="Filter SMT отбрасывает события по условию (Groovy). Работает с Debezium envelope — имеет доступ к value.op, value.after. Применяется раньше всего для уменьшения объема данных.">
          <FlowNode variant="connector" className="border-rose-400" tabIndex={0}>
            1. Filter
            <span className="block text-xs text-gray-400 mt-1">Работает с envelope</span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="отфильтрованные события" />

        <DiagramTooltip content="ExtractNewRecordState разворачивает Debezium envelope, извлекая поле after. Добавляет metadata как __op, __table. После этого SMT downstream работают с flat JSON.">
          <FlowNode variant="connector" className="border-blue-400" tabIndex={0}>
            2. Unwrap
            <span className="block text-xs text-gray-400 mt-1">Flatten payload</span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="flat JSON" />

        <DiagramTooltip content="ByLogicalTableRouter или ContentBasedRouter изменяет имя топика по regex или значению поля. Работает с flat data после unwrap.">
          <FlowNode variant="connector" className="border-purple-400" tabIndex={0}>
            3. Route
            <span className="block text-xs text-gray-400 mt-1">Работает с flat data</span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="right" label="переименованный топик" />

        <DiagramTooltip content="MaskField заменяет чувствительные поля (email, ssn) на ***MASKED*** для GDPR compliance. Применяется в конце pipeline.">
          <FlowNode variant="connector" className="border-amber-400" tabIndex={0}>
            4. Mask
            <span className="block text-xs text-gray-400 mt-1">Работает с flat data</span>
          </FlowNode>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}
```

### Before/After Comparison
```typescript
// From SmtOverviewDiagrams.tsx - ExtractNewRecordState effect
export function UnwrapComparisonDiagram() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Before unwrap */}
      <DiagramContainer
        title="Before ExtractNewRecordState"
        color="rose"
        className="flex-1"
      >
        <div className="text-sm font-mono space-y-2">
          <div>before: null</div>
          <div className="text-emerald-400">
            after: {'{'}
            <div className="ml-4">id: 1,</div>
            <div className="ml-4">name: "Alice"</div>
            {'}'}
          </div>
          <div>op: "c"</div>
          <div className="text-gray-500">source: {'{'} ... {'}'}</div>
          <div className="text-gray-500">ts_ms: 1706745600000</div>
        </div>
      </DiagramContainer>

      {/* After unwrap */}
      <DiagramContainer
        title="After ExtractNewRecordState"
        color="emerald"
        recommended
        className="flex-1"
      >
        <div className="text-sm font-mono space-y-2">
          <div>id: 1</div>
          <div>name: "Alice"</div>
          <div className="text-purple-400">__op: "c"</div>
          <div className="text-purple-400">__ts_ms: 1706745600000</div>
        </div>
        <div className="text-xs text-gray-400 mt-4">
          Metadata добавлено с prefix __
        </div>
      </DiagramContainer>
    </div>
  );
}
```

### Predicate Decision Flow
```typescript
// From PredicateFilterDiagrams.tsx
export function PredicateEvaluationDiagram() {
  return (
    <DiagramContainer title="Predicate условное применение" color="purple">
      <div className="flex flex-col items-center gap-4">
        <FlowNode variant="app">
          Incoming Message
          <span className="block text-xs text-gray-400 mt-1">
            topic: dbserver1.inventory.customers
          </span>
        </FlowNode>

        <Arrow direction="down" />

        <DiagramTooltip content="TopicNameMatches проверяет regex pattern. Если топик соответствует dbserver1\.inventory\..* — возвращает true, иначе false.">
          <FlowNode variant="connector" className="border-purple-400" tabIndex={0}>
            Predicate: IsDataEvent
            <span className="block text-xs text-gray-400 mt-1">
              pattern: dbserver1\.inventory\..*
            </span>
          </FlowNode>
        </DiagramTooltip>

        <div className="flex gap-8 mt-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-semibold text-emerald-400">TRUE</div>
            <Arrow direction="down" />
            <DiagramTooltip content="Применяется ExtractNewRecordState, событие разворачивается в flat JSON.">
              <FlowNode variant="connector" className="border-emerald-400" tabIndex={0}>
                Apply SMT
                <span className="block text-xs text-gray-400 mt-1">Unwrap envelope</span>
              </FlowNode>
            </DiagramTooltip>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-semibold text-gray-400">FALSE</div>
            <Arrow direction="down" />
            <DiagramTooltip content="Heartbeat сообщения не соответствуют pattern, проходят без изменений.">
              <FlowNode variant="app" className="border-gray-400" tabIndex={0}>
                Skip SMT
                <span className="block text-xs text-gray-400 mt-1">Pass through</span>
              </FlowNode>
            </DiagramTooltip>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
```

### Outbox Pattern Transaction Flow
```typescript
// From OutboxPatternDiagrams.tsx
export function OutboxTransactionFlowDiagram() {
  return (
    <DiagramContainer title="Outbox Pattern: Atomic Write" color="purple">
      <div className="flex flex-col items-center gap-4">
        <FlowNode variant="app">
          Application
          <span className="block text-xs text-gray-400 mt-1">approve_order(123)</span>
        </FlowNode>

        <Arrow direction="down" label="BEGIN TRANSACTION" />

        <div className="flex gap-4">
          <DiagramTooltip content="UPDATE orders SET status = 'APPROVED' — бизнес-логика обновляет основную таблицу.">
            <FlowNode variant="database" size="sm" tabIndex={0}>
              UPDATE orders
            </FlowNode>
          </DiagramTooltip>

          <DiagramTooltip content="INSERT INTO outbox (...) — событие записывается в outbox-таблицу в той же транзакции.">
            <FlowNode variant="database" size="sm" tabIndex={0}>
              INSERT outbox
            </FlowNode>
          </DiagramTooltip>
        </div>

        <Arrow direction="down" label="COMMIT (atomic)" />

        <DiagramTooltip content="PostgreSQL WAL содержит оба изменения атомарно. Если COMMIT успешен — оба write зафиксированы.">
          <FlowNode variant="sink" tabIndex={0}>
            PostgreSQL WAL
            <span className="block text-xs text-emerald-400 mt-1">Atomic commit</span>
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="CDC capture" />

        <DiagramTooltip content="Debezium читает WAL, захватывает изменения outbox-таблицы. Outbox Event Router SMT трансформирует в domain event.">
          <FlowNode variant="connector" tabIndex={0}>
            Debezium + Outbox SMT
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Publish event" />

        <FlowNode variant="app" className="border-emerald-400">
          Kafka Topic
          <span className="block text-xs text-gray-400 mt-1">order-events</span>
        </FlowNode>
      </div>
    </DiagramContainer>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Mermaid static diagrams | Glass primitive components | Phase 26-28 (v1.4) | Interactive tooltips, consistent styling |
| Inline Mermaid code | Separate component files | Phase 28-31 | Better maintainability, reusability |
| English tooltips | Russian tooltips | Phase 26+ | Consistency with course language |
| Hover-only tooltips | Click + hover tooltips | Phase 26-02 | Mobile accessibility |

**Deprecated/outdated:**
- Mermaid flowchart syntax in MDX: Replaced with React glass components
- Inline diagram definitions: Moved to organized component files in module5/

## Diagram Inventory by Lesson

| Lesson | File | Diagrams | Primary Concepts |
|--------|------|----------|------------------|
| 01 | smt-overview.mdx | 5 | SMT execution model, chain order, decision framework |
| 02 | predicates-filtering.mdx | 3 | Predicate evaluation, Filter SMT, decision tree |
| 03 | pii-masking.mdx | 2 | MaskField transformation, before/after comparison |
| 04 | content-based-routing.mdx | 3 | Multi-tenant routing, content-based split |
| 05 | outbox-pattern-theory.mdx | 4 | Dual-write problem, outbox transaction flow |
| 06 | outbox-implementation.mdx | 1 | Event Router SMT transformation |
| 07 | schema-registry-avro.mdx | 1 | Schema Registry integration |
| 08 | schema-evolution.mdx | 2 | Schema evolution compatibility |

**Total:** 21 diagrams

## SMT-Specific Terminology (Russian)

For consistent tooltip content:

| English | Russian | Context |
|---------|---------|---------|
| Single Message Transformation | Трансформация одного сообщения | General SMT concept |
| Filter | Фильтр | Filter SMT |
| Unwrap / Flatten | Разворачивание | ExtractNewRecordState |
| Route / Routing | Маршрутизация | ContentBasedRouter, ByLogicalTableRouter |
| Mask / Masking | Маскирование | MaskField SMT |
| Predicate | Предикат | TopicNameMatches, HasHeaderKey |
| Envelope | Envelope (оболочка) | Debezium event structure |
| Payload | Payload (полезная нагрузка) | Message value |
| Outbox | Outbox (исходящая таблица) | Outbox pattern |
| Aggregate | Агрегат | Domain entity |

## Recommended Plan Structure

Given 21 diagrams across 8 files, split into 3 plans:

**Plan 32-01 (SMT Fundamentals):** Lessons 01-03 (10 diagrams)
- SmtOverviewDiagrams.tsx (5 from lesson 01)
- PredicateFilterDiagrams.tsx (3 from lesson 02)
- PiiMaskingDiagrams.tsx (2 from lesson 03)

**Plan 32-02 (Routing & Outbox):** Lessons 04-06 (8 diagrams)
- ContentRoutingDiagrams.tsx (3 from lesson 04)
- OutboxPatternDiagrams.tsx (4 from lesson 05)
- OutboxImplementationDiagrams.tsx (1 from lesson 06)

**Plan 32-03 (Schema Evolution + MDX):** Lessons 07-08 + all MDX migration (3 diagrams)
- SchemaRegistryDiagrams.tsx (1 from lesson 07)
- SchemaEvolutionDiagrams.tsx (2 from lesson 08)
- Update all 8 MDX files to import glass components
- Remove all Mermaid code blocks

## Open Questions

None. All patterns are well-established from Module 3-4 migrations.

## Sources

### Primary (HIGH confidence)
- Existing codebase: src/components/diagrams/module3/*.tsx (proven patterns)
- Existing codebase: src/components/diagrams/primitives/*.tsx (primitive APIs)
- Project STATE.md: Prior decisions on tooltip implementation, import patterns
- Module 5 MDX content: 8 lessons with 21 Mermaid diagrams audited

### Secondary (MEDIUM confidence)
- Phase 30 RESEARCH.md: Similar migration patterns for Module 3

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Reusing proven Module 3/4 primitives
- Architecture patterns: HIGH - Direct application of established patterns
- Pitfalls: HIGH - Based on actual Module 3/4 migration experience
- Diagram inventory: HIGH - Manual audit of all 8 Module 5 lessons

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - stable domain)

---

## Key Findings for Planner

1. **No new components needed:** All Module 5 diagrams map to existing primitives
2. **SMT chains = horizontal FlowNode chains:** Not sequences, just logical ordering
3. **Color scheme established:** rose=filter, blue=unwrap, purple=route, amber=mask
4. **21 diagrams total:** Fewer than Module 3's 49, simpler conceptually
5. **3-plan split recommended:** Fundamentals → Routing → Schema Evolution
6. **Russian terminology:** Consistent translation required for all tooltips
7. **Before/after pattern:** Side-by-side DiagramContainers for transformation visualization
8. **Decision trees:** Nested FlowNodes with flex layout (proven in Module 4)
