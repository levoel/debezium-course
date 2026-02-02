---
phase: 34-module-7-diagram-migration
plan: 01
subsystem: diagrams
tags: [gcp, primitives, cloud-sql, debezium-server, pub-sub, kafka-less]

requires:
  - 33-04 # Module 6 complete (feature engineering diagrams)
  - 32-03 # Purple variant for Schema Registry
  - 26-01 # FlowNode primitives foundation

provides:
  - 6 GCP-specific FlowNode variants (gcp-database, gcp-messaging, gcp-compute, gcp-storage, gcp-monitoring, gcp-security)
  - CloudSqlCdcArchitectureDiagram for lesson 01
  - 3 Debezium Server diagrams for lesson 02 (Traditional, Kafka-less, Internal)
  - Module 7 diagram foundation

affects:
  - 34-02 # Module 7 lesson 03-06 diagrams will use these GCP variants

tech-stack:
  added: []
  patterns:
    - "GCP brand colors for service categories (blue=data, amber=messaging, emerald=compute)"
    - "Kafka vs Kafka-less comparison with contrasting colors (amber=complex, emerald=simple)"
    - "Nested DiagramContainer for internal architecture visualization"

key-files:
  created:
    - src/components/diagrams/primitives/types.ts # Added 6 GCP variants to FlowNodeVariant union
    - src/components/diagrams/primitives/FlowNode.tsx # Added GCP variant styles with brand colors
    - src/components/diagrams/module7/CloudSqlDiagrams.tsx # 1 diagram (CloudSqlCdcArchitectureDiagram)
    - src/components/diagrams/module7/DebeziumServerDiagrams.tsx # 3 diagrams
  modified: []

decisions:
  - decision: "GCP brand colors for FlowNode variants"
    rationale: "Official GCP service colors (blue #4285f4, amber #fbbc04, emerald #34a853) align with user expectations and GCP documentation"
    affects: ["All Module 7 diagrams"]
  - decision: "Amber for Traditional Kafka, Emerald for Kafka-less"
    rationale: "Color contrast emphasizes complexity (amber=caution) vs simplicity (emerald=recommended) trade-offs"
    affects: ["Architecture comparison diagrams"]
  - decision: "Nested DiagramContainer for Debezium Server internals"
    rationale: "Shows encapsulation of PostgreSQL Connector + Event Buffer + Sink Adapter within Quarkus app boundary"
    affects: ["Internal architecture diagrams"]

metrics:
  duration: "2m 50s"
  completed: "2026-02-02"
---

# Phase 34 Plan 01: GCP Primitives and Foundation Diagrams

**One-liner:** Added 6 GCP FlowNode variants with official brand colors and created 4 foundation diagrams (Cloud SQL CDC + 3 Debezium Server architectures) for Module 7 lessons 01-02

## Objective

Extend FlowNode primitives with GCP-specific variants and create foundation service diagrams for Module 7 lessons 01-02, establishing the visualization system for Google Cloud Platform CDC architectures.

## What Was Done

### Task 1: GCP FlowNode Variants (commit aba137d)

Extended primitives with 6 GCP-specific variants using official GCP brand colors:

| Variant | Service Category | Color | Hex |
|---------|-----------------|-------|-----|
| `gcp-database` | Cloud SQL | Blue | #4285f4 |
| `gcp-messaging` | Pub/Sub | Amber | #fbbc04 |
| `gcp-compute` | GKE/Cloud Run/Dataflow | Emerald | #34a853 |
| `gcp-storage` | BigQuery/Cloud Storage | Blue | #4285f4 |
| `gcp-monitoring` | Cloud Monitoring | Rose | #ea4335 |
| `gcp-security` | IAM/Workload Identity | Purple | #a142f4 |

**Files modified:**
- `src/components/diagrams/primitives/types.ts` - Added 6 variants to FlowNodeVariant union
- `src/components/diagrams/primitives/FlowNode.tsx` - Added variantStyles for all GCP variants

### Task 2: CloudSqlDiagrams.tsx (commit 2c7996e)

Created 1 diagram for Module 7 lesson 01:

**CloudSqlCdcArchitectureDiagram:**
- Horizontal flow: Cloud SQL PostgreSQL → Debezium Server → Pub/Sub Topics
- Uses `gcp-database` and `gcp-messaging` variants
- Russian tooltips explaining logical decoding, Debezium Server standalone architecture, Pub/Sub as Kafka replacement
- Footer note about replication slot WAL management

### Task 3: DebeziumServerDiagrams.tsx (commit 1f60934)

Created 3 diagrams for Module 7 lesson 02:

**1. TraditionalKafkaArchitectureDiagram:**
- Vertical flow showing PostgreSQL → Debezium Connector → Kafka Connect → Kafka Cluster → Consumers
- Amber color scheme emphasizing operational complexity
- Kafka Cluster with rose border (border-rose-400/50) highlighting infrastructure burden
- Footer: "Высокая операционная сложность: Kafka + Zookeeper/KRaft + Connect"

**2. KafkalessArchitectureDiagram:**
- Vertical flow showing Cloud SQL PostgreSQL → Debezium Server → Google Pub/Sub → GCP consumers (Cloud Run, Dataflow, BigQuery)
- Emerald color scheme emphasizing simplicity
- Uses all 3 consumer GCP variants: `gcp-compute` (Cloud Run, Dataflow), `gcp-storage` (BigQuery)
- Footer: "Простая инфраструктура, serverless, низкие операционные затраты"

**3. DebeziumServerInternalDiagram:**
- Nested architecture with external source → Debezium Server (Quarkus App) → external sink
- Internal structure: PostgreSQL Connector → Event Buffer → Pub/Sub Sink Adapter
- Offset storage options section: File Storage (amber border, single instance) vs Redis Storage (emerald border, HA)
- Footer: "Offset storage критичен: без persistent storage при перезапуске pod потеряет позицию"

## Deviations from Plan

None - plan executed exactly as written.

## Architecture Patterns Established

### GCP Color Semantics

Following official GCP brand guidelines:
- **Blue services** (#4285f4): Data layer (Cloud SQL, BigQuery)
- **Amber services** (#fbbc04): Messaging layer (Pub/Sub)
- **Emerald services** (#34a853): Compute layer (GKE, Cloud Run, Dataflow)
- **Rose services** (#ea4335): Monitoring/Alerting layer
- **Purple services** (#a142f4): Security/IAM layer

### Comparison Diagrams

**Pattern:** Side-by-side with contrasting colors
- Amber (caution) for complex/traditional architectures
- Emerald (recommended) for simplified/modern architectures

**Example:** TraditionalKafkaArchitectureDiagram (amber) vs KafkalessArchitectureDiagram (emerald)

### Nested Architecture

**Pattern:** DiagramContainer within DiagramContainer
- Outer: System boundary (e.g., "Debezium Server (Quarkus App)")
- Inner: Internal components (Connector → Buffer → Sink Adapter)

**Benefits:** Clear encapsulation and scope visualization

## Russian Tooltips Summary

All 4 diagrams include comprehensive Russian tooltips:

**CloudSqlCdcArchitectureDiagram (3 tooltips):**
- Cloud SQL PostgreSQL: Managed PostgreSQL с logical decoding
- Debezium Server: Standalone Quarkus с source + sink adapter
- Google Pub/Sub: Managed message broker заменяет Kafka

**TraditionalKafkaArchitectureDiagram (7 tooltips):**
- PostgreSQL, Debezium Connector, Kafka Connect, Kafka Cluster (с предупреждением о сложности), 3 consumers

**KafkalessArchitectureDiagram (7 tooltips):**
- Cloud SQL, Debezium Server (с акцентом на простоту), Pub/Sub (автоматическое масштабирование), Cloud Run, Dataflow, BigQuery

**DebeziumServerInternalDiagram (8 tooltips):**
- Cloud SQL, PostgreSQL Connector, Event Buffer, Pub/Sub Sink Adapter, Pub/Sub, File Storage (с предупреждением), Redis Storage (для HA)

**Total:** 25 DiagramTooltips across 4 diagrams

## Verification

- [x] primitives/types.ts contains 6 new gcp-* variants
- [x] FlowNode.tsx has styles for all 6 gcp-* variants
- [x] CloudSqlDiagrams.tsx exists with 1 diagram
- [x] DebeziumServerDiagrams.tsx exists with 3 diagrams
- [x] All 4 diagrams use GCP brand colors
- [x] All tooltips in Russian
- [x] TypeScript compiles without errors
- [x] Build completes successfully (66 pages built in 9.06s)
- [x] Module 7 folder structure created

## Next Phase Readiness

**Blockers:** None

**Concerns:** None

**Prerequisites for 34-02:**
- [x] GCP variants available in primitives
- [x] Module 7 directory structure exists
- [x] Pattern established for GCP service visualization
- [x] Lessons 01-02 diagrams complete

**Ready to proceed:** Yes - Wave 2 can create remaining Module 7 diagrams (lessons 03-06) using established GCP variants and patterns

## Lessons Learned

1. **Official brand colors matter:** Using exact GCP hex values (#4285f4, #fbbc04, #34a853) creates professional, recognizable diagrams that align with user expectations from GCP Console
2. **Color contrast for comparisons:** Amber vs Emerald effectively communicates "old/complex" vs "new/simple" without explicit labels
3. **Nested containers for scope:** Wrapping internal components in labeled DiagramContainer clearly shows "this is inside the Quarkus process boundary"
4. **Offset storage criticality:** Multiple tooltips emphasize persistent storage requirement - repetition justified by importance (data loss risk)
5. **Consumer diversity:** Showing 3 different GCP consumers (Cloud Run, Dataflow, BigQuery) demonstrates Pub/Sub flexibility beyond single sink pattern

## Statistics

- **Files created:** 2 (CloudSqlDiagrams.tsx, DebeziumServerDiagrams.tsx)
- **Files modified:** 2 (types.ts, FlowNode.tsx)
- **Diagrams created:** 4 (1 Cloud SQL + 3 Debezium Server)
- **DiagramTooltips added:** 25
- **GCP variants added:** 6
- **Lines of code:** ~600 (primitives extensions + diagrams)
- **Commits:** 3 (primitives, CloudSql, DebeziumServer)
- **Duration:** 2m 50s
- **Build time:** 9.06s (66 pages)
