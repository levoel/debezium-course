---
phase: 17
plan: 01
subsystem: education-content
tags: [multi-database, cdc, architecture, postgresql, mysql, module-7]
requires:
  - phase-16-03 (Advanced Topics + Recovery completion)
  - module-8-content (MySQL/Aurora MySQL foundations)
  - module-2-content (PostgreSQL/Aurora PostgreSQL foundations)
provides:
  - multi-database-architecture-lesson
  - architecture-pattern-comparison
  - operational-differences-documentation
affects:
  - phase-17-02 (Multi-database configuration will reference these patterns)
tech-stack:
  added: []
  patterns:
    - separate-topics-architecture
    - unified-topics-architecture
    - bylогicaltablerouter-smt
key-files:
  created:
    - src/content/course/07-module-7/04-multi-database-architecture.mdx
  modified:
    - src/content/course/07-module-7/05-multi-database-configuration.mdx (bugfix)
decisions: []
metrics:
  duration: 6 minutes
  completed: 2026-02-01
---

# Phase 17 Plan 01: Multi-Database CDC Architecture Summary

**One-liner:** Created comprehensive multi-database CDC architecture lesson covering Separate Topics vs Unified Topics patterns, operational differences between PostgreSQL and MySQL connectors, and critical pitfalls to avoid.

---

## What Was Built

### Lesson Content (491 lines)

Created `04-multi-database-architecture.mdx` covering:

1. **Real-world scenarios** for multi-database CDC:
   - Different teams owning different databases
   - Polyglot persistence + legacy integration
   - Migration scenarios (MySQL ↔ PostgreSQL)

2. **Two architecture patterns** with Mermaid diagrams:
   - **Pattern 1: Separate Topics** (recommended for learning)
     - Database-specific topics per source
     - Clear traceability and independent schema evolution
     - Simpler troubleshooting
   - **Pattern 2: Unified Topics** (advanced)
     - ByLogicalTableRouter SMT consolidation
     - Single consumer per aggregate
     - Requires identical schemas

3. **Decision matrix** comparing patterns across 6 criteria

4. **Operational differences** (PostgreSQL vs MySQL):
   - Schema storage: Embedded in WAL vs schema.history.topic
   - Position tracking: Server-side slots vs client-side GTID
   - Recovery procedures comparison
   - Monitoring metrics differences

5. **Critical pitfalls** with Callout components:
   - Never share schema.history.topic between MySQL connectors
   - Unique database.server.name mandatory
   - Topic naming collision prevention

6. **Configuration templates** for both PostgreSQL and MySQL connectors

7. **Cross-references** to Module 2 (PostgreSQL) and Module 8 (MySQL) lessons

---

## Decisions Made

No architectural decisions were required. Implementation followed established patterns from Module 2 and Module 8 content.

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Callout component syntax errors**
- **Found during:** Task 1 build verification
- **Issue:** Callout components missing blank line after opening tag, causing TypeError "Cannot read properties of undefined (reading 'bg')"
- **Fix:** Added blank lines after `<Callout type="...">` and before `</Callout>` tags to match MDX component requirements
- **Files modified:** `04-multi-database-architecture.mdx` (4 Callouts fixed)
- **Commit:** f7f0893

**2. [Rule 1 - Bug] Fixed invalid Callout props in existing file**
- **Found during:** Build verification
- **Issue:** `05-multi-database-configuration.mdx` (created in 17-02) used `title=` prop which Callout component doesn't support, blocking build
- **Fix:** Removed `title=` attribute and moved titles into content as bold headers
- **Files modified:** `05-multi-database-configuration.mdx` (4 Callouts fixed)
- **Commit:** f7f0893
- **Note:** This was a blocking bug in code created by a future plan (17-02) that prevented current plan verification

---

## Technical Implementation

### Architecture Patterns Documented

**Separate Topics Architecture:**
```
PostgreSQL → postgres_prod.public.orders
MySQL → mysql_prod.inventory.stock
Consumer: UNION ALL from both topics
```

**Unified Topics Architecture:**
```
PostgreSQL → ByLogicalTableRouter SMT → outbox.event.orders
MySQL → ByLogicalTableRouter SMT → outbox.event.orders
Consumer: Single topic source
```

### Operational Differences Table

| Aspect | PostgreSQL | MySQL |
|--------|------------|-------|
| Schema storage | Embedded in WAL | schema.history.topic |
| Position tracking | Server-side slots (LSN) | Client-side GTID |
| Recovery | Slot recreation | Schema history backup |
| Heartbeat | Prevent WAL bloat | Prevent binlog purge |

### Cross-References Established

- Module 2: Logical Decoding Deep Dive, Replication Slot Management
- Module 8: GTID Mode, Binlog vs WAL Comparison, Schema History Recovery, Multi-Connector Deployments
- Module 7: Capstone Overview (prerequisite)
- Module 7: Multi-Database Configuration (next lesson)

---

## Testing Evidence

### Build Verification
```bash
npm run build
# ✓ Completed in 4.29s (no MDX errors)
```

### Content Verification
- Line count: 491 lines (exceeds 250 minimum)
- Mermaid diagrams: 2 (architecture patterns)
- Callout components: 4 (pitfalls and warnings)
- Comparison tables: 2 (pattern comparison, operational differences)
- ByLogicalTableRouter mentions: 5 occurrences
- Cross-references: 8 links to Module 2 and Module 8

---

## What's Next

### Phase 17 Plan 02 (already exists)
Multi-Database Configuration lesson builds on these patterns with hands-on PostgreSQL + MySQL connector configuration.

### Integration Points
This lesson bridges:
- Module 2 PostgreSQL knowledge
- Module 8 MySQL knowledge
- Module 7 capstone project requirements

Learners now understand:
- Why multi-database CDC is needed
- Two architecture patterns and when to use each
- Operational differences between PostgreSQL and MySQL connectors
- Critical pitfalls to avoid

---

## Lessons Learned

### MDX Component Requirements
Callout component requires:
1. Valid type: 'note' | 'tip' | 'warning' | 'danger'
2. NO `title=` prop (not supported)
3. Blank line after opening tag
4. Blank line before closing tag

Pattern:
```mdx
<Callout type="warning">

**Title as bold text in content**

Content here.

</Callout>
```

### Build Verification Critical
Running `npm run build` after content creation caught syntax errors that would have blocked production deployment. Always verify MDX builds before committing.

### Cross-Plan Dependencies
Plan 17-02 (multi-database configuration) was created before 17-01, creating a temporal dependency where future plan code blocked current plan verification. Fixed by applying bug fixes to both files.

---

## Key Files Modified

### Created
- `src/content/course/07-module-7/04-multi-database-architecture.mdx` (491 lines)
  - Frontmatter with prerequisites and topics
  - 2 Mermaid architecture diagrams
  - 4 Callout warnings
  - 2 comparison tables
  - Configuration templates
  - Cross-references to 8 prior lessons

### Modified (Bugfix)
- `src/content/course/07-module-7/05-multi-database-configuration.mdx`
  - Fixed 4 Callout components with invalid `title=` prop
  - Changed `type="info"` to `type="note"` (valid type)
  - Build now passes

---

## Commits

1. **e428e18** - `feat(17-01): create multi-database CDC architecture lesson`
   - Initial lesson creation with complete structure
   - 491 lines covering multi-database CDC concepts
   - 2 architecture patterns with Mermaid diagrams
   - Operational differences table
   - Configuration templates

2. **f7f0893** - `fix(17-01): fix Callout component usage in multi-database lessons`
   - Fixed Callout formatting in 04-multi-database-architecture.mdx
   - Fixed invalid title attribute in 05-multi-database-configuration.mdx
   - Build now passes without errors
   - Deviation: Rule 1 (Bug fix)

---

## Success Criteria Met

- ✅ All tasks executed (2 tasks completed)
- ✅ Each task committed individually with proper format
- ✅ All deviations documented (2 bugfixes)
- ✅ SUMMARY.md created in plan directory
- ✅ File exceeds minimum 250 lines (491 lines)
- ✅ Contains ByLogicalTableRouter (5 occurrences)
- ✅ Contains 2+ Mermaid diagrams
- ✅ Contains 4+ Callout components
- ✅ Cross-references Module 2 and Module 8
- ✅ Build passes (`npm run build` successful)

---

## Metrics

- **Execution time:** 6 minutes
- **Lines of code:** 491 lines (lesson content)
- **Commits:** 2 (1 feature + 1 bugfix)
- **Files created:** 1
- **Files modified:** 1 (bugfix)
- **Deviations:** 2 (both Rule 1 bugfixes)
