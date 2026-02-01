# Phase 12: MySQL Infrastructure + Binlog Fundamentals - Research

**Researched:** 2026-02-01
**Domain:** MySQL 8.0 CDC infrastructure, binlog architecture, Docker configuration
**Confidence:** HIGH

## Summary

This phase adds MySQL 8.0.40 to the existing Docker Compose infrastructure and creates foundational lesson content explaining MySQL binlog architecture. The research confirms that MySQL 8.0.40 has full ARM64 support, binlog with ROW format is the standard for CDC, and GTID mode provides critical benefits for position tracking and failover resilience.

The standard approach is to add MySQL as a service to the existing `labs/docker-compose.yml`, configure binlog through Docker command parameters (not separate my.cnf files to avoid permission issues), and structure the lesson content to mirror Module 2's PostgreSQL content pattern (deep technical explanations with Russian text, English code).

**Primary recommendation:** Use MySQL 8.0.40 official image with inline command configuration for binlog settings, enable both ROW format and GTID mode from the start, and structure lessons to explicitly compare MySQL binlog architecture with PostgreSQL WAL to leverage learners' existing knowledge.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| mysql | 8.0.40 | MySQL Database Docker Image | Latest 8.0.x LTS, full ARM64 support, stable binlog features |
| Debezium MySQL Connector | 2.5.4.Final | CDC Connector (included in Debezium Connect) | Already deployed, Java 21 compatible |
| Docker Compose | 3.x | Container orchestration | Existing infrastructure pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| mysql CLI client | 8.0.40 (bundled) | Database verification | Included in container, use for SHOW commands |
| mysqlbinlog | 8.0.40 | Binlog inspection | Use mysql:8.0-debian variant if needed (not in slim images) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| mysql:8.0.40 | mariadb:latest | MariaDB has ARM64 support but different binlog implementation, incompatible with course focus |
| mysql:8.0.40 | mysql:8.4 LTS | Requires Debezium 3.0+, binlog_format deprecated (defer to v2.0) |
| Command-line config | my.cnf volume mount | my.cnf causes permission errors and startup failures in Docker (Bug #78957) |

**Installation:**
```bash
# Add to existing labs/docker-compose.yml
# No separate npm/pip dependencies needed
```

## Architecture Patterns

### Recommended Docker Compose Structure
```yaml
services:
  mysql:
    image: mysql:${MYSQL_VERSION}
    container_name: mysql
    ports:
      - "${MYSQL_PORT}:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
    command:
      - "mysqld"
      - "--server-id=1"
      - "--log-bin=mysql-bin"
      - "--binlog-format=ROW"
      - "--binlog-row-image=FULL"
      - "--gtid-mode=ON"
      - "--enforce-gtid-consistency=ON"
      - "--binlog-expire-logs-seconds=604800"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p$$MYSQL_ROOT_PASSWORD"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - existing_network

volumes:
  mysql-data:
```

### Pattern 1: Inline Command Configuration (Recommended)
**What:** Pass all MySQL configuration via `command:` array in docker-compose.yml
**When to use:** Always for Docker deployments
**Why:** Avoids permission errors with my.cnf volume mounts, explicit configuration visible in compose file
**Example:**
```yaml
# Source: MySQL Docker Hub official docs + community best practices
command:
  - "mysqld"
  - "--server-id=1"
  - "--log-bin=mysql-bin"
  - "--binlog-format=ROW"
  - "--gtid-mode=ON"
  - "--enforce-gtid-consistency=ON"
```

### Pattern 2: Environment Variables for .env File
**What:** Externalize version and port configuration
**When to use:** All deployment-specific values
**Example:**
```bash
# Source: Existing labs/.env pattern
MYSQL_VERSION=8.0.40
MYSQL_PORT=3307
MYSQL_ROOT_PASSWORD=mysql
MYSQL_USER=mysqluser
MYSQL_PASSWORD=mysqlpw
MYSQL_DATABASE=inventory
```

### Pattern 3: Lesson Content Structure (Module Template)
**What:** Mirror Module 2's deep-dive PostgreSQL structure for consistency
**When to use:** All MySQL binlog lessons
**Structure:**
```
src/content/course/08-module-8/
├── 01-binlog-architecture.mdx         # MYSQL-01: ROW/STATEMENT/MIXED
├── 02-gtid-mode-fundamentals.mdx      # MYSQL-02: GTID benefits
├── 03-binlog-retention-heartbeat.mdx  # MYSQL-03: Retention + heartbeat
```

**Content pattern (from 02-module-2/01-logical-decoding-deep-dive.mdx):**
- Title and metadata in Russian
- Technical deep-dive with Mermaid diagrams
- Comparison tables (e.g., ROW vs STATEMENT vs MIXED)
- Code examples with English keywords, Russian comments
- Verification commands at end
- "Что дальше?" section for continuity

### Anti-Patterns to Avoid
- **Volume-mounting my.cnf:** Causes "data directory has files" errors (MySQL Bug #78957)
- **Using port 3306 externally:** Conflicts with local MySQL installs; use 3307
- **Skipping GTID mode:** Makes failover and position tracking significantly harder for learners
- **binlog_row_image=MINIMAL:** While efficient, hides important concepts; use FULL for educational clarity

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Binlog position tracking | Custom offset storage | Debezium's schema.history.internal.kafka.topic | Handles DDL evolution, position recovery, must have infinite retention |
| MySQL Docker ARM64 compatibility | Custom Dockerfile with platform flags | Official mysql:8.0.40 image | Natively multi-arch (linux/amd64, linux/arm64/v8) |
| Binlog format detection | Parsing SHOW VARIABLES output | Debezium connector auto-detection | Connector validates binlog format on startup |
| GTID consistency checks | Manual SQL validation | enforce-gtid-consistency=ON | MySQL blocks unsafe statements automatically |
| Binlog heartbeat generation | Custom heartbeat table + cron | MySQL's built-in master_heartbeat_period | Active by default at slave_net_timeout/2 |

**Key insight:** MySQL binlog infrastructure has evolved over 15+ years. Core features (GTID, heartbeat, ROW format) are production-hardened and well-integrated. Custom solutions miss edge cases around DDL replication, failover semantics, and position recovery.

## Common Pitfalls

### Pitfall 1: Binlog Purged Before Debezium Reads It
**What goes wrong:** Connector stops for >7 days, binlog_expire_logs_seconds purges logs, connector loses position and requires full resnapshot
**Why it happens:** Default binlog_expire_logs_seconds=2592000 (30 days) but many tutorials use 604800 (7 days)
**How to avoid:**
- Set binlog_expire_logs_seconds based on max expected downtime + safety margin
- Monitor `AuroraBinlogReplicaLag` (Aurora) or custom lag metrics
- Configure Debezium heartbeat to detect lag early
**Warning signs:** Connector logs show "Cannot replicate because the master purged required binary logs"

### Pitfall 2: Schema History Topic Compaction Enabled
**What goes wrong:** Kafka compacts schema history topic, DDL statements lost, connector cannot reconstruct table schemas after restart
**Why it happens:** Default Kafka topic config has cleanup.policy=delete, but if changed to compact, history is corrupted
**How to avoid:**
- Set schema.history.internal.kafka.topic with infinite retention
- Explicitly configure topic: `retention.ms=-1` (infinite), `cleanup.policy=delete`
- Never partition schema history topic (must be exactly 1 partition)
**Warning signs:** Connector fails to start with "Cannot recover schema history" errors

### Pitfall 3: enforce-gtid-consistency=OFF with GTID Mode
**What goes wrong:** GTID mode ON but unsafe statements execute (CREATE TABLE...SELECT, transactions mixing InnoDB+MyISAM), breaking replication
**Why it happens:** Tutorial copy-paste enables gtid-mode but forgets enforce-gtid-consistency
**How to avoid:** Always enable both together:
```bash
--gtid-mode=ON
--enforce-gtid-consistency=ON
```
**Warning signs:** MySQL logs show "Statement violates GTID consistency"

### Pitfall 4: binlog-format Deprecated Warning (MySQL 8.0.34+)
**What goes wrong:** Connector works but MySQL logs show deprecation warnings, confusion about future compatibility
**Why it happens:** MySQL 8.0.34 deprecated binlog-format parameter (removal planned)
**How to avoid:**
- Still configure it for MySQL 8.0.40 (not removed yet)
- Understand that ROW is default in 8.0+, explicit setting ensures compatibility
- Plan migration strategy for MySQL 8.4+ (defer to course v2.0)
**Warning signs:** MySQL logs: "binlog_format is deprecated and will be removed in a future release"

### Pitfall 5: Incorrect Database Connection from Docker Network
**What goes wrong:** Debezium connector config uses localhost:3307, connector cannot reach MySQL
**Why it happens:** Connector runs inside Docker network, must use service name not host port
**How to avoid:**
- Connector config: `database.hostname: mysql`, `database.port: 3306` (internal)
- Host access for testing: `mysql -h 127.0.0.1 -P 3307` (external)
- Document both connection patterns in lesson
**Warning signs:** Connector logs show "Cannot connect to MySQL server on 'localhost'"

### Pitfall 6: Missing server-id Configuration
**What goes wrong:** MySQL defaults to server-id=1, multiple instances conflict in replication topology
**Why it happens:** Docker Compose doesn't enforce unique server IDs
**How to avoid:**
- Set explicit server-id in command: `--server-id=1` for source
- Document that replicas need unique IDs (2, 3, etc.)
- For single-node lab: server-id=1 is sufficient
**Warning signs:** Replication errors if adding replicas later

## Code Examples

Verified patterns from official sources:

### Verify Binlog Configuration
```bash
# Source: MySQL 8.0 Reference Manual - Binary Logging Options
# Access MySQL container
docker compose exec mysql mysql -u root -p

# Check binlog format
SHOW VARIABLES LIKE 'binlog_format';
# Expected: ROW

# Check GTID mode
SHOW VARIABLES LIKE 'gtid_mode';
# Expected: ON

# Check binlog files
SHOW BINARY LOGS;

# Check current binlog position
SHOW MASTER STATUS;
```

### Verify GTID Execution
```sql
-- Source: MySQL 8.0 Reference Manual - GTID Concepts
-- Check executed GTIDs
SHOW GLOBAL VARIABLES LIKE 'gtid_executed';

-- Sample output:
-- 3E11FA47-71CA-11E1-9E33-C80AA9429562:1-5

-- Check GTID purged (lost transactions)
SHOW GLOBAL VARIABLES LIKE 'gtid_purged';
```

### Debezium MySQL Connector Configuration
```json
// Source: Debezium MySQL Connector Documentation
{
  "name": "mysql-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.server.id": "184054",
    "topic.prefix": "mysql",
    "database.include.list": "inventory",
    "schema.history.internal.kafka.topic": "schema-changes.mysql.inventory",
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
    "include.schema.changes": "true"
  }
}
```

### Compare Binlog vs WAL (Lesson Content)
```markdown
<!-- Source: Medium article + PostgreSQL vs MySQL replication docs -->
| Характеристика | MySQL Binlog | PostgreSQL WAL |
|----------------|--------------|----------------|
| **Формат событий** | ROW/STATEMENT/MIXED | Физический (+ logical decoding) |
| **Позиция трекинга** | GTID (глобальный) | LSN (локальный per сервер) |
| **Failover простота** | GTID позволяет переключение на любую реплику | Слоты привязаны к primary, нужны failover slots |
| **Overhead при ROW** | Полные строки в binlog | Полные строки в WAL при replica identity FULL |
| **Schema history** | Нужен отдельный Kafka топик | Встроена в WAL + publication |
```

### Heartbeat Verification
```sql
-- Source: MySQL Worklog #342 - Replication Heartbeat
-- Check heartbeat configuration (on replica if applicable)
SHOW VARIABLES LIKE 'slave_net_timeout';
-- Default: 60 seconds, heartbeat sends at 30s

-- For Debezium, configure in connector:
-- "heartbeat.interval.ms": "10000"  // 10 seconds
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| wal2json/decoderbufs plugins | pgoutput (PostgreSQL) vs native binlog (MySQL) | PostgreSQL: PG 10 (2017), MySQL: always had binlog | MySQL simpler: no plugin needed |
| File position tracking | GTID-based tracking | MySQL 5.6 (2013) | Failover and multi-source replication dramatically simplified |
| binlog_format=STATEMENT default | binlog_format=ROW default | MySQL 8.0 (2018) | Safer CDC, deterministic replication |
| expire_logs_days | binlog_expire_logs_seconds | MySQL 8.0.1 (2017) | More granular retention control |
| my.cnf files | Inline command configuration for Docker | Docker best practices (2020+) | Avoids permission and initialization errors |

**Deprecated/outdated:**
- **binlog_format parameter:** Deprecated in MySQL 8.0.34, subject to removal (still safe to use in 8.0.40)
- **database.history.* properties:** Renamed to schema.history.* in Debezium 2.0+ (old names still work)
- **MySQL 8.0.34+ without GTID:** While technically possible, GTID is now considered essential for production CDC

## Open Questions

1. **Aurora MySQL Enhanced Binlog performance claims**
   - What we know: Aurora claims "99% faster recovery" with Enhanced Binlog architecture
   - What's unclear: Exact benchmarks, how it affects Debezium connector lag in practice
   - Recommendation: Research Aurora-specific behavior in Phase 14, for Phase 12 focus on standard MySQL binlog

2. **mysqlbinlog utility availability in official image**
   - What we know: mysqlbinlog missing in mysql:8.0 slim images (GitHub Issue #907)
   - What's unclear: Whether to switch to mysql:8.0-debian for Phase 12 labs
   - Recommendation: Use standard mysql:8.0.40 for Phase 12; defer mysqlbinlog inspection to advanced phases if needed

3. **Optimal binlog_row_image for course**
   - What we know: FULL shows complete before/after (educational), MINIMAL is production-efficient
   - What's unclear: Whether to start with FULL and transition to MINIMAL, or use MINIMAL throughout
   - Recommendation: Use FULL for Phase 12-13 (mirrors REPLICA IDENTITY FULL in Module 2), discuss MINIMAL in production operations phase

## Sources

### Primary (HIGH confidence)
- [MySQL 8.0 Reference Manual - Binary Logging Formats](https://dev.mysql.com/doc/refman/8.0/en/binary-log-formats.html) - ROW/STATEMENT/MIXED detailed comparison
- [MySQL 8.0 Reference Manual - GTID Format and Storage](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids-concepts.html) - GTID architecture, benefits, storage
- [MySQL 8.0 Reference Manual - Binary Logging Options and Variables](https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html) - Configuration variables reference
- [Debezium MySQL Connector Documentation](https://debezium.io/documentation/reference/stable/connectors/mysql.html) - Schema history topic, connector properties
- [Docker Hub - mysql:8.0.40 ARM64 support](https://hub.docker.com/r/arm64v8/mysql/8.0.40) - Official multi-arch image confirmation

### Secondary (MEDIUM confidence)
- [Medium - Understanding CDC: MySQL BinLog vs PostgreSQL WAL](https://medium.com/data-science/understanding-change-data-capture-cdc-in-mysql-and-postgresql-binlog-vs-wal-logical-decoding-ac76adb0861f) - Architecture comparison verified against official docs
- [GitHub - mysql-replication-samples GTID config](https://github.com/datacharmer/mysql-replication-samples/blob/master/docker-replication/my-gtid.cnf) - Community patterns for GTID setup
- [Materialize - MySQL CDC with Debezium in Production](https://materialize.com/guides/mysql-cdc/) - Production best practices
- [AWS RDS Documentation - Binary log retention](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html) - Cloud-specific retention patterns

### Tertiary (LOW confidence)
- [Boltic.io - MySQL BinLog Guide 2026](https://www.boltic.io/blog/mysql-binlog) - General overview, marked for verification
- [Sylhare's Blog - Debezium MySQL Troubleshooting](https://sylhare.github.io/2023/11/07/Debezium-configuration.html) - Community troubleshooting patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official MySQL 8.0.40 image with verified ARM64 support, Debezium 2.5.4.Final compatibility confirmed
- Architecture: HIGH - Docker Compose patterns verified against existing codebase, inline command configuration is documented best practice
- Pitfalls: MEDIUM - Common errors verified through official bug reports and Debezium docs, some community sources

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days for stable MySQL 8.0 LTS, Debezium 2.5.x stable branch)
