# Requirements: Debezium Course v1.1

**Defined:** 2026-02-01
**Core Value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций

## v1.1 Requirements

### Module 8: MySQL/Aurora MySQL CDC

**Binlog Fundamentals:**
- [x] **MYSQL-01**: Контент объясняет архитектуру MySQL binlog (форматы ROW/STATEMENT/MIXED, события, ротация) ✓
- [x] **MYSQL-02**: Контент описывает GTID mode и его влияние на CDC (преимущества, ограничения, конфигурация) ✓
- [x] **MYSQL-03**: Контент объясняет binlog retention и heartbeat events для предотвращения потери позиции ✓

**Connector Setup:**
- [ ] **MYSQL-04**: Пошаговая настройка MySQL коннектора в Docker Compose окружении
- [ ] **MYSQL-05**: Контент сравнивает MySQL binlog vs PostgreSQL WAL (архитектурные различия, мониторинг)
- [ ] **MYSQL-06**: Конфигурация schema history topic и её критическая роль для recovery

**Aurora MySQL:**
- [ ] **MYSQL-07**: Aurora MySQL-специфичная конфигурация (parameter groups, binlog retention procedures)
- [ ] **MYSQL-08**: Объяснение Aurora Enhanced Binlog архитектуры (storage nodes, 99% faster recovery)
- [ ] **MYSQL-09**: Ограничения Aurora MySQL для CDC (global read lock prohibition, snapshot modes)

**Production Operations:**
- [ ] **MYSQL-10**: Мониторинг binlog lag (AuroraBinlogReplicaLag, JMX metrics)
- [ ] **MYSQL-11**: Процедуры failover для MySQL/Aurora MySQL с GTID
- [ ] **MYSQL-12**: Incremental snapshot конфигурация и signal table operations

**Advanced Topics:**
- [ ] **MYSQL-13**: Recovery процедуры: binlog position loss, schema history topic corruption
- [ ] **MYSQL-14**: Multi-connector deployments (server ID registry, conflict prevention)
- [ ] **MYSQL-15**: DDL tool integration (gh-ost, pt-online-schema-change patterns)

**Capstone Extension:**
- [ ] **MYSQL-16**: Multi-database CDC pipeline (PostgreSQL + MySQL → unified processing)

### Infrastructure

- [x] **INFRA-09**: MySQL 8.0.40 Docker service в существующем docker-compose.yml (port 3307) ✓
- [x] **INFRA-10**: Binlog конфигурация (ROW format, GTID mode, retention) ✓
- [x] **INFRA-11**: ARM64 совместимость для MySQL Docker образа ✓

### Platform

- [ ] **PLAT-07**: GitHub Pages deployment с GitHub Actions CI/CD

## Future Requirements (v1.2+)

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

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-09 | Phase 12 | Complete |
| INFRA-10 | Phase 12 | Complete |
| INFRA-11 | Phase 12 | Complete |
| MYSQL-01 | Phase 12 | Complete |
| MYSQL-02 | Phase 12 | Complete |
| MYSQL-03 | Phase 12 | Complete |
| MYSQL-04 | Phase 13 | Pending |
| MYSQL-05 | Phase 13 | Pending |
| MYSQL-06 | Phase 13 | Pending |
| MYSQL-07 | Phase 14 | Pending |
| MYSQL-08 | Phase 14 | Pending |
| MYSQL-09 | Phase 14 | Pending |
| MYSQL-10 | Phase 15 | Pending |
| MYSQL-11 | Phase 15 | Pending |
| MYSQL-12 | Phase 15 | Pending |
| MYSQL-13 | Phase 16 | Pending |
| MYSQL-14 | Phase 16 | Pending |
| MYSQL-15 | Phase 16 | Pending |
| MYSQL-16 | Phase 17 | Pending |
| PLAT-07 | Phase 18 | Pending |

**Coverage:**
- v1.1 requirements: 20 total
- Mapped to phases: 20/20
- Unmapped: 0

---
*Requirements defined: 2026-02-01*
*Last updated: 2026-02-01 — phase mappings added*
