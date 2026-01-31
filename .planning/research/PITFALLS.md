# Pitfalls Research: Debezium Course

**Domain:** Change Data Capture / Debezium / Technical Education
**Researched:** 2026-01-31
**Confidence:** MEDIUM-HIGH

## Executive Summary

This research identifies critical pitfalls in two dimensions: (1) Debezium/CDC production deployments, and (2) technical course creation. Debezium pitfalls cluster around operational complexity, database-specific configuration issues, and recovery scenarios. Course creation pitfalls center on outdated content, missing hands-on elements, and poor prerequisite management.

The most critical production pitfalls are **replication slot management** (PostgreSQL), **snapshot failures** (all connectors), and **offset desynchronization** (recovery scenarios). For course creation, the most damaging mistakes are **outdated examples** (18-month shelf life) and **insufficient hands-on practice** (theory without application).

---

## Part 1: Debezium/CDC Production Pitfalls

### 1.1 PostgreSQL Replication Slot Pitfalls

#### CRITICAL: Replication Slot Growth / WAL Accumulation

**What goes wrong:**
PostgreSQL disk space consumed by WAL (Write-Ahead Log) files spikes and grows indefinitely. On Amazon RDS PostgreSQL and Cloud SQL, replication slots can constantly increase without being cleaned, causing the database to run out of disk space and potentially crash.

**Why it happens:**
- PostgreSQL fails to detect stale connections due to insufficient TCP keepalive settings
- Connector only processes changes on whitelisted tables; if only non-whitelisted tables change, no events are emitted, no offsets are committed, and logs are retained indefinitely
- Internal Kafka topics (offsets, status, schema-history) deleted earlier cause misalignment between Debezium state and PostgreSQL replication slot

**Consequences:**
- Database runs out of disk space
- Production database outage
- Expensive emergency disk expansion
- Data loss if binlog/WAL files are purged

**Prevention:**
1. **Enable heartbeat configuration:** Set `heartbeat.interval.ms` to ensure regular offset commits even when no data changes
2. **Configure TCP keepalive:** Prevent stale connection detection failures
3. **Monitor replication slot lag:** Alert when `pg_replication_slots.confirmed_flush_lsn` falls behind
4. **Set retention policies:** Configure appropriate WAL retention limits
5. **Whitelist tables carefully:** Ensure at least one high-traffic table triggers regular offset commits

**Detection (Warning Signs):**
- Disk space usage growing linearly over time
- `SELECT * FROM pg_replication_slots` shows large `restart_lsn` gap
- Database monitoring shows WAL file count increasing
- Replication lag metrics increasing

**Course Phase Mapping:**
- **Phase 2 (PostgreSQL Connector):** Explain replication slots, demonstrate monitoring
- **Phase 4 (Production Deployment):** Configure heartbeat, set up alerts
- **Phase 7 (Troubleshooting):** Recovery procedures for full disks

---

#### CRITICAL: Stale/Active Replication Slot Failures

**What goes wrong:**
Connector fails to restart with errors like "Failed to start replication stream" and "replication slot is active for PID" even though no backend process exists with that PID.

**Why it happens:**
- PostgreSQL doesn't detect stale connections when TCP keepalive is misconfigured
- Internal Kafka topics deleted cause state mismatch
- Connector crashes mid-stream without properly releasing slot

**Consequences:**
- Connector cannot restart without manual intervention
- Data streaming stops until resolved
- Requires database admin access to manually drop and recreate slot

**Prevention:**
1. **Configure TCP keepalive properly:** `tcp_keepalives_idle`, `tcp_keepalives_interval`, `tcp_keepalives_count`
2. **Never delete internal Kafka topics:** Protect `connect-offsets`, `connect-configs`, `connect-status`, schema history topic
3. **Use publication-based replication:** Prefer `pgoutput` plugin over older `decoderbufs`
4. **Implement graceful shutdown:** Ensure connector shutdown procedures complete

**Detection:**
- Connector status shows FAILED
- Logs contain "replication slot is active for PID"
- `SELECT * FROM pg_stat_replication` shows no matching PID

**Course Phase Mapping:**
- **Phase 2 (PostgreSQL Connector):** Demonstrate proper TCP keepalive configuration
- **Phase 7 (Troubleshooting):** Manual slot recovery procedures

---

#### CRITICAL: Node Replacement Data Loss (Cloud SQL, RDS)

**What goes wrong:**
After a database failover or node replacement, replication slots are NOT automatically recreated on the newly promoted primary. If changes occur before Debezium recreates the slot, those changes are permanently lost.

**Why it happens:**
- Replication slots are not replicated to standby nodes
- Cloud providers (GCP Cloud SQL, AWS RDS) handle failovers automatically
- Time gap between failover and slot recreation

**Consequences:**
- Permanent data loss for changes made during gap
- No warning or error - silent data loss
- Compliance and audit issues

**Prevention:**
1. **Monitor failover events:** Set up Cloud SQL/RDS event notifications
2. **Use logical replication slot management:** Configure slot recreation scripts
3. **Consider Event Sourcing pattern:** Maintain source-of-truth event log
4. **Test failover procedures:** Regular disaster recovery drills
5. **Document acceptable data loss window:** Define RPO (Recovery Point Objective)

**Detection:**
- Cloud provider failover logs
- Gap in Debezium event timestamps
- Replication slot query shows recent creation time after old traffic

**Course Phase Mapping:**
- **Phase 3 (Cloud Integrations - GCP):** Demonstrate Cloud SQL failover behavior
- **Phase 4 (Production Deployment):** Failover detection and recovery automation
- **Phase 7 (Troubleshooting):** Data loss assessment and mitigation

---

### 1.2 Aurora DB / RDS MySQL Pitfalls

#### CRITICAL: Privilege Limitations (FLUSH TABLES WITH READ LOCK)

**What goes wrong:**
Debezium snapshot fails because `FLUSH TABLES WITH READ LOCK` requires SUPER privilege, which is not available to RDS/Aurora users, even master users.

**Why it happens:**
- RDS/Aurora security model restricts SUPER privilege
- Debezium defaults to global read lock for consistent snapshots
- Table-level locks have different consistency guarantees

**Consequences:**
- Initial snapshot fails to start
- Connector cannot initialize
- Must use alternative snapshot strategies with weaker consistency

**Prevention:**
1. **Configure snapshot.locking.mode:** Set to `minimal` or `none` instead of default
2. **Use LOCK TABLES permissions:** Ensure user has `LOCK TABLES` privilege
3. **Consider snapshot.mode options:** Use `schema_only` if data already exists elsewhere
4. **Document consistency tradeoffs:** Table-level locks don't prevent all concurrent writes

**Detection:**
- Connector fails on startup
- Logs show "Access denied; you need (at least one of) the SUPER privilege(s)"

**Course Phase Mapping:**
- **Phase 1 (Aurora Connector):** Explain RDS privilege model, configure snapshot.locking.mode
- **Phase 5 (Snapshots):** Compare global vs table-level lock consistency

---

#### MODERATE: Binary Log Configuration

**What goes wrong:**
Aurora/RDS doesn't have binary logging enabled by default, causing Debezium to fail without change events.

**Why it happens:**
- Binary logging disabled unless backups or read replicas configured
- Incorrect binlog format (STATEMENT instead of ROW)
- Insufficient binlog retention period

**Consequences:**
- No CDC events captured
- Connector starts but emits no data
- Silent failure mode

**Prevention:**
1. **Enable binary logging:** Configure automated backups or create read replica
2. **Set binlog_format=ROW:** Verify with `SHOW VARIABLES LIKE 'binlog_format'`
3. **Configure retention period:** Minimum 3 days (`call mysql.rds_set_configuration('binlog retention hours', 72)`)
4. **Monitor binlog position:** Track connector lag vs retention window

**Detection:**
- `SHOW BINARY LOGS` returns empty or ERROR 1381
- Connector starts but no events appear in Kafka
- Logs show "MySQL binary log is disabled"

**Course Phase Mapping:**
- **Phase 1 (Aurora Connector):** Enable and configure binary logging
- **Phase 6 (Operations):** Monitor binlog retention vs lag

---

#### MODERATE: Single Task Limitation

**What goes wrong:**
Aurora MySQL connector only supports one task and fails with MSK Connect autoscaled capacity mode.

**Why it happens:**
- Debezium MySQL connector is single-threaded per connector
- Autoscaling conflicts with single-task requirement

**Consequences:**
- No horizontal scaling for MySQL/Aurora connectors
- Performance bottleneck on high-traffic databases
- Must use provisioned capacity mode

**Prevention:**
1. **Use provisioned capacity mode:** Set `workerCount = 1` for Aurora/MySQL connectors
2. **Vertical scaling only:** Increase worker instance size instead of count
3. **Partition by database:** Run separate connectors for different schemas
4. **Consider incremental snapshots:** Reduce load during initial snapshot

**Detection:**
- MSK Connect autoscale mode fails with configuration error
- Single task shown in connector status

**Course Phase Mapping:**
- **Phase 1 (Aurora Connector):** Explain single-task limitation
- **Phase 4 (Production Deployment):** Provisioned capacity configuration for AWS MSK Connect

---

#### MODERATE: Snapshot Performance Issues (Large Databases)

**What goes wrong:**
Initial snapshots are extremely slow (days for TB-scale databases), hold read locks, and can only process new changes after completion. If connector fails mid-snapshot, entire process restarts from beginning.

**Why it happens:**
- Conventional snapshots read entire database sequentially
- Global or table-level read locks held during snapshot
- No checkpoint mechanism in traditional snapshots

**Consequences:**
- Multi-day snapshot windows unacceptable in production
- Read locks block production writes
- Snapshot failures require full restart
- Database performance degradation

**Prevention:**
1. **Use incremental snapshots:** Enable Debezium incremental snapshot feature (chunks in parallel with streaming)
2. **Schedule snapshots during off-peak:** Minimize production impact
3. **Snapshot by batches:** Start with subset of tables, extend gradually
4. **Consider snapshot.mode=schema_only:** If data already exists in target
5. **Size worker appropriately:** Ensure sufficient memory (`max.batch.size`, heap size)

**Detection:**
- Snapshot running for hours/days
- Database CPU/IO spikes
- Application slowness during snapshot
- Connector shows "SNAPSHOT" mode in status

**Course Phase Mapping:**
- **Phase 5 (Snapshots):** Compare conventional vs incremental snapshots, demonstrate incremental
- **Phase 4 (Production Deployment):** Capacity planning for snapshots

---

### 1.3 GCP Integration Pitfalls

#### MODERATE: Workload Identity Configuration (GKE + Pub/Sub)

**What goes wrong:**
Debezium Server deployed on GKE fails to publish to Pub/Sub with permission errors.

**Why it happens:**
- Workload Identity not properly configured
- Service account missing Pub/Sub publisher role
- Incorrect annotation on Kubernetes service account

**Consequences:**
- Events cannot be published to Pub/Sub
- Connector fails with authentication errors
- No data reaches downstream consumers

**Prevention:**
1. **Configure Workload Identity binding:** Link Kubernetes SA to Google SA
2. **Grant Pub/Sub permissions:** `roles/pubsub.publisher` on Google service account
3. **Annotate Kubernetes SA:** `iam.gke.io/gcp-service-account=[GSA]@[PROJECT].iam.gserviceaccount.com`
4. **Test permissions before deployment:** Use `gcloud pubsub topics publish` from pod

**Detection:**
- Logs show "403 Forbidden" or "Permission denied"
- Events not appearing in Pub/Sub topics
- `gcloud pubsub subscriptions pull` returns empty

**Course Phase Mapping:**
- **Phase 3 (Cloud Integrations - GCP):** Configure Workload Identity, demonstrate IAM setup

---

#### LOW: Cloud SQL Logical Decoding Configuration

**What goes wrong:**
Cloud SQL for PostgreSQL doesn't have logical decoding enabled, blocking Debezium.

**Why it happens:**
- Logical decoding disabled by default on Cloud SQL
- Wrong replication plugin selected

**Consequences:**
- Connector fails to create replication slot
- No CDC events captured

**Prevention:**
1. **Enable logical decoding flag:** Set `cloudsql.logical_decoding=on` in Cloud SQL
2. **Use pgoutput plugin:** Simplest option, built-in to PostgreSQL
3. **Restart database instance:** Flag change requires restart
4. **Verify with query:** `SHOW wal_level` should return `logical`

**Detection:**
- Connector fails with "logical decoding not enabled"
- `SELECT * FROM pg_replication_slots` fails to create slot

**Course Phase Mapping:**
- **Phase 3 (Cloud Integrations - GCP):** Enable and verify logical decoding

---

### 1.4 Kafka Connect Configuration Pitfalls

#### CRITICAL: Producer Max Request Size (Large Transactions)

**What goes wrong:**
Large transactions generate messages exceeding Kafka's default maximum message size (1 MB), causing "RecordTooLargeException" and connector failure.

**Why it happens:**
- Single database transaction with many rows becomes one Kafka message
- JSONB columns with 1-1.5 MB payloads
- Before/after images double message size for updates
- Default `producer.max.request.size` too small

**Consequences:**
- Connector stops processing
- Data pipeline halts
- Backpressure on database replication logs

**Prevention:**
1. **Increase producer.max.request.size:** Set in Kafka Connect worker config (`connect-distributed.properties`)
2. **Match Kafka broker config:** Also increase `message.max.bytes` on brokers and `replica.fetch.max.bytes`
3. **Use message filtering SMT:** Produce only changed fields instead of full before/after
4. **Monitor message sizes:** Alert on messages approaching limit
5. **Consider chunking large transactions:** Split at application level if possible

**Detection:**
- Logs show "RecordTooLargeException"
- Connector status FAILED
- Kafka producer metrics show rejected records

**Course Phase Mapping:**
- **Phase 4 (Production Deployment):** Configure message size limits
- **Phase 6 (Operations):** Monitor message size metrics
- **Phase 7 (Troubleshooting):** Diagnose and fix RecordTooLargeException

---

#### CRITICAL: Offset Flush Timeout

**What goes wrong:**
Connector logs "Failed to flush, timed out while waiting for producer" errors, causing offset commit failures and potential duplicate events.

**Why it happens:**
- Slow Kafka replicas delay offset commits
- High record generation rate overwhelms offset topic
- Default timeout too short for cluster latency

**Consequences:**
- Offsets not committed reliably
- Duplicate events on connector restart
- Connector instability

**Prevention:**
1. **Tune offset.flush.interval.ms:** Increase interval between flush attempts
2. **Tune offset.flush.timeout.ms:** Increase timeout for flush completion
3. **Monitor Kafka cluster health:** Ensure offset topic has healthy replicas
4. **Increase offset topic replication:** Ensure `replication.factor >= 3`
5. **Consider dedicated Kafka cluster:** Separate offset storage from data topics

**Detection:**
- Logs show "Failed to flush, timed out"
- Offset lag increases over time
- Duplicate events observed in consumers

**Course Phase Mapping:**
- **Phase 4 (Production Deployment):** Configure offset flush settings
- **Phase 6 (Operations):** Monitor offset commit metrics

---

#### MODERATE: Distributed Mode Cluster Coordination Failures

**What goes wrong:**
Workers in Kafka Connect distributed mode fail to coordinate, causing task rebalancing storms, split-brain scenarios, or tasks not being assigned.

**Why it happens:**
- `group.id` mismatch between workers
- `rest.advertised.host.name` set to `localhost` prevents inter-worker communication
- Shared storage topics (offsets, configs, status) misconfigured
- Network partitions between workers

**Consequences:**
- Tasks repeatedly rebalance between workers
- Connectors fail to start
- Split-brain: multiple workers think they own the same task
- Data duplication or loss

**Prevention:**
1. **Same group.id across workers:** All workers in cluster must share identical `group.id`
2. **Configure rest.advertised.host.name properly:** Use resolvable hostname/IP, NOT `localhost`
3. **Unique topic set per cluster:** Each Kafka Connect cluster needs unique `config.storage.topic`, `offset.storage.topic`, `status.storage.topic`
4. **Monitor rebalance frequency:** Alert on excessive rebalances
5. **Network stability:** Ensure stable connectivity between workers

**Detection:**
- Frequent task rebalances in logs
- REST API shows workers unable to contact each other
- Tasks remain UNASSIGNED
- Multiple workers claim same task ID

**Course Phase Mapping:**
- **Phase 4 (Production Deployment):** Configure distributed mode properly
- **Phase 7 (Troubleshooting):** Diagnose coordination failures

---

#### MODERATE: Internal Topic Deletion (Catastrophic Data Loss)

**What goes wrong:**
Deleting Kafka Connect internal topics (`connect-offsets`, `connect-configs`, `connect-status`) or Debezium schema history topic causes offset desynchronization, lost connector configuration, and inability to restart.

**Why it happens:**
- Misunderstanding of Kafka topic retention
- Accidental deletion during cleanup
- Automated topic deletion policies

**Consequences:**
- Connector cannot resume from correct position
- Must re-snapshot entire database
- Configuration lost, connectors disappear
- Replication slot/binlog position mismatch

**Prevention:**
1. **Protect internal topics:** Set retention to `infinite` or very long period
2. **Document internal topics clearly:** Tag with naming convention
3. **Restrict delete permissions:** Kafka ACLs prevent accidental deletion
4. **Backup configurations:** Export connector configs regularly via REST API
5. **Monitor topic existence:** Alert if internal topics disappear

**Detection:**
- Connectors fail to start after restart
- Empty connector list from REST API
- Logs show "offset topic does not exist"
- Replication slot position doesn't match offset

**Course Phase Mapping:**
- **Phase 4 (Production Deployment):** Configure internal topics with infinite retention
- **Phase 6 (Operations):** Backup and recovery procedures
- **Phase 7 (Troubleshooting):** Recovery from internal topic loss

---

### 1.5 Schema Evolution Pitfalls

#### CRITICAL: Schema Registry Version Mismatch

**What goes wrong:**
Debezium provides hardcoded schema version of 1, while Schema Registry increments versions. Connect record schema version shows constant value of 1 even after schema changes, causing confusion and preventing proper version tracking.

**Why it happens:**
- Debezium hardcodes schema version to 1
- Schema Registry creates new versions on logical changes
- Two different versioning systems conflict

**Consequences:**
- Cannot track schema evolution via Connect schema version
- Must rely solely on Schema Registry version
- Confusion about "current" schema version
- Debugging difficulties

**Prevention:**
1. **Rely on Schema Registry version only:** Ignore Debezium's hardcoded version 1
2. **Monitor Schema Registry directly:** Query registry for actual version numbers
3. **Document this quirk:** Ensure team understands dual versioning
4. **Use schema ID in monitoring:** Track schema ID instead of version number

**Detection:**
- Connect schema version always shows 1
- Schema Registry version increments normally
- Discrepancy between two version numbers

**Course Phase Mapping:**
- **Phase 8 (Schema Management):** Explain dual versioning, demonstrate Schema Registry queries

---

#### CRITICAL: Column Swap Not Detected

**What goes wrong:**
Two columns swapped in a way that leaves table schema logically unchanged (same types, same names after swap) doesn't create new schema version in Schema Registry, causing silent data corruption.

**Why it happens:**
- Schema Registry creates new version only on logical schema changes
- Column order swap with rename back has same logical schema
- No semantic understanding of column meaning

**Consequences:**
- Data mapped to wrong columns
- Silent data corruption
- Consumers process incorrect data
- Very difficult to detect and debug

**Prevention:**
1. **Avoid column swaps entirely:** Add new columns, migrate data, drop old columns
2. **Version schemas manually:** Force new schema version on semantic changes
3. **Add schema comments/metadata:** Document column meanings
4. **Validate data semantically:** Downstream validation catches mismatched data
5. **Test schema changes in staging:** Verify end-to-end data flow

**Detection:**
- Data anomalies in downstream systems
- Values in wrong semantic context
- No schema registry version change despite DDL
- Manual schema inspection reveals swap

**Course Phase Mapping:**
- **Phase 8 (Schema Management):** Demonstrate column swap scenario, safe migration patterns

---

#### MODERATE: KSQL Schema Update Issues

**What goes wrong:**
KSQL tables cannot perform in-place schema updates for Debezium's schema evolution when using Avro payloads with Schema Registry. Neither auto-update nor `CREATE OR REPLACE` adopts new schema versions.

**Why it happens:**
- KSQL doesn't auto-detect schema evolution
- `CREATE OR REPLACE` doesn't refresh schema from registry
- Must manually drop and recreate KSQL table

**Consequences:**
- Schema evolution breaks KSQL queries
- Must drop and recreate tables, losing downstream state
- Downtime during schema migration

**Prevention:**
1. **Plan for KSQL table recreation:** Design for ephemeral KSQL tables
2. **Use ksqlDB instead of KSQL:** Newer version has better schema support
3. **Minimize schema changes:** Additive changes only (new columns)
4. **Backward/forward compatible schemas:** Avoid breaking changes
5. **Automate table recreation:** Script the drop/recreate process

**Detection:**
- KSQL queries fail after schema change
- Error messages about schema mismatch
- Schema version in registry doesn't match KSQL table

**Course Phase Mapping:**
- **Phase 8 (Schema Management):** Demonstrate KSQL limitation, recreation procedure

---

#### MODERATE: Confluent Schema Registry Removed (Debezium 2.x)

**What goes wrong:**
Debezium 2.0+ removes native Confluent Schema Registry support, requiring manual build of Debezium Connect images with Confluent converters.

**Why it happens:**
- Debezium project removed Confluent dependency
- Users must integrate converters themselves

**Consequences:**
- Default Debezium images don't work with Confluent Schema Registry
- Must build custom images
- Increased complexity for Confluent users

**Prevention:**
1. **Use Apicurio Registry:** Debezium's recommended alternative
2. **Build custom images:** Include Confluent converters in Dockerfile
3. **Use pre-built images:** Community or Confluent provides compatible images
4. **Document build process:** Maintain custom image build pipeline

**Detection:**
- Connector fails with "converter class not found"
- Confluent converters missing from classpath

**Course Phase Mapping:**
- **Phase 8 (Schema Management):** Compare Apicurio vs Confluent, build custom image

---

### 1.6 Snapshot and Initial Load Pitfalls

#### CRITICAL: Binlog Position Loss

**What goes wrong:**
If Debezium MySQL connector stops for too long, MySQL server purges older binlog files and connector's last position is lost. On restart, MySQL server no longer has the starting point and connector fails.

**Why it happens:**
- Connector downtime exceeds binlog retention period
- Binlog retention too short for maintenance windows
- High transaction volume fills binlog quickly

**Consequences:**
- Connector cannot resume streaming
- If `snapshot.mode=initial`, connector fails permanently
- Must re-snapshot entire database
- Data loss for purged period

**Prevention:**
1. **Increase binlog retention:** Set to 7+ days (`expire_logs_days` or `binlog_expire_logs_seconds`)
2. **Monitor connector lag:** Alert before lag approaches retention limit
3. **Use snapshot.mode=when_needed:** Automatically re-snapshot if position lost
4. **Minimize connector downtime:** Automate restarts, reduce maintenance windows
5. **Archive binlogs externally:** Backup binlogs to S3/GCS for recovery

**Detection:**
- Connector fails with "binlog position no longer available"
- MySQL logs show binlog file purge
- Gap between connector offset and earliest available binlog

**Course Phase Mapping:**
- **Phase 5 (Snapshots):** Configure snapshot.mode, binlog retention
- **Phase 7 (Troubleshooting):** Recovery from binlog position loss

---

#### MODERATE: Snapshot Mode Misconfiguration

**What goes wrong:**
Wrong `snapshot.mode` setting causes unexpected behavior: missing historical data, unnecessary re-snapshots, or connector failures.

**Why it happens:**
- Misunderstanding of snapshot mode options
- Default mode not appropriate for use case
- Copy-paste configuration without review

**Consequences:**
- `initial`: Re-snapshots on every connector restart
- `schema_only`: Missing historical data if expected
- `never`: Fails if offset doesn't exist
- Unexpected behavior confuses operations team

**Prevention:**
1. **Understand snapshot modes thoroughly:**
   - `initial`: Snapshot if no offset exists (default)
   - `always`: Snapshot on every start (testing only)
   - `never`: Fail if no offset (requires external snapshot)
   - `schema_only`: Metadata only, no data
   - `when_needed`: Auto-detect need for snapshot
2. **Choose mode explicitly:** Don't rely on defaults
3. **Document choice in config:** Comment explaining why mode chosen
4. **Test in non-production first:** Verify behavior before production

**Detection:**
- Unexpected snapshot behavior
- Missing data or duplicate data
- Connector failures on restart

**Course Phase Mapping:**
- **Phase 5 (Snapshots):** Compare all snapshot modes with hands-on examples

---

### 1.7 Monitoring and Observability Pitfalls

#### CRITICAL: Missing JMX Monitoring

**What goes wrong:**
Production Debezium deployment lacks monitoring, making it impossible to detect lag, resource exhaustion, or failures before customer impact.

**Why it happens:**
- JMX monitoring not configured by default
- Prometheus/Grafana setup skipped as "nice to have"
- Metrics collection adds complexity

**Consequences:**
- No visibility into connector health
- Lag discovered only when customers report stale data
- Resource exhaustion causes unexpected failures
- No data for capacity planning

**Prevention:**
1. **Enable JMX from day one:** Configure JMX exporter in Kafka Connect deployment
2. **Deploy Prometheus + Grafana:** Standard monitoring stack for Debezium
3. **Use pre-built dashboards:** Debezium community provides Grafana dashboards
4. **Alert on key metrics:**
   - `debezium.metrics:type=connector-metrics,context=snapshot,name=MilliSecondsSinceLastEvent` (lag)
   - `debezium.metrics:type=connector-metrics,context=streaming,name=MilliSecondsBehindSource` (replication lag)
   - Queue usage between components
5. **Monitor JVM metrics:** Heap usage, GC pauses

**Detection:**
- No metrics dashboard exists
- No alerts firing despite known issues
- Operations team "flying blind"

**Course Phase Mapping:**
- **Phase 6 (Operations):** Configure JMX, deploy Prometheus/Grafana, create alerts

---

#### MODERATE: Insufficient Alerting

**What goes wrong:**
Monitoring exists but alerts not configured, so metrics collected but nobody notified of issues.

**Why it happens:**
- Metrics collection treated as sufficient
- Alert threshold tuning postponed
- Notification channels not configured

**Consequences:**
- Metrics show problem history but team unaware in real-time
- Same impact as no monitoring for incident response

**Prevention:**
1. **Define SLOs first:** What lag is acceptable? What uptime target?
2. **Configure alerts for SLO violations:**
   - Lag > 60 seconds (warning)
   - Lag > 300 seconds (critical)
   - Connector status != RUNNING (critical)
   - Offset flush failures (warning)
3. **Test alert delivery:** Verify PagerDuty/Slack/email actually arrives
4. **Runbook for each alert:** Link to resolution steps

**Detection:**
- Dashboard exists but no alert history
- Problems discovered by humans checking dashboard
- No on-call process for Debezium

**Course Phase Mapping:**
- **Phase 6 (Operations):** Configure alerts with thresholds, test delivery

---

### 1.8 Transformation (SMT) Pitfalls

#### MODERATE: Applying SMTs to Wrong Message Types

**What goes wrong:**
SMT designed for DML events (with `op` field) fails when applied to heartbeat messages, tombstone messages, or schema change events that lack this field.

**Why it happens:**
- SMT configuration doesn't use predicates to filter message types
- Assumption that all messages have same structure
- Heartbeat/tombstone messages have different schemas

**Consequences:**
- Transformation fails with null pointer exception
- Connector stops processing
- Data pipeline halts

**Prevention:**
1. **Use SMT predicates:** Selectively apply transformations only to appropriate events
2. **Example predicate:**
   ```
   transforms.filterOp.predicate=HasOp
   predicates.HasOp.type=org.apache.kafka.connect.transforms.predicates.HasHeaderKey
   predicates.HasOp.name=op
   ```
3. **Test with all message types:** Include heartbeat, tombstone in testing
4. **Handle null values gracefully:** SMT code should check for null

**Detection:**
- Logs show NullPointerException in SMT
- Connector FAILED after heartbeat message
- Missing expected field errors

**Course Phase Mapping:**
- **Phase 9 (Message Transformations):** Demonstrate predicates, test with heartbeat/tombstone

---

#### LOW: SMT Security with Scripting Expressions

**What goes wrong:**
Once scripting SMT deployed, any user with connector creation permission can execute arbitrary scripts in Kafka Connect JVM.

**Why it happens:**
- Scripting SMT allows JavaScript/Groovy execution
- Kafka Connect permission model doesn't isolate connectors

**Consequences:**
- Potential code injection
- Unauthorized access to Kafka Connect internals
- Security vulnerability

**Prevention:**
1. **Secure Kafka Connect REST API:** Authentication and authorization
2. **Restrict connector creation permissions:** Only trusted users
3. **Prefer non-scripting SMTs:** Use built-in transformations when possible
4. **Code review SMT scripts:** Treat as application code
5. **Run Kafka Connect in isolated environment:** Limit blast radius

**Detection:**
- Unauthorized connectors appear
- Unexpected JVM behavior in Kafka Connect workers

**Course Phase Mapping:**
- **Phase 9 (Message Transformations):** Discuss security implications, recommend non-scripting alternatives

---

### 1.9 Operational Complexity Pitfalls

#### CRITICAL: Infrastructure Burden (Kafka Ecosystem)

**What goes wrong:**
Organizations not using Kafka must stand up entire Kafka ecosystem (Kafka, ZooKeeper/KRaft, Schema Registry, Connect) just to use Debezium, creating massive operational overhead.

**Why it happens:**
- Debezium originally designed for Kafka-centric architectures
- No lightweight deployment option in classic Debezium

**Consequences:**
- 3-6 month project to deploy Kafka before CDC can begin
- Ongoing operational burden: upgrades, scaling, monitoring
- High cost for small CDC use cases
- Requires Kafka expertise on team

**Prevention/Mitigation:**
1. **Use Debezium Server:** Standalone mode supports Pub/Sub, Kinesis, HTTP without Kafka
2. **Managed Kafka services:** AWS MSK, Confluent Cloud reduce operational burden
3. **Evaluate CDC-as-a-Service:** Estuary Flow, Airbyte for simpler deployment
4. **Build business case for Kafka:** If only need is CDC, consider alternatives

**Detection:**
- 6+ month timeline for "simple" CDC project
- Team lacks Kafka expertise
- Infrastructure costs exceed CDC value

**Course Phase Mapping:**
- **Phase 3 (Cloud Integrations - GCP):** Demonstrate Debezium Server with Pub/Sub (Kafka-less)
- **Phase 10 (Alternative Architectures):** Compare Kafka vs Kafka-less deployments

---

#### MODERATE: Duplicate Events (At-Least-Once Semantics)

**What goes wrong:**
Systems receive duplicate events during network failures, crashes, or rebalances, but consumers aren't idempotent, causing data corruption.

**Why it happens:**
- Debezium provides at-least-once delivery (not exactly-once)
- Offset commits can fail while events succeed
- Network retries resend messages

**Consequences:**
- Duplicate records in target database
- Incorrect aggregations (double-counting)
- Idempotency assumption violated

**Prevention:**
1. **Design idempotent consumers:** Use upsert instead of insert, deduplicate on unique key
2. **Use transaction markers:** Debezium can emit transaction boundaries
3. **Implement deduplication layer:** Track processed event IDs in cache/database
4. **Document at-least-once guarantee:** Ensure downstream teams understand
5. **Test with duplicate injection:** Chaos engineering validates idempotency

**Detection:**
- Duplicate primary key violations in target
- Aggregation counts don't match source
- Same event ID appears multiple times in logs

**Course Phase Mapping:**
- **Phase 4 (Production Deployment):** Explain at-least-once semantics
- **Phase 11 (Consumers):** Implement idempotent consumer patterns

---

#### MODERATE: Message Ordering Per Table, Not Database

**What goes wrong:**
Assuming global ordering across all tables, but Debezium only guarantees ordering per table (per partition key).

**Why it happens:**
- Kafka partitioning by table and primary key
- No global sequence number across tables
- Misunderstanding of CDC guarantees

**Consequences:**
- Cross-table transaction integrity lost
- Read-your-writes consistency violated
- Temporal queries show inconsistent snapshots

**Prevention:**
1. **Understand ordering guarantees:** Per table per PK only
2. **Use transaction markers:** Debezium can group events by transaction ID
3. **Design for eventual consistency:** Don't assume cross-table ordering
4. **Single partition for strict ordering:** Route all events to one partition (performance tradeoff)
5. **Application-level sequencing:** Add sequence numbers in source database

**Detection:**
- Cross-table invariants violated
- Events from Transaction A and B interleaved incorrectly
- Temporal queries show inconsistent state

**Course Phase Mapping:**
- **Phase 4 (Production Deployment):** Explain ordering guarantees, transaction markers
- **Phase 11 (Consumers):** Handle out-of-order events

---

### 1.10 Database-Specific Edge Cases

#### MODERATE: MySQL CASCADE DELETE Not in Binlog

**What goes wrong:**
Rows deleted via CASCADE DELETE don't appear in binlog, causing Debezium to miss these deletes and downstream systems to have orphaned records.

**Why it happens:**
- MySQL doesn't log CASCADE DELETE to binlog
- Foreign key cascades handled internally
- Binlog only shows triggering DELETE

**Consequences:**
- Orphaned child records in target systems
- Data inconsistency between source and target
- Referential integrity violations

**Prevention:**
1. **Avoid CASCADE DELETE in source:** Use application-level cascading
2. **Rebuild child records periodically:** Full snapshot to detect orphans
3. **Document known limitation:** Ensure downstream teams aware
4. **Consider triggers:** Log cascade deletes via triggers (performance impact)

**Detection:**
- Child records exist in target but not source
- Referential integrity checks fail
- Snapshot reconciliation shows discrepancies

**Course Phase Mapping:**
- **Phase 1 (Aurora Connector):** Document CASCADE DELETE limitation, demonstrate issue

---

#### LOW: MongoDB Document Size Limit (16 MB)

**What goes wrong:**
MongoDB documents exceeding 16 MB BSON limit crash Debezium connector.

**Why it happens:**
- BSON format has hard 16 MB limit
- Large embedded arrays or documents exceed limit

**Consequences:**
- Connector crashes on oversized document
- Data pipeline halts
- Cannot skip problematic document without configuration

**Prevention:**
1. **Configure cursor.oversize.handling.mode:** Set to `skip` to ignore oversized documents
2. **Monitor document sizes:** Alert on documents approaching 16 MB
3. **Refactor data model:** Normalize large embedded documents to separate collections
4. **Filter oversized documents at source:** Application prevents creation

**Detection:**
- Connector crashes with "document exceeds maximum size"
- Logs show 16 MB limit error

**Course Phase Mapping:**
- **Phase 1 (MongoDB Connector - if included):** Configure oversize handling

---

#### MODERATE: Database Timezone Configuration

**What goes wrong:**
TIMESTAMP values fail to normalize to UTC if database timezone isn't explicitly specified via `database.connectionTimeZone`, causing incorrect timestamps in events.

**Why it happens:**
- Default timezone handling varies by connector
- Database timezone != JVM timezone
- Implicit timezone conversion errors

**Consequences:**
- Timestamps off by hours (timezone offset)
- Temporal queries return wrong results
- Data appears in wrong time buckets

**Prevention:**
1. **Always set database.connectionTimeZone explicitly:** Don't rely on defaults
2. **Standardize on UTC everywhere:** Database, Debezium, consumers
3. **Test with timezone edge cases:** DST transitions, leap seconds
4. **Validate timestamp accuracy:** Compare source vs target timestamps

**Detection:**
- Timestamps consistently off by fixed offset
- Events appear to occur in future or past
- Timezone math errors in queries

**Course Phase Mapping:**
- **Phase 2 (PostgreSQL Connector) / Phase 1 (Aurora Connector):** Configure connectionTimeZone

---

### 1.11 Recovery and Failure Scenarios

#### CRITICAL: Offset Desynchronization After Failure

**What goes wrong:**
After crash or network failure, Debezium offset (last processed position) doesn't match database replication slot LSN, causing gap in data or reprocessing.

**Why it happens:**
- Offset commit fails while event processing succeeds
- Internal Kafka topics deleted
- Manual offset manipulation errors

**Consequences:**
- Data loss if offset ahead of slot
- Duplicate events if offset behind slot
- Difficult to diagnose and correct

**Prevention:**
1. **Never delete internal Kafka topics:** Protect offset storage
2. **Configure offset.mismatch.strategy:** PostgreSQL connector new option (TRUST_SLOT)
3. **Backup offsets regularly:** Export via Kafka Connect REST API
4. **Monitor offset vs slot position:** Alert on divergence
5. **Test recovery procedures:** Regularly validate disaster recovery

**Detection:**
- Connector logs show offset vs LSN mismatch
- Gap in event sequence numbers
- Duplicate events after restart

**Course Phase Mapping:**
- **Phase 7 (Troubleshooting):** Diagnose and fix offset desynchronization
- **Phase 6 (Operations):** Backup and restore offsets

---

#### MODERATE: Task Failure vs Worker Failure

**What goes wrong:**
Task failure doesn't trigger rebalance (must manually restart via API), but worker failure triggers automatic rebalance. Teams treat both failures the same way.

**Why it happens:**
- Kafka Connect treats task failure as exceptional case
- Worker failure triggers cluster coordination
- Different failure domains

**Consequences:**
- Failed tasks sit idle until manually restarted
- Assuming automatic recovery when manual action required
- Delayed detection and resolution

**Prevention:**
1. **Monitor task status separately:** Alert on task FAILED status
2. **Automate task restart:** Script to restart failed tasks via REST API
3. **Understand failure types:**
   - Task failure: Manual restart required
   - Worker failure: Automatic rebalance
4. **Document runbook:** Clear procedures for each failure type

**Detection:**
- Connector shows RUNNING but no events
- Task status shows FAILED
- Worker count matches expected but tasks unassigned

**Course Phase Mapping:**
- **Phase 7 (Troubleshooting):** Differentiate task vs worker failures, restart procedures

---

## Part 2: Course Creation Pitfalls

### 2.1 Content Relevance Pitfalls

#### CRITICAL: Outdated Examples and Technologies

**What goes wrong:**
Course content becomes outdated in 18 months or less, teaching deprecated approaches, old library versions, or obsolete patterns. Students learn skills already irrelevant to 2026 job market.

**Why it happens:**
- Tech ecosystem evolves rapidly (Debezium 3.x released Dec 2025)
- Course creators don't update content post-launch
- Examples use older Kafka versions, deprecated connectors
- Copy-paste from 2022-2023 blog posts

**Consequences:**
- Students learn wrong patterns (e.g., ZooKeeper instead of KRaft)
- Examples don't run on current versions
- Frustration when official docs contradict course
- Negative reviews and refund requests
- Students unprepared for actual job requirements

**Prevention:**
1. **Version-pin with intention:** Specify exact versions, document why
2. **Update cadence:** Review and update every 6 months minimum
3. **Use current versions:** Debezium 3.4+ (as of Dec 2025), Kafka 3.x+ with KRaft
4. **Flag version-specific content:** "As of Debezium 3.4, ..."
5. **Monitor release notes:** Subscribe to Debezium blog, Kafka release announcements
6. **Test examples on launch day:** Verify all code runs on current versions

**Detection (Warning Signs):**
- Examples reference ZooKeeper (deprecated in Kafka 3.x)
- Debezium 1.x or 2.x used (3.x current as of Dec 2025)
- Confluent Schema Registry examples for Debezium 2.x+ (native support removed)
- Screenshots show old UI versions
- Comments ask "this doesn't work on version X"

**Course Phase Mapping:**
- **All phases:** Use Debezium 3.4+, Kafka with KRaft, current cloud provider UIs
- **Phase 8 (Schema Management):** Use Apicurio Registry (recommended) or show manual Confluent integration

---

#### CRITICAL: Missing Hands-On Practice

**What goes wrong:**
Course is too theoretical, explaining concepts without practical application. Students can explain CDC but can't actually configure a Debezium connector.

**Why it happens:**
- Easier to create slide-based content than labs
- Underestimating importance of muscle memory
- Assuming students will practice independently
- Lack of infrastructure for hands-on environments

**Consequences:**
- Knowledge doesn't translate to skills
- Students fail technical interviews (can't do live coding)
- Low job placement rate
- Poor course reviews: "too theoretical, not practical"
- Students can't apply knowledge to real projects

**Prevention:**
1. **80/20 rule:** 80% hands-on, 20% theory
2. **Every concept = one exercise:** Immediate practice after explanation
3. **Provide runnable environments:**
   - Docker Compose for local development
   - Terraform/CloudFormation for cloud environments
   - GitHub Codespaces for browser-based labs
4. **Progressive complexity:** Start simple, add constraints incrementally
5. **Real-world scenarios:** Not toy examples, actual use cases
6. **Debugging exercises:** Introduce intentional errors to fix

**Detection:**
- Student feedback: "too much lecture, not enough doing"
- Code-along sections < 50% of content
- No downloadable lab environments
- Exercises are optional, not mandatory

**Course Phase Mapping:**
- **Every phase:** Include hands-on lab with starter code, broken scenarios to debug
- **Phase 5 (Snapshots):** Lab: Configure incremental snapshot, compare to conventional
- **Phase 7 (Troubleshooting):** Lab: Fix replication slot growth, recover from offset desync

---

### 2.2 Curriculum Design Pitfalls

#### CRITICAL: Poor Prerequisite Management

**What goes wrong:**
Course assumes too much or too little prior knowledge, causing frustration for both beginners (lost) and experienced engineers (bored).

**Why it happens:**
- Unclear target audience definition
- No prerequisite screening
- Mixing fundamentals with advanced topics
- Assuming "data engineer" means same thing to everyone

**Consequences:**
- Beginners drop out (too hard)
- Experts request refunds (too basic)
- Pacing too fast for some, too slow for others
- Negative reviews from both ends of spectrum

**Prevention:**
1. **Define target audience precisely:**
   - "Middle+ data engineers with 2+ years experience"
   - "Familiar with SQL, Python, basic Kafka concepts"
   - "No prior CDC experience required"
2. **List explicit prerequisites:**
   - SQL: JOINs, indexes, transactions
   - Kafka: topics, partitions, consumer groups (conceptually)
   - Docker: run containers, docker-compose
   - Python or Java: basic scripting
   - Cloud: one provider (AWS/GCP/Azure) at 101 level
3. **Provide prerequisite assessment:** Quiz before enrollment
4. **Include prerequisite refresher:** Optional "review" module
5. **Separate beginner and advanced tracks:** Different courses for different levels

**Detection:**
- Reviews say "too hard" and "too easy" simultaneously
- High dropout rate in early modules
- Questions about basic Kafka concepts in Debezium sections
- Complaints about repetitive content

**Course Phase Mapping:**
- **Prerequisites Module (Phase 0):** Kafka 101 refresher (15 min), Docker basics (10 min)
- **Each phase:** "You should know X before starting" callout

---

#### MODERATE: Poor Progression and Pacing

**What goes wrong:**
Course jumps from basic to advanced too quickly, or spends too long on simple topics. No logical build-up of complexity.

**Why it happens:**
- Creator already expert, doesn't remember learning curve
- Copying outline from other courses without adaptation
- Adding topics without restructuring existing flow

**Consequences:**
- Students lost at critical transition points
- Frustration and dropout
- Core concepts glossed over, edge cases over-explained
- Completion rate < 30%

**Prevention:**
1. **Crawl, Walk, Run progression:**
   - Crawl: Single table, local Docker, happy path
   - Walk: Multiple tables, cloud deployment, error handling
   - Run: Production scenarios, multi-region, complex transformations
2. **Spiral learning:** Revisit concepts with increasing depth
3. **Capstone project:** Integrate all learnings in final phase
4. **Beta test with target audience:** Watch learners go through content
5. **Measure time per section:** Ensure realistic pacing (15-20 min chunks)

**Detection:**
- Analytics show dropout at specific module
- Comments: "module X was too sudden"
- Completion rate drops sharply at certain phase
- Students skip ahead then get stuck

**Course Phase Mapping:**
**Progression Strategy:**
1. **Phase 1 (Aurora/MySQL):** Single table, local Docker, INSERT events only
2. **Phase 2 (PostgreSQL):** Multiple tables, UPDATE/DELETE, replication slots
3. **Phase 3 (Cloud - GCP):** Cloud SQL, Pub/Sub, IAM complexity
4. **Phase 4 (Production):** Distributed mode, monitoring, backpressure
5. **Phase 5-8:** Specialized topics (snapshots, operations, troubleshooting, schema)
6. **Phase 9-11:** Advanced (transformations, consumers, architectures)
7. **Phase 12 (Capstone):** Build end-to-end multi-source CDC pipeline

---

#### MODERATE: Feature Creep (Too Comprehensive)

**What goes wrong:**
Course tries to cover everything about Debezium, becoming 40+ hours long, overwhelming learners, and delaying launch.

**Why it happens:**
- Fear of leaving something out
- "Comprehensive" marketed as value
- No clear scope boundaries
- Perfectionism

**Consequences:**
- Course never launches (analysis paralysis)
- 40 hour course has low completion rate
- Maintenance burden too high (must update everything)
- Learners unsure what's essential vs optional

**Prevention:**
1. **Define MVP scope:** What 80% of users need
2. **Mark advanced sections clearly:** "Optional: Advanced Topic"
3. **Modular design:** Core path + optional branches
4. **Target 10-15 hours for core content:** Beyond this, completion drops
5. **Plan follow-up courses:** "Advanced Debezium" separate from "Debezium Fundamentals"
6. **Defer niche topics:** MongoDB, Cassandra connectors for specialized course

**Detection:**
- Course outline exceeds 20 modules
- Estimated time > 20 hours
- Struggling to decide what to cut
- Multiple "and also you should know..." sections

**Course Phase Mapping:**
**Core Path (12-15 hours):**
- Phases 1-8: Essential production Debezium
**Optional Extensions (5-10 hours):**
- Phase 9 (SMTs): Optional for simple pipelines
- Phase 10 (Alternative Architectures): Optional depth
- Phase 11 (Consumer Patterns): Optional, depends on tech stack

---

### 2.3 Technical Quality Pitfalls

#### MODERATE: Ignoring Technical Issues

**What goes wrong:**
Inconsistent audio levels, poor lighting, confusing slide design, or technical glitches interrupt learning flow and frustrate students.

**Why it happens:**
- Prioritizing content over production quality
- Recording in suboptimal environment
- Not testing playback experience
- Using low-quality screen recording tools

**Consequences:**
- Students distracted by technical issues
- Negative reviews focus on production quality
- Content quality overlooked due to poor delivery
- Professional credibility damaged

**Prevention:**
1. **Audio quality first priority:**
   - Use decent microphone (USB condenser minimum)
   - Consistent volume levels (-14 to -16 LUFS)
   - Remove background noise (RTX Voice, Krisp)
2. **Screen recording best practices:**
   - High resolution (1920x1080 minimum)
   - Zoom in on relevant UI areas
   - Highlight cursor, clicks
   - 30 FPS minimum
3. **Slide design:**
   - High contrast (dark background, light text or vice versa)
   - Large fonts (24pt minimum for code, 36pt for headings)
   - One concept per slide
   - Code syntax highlighting
4. **Test on multiple devices:** Laptop, phone, tablet
5. **Peer review:** Have someone watch before publishing

**Detection:**
- Audio levels fluctuate wildly
- Hard to read text on screen
- Cursor invisible in recordings
- Student reviews mention "hard to hear" or "can't see code"

**Course Phase Mapping:**
- **All phases:** Consistent production quality standards
- **Code walkthroughs:** Zoom to 150%, highlight cursor, slow down

---

#### LOW: Lack of Interactivity

**What goes wrong:**
Passive video watching without quizzes, exercises, or interaction leads to low retention and boredom.

**Why it happens:**
- Video-only format easier to produce
- Underestimating value of active learning
- Platform limitations (basic video hosting)

**Consequences:**
- Knowledge retention < 20%
- Students zone out during long videos
- Can't self-assess understanding
- Low engagement metrics

**Prevention:**
1. **Knowledge checks every 10-15 minutes:** 3-5 question quizzes
2. **Interactive elements:**
   - Code challenges (submit code, auto-graded)
   - "Pause and predict" prompts
   - Discussion questions
   - Debugging challenges
3. **Feedback loops:** Students know if they understood before proceeding
4. **Leaderboards/gamification:** Optional for competitive learners
5. **Platform choice:** Use LMS with interactive features (Teachable, Thinkific, custom)

**Detection:**
- Videos > 20 minutes with no breaks
- No quizzes or assessments
- Linear video-only content
- Students ask basic questions covered in previous modules (didn't retain)

**Course Phase Mapping:**
- **Every phase:** 2-3 knowledge check quizzes
- **Every hands-on lab:** Auto-graded code submission or manual checklist
- **End of each phase:** Cumulative quiz (10 questions)

---

### 2.4 Validation and Launch Pitfalls

#### CRITICAL: Creating Without Validation

**What goes wrong:**
Building entire course before validating demand, resulting in product nobody wants or pays for.

**Why it happens:**
- Falling in love with idea before customer validation
- Assumption that "if I build it, they will come"
- Fear of sharing idea before perfection

**Consequences:**
- 6 months of work, zero sales
- Misaligned with market needs
- Wasted effort on wrong topics
- Emotional and financial loss

**Prevention:**
1. **Validate before building:**
   - Survey target audience (what problems do you face with CDC?)
   - Pre-sell course (landing page, take deposits)
   - MVP: 3 modules, then validate
2. **Build in public:** Share progress, get feedback
3. **Beta cohort:** First 10-20 students at discount for feedback
4. **Iterate based on feedback:** Don't launch and forget
5. **Market research:**
   - Existing Debezium courses? What do they lack?
   - Job postings mentioning Debezium?
   - Community pain points (GitHub issues, Stack Overflow)

**Detection:**
- Building alone without audience feedback
- No pre-launch interest (email signups, survey responses)
- Launching to silence (no sales week 1)

**Course Phase Mapping:**
- **Pre-build:** Survey 50+ data engineers on CDC pain points
- **MVP (Phases 1-3):** Launch to beta cohort, iterate based on feedback
- **Full launch (Phases 4-12):** After validation and iteration

---

#### MODERATE: Waiting for Perfection

**What goes wrong:**
Course never launches because "it's not ready yet," indefinitely polishing without shipping.

**Why it happens:**
- Perfectionism
- Fear of criticism
- Comparing to established courses (unfair comparison)
- Imposter syndrome

**Consequences:**
- Opportunity cost (could be earning and learning from real students)
- Market changes while you perfect (competitors launch first)
- Overthinking leads to feature creep
- Burnout without reward

**Prevention:**
1. **Set launch deadline:** Non-negotiable date
2. **MVP mindset:** What's minimum viable to deliver value?
3. **"Done is better than perfect":** 80% quality, launch, iterate
4. **Commit publicly:** Announce launch date, accountability
5. **Version 1.0 mentality:** Plan for v1.1, v1.2 updates
6. **Early access program:** Launch "beta" to friendly audience first

**Detection:**
- Course 90% complete for 3+ months
- Constantly finding "one more thing" to add
- No launch date set
- Paralyzed by "what if X isn't good enough"

**Course Phase Mapping:**
- **V1.0 Scope:** Phases 1-8 (core production Debezium)
- **V1.1 Update:** Add Phases 9-10 based on student requests
- **V1.2 Update:** Add Phase 11-12, update for Debezium 3.5+

---

### 2.5 Debezium-Specific Course Pitfalls

#### MODERATE: Ignoring Cloud-Specific Gotchas

**What goes wrong:**
Course focuses on local Docker setup, glossing over GCP Cloud SQL, AWS RDS, Azure-specific issues that students encounter in real jobs.

**Why it happens:**
- Local Docker easier to set up and demo
- Cloud environments cost money
- Assuming students can "figure out" cloud differences
- Lack of multi-cloud expertise

**Consequences:**
- Students hit RDS privilege limitations in production (FLUSH TABLES WITH READ LOCK)
- Cloud SQL logical decoding not enabled
- Workload Identity misconfigurations on GKE
- Course not applicable to real-world scenarios

**Prevention:**
1. **Dedicated cloud integration modules:**
   - Phase 1: Aurora/RDS MySQL specifics
   - Phase 2: Cloud SQL PostgreSQL specifics
   - Phase 3: GCP Pub/Sub integration
2. **Cloud-specific labs:** Actual cloud deployments, not just Docker
3. **Provider credits:** AWS/GCP credits for students
4. **Cover at least 2 cloud providers:** AWS + GCP minimum
5. **Document cloud differences:** Comparison table (Aurora vs Cloud SQL vs on-prem)

**Detection:**
- Course only shows Docker Desktop deployments
- No mention of RDS, Cloud SQL, Azure Database
- Students ask "how do I do this on AWS?" in every module

**Course Phase Mapping:**
- **Phase 1:** Aurora DB specific issues (binlog retention, RDS privileges)
- **Phase 2:** Cloud SQL PostgreSQL (logical decoding, replication slots)
- **Phase 3:** GCP integration deep dive (Pub/Sub, Workload Identity, Dataflow)

---

#### MODERATE: Snapshot Strategy Oversimplified

**What goes wrong:**
Course shows only default snapshot mode, ignoring incremental snapshots, large database scenarios, and production snapshot strategies.

**Why it happens:**
- Default mode "just works" for small demos
- Incremental snapshots more complex to explain
- Demo databases have 100 rows, not 100M rows

**Consequences:**
- Students try conventional snapshot on TB database, wait days
- Production databases locked during snapshot
- Snapshot failures require full restart
- No understanding of snapshot mode options

**Prevention:**
1. **Dedicated snapshot module (Phase 5):**
   - Compare all snapshot modes (initial, always, never, schema_only, when_needed)
   - Demonstrate incremental snapshot feature
   - Show large database strategy (batching, off-peak scheduling)
2. **Production scenarios:**
   - "Your DB has 500M rows. What do you do?"
   - Snapshot failure recovery
   - Binlog position loss scenarios
3. **Hands-on with large dataset:** Simulate 10M+ rows, demonstrate performance differences

**Detection:**
- Course only mentions `snapshot.mode=initial`
- No discussion of incremental snapshots
- Demo databases have < 1000 rows
- Students ask "how to handle large databases?"

**Course Phase Mapping:**
- **Phase 5 (Snapshots):** Comprehensive coverage - all modes, incremental snapshots, production strategies

---

#### MODERATE: Missing Real-World Troubleshooting

**What goes wrong:**
Course shows happy path only, no error handling, debugging, or recovery scenarios. Students helpless when things break.

**Why it happens:**
- Happy path easier to demo
- Troubleshooting messy and unpredictable
- Time pressure to cover features, not failures
- Difficulty simulating real production issues

**Consequences:**
- Students can set up Debezium but can't fix issues
- Production incidents require external help
- Frustration when encountering common problems
- Job performance suffers (can't debug independently)

**Prevention:**
1. **Dedicated troubleshooting module (Phase 7):**
   - Replication slot growth diagnosis and fix
   - Offset desynchronization recovery
   - Connector failure triage (task vs worker)
   - Large message size errors
2. **Chaos engineering labs:** Introduce failures intentionally
   - Kill connector mid-snapshot
   - Fill disk to trigger WAL issues
   - Delete internal Kafka topic (then restore)
3. **Debugging exercises:** Provide broken configurations to fix
4. **Real-world scenarios:** Based on Stack Overflow, GitHub issues

**Detection:**
- No module dedicated to troubleshooting
- Labs only show successful outcomes
- No exercises with intentional errors
- Student questions dominated by "what do I do when X fails?"

**Course Phase Mapping:**
- **Phase 7 (Troubleshooting):** Entire module dedicated to common failures and recovery
- **Every phase:** Include "Common Mistakes" section with debugging

---

## Part 3: Prevention Strategies for Course Design

### 3.1 Content Maintenance Strategy

**Problem:** Content becomes outdated in 18 months.

**Strategy:**
1. **Quarterly review schedule:** Check Debezium release notes every 3 months
2. **Version pinning with documentation:**
   ```
   This course uses:
   - Debezium 3.4.0 (released Dec 2025)
   - Kafka 3.7 with KRaft (ZooKeeper removed)
   - PostgreSQL 16, MySQL 8.0
   Last updated: 2026-01-31
   ```
3. **Modular content structure:** Easy to swap outdated modules
4. **Student feedback loop:** "Report outdated content" button
5. **Changelog for course:** Document what changed in each update
6. **Automated testing:** CI/CD runs all lab code examples weekly

---

### 3.2 Hands-On Lab Design Principles

**Problem:** Too theoretical, not enough practice.

**Design Principles:**
1. **Progressive complexity:**
   - Lab 1: Single table, INSERT only, local Docker
   - Lab 2: Multiple tables, UPDATE/DELETE, local Docker
   - Lab 3: Cloud deployment (Cloud SQL), handle errors
   - Lab 4: Production setup (monitoring, alerts, recovery)

2. **Every lab includes:**
   - **Setup script:** Automated environment provisioning
   - **Starter code:** Pre-configured with TODOs
   - **Success criteria:** Clear checklist of outcomes
   - **Debugging challenge:** Intentional error to fix
   - **Solution walkthrough:** Video of instructor solving it

3. **Lab environment options:**
   - **Local:** Docker Compose (free, offline capable)
   - **Cloud:** Terraform templates (realistic, costs money)
   - **Hybrid:** Codespaces (browser-based, free tier)

4. **Validation mechanisms:**
   - **Automated tests:** Students run tests to verify completion
   - **Manual checklist:** "You should see X in Kafka topic Y"
   - **Peer review:** Optional community lab review

---

### 3.3 Prerequisite Management Strategy

**Problem:** Unclear prerequisites cause frustration.

**Strategy:**
1. **Explicit prerequisite documentation:**
   ```
   Before starting this course, you should:
   - [ ] Write SQL queries (SELECT, JOIN, WHERE)
   - [ ] Understand database transactions (ACID properties)
   - [ ] Know Kafka basics (topics, partitions, consumers)
   - [ ] Run Docker containers (docker run, docker-compose up)
   - [ ] Use command line (bash, navigation, environment variables)
   - [ ] Optionally: Basic Python or Java for SMT examples
   ```

2. **Prerequisite assessment quiz (10 questions):**
   - SQL: "What does this JOIN return?"
   - Kafka: "If a topic has 3 partitions, how many consumers in a group can read concurrently?"
   - Docker: "What command starts containers from docker-compose.yml?"
   - Score < 70%: Recommend prerequisite courses first

3. **Prerequisite refresher module (optional, 30 min):**
   - Kafka 101: Topics, partitions, consumer groups
   - Docker basics: Containers, images, docker-compose
   - SQL refresher: Transactions, indexes, replication

4. **"Level up" recommendations:**
   - Beginner track: Include more hand-holding
   - Advanced track: Skip basics, jump to production scenarios

---

### 3.4 Validation Before Building

**Problem:** Building without validating demand.

**Validation Checklist:**
- [ ] Surveyed 50+ target audience members on pain points
- [ ] Analyzed top 5 Debezium Stack Overflow questions (what do people struggle with?)
- [ ] Reviewed GitHub issues for common problems
- [ ] Identified gap in existing courses (what's missing?)
- [ ] Pre-sold to 10+ students or collected 100+ email signups
- [ ] Beta tested MVP (first 3 modules) with real students
- [ ] Gathered feedback and iterated based on beta results

**Market Research Questions:**
1. What CDC/Debezium problems do you face today? (open-ended)
2. Have you taken a Debezium course before? What was missing?
3. What database sources do you need to integrate? (Aurora, Cloud SQL, on-prem PostgreSQL, etc.)
4. What's your biggest blocker to adopting Debezium? (knowledge gap, infrastructure, cost, etc.)
5. Would you pay $X for a comprehensive Debezium course? (pricing validation)

---

### 3.5 Launch and Iteration Strategy

**Problem:** Waiting for perfection prevents launch.

**Launch Strategy:**
1. **MVP Definition (Week 0-12):**
   - Phases 1-4: Core Debezium setup (Aurora, PostgreSQL, Cloud, Production)
   - Total: 6-8 hours of content
   - Goal: Students can set up production CDC pipeline

2. **Beta Launch (Week 13):**
   - 20 students at 50% discount
   - Live Q&A sessions weekly
   - Collect detailed feedback
   - Iterate rapidly based on input

3. **V1.0 Public Launch (Week 16):**
   - Add Phases 5-8 based on beta feedback
   - Total: 10-12 hours
   - Full price, marketing push
   - Goal: 100 students in first month

4. **V1.1 Update (Month 4):**
   - Add advanced modules (Phases 9-11)
   - Update for latest Debezium version
   - Address common student questions as new content

5. **Ongoing Updates (Quarterly):**
   - Debezium version updates
   - New cloud provider examples
   - Student-requested deep dives

**Metrics to Track:**
- Enrollment rate
- Completion rate (overall and per module)
- Time to complete
- Student satisfaction (NPS score)
- Employment outcomes (did course help get job/promotion?)

---

## Confidence Assessment

| Domain | Confidence | Reason |
|--------|------------|--------|
| PostgreSQL Pitfalls | HIGH | Multiple authoritative sources (official docs, Red Hat documentation, recent 2025-2026 content) |
| Aurora/RDS Pitfalls | MEDIUM-HIGH | Good sources but some dated 2020-2022, verified with 2026 searches |
| GCP Integration | MEDIUM | Found integration guides but fewer problem reports (possibly less common or newer) |
| Kafka Connect Pitfalls | HIGH | Official Confluent docs, common mistakes documented extensively |
| Schema Evolution | MEDIUM-HIGH | Well-documented issues, some recent GitHub issues from 2025 |
| Snapshot Issues | HIGH | Official Debezium blog, production deployment guides |
| Monitoring | HIGH | Official documentation, community examples |
| Course Creation | MEDIUM-HIGH | General course creation pitfalls well-documented, Debezium-specific extrapolated from production pitfalls |

---

## Sources

### Debezium Production Sources

**General Debezium Pitfalls:**
- [Debezium for CDC in Production: Pain Points and Limitations](https://estuary.dev/blog/debezium-cdc-pain-points/)
- [Debezium FAQ](https://debezium.io/documentation/faq/)
- [Running CDC in Production: Fixing Debezium & MongoDB Pitfalls](https://aabir-hassan.medium.com/cdc-in-production-breaking-bad-and-fixing-it-bdf49317cafa)
- [Unlocking the Power of Debezium (PayU Engineering)](https://medium.com/payu-engineering/unlocking-the-power-of-debezium-69ce9170f101)

**PostgreSQL Replication Slot Issues:**
- [Debezium PostgreSQL connector fails to start replication stream due to stale active replication slot PID](https://access.redhat.com/solutions/7134051)
- [PostgreSQL replication slots grow indefinitely](https://issues.redhat.com/browse/DBZ-926)
- [Handle PostgreSQL node replacements when using Debezium](https://aiven.io/docs/products/kafka/kafka-connect/howto/debezium-source-connector-pg-node-replacement)
- [Postgres replication lag using debezium connector](https://medium.com/@pawanpg0963/postgres-replication-lag-using-debezium-connector-4ba50e330cd6)

**Aurora/RDS Issues:**
- [Lessons Learned from Running Debezium with PostgreSQL on Amazon RDS](https://debezium.io/blog/2020/02/25/lessons-learned-running-debezium-with-postgresql-on-rds/)
- [Debezium RDS tag](https://debezium.io/tag/rds/)

**GCP Integration:**
- [Change Data Capture with Debezium Server on GKE from CloudSQL for PostgreSQL to Pub/Sub](https://medium.com/google-cloud/change-data-capture-with-debezium-server-on-gke-from-cloudsql-for-postgresql-to-pub-sub-d1c0b92baa98)
- [Postgres CDC Solution with Debezium & Google Pub/Sub](https://infinitelambda.com/postgres-cdc-debezium-google-pubsub/)
- [Debezium Server to Cloud PubSub: A Kafka-less way](https://medium.com/nerd-for-tech/debezium-server-to-cloud-pubsub-a-kafka-less-way-to-stream-changes-from-databases-1d6edc97da40)

**Kafka Connect Configuration:**
- [Checklist to Troubleshoot Kafka Connect Issues Using Debezium](https://medium.com/@a.tambakouzadeh/checklist-to-troubleshoot-kafka-connect-issues-using-debezium-platform-for-cdc-and-mysql-data-b4d517d152a4)
- [Common mistakes made when configuring multiple Kafka Connect workers](https://rmoff.net/2019/11/22/common-mistakes-made-when-configuring-multiple-kafka-connect-workers/)
- [Kafka Connect Clusters: Structure, Scaling, and Task Management](https://axual.com/blog/kafka-connect-clusters-structure-scaling-and-task-management)

**Schema Evolution:**
- [KSQL table is not able to support in-place schema update for Debezium's Schema evolution](https://github.com/confluentinc/ksql/issues/8148)
- [Schema Evolution in Change Data Capture Pipelines](https://www.decodable.co/blog/schema-evolution-in-change-data-capture-pipelines)
- [Making Debezium 2.x Support Confluent Schema Registry](https://dev.to/lazypro/making-debezium-2x-support-confluent-schema-registry-3mf2)

**Snapshots:**
- [Incremental Snapshots in Debezium](https://debezium.io/blog/2021/10/07/incremental-snapshots/)
- [Debezium Production Deployment Preparation](https://suchit-g.medium.com/debezium-production-deployment-preparation-b12c5b9de767)

**Monitoring:**
- [Monitoring Debezium Documentation](https://debezium.io/documentation/reference/stable/operations/monitoring.html)
- [Monitor Debezium MySQL Connector With Prometheus And Grafana](https://thedataguy.in/monitor-debezium-mysql-connector-with-prometheus-and-grafana/)
- [Monitoring Debezium (SPOUD blog)](https://spoud-io.medium.com/monitoring-debezium-91a24be8a3d4)

**Offset Management and Recovery:**
- [Handling Database Failures and Recoveries with Debezium](https://binaryscripts.com/debezium/2025/04/27/handling-database-failures-and-recoveries-with-debezium-ensuring-reliable-cdc.html)
- [Introduce flexible recovery from LSN desynchronisation](https://github.com/debezium/dbz/issues/1146)

**Transformations (SMT):**
- [Debezium with Single Message Transformation (SMT)](https://medium.com/trendyol-tech/debezium-with-simple-message-transformation-smt-4f5a80c85358)
- [Content-based routing - Debezium Documentation](https://debezium.io/documentation/reference/stable/transformations/content-based-routing.html)

**CDC Ordering and Guarantees:**
- [Configuring Change Data Capture (CDC) Mode - DataHub](https://docs.datahub.com/docs/how/configure-cdc)
- [A Gentle Introduction to Event-driven Change Data Capture](https://medium.com/event-driven-utopia/a-gentle-introduction-to-event-driven-change-data-capture-683297625f9b)

### Course Creation Sources

**Course Creation Mistakes:**
- [Course Creation Pitfalls: Avoid the 5 Most Common Errors](https://www.amyporterfield.com/2023/08/601/)
- [Learn from My Mistakes: 7 Digital Course Pitfalls to Skip](https://blog.hubspot.com/marketing/digital-course-pitfalls)
- [The 7 Most Common Mistakes New Course Creators Make](https://medium.com/swlh/the-7-most-common-mistakes-new-course-creators-make-and-how-to-avoid-them-0debd19d4226)
- [Top 8 Common Mistakes in Online Course Creation](https://raccoongang.com/blog/common-mistakes-online-course-creation/)
- [The Most Common Mistakes in Online Course Creation](https://bluecarrot.io/blog/the-most-common-mistakes-in-online-course-creation-and-how-to-dodge-them/)

**Data Engineering Course Design:**
- [Top Data Engineering Mistakes and How to Prevent Them](https://dataengineeracademy.com/blog/top-data-engineering-mistakes-and-how-to-prevent-them/)
- [Learn Data Engineering From Scratch in 2026](https://www.datacamp.com/blog/how-to-learn-data-engineering)

**Outdated Content Problem:**
- [10 Common Pitfalls to Avoid When Purchasing Online Courses](https://dev.to/digitalpollution/10-common-pitfalls-to-avoid-when-purchasing-online-courses-36b7)
- [Don't Waste Your Time on These Technologies in 2026](https://medium.com/the-software-journal/dont-waste-your-time-on-these-technologies-in-2026-and-what-to-learn-instead-812c79646050)

**Learning and Development:**
- [Learning and Development Mistakes to Avoid in 2026](https://www.airmeet.com/hub/blog/learning-and-development-mistakes-to-avoid-in-2026-dos-donts-checklist/)
