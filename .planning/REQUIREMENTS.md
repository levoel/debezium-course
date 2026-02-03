# Requirements: Debezium Course v1.7

**Defined:** 2026-02-03
**Core Value:** Справочные материалы для практики — быстрый доступ к терминам и решениям ошибок

## v1.7 Requirements

### Glossary (Глоссарий)

- [x] **GLOS-01**: Страница глоссария с навигацией по терминам
- [x] **GLOS-02**: GlossaryTerm компонент (определение + пример + ссылки на уроки)
- [x] **GLOS-03**: 20-30 ключевых терминов CDC (WAL, LSN, GTID, slot, binlog, etc.) — **27 терминов**
- [x] **GLOS-04**: Алфавитный индекс или группировка по категориям — **5 категорий**
- [x] **GLOS-05**: Термины индексируются Pagefind и находятся через Cmd+K

### Troubleshooting (База ошибок)

- [x] **TRBL-01**: Страница troubleshooting с навигацией по ошибкам
- [x] **TRBL-02**: TroubleshootingEntry компонент (симптомы → причина → решение)
- [x] **TRBL-03**: 15-20 типовых ошибок (PostgreSQL + MySQL) — **20 ошибок**
- [x] **TRBL-04**: Теги по коннектору (PostgreSQL/MySQL) и категории (connection/snapshot/streaming)
- [x] **TRBL-05**: Раскрывающиеся карточки ошибок
- [x] **TRBL-06**: Связанные уроки для каждой ошибки
- [x] **TRBL-07**: Ошибки индексируются Pagefind — поиск по тексту ошибки

### Integration (Интеграция)

- [x] **INTG-01**: Навигация к глоссарию и troubleshooting из sidebar
- [x] **INTG-02**: Glass-дизайн консистентный с остальным курсом
- [x] **INTG-03**: Mobile-responsive (390x844 viewport)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Decision tree для диагностики | Сложность реализации, база ошибок достаточна для v1 |
| Inline tooltips для терминов в уроках | Требует модификации всех 65+ уроков |
| User-submitted ошибки | Нет backend, курс статический |
| Видео-объяснения терминов | Фокус на текстовый контент |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GLOS-01 | Phase 46 | Complete |
| GLOS-02 | Phase 46 | Complete |
| GLOS-03 | Phase 47 | Complete |
| GLOS-04 | Phase 46 | Complete |
| GLOS-05 | Phase 46 | Complete |
| TRBL-01 | Phase 48 | Complete |
| TRBL-02 | Phase 48 | Complete |
| TRBL-03 | Phase 49 | Complete |
| TRBL-04 | Phase 48 | Complete |
| TRBL-05 | Phase 48 | Complete |
| TRBL-06 | Phase 48 | Complete |
| TRBL-07 | Phase 48 | Complete |
| INTG-01 | Phase 50 | Complete |
| INTG-02 | Phase 46 | Complete |
| INTG-03 | Phase 50 | Complete |

**Coverage:**
- v1.7 requirements: 15 total
- Complete: 15 ✓
- Incomplete: 0

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after v1.7 milestone completion*
