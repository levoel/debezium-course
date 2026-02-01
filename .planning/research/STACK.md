# Technology Stack: MySQL/Aurora MySQL CDC Module

**Project:** Debezium Course - MySQL/Aurora MySQL Module (v1.1)
**Scope:** Stack additions for MySQL CDC content
**Researched:** 2026-02-01
**Overall Confidence:** HIGH

---

## Executive Summary

Adding MySQL/Aurora MySQL CDC content to the existing Debezium course requires **minimal stack changes**. The existing Docker Compose infrastructure (Debezium 2.5.4, Kafka 7.8.1 KRaft) supports MySQL CDC with only the addition of a MySQL container. Use **MySQL 8.0.x** (not 8.4 LTS) for compatibility with Debezium 2.5.4. MySQL 8.0+ has native ARM64 support in official Docker images. Aurora MySQL-specific features cannot be fully simulated locally but can be covered through configuration examples and documentation.

**Key Decision:** MySQL 8.0.40 over MySQL 8.4 LTS because Debezium 2.5.4 officially supports MySQL 8.0/8.2 but not 8.4 (which requires Debezium 3.0+). Maintaining consistency with the existing Debezium version avoids infrastructure changes.

---

## Recommended Stack Additions

### MySQL Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **mysql** (official) | 8.0.40+ | CDC source database | Official Docker image has native ARM64 support. MySQL 8.0 is fully compatible with Debezium 2.5.4. Version 8.0.40 is latest 8.0.x before 8.4 LTS transition. MySQL 8.0 EOL is April 2026, acceptable for course material published in Q1 2026. |

**Confidence:** HIGH - MySQL 8.0+ ARM64 support verified from Docker Hub. Debezium 2.5.4 MySQL 8.0/8.2 compatibility confirmed from official release notes.

### Required MySQL Configuration

| Configuration | Value | Purpose | Why Required |
|---------------|-------|---------|--------------|
| `server-id` | 1 (unique) | Replication identifier | Debezium uses replication protocol; server-id must be set |
| `log_bin` | mysql-bin | Binary log path | Debezium reads binlog for CDC events |
| `binlog_format` | ROW | Binlog format | Debezium requires row-level events (not statement-based) |
| `binlog_row_image` | FULL | Row change detail | Debezium requires full before/after row images |
| `gtid_mode` | ON (optional) | GTID support | Simplifies failover and replication positioning (best practice) |
| `enforce_gtid_consistency` | ON (optional) | GTID consistency | Required when gtid_mode=ON |
| `binlog_expire_logs_seconds` | 604800 (7 days) | Binlog retention | Prevents disk fill-up in lab environment |

**Confidence:** HIGH - All requirements verified from official Debezium MySQL connector documentation and Confluent platform guides.

### MySQL User Privileges

```sql
CREATE USER 'debezium'@'%' IDENTIFIED BY 'debezium_password';
GRANT SELECT, RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'debezium'@'%';
FLUSH PRIVILEGES;
```

**Privileges explained:**
- `SELECT` - Read table data during snapshots
- `RELOAD` - Flush tables during snapshot
- `SHOW DATABASES` - Discover databases
- `REPLICATION SLAVE` - Read binlog events
- `REPLICATION CLIENT` - Monitor replication status

**Confidence:** HIGH - Privilege requirements from official Debezium MySQL connector documentation.

---

## No Changes Required to Existing Stack

The following components from v1.0 remain unchanged:

| Component | Version | Status |
|-----------|---------|--------|
| **Debezium Connect** | 2.5.4.Final | ✓ No change - supports MySQL connector |
| **Kafka** | 7.8.1 (KRaft) | ✓ No change - same event bus |
| **Schema Registry** | 7.8.1 | ✓ No change - schema management unchanged |
| **Prometheus/Grafana** | Latest | ✓ No change - JMX metrics work identically |
| **Python consumers** | confluent-kafka | ✓ No change - consume MySQL CDC events identically |

**Rationale:** Debezium 2.5.4 connector image includes both PostgreSQL and MySQL connectors. No version upgrades needed.

**Confidence:** HIGH - Existing infrastructure verified in v1.0. Debezium multi-connector support confirmed.

---

## Docker Compose Integration

### Add MySQL Service

```yaml
services:
  mysql:
    image: mysql:${MYSQL_VERSION}
    container_name: mysql
    ports:
      - "${MYSQL_PORT}:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DB}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    command:
      # Binlog configuration for CDC
      - "mysqld"
      - "--server-id=1"
      - "--log-bin=mysql-bin"
      - "--binlog-format=ROW"
      - "--binlog-row-image=FULL"
      - "--gtid-mode=ON"
      - "--enforce-gtid-consistency=ON"
      - "--binlog-expire-logs-seconds=604800"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 30s
    volumes:
      - mysql-data:/var/lib/mysql
      - ./mysql/init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  mysql-data:
```

### Environment Variables (.env)

```bash
# MySQL Configuration
MYSQL_VERSION=8.0.40
MYSQL_PORT=3307
MYSQL_ROOT_PASSWORD=mysql_root
MYSQL_DB=inventory
MYSQL_USER=debezium
MYSQL_PASSWORD=debezium_password
```

**Port 3307 rationale:** Avoids conflict with any local MySQL installations on default port 3306.

**Confidence:** HIGH - Docker Compose patterns verified from multiple sources including OLake CDC integration guide and Debezium tutorials.

---

## Aurora MySQL Simulation Approach

**Reality Check:** Full Aurora MySQL simulation is not possible in local Docker. Aurora has architectural differences from standard MySQL:
- Aurora uses cluster-level parameter groups
- Aurora binlog retention is managed differently (tied to backup retention)
- Aurora read replicas don't support binlog access
- Enhanced binlog is Aurora MySQL 3.03.1+ only

### Recommended Approach for Course Content

| Aspect | Local Docker | Aurora MySQL Coverage |
|--------|--------------|----------------------|
| **Basic CDC** | ✓ Fully functional with MySQL 8.0 | Document Aurora-specific parameter groups in lesson text |
| **Binlog configuration** | ✓ Identical commands in Docker | Show RDS parameter group screenshots/examples |
| **GTID mode** | ✓ Fully functional | Same configuration applies to Aurora |
| **Binlog retention** | ✓ `binlog_expire_logs_seconds` | Document Aurora-specific `mysql.rds_set_configuration` procedure |
| **Read replicas** | ✗ Not simulated | Text-based explanation with diagrams of Aurora limitations |
| **Multi-AZ** | ✗ Not simulated | Cloud-specific content (screenshots, documentation) |

### Aurora-Specific Content Strategy

**Lab exercises:** Use local MySQL 8.0 Docker for hands-on practice
**Aurora coverage:** Dedicated lesson sections covering:
1. Aurora MySQL parameter groups (show real AWS console screenshots)
2. Binlog retention configuration via `mysql.rds_set_configuration` stored procedure
3. Read replica limitations (cannot be CDC source)
4. Enhanced binlog feature (Aurora MySQL 3.03.1+)
5. Connection endpoints (cluster vs instance endpoints)

**Confidence:** MEDIUM - Aurora simulation limitations confirmed from AWS documentation and community resources. This approach mirrors industry practice (local dev with MySQL, production on Aurora).

---

## MySQL Connector Configuration Example

```json
{
  "name": "mysql-inventory-connector",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "tasks.max": "1",
    "database.hostname": "mysql",
    "database.port": "3306",
    "database.user": "debezium",
    "database.password": "debezium_password",
    "database.server.id": "184054",
    "topic.prefix": "mysql",
    "database.include.list": "inventory",
    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
    "schema.history.internal.kafka.topic": "schema-changes.inventory"
  }
}
```

**Key differences from PostgreSQL connector:**
- Uses `MySqlConnector` class (vs `PostgresConnector`)
- Requires `database.server.id` (PostgreSQL uses slot name)
- Uses `schema.history.internal.*` for DDL tracking (PostgreSQL tracks in replication slot)
- No `plugin.name` (PostgreSQL requires pgoutput/decoderbufs)

**Confidence:** HIGH - Configuration verified from official Debezium MySQL connector documentation.

---

## Alternatives Considered

### MySQL 8.4 LTS vs MySQL 8.0

| Criterion | MySQL 8.0.40 | MySQL 8.4 LTS |
|-----------|--------------|---------------|
| **ARM64 support** | ✓ Native | ✓ Native |
| **Debezium 2.5.4 compatibility** | ✓ Fully supported | ✗ Requires Debezium 3.0+ |
| **Support lifecycle** | EOL April 2026 | 5 years premier + 3 years extended |
| **Course timeline** | ✓ Acceptable for v1.1 (Q1 2026) | Future-proof but requires stack upgrade |

**Verdict:** Use MySQL 8.0.40 for v1.1 to maintain compatibility with existing Debezium 2.5.4. MySQL 8.0 EOL in April 2026 is acceptable for course material published in Q1 2026. If course requires MySQL 8.4, upgrade entire stack to Debezium 3.0 in future milestone.

**Confidence:** HIGH - Debezium compatibility matrix verified from official release notes.

### MariaDB vs MySQL

**MariaDB strengths:**
- Open-source governance
- Some advanced features

**Why Not Chosen:**
- Course explicitly targets MySQL/Aurora MySQL (AWS managed MySQL)
- Debezium MariaDB connector is separate from MySQL connector
- MariaDB != MySQL in Aurora context (AWS Aurora is MySQL/PostgreSQL only)
- Additional connector introduces unnecessary complexity

**Verdict:** Stick with MySQL as specified in project requirements.

**Confidence:** HIGH - Project requirements explicitly state MySQL/Aurora MySQL.

### Aurora-Compatible Docker Images

Community images like `atsnngs/mysql-aurora-compatible` exist but:
- Not officially maintained
- Unknown ARM64 support
- Unclear version currency
- Adds dependency on unmaintained third-party image

**Verdict:** Use official `mysql:8.0` image with documentation noting Aurora-specific differences. This is standard industry practice.

**Confidence:** MEDIUM - Aurora simulation approach based on WebSearch findings and community practices.

---

## Installation & Setup

### Update Docker Compose

1. Add MySQL service to `labs/docker-compose.yml` (see Docker Compose Integration section)
2. Add MySQL environment variables to `labs/.env`
3. Create `labs/mysql/init.sql` for sample database schema

### Sample Database Schema

```sql
-- labs/mysql/init.sql
CREATE DATABASE IF NOT EXISTS inventory;
USE inventory;

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create Debezium user
CREATE USER IF NOT EXISTS 'debezium'@'%' IDENTIFIED BY 'debezium_password';
GRANT SELECT, RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'debezium'@'%';
FLUSH PRIVILEGES;
```

### Start MySQL Service

```bash
# From labs/ directory
docker-compose up -d mysql

# Verify MySQL is running with binlog enabled
docker exec -it mysql mysql -uroot -pmysql_root -e "SHOW VARIABLES LIKE 'log_bin';"
docker exec -it mysql mysql -uroot -pmysql_root -e "SHOW VARIABLES LIKE 'binlog_format';"
docker exec -it mysql mysql -uroot -pmysql_root -e "SHOW VARIABLES LIKE 'binlog_row_image';"
docker exec -it mysql mysql -uroot -pmysql_root -e "SHOW VARIABLES LIKE 'gtid_mode';"

# Create MySQL connector
curl -X POST http://localhost:8083/connectors -H "Content-Type: application/json" -d @mysql-connector-config.json
```

**Confidence:** HIGH - Standard Docker Compose and Debezium setup patterns.

---

## Testing & Validation

### Verify Binlog Configuration

```bash
# Check binlog status
docker exec -it mysql mysql -uroot -pmysql_root -e "SHOW BINARY LOGS;"

# Monitor binlog position
docker exec -it mysql mysql -uroot -pmysql_root -e "SHOW MASTER STATUS;"

# Verify GTID mode
docker exec -it mysql mysql -uroot -pmysql_root -e "SELECT @@gtid_mode, @@enforce_gtid_consistency;"
```

### Test CDC Flow

```sql
-- Insert test data
INSERT INTO customers (first_name, last_name, email) VALUES ('Ivan', 'Petrov', 'ivan@example.com');

-- Update test data
UPDATE customers SET email = 'ivan.petrov@example.com' WHERE id = 1;

-- Delete test data
DELETE FROM customers WHERE id = 1;
```

Expected Kafka topics:
- `mysql.inventory.customers` - Customer table changes
- `mysql.inventory.orders` - Orders table changes
- `schema-changes.inventory` - DDL changes

**Confidence:** HIGH - Standard Debezium testing patterns verified in existing PostgreSQL labs.

---

## Performance Considerations

### MySQL vs PostgreSQL CDC Differences

| Aspect | PostgreSQL (v1.0) | MySQL (v1.1) |
|--------|-------------------|--------------|
| **CDC mechanism** | Logical replication slots | Binlog reading |
| **Snapshot impact** | Table-level locks during snapshot | Table-level locks during snapshot |
| **Disk usage** | WAL retention | Binlog retention |
| **GTID support** | Not applicable | Optional but recommended |
| **Connector tasks** | Single task only | Single task only |

### Binlog Disk Management

```yaml
# Recommended binlog retention for lab environment
--binlog-expire-logs-seconds=604800  # 7 days
```

**Production recommendation:** Aurora MySQL supports up to 2160 hours (90 days) binlog retention. Document this in Aurora-specific lessons.

**Confidence:** HIGH - Performance characteristics verified from Debezium documentation and community resources.

---

## Security Considerations

### MySQL User Privileges

**Principle of least privilege:** Debezium user should not have:
- ✗ INSERT, UPDATE, DELETE privileges (read-only CDC)
- ✗ CREATE, DROP privileges (no schema modification)
- ✗ SUPER privilege (unnecessary for CDC)

**Required privileges only:**
- ✓ SELECT (read data)
- ✓ RELOAD (flush tables for snapshots)
- ✓ SHOW DATABASES (discover databases)
- ✓ REPLICATION SLAVE (read binlog)
- ✓ REPLICATION CLIENT (monitor replication)

### Production Best Practices

Document in Aurora MySQL lessons:
1. Use AWS Secrets Manager for database credentials
2. Enable SSL/TLS for database connections
3. Use IAM authentication for RDS/Aurora (not applicable to standard MySQL)
4. Restrict network access via security groups

**Confidence:** HIGH - Security best practices from Debezium and AWS documentation.

---

## Documentation Requirements

### New Content Sections

1. **MySQL Binlog Deep-Dive**
   - Binlog formats (STATEMENT, ROW, MIXED)
   - Row image options (FULL, MINIMAL, NOBLOB)
   - GTID architecture and benefits
   - Binlog retention and disk management

2. **Aurora MySQL Specifics**
   - Aurora architecture differences
   - Parameter groups (cluster vs instance level)
   - Binlog configuration via RDS parameters
   - Binlog retention using `mysql.rds_set_configuration`
   - Read replica limitations
   - Enhanced binlog feature (Aurora MySQL 3.03.1+)

3. **MySQL Connector Operations**
   - Connector configuration properties
   - Schema history topic (vs PostgreSQL slots)
   - Snapshot modes (initial, schema_only, never)
   - Incremental snapshots
   - GTID-based failover

4. **Hands-On Labs**
   - Set up MySQL with binlog in Docker
   - Deploy MySQL connector
   - Monitor binlog position
   - Test snapshot and streaming modes
   - Simulate failover with GTID

**Confidence:** HIGH - Content structure informed by existing PostgreSQL module and Debezium official tutorials.

---

## Monitoring & Observability

### JMX Metrics (Identical to PostgreSQL)

MySQL connector exposes same JMX metrics structure:
- `debezium.mysql:type=connector-metrics,context=snapshot,server=<topic.prefix>`
- `debezium.mysql:type=connector-metrics,context=streaming,server=<topic.prefix>`

**Grafana dashboards:** Existing Debezium dashboards from v1.0 work with MySQL connector (same metric names).

### MySQL-Specific Metrics

Additional monitoring points:
- Binlog position lag
- GTID executed set
- Binlog disk usage

**Confidence:** HIGH - Debezium monitoring patterns consistent across connectors.

---

## Migration from PostgreSQL Module

### What Students Already Know (Module 2)

From existing PostgreSQL/Aurora PostgreSQL module (v1.0), students understand:
- CDC fundamentals
- Debezium architecture
- Kafka integration
- Connector deployment
- Monitoring with Prometheus/Grafana

### New Concepts for MySQL Module

| Concept | PostgreSQL | MySQL |
|---------|-----------|-------|
| **CDC source** | WAL (Write-Ahead Log) | Binlog (Binary Log) |
| **Position tracking** | Replication slot | Binlog position / GTID |
| **DDL tracking** | Captured in WAL | schema.history.internal topic |
| **Connector plugin** | pgoutput, decoderbufs | N/A (built-in) |
| **Replication ID** | Slot name | server.id |

**Teaching approach:** Compare/contrast with PostgreSQL to leverage existing knowledge.

**Confidence:** HIGH - Pedagogical approach informed by course structure.

---

## Roadmap Implications

### Phase Structure Recommendations

1. **Phase 1: MySQL Binlog Fundamentals**
   - MySQL binlog architecture
   - Row-based logging
   - GTID concepts
   - Binlog retention strategies

2. **Phase 2: MySQL CDC Lab Setup**
   - Docker Compose MySQL service
   - Binlog configuration
   - Debezium user setup
   - Connector deployment

3. **Phase 3: Aurora MySQL Specifics**
   - Aurora architecture overview
   - Parameter groups configuration
   - Binlog retention with RDS procedures
   - Read replica limitations
   - Production deployment patterns

4. **Phase 4: Production Operations**
   - Monitoring binlog position
   - GTID-based failover
   - Snapshot strategies
   - Performance tuning

**Dependency order:** Phase 1 (concepts) → Phase 2 (local lab) → Phase 3 (Aurora specifics) → Phase 4 (production)

**Research flags:**
- Phase 1-2: Standard patterns, low research risk
- Phase 3: Aurora-specific research likely needed (AWS console screenshots, CloudFormation examples)
- Phase 4: May need production case studies

**Confidence:** HIGH - Phasing informed by existing PostgreSQL module structure and MySQL-specific requirements.

---

## Confidence Levels Summary

| Technology | Confidence | Notes |
|------------|------------|-------|
| **MySQL 8.0 Docker** | HIGH | ARM64 support verified from Docker Hub. Native support confirmed. |
| **Debezium 2.5.4 MySQL compatibility** | HIGH | MySQL 8.0/8.2 support verified from official release notes. |
| **Binlog configuration** | HIGH | Requirements verified from Debezium documentation and multiple sources. |
| **MySQL connector config** | HIGH | Official Debezium MySQL connector documentation. |
| **Aurora MySQL simulation** | MEDIUM | Limitations confirmed; approach based on industry practice. |
| **GTID configuration** | HIGH | GTID benefits and configuration verified from Debezium docs. |
| **Docker Compose integration** | HIGH | Standard patterns verified from multiple CDC integration guides. |
| **MySQL 8.4 compatibility** | HIGH | Requires Debezium 3.0; confirmed from release notes. Not using for v1.1. |

---

## Sources

### Official Documentation

- [MySQL Official Docker Image](https://hub.docker.com/_/mysql) - ARM64 support, versions
- [Debezium MySQL Connector Documentation](https://debezium.io/documentation/reference/stable/connectors/mysql.html) - Configuration requirements
- [Debezium 2.5 Release Series](https://debezium.io/releases/2.5/) - MySQL compatibility
- [Red Hat Debezium 2.5.4 MySQL Connector](https://docs.redhat.com/en/documentation/red_hat_build_of_debezium/2.5.4/html/debezium_user_guide/debezium-connector-for-mysql) - Official requirements
- [Confluent Debezium MySQL Connector](https://docs.confluent.io/kafka-connectors/debezium-mysql-source/current/overview.html) - Configuration reference

### Aurora MySQL Resources

- [AWS Aurora MySQL Binlog Configuration](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_LogAccess.MySQL.BinaryFormat.html) - Parameter groups
- [Aurora MySQL CDC Setup Guide - OLake](https://olake.io/docs/connectors/mysql/setup/aurora/) - CDC configuration
- [AWS Aurora MySQL Enhanced Binlog](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Enhanced.binlog.html) - Enhanced binlog feature
- [AWS Aurora MySQL Binlog Retention](https://repost.aws/knowledge-center/aurora-mysql-increase-binlog-retention) - Retention configuration
- [Resolve Aurora MySQL Binary Logging Errors](https://aws.amazon.com/premiumsupport/knowledge-center/dms-binary-logging-aurora-mysql/) - Common issues

### MySQL CDC Best Practices

- [Initial Database Configurations for Debezium MySQL](https://amit-kumar-manjhi.medium.com/initial-database-configurations-for-debezium-mysql-source-connector-e9ca5121ee91) - Medium (WebSearch)
- [Local MySQL Setup with Docker Compose - OLake](https://olake.io/docs/connectors/mysql/setup/local/) - Docker setup patterns
- [MySQL CDC with Debezium in Production - Materialize](https://materialize.com/guides/mysql-cdc/) - Production patterns
- [How to Set Up Debezium MySQL Connector](https://hevodata.com/learn/debezium-mysql/) - Configuration tutorial

### MySQL Version Lifecycle

- [MySQL 8.0 EOL 2026](https://www.jusdb.com/blog/mysql-80-eol-in-2026-why-upgrading-to-mysql-84-lts-is-mission-critical) - EOL timeline
- [MySQL 8.4 LTS on AWS RDS](https://aws.amazon.com/blogs/database/amazon-rds-for-mysql-lts-version-8-4-is-now-generally-available/) - LTS availability
- [Debezium 3.0 Release](https://debezium.io/releases/3.0/) - MySQL 8.4 support

### Docker & ARM64 Support

- [MySQL on Docker ARM64 Support](https://hub.docker.com/r/arm64v8/mysql/) - ARM64 images
- [MySQL 5.7 ARM64 Limitations](https://betterprogramming.pub/mysql-5-7-does-not-have-an-official-docker-image-on-arm-m1-mac-e55cbe093d4c) - ARM64 compatibility notes
- [Simplified Guide to MySQL Replication with Docker Compose](https://www.linkedin.com/pulse/simplified-guide-mysql-replication-docker-compose-rakesh-shekhawat) - Docker Compose patterns

---

## Next Steps for Implementation

### Prerequisites (Existing)
✓ Docker Compose infrastructure (v1.0)
✓ Debezium 2.5.4 Connect (v1.0)
✓ Kafka 7.8.1 KRaft (v1.0)
✓ Schema Registry 7.8.1 (v1.0)
✓ Prometheus/Grafana monitoring (v1.0)

### Required Changes
1. Add MySQL service to `labs/docker-compose.yml`
2. Add MySQL environment variables to `labs/.env`
3. Create `labs/mysql/init.sql` initialization script
4. Create MySQL connector configuration template
5. Update lab README with MySQL setup instructions

### Content Development
1. Write MySQL binlog lessons (Russian text)
2. Create Aurora MySQL parameter group examples
3. Develop hands-on lab exercises
4. Create Mermaid diagrams for MySQL CDC flow
5. Write production operations guide

### Validation
1. Test MySQL 8.0.40 on ARM64 macOS
2. Verify binlog configuration
3. Test connector deployment
4. Validate Kafka topic creation
5. Confirm monitoring dashboards work

**Timeline estimate:** 2-3 days for infrastructure setup, 1-2 weeks for content development.

**Confidence:** HIGH - Implementation path clear, no major blockers identified.
