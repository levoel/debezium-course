# Roadmap: Debezium Course v1.7

**Milestone:** v1.7 Glossary & Troubleshooting
**Created:** 2026-02-03
**Phases:** 46-50 (5 phases)

## Overview

| Phase | Name | Goal | Requirements | Est. Plans |
|-------|------|------|--------------|------------|
| 46 | Glossary Infrastructure | Страница глоссария с компонентом и навигацией | GLOS-01, GLOS-02, GLOS-04, GLOS-05, INTG-02 | 2-3 |
| 47 | Glossary Content | 20-30 терминов CDC с примерами | GLOS-03 | 3-4 |
| 48 | Troubleshooting Infrastructure | Страница troubleshooting с компонентом и фильтрами | TRBL-01, TRBL-02, TRBL-04, TRBL-05, TRBL-06, TRBL-07 | 2-3 |
| 49 | Troubleshooting Content | 15-20 типовых ошибок с решениями | TRBL-03 | 3-4 |
| 50 | Integration & Polish | Навигация, mobile, финальная проверка | INTG-01, INTG-03 | 1-2 |

---

## Phase 46: Glossary Infrastructure

**Goal:** Создать страницу глоссария с рабочим компонентом термина, навигацией и поиском

**Requirements:**
- GLOS-01: Страница глоссария с навигацией по терминам
- GLOS-02: GlossaryTerm компонент (определение + пример + ссылки на уроки)
- GLOS-04: Алфавитный индекс или группировка по категориям
- GLOS-05: Термины индексируются Pagefind и находятся через Cmd+K
- INTG-02: Glass-дизайн консистентный с остальным курсом

**Success Criteria:**
1. Страница `/glossary` доступна и отображает структуру
2. GlossaryTerm компонент отрендерен с 2-3 тестовыми терминами
3. Навигация по алфавиту или категориям работает
4. Термины находятся через Cmd+K поиск
5. Дизайн соответствует glass-стилю курса

**Notes:**
- Компонент уже прототипирован в `src/components/GlossaryTerm.tsx`
- Перенести из prototype.astro в production страницу
- Добавить категоризацию: Database (WAL, binlog), Replication (slot, LSN), Kafka (topic, offset)

---

## Phase 47: Glossary Content

**Goal:** Наполнить глоссарий 20-30 ключевыми терминами CDC

**Requirements:**
- GLOS-03: 20-30 ключевых терминов CDC (WAL, LSN, GTID, slot, binlog, etc.)

**Success Criteria:**
1. Минимум 20 терминов добавлено
2. Каждый термин имеет: определение, пример кода, ссылки на уроки
3. Термины покрывают PostgreSQL, MySQL, Kafka, Debezium концепции
4. Все термины находятся через поиск

**Term Categories (target):**
- **PostgreSQL (6-8):** WAL, LSN, Replication Slot, Logical Decoding, Publication, pgoutput
- **MySQL (5-7):** Binlog, GTID, server_id, binlog_format, expire_logs_days
- **Kafka (4-5):** Topic, Partition, Offset, Consumer Group, Schema Registry
- **Debezium (5-7):** Connector, Snapshot, Streaming, SMT, Outbox Pattern, Heartbeat
- **General CDC (3-4):** CDC, Event Sourcing, CQRS, Idempotency

---

## Phase 48: Troubleshooting Infrastructure

**Goal:** Создать страницу troubleshooting с компонентом ошибки и фильтрами

**Requirements:**
- TRBL-01: Страница troubleshooting с навигацией по ошибкам
- TRBL-02: TroubleshootingEntry компонент (симптомы → причина → решение)
- TRBL-04: Теги по коннектору (PostgreSQL/MySQL) и категории
- TRBL-05: Раскрывающиеся карточки ошибок
- TRBL-06: Связанные уроки для каждой ошибки
- TRBL-07: Ошибки индексируются Pagefind — поиск по тексту ошибки

**Success Criteria:**
1. Страница `/troubleshooting` доступна и отображает структуру
2. TroubleshootingEntry компонент отрендерен с 2-3 тестовыми ошибками
3. Фильтры по коннектору работают (показать только PostgreSQL/MySQL)
4. Карточки раскрываются/сворачиваются
5. Ошибки находятся через Cmd+K по тексту ошибки

**Notes:**
- Компонент уже прототипирован в `src/components/TroubleshootingEntry.tsx`
- Добавить фильтрацию через React state (no URL params for static site)

---

## Phase 49: Troubleshooting Content

**Goal:** Наполнить базу 15-20 типовыми ошибками с решениями

**Requirements:**
- TRBL-03: 15-20 типовых ошибок (PostgreSQL + MySQL)

**Success Criteria:**
1. Минимум 15 ошибок добавлено
2. Каждая ошибка имеет: симптомы, причину, пошаговое решение, связанные уроки
3. Ошибки покрывают: connection, snapshot, streaming, configuration категории
4. Баланс между PostgreSQL и MySQL ошибками

**Error Categories (target):**
- **Connection (4-5):** pg_hba.conf, replication permissions, network issues
- **Snapshot (3-4):** slot active, lock timeout, binlog not found
- **Streaming (4-5):** WAL bloat, lag, slot dropped, GTID gaps
- **Configuration (3-4):** wal_level, binlog_format, plugin issues
- **Performance (2-3):** memory, slow queries, connector scaling

---

## Phase 50: Integration & Polish

**Goal:** Интеграция в навигацию, mobile testing, финальная проверка

**Requirements:**
- INTG-01: Навигация к глоссарию и troubleshooting из sidebar
- INTG-03: Mobile-responsive (390x844 viewport)

**Success Criteria:**
1. Sidebar содержит ссылки на Glossary и Troubleshooting
2. Обе страницы корректно отображаются на mobile (390x844)
3. Фильтры и раскрывающиеся карточки работают на touch devices
4. Build проходит без ошибок
5. Deploy на GitHub Pages успешен

**Notes:**
- Проверить Pagefind индексацию нового контента
- E2E тест на navigation

---

## Dependencies

```
Phase 46 (Glossary Infra) ─────► Phase 47 (Glossary Content)
                                          │
                                          ▼
Phase 48 (Troubleshooting Infra) ► Phase 49 (Troubleshooting Content)
                                          │
                                          ▼
                               Phase 50 (Integration)
```

Phases 46 и 48 могут выполняться параллельно.
Phases 47 и 49 зависят от инфраструктуры.
Phase 50 финализирует всё.

---

*Roadmap created: 2026-02-03*
