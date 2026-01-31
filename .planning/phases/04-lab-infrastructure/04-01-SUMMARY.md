---
phase: 04-lab-infrastructure
plan: 01
subsystem: docker-infrastructure
tags: [docker-compose, kafka, postgres, debezium, schema-registry]
dependency-graph:
  requires: []
  provides: [core-cdc-stack, docker-compose-base]
  affects: [04-02, 04-03, 04-04]
tech-stack:
  added: [confluent-kafka-7.8.1, debezium-connect-2.5.4, postgres-15, confluent-schema-registry-7.8.1]
  patterns: [kraft-mode, health-checks, depends-on-conditions, env-file-templates]
key-files:
  created:
    - labs/docker-compose.yml
    - labs/.env.example
    - labs/postgres/init.sql
  modified: []
decisions:
  - id: confluent-kafka
    choice: "Confluent cp-kafka 7.8.1 instead of quay.io/debezium/kafka"
    reason: "JVM SIGILL crash on ARM64 Docker Desktop with Java 21 images"
  - id: debezium-2.5
    choice: "Debezium Connect 2.5.4.Final instead of 3.0.8.Final"
    reason: "Java 21 JVM crash; 2.5.4 uses Java 17 which works on ARM64"
  - id: postgres-port
    choice: "External port 5433 instead of 5432"
    reason: "Port 5432 already in use on host system"
metrics:
  duration: 8m
  completed: 2026-01-31
---

# Phase 04 Plan 01: Core Docker Compose Stack Summary

**One-liner:** Docker Compose with Confluent Kafka KRaft, Debezium 2.5 Connect, PostgreSQL logical replication, and Schema Registry for ARM64 macOS.

## What Was Built

### Task 1: Environment File with Version Pinning
Created `labs/.env.example` template with version variables:
- `DEBEZIUM_VERSION=2.5.4.Final` - Connect with PostgreSQL connector
- `CONFLUENT_VERSION=7.8.1` - Kafka and Schema Registry
- `POSTGRES_VERSION=15` - Source database
- `KAFKA_CLUSTER_ID` - Pre-generated UUID for KRaft mode

### Task 2: Sample PostgreSQL Schema
Created `labs/postgres/init.sql` with:
- `customers`, `products`, `orders`, `order_items` tables
- Sample data for immediate testing
- `dbz_publication` publication for Debezium pgoutput
- Replication permissions for postgres user

### Task 3: Docker Compose Configuration
Created `labs/docker-compose.yml` with 4 services:

| Service | Image | Purpose | Health Check |
|---------|-------|---------|--------------|
| postgres | postgres:15 | CDC source with wal_level=logical | pg_isready |
| kafka | confluentinc/cp-kafka:7.8.1 | Message broker (KRaft mode) | kafka-broker-api-versions |
| connect | quay.io/debezium/connect:2.5.4.Final | CDC connector platform | curl REST API |
| schema-registry | confluentinc/cp-schema-registry:7.8.1 | Avro schema management | curl /subjects |

## Verification Results

```
$ docker compose ps
NAME              STATUS         PORTS
postgres          healthy        0.0.0.0:5433->5432/tcp
kafka             healthy        0.0.0.0:9092->9092/tcp
connect           healthy        0.0.0.0:8083->8083/tcp, 9404/tcp
schema-registry   healthy        0.0.0.0:8081->8081/tcp

$ psql -U postgres -c "SHOW wal_level;"
 logical

$ curl http://localhost:8083/
{"version":"3.6.1","commit":"...","kafka_cluster_id":"oh-sxaDRTcyAr6pFRbXyzA"}

$ curl http://localhost:8081/subjects
[]
```

## Deviations from Plan

### [Rule 3 - Blocking] Java 21 JVM Crash on ARM64 Docker Desktop

**Found during:** Task 3 - Docker Compose verification
**Issue:** Both `quay.io/debezium/kafka:3.0.8.Final` and `quay.io/debezium/connect:3.0.8.Final` crashed immediately with:
```
SIGILL (0x4) at pc=0x0000ffff7f73fc5c
j java.lang.System.registerNatives()V+0 java.base
```
This is a known issue with Java 21 JIT compilation on ARM64 under Docker Desktop virtualization.

**Fix:**
1. Replaced `quay.io/debezium/kafka` with `confluentinc/cp-kafka:7.8.1` (Java 17)
2. Downgraded Debezium Connect from 3.0.8 to 2.5.4.Final (Java 17)

**Files modified:**
- `labs/docker-compose.yml`
- `labs/.env`
- `labs/.env.example`

**Impact:** Uses older Debezium version but fully functional. Course content may need adjustments if 3.x-specific features are required.

### [Rule 3 - Blocking] Port Conflict

**Found during:** Task 3 - Initial startup
**Issue:** Port 5432 already allocated on host
**Fix:** Changed `POSTGRES_PORT` from 5432 to 5433
**Files modified:** `labs/.env`, `labs/.env.example`

## Commits

| Hash | Message |
|------|---------|
| 9b38948 | chore(04-01): create environment file with version pinning |
| 5fa7530 | feat(04-01): create sample PostgreSQL schema for CDC exercises |
| 3b4bc52 | feat(04-01): create core Docker Compose configuration |

## Key Code

### Docker Compose Service Dependencies
```yaml
connect:
  depends_on:
    kafka:
      condition: service_healthy
    postgres:
      condition: service_healthy
```

### PostgreSQL Logical Replication
```yaml
postgres:
  command:
    - "postgres"
    - "-c"
    - "wal_level=logical"
    - "-c"
    - "max_replication_slots=10"
```

### Kafka KRaft Mode
```yaml
kafka:
  environment:
    KAFKA_NODE_ID: 1
    KAFKA_PROCESS_ROLES: broker,controller
    KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
    CLUSTER_ID: ${KAFKA_CLUSTER_ID}
```

## Next Phase Readiness

**Ready for:**
- 04-02: Monitoring stack (Prometheus/Grafana) - JMX port 9404 exposed on Connect
- 04-03: JupyterLab environment - Kafka accessible on port 9092
- 04-04: Integration testing - All services healthy and verified

**Potential issues:**
- Debezium 2.5 vs 3.x feature differences should be documented in course content
- Java 21 ARM64 issue may be resolved in future Docker Desktop/JVM updates
