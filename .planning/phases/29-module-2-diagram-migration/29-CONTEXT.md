# Phase 29 Context: Module 2 Diagram Migration

**Created:** 2026-02-02
**Phase Goal:** Replace all Mermaid diagrams in Module 2 with interactive glass components

## Module 2 Audit Results

**Files:** 7 MDX files
**Total diagrams:** 19

| File | Diagrams | Types |
|------|----------|-------|
| 01-logical-decoding-deep-dive.mdx | 4 | flowchart (3), sequence (1) |
| 02-replication-slots-lifecycle.mdx | 2 | flowchart (1), state diagram (1) |
| 03-wal-configuration-tuning.mdx | 2 | flowchart (2) |
| 04-aurora-parameter-groups.mdx | 2 | flowchart (2) |
| 05-aurora-failover-handling.mdx | 3 | sequence (1), flowchart (2) |
| 06-snapshot-strategies.mdx | 4 | flowchart (2), sequence (2) |
| 07-incremental-snapshot-lab.mdx | 2 | flowchart (2) |

**Complex diagrams requiring special handling:**
- Replication Slot Lifecycle (02): State diagram with transitions and danger notes
- Aurora Failover sequence (05): Complex sequence with 7 participants and danger zones
- Snapshot Decision Framework (06): Decision flowchart with multiple branches
- Aurora Global Database (05): Multi-region architecture diagram

## Decisions (Inherited from Phase 28)

### 1. Tooltip Content Depth: Detailed (3-5 sentences)

Each interactive node gets a comprehensive tooltip with:
- What the component is
- What it does
- Why it matters in the CDC context
- Optional: key technical detail

### 2. Complex Diagrams: Preserve Full Structure

All subgroups from original Mermaid diagrams are represented as DiagramContainers.
Do not simplify or merge groups — architectural accuracy is priority.

### 3. Color Semantics: Semantic with Liquid Glass

Preserve meaning through color variants, maintaining glass styling:
- **rose** — danger zones, anti-patterns, failures
- **emerald** — success, recommended approaches, good practices
- **purple** — databases (PostgreSQL, Aurora)
- **blue** — streaming components (Kafka, WAL)
- **amber** — warning states, monitoring
- **neutral** — generic components

Colors are glass tints (bg-{color}-500/20) not solid fills.

### 4. Hierarchy Representation: Nested DiagramContainers

For hierarchical structures (Aurora architecture, snapshot flows):
- Outer DiagramContainer for parent level
- Inner DiagramContainers for child levels
- FlowNodes inside innermost containers

### 5. State Diagrams: Use Flowchart with Status Colors

For state machine diagrams (like Replication Slot Lifecycle):
- Use FlowNode with semantic colors for different states
- Active state: emerald
- Inactive state: amber
- Danger states: rose
- Use Arrow components to show transitions

## Files to Create

| New Component | For MDX File | Diagram Count |
|---------------|--------------|---------------|
| LogicalDecodingDiagrams.tsx | 01-logical-decoding-deep-dive.mdx | 4 |
| ReplicationSlotsDiagrams.tsx | 02-replication-slots-lifecycle.mdx | 2 |
| WalConfigDiagrams.tsx | 03-wal-configuration-tuning.mdx | 2 |
| AuroraParameterDiagrams.tsx | 04-aurora-parameter-groups.mdx | 2 |
| AuroraFailoverDiagrams.tsx | 05-aurora-failover-handling.mdx | 3 |
| SnapshotStrategyDiagrams.tsx | 06-snapshot-strategies.mdx | 4 |
| IncrementalSnapshotDiagrams.tsx | 07-incremental-snapshot-lab.mdx | 2 |

## Requirements Covered

- **MOD2-01**: Аудит диаграмм Module 2 ✓ (19 diagrams identified)
- **MOD2-02**: Создать glass-версии всех flowchart диаграмм
- **MOD2-03**: Добавить tooltip'ы с пояснениями к нодам
- **MOD2-04**: Удалить Mermaid код из MDX файлов Module 2

---
*Context gathered: 2026-02-02*
