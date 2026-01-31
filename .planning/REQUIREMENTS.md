# Requirements: Debezium Course

**Defined:** 2026-01-31
**Core Value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium

## v1 Requirements

### Platform

- [ ] **PLAT-01**: Пользователь видит интерактивный роадмап курса с визуальным отображением модулей
- [ ] **PLAT-02**: Пользователь может кликать по элементам роадмапа для перехода к теме
- [ ] **PLAT-03**: Прогресс пользователя сохраняется в localStorage и отображается на роадмапе
- [ ] **PLAT-04**: Пользователь видит меню с разделением по модулям и топикам
- [ ] **PLAT-05**: Код в контенте отображается с syntax highlighting (Python, YAML, SQL, JSON)
- [ ] **PLAT-06**: Диаграммы архитектуры рендерятся из Mermaid-кода
- [ ] **PLAT-07**: Сайт деплоится как статика на GitHub Pages или Vercel
- [ ] **PLAT-08**: Сайт корректно отображается на мобильных устройствах

### Module 1: Foundations

- [ ] **MOD1-01**: Контент объясняет что такое CDC и log-based подход
- [ ] **MOD1-02**: Контент описывает архитектуру Debezium (Kafka Connect, Server, Embedded)
- [ ] **MOD1-03**: Инструкции по настройке Docker Compose окружения
- [ ] **MOD1-04**: Пошаговая настройка первого PostgreSQL коннектора
- [ ] **MOD1-05**: Python код для чтения CDC-событий из Kafka (confluent-kafka)
- [ ] **MOD1-06**: Разбор структуры CDC-события (envelope, before/after, metadata)

### Module 2: PostgreSQL & Aurora

- [ ] **MOD2-01**: Глубокий разбор logical decoding и pgoutput плагина
- [ ] **MOD2-02**: Конфигурация replication slots и их мониторинг
- [ ] **MOD2-03**: Настройка WAL (wal_level=logical) и влияние на производительность
- [ ] **MOD2-04**: Aurora-специфичная конфигурация (parameter groups, flags)
- [ ] **MOD2-05**: Обработка Aurora failover и поведение replication slots
- [ ] **MOD2-06**: Snapshot стратегии (initial, incremental) для больших таблиц
- [ ] **MOD2-07**: Практика: настройка инкрементального снапшота

### Module 3: Production Operations

- [ ] **MOD3-01**: JMX метрики Debezium и их интерпретация
- [ ] **MOD3-02**: Настройка Prometheus для сбора метрик
- [ ] **MOD3-03**: Grafana дашборд для мониторинга CDC pipeline
- [ ] **MOD3-04**: Детекция и алертинг на lag (MilliSecondsBehindSource)
- [ ] **MOD3-05**: Управление WAL bloat и heartbeat конфигурация
- [ ] **MOD3-06**: Масштабирование коннекторов и task model
- [ ] **MOD3-07**: Disaster recovery процедуры и backup offset

### Module 4: Advanced Patterns

- [ ] **MOD4-01**: Single Message Transformations (SMTs) — обзор и применение
- [ ] **MOD4-02**: Фильтрация событий с predicates
- [ ] **MOD4-03**: Маскирование PII данных через SMT
- [ ] **MOD4-04**: Content-based routing в разные топики
- [ ] **MOD4-05**: Outbox pattern — теория и архитектура
- [ ] **MOD4-06**: Практическая реализация outbox с Outbox Event Router SMT
- [ ] **MOD4-07**: Schema Registry интеграция и Avro сериализация
- [ ] **MOD4-08**: Schema evolution и backward/forward compatibility

### Module 5: Data Engineering

- [ ] **MOD5-01**: Продвинутые паттерны Python consumer (error handling, exactly-once)
- [ ] **MOD5-02**: Интеграция CDC событий с Pandas DataFrame
- [ ] **MOD5-03**: PyFlink CDC connector — настройка и использование
- [ ] **MOD5-04**: Stateful stream processing в PyFlink (агрегации, joins)
- [ ] **MOD5-05**: PySpark Structured Streaming с Kafka source
- [ ] **MOD5-06**: ETL/ELT паттерны с CDC данными
- [ ] **MOD5-07**: Real-time feature engineering для ML

### Module 6: Cloud-Native GCP

- [ ] **MOD6-01**: Настройка Cloud SQL PostgreSQL для Debezium
- [ ] **MOD6-02**: Debezium Server с Pub/Sub sink (Kafka-less архитектура)
- [ ] **MOD6-03**: IAM и Workload Identity для безопасного доступа
- [ ] **MOD6-04**: Dataflow templates для CDC в BigQuery
- [ ] **MOD6-05**: Cloud Run для event-driven обработки CDC
- [ ] **MOD6-06**: End-to-end мониторинг в Cloud Monitoring

### Module 7: Capstone Project

- [ ] **CAP-01**: Описание capstone проекта (Aurora → Outbox → PyFlink → BigQuery)
- [ ] **CAP-02**: Требования к архитектуре и deliverables
- [ ] **CAP-03**: Чеклист для самопроверки

### Infrastructure

- [x] **INFRA-01**: Docker Compose с PostgreSQL 15+ (logical replication enabled)
- [x] **INFRA-02**: Kafka 3.x в KRaft mode (без ZooKeeper)
- [x] **INFRA-03**: Debezium 2.5.x коннекторы (downgraded from 3.x due to Java 21 ARM64 crash)
- [x] **INFRA-04**: Schema Registry
- [x] **INFRA-05**: Prometheus + Grafana для мониторинга
- [x] **INFRA-06**: Python 3.11+ окружение с JupyterLab
- [x] **INFRA-07**: Все образы поддерживают ARM64 (macOS M-series)
- [x] **INFRA-08**: README с инструкциями по запуску

## v2 Requirements

### Platform Enhancements

- **PLAT-V2-01**: Интерактивный code editor с запуском кода
- **PLAT-V2-02**: Поиск по всему курсу
- **PLAT-V2-03**: Тёмная/светлая тема
- **PLAT-V2-04**: Export/import прогресса

### Additional Content

- **CONT-V2-01**: MySQL/Aurora MySQL коннектор
- **CONT-V2-02**: MongoDB change streams
- **CONT-V2-03**: Kubernetes deployment
- **CONT-V2-04**: Multi-region active-active CDC

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend/API | Курс полностью статический |
| Авторизация пользователей | Прогресс только в localStorage |
| Oracle/SQL Server коннекторы | Фокус на PostgreSQL/Aurora |
| ZooKeeper deep-dive | Deprecated, Kafka использует KRaft |
| Custom connector development | Слишком продвинутая тема |
| Kafka administration | Отдельный курс, assume Kafka работает |
| Debezium UI | Experimental, не production-grade |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAT-01 | Phase 2 | Pending |
| PLAT-02 | Phase 2 | Pending |
| PLAT-03 | Phase 3 | Pending |
| PLAT-04 | Phase 2 | Pending |
| PLAT-05 | Phase 1 | Pending |
| PLAT-06 | Phase 1 | Pending |
| PLAT-07 | Phase 1 | Pending |
| PLAT-08 | Phase 1 | Pending |
| INFRA-01 | Phase 4 | Pending |
| INFRA-02 | Phase 4 | Pending |
| INFRA-03 | Phase 4 | Pending |
| INFRA-04 | Phase 4 | Pending |
| INFRA-05 | Phase 4 | Pending |
| INFRA-06 | Phase 4 | Pending |
| INFRA-07 | Phase 4 | Pending |
| INFRA-08 | Phase 4 | Pending |
| MOD1-01 | Phase 5 | Pending |
| MOD1-02 | Phase 5 | Pending |
| MOD1-03 | Phase 5 | Pending |
| MOD1-04 | Phase 5 | Pending |
| MOD1-05 | Phase 5 | Pending |
| MOD1-06 | Phase 5 | Pending |
| MOD2-01 | Phase 6 | Pending |
| MOD2-02 | Phase 6 | Pending |
| MOD2-03 | Phase 6 | Pending |
| MOD2-04 | Phase 6 | Pending |
| MOD2-05 | Phase 6 | Pending |
| MOD2-06 | Phase 6 | Pending |
| MOD2-07 | Phase 6 | Pending |
| MOD3-01 | Phase 7 | Pending |
| MOD3-02 | Phase 7 | Pending |
| MOD3-03 | Phase 7 | Pending |
| MOD3-04 | Phase 7 | Pending |
| MOD3-05 | Phase 7 | Pending |
| MOD3-06 | Phase 7 | Pending |
| MOD3-07 | Phase 7 | Pending |
| MOD4-01 | Phase 8 | Pending |
| MOD4-02 | Phase 8 | Pending |
| MOD4-03 | Phase 8 | Pending |
| MOD4-04 | Phase 8 | Pending |
| MOD4-05 | Phase 8 | Pending |
| MOD4-06 | Phase 8 | Pending |
| MOD4-07 | Phase 8 | Pending |
| MOD4-08 | Phase 8 | Pending |
| MOD5-01 | Phase 9 | Pending |
| MOD5-02 | Phase 9 | Pending |
| MOD5-03 | Phase 9 | Pending |
| MOD5-04 | Phase 9 | Pending |
| MOD5-05 | Phase 9 | Pending |
| MOD5-06 | Phase 9 | Pending |
| MOD5-07 | Phase 9 | Pending |
| MOD6-01 | Phase 10 | Pending |
| MOD6-02 | Phase 10 | Pending |
| MOD6-03 | Phase 10 | Pending |
| MOD6-04 | Phase 10 | Pending |
| MOD6-05 | Phase 10 | Pending |
| MOD6-06 | Phase 10 | Pending |
| CAP-01 | Phase 11 | Pending |
| CAP-02 | Phase 11 | Pending |
| CAP-03 | Phase 11 | Pending |

**Coverage:**
- v1 requirements: 60 total
- Mapped to phases: 60
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-31*
*Last updated: 2026-01-31 after roadmap creation*
