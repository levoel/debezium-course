---
phase: 15-production-operations
plan: 01
subsystem: monitoring
tags: [jmx, prometheus, grafana, cloudwatch, aurora, mysql, binlog, lag-monitoring]

# Dependency graph
requires:
  - phase: 08-module-8/03-binlog-retention-heartbeat
    provides: Heartbeat events concept and configuration
  - phase: 08-module-8/08-enhanced-binlog-architecture
    provides: Aurora Enhanced Binlog metrics understanding
  - phase: 12-mysql-deployment
    provides: MySQL connector deployment infrastructure
provides:
  - Comprehensive binlog lag monitoring lesson (1127 lines)
  - MySQL-specific Grafana dashboard (13 panels across 4 rows)
  - JMX metrics deep dive (MilliSecondsBehindSource, SecondsBehindMaster, BinlogPosition, IsGtidModeEnabled, Connected, QueueRemainingCapacity, SecondsSinceLastEvent)
  - Aurora CloudWatch metrics integration (AuroraBinlogReplicaLag, Enhanced Binlog metrics)
  - Prometheus alert rules with proper thresholds and grace periods
  - Three-tier monitoring architecture pattern
affects: [15-production-operations, alerting-strategies, disaster-recovery, performance-tuning]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Three-tier monitoring (JMX + CloudWatch + Operational signals)"
    - "MilliSecondsBehindSource as primary lag metric (preferred over SecondsBehindMaster)"
    - "Grace periods in alerts to avoid false positives during failover (2 minutes for connection, 5 minutes for lag)"
    - "Heartbeat interval <60s with alert threshold 60s (6x tolerance)"

key-files:
  created:
    - src/content/course/08-module-8/10-binlog-lag-monitoring.mdx
    - labs/monitoring/grafana/dashboards/debezium-mysql.json
  modified: []

key-decisions:
  - "MilliSecondsBehindSource positioned as preferred lag metric over SecondsBehindMaster (millisecond precision, more reliable calculation)"
  - "SecondsBehindMaster=-1 during failover documented as normal behavior (not error condition)"
  - "Three-tier monitoring required for production (JMX for connector health, CloudWatch for infrastructure, operational signals for application)"
  - "Alert grace periods aligned with Aurora failover timing (2-minute threshold for connection alerts)"
  - "Heartbeat interval recommendation: 10s with 60s alert threshold (6x tolerance for false positive prevention)"

patterns-established:
  - "JMX metrics via HTTP endpoint (port 9404) for Prometheus scraping"
  - "Grafana dashboard structure: 4 rows (Connection Health, Lag Metrics, Position Tracking, Snapshot Status)"
  - "PromQL queries for lag calculation: debezium_metrics_MilliSecondsBehindSource / 1000 (convert to seconds)"
  - "Queue utilization formula: 100 * (1 - (QueueRemainingCapacity / QueueTotalCapacity))"
  - "CloudWatch integration via prometheus cloudwatch_exporter for unified observability"

# Metrics
duration: 8min
completed: 2026-02-01
---

# Phase 15 Plan 01: Binlog Lag Monitoring Summary

**Comprehensive MySQL CDC monitoring with JMX metrics, CloudWatch integration, Prometheus alerting, and production-ready Grafana dashboards**

## Performance

- **Duration:** 8 min 28 sec
- **Started:** 2026-02-01T12:43:28Z
- **Completed:** 2026-02-01T12:51:56Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created comprehensive 1127-line lesson covering three-tier monitoring architecture (JMX + CloudWatch + Operational)
- Built MySQL-specific Grafana dashboard with 13 panels for real-time lag, connection health, position tracking, and snapshot status
- Documented all critical JMX metrics with interpretation guidance (MilliSecondsBehindSource, SecondsBehindMaster, Connected, IsGtidModeEnabled, QueueRemainingCapacity, SecondsSinceLastEvent, BinlogPosition)
- Integrated Aurora CloudWatch metrics (AuroraBinlogReplicaLag, Enhanced Binlog metrics) for infrastructure-level monitoring
- Provided copy-paste Prometheus alert rules with proper thresholds and grace periods for failover scenarios
- Included hands-on exercises for Prometheus alerts, JMX curl queries, and CloudWatch alarm configuration

## Task Commits

Each task was committed atomically:

1. **Task 1: Create binlog lag monitoring lesson** - `0eeb68c` (feat)
2. **Task 2: Create MySQL-specific Grafana dashboard** - `05b8f45` (feat)

_Note: Task 1 was auto-committed by linter during HTML entity escape fixes (additional fix commit: `2828bc3`)_

## Files Created/Modified

- `src/content/course/08-module-8/10-binlog-lag-monitoring.mdx` (1127 lines) - Complete binlog lag monitoring lesson with JMX metrics deep dive, Aurora CloudWatch integration, Prometheus alerting, Grafana dashboard configuration, common pitfalls, and hands-on exercises
- `labs/monitoring/grafana/dashboards/debezium-mysql.json` (1250 lines) - MySQL-specific Grafana dashboard with connection health, lag metrics, position tracking, and snapshot status panels using Prometheus datasource

## Decisions Made

**1. MilliSecondsBehindSource as primary lag metric**
- Rationale: Millisecond precision (vs seconds in SecondsBehindMaster), more reliable Debezium-calculated value, better for low-latency requirements
- SecondsBehindMaster positioned as secondary metric for cross-checking and MySQL replica comparison

**2. Three-tier monitoring architecture**
- Rationale: Single-layer monitoring (JMX only) misses infrastructure-level issues (Aurora replication lag, Enhanced Binlog capacity)
- Tier 1 (JMX) = connector health, Tier 2 (CloudWatch) = infrastructure health, Tier 3 (Operational) = application health

**3. Alert grace periods aligned with Aurora failover timing**
- Connection alert: 2-minute threshold (Aurora failover typically 30-90 seconds)
- Lag alert: 5-minute threshold (avoids false positives from temporary spikes)
- Rationale: Prevent alert fatigue during planned failovers while catching real issues

**4. SecondsBehindMaster=-1 documented as normal during failover**
- Rationale: Common source of confusion and false alarms
- Explicit warning in lesson not to create alerts on this condition
- Grace period required if alerting on this metric

**5. Heartbeat interval <60s recommendation**
- Rationale: If heartbeat.interval.ms=60000 (1 minute), SecondsSinceLastEvent can legitimately be >60s even on healthy connector
- Recommended: 10s interval with 60s alert threshold (6x tolerance)
- Prevents false positives while maintaining reliable idle detection

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] MDX parsing errors from unescaped HTML entities**
- **Found during:** Task 1 (lesson creation)
- **Issue:** MDX parser interpreted `<30`, `<1`, `<10s`, `<50%`, `>60s`, `>80s` as HTML tags, causing build failures with "Unexpected character before name" errors
- **Fix:** Replaced comparison operators with words: "менее 30 секунд", "less than 10s", "more than 60s" to avoid MDX HTML interpretation
- **Files modified:** src/content/course/08-module-8/10-binlog-lag-monitoring.mdx (5 instances)
- **Verification:** Build passes successfully (`npm run build` completes with "Complete!" message)
- **Committed in:** `0eeb68c` (Task 1 commit), additional fix in `2828bc3`

---

**Total deviations:** 1 auto-fixed (1 build blocker)
**Impact on plan:** Build-blocking fix necessary for lesson compilation. No scope creep - purely technical correction to avoid MDX parsing errors.

## Issues Encountered

**Issue 1: PromQL language not recognized by Shiki syntax highlighter**
- **Symptoms:** Build warnings "[Shiki] The language 'promql' doesn't exist, falling back to 'plaintext'"
- **Impact:** Non-blocking (code blocks still render, just without syntax highlighting for PromQL)
- **Resolution:** Accepted as acceptable trade-off - PromQL queries still readable in plaintext format
- **Future consideration:** Could add Shiki PromQL grammar if syntax highlighting becomes priority

**Issue 2: Multiple rounds of MDX HTML entity fixing**
- **Symptoms:** Fixed `&lt;` and `&gt;` entities, but still had parsing errors from bare `<` and `>` operators
- **Resolution:** Replaced all comparison operators with English words ("less than", "more than") to completely avoid MDX HTML interpretation
- **Lesson learned:** MDX is very strict about HTML-like syntax - avoid `<` and `>` outside of code blocks in prose

## User Setup Required

None - no external service configuration required.

The lesson references existing monitoring infrastructure (`labs/monitoring/prometheus.yml`, Grafana) which was set up in previous phases. Learners follow hands-on exercises to configure their own Prometheus alerts and CloudWatch alarms.

## Next Phase Readiness

**Ready for next phase:**
- Learners can now monitor MySQL CDC health in production with full visibility
- Monitoring foundation established for alerting strategies (escalation policies, on-call runbooks)
- Metrics and dashboards ready for performance tuning exercises (correlation between lag and throughput)
- CloudWatch integration pattern ready for disaster recovery monitoring scenarios

**No blockers or concerns.**

**Recommended next steps:**
- Phase 15-02: Alerting strategies (escalation policies, PagerDuty/Slack integration, on-call runbooks)
- Phase 15-03: Performance tuning (connector parallelism, Kafka partition sizing, batch configuration)
- Phase 15-04: Disaster recovery (backup/restore procedures, cross-region failover, resnapshot optimization)

---
*Phase: 15-production-operations*
*Completed: 2026-02-01*
