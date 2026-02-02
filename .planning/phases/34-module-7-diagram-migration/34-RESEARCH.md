# Phase 34: Module 7 Diagram Migration - Research

**Researched:** 2026-02-02
**Domain:** GCP Cloud-Native CDC Diagrams
**Confidence:** HIGH

## Summary

Module 7 (Cloud-Native GCP) contains 6 lessons with extensive architecture diagrams showcasing GCP-specific CDC patterns. The module focuses on managed GCP services (Cloud SQL, Pub/Sub, Dataflow, Cloud Run, GKE) with Debezium Server in Kafka-less architecture.

**Total Mermaid diagrams:** 14 diagrams across 6 MDX files
**Primary technologies:** Cloud SQL PostgreSQL, Debezium Server, Pub/Sub, Dataflow, Cloud Run, Eventarc, Cloud Monitoring
**Diagram complexity:** Medium to Advanced (multi-service architecture, sequence flows, monitoring hierarchies)

**Primary recommendation:** Create GCP-specific FlowNode variants for cloud services with appropriate colors/icons. Leverage existing SequenceDiagram primitives for event flows. Group diagrams by GCP service domain.

## Standard Stack

The established diagram primitives for Module 7 migration:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| FlowNode | Current | Cloud service nodes | Existing primitive with variant system |
| Arrow | Current | Data flow connections | Directional flow visualization |
| DiagramContainer | Current | Service grouping | Subgraph replacement with glass styling |
| SequenceDiagram | Current | Event flow sequences | Message passing between services |
| Tooltip | Current | Contextual information | Russian explanations for GCP concepts |

### Supporting
| Component | Purpose | When to Use |
|-----------|---------|-------------|
| forwardRef pattern | Tooltip compatibility | All interactive nodes |
| Radix Popover | Click-based tooltips | Safari compatibility |
| Tailwind variants | Service-specific colors | GCP service differentiation |

### New Variants Needed for Module 7
| Variant | Color Scheme | GCP Services |
|---------|--------------|--------------|
| `gcp-database` | Purple/blue | Cloud SQL PostgreSQL |
| `gcp-messaging` | Amber/yellow | Pub/Sub Topics/Subscriptions |
| `gcp-compute` | Emerald/green | GKE, Cloud Run, Dataflow |
| `gcp-storage` | Blue/cyan | BigQuery, Cloud Storage |
| `gcp-monitoring` | Rose/red | Cloud Monitoring, Alerts |

**Installation:**
```bash
# No new dependencies needed - extends existing primitives
# Modify: src/components/diagrams/primitives/types.ts
# Add GCP variants to FlowNodeVariant union type
```

## Architecture Patterns

### Recommended Project Structure
```
src/components/diagrams/module7/
├── CloudSqlDiagrams.tsx          # Lesson 01: Cloud SQL setup, replication slots
├── DebeziumServerDiagrams.tsx    # Lesson 02: Kafka-less architecture, offset storage
├── IamWorkloadDiagrams.tsx       # Lesson 03: Workload Identity flow, authentication
├── DataflowBigQueryDiagrams.tsx  # Lesson 04: CDC replication pipeline
├── CloudRunEventDiagrams.tsx     # Lesson 05: Eventarc triggers, event processing
├── MonitoringDiagrams.tsx        # Lesson 06: Observability hierarchy, alert flow
└── index.ts                      # Barrel export
```

### Pattern 1: Multi-Service Architecture Diagrams
**What:** GCP services connected through managed messaging
**When to use:** Showing end-to-end CDC pipeline flow
**Example:**
```typescript
// Cloud SQL → Debezium Server → Pub/Sub → Consumers
<DiagramContainer title="Kafka-less CDC Architecture" color="emerald">
  <div className="flex items-center gap-3">
    <FlowNode variant="gcp-database">Cloud SQL PostgreSQL</FlowNode>
    <Arrow direction="right" label="WAL" />
    <FlowNode variant="connector">Debezium Server</FlowNode>
    <Arrow direction="right" label="CDC Events" />
    <FlowNode variant="gcp-messaging">Pub/Sub</FlowNode>
    <Arrow direction="right" />
    <FlowNode variant="gcp-compute">Dataflow</FlowNode>
  </div>
</DiagramContainer>
```

### Pattern 2: Workload Identity Authentication Flow
**What:** Sequence showing K8s SA → GCP SA → API access
**When to use:** Security and IAM lesson diagrams
**Example:**
```typescript
<SequenceDiagram
  actors={[
    { id: 'pod', label: 'Pod в GKE', variant: 'service' },
    { id: 'ksa', label: 'K8s Service Account', variant: 'service' },
    { id: 'gcpsa', label: 'GCP Service Account', variant: 'external' },
    { id: 'api', label: 'Pub/Sub API', variant: 'queue' }
  ]}
  messages={[
    { from: 'pod', to: 'ksa', label: 'Request token', variant: 'sync' },
    { from: 'ksa', to: 'gcpsa', label: 'Workload Identity binding', variant: 'async' },
    { from: 'gcpsa', to: 'api', label: 'Authenticated request', variant: 'sync' }
  ]}
/>
```

### Pattern 3: Monitoring Hierarchy
**What:** Nested containers showing component → metrics → alerts
**When to use:** Observability diagrams (lesson 06)
**Example:**
```typescript
<DiagramContainer title="Monitoring Points" color="rose">
  <div className="grid grid-cols-3 gap-3">
    <DiagramContainer title="Cloud SQL" color="purple">
      <FlowNode variant="gcp-monitoring" size="sm">CPU/Disk</FlowNode>
      <FlowNode variant="gcp-monitoring" size="sm">WAL Slots</FlowNode>
    </DiagramContainer>
    <DiagramContainer title="Debezium" color="emerald">
      <FlowNode variant="gcp-monitoring" size="sm">Lag</FlowNode>
      <FlowNode variant="gcp-monitoring" size="sm">Throughput</FlowNode>
    </DiagramContainer>
    <DiagramContainer title="Pub/Sub" color="amber">
      <FlowNode variant="gcp-monitoring" size="sm">Backlog</FlowNode>
      <FlowNode variant="gcp-monitoring" size="sm">DLQ</FlowNode>
    </DiagramContainer>
  </div>
</DiagramContainer>
```

### Anti-Patterns to Avoid
- **Service Account Key Files in Diagrams:** Never show `key.json` as valid pattern (anti-pattern in lesson 03)
- **Over-complex nested containers:** GCP monitoring diagram (lesson 06) has 5 levels - flatten to 3 max
- **Generic service names:** Use specific GCP service names (Cloud SQL, not just "PostgreSQL")

## Diagram Inventory by File

### Lesson 01: Cloud SQL Setup (1 diagram)
| Diagram | Type | Complexity | GCP Services |
|---------|------|------------|--------------|
| Архитектура CDC на Cloud SQL | Flowchart LR | Simple | Cloud SQL, Debezium Server, Pub/Sub |

**Key concepts:**
- Cloud SQL logical decoding flow
- Replication slot management
- WAL → Pub/Sub pipeline

**Tooltips needed:**
- "Logical Decoding преобразует WAL в структурированные события"
- "Replication Slot хранит позицию чтения и управляет удалением WAL"
- "Debezium Server читает события из слота и публикует в Pub/Sub"

### Lesson 02: Debezium Server with Pub/Sub (3 diagrams)
| Diagram | Type | Complexity | GCP Services |
|---------|------|------------|--------------|
| Традиционная архитектура (Kafka Connect) | Flowchart LR | Medium | Kafka cluster emphasis |
| Kafka-less архитектура (Debezium Server) | Flowchart LR | Medium | Pub/Sub, Cloud Run, Dataflow, BigQuery |
| Debezium Server внутренняя архитектура | Flowchart TD | Medium | Quarkus app, offset storage |

**Key concepts:**
- Kafka-less architecture benefits
- Pub/Sub as managed message broker
- File vs Redis offset storage strategies

**Tooltips needed:**
- "Debezium Server — standalone Quarkus приложение с source connector + sink adapter"
- "Offset storage критичен: без persistent storage при перезапуске pod потеряет позицию"
- "Pub/Sub автоматическое масштабирование заменяет Kafka партиции"

### Lesson 03: IAM and Workload Identity (1 diagram)
| Diagram | Type | Complexity | GCP Services |
|---------|------|------------|--------------|
| Workload Identity поток аутентификации | Flowchart LR | Medium | GKE, K8s SA, GCP SA, IAM |

**Key concepts:**
- Workload Identity Federation
- K8s SA → GCP SA binding
- IAM roles hierarchy

**Tooltips needed:**
- "Workload Identity связывает K8s Service Account с GCP Service Account автоматически"
- "GKE Metadata Server предоставляет GCP токен pod'у без ключей"
- "Токен автоматически ротируется каждый час — безопаснее чем service account keys"

### Lesson 04: Dataflow to BigQuery (2 diagrams)
| Diagram | Type | Complexity | GCP Services |
|---------|------|------------|--------------|
| Архитектура CDC → BigQuery | Flowchart LR | Medium | Cloud SQL, Debezium Server, Pub/Sub, Dataflow, BigQuery |
| End-to-end workflow | Flowchart TB | Complex | All components with subgraphs |

**Key concepts:**
- Managed Dataflow template
- Changelog vs Replica tables
- MERGE operations for upsert/delete

**Tooltips needed:**
- "Changelog table — staging с полной историей всех CDC операций"
- "Replica table — current state с результатом MERGE операций"
- "updateFrequencySecs определяет частоту MERGE (60 секунд = каждую минуту)"
- "At-least-once достаточно для CDC: MERGE по PK идемпотентен"

### Lesson 05: Cloud Run Event-Driven (2 diagrams)
| Diagram | Type | Complexity | GCP Services |
|---------|------|------------|--------------|
| Pub/Sub → Eventarc → Cloud Run | Flowchart LR | Medium | Debezium Server, Pub/Sub, Eventarc, Cloud Run |
| Auto-scaling behavior | Sequence | Medium | Pub/Sub, Cloud Run instances |
| End-to-end sequence | Sequence | Complex | Cloud SQL, Debezium, Pub/Sub, Eventarc, Cloud Run, External APIs |

**Key concepts:**
- Eventarc triggers
- Serverless event processing
- Auto-scaling based on concurrency

**Tooltips needed:**
- "Eventarc связывает Pub/Sub топик с Cloud Run сервисом автоматически"
- "Cloud Run масштабируется на основе concurrency (запросов на контейнер)"
- "min-instances=0 позволяет scale to zero при отсутствии трафика"
- "Pub/Sub base64-кодирует данные — нужно декодировать → JSON"

### Lesson 06: Monitoring (5 diagrams)
| Diagram | Type | Complexity | GCP Services |
|---------|------|------------|--------------|
| Компоненты для мониторинга | Flowchart TD | Complex | All components + monitoring points |
| Dashboard layout | Flowchart TD | Medium | Dashboard structure |
| Monitoring points | Flowchart LR | Complex | Component → metrics → Cloud Monitoring |

**Key concepts:**
- End-to-end observability
- Component-specific metrics
- Alert hierarchy (Critical/Warning/Info)

**Tooltips needed:**
- "System lag — ключевая метрика для real-time CDC (задержка обработки)"
- "Replication slot lag_bytes — предотвращает WAL bloat"
- "Pub/Sub oldest_unacked_message_age — показывает consumer lag"
- "Cloud Run error rate — детектирует проблемы с обработкой событий"

## Diagram Types Distribution

Total: 14 diagrams

- **Flowcharts (LR/TD):** 9 diagrams (64%)
  - Architecture flows: 6
  - Complex multi-service: 3
- **Sequence diagrams:** 2 diagrams (14%)
  - Authentication flow
  - Event processing flow
- **Hybrid (flowchart with sequence elements):** 3 diagrams (22%)
  - Auto-scaling behavior
  - Monitoring hierarchy

## GCP-Specific Patterns

### 1. Managed Service Integration
**Pattern:** Cloud-native services connected through Pub/Sub
- Cloud SQL → Pub/Sub (via Debezium Server)
- Pub/Sub → Dataflow (via subscription)
- Pub/Sub → Cloud Run (via Eventarc)

### 2. Serverless Auto-Scaling
**Pattern:** Horizontal scaling based on message volume
- Dataflow workers scale with Pub/Sub backlog
- Cloud Run instances scale with concurrency
- Visual representation: multiple container boxes appearing/disappearing

### 3. IAM and Security Flows
**Pattern:** Service Account impersonation chains
- K8s SA → Workload Identity → GCP SA → API access
- Sequential authentication steps with token passing

### 4. Observability Hierarchies
**Pattern:** Nested monitoring layers
- Component → Metrics → Alerts → Runbooks
- Multiple monitoring points feeding into unified dashboard

### 5. Comparison Diagrams (Kafka vs Kafka-less)
**Pattern:** Side-by-side architecture comparison
- Left: Traditional Kafka Connect architecture
- Right: Debezium Server + Pub/Sub architecture
- Highlight complexity reduction with color coding

## Complexity Assessment

| Lesson | Simple | Medium | Complex | Total |
|--------|--------|--------|---------|-------|
| 01 Cloud SQL | 1 | - | - | 1 |
| 02 Debezium Server | - | 3 | - | 3 |
| 03 IAM Workload | - | 1 | - | 1 |
| 04 Dataflow BigQuery | - | 1 | 1 | 2 |
| 05 Cloud Run | - | 2 | 1 | 3 |
| 06 Monitoring | - | 1 | 3 | 4 |
| **Total** | **1** | **8** | **5** | **14** |

**Complexity criteria:**
- **Simple:** Single service flow, <4 nodes, no subgraphs
- **Medium:** 2-3 services, basic flow, optional subgraphs
- **Complex:** 4+ services, nested containers, sequence + flow hybrid

## GCP Service Colors/Icons Needed

### Proposed Color Scheme (GCP Brand Aligned)

```typescript
// Add to primitives/types.ts
export type FlowNodeVariant =
  // Existing variants
  | 'database' | 'connector' | 'cluster' | 'sink' | 'app' | 'target'
  // GCP-specific variants
  | 'gcp-database'   // Cloud SQL - purple/blue #4285f4
  | 'gcp-messaging'  // Pub/Sub - amber #fbbc04
  | 'gcp-compute'    // GKE/Cloud Run/Dataflow - emerald #34a853
  | 'gcp-storage'    // BigQuery - blue #4285f4
  | 'gcp-monitoring' // Cloud Monitoring - red/rose #ea4335
  | 'gcp-security'   // IAM/Workload Identity - purple #a142f4
```

### Variant Style Definitions

```typescript
const variantStyles: Record<FlowNodeVariant, string> = {
  // ... existing variants ...

  // GCP variants (using official brand colors)
  'gcp-database': 'bg-blue-500/20 border-blue-400/40 text-blue-100',
  'gcp-messaging': 'bg-amber-500/20 border-amber-400/40 text-amber-100',
  'gcp-compute': 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100',
  'gcp-storage': 'bg-blue-600/20 border-blue-500/40 text-blue-100',
  'gcp-monitoring': 'bg-rose-500/20 border-rose-400/40 text-rose-100',
  'gcp-security': 'bg-purple-500/20 border-purple-400/40 text-purple-100',
};
```

## Recommended Wave Structure

Given 14 diagrams across 6 files, split into 3 plans:

### Plan 34-01 (Wave 1): Foundation Services (5 diagrams)
**Scope:** Lessons 01-02 (Cloud SQL + Debezium Server)
**Diagrams:**
- CloudSqlDiagrams.tsx (1 diagram from lesson 01)
- DebeziumServerDiagrams.tsx (3 diagrams from lesson 02)
- Update 2 MDX files with glass imports

**Rationale:** Establishes base GCP service variants, relatively simple flows

**Estimated complexity:** Medium
- New GCP variants needed
- Simple architecture flows
- Foundation for subsequent lessons

### Plan 34-02 (Wave 2): Consumer Services (5 diagrams)
**Scope:** Lessons 03-04 (IAM + Dataflow)
**Diagrams:**
- IamWorkloadDiagrams.tsx (1 diagram from lesson 03)
- DataflowBigQueryDiagrams.tsx (2 diagrams from lesson 04)
- Update 2 MDX files with glass imports

**Rationale:** Security flow + complex end-to-end pipeline

**Estimated complexity:** Medium-High
- Workload Identity sequence diagram
- Complex multi-service Dataflow diagram
- Nested subgraphs for workflow

### Plan 34-03 (Wave 3): Event-Driven + Monitoring (4 diagrams + MDX)
**Scope:** Lessons 05-06 (Cloud Run + Monitoring)
**Diagrams:**
- CloudRunEventDiagrams.tsx (3 diagrams from lesson 05)
- MonitoringDiagrams.tsx (4 diagrams from lesson 06)
- Update remaining 2 MDX files

**Rationale:** Most complex diagrams, monitoring hierarchy

**Estimated complexity:** High
- Auto-scaling sequence diagram (hybrid)
- Complex monitoring hierarchy (5+ services)
- Dashboard layout visualization

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GCP service icons | Custom SVG icons | Tailwind color variants + text labels | Icons require brand compliance, text is clearer for education |
| Animated scaling | Custom CSS animations | Static states with color emphasis | Animations distract from technical concepts |
| IAM policy visualization | Custom graph library | SequenceDiagram with actors | IAM is sequential authorization flow |
| Dashboard layout | Recreate console UI | Nested DiagramContainers with grid | Focus on concepts not UI fidelity |
| Nested subgraphs | Complex div nesting | DiagramContainer composition | Built-in glass styling and accessibility |

**Key insight:** GCP diagrams benefit from brand-aligned colors but should prioritize clarity over visual fidelity. The existing primitive system handles complexity through composition.

## Common Pitfalls

### Pitfall 1: Over-Representing GCP Console UI
**What goes wrong:** Diagrams try to recreate Cloud Console appearance
**Why it happens:** Familiarity bias - users know the console UI
**How to avoid:** Focus on conceptual architecture, not UI chrome
**Warning signs:** Diagrams include "Edit" buttons, breadcrumbs, navigation bars

**Example:**
```typescript
// ❌ Bad: Mimicking console UI
<div className="border rounded bg-white p-4">
  <div className="text-xs text-gray-500">Cloud SQL > Instances > Edit</div>
  <FlowNode>cloud-sql-instance</FlowNode>
</div>

// ✅ Good: Conceptual architecture
<DiagramContainer title="Cloud SQL Configuration" color="blue">
  <FlowNode variant="gcp-database">Cloud SQL PostgreSQL</FlowNode>
  <div className="text-xs mt-2">cloudsql.logical_decoding=on</div>
</DiagramContainer>
```

### Pitfall 2: Service Account Anti-Patterns in Diagrams
**What goes wrong:** Showing key.json files as valid pattern
**Why it happens:** Lesson 03 demonstrates anti-pattern for education
**How to avoid:** Use visual indicators (red border, ❌) for anti-patterns
**Warning signs:** Diagrams show `GOOGLE_APPLICATION_CREDENTIALS` without warning

**Example:**
```typescript
// ✅ Clearly mark anti-pattern
<DiagramContainer title="❌ НЕ ДЕЛАЙТЕ ТАК" color="rose">
  <FlowNode variant="gcp-security" className="border-red-500 border-2">
    key.json file
  </FlowNode>
  <div className="text-red-200 text-xs mt-2">
    Утечка ключей, нет ротации, сложный аудит
  </div>
</DiagramContainer>

<DiagramContainer title="✅ Best Practice" color="emerald">
  <FlowNode variant="gcp-security">Workload Identity</FlowNode>
  <div className="text-emerald-200 text-xs mt-2">
    Автоматическая ротация каждый час
  </div>
</DiagramContainer>
```

### Pitfall 3: Sequence Diagram Overuse
**What goes wrong:** Using sequence diagrams for static architecture
**Why it happens:** Original Mermaid used `sequenceDiagram` for flows
**How to avoid:** Use sequence only for temporal/message-passing flows
**Warning signs:** Actors don't send messages, just exist in diagram

**Decision criteria:**
- **Use SequenceDiagram:** Authentication flows, event processing, API calls
- **Use FlowNode chains:** Architecture components, data pipelines, service topology

### Pitfall 4: Nested Container Explosion
**What goes wrong:** 5+ levels of nested DiagramContainers (monitoring hierarchy)
**Why it happens:** Mermaid subgraphs translate to nested containers
**How to avoid:** Flatten to max 3 levels, use color instead of nesting
**Warning signs:** Diagram has `<DiagramContainer>` inside `<DiagramContainer>` inside...

**Example:**
```typescript
// ❌ Bad: Too many nesting levels
<DiagramContainer title="Pipeline">
  <DiagramContainer title="Source">
    <DiagramContainer title="Cloud SQL">
      <DiagramContainer title="Monitoring">
        <FlowNode>CPU metric</FlowNode>
      </DiagramContainer>
    </DiagramContainer>
  </DiagramContainer>
</DiagramContainer>

// ✅ Good: Flatten with color coding
<DiagramContainer title="Pipeline Monitoring" color="rose">
  <div className="grid grid-cols-3 gap-3">
    <FlowNode variant="gcp-monitoring">Cloud SQL CPU</FlowNode>
    <FlowNode variant="gcp-monitoring">Debezium Lag</FlowNode>
    <FlowNode variant="gcp-monitoring">Pub/Sub Backlog</FlowNode>
  </div>
</DiagramContainer>
```

## Code Examples

Verified patterns for Module 7 diagrams:

### Example 1: Kafka-less Architecture Comparison
```typescript
// Source: Lesson 02 - Debezium Server with Pub/Sub
// Pattern: Side-by-side architecture comparison

export function KafkalessComparison() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Traditional Kafka Architecture */}
      <DiagramContainer
        title="Традиционная архитектура"
        color="amber"
        description="Kafka Connect с Kafka кластером"
      >
        <div className="flex flex-col items-center gap-3">
          <FlowNode variant="database">PostgreSQL</FlowNode>
          <Arrow direction="down" label="WAL" />
          <FlowNode variant="connector">Debezium Connector</FlowNode>
          <Arrow direction="down" />
          <FlowNode variant="cluster" className="border-red-400/50">
            Kafka Cluster
          </FlowNode>
          <div className="text-xs text-amber-200/70 mt-2">
            Высокая операционная сложность
          </div>
        </div>
      </DiagramContainer>

      {/* Kafka-less Architecture */}
      <DiagramContainer
        title="Kafka-less архитектура"
        color="emerald"
        recommended
        description="Debezium Server + Pub/Sub"
      >
        <div className="flex flex-col items-center gap-3">
          <FlowNode variant="gcp-database">Cloud SQL PostgreSQL</FlowNode>
          <Arrow direction="down" label="WAL" />
          <FlowNode variant="connector">Debezium Server</FlowNode>
          <Arrow direction="down" label="CDC Events" />
          <FlowNode variant="gcp-messaging">Google Pub/Sub</FlowNode>
          <div className="flex gap-2 mt-2">
            <FlowNode variant="gcp-compute" size="sm">Cloud Run</FlowNode>
            <FlowNode variant="gcp-compute" size="sm">Dataflow</FlowNode>
          </div>
          <div className="text-xs text-emerald-200/70 mt-2">
            Простая инфраструктура, serverless
          </div>
        </div>
      </DiagramContainer>
    </div>
  );
}
```

### Example 2: Workload Identity Flow
```typescript
// Source: Lesson 03 - IAM and Workload Identity
// Pattern: Authentication sequence with tooltips

export function WorkloadIdentityFlow() {
  return (
    <DiagramContainer
      title="Workload Identity поток аутентификации"
      color="purple"
      description="K8s Service Account → GCP Service Account binding"
    >
      <SequenceDiagram
        actors={[
          {
            id: 'pod',
            label: 'Pod в GKE',
            variant: 'service',
            tooltip: (
              <div>
                <p className="font-semibold mb-1">Kubernetes Pod</p>
                <p className="text-sm">Запускается с K8s Service Account</p>
              </div>
            )
          },
          {
            id: 'ksa',
            label: 'K8s Service Account',
            variant: 'service',
            tooltip: (
              <div>
                <p className="font-semibold mb-1">K8s SA</p>
                <p className="text-sm">
                  Аннотация: iam.gke.io/gcp-service-account
                </p>
              </div>
            )
          },
          {
            id: 'wi',
            label: 'Workload Identity',
            variant: 'external',
            tooltip: (
              <div>
                <p className="font-semibold mb-1">Workload Identity</p>
                <p className="text-sm">
                  GKE Metadata Server предоставляет токен
                </p>
              </div>
            )
          },
          {
            id: 'gcpsa',
            label: 'GCP Service Account',
            variant: 'external',
            tooltip: (
              <div>
                <p className="font-semibold mb-1">GCP SA</p>
                <p className="text-sm">
                  IAM роли: roles/pubsub.publisher
                </p>
              </div>
            )
          },
          {
            id: 'api',
            label: 'Pub/Sub API',
            variant: 'queue'
          }
        ]}
        messages={[
          {
            id: '1',
            from: 'pod',
            to: 'ksa',
            label: 'Использует SA',
            variant: 'sync'
          },
          {
            id: '2',
            from: 'ksa',
            to: 'wi',
            label: 'Аннотация связывает',
            variant: 'async',
            tooltip: "Workload Identity binding создается через gcloud iam"
          },
          {
            id: '3',
            from: 'wi',
            to: 'gcpsa',
            label: 'Получить токен GCP',
            variant: 'sync',
            tooltip: "Токен автоматически ротируется каждый час"
          },
          {
            id: '4',
            from: 'gcpsa',
            to: 'api',
            label: 'Аутентифицированный вызов',
            variant: 'sync',
            tooltip: "Pub/Sub API проверяет IAM роли GCP SA"
          }
        ]}
      />
    </DiagramContainer>
  );
}
```

### Example 3: Monitoring Hierarchy (Flattened)
```typescript
// Source: Lesson 06 - End-to-End Monitoring
// Pattern: Flattened monitoring points with color coding

export function MonitoringHierarchy() {
  return (
    <DiagramContainer
      title="Monitoring Points по компонентам"
      color="rose"
      description="Ключевые метрики для каждого сервиса CDC pipeline"
    >
      <div className="grid md:grid-cols-3 gap-4">
        {/* Cloud SQL Metrics */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-purple-200">Cloud SQL</h3>
          <Tooltip content="CPU utilization > 80% → scale up instance tier">
            <FlowNode variant="gcp-monitoring" size="sm">
              CPU/Memory
            </FlowNode>
          </Tooltip>
          <Tooltip content="WAL bloat из-за неактивного replication slot">
            <FlowNode variant="gcp-monitoring" size="sm">
              Disk Utilization
            </FlowNode>
          </Tooltip>
          <Tooltip content="pg_wal_lsn_diff показывает отставание слота">
            <FlowNode variant="gcp-monitoring" size="sm">
              Replication Lag
            </FlowNode>
          </Tooltip>
        </div>

        {/* Debezium Metrics */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-emerald-200">Debezium Server</h3>
          <Tooltip content="MilliSecondsBehindSource > 60000 → alert">
            <FlowNode variant="gcp-monitoring" size="sm">
              Replication Lag
            </FlowNode>
          </Tooltip>
          <Tooltip content="Throughput в событиях в секунду">
            <FlowNode variant="gcp-monitoring" size="sm">
              Events/sec
            </FlowNode>
          </Tooltip>
          <Tooltip content="QueueRemainingCapacity < 20% → backpressure">
            <FlowNode variant="gcp-monitoring" size="sm">
              Queue Capacity
            </FlowNode>
          </Tooltip>
        </div>

        {/* Pub/Sub Metrics */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-200">Pub/Sub</h3>
          <Tooltip content="oldest_unacked_message_age > 300s → consumer lag">
            <FlowNode variant="gcp-monitoring" size="sm">
              Message Age
            </FlowNode>
          </Tooltip>
          <Tooltip content="num_undelivered_messages — размер backlog">
            <FlowNode variant="gcp-monitoring" size="sm">
              Backlog Size
            </FlowNode>
          </Tooltip>
          <Tooltip content="dead_letter_message_count > 0 → poison messages">
            <FlowNode variant="gcp-monitoring" size="sm">
              DLQ Count
            </FlowNode>
          </Tooltip>
        </div>
      </div>

      {/* Unified Dashboard */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-3">
          <FlowNode variant="gcp-monitoring" size="sm">
            Cloud Monitoring
          </FlowNode>
          <Arrow direction="right" />
          <FlowNode variant="app" size="sm">
            Unified Dashboard
          </FlowNode>
          <Arrow direction="right" />
          <FlowNode variant="app" size="sm">
            Alert Policies
          </FlowNode>
        </div>
      </div>
    </DiagramContainer>
  );
}
```

### Example 4: Dataflow End-to-End Pipeline
```typescript
// Source: Lesson 04 - Dataflow to BigQuery
// Pattern: Complex multi-stage pipeline with subgraphs

export function DataflowPipeline() {
  return (
    <DiagramContainer
      title="CDC → BigQuery Pipeline"
      color="blue"
      description="Managed Dataflow template для репликации CDC событий"
    >
      {/* Source Stage */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <DiagramContainer title="Source" color="purple" className="flex-shrink-0">
            <FlowNode variant="gcp-database" size="sm">
              Cloud SQL<br/>PostgreSQL
            </FlowNode>
          </DiagramContainer>
          <Arrow direction="right" label="WAL" />
          <DiagramContainer title="CDC Engine" color="emerald">
            <FlowNode variant="connector" size="sm">
              Debezium<br/>Server
            </FlowNode>
          </DiagramContainer>
          <Arrow direction="right" label="CDC Events" />
          <DiagramContainer title="Messaging" color="amber">
            <FlowNode variant="gcp-messaging" size="sm">
              Pub/Sub<br/>Topics
            </FlowNode>
          </DiagramContainer>
        </div>

        {/* Processing Stage */}
        <div className="flex items-center gap-3">
          <DiagramContainer title="Stream Processing" color="emerald">
            <div className="flex flex-col gap-2">
              <FlowNode variant="gcp-compute" size="sm">
                Dataflow Job
              </FlowNode>
              <div className="text-xs text-emerald-200/70">
                MERGE каждые 60s
              </div>
            </div>
          </DiagramContainer>
          <div className="flex flex-col gap-2">
            <Arrow direction="right" label="Raw Events" />
            <Arrow direction="right" label="MERGE" dashed />
          </div>
          <DiagramContainer title="Storage" color="blue">
            <div className="flex flex-col gap-2">
              <Tooltip content="Staging: полная история всех CDC операций">
                <FlowNode variant="gcp-storage" size="sm">
                  BigQuery<br/>Changelog
                </FlowNode>
              </Tooltip>
              <Tooltip content="Current state: результат MERGE операций">
                <FlowNode variant="gcp-storage" size="sm">
                  BigQuery<br/>Replica
                </FlowNode>
              </Tooltip>
            </div>
          </DiagramContainer>
        </div>
      </div>
    </DiagramContainer>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| **Static Mermaid diagrams** | Interactive glass components with tooltips | Module 2 migration (Phase 28) | Better accessibility, Russian explanations on-demand |
| **Generic node colors** | GCP brand-aligned color scheme | Module 7 (this phase) | Service recognition, professional appearance |
| **Deep subgraph nesting** | Flattened containers with color coding | Module 3-4 learnings | Reduced complexity, better mobile rendering |
| **Separate diagrams per concept** | Comparison layouts (side-by-side) | Module 2 patterns | Direct contrast for architecture decisions |

**GCP-specific updates:**
- **Workload Identity over Service Account Keys:** Visual anti-pattern marking (red borders)
- **Serverless auto-scaling representation:** Sequence diagrams showing dynamic instance creation
- **Managed service emphasis:** GCP-specific variants differentiate from generic infrastructure

## Open Questions

1. **Icon vs Text Labels for GCP Services**
   - What we know: Text labels are clearer for education
   - What's unclear: Would small service icons (Cloud SQL logo) add recognition value?
   - Recommendation: Start with text labels, add icons only if user feedback requests visual aids

2. **Animation for Auto-Scaling Diagrams**
   - What we know: Static states work for educational content
   - What's unclear: Would subtle fade-in/out for Cloud Run instances enhance understanding?
   - Recommendation: Use static states in Phase 34, consider animation in future if needed

3. **Monitoring Dashboard Layout Fidelity**
   - What we know: Nested containers can represent dashboard structure
   - What's unclear: How much Cloud Monitoring UI detail to include?
   - Recommendation: Focus on conceptual hierarchy (metrics → alerts), not UI chrome

## Sources

### Primary (HIGH confidence)
- Module 7 MDX files (6 lessons) - Direct audit of Mermaid diagrams
- Existing primitives (FlowNode, SequenceDiagram, DiagramContainer) - Verified implementations
- Phase 28-30 research documents - Proven patterns from previous modules

### Secondary (MEDIUM confidence)
- GCP Brand Guidelines - Color palette (#4285f4 blue, #34a853 green, #fbbc04 amber, #ea4335 red)
- Tailwind Opacity Variants - /20 and /40 opacity tested in existing diagrams

### Tertiary (LOW confidence)
- Auto-scaling animation requirements - No current examples, may need user testing

## Metadata

**Confidence breakdown:**
- Diagram count and inventory: HIGH - Direct file audit
- GCP color scheme: HIGH - Official brand colors verified
- Component patterns: HIGH - Based on working implementations (Modules 2-4)
- Complexity assessment: MEDIUM - Subjective criteria, needs validation during implementation
- Animation requirements: LOW - No existing examples, speculative

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - stable diagram structure)
**Module lessons:** 6 lessons (01-06 in module 07)
**Total diagrams:** 14 Mermaid diagrams

**Recommended plan split:** 3 waves
- Wave 1 (Plan 34-01): 5 diagrams (Lessons 01-02) - Foundation services
- Wave 2 (Plan 34-02): 5 diagrams (Lessons 03-04) - Consumer services
- Wave 3 (Plan 34-03): 4 diagrams (Lessons 05-06) - Event-driven + monitoring

**New primitives needed:** 6 GCP-specific FlowNode variants (gcp-database, gcp-messaging, gcp-compute, gcp-storage, gcp-monitoring, gcp-security)

---

**Research complete.** Ready for Phase 34 planning.
