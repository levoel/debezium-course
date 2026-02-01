---
phase: 10-module-6-cloud-native-gcp
plan: 02
subsystem: cloud-security
tags: [GCP, IAM, Workload Identity, GKE, Dataflow, BigQuery, Pub/Sub, Secret Manager, Cloud Run]

# Dependency graph
requires:
  - phase: 10-module-6-cloud-native-gcp
    provides: Debezium Server to Pub/Sub integration patterns
provides:
  - Secure authentication patterns for GCP CDC components using Workload Identity
  - Dataflow managed template deployment for BigQuery replication
  - Two-table BigQuery pattern (changelog + replica) for CDC
  - Exactly-once vs at-least-once semantics guidance
  - Schema evolution handling in BigQuery
affects: [11-module-7-capstone, cloud-native-deployments]

# Tech tracking
tech-stack:
  added: [Workload Identity, Secret Manager CSI Driver, Dataflow Templates, BigQuery Storage Write API]
  patterns: [K8s SA to GCP SA binding, Secret Manager integration, Two-table CDC pattern, MERGE-based replication]

key-files:
  created:
    - src/content/course/06-module-6/03-iam-workload-identity.mdx
    - src/content/course/06-module-6/04-dataflow-bigquery.mdx
  modified: []

key-decisions:
  - "Workload Identity over service account key files for GKE authentication"
  - "Secret Manager for database credentials instead of environment variables"
  - "At-least-once Dataflow mode recommended for cost optimization (MERGE handles duplicates)"
  - "Two-table pattern: changelog (staging) for full history + replica for current state"
  - "updateFrequencySecs=60 as default MERGE frequency for near-real-time consistency"
  - "Managed template preferred over custom Dataflow pipeline for standard CDC use cases"

patterns-established:
  - "iam.gke.io/gcp-service-account annotation for Workload Identity binding"
  - "roles/pubsub.publisher, roles/bigquery.dataEditor for least privilege IAM"
  - "Secret Manager CSI Driver for mounting secrets in Kubernetes pods"
  - "Dataflow flex-template run for CDC to BigQuery replication"
  - "BigQuery _metadata_timestamp, _metadata_deleted columns for CDC tracking"

# Metrics
duration: 5min
completed: 2026-02-01
---

# Phase 10 Plan 02: GCP Security & BigQuery Replication Summary

**Workload Identity authentication for Debezium Server on GKE and Dataflow CDC replication to BigQuery with two-table pattern (changelog + replica)**

## Performance

- **Duration:** 4 min 49 sec
- **Started:** 2026-02-01T07:51:24Z
- **Completed:** 2026-02-01T07:56:13Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Comprehensive IAM and Workload Identity lesson covering secure GCP authentication patterns
- Complete Dataflow template deployment guide for Pub/Sub to BigQuery CDC replication
- Two-table BigQuery pattern documentation (staging changelog + current state replica)
- Exactly-once vs at-least-once semantics with cost optimization guidance
- Schema evolution handling and monitoring best practices

## Task Commits

Each task was committed atomically:

1. **Task 1: Create IAM and Workload Identity lesson** - `dc41a05` (feat)
2. **Task 2: Create Dataflow to BigQuery lesson** - `ac20352` (feat)

**Plan metadata:** (to be committed with STATE.md update)

## Files Created/Modified

- `src/content/course/06-module-6/03-iam-workload-identity.mdx` - IAM roles, Workload Identity setup for GKE/Cloud Run, Secret Manager integration, complete deployment example with security best practices
- `src/content/course/06-module-6/04-dataflow-bigquery.mdx` - Dataflow template deployment, two-table pattern, exactly-once vs at-least-once semantics, schema evolution, monitoring, custom pipeline alternative

## Decisions Made

1. **Workload Identity as primary authentication method** - Eliminates service account key files, automatic token rotation, better security audit trail
2. **Secret Manager for database credentials** - Centralized secret storage with access auditing, CSI Driver for Kubernetes mounting
3. **At-least-once recommended over exactly-once** - MERGE operations are idempotent (upsert by PK), significant cost savings (~50%), sufficient for most CDC use cases
4. **Two-table BigQuery pattern** - Changelog for full audit history, replica for current state queries. MERGE runs every updateFrequencySecs (60s default)
5. **Managed template over custom pipeline** - Automatic schema evolution, Google-maintained, faster setup. Custom pipeline only for complex transformations
6. **System lag as primary monitoring metric** - Critical for real-time CDC, alert threshold < 60 seconds

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required for this lesson content.

## Next Phase Readiness

- Module 6 security and data pipeline lessons complete
- Students can now configure secure GCP authentication for all CDC components
- Students can deploy Dataflow jobs for BigQuery replication
- Ready for next lesson: Cloud Run event-driven processing or monitoring setup
- MOD6-03 requirement covered (IAM and Workload Identity)
- MOD6-04 requirement covered (Dataflow templates for CDC in BigQuery)

---
*Phase: 10-module-6-cloud-native-gcp*
*Completed: 2026-02-01*
