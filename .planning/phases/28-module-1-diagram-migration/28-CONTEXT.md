# Phase 28 Context: Module 1 Diagram Migration

**Created:** 2026-02-02
**Phase Goal:** Replace all Mermaid diagrams in Module 1 with interactive glass components

## Module 1 Audit Results

**Files:** 6 MDX files
**Total diagrams:** 9

| File | Diagrams | Types |
|------|----------|-------|
| 01-cdc-fundamentals.mdx | 2 | flowchart, sequence |
| 02-debezium-architecture.mdx | 3 | flowchart (2), sequence |
| 03-lab-setup.mdx | 1 | flowchart (complex, 4 subgroups) |
| 04-first-connector.mdx | 1 | sequence |
| 05-python-consumer.mdx | 1 | flowchart (simple) |
| 06-event-structure.mdx | 1 | flowchart (hierarchical) |

**Complex diagrams requiring special handling:**
- Lab Setup (03): 4 nested subgroups (Data, Streaming, Monitoring, Exercises)
- Kafka Connect Cluster (02): Worker interconnections, internal topics
- Event Structure (06): 3-level hierarchy (envelope → payload → fields)

## Decisions Made

### 1. Tooltip Content Depth: Detailed (3-5 sentences)

Each interactive node gets a comprehensive tooltip with:
- What the component is
- What it does
- Why it matters in the CDC context
- Optional: key technical detail

**Example:**
```
Debezium — open-source CDC платформа от Red Hat.
Читает transaction log базы данных (WAL для PostgreSQL, binlog для MySQL)
без нагрузки на production. Преобразует изменения в события Kafka
в формате JSON с полной информацией о before/after состоянии записи.
```

### 2. Complex Diagrams: Preserve Full Structure

All subgroups from original Mermaid diagrams are represented as DiagramContainers.
Do not simplify or merge groups — architectural accuracy is priority.

**Lab Setup example:**
```tsx
<DiagramContainer title="Data Layer" color="purple">
  <FlowNode variant="database">PostgreSQL</FlowNode>
</DiagramContainer>
<DiagramContainer title="Streaming Layer" color="blue">
  <FlowNode variant="connector">Debezium</FlowNode>
  <FlowNode variant="cluster">Kafka</FlowNode>
</DiagramContainer>
```

### 3. Color Semantics: Semantic with Liquid Glass

Preserve meaning through color variants, maintaining glass styling:
- **rose** — "плохо" (polling approach, anti-patterns)
- **emerald** — "хорошо" (CDC approach, recommended patterns)
- **purple** — databases (PostgreSQL, MySQL)
- **blue** — streaming (Kafka, Schema Registry)
- **amber** — warning/attention states
- **neutral** — generic components

Colors are glass tints (bg-{color}-500/20) not solid fills.

### 4. Hierarchy Representation: Nested DiagramContainers

For hierarchical structures (event envelope, architecture layers):
- Outer DiagramContainer for parent level
- Inner DiagramContainers for child levels
- FlowNodes inside innermost containers

**Event structure example:**
```tsx
<DiagramContainer title="CDC Event Envelope">
  <DiagramContainer title="payload" color="blue">
    <FlowNode>before</FlowNode>
    <FlowNode>after</FlowNode>
    <FlowNode>source</FlowNode>
  </DiagramContainer>
  <DiagramContainer title="schema" color="neutral">
    ...
  </DiagramContainer>
</DiagramContainer>
```

## Migration Strategy

1. **Audit first** — Verify diagram count and types match
2. **Create components** — One .tsx file per MDX file (e.g., CdcFundamentalsDiagrams.tsx)
3. **Write tooltips** — Detailed Russian explanations for each node
4. **Replace imports** — Update MDX to use new components
5. **Remove Mermaid** — Delete `<Mermaid>` blocks after verification

## Files to Create

| New Component | For MDX File | Diagram Count |
|---------------|--------------|---------------|
| CdcFundamentalsDiagrams.tsx | 01-cdc-fundamentals.mdx | 2 |
| DebeziumArchitectureDiagrams.tsx | 02-debezium-architecture.mdx | 3 |
| LabSetupDiagram.tsx | 03-lab-setup.mdx | 1 |
| FirstConnectorDiagram.tsx | 04-first-connector.mdx | 1 |
| PythonConsumerDiagram.tsx | 05-python-consumer.mdx | 1 |
| EventStructureDiagram.tsx | 06-event-structure.mdx | 1 |

## Requirements Covered

- **MOD1-01**: Аудит диаграмм Module 1 ✓ (9 diagrams identified)
- **MOD1-02**: Создать glass-версии всех flowchart диаграмм
- **MOD1-03**: Добавить tooltip'ы с пояснениями к нодам
- **MOD1-04**: Удалить Mermaid код из MDX файлов Module 1

---
*Context gathered: 2026-02-02*
