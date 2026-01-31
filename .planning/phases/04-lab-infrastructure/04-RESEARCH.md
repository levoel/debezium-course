# Phase 4: Lab Infrastructure - Research

**Researched:** 2026-01-31
**Domain:** Docker Compose orchestration for Debezium CDC lab environment
**Confidence:** HIGH

## Summary

This research investigates the standard stack and best practices for creating a Docker Compose-based lab environment that enables students to run hands-on Debezium change data capture (CDC) exercises on ARM64 macOS (Apple Silicon). The investigation covers PostgreSQL with logical replication, Kafka in KRaft mode (no ZooKeeper), Debezium 3.x connectors, Schema Registry, Prometheus/Grafana monitoring, and JupyterLab for Python-based exercises.

The standard approach uses official Debezium Docker Compose examples from the debezium-examples repository as a foundation, with all container images now hosted on quay.io (Debezium stopped publishing to Docker Hub with version 3.0.0). ARM64 support was officially added in Debezium 3.0.8, making native Apple Silicon deployment fully viable. PostgreSQL's built-in pgoutput logical decoding plugin eliminates the need for custom images with wal2json or decoderbufs, simplifying the stack significantly.

Key architectural decisions include using Kafka's KRaft mode (mandatory as ZooKeeper support was removed in Kafka 4.0), implementing health checks with `depends_on` conditions for proper startup ordering, and mounting volumes for data persistence. The monitoring stack follows Debezium's official examples with JMX exporter, Prometheus, and Grafana dashboards specifically designed for CDC metrics.

**Primary recommendation:** Use quay.io/debezium images with version 3.0.8+ for ARM64 compatibility, PostgreSQL's built-in pgoutput plugin for logical decoding, Kafka in KRaft mode, and the official Debezium monitoring example as the foundation for the Docker Compose stack.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Debezium Connect | 3.0.8+ | CDC connector platform | Official Debezium image with ARM64 support, hosted on quay.io |
| PostgreSQL | 15+ | Source database with logical replication | Built-in pgoutput plugin, no custom images needed |
| Apache Kafka | 3.9.0 | Message broker for CDC events | KRaft mode eliminates ZooKeeper dependency |
| Confluent Schema Registry | 8.1.1+ | Avro schema management | Official ARM64 multi-arch images available |
| Prometheus | latest | Metrics collection | Standard monitoring for JMX metrics from Debezium |
| Grafana | latest | Metrics visualization | Official Debezium dashboards available |
| JupyterLab | jupyter/scipy-notebook | Interactive Python environment | Official Jupyter Docker Stacks, ARM64 native |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| JMX Exporter | latest | Expose JMX metrics to Prometheus | Required for Debezium monitoring |
| confluent-kafka-python | 2.13.0+ | Python Kafka client library | JupyterLab exercises, ARM64 wheels available |
| pandas | latest | Data analysis library | JupyterLab exercises for analyzing CDC data |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| pgoutput (built-in) | wal2json or decoderbufs | pgoutput is built-in to PostgreSQL 10+, no installation needed. Only use alternatives if specific encoding requirements exist |
| Kafka KRaft mode | ZooKeeper mode | ZooKeeper removed in Kafka 4.0, deprecated in 3.x. KRaft is mandatory going forward |
| quay.io/debezium | debezium/postgres custom image | Use official PostgreSQL image with pgoutput instead of Debezium's custom postgres image (which was for older decoderbufs support) |

**Installation:**
```bash
# No npm packages - this is Docker Compose infrastructure
# Pull images with:
docker compose pull
```

## Architecture Patterns

### Recommended Project Structure
```
debezium-lab/
├── docker-compose.yml          # Main orchestration file
├── .env                         # Environment variables (versions, ports)
├── monitoring/
│   ├── prometheus.yml          # Prometheus scrape configuration
│   └── grafana/
│       └── dashboards/         # Debezium monitoring dashboards
├── notebooks/                   # JupyterLab notebooks (volume mount)
│   ├── 01-setup.ipynb
│   ├── 02-consuming-events.ipynb
│   └── data/
├── postgres/
│   └── init.sql                # Sample schema and data
└── README.md                    # Student setup instructions
```

### Pattern 1: Service Startup Ordering with Health Checks
**What:** Use `depends_on` with `condition: service_healthy` to ensure services start only when dependencies are ready
**When to use:** Always in multi-service Docker Compose stacks where service A needs service B to be fully operational
**Example:**
```yaml
# Source: Docker Compose health checks best practices
# https://oneuptime.com/blog/post/2026-01-16-docker-compose-depends-on-healthcheck/view
services:
  postgres:
    image: postgres:15
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: inventory
    command: ["postgres", "-c", "wal_level=logical"]

  kafka:
    image: quay.io/debezium/kafka:3.0.8.Final
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions.sh", "--bootstrap-server", "localhost:9092"]
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 20s

  connect:
    image: quay.io/debezium/connect:3.0.8.Final
    depends_on:
      kafka:
        condition: service_healthy
      postgres:
        condition: service_healthy
```

### Pattern 2: Kafka KRaft Mode Configuration
**What:** Configure Kafka to run without ZooKeeper using KRaft metadata mode
**When to use:** All Kafka 3.x+ deployments (ZooKeeper deprecated and removed in 4.0)
**Example:**
```yaml
# Source: Debezium official tutorial Docker Compose
# https://github.com/debezium/debezium-examples/blob/main/tutorial/docker-compose-postgres.yaml
kafka:
  image: quay.io/debezium/kafka:3.0.8.Final
  ports:
    - "9092:9092"
  environment:
    CLUSTER_ID: "oh-sxaDRTcyAr6pFRbXyzA"  # Generate with kafka-storage.sh random-uuid
    NODE_ID: 1
    NODE_ROLE: combined                     # Single broker acts as both controller and broker
    KAFKA_CONTROLLER_QUORUM_VOTERS: "1@kafka:9093"
    KAFKA_LISTENERS: "PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093"
    KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://kafka:9092"
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT"
```

### Pattern 3: Volume Persistence for Development
**What:** Mount host directories as volumes to persist data across container restarts
**When to use:** Development/lab environments where data and notebooks should survive container lifecycle
**Example:**
```yaml
# Source: Docker Compose and JupyterLab volume best practices
# https://docs.docker.com/guides/jupyter/
services:
  postgres:
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql

  jupyter:
    image: jupyter/scipy-notebook:latest
    volumes:
      - ./notebooks:/home/jovyan/work  # Bind mount for easy editing
    environment:
      - JUPYTER_ENABLE_LAB=yes

volumes:
  postgres-data:
  kafka-data:
```

### Pattern 4: JMX Metrics Export for Monitoring
**What:** Enable JMX metrics from Debezium/Kafka Connect and expose via JMX Exporter for Prometheus
**When to use:** When monitoring Debezium connector performance, lag, and errors
**Example:**
```yaml
# Source: Debezium monitoring documentation
# https://debezium.io/documentation/reference/stable/operations/monitoring.html
connect:
  image: quay.io/debezium/connect:3.0.8.Final
  environment:
    BOOTSTRAP_SERVERS: kafka:9092
    GROUP_ID: 1
    CONFIG_STORAGE_TOPIC: connect_configs
    OFFSET_STORAGE_TOPIC: connect_offsets
    STATUS_STORAGE_TOPIC: connect_statuses
    # JMX configuration for Prometheus
    JMXHOST: 0.0.0.0
    JMXPORT: 9404
    JMXAUTH: "false"
    JMXSSL: "false"
  ports:
    - "8083:8083"  # REST API
    - "9404:9404"  # JMX metrics
```

### Anti-Patterns to Avoid
- **Using ZooKeeper with Kafka 3.x+:** ZooKeeper is deprecated and removed in Kafka 4.0. Always use KRaft mode.
- **No health checks on `depends_on`:** Without `condition: service_healthy`, dependent services start before dependencies are ready, causing connection failures.
- **Hardcoded passwords in docker-compose.yml:** Use `.env` files or Docker secrets. Never commit credentials.
- **Assuming containers use external ports internally:** Services communicate using internal ports and service names (e.g., `kafka:9092`), not exposed ports.
- **Using debezium/postgres image for PostgreSQL 10+:** The custom Debezium postgres image was needed for older PostgreSQL versions requiring decoderbufs. PostgreSQL 10+ has built-in pgoutput, so use the official `postgres` image.
- **Missing volumes for data persistence:** Without volumes, all Kafka topics, connector offsets, and database data are lost on `docker compose down`.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debezium monitoring dashboards | Custom Grafana dashboards from scratch | Official Debezium example dashboards | Debezium provides connector-specific dashboards with proper metrics, filters, and visualizations in debezium-examples/monitoring |
| Kafka cluster ID generation | Hardcoded random string | `kafka-storage.sh random-uuid` | KRaft requires valid UUID format; official tool ensures compatibility |
| PostgreSQL logical decoding setup | Custom docker image with wal2json | Official postgres image with `command: ["postgres", "-c", "wal_level=logical"]` | pgoutput is built-in to PostgreSQL 10+, no plugins needed |
| JupyterLab with Python data science packages | Custom Dockerfile installing scipy, pandas, etc. | jupyter/scipy-notebook official image | Maintained by Jupyter team, includes optimized builds of scientific Python stack |
| Health check scripts | Custom bash scripts checking ports | Built-in service health commands (pg_isready, kafka-broker-api-versions.sh) | Official tools understand service readiness beyond port availability |
| Connector configuration via manual REST calls | Custom scripts POSTing JSON to Kafka Connect | Debezium UI or documented curl examples | Debezium UI provides GUI for connector management; official examples ensure correct JSON structure |

**Key insight:** The Debezium ecosystem provides complete, tested examples for Docker Compose deployments. Starting with debezium-examples repository and extending it is far more reliable than building from scratch. Official images handle complex initialization, plugin loading, and configuration that custom solutions miss.

## Common Pitfalls

### Pitfall 1: PostgreSQL Not Configured for Logical Replication
**What goes wrong:** Debezium connector fails to start with "ERROR: logical decoding requires wal_level >= logical"
**Why it happens:** PostgreSQL's default `wal_level` is `replica`, which doesn't enable logical decoding
**How to avoid:** Set `wal_level=logical` via command line arguments in docker-compose.yml or postgresql.conf
**Warning signs:** Connector status shows error: "wal_level must be set to 'logical'", connector immediately fails on startup

```yaml
postgres:
  image: postgres:15
  command: ["postgres", "-c", "wal_level=logical"]
  # Additional recommended settings for Debezium:
  # -c max_replication_slots=10
  # -c max_wal_senders=10
```

### Pitfall 2: Image Registry Migration Not Reflected
**What goes wrong:** Docker Compose pulls fail with "repository debezium/connect not found" or pulls old, non-ARM64 images
**Why it happens:** Debezium stopped publishing to Docker Hub in version 3.0.0; all images moved to quay.io
**How to avoid:** Always use `quay.io/debezium/` image prefix, not `debezium/`
**Warning signs:** Image pull errors, or images work on x86 but fail on ARM64 Macs

```yaml
# WRONG - Docker Hub (no longer updated)
connect:
  image: debezium/connect:3.0.8.Final

# CORRECT - Quay.io (official registry)
connect:
  image: quay.io/debezium/connect:3.0.8.Final
```

### Pitfall 3: Ephemeral Data Loss on Container Restart
**What goes wrong:** All Kafka topics, connector offsets, and database data disappear after `docker compose down`
**Why it happens:** Without named volumes or bind mounts, container filesystems are ephemeral
**How to avoid:** Define named volumes for all stateful services (Kafka, PostgreSQL, Prometheus)
**Warning signs:** Students report "my connectors disappeared" or "database is empty" after restarting the stack

```yaml
volumes:
  postgres-data:
  kafka-data:
  prometheus-data:

services:
  postgres:
    volumes:
      - postgres-data:/var/lib/postgresql/data
  kafka:
    volumes:
      - kafka-data:/var/lib/kafka/data
```

### Pitfall 4: Connector Fails with "Connection Refused" Despite Services Running
**What goes wrong:** Kafka Connect starts before Kafka is ready, fails to connect, and doesn't retry properly
**Why it happens:** `depends_on` without health checks only waits for container start, not service readiness
**How to avoid:** Implement health checks on all dependencies and use `condition: service_healthy`
**Warning signs:** Race condition where sometimes it works, sometimes fails; restarting Connect fixes it

```yaml
kafka:
  healthcheck:
    test: ["CMD", "kafka-broker-api-versions.sh", "--bootstrap-server", "localhost:9092"]
    interval: 10s
    retries: 5

connect:
  depends_on:
    kafka:
      condition: service_healthy  # Wait until Kafka passes health check
```

### Pitfall 5: JupyterLab Permission Denied on Notebook Files
**What goes wrong:** Students can't save notebooks, get "Permission denied" errors when writing files
**Why it happens:** Host directory mounted into container has incompatible ownership (host user vs. jovyan user in container)
**How to avoid:** Ensure host directory is writable by all, or set NB_UID/NB_GID to match host user
**Warning signs:** Read-only warnings in JupyterLab, errors saving .ipynb files

```yaml
jupyter:
  image: jupyter/scipy-notebook:latest
  volumes:
    - ./notebooks:/home/jovyan/work
  environment:
    - JUPYTER_ENABLE_LAB=yes
    - GRANT_SUDO=yes  # Allow jovyan to fix permissions if needed
  user: root  # Start as root to chown files, then su to jovyan
  command: "start-notebook.sh --NotebookApp.token='' --NotebookApp.password=''"
```

### Pitfall 6: Kafka Listeners Misconfiguration Breaking External Access
**What goes wrong:** Containers can communicate with Kafka, but students can't connect from host (e.g., from Python in JupyterLab)
**Why it happens:** `KAFKA_ADVERTISED_LISTENERS` set to internal Docker network address, unreachable from host
**How to avoid:** Configure separate listeners for internal (container-to-container) and external (host) access
**Warning signs:** Kafka Connect works, but Python kafka-python client times out from host machine

```yaml
kafka:
  ports:
    - "9092:9092"  # External
    - "9093:9093"  # Controller (internal only)
  environment:
    KAFKA_LISTENERS: "PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093"
    KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://localhost:9092"  # Use localhost for host access
    # For production/multi-host: PLAINTEXT://kafka:9092,EXTERNAL://localhost:9094
```

### Pitfall 7: ARM64 Architecture Not Explicitly Verified
**What goes wrong:** Images run via Rosetta 2 emulation instead of native ARM64, causing poor performance
**Why it happens:** Some images have ARM64 tags but Docker pulls AMD64 by default without explicit platform specification
**How to avoid:** Verify multi-arch manifest before deployment, or explicitly set platform in docker-compose.yml
**Warning signs:** Slow startup times, high CPU usage, Docker warns about platform mismatch

```bash
# Verify image supports ARM64 before using
docker manifest inspect quay.io/debezium/connect:3.0.8.Final | grep arm64

# Or explicitly set platform in compose file (usually not needed)
services:
  connect:
    platform: linux/arm64
```

## Code Examples

Verified patterns from official sources:

### Complete Docker Compose Stack (Minimal Lab Setup)
```yaml
# Source: Debezium tutorial docker-compose-postgres.yaml
# https://github.com/debezium/debezium-examples/blob/main/tutorial/docker-compose-postgres.yaml
# Modified for health checks and ARM64 compatibility

version: '3.9'

services:
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: inventory
    command:
      - "postgres"
      - "-c"
      - "wal_level=logical"
      - "-c"
      - "max_replication_slots=10"
      - "-c"
      - "max_wal_senders=10"
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql

  kafka:
    image: quay.io/debezium/kafka:3.0.8.Final
    ports:
      - "9092:9092"
    environment:
      CLUSTER_ID: "oh-sxaDRTcyAr6pFRbXyzA"
      NODE_ID: 1
      NODE_ROLE: combined
      KAFKA_CONTROLLER_QUORUM_VOTERS: "1@kafka:9093"
      KAFKA_LISTENERS: "PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093"
      KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://localhost:9092"
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions.sh", "--bootstrap-server", "localhost:9092"]
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 20s
    volumes:
      - kafka-data:/var/lib/kafka/data

  connect:
    image: quay.io/debezium/connect:3.0.8.Final
    ports:
      - "8083:8083"
      - "9404:9404"  # JMX metrics
    environment:
      BOOTSTRAP_SERVERS: "kafka:9092"
      GROUP_ID: 1
      CONFIG_STORAGE_TOPIC: connect_configs
      OFFSET_STORAGE_TOPIC: connect_offsets
      STATUS_STORAGE_TOPIC: connect_statuses
      # JMX for monitoring
      JMXHOST: "0.0.0.0"
      JMXPORT: 9404
      JMXAUTH: "false"
      JMXSSL: "false"
    depends_on:
      kafka:
        condition: service_healthy
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8083/"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  schema-registry:
    image: confluentinc/cp-schema-registry:8.1.1
    ports:
      - "8081:8081"
    environment:
      SCHEMA_REGISTRY_HOST_NAME: schema-registry
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: "kafka:9092"
    depends_on:
      kafka:
        condition: service_healthy

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    depends_on:
      - prometheus

  jupyter:
    image: jupyter/scipy-notebook:latest
    ports:
      - "8888:8888"
    volumes:
      - ./notebooks:/home/jovyan/work
    environment:
      JUPYTER_ENABLE_LAB: "yes"
      GRANT_SUDO: "yes"
    command: "start-notebook.sh --NotebookApp.token='' --NotebookApp.password=''"

volumes:
  postgres-data:
  kafka-data:
  prometheus-data:
  grafana-data:
```

### Prometheus Configuration for Debezium JMX Metrics
```yaml
# Source: Debezium monitoring example
# File: monitoring/prometheus.yml
# https://github.com/debezium/debezium-examples/tree/main/monitoring

global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'kafka-connect'
    static_configs:
      - targets: ['connect:9404']
    metric_relabel_configs:
      - source_labels: [__name__]
        regex: 'kafka_connect_.*'
        action: keep
```

### Creating Debezium PostgreSQL Connector
```bash
# Source: Debezium PostgreSQL connector documentation
# https://debezium.io/documentation/reference/stable/connectors/postgresql.html

curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" \
  http://localhost:8083/connectors/ -d '{
  "name": "inventory-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "tasks.max": "1",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "postgres",
    "database.password": "postgres",
    "database.dbname": "inventory",
    "database.server.name": "dbserver1",
    "plugin.name": "pgoutput",
    "table.include.list": "public.customers,public.orders",
    "topic.prefix": "dbserver1"
  }
}'
```

### JupyterLab Notebook: Consuming CDC Events with Python
```python
# Source: confluent-kafka-python documentation and Debezium tutorial patterns
# Notebook: notebooks/02-consuming-events.ipynb

from confluent_kafka import Consumer, KafkaError
import json

# Configure consumer
consumer = Consumer({
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'jupyter-consumers',
    'auto.offset.reset': 'earliest'
})

# Subscribe to Debezium topic
consumer.subscribe(['dbserver1.public.customers'])

print("Consuming CDC events (Ctrl+C to stop)...")
try:
    while True:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            else:
                print(f"Error: {msg.error()}")
                break

        # Parse Debezium change event
        event = json.loads(msg.value().decode('utf-8'))
        print(f"Operation: {event.get('op')}")
        print(f"Before: {event.get('before')}")
        print(f"After: {event.get('after')}")
        print("-" * 50)

except KeyboardInterrupt:
    pass
finally:
    consumer.close()
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Kafka with ZooKeeper | Kafka with KRaft mode | Kafka 3.0 (2021), mandatory in 4.0 (2024) | Simplified architecture, one less service to manage, faster metadata operations |
| debezium/postgres with wal2json | Official postgres image with pgoutput | PostgreSQL 10 (2017) | No custom images needed, pgoutput is built-in and maintained by PostgreSQL team |
| Docker Hub debezium/* images | Quay.io quay.io/debezium/* images | Debezium 3.0.0 (2024) | Must update all image references; Docker Hub images frozen at 2.x |
| Debezium 2.x (no ARM64) | Debezium 3.0.8+ (ARM64 native) | March 2025 | Native Apple Silicon support, no Rosetta emulation needed |
| depends_on without conditions | depends_on with service_healthy | Docker Compose spec 3.9+ | Services wait for dependencies to be ready, not just started |

**Deprecated/outdated:**
- **ZooKeeper for Kafka metadata:** Removed in Kafka 4.0. Use KRaft mode exclusively.
- **wal2json plugin for PostgreSQL CDC:** PostgreSQL 10+ includes pgoutput, which Debezium recommends and requires no installation.
- **decoderbufs plugin:** Only needed for specialized Protobuf encoding; pgoutput handles standard cases.
- **Docker Hub debezium/* images:** Frozen at version 2.x. All 3.x+ images are on quay.io only.
- **Manual connector creation without Debezium UI:** Debezium UI (available as docker image) provides user-friendly connector management.

## Open Questions

Things that couldn't be fully resolved:

1. **Grafana Dashboard Automatic Provisioning**
   - What we know: Debezium provides example dashboards in JSON format in debezium-examples/monitoring
   - What's unclear: Whether these dashboards auto-provision or require manual import in the Docker Compose setup
   - Recommendation: Test the official example, likely needs Grafana provisioning configuration in docker-compose.yml volumes

2. **Schema Registry Integration with Debezium Converters**
   - What we know: Confluent Schema Registry works with Kafka, and Debezium supports Avro converters
   - What's unclear: Exact Kafka Connect environment variables needed to enable Avro serialization with automatic schema registration
   - Recommendation: Verify in Debezium connector configuration docs; likely needs `value.converter` and `value.converter.schema.registry.url` settings

3. **JupyterLab Python Library Versions**
   - What we know: jupyter/scipy-notebook includes scientific Python stack, confluent-kafka 2.13.0 has ARM64 wheels
   - What's unclear: Whether jupyter/scipy-notebook includes confluent-kafka by default or if custom Dockerfile is needed
   - Recommendation: Likely needs custom Dockerfile extending jupyter/scipy-notebook to `pip install confluent-kafka pandas`

4. **Multi-Connector Performance Limits**
   - What we know: Single Kafka Connect instance can run multiple connectors
   - What's unclear: How many connectors a single Connect instance can handle in a lab environment before resource constraints
   - Recommendation: Start with single Connect instance; can scale to multiple instances if needed

## Sources

### Primary (HIGH confidence)
- Debezium 3.0 Release Notes - https://debezium.io/releases/3.0/release-notes - ARM64 support confirmation, Docker Hub migration
- Debezium Docker Documentation - https://debezium.io/documentation/reference/stable/docker.html - Official Docker usage patterns
- Debezium Examples Repository - https://github.com/debezium/debezium-examples - Official Docker Compose examples
- Debezium Monitoring Documentation - https://debezium.io/documentation/reference/stable/operations/monitoring.html - JMX configuration, Prometheus integration
- Debezium PostgreSQL Connector - https://debezium.io/documentation/reference/stable/connectors/postgresql.html - pgoutput plugin recommendation, connector configuration
- PostgreSQL WAL Configuration - https://www.postgresql.org/docs/current/runtime-config-wal.html - wal_level settings, logical replication requirements
- Docker Compose Health Checks - https://oneuptime.com/blog/post/2026-01-16-docker-compose-depends-on-healthcheck/view - service_healthy pattern
- Jupyter Docker Stacks Documentation - https://docs.docker.com/guides/jupyter/ - Volume mount patterns, JupyterLab setup

### Secondary (MEDIUM confidence)
- Confluent Schema Registry Docker Images - https://hub.docker.com/r/confluentinc/cp-schema-registry - ARM64 tag availability verified
- Kafka KRaft Mode Docker Setup (2025) - https://saybackend.com/blog/05-kafka-in-docker-kraft/ - KRaft configuration patterns
- PostgreSQL Logical Replication Docker Guide (2025) - https://dev.to/ietxaniz/practical-postgresql-logical-replication-setting-up-an-experimentation-environment-using-docker-4h50 - PostgreSQL Docker configuration
- Docker Compose Best Practices (2026) - https://dev.to/wallacefreitas/10-best-practices-for-writing-maintainable-docker-compose-files-4ca2 - Project structure recommendations
- confluent-kafka PyPI - https://pypi.org/project/confluent-kafka/ - Version 2.13.0 release with ARM64 wheels

### Tertiary (LOW confidence)
- Community blog posts on Debezium Docker Compose setups - Various patterns and configurations, useful for troubleshooting ideas but not authoritative

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified from official release notes and Docker registries
- Architecture: HIGH - Docker Compose patterns verified from official Debezium examples and Docker documentation
- Pitfalls: MEDIUM-HIGH - Based on official docs and multiple community sources describing common issues; some extrapolated from general Docker Compose knowledge

**Research date:** 2026-01-31
**Valid until:** 2026-03-31 (60 days - stable infrastructure technologies, but fast-moving Debezium project may release updates)
