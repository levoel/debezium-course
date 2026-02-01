# Requirements: Debezium Course v1.2

**Defined:** 2026-02-01
**Core Value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций

## v1.2 Requirements

### Course Structure Reorganization (STRUCT-01)

**Goal:** Move Module 8 (MySQL/Aurora MySQL) to position 3, right after Module 2 (PostgreSQL), creating a "Database Track" for better comparison.

**Module Renumbering:**
- [x] **STRUCT-01a**: Переименовать директории модулей (08→03, сдвинуть 03-07→04-08) ✓
- [x] **STRUCT-01b**: Navigation auto-discovers new structure (no config changes needed - directory rename satisfies this) ✓
- [x] **STRUCT-01c**: Обновить все внутренние ссылки между уроками ✓

**UI/UX Updates:**
- [x] **STRUCT-01d**: Обновить roadmap компонент (порядок модулей) — N/A (navigation auto-discovers) ✓
- [x] **STRUCT-01e**: Обновить progress tracking (localStorage keys) ✓

**Verification:**
- [ ] **STRUCT-01f**: Проверить все навигационные ссылки работают
- [ ] **STRUCT-01g**: Проверить progress persistence после реорганизации

---

## v1.1 Requirements (Complete)

### Module 8: MySQL/Aurora MySQL CDC

**Binlog Fundamentals:**
- [x] **MYSQL-01**: Контент объясняет архитектуру MySQL binlog (форматы ROW/STATEMENT/MIXED, события, ротация) ✓
- [x] **MYSQL-02**: Контент описывает GTID mode и его влияние на CDC (преимущества, ограничения, конфигурация) ✓
- [x] **MYSQL-03**: Контент объясняет binlog retention и heartbeat events для предотвращения потери позиции ✓

**Connector Setup:**
- [x] **MYSQL-04**: Пошаговая настройка MySQL коннектора в Docker Compose окружении ✓
- [x] **MYSQL-05**: Контент сравнивает MySQL binlog vs PostgreSQL WAL (архитектурные различия, мониторинг) ✓
- [x] **MYSQL-06**: Конфигурация schema history topic и её критическая роль для recovery ✓

**Aurora MySQL:**
- [x] **MYSQL-07**: Aurora MySQL-специфичная конфигурация (parameter groups, binlog retention procedures) ✓
- [x] **MYSQL-08**: Объяснение Aurora Enhanced Binlog архитектуры (storage nodes, 99% faster recovery) ✓
- [x] **MYSQL-09**: Ограничения Aurora MySQL для CDC (global read lock prohibition, snapshot modes) ✓

**Production Operations:**
- [x] **MYSQL-10**: Мониторинг binlog lag (AuroraBinlogReplicaLag, JMX metrics) ✓
- [x] **MYSQL-11**: Процедуры failover для MySQL/Aurora MySQL с GTID ✓
- [x] **MYSQL-12**: Incremental snapshot конфигурация и signal table operations ✓

**Advanced Topics:**
- [x] **MYSQL-13**: Recovery процедуры: binlog position loss, schema history topic corruption ✓
- [x] **MYSQL-14**: Multi-connector deployments (server ID registry, conflict prevention) ✓
- [x] **MYSQL-15**: DDL tool integration (gh-ost, pt-online-schema-change patterns) ✓

**Capstone Extension:**
- [x] **MYSQL-16**: Multi-database CDC pipeline (PostgreSQL + MySQL → unified processing) ✓

### Infrastructure

- [x] **INFRA-09**: MySQL 8.0.40 Docker service в существующем docker-compose.yml (port 3307) ✓
- [x] **INFRA-10**: Binlog конфигурация (ROW format, GTID mode, retention) ✓
- [x] **INFRA-11**: ARM64 совместимость для MySQL Docker образа ✓

### Platform

- [x] **PLAT-07**: GitHub Pages deployment с GitHub Actions CI/CD ✓

## Future Requirements (v1.3+)

### Platform Enhancements

- **PLAT-09**: Search functionality across lessons
- **PLAT-10**: Dark/light theme toggle
- **PLAT-11**: Export/import progress

### Additional Content

- **CONT-01**: MongoDB change streams module
- **CONT-02**: Kubernetes deployment patterns
- **CONT-03**: Multi-region active-active CDC

## Out of Scope

| Feature | Reason |
|---------|--------|
| MySQL Group Replication deep-dive | Niche use case, basic GTID covers HA patterns |
| MySQL 8.4 LTS | Requires Debezium 3.0+, defer to v2.0 |
| Oracle/SQL Server connectors | Focus on PostgreSQL/MySQL/Aurora |
| Custom SMT development for MySQL | Existing SMT module applies to all connectors |
| Cloud SQL MySQL | GCP focus on PostgreSQL, defer MySQL to v1.2 |

## Traceability

### v1.2

| Requirement | Phase | Status |
|-------------|-------|--------|
| STRUCT-01a | Phase 19 | Complete |
| STRUCT-01b | Phase 19 | Complete |
| STRUCT-01c | Phase 20 | Complete |
| STRUCT-01d | Phase 20 | Complete (N/A) |
| STRUCT-01e | Phase 20 | Complete |
| STRUCT-01f | Phase 21 | Pending |
| STRUCT-01g | Phase 21 | Pending |

**Coverage:**
- v1.2 requirements: 7 total
- Mapped to phases: 7/7
- Unmapped: 0

### v1.1 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-09 | Phase 12 | Complete |
| INFRA-10 | Phase 12 | Complete |
| INFRA-11 | Phase 12 | Complete |
| MYSQL-01 | Phase 12 | Complete |
| MYSQL-02 | Phase 12 | Complete |
| MYSQL-03 | Phase 12 | Complete |
| MYSQL-04 | Phase 13 | Complete |
| MYSQL-05 | Phase 13 | Complete |
| MYSQL-06 | Phase 13 | Complete |
| MYSQL-07 | Phase 14 | Complete |
| MYSQL-08 | Phase 14 | Complete |
| MYSQL-09 | Phase 14 | Complete |
| MYSQL-10 | Phase 15 | Complete |
| MYSQL-11 | Phase 15 | Complete |
| MYSQL-12 | Phase 15 | Complete |
| MYSQL-13 | Phase 16 | Complete |
| MYSQL-14 | Phase 16 | Complete |
| MYSQL-15 | Phase 16 | Complete |
| MYSQL-16 | Phase 17 | Complete |
| PLAT-07 | Phase 18 | Complete |

---
*Requirements defined: 2026-02-01*
*Last updated: 2026-02-01 — v1.2 requirements added, STRUCT-01b corrected (Starlight reference removed)*
