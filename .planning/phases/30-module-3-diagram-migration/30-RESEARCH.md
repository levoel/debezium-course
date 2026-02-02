# Phase 30 Research: Module 3 Diagram Migration

## Audit Summary

**Total diagrams:** 49 Mermaid diagrams across 14 MDX files
**Scope:** MySQL/Aurora MySQL CDC (lessons 01-15)

## Diagram Inventory by File

| Lesson | File | Diagrams | Primary Concepts |
|--------|------|----------|------------------|
| 01 | binlog-architecture.mdx | 4 | WAL vs Binlog, ROW format, event sequence |
| 02 | gtid-mode-fundamentals.mdx | 3 | GTID anatomy, failover resilience, replication |
| 03 | binlog-retention-heartbeat.mdx | 3 | Retention flow, heartbeat monitoring |
| 04 | mysql-connector-configuration.mdx | 1 | Connector data flow |
| 05 | binlog-wal-comparison.mdx | 5 | Architecture comparison, event formats |
| 06 | schema-history-recovery.mdx | 3 | Schema history flow, recovery paths |
| 07 | aurora-parameter-groups.mdx | 2 | Parameter hierarchy, setup process |
| 08 | enhanced-binlog-architecture.mdx | 4 | Enhanced binlog, storage architecture |
| 09 | aurora-snapshot-modes.mdx | 4 | Snapshot strategies, decision tree |
| 10 | binlog-lag-monitoring.mdx | 2 | Lag metrics flow, monitoring architecture |
| 11 | gtid-failover-procedures.mdx | 7 | Failover sequences (with/without GTID) |
| 12 | incremental-snapshots.mdx | 3 | Snapshot flow, chunk processing |
| 13 | recovery-procedures.mdx | 2 | Recovery decision tree, flow |
| 14 | multi-connector-deployments.mdx | 2 | Multi-connector architecture |
| 15 | ddl-tools-integration.mdx | 4 | gh-ost/pt-osc integration flows |

## Diagram Types Distribution

- **Flowcharts (flowchart TB/LR):** ~30 diagrams
- **Sequence diagrams (sequenceDiagram):** ~12 diagrams
- **Simple graphs (graph LR):** ~7 diagrams

## Key Patterns from Phase 28-29 to Reuse

1. **Architecture comparisons:** Side-by-side DiagramContainers (Module 2 PostgreSQL vs MySQL)
2. **Sequence diagrams:** SequenceDiagram primitive with actors and messages
3. **State/flow diagrams:** FlowNode chains with status colors (emerald/amber/rose)
4. **Decision trees:** Nested FlowNodes with color-coded paths
5. **Process flows:** Horizontal layouts with numbered steps

## MySQL-Specific Diagram Patterns

1. **GTID anatomy:** Graph showing source_id + transaction_id breakdown
2. **Failover comparison:** Two sequence diagrams (without GTID vs with GTID)
3. **Binlog format comparison:** ROW vs STATEMENT vs MIXED differences
4. **Event type sequences:** TABLE_MAP_EVENT → WRITE_ROWS_EVENT patterns
5. **Aurora Enhanced Binlog:** Storage tier architecture

## Suggested Component File Groupings

```
src/components/diagrams/module3/
├── BinlogArchitectureDiagrams.tsx    # Lessons 01, 03, 05 (binlog basics)
├── GtidDiagrams.tsx                  # Lessons 02, 11 (GTID concepts & failover)
├── ConnectorConfigDiagrams.tsx       # Lesson 04 (connector setup)
├── SchemaHistoryDiagrams.tsx         # Lesson 06 (schema history & recovery)
├── AuroraParameterDiagrams.tsx       # Lessons 07, 08 (Aurora config & enhanced)
├── AuroraSnapshotDiagrams.tsx        # Lesson 09 (snapshot modes)
├── MonitoringDiagrams.tsx            # Lesson 10 (lag monitoring)
├── IncrementalSnapshotDiagrams.tsx   # Lesson 12 (incremental snapshots)
├── RecoveryDiagrams.tsx              # Lesson 13 (recovery procedures)
├── MultiConnectorDiagrams.tsx        # Lesson 14 (multi-connector)
├── DdlToolsDiagrams.tsx              # Lesson 15 (DDL tools)
└── index.ts                          # Barrel export
```

## Recommended Plan Structure

Given 49 diagrams across 14 files, split into 4 plans:

**Plan 30-01 (Wave 1):** Lessons 01-04 (11 diagrams)
- BinlogArchitectureDiagrams (4 from lesson 01)
- GtidDiagrams partial (3 from lesson 02)
- BinlogRetentionDiagrams (3 from lesson 03)
- ConnectorConfigDiagrams (1 from lesson 04)

**Plan 30-02 (Wave 1):** Lessons 05-08 (14 diagrams)
- BinlogWalComparisonDiagrams (5 from lesson 05)
- SchemaHistoryDiagrams (3 from lesson 06)
- AuroraParameterDiagrams (2 from lesson 07)
- EnhancedBinlogDiagrams (4 from lesson 08)

**Plan 30-03 (Wave 2):** Lessons 09-12 (16 diagrams)
- AuroraSnapshotDiagrams (4 from lesson 09)
- MonitoringDiagrams (2 from lesson 10)
- GtidFailoverDiagrams (7 from lesson 11)
- IncrementalSnapshotDiagrams (3 from lesson 12)

**Plan 30-04 (Wave 2):** Lessons 13-15 + MDX migration (8 diagrams + all MDX)
- RecoveryDiagrams (2 from lesson 13)
- MultiConnectorDiagrams (2 from lesson 14)
- DdlToolsDiagrams (4 from lesson 15)
- Update all 14 MDX files to use glass components

## Russian Tooltip Examples

From binlog architecture:
- "Binary Log записывает изменения в логическом формате — готов для репликации"
- "ROW формат детерминирован: одинаковый результат на primary и replica"
- "TABLE_MAP_EVENT содержит метаданные схемы таблицы"
- "XID_EVENT сигнализирует commit транзакции"

From GTID:
- "source_id (UUID) уникально идентифицирует сервер MySQL"
- "transaction_id монотонно возрастает на каждом сервере"
- "GTID глобально уникален — одинаков на primary и всех replica"

From failover:
- "Без GTID: позиция mysql-bin.000015:2548 бессмысленна на новом сервере"
- "С GTID: Debezium продолжает с той же позиции на любом сервере"

---
*Research completed: 2026-02-02*
