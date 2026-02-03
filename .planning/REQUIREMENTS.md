# Requirements: Debezium Course v1.7

**Defined:** 2026-02-03
**Core Value:** Справочные материалы для практики — быстрый доступ к терминам и решениям ошибок

## v1.7 Requirements

### Glossary (Глоссарий)

- [ ] **GLOS-01**: Страница глоссария с навигацией по терминам
- [ ] **GLOS-02**: GlossaryTerm компонент (определение + пример + ссылки на уроки)
- [ ] **GLOS-03**: 20-30 ключевых терминов CDC (WAL, LSN, GTID, slot, binlog, etc.)
- [ ] **GLOS-04**: Алфавитный индекс или группировка по категориям
- [ ] **GLOS-05**: Термины индексируются Pagefind и находятся через Cmd+K

### Troubleshooting (База ошибок)

- [ ] **TRBL-01**: Страница troubleshooting с навигацией по ошибкам
- [ ] **TRBL-02**: TroubleshootingEntry компонент (симптомы → причина → решение)
- [ ] **TRBL-03**: 15-20 типовых ошибок (PostgreSQL + MySQL)
- [ ] **TRBL-04**: Теги по коннектору (PostgreSQL/MySQL) и категории (connection/snapshot/streaming)
- [ ] **TRBL-05**: Раскрывающиеся карточки ошибок
- [ ] **TRBL-06**: Связанные уроки для каждой ошибки
- [ ] **TRBL-07**: Ошибки индексируются Pagefind — поиск по тексту ошибки

### Integration (Интеграция)

- [ ] **INTG-01**: Навигация к глоссарию и troubleshooting из sidebar
- [ ] **INTG-02**: Glass-дизайн консистентный с остальным курсом
- [ ] **INTG-03**: Mobile-responsive (390x844 viewport)

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
| GLOS-01 | Phase 46 | Pending |
| GLOS-02 | Phase 46 | Pending |
| GLOS-03 | Phase 47 | Pending |
| GLOS-04 | Phase 46 | Pending |
| GLOS-05 | Phase 46 | Pending |
| TRBL-01 | Phase 48 | Pending |
| TRBL-02 | Phase 48 | Pending |
| TRBL-03 | Phase 49 | Pending |
| TRBL-04 | Phase 48 | Pending |
| TRBL-05 | Phase 48 | Pending |
| TRBL-06 | Phase 48 | Pending |
| TRBL-07 | Phase 48 | Pending |
| INTG-01 | Phase 50 | Pending |
| INTG-02 | Phase 46 | Pending |
| INTG-03 | Phase 50 | Pending |

**Coverage:**
- v1.7 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after initial definition*
