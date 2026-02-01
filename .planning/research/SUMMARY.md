# MySQL/Aurora MySQL CDC Module Research Summary

**Project:** Debezium Course - MySQL/Aurora MySQL Module (v1.1)
**Domain:** Change Data Capture / Technical Education
**Researched:** 2026-02-01
**Confidence:** HIGH

## Executive Summary

Adding MySQL/Aurora MySQL CDC content as Module 8 to the existing Debezium course requires minimal infrastructure changes but significant depth in MySQL-specific concepts. The course will use **MySQL 8.0.40** in Docker for hands-on labs, maintaining compatibility with existing Debezium 2.5.4 infrastructure, while covering Aurora MySQL specifics through documentation and configuration examples.

The recommended approach extends the existing Docker Compose environment with a MySQL service, allowing students to experience multi-database CDC patterns in a single infrastructure. This mirrors production reality where one Kafka cluster serves multiple heterogeneous database sources. The module structure follows the established PostgreSQL pattern (Module 2) but delivers "even more depth" through extensive binlog internals coverage, production failure scenarios, Aurora-specific optimizations, and operational runbooks.

**Critical success factors:** (1) Emphasize MySQL binlog vs PostgreSQL WAL architectural differences throughout, (2) dedicate significant content to schema history topic management (the #1 production pitfall for MySQL connectors), (3) cover Aurora MySQL limitations explicitly (global read lock prohibition, 7-day binlog retention), and (4) provide hands-on recovery scenarios for common failures (binlog purged, GTID issues, slot conflicts).

## Key Findings

### Recommended Stack

**Minimal stack changes required.** The existing Docker Compose infrastructure (Debezium 2.5.4, Kafka 7.8.1 KRaft) supports MySQL CDC with only the addition of a MySQL container. The Debezium 2.5.4 connector image already includes the MySQL connector alongside PostgreSQL.

**Core technologies:**
- **MySQL 8.0.40** (official Docker image): Source database with native ARM64 support, full Debezium 2.5.4 compatibility
- **Debezium MySQL Connector** (included in 2.5.4): Binlog-based CDC without requiring additional plugins
- **Existing Kafka/Connect infrastructure** (from v1.0): Reused without version changes
- **Schema history Kafka topic**: MySQL-specific requirement for DDL tracking (PostgreSQL doesn't need this)

**Why MySQL 8.0 over 8.4 LTS:** Debezium 2.5.4 officially supports MySQL 8.0/8.2 but not 8.4 (requires Debezium 3.0+). Using 8.0.40 avoids requiring a full stack upgrade. MySQL 8.0 EOL in April 2026 is acceptable for course material published Q1 2026.

**Aurora MySQL simulation:** Full local simulation not possible (Aurora has fundamentally different storage architecture). Labs use standard MySQL 8.0 in Docker; Aurora-specific content covered through parameter group documentation, RDS procedure examples, and architectural diagrams.

### Expected Features

**Table stakes (users expect):**
- MySQL binlog architecture fundamentals (ROW format, event types, rotation)
- GTID (Global Transaction Identifiers) vs position-based tracking
- Binlog retention management and monitoring
- Initial snapshot modes (initial, schema_only, never, when_needed)
- Schema history topic configuration and recovery
- DDL schema evolution handling
- Data type mapping (TINYINT(1) → Boolean, JSON, TIMESTAMP vs DATETIME)
- Aurora MySQL parameter group configuration
- Binlog lag monitoring

**Differentiators (high value, not universally covered):**
- Incremental snapshots with signal table operations
- Aurora MySQL Enhanced Binlog architecture (50% → 13% overhead reduction)
- GTID-based automatic failover deep dive
- Schema history topic reconstruction procedures
- MySQL vs PostgreSQL CDC architectural comparison throughout
- Production failure scenarios and recovery runbooks
- Parallel snapshot chunking strategies
- Heartbeat events for binlog retention protection

**Defer to future versions:**
- Multi-master/Group Replication CDC (medium confidence, less production usage)
- Aurora Global Database binlog propagation (complex, niche use case)
- Maxwell's Daemon comparison (different tool ecosystem)

**Anti-features (explicitly avoid):**
- Statement-based or mixed binlog formats (deprecated, unreliable for CDC)
- Binlog filtering on source database (limits recovery options)
- Trigger-based or query-based CDC (legacy approaches)
- Aurora Backtrack + Enhanced Binlog (mutually exclusive features)

### Architecture Approach

**Add MySQL as Module 8** (standalone specialization after existing 7 modules), not inserted between PostgreSQL modules. This preserves existing course flow, allows optional PostgreSQL-only path (modules 1-7), and teaches multi-database CDC patterns.

**Extend existing Docker Compose with MySQL service** rather than creating separate lab environment. This demonstrates production pattern: single Kafka cluster serving multiple database sources.

**Major components:**
1. **MySQL Container** (port 3307) — Source database with binlog configuration
2. **Debezium MySQL Connector** (deployed to existing Connect cluster) — Binlog reader, schema history manager
3. **Schema History Kafka Topic** — Persistent DDL event storage (MySQL-specific requirement)
4. **Existing Kafka/Connect Infrastructure** — Unchanged from PostgreSQL module
5. **Aurora MySQL Documentation Layer** — Parameter groups, RDS procedures (non-lab content)

**Module 8 lesson structure (5-6 lessons):**
1. Binlog Deep Dive (25 min) — Architecture, formats, GTID vs position
2. MySQL vs PostgreSQL CDC (20 min) — Architectural comparison, when to choose each
3. Aurora MySQL Binlog Configuration (30 min) — Parameter groups, retention, RDS procedures
4. MySQL Connector Setup Lab (35 min) — Hands-on deployment, snapshot modes
5. Schema History Topic Management (25 min) — Configuration, corruption recovery
6. MySQL Capstone Extension (30 min, optional) — Multi-database CDC pipeline

**Content pattern:** Russian explanatory text + English code/configuration (following existing modules 1-7 convention).

### Critical Pitfalls

**1. Schema History Topic Corruption/Deletion (MySQL-specific)**
- **Risk:** Schema history topic deleted or has retention < infinite; connector cannot restart
- **Prevention:** Create topic with `retention.ms=-1`, document "never delete", backup to S3/GCS
- **Course coverage:** Dedicated lesson on schema history topic management, recovery procedures
- **Phase mapping:** Phase 2 (setup), Phase 5 (advanced recovery)

**2. Binlog Position Loss Due to Purging (MySQL/Aurora)**
- **Risk:** Binlog retention expires while connector offline; forces full re-snapshot on restart
- **Prevention:** Set retention > max downtime (AWS RDS max 168 hours), monitor binlog lag with alerts
- **MySQL vs PostgreSQL:** PostgreSQL slots prevent WAL deletion; MySQL purges by time regardless
- **Course coverage:** Binlog retention configuration lesson, monitoring lab
- **Phase mapping:** Phase 1 (binlog fundamentals), Phase 4 (monitoring)

**3. Aurora MySQL Global Read Lock Prohibition**
- **Risk:** Default snapshot strategy uses `FLUSH TABLES WITH READ LOCK`; Aurora prohibits this
- **Prevention:** Use `snapshot.locking.mode=minimal` or incremental snapshots for Aurora/RDS
- **Course coverage:** Aurora-specific snapshot strategies lesson
- **Phase mapping:** Phase 3 (Aurora configuration)

**4. GTID Mode Purging Issues**
- **Risk:** GTID set contains purged transactions; connector refuses to start
- **Prevention:** For simple deployments, avoid GTID mode unless needed for HA failover; if using GTID, increase binlog retention 2-3x
- **Course coverage:** GTID considerations lesson, when to use GTID vs position-based
- **Phase mapping:** Phase 1 (GTID fundamentals), Phase 4 (failover patterns)

**5. Server ID Conflicts with Multiple Connectors**
- **Risk:** Two connectors with same `database.server.id` cause "slave with same server_id" error
- **Prevention:** Document server ID registry, use systematic assignment (10001, 10002, etc.)
- **Course coverage:** Multi-connector configuration patterns
- **Phase mapping:** Phase 2 (connector setup)

**6. PostgreSQL Replication Slot Growth (not MySQL, but course context)**
- **Risk:** WAL accumulation when slot not consumed; disk space exhaustion
- **Prevention:** Monitor slot lag, configure heartbeat intervals, TCP keepalive settings
- **Course coverage:** Already in Module 2; reference for comparison with MySQL binlog retention
- **Phase mapping:** Module 2 existing content

## Implications for Roadmap

Based on research, suggested phase structure for Module 8:

### Phase 1: MySQL Binlog Fundamentals
**Rationale:** Foundation must come first; binlog is architecturally different from PostgreSQL WAL and requires dedicated conceptual coverage before hands-on work.

**Delivers:**
- Lesson 01: Binlog Deep Dive
- Understanding of ROW/STATEMENT/MIXED formats
- GTID vs position-based tracking concepts
- Binlog rotation and retention mechanisms

**Addresses features:**
- MySQL binlog architecture (table stakes)
- Binlog format configuration (table stakes)
- GTID fundamentals (table stakes)

**Avoids pitfalls:**
- Binlog position loss (by teaching retention requirements upfront)
- GTID purging issues (by explaining when to use GTID vs position)

**Research flag:** Standard patterns, low research risk. Official MySQL docs comprehensive.

---

### Phase 2: Comparative Architecture & Connector Setup
**Rationale:** Leverage existing PostgreSQL knowledge (Module 2) through explicit comparison, then hands-on MySQL connector deployment in Docker lab.

**Delivers:**
- Lesson 02: MySQL vs PostgreSQL CDC
- Lesson 04: MySQL Connector Setup Lab
- Extended docker-compose.yml with MySQL service
- Working MySQL connector capturing events to Kafka

**Addresses features:**
- Initial snapshot modes (table stakes)
- Schema history topic configuration (table stakes)
- Connector offset management (table stakes)
- Table/database filtering (table stakes)

**Avoids pitfalls:**
- Server ID conflicts (teach systematic ID assignment in lab)
- Schema history topic corruption (configure correctly from start)

**Research flag:** Standard patterns. Debezium MySQL connector well-documented.

---

### Phase 3: Aurora MySQL Specifics
**Rationale:** Cloud-managed MySQL has critical differences from self-hosted; must be covered explicitly to prevent production failures. Deferred to Phase 3 so local Docker labs work first.

**Delivers:**
- Lesson 03: Aurora MySQL Binlog Configuration
- RDS parameter group examples
- Binlog retention procedure documentation
- Aurora limitations reference (read replicas, global read lock)

**Addresses features:**
- Aurora MySQL parameter group configuration (table stakes)
- Aurora Enhanced Binlog architecture (differentiator)
- Binlog retention management for RDS/Aurora (table stakes)

**Avoids pitfalls:**
- Aurora global read lock prohibition (teach snapshot.locking.mode=minimal)
- Binlog retention limits (document RDS-specific procedures)

**Research flag:** Moderate research risk. Aurora-specific patterns need AWS console screenshots, CloudFormation examples. May need `/gsd:research-phase` for Enhanced Binlog internals if going deep.

---

### Phase 4: Production Operations & Monitoring
**Rationale:** Students need operational skills for production deployments. Builds on Phases 1-3 working knowledge.

**Delivers:**
- Binlog lag monitoring lesson
- Heartbeat event configuration
- Recovery scenario runbooks
- GTID-based failover procedures (optional/advanced)

**Addresses features:**
- Binlog lag monitoring (table stakes)
- Heartbeat events (differentiator)
- GTID failover deep dive (differentiator)

**Avoids pitfalls:**
- Binlog position loss (proactive monitoring prevents)
- GTID purging issues (failover procedures handle)

**Research flag:** Standard monitoring patterns (JMX metrics same as PostgreSQL). Low research risk.

---

### Phase 5: Advanced Topics & Recovery
**Rationale:** Deep dive into schema history topic management and advanced snapshot strategies. Delivers "even more depth than PostgreSQL."

**Delivers:**
- Lesson 05: Schema History Topic Management
- Schema history corruption recovery procedures
- Incremental snapshot configuration (optional/advanced)
- Signal table operations (optional/advanced)

**Addresses features:**
- Schema history topic (table stakes, deep coverage)
- DDL schema evolution (table stakes)
- Incremental snapshots (differentiator)
- Signal table operations (differentiator)

**Avoids pitfalls:**
- Schema history topic corruption (recovery procedures documented)

**Research flag:** Moderate research risk. Incremental snapshots and signal table operations are advanced Debezium features needing deep dive into Debezium 2.5+ documentation.

---

### Phase 6: Multi-Database Capstone Extension (Optional)
**Rationale:** Ties MySQL module back to existing Module 7 Capstone. Demonstrates real-world multi-database CDC pattern.

**Delivers:**
- Lesson 06: MySQL Capstone Extension
- PyFlink job consuming both PostgreSQL and MySQL topics
- Multi-database CDC architecture patterns
- When to use Outbox (PostgreSQL) vs direct CDC (MySQL)

**Addresses features:**
- Multi-database CDC patterns (differentiator)
- MySQL vs PostgreSQL comparison (differentiator)

**Avoids pitfalls:**
- None specific; integrative lesson

**Research flag:** Low risk. Extends existing Module 7 patterns. PyFlink CDC connector supports both sources identically.

---

### Phase Ordering Rationale

**Dependencies:**
- Phase 1 (binlog concepts) → Phase 2 (hands-on lab) → Phase 3 (Aurora specifics) is natural learning progression
- Phase 4 (monitoring) requires working connector from Phase 2
- Phase 5 (advanced topics) builds on Phases 2-3 operational knowledge
- Phase 6 (capstone) requires Module 7 completion

**Groupings:**
- Phases 1-2: Core MySQL CDC fundamentals (parallel to Module 2 for PostgreSQL)
- Phase 3: Cloud-specific content (parallel to Module 6 GCP patterns)
- Phases 4-5: Production operations (parallel to Module 3 for PostgreSQL)
- Phase 6: Integration/capstone (extends Module 7)

**Pitfall avoidance:**
- Early coverage of binlog retention (Phase 1) prevents production outages
- Dedicated schema history topic lesson (Phase 5) addresses #1 MySQL connector production issue
- Aurora-specific phase (Phase 3) prevents copy-paste config failures

### Research Flags

**Needs deeper research during planning:**
- **Phase 3 (Aurora MySQL):** Aurora Enhanced Binlog internals, CloudFormation examples, RDS console screenshots
- **Phase 5 (Incremental Snapshots):** Debezium 2.5+ signaling table mechanics, chunk size tuning patterns

**Standard patterns (skip additional research):**
- **Phase 1 (Binlog Fundamentals):** Well-documented in MySQL official docs
- **Phase 2 (Connector Setup):** Standard Debezium MySQL connector deployment
- **Phase 4 (Monitoring):** JMX metrics identical to PostgreSQL module patterns
- **Phase 6 (Capstone):** Extends existing Module 7; no new research needed

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | MySQL 8.0 ARM64 support verified from Docker Hub. Debezium 2.5.4 MySQL 8.0/8.2 compatibility confirmed from official release notes. No stack upgrades required. |
| Features | HIGH | Table stakes features verified from official Debezium MySQL connector docs. Differentiators (incremental snapshots, Enhanced Binlog) verified from Debezium blog posts and AWS official documentation. |
| Architecture | HIGH | Module 8 placement rationale strong (preserves existing course flow). Docker Compose integration pattern verified from multiple CDC integration guides. Lesson structure parallels Module 2 successfully. |
| Pitfalls | HIGH | Critical pitfalls (schema history topic, binlog purging, Aurora global read lock) verified from community production reports, Debezium issue tracker, and AWS knowledge base articles. |

**Overall confidence:** HIGH

### Gaps to Address

**Aurora MySQL Enhanced Binlog internals:** Research found AWS blog posts announcing feature and performance benefits (50% → 13% overhead), but detailed architecture diagrams and internal mechanics are sparse. If "even more depth" requires Enhanced Binlog internals deep dive, may need `/gsd:research-phase` during Phase 3 planning to find engineering blog posts or re:Invent talks.

**Multi-master/Group Replication CDC patterns:** Medium confidence on this topic. MySQL Group Replication official docs are thorough, but CDC-specific patterns with Debezium are less documented. Currently deferred to "future versions" but if student demand is high, would need deeper research into production case studies.

**MySQL 8.4 LTS migration path:** Currently using MySQL 8.0.40. If course needs future-proofing for MySQL 8.4 LTS, would require Debezium 3.0 upgrade and stack-wide testing. Gap: migration path not researched. Handle by: documenting MySQL 8.0 EOL (April 2026) and noting 8.4 requires future milestone.

**Aurora Global Database binlog propagation:** Research found Aurora Global Database uses physical replication (not binlog-based), which complicates CDC for secondary regions. Gap: Cross-region CDC patterns not fully researched. Handle by: marking as "advanced/out-of-scope for v1.1" unless explicit requirement emerges.

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- [Debezium MySQL Connector Documentation](https://debezium.io/documentation/reference/stable/connectors/mysql.html) — Configuration requirements, snapshot modes, schema history topic
- [MySQL Binary Log Documentation](https://dev.mysql.com/doc/refman/8.0/en/binary-log.html) — Binlog architecture, formats, rotation
- [MySQL Replication Formats](https://dev.mysql.com/doc/refman/8.0/en/replication-formats.html) — ROW vs STATEMENT vs MIXED
- [Red Hat Debezium 2.5.4 MySQL Connector](https://docs.redhat.com/en/documentation/red_hat_build_of_debezium/2.5.4/html/debezium_user_guide/debezium-connector-for-mysql) — Official requirements
- [Confluent Debezium MySQL Connector](https://docs.confluent.io/kafka-connectors/debezium-mysql-source/current/overview.html) — Configuration reference

**AWS Aurora MySQL:**
- [AWS Aurora MySQL Binlog Configuration](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_LogAccess.MySQL.BinaryFormat.html) — Parameter groups
- [Aurora MySQL Enhanced Binlog](https://aws.amazon.com/blogs/database/introducing-amazon-aurora-mysql-enhanced-binary-log-binlog/) — Performance optimization architecture
- [AWS Aurora MySQL Binlog Retention](https://repost.aws/knowledge-center/aurora-mysql-increase-binlog-retention) — Retention configuration
- [Binary Logging Optimizations in Aurora MySQL](https://aws.amazon.com/blogs/database/binary-logging-optimizations-in-amazon-aurora-mysql-version-3/) — Enhanced binlog details

**Docker & Infrastructure:**
- [MySQL Official Docker Image](https://hub.docker.com/_/mysql) — ARM64 support verification, version availability

### Secondary (MEDIUM confidence)

**Technical Guides:**
- [Incremental Snapshots in Debezium](https://debezium.io/blog/2021/10/07/incremental-snapshots/) — Debezium blog, official source but less detailed than main docs
- [Read-only Incremental Snapshots for MySQL](https://debezium.io/blog/2022/04/07/read-only-incremental-snapshots/) — Debezium blog
- [MySQL CDC Complete Guide](https://datacater.io/blog/2021-08-25/mysql-cdc-complete-guide.html) — Community guide, multiple sources agree
- [MySQL CDC with Debezium in Production](https://materialize.com/guides/mysql-cdc/) — Production patterns from Materialize

**Aurora CDC Setup:**
- [Aurora MySQL CDC Setup Guide - OLake](https://olake.io/docs/connectors/mysql/setup/aurora/) — Community documentation, verified against AWS official docs
- [AWS Aurora MySQL CDC Setup - DBConvert](https://streams.dbconvert.com/docs/connections/aws-aurora-mysql) — Community guide

**Comparison Analysis:**
- [Understanding CDC: BinLog vs WAL](https://medium.com/data-science/understanding-change-data-capture-cdc-in-mysql-and-postgresql-binlog-vs-wal-logical-decoding-ac76adb0861f) — Medium article, good architectural summary
- [Replicating MySQL: Binlog and GTIDs](https://airbyte.com/blog/replicating-mysql-a-look-at-the-binlog-and-gtids) — Airbyte blog

### Tertiary (LOW confidence - needs validation)

**Community Production Reports:**
- Various Stack Overflow threads on schema history topic corruption (consistent patterns across multiple reports)
- Reddit discussions on Aurora MySQL CDC limitations (anecdotal but aligns with AWS docs)
- GitHub Debezium issue tracker for GTID purging errors (issue reports, not official guidance)

---

*Research completed: 2026-02-01*
*Ready for roadmap: YES*
