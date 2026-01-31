# Features Research: Debezium Course for Middle+ Data Engineers

**Domain:** Interactive technical course on Debezium and Change Data Capture
**Target Audience:** Middle+ data engineers
**Researched:** 2026-01-31
**Research Confidence:** HIGH

## Executive Summary

Based on ecosystem research, a comprehensive Debezium course for middle+ data engineers must balance three critical dimensions:

1. **Table Stakes Topics** - Core CDC concepts, connector configuration, and basic Kafka integration that any Debezium course must cover
2. **Differentiating Topics** - Production-focused content on pitfalls, monitoring, advanced deployment patterns, and cloud integrations (Aurora, GCP) that separate a professional course from beginner tutorials
3. **Hands-On Integration** - Practical exercises using Docker Compose, Python consumers, and real data processing workflows that mirror production scenarios

The research reveals that most existing courses focus narrowly on basic setup with MySQL. This course can differentiate by emphasizing:
- Production operational concerns (WAL management, monitoring, scaling)
- Cloud-native deployments (Aurora, Cloud SQL, Pub/Sub)
- Multiple deployment models (Kafka Connect, Debezium Server, embedded)
- Real data engineering workflows (Python/Pandas/PyFlink processing)
- Architecture patterns (Outbox, event sourcing, CQRS)

---

## Table Stakes Topics

### Category 1: CDC Fundamentals
Topics that establish the foundation - without these, students won't understand what Debezium does.

| Topic | Why Expected | Complexity | Dependencies | Notes |
|-------|--------------|------------|--------------|-------|
| What is Change Data Capture | Core concept understanding | Low | None | Foundation for entire course |
| Log-based CDC vs Polling CDC | Understanding Debezium's approach | Low | CDC Fundamentals | Critical for design decisions |
| CDC vs Event Sourcing | Architectural clarity | Medium | CDC Fundamentals | Often confused; clarify differences |
| Transaction log internals (WAL, binlog, oplog) | Understanding data source | Medium | CDC Fundamentals | Database-specific but essential |
| ACID guarantees in CDC | Data consistency understanding | Medium | CDC Fundamentals, Transaction logs | Production correctness requirements |

**Practical Exercise:** Compare log-based vs polling CDC with simple examples showing lag and accuracy differences.

### Category 2: Debezium Architecture
Understanding how Debezium works internally and deployment options.

| Topic | Why Expected | Complexity | Dependencies | Notes |
|-------|--------------|------------|--------------|-------|
| Debezium connector architecture | Core system understanding | Medium | CDC Fundamentals | How connectors read logs |
| Kafka Connect deployment model | Standard deployment pattern | Medium | Basic Kafka knowledge | Industry standard approach |
| Debezium Server (standalone) | Kafka-less alternative | Medium | Debezium architecture | Growing in popularity, simpler ops |
| Embedded Engine (AsyncEmbeddedEngine) | Application-embedded CDC | High | Debezium architecture | For custom applications |
| Connector task model & parallelism | Scaling understanding | High | Kafka Connect | Single-threaded limitations |

**Practical Exercise:** Deploy same connector using Kafka Connect and Debezium Server, compare operational complexity.

### Category 3: PostgreSQL Connector Setup
Deep dive into PostgreSQL (including Aurora) - primary focus based on project context.

| Topic | Why Expected | Complexity | Dependencies | Notes |
|-------|--------------|------------|--------------|-------|
| Logical decoding & pgoutput plugin | PostgreSQL CDC foundation | High | PostgreSQL internals | Essential for Postgres CDC |
| Replication slots configuration | Connection to transaction log | High | Logical decoding | Critical for reliable streaming |
| WAL configuration (wal_level=logical) | Database preparation | Medium | Replication slots | Common misconfiguration |
| Publication/subscription model | PostgreSQL logical replication | High | Logical decoding | How pgoutput works |
| Permissions & security (replication user) | Least-privilege setup | Medium | Replication slots | Production security requirement |
| Aurora PostgreSQL specific config | Cloud RDS/Aurora considerations | High | PostgreSQL connector | Parameter groups, restart requirements |
| Aurora failover & replica handling | HA scenarios | High | Aurora config | Replication slot sync issues |

**Practical Exercise:** Configure Aurora PostgreSQL for Debezium, handle parameter group changes, test failover scenarios.

### Category 4: Kafka Integration Basics
How Debezium integrates with Kafka ecosystem.

| Topic | Why Expected | Complexity | Dependencies | Notes |
|-------|--------------|------------|--------------|-------|
| Kafka topics & partitioning for CDC | Data organization | Medium | Basic Kafka | One topic per table default |
| Event structure & envelope format | Understanding CDC events | Medium | None | Before/after state, metadata |
| Avro vs JSON serialization | Schema management | Medium | Kafka basics | Schema Registry integration |
| Kafka Connect REST API | Connector management | Low | Kafka Connect | Deploy, pause, restart connectors |
| Consumer offset management | Reliable processing | Medium | Kafka basics | Exactly-once semantics |

**Practical Exercise:** Consume Debezium events in Python, parse envelope, extract before/after states.

### Category 5: Snapshot Strategies
Initial data synchronization approaches.

| Topic | Why Expected | Complexity | Dependencies | Notes |
|-------|--------------|------------|--------------|-------|
| Initial snapshot mechanics | Bootstrapping CDC pipeline | High | Connector architecture | How first data load works |
| Snapshot modes (initial, always, never, etc) | Control over snapshots | Medium | Snapshot mechanics | When to use each mode |
| Incremental snapshots | Non-blocking snapshots | High | Snapshot mechanics | Key feature since Debezium 1.6 |
| Large table handling & chunking | Practical production concern | High | Incremental snapshots | Chunk size tuning |
| Snapshot recovery & resumption | Fault tolerance | High | Incremental snapshots | Avoiding full re-snapshot |
| Read-only replica snapshotting | Production database protection | High | Incremental snapshots | Aurora reader instances |

**Practical Exercise:** Configure incremental snapshot for multi-million row table, monitor progress with signaling table.

---

## Differentiating Topics

These topics make this course stand out from basic Debezium tutorials by focusing on production realities.

### Category 6: Production Operational Concerns
The "hard parts" that tutorials skip but production teams must handle.

| Topic | Value Proposition | Complexity | Dependencies | Notes |
|-------|-------------------|------------|--------------|-------|
| WAL/replication slot bloat prevention | Prevents database outages | High | PostgreSQL connector | 4-6 FTE problem at scale (Netflix/Robinhood) |
| Monitoring with JMX metrics | Operational visibility | High | Kafka Connect | MilliSecondsBehindSource is critical |
| Prometheus/Grafana integration | Production monitoring stack | Medium | Monitoring basics | Hands-on dashboard building |
| Connector lag detection & alerting | SLA management | Medium | Monitoring | Proactive issue detection |
| Backpressure handling | Performance tuning | High | Connector internals | What happens when consumer is slow |
| Kafka Connect scaling patterns | Capacity planning | High | Kafka Connect | Task distribution, resource allocation |
| Disaster recovery & failover | Business continuity | High | Multiple prior topics | Connector state, offset management |

**Practical Exercise:** Set up complete monitoring stack, trigger WAL bloat scenario, detect and remediate using metrics.

### Category 7: GCP Integration (Differentiator)
Cloud-native deployment to GCP services - rarely covered in existing courses.

| Topic | Value Proposition | Complexity | Dependencies | Notes |
|-------|-------------------|------------|--------------|-------|
| Cloud SQL PostgreSQL for Debezium | GCP-native source | High | PostgreSQL connector | VPC networking, flags |
| Debezium Server to Pub/Sub | Kafka-less GCP architecture | High | Debezium Server | Direct Pub/Sub sink |
| Dataflow templates for CDC | Managed streaming to BigQuery | Medium | Pub/Sub integration | Google-provided templates |
| IAM & Workload Identity | GCP security | Medium | GCP basics | Service account best practices |
| Cloud Run event processing | Serverless CDC consumers | Medium | Pub/Sub | Real-time event-driven functions |
| BigQuery sync patterns | Analytics destination | Medium | Dataflow | Schema evolution handling |

**Practical Exercise:** Build complete pipeline: Cloud SQL → Debezium Server → Pub/Sub → Cloud Run consumer → BigQuery.

### Category 8: Advanced Transformations (SMTs)
Powerful event manipulation before downstream consumption.

| Topic | Value Proposition | Complexity | Dependencies | Notes |
|-------|-------------------|------------|--------------|-------|
| Single Message Transformations overview | Event pipeline customization | Medium | Kafka Connect | Built-in transformation framework |
| Message filtering with predicates | Reduce event volume | Medium | SMT basics | Filter by table, operation, content |
| Topic routing strategies | Multi-tenant patterns | Medium | SMT basics | Route to different topics by content |
| Content-based routing | Complex routing logic | High | Topic routing | Groovy/JavaScript expressions |
| Partition routing | Kafka optimization | High | Kafka internals | Custom partitioning strategies |
| Field masking & PII handling | Data privacy compliance | Medium | SMT basics | GDPR/compliance requirements |
| Event flattening | Simplify consumer logic | Low | SMT basics | Flatten nested structures |

**Practical Exercise:** Build SMT chain that filters, masks PII, routes to topic based on event type, all declaratively.

### Category 9: Outbox Pattern & Event-Driven Architecture
Advanced architectural patterns for microservices.

| Topic | Value Proposition | Complexity | Dependencies | Notes |
|-------|-------------------|------------|--------------|-------|
| Outbox pattern fundamentals | Reliable microservices communication | High | CDC fundamentals | Transactional guarantees |
| Outbox Event Router SMT | Outbox implementation | High | SMT basics, Outbox pattern | Transform outbox table to events |
| Event sourcing vs CDC | Architectural decision making | High | CDC vs Event Sourcing | When to use each |
| CQRS with Debezium | Read/write separation | High | Outbox, Event sourcing | Projection patterns |
| Saga pattern implementation | Distributed transactions | High | Outbox pattern | Cross-service orchestration |

**Practical Exercise:** Implement order service with outbox table, use Debezium to publish domain events reliably.

### Category 10: Schema Evolution & Change Management
Handling schema changes without breaking pipelines.

| Topic | Value Proposition | Complexity | Dependencies | Notes |
|-------|-------------------|------------|--------------|-------|
| Schema change event capture | Tracking DDL | Medium | Connector basics | MySQL/Postgres DDL events |
| Schema Registry integration | Schema versioning | High | Avro serialization | Confluent Schema Registry |
| Avro schema evolution rules | Backward/forward compatibility | High | Schema Registry | Compatibility modes |
| Handling backward-incompatible changes | Production change management | High | Schema evolution | Migration strategies |
| Zero-downtime schema migrations | Continuous availability | High | Multiple prior topics | Blue/green, expand/contract patterns |

**Practical Exercise:** Perform schema migration (add column, change type), observe Debezium behavior, handle in downstream consumers.

### Category 11: Stream Processing Integration
Connecting CDC to analytics and ML pipelines.

| Topic | Value Proposition | Complexity | Dependencies | Notes |
|-------|-------------------|------------|--------------|-------|
| Python Kafka consumers (confluent-kafka) | Data engineering integration | Medium | Kafka basics | Primary tool for DE work |
| Pandas DataFrame integration | Data analysis workflows | Medium | Python consumers | Convert CDC events to DataFrames |
| PyFlink CDC integration | Real-time stream processing | High | Flink basics | Native Debezium support |
| PySpark Structured Streaming | Batch + streaming | High | Spark basics | Kafka source, CDC processing |
| State management in stream processing | Stateful computations | High | PyFlink/PySpark | Joins, aggregations on CDC streams |
| Real-time ML feature pipelines | Production ML systems | High | Stream processing | Feature stores, online learning |

**Practical Exercise:** Build streaming pipeline: Debezium → Kafka → PyFlink → feature aggregation → ML model serving.

### Category 12: Multiple Database Support
Broadening beyond PostgreSQL to other sources.

| Topic | Value Proposition | Complexity | Dependencies | Notes |
|-------|-------------------|------------|--------------|-------|
| MySQL/Aurora MySQL connector | Second most common DB | High | Connector architecture | Binlog vs WAL differences |
| Cross-database CDC comparison | Technology selection | Medium | PostgreSQL + MySQL | When to use which approach |
| MongoDB change streams | NoSQL CDC | Medium | Connector architecture | Oplog vs change streams |
| Multi-source aggregation | Polyglot persistence | High | Multiple connectors | Joining data from different DBs |

**Practical Exercise:** Set up MySQL connector, compare configuration and behavior to PostgreSQL, identify pitfalls.

---

## Anti-Features

Topics to explicitly avoid or defer - they distract from core learning or are not relevant to target audience.

### Topics to Avoid Entirely

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| ZooKeeper deep-dive | ZooKeeper being removed from Kafka | Brief mention only, focus on KRaft mode |
| Oracle/Db2/SQL Server connectors | Not in project scope (PostgreSQL/Aurora focus) | Mention existence, defer to docs |
| Debezium UI in depth | Experimental, not production-grade | Show demo, don't build curriculum around it |
| Legacy embedded engine (non-async) | Deprecated in favor of AsyncEmbeddedEngine | Only teach AsyncEmbeddedEngine |
| Kafka Streams integration | Separate topic, not core to Debezium | Mention briefly, focus on Flink/Spark |
| Building custom connectors | Too advanced, rarely needed | Point to docs if students ask |
| Deep Kafka internals (replicas, ISR, etc) | Prerequisite knowledge, not Debezium-specific | Assume basic Kafka knowledge |

### Topics to Defer to Advanced/Optional Modules

| Topic | Why Defer | When to Include |
|-------|-----------|-----------------|
| Kubernetes deployment | Operational complexity | Optional advanced module |
| Multi-region active-active CDC | Extremely complex | Optional architecture module |
| Performance benchmarking methodology | Time-consuming, environment-dependent | Optional performance module |
| Custom SMT development | Java programming required | Optional extension module |
| Exactly-once semantics deep-dive | Advanced Kafka topic | Brief mention, link to resources |
| Cassandra connector | Different architecture (not log-based) | Optional NoSQL module |

### Topics That Sound Relevant But Aren't

| Topic | Why Not Relevant | Reality Check |
|-------|------------------|---------------|
| Kafka administration | Separate skillset | Assume Kafka already running, focus on Debezium |
| Database administration deep-dive | DBA course, not CDC course | Cover only CDC-relevant DB config |
| Data modeling & normalization | Database design course | Assume schema exists, focus on capturing changes |
| Infrastructure as Code (Terraform, etc) | DevOps course | Provide Docker Compose, not full IaC |
| General distributed systems theory | CS fundamentals course | Apply to CDC, don't teach from scratch |

---

## Topic Dependencies

### Prerequisite Knowledge (Assumed)

Students should already know:
- SQL fundamentals and relational database concepts
- Basic Kafka concepts (topics, producers, consumers, partitions)
- Python programming (intermediate level)
- Docker and Docker Compose basics
- Basic Linux command line
- JSON data format

### Learning Path: Beginner to Advanced

```
Foundation Layer (Week 1-2)
├── CDC Fundamentals
├── Debezium Architecture Overview
├── Docker Compose Environment Setup
└── Basic Kafka Integration

PostgreSQL Deep-Dive (Week 3-4)
├── PostgreSQL Connector Architecture
│   ├── Logical Decoding & Replication Slots
│   ├── WAL Configuration
│   └── Permissions Setup
├── Aurora PostgreSQL Configuration
└── Snapshot Strategies
    ├── Initial Snapshots
    └── Incremental Snapshots

Production Operations (Week 5-6)
├── Monitoring & Metrics
│   ├── JMX Metrics
│   ├── Prometheus/Grafana
│   └── Lag Detection
├── Operational Pitfalls
│   ├── WAL Bloat Management
│   ├── Backpressure Handling
│   └── Disaster Recovery
└── Scaling Patterns

Advanced Patterns (Week 7-8)
├── Single Message Transformations
│   ├── Filtering & Routing
│   ├── PII Masking
│   └── Content-Based Routing
├── Outbox Pattern
│   ├── Event-Driven Architecture
│   └── Outbox Event Router SMT
└── Schema Evolution
    ├── Schema Registry
    └── Zero-Downtime Migrations

Data Engineering Integration (Week 9-10)
├── Python Consumer Development
│   ├── confluent-kafka Library
│   └── Pandas Integration
├── Stream Processing
│   ├── PyFlink CDC
│   └── PySpark Structured Streaming
└── Real-World Pipelines
    ├── ETL/ELT Patterns
    └── Feature Engineering

Cloud-Native Deployment (Week 11-12)
├── GCP Integration
│   ├── Cloud SQL Setup
│   ├── Debezium Server to Pub/Sub
│   ├── Dataflow Templates
│   └── Cloud Run Consumers
├── Alternative Deployment Models
│   ├── Debezium Server Standalone
│   └── Embedded Engine Use Cases
└── Capstone Project
    └── End-to-End Pipeline: Aurora → Pub/Sub → PyFlink → BigQuery
```

### Critical Path Dependencies

**Must Learn Before:**
1. Logical Decoding → Replication Slots → PostgreSQL Connector
2. Kafka Basics → Kafka Connect → Debezium Deployment
3. Event Envelope → SMTs → Outbox Pattern
4. Initial Snapshots → Incremental Snapshots → Large Table Handling
5. JMX Metrics → Prometheus → Production Monitoring

**Parallel Tracks (Can Learn Independently):**
- Python consumers can be learned alongside connector configuration
- GCP integration independent of on-prem deployment
- MySQL connector independent of PostgreSQL (after core concepts)
- Stream processing (Flink/Spark) after basic consumer development

---

## Recommended Course Structure

### Module 1: Foundations (2 weeks)
**Learning Objective:** Understand CDC concepts and deploy first Debezium connector

**Topics:**
- What is Change Data Capture & why it matters
- Log-based CDC vs alternatives
- Debezium architecture overview
- Docker Compose environment setup
- Kafka integration basics
- Deploy PostgreSQL connector (local)
- Consume events in Python

**Hands-On:**
- Lab 1: Docker Compose stack setup (PostgreSQL, Kafka, Debezium)
- Lab 2: Configure first connector via REST API
- Lab 3: Python consumer - parse CDC events, print before/after states

**Success Criteria:** Student can deploy Debezium, capture changes, consume in Python

### Module 2: PostgreSQL & Aurora Deep-Dive (2 weeks)
**Learning Objective:** Master PostgreSQL connector configuration for production

**Topics:**
- PostgreSQL internals: WAL, logical decoding, replication slots
- Publication/subscription model
- Aurora-specific configuration (parameter groups, flags)
- Permissions & security best practices
- Snapshot strategies (initial vs incremental)
- Failover & high availability considerations

**Hands-On:**
- Lab 4: Configure Aurora PostgreSQL for Debezium
- Lab 5: Set up incremental snapshot for large table
- Lab 6: Simulate failover, observe replication slot behavior
- Lab 7: WAL bloat scenario - detect and remediate

**Success Criteria:** Student can configure Aurora for CDC, handle snapshots, understand HA implications

### Module 3: Production Operations (2 weeks)
**Learning Objective:** Operate Debezium reliably in production

**Topics:**
- JMX metrics & monitoring
- Prometheus/Grafana dashboard setup
- Lag detection & alerting
- Connector task model & scaling
- Backpressure handling
- Disaster recovery procedures
- Version upgrade strategies

**Hands-On:**
- Lab 8: Deploy Prometheus/Grafana, build monitoring dashboard
- Lab 9: Configure alerts for lag and connector failures
- Lab 10: Scaling exercise - add tasks, observe behavior
- Lab 11: Backup/restore connector state

**Success Criteria:** Student can monitor Debezium, detect issues proactively, scale connectors

### Module 4: Advanced Transformations & Patterns (2 weeks)
**Learning Objective:** Implement complex event routing and architectural patterns

**Topics:**
- Single Message Transformations (SMTs)
- Filtering, routing, masking
- Content-based routing with predicates
- Outbox pattern fundamentals
- Outbox Event Router SMT
- Event-driven architecture patterns
- Schema evolution & Schema Registry

**Hands-On:**
- Lab 12: Build SMT pipeline (filter + mask + route)
- Lab 13: Implement outbox pattern for order service
- Lab 14: Schema Registry integration, test schema evolution
- Lab 15: Handle backward-incompatible schema change

**Success Criteria:** Student can implement outbox pattern, configure complex SMTs, manage schema evolution

### Module 5: Data Engineering Integration (2 weeks)
**Learning Objective:** Build real-world data pipelines with CDC events

**Topics:**
- Python consumer development (confluent-kafka)
- Pandas DataFrame integration
- PyFlink CDC connector & processing
- PySpark Structured Streaming
- Stateful stream processing
- ETL/ELT patterns with CDC
- Real-time feature engineering

**Hands-On:**
- Lab 16: Python consumer with error handling, exactly-once semantics
- Lab 17: PyFlink job - aggregate CDC events, maintain state
- Lab 18: PySpark - join CDC streams with batch data
- Lab 19: Real-time feature pipeline for ML model

**Success Criteria:** Student can build production-grade stream processing pipelines using CDC data

### Module 6: Cloud-Native Deployment (GCP) (2 weeks)
**Learning Objective:** Deploy Debezium in cloud-native GCP architecture

**Topics:**
- Cloud SQL PostgreSQL configuration
- Debezium Server to Pub/Sub (Kafka-less)
- Dataflow templates for CDC
- IAM & Workload Identity
- Cloud Run event processing
- BigQuery sync patterns
- Cost optimization strategies

**Hands-On:**
- Lab 20: Configure Cloud SQL for Debezium
- Lab 21: Deploy Debezium Server with Pub/Sub sink
- Lab 22: Dataflow template - Cloud SQL to BigQuery sync
- Lab 23: Cloud Run function triggered by CDC events
- Lab 24: End-to-end monitoring in GCP (Cloud Monitoring)

**Success Criteria:** Student can deploy serverless CDC pipeline entirely on GCP

### Capstone Project (Final Week)
**Project:** Build production-ready CDC pipeline

**Requirements:**
- Source: Aurora PostgreSQL (multi-table)
- Transformation: Outbox pattern + SMT filtering/routing
- Processing: PyFlink for aggregations and feature engineering
- Destinations:
  - BigQuery (analytics)
  - Pub/Sub (real-time events)
  - Cloud Run (event-driven actions)
- Monitoring: Full observability stack
- Documentation: Architecture diagram, runbook, troubleshooting guide

**Deliverables:**
- Working code repository
- Docker Compose for local dev
- GCP deployment scripts
- Monitoring dashboard
- Architecture documentation

---

## Practical Exercise Requirements

### Exercise Design Principles

For middle+ engineers, exercises must:
1. **Mirror production scenarios** - Not toy examples
2. **Include failure modes** - Things should break and students fix them
3. **Require troubleshooting** - Don't give step-by-step instructions, give outcomes
4. **Scale complexity progressively** - Start simple, add real-world constraints
5. **Integrate multiple technologies** - CDC + Kafka + Python + Cloud

### Hands-On Environment Requirements

**Docker Compose Stack:**
- PostgreSQL 15+ (with logical replication enabled)
- Kafka 3.x (KRaft mode, no ZooKeeper)
- Debezium 3.x connectors
- Schema Registry
- Prometheus & Grafana
- Python 3.11+ environment
- JupyterLab for interactive development

**ARM64/Apple Silicon Compatibility:**
- All images must support ARM64 architecture
- Use multi-arch images or explicit ARM64 variants
- Test on macOS M1/M2/M3 machines
- Provide troubleshooting guide for platform-specific issues

**GCP Integration:**
- Cloud SQL PostgreSQL instance (dev tier)
- Pub/Sub topics
- Dataflow (use free tier templates)
- Cloud Run (free tier)
- BigQuery (sandbox mode)
- Workload Identity for authentication

### Exercise Progression Pattern

**Level 1 (Modules 1-2): Guided Setup**
- Step-by-step with validation checkpoints
- Clear success criteria
- Immediate feedback on configuration errors

**Level 2 (Modules 3-4): Scenario-Based**
- Given: System requirements and constraints
- Task: Design and implement solution
- Validate: Against test cases

**Level 3 (Modules 5-6): Problem-Solving**
- Given: Broken system or performance issue
- Task: Diagnose and fix
- Learn: Root cause analysis

**Level 4 (Capstone): Open-Ended Project**
- Given: Business requirements
- Task: Full architecture and implementation
- Evaluate: Design decisions, code quality, documentation

---

## Sources & Confidence Assessment

### High Confidence Topics (Verified via official documentation)
- PostgreSQL connector configuration - [Debezium PostgreSQL Connector Documentation](https://debezium.io/documentation/reference/stable/connectors/postgresql.html)
- Monitoring metrics categories - [Debezium Monitoring Documentation](https://debezium.io/documentation/reference/stable/operations/monitoring.html)
- Outbox Event Router SMT - [Debezium Outbox Event Router](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html)
- Message filtering and routing - [Debezium Transformations](https://debezium.io/documentation/reference/stable/transformations/index.html)
- Incremental snapshots - [Debezium Blog: Incremental Snapshots](https://debezium.io/blog/2021/10/07/incremental-snapshots/)
- Debezium Server architecture - [Debezium Server Documentation](https://debezium.io/documentation/reference/stable/operations/debezium-server.html)

### Medium Confidence Topics (Multiple credible sources)
- Production pitfalls and WAL bloat - [Debezium CDC Pain Points](https://estuary.dev/blog/debezium-cdc-pain-points/), [Lessons Learned from RDS](https://debezium.io/blog/2020/02/25/lessons-learned-running-debezium-with-postgresql-on-rds/)
- GCP Pub/Sub integration - [Cloud SQL to Pub/Sub via Debezium Server](https://medium.com/google-cloud/change-data-capture-with-debezium-server-on-gke-from-cloudsql-for-postgresql-to-pub-sub-d1c0b92baa98), [Postgres CDC with Debezium & Pub/Sub](https://infinitelambda.com/postgres-cdc-debezium-google-pubsub/)
- PyFlink integration - [Flink SQL with Debezium](https://www.morling.dev/blog/ingesting-debezium-events-from-kafka-with-flink-sql/), [Apache Flink Debezium Format](https://nightlies.apache.org/flink/flink-docs-release-2.2/docs/connectors/table/formats/debezium/)
- Python consumer patterns - [Real-time Data Replication with Debezium and Python](https://debezium.io/blog/2025/02/01/real-time-data-replication-with-debezium-and-python/)
- Outbox pattern implementation - [Reliable Microservices Data Exchange](https://debezium.io/blog/2019/02/19/reliable-microservices-data-exchange-with-the-outbox-pattern/)

### Low Confidence Topics (WebSearch only, needs validation)
- Specific ARM64/M1 Docker compatibility - No explicit 2026 documentation found, assumes Docker Desktop ARM64 support
- Exact PyFlink/PySpark curriculum integration - Examples found but not comprehensive course structures
- Detailed GCP cost optimization - General patterns found, specific CDC cost optimization not detailed

### Research Gaps
- Specific ARM64 Docker image availability for all components (need to verify each image)
- Production case studies from teams running Debezium at scale (found references to Netflix/Robinhood but not detailed write-ups)
- Comprehensive benchmark data for different deployment models (Kafka Connect vs Server vs Embedded)
- Detailed Dataflow template capabilities and limitations (found documentation but limited real-world examples)

---

## Additional Research Sources

### Official Resources
- [Debezium Documentation](https://debezium.io/documentation/)
- [Debezium Blog](https://debezium.io/blog/)
- [Debezium Examples Repository](https://github.com/debezium/debezium-examples)
- [Debezium Tutorial](https://debezium.io/documentation/reference/stable/tutorial.html)

### Training Courses Analyzed
- [NobleProg CDC Training](https://www.nobleprog.com/cc/debezium)
- [Udemy: CDC using Debezium for MySQL](https://www.udemy.com/course/debezium-for-mysql/)
- [Udemy: Transactional Outbox Pattern](https://www.udemy.com/course/transactional-outbox-pattern-with-debezium/)

### Production Insights
- [Debezium Production Pain Points (Estuary)](https://estuary.dev/blog/debezium-cdc-pain-points/)
- [Debezium vs Upsolver (Production Pitfalls)](https://www.upsolver.com/blog/debezium-vs-upsolver)
- [Practical Notes: Debezium with Postgres (Medium)](https://medium.com/cermati-tech/practical-notes-in-change-data-capture-with-debezium-and-postgres-fe31bb11ab78)
- [Skroutz: Schema Evolution with Debezium (AWS Blog)](https://aws.amazon.com/blogs/big-data/how-skroutz-handles-real-time-schema-evolution-in-amazon-redshift-with-debezium/)

### Cloud Integration
- [Google Cloud Dataflow CDC Templates](https://cloud.google.com/dataflow/docs/guides/templates/provided/mysql-change-data-capture-to-bigquery)
- [Debezium Server to Cloud PubSub (Medium)](https://medium.com/nerd-for-tech/debezium-server-to-cloud-pubsub-a-kafka-less-way-to-stream-changes-from-databases-1d6edc97da40)

### Stream Processing
- [Apache Flink Debezium Format Documentation](https://nightlies.apache.org/flink/flink-docs-release-2.2/docs/connectors/table/formats/debezium/)
- [Flink vs Spark for Stream Processing](https://www.decodable.co/blog/comparing-apache-flink-and-spark-for-modern-stream-data-processing)
- [Online ML with Flink and Spark (Debezium Blog)](https://debezium.io/blog/2023/09/23/flink-spark-online-learning/)

---

## Conclusion

This feature landscape positions the Debezium course to serve middle+ data engineers who need production-ready CDC skills. The differentiation comes from:

1. **Production Focus** - Heavy emphasis on operational concerns (monitoring, WAL management, scaling) that tutorials skip
2. **Cloud-Native Integration** - Deep GCP integration (Cloud SQL, Pub/Sub, Dataflow) with Debezium Server for Kafka-less deployments
3. **Real Data Engineering** - Python/Pandas/PyFlink integration reflecting actual DE workflows
4. **Architecture Patterns** - Outbox pattern, event-driven design, schema evolution strategies
5. **Hands-On Complexity** - Exercises that break, require troubleshooting, mirror production scenarios

**Recommendation for roadmap:** Structure phases around the 6-module progression above, with each module deliverable as standalone content while building on prerequisites. Prioritize Modules 1-3 for MVP (foundations + production ops), defer GCP integration to later phase if resource-constrained.
