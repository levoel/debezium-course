# Requirements: Debezium Course v1.4

**Defined:** 2026-02-02
**Core Value:** Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций

## v1.4 Requirements

### Diagram Primitives Library (PRIM)

**Goal:** Создать библиотеку переиспользуемых компонентов для замены Mermaid диаграмм.

- [ ] **PRIM-01**: FlowNode component (glass-styled нода с вариантами: database, connector, cluster, sink, app, target)
- [ ] **PRIM-02**: Arrow/Connector component (SVG стрелки между нодами)
- [ ] **PRIM-03**: DiagramContainer component (glass карточка-обёртка для диаграммы)
- [ ] **PRIM-04**: SequenceActor component (участник sequence диаграммы)
- [ ] **PRIM-05**: SequenceMessage component (сообщение между участниками)
- [ ] **PRIM-06**: SequenceLifeline component (вертикальная линия жизни)

### Tooltip System (TOOL)

**Goal:** Интерактивные пояснения при клике на элементы диаграмм.

- [ ] **TOOL-01**: Radix UI Tooltip integration (@radix-ui/react-tooltip)
- [ ] **TOOL-02**: Click-to-open pattern (не hover-only для mobile)
- [ ] **TOOL-03**: Keyboard navigation (Tab между нодами, Enter/Space для открытия)
- [ ] **TOOL-04**: Tooltip positioning (не перекрывает target element)
- [ ] **TOOL-05**: Glass-styled tooltip content (соответствует design system)

### Module 1 Migration (MOD1)

**Goal:** Заменить Mermaid диаграммы в Module 1 (Введение в CDC) на glass компоненты.

- [ ] **MOD1-01**: Аудит диаграмм Module 1 (количество, типы)
- [ ] **MOD1-02**: Создать glass-версии всех flowchart диаграмм
- [ ] **MOD1-03**: Добавить tooltip'ы с пояснениями к нодам
- [ ] **MOD1-04**: Удалить Mermaid код из MDX файлов Module 1

### Module 2 Migration (MOD2)

**Goal:** Заменить Mermaid диаграммы в Module 2 (PostgreSQL/Aurora PostgreSQL).

- [ ] **MOD2-01**: Аудит диаграмм Module 2
- [ ] **MOD2-02**: Создать glass-версии диаграмм (WAL архитектура, replication slots)
- [ ] **MOD2-03**: Добавить tooltip'ы с пояснениями
- [ ] **MOD2-04**: Удалить Mermaid код из MDX файлов Module 2

### Module 3 Migration (MOD3)

**Goal:** Заменить Mermaid диаграммы в Module 3 (MySQL/Aurora MySQL).

- [ ] **MOD3-01**: Аудит диаграмм Module 3
- [ ] **MOD3-02**: Создать glass-версии диаграмм (binlog архитектура, GTID)
- [ ] **MOD3-03**: Добавить tooltip'ы с пояснениями
- [ ] **MOD3-04**: Удалить Mermaid код из MDX файлов Module 3

### Module 4 Migration (MOD4)

**Goal:** Заменить Mermaid диаграммы в Module 4 (Production Operations).

- [ ] **MOD4-01**: Аудит диаграмм Module 4
- [ ] **MOD4-02**: Создать glass-версии диаграмм (monitoring, alerting)
- [ ] **MOD4-03**: Добавить tooltip'ы с пояснениями
- [ ] **MOD4-04**: Удалить Mermaid код из MDX файлов Module 4

### Module 5 Migration (MOD5)

**Goal:** Заменить Mermaid диаграммы в Module 5 (Advanced Patterns - SMT).

- [ ] **MOD5-01**: Аудит диаграмм Module 5 (высокая сложность - SMT chains)
- [ ] **MOD5-02**: Создать glass-версии диаграмм (transformation pipelines)
- [ ] **MOD5-03**: Добавить tooltip'ы с пояснениями
- [ ] **MOD5-04**: Удалить Mermaid код из MDX файлов Module 5

### Module 6 Migration (MOD6)

**Goal:** Заменить Mermaid диаграммы в Module 6 (Data Engineering Integration).

- [ ] **MOD6-01**: Аудит диаграмм Module 6
- [ ] **MOD6-02**: Создать glass-версии диаграмм (streaming architectures, Flink/Spark)
- [ ] **MOD6-03**: Добавить tooltip'ы с пояснениями
- [ ] **MOD6-04**: Удалить Mermaid код из MDX файлов Module 6

### Module 7 Migration (MOD7)

**Goal:** Заменить Mermaid диаграммы в Module 7 (Cloud-Native GCP).

- [ ] **MOD7-01**: Аудит диаграмм Module 7
- [ ] **MOD7-02**: Создать glass-версии диаграмм (GCP architecture, Pub/Sub, Dataflow)
- [ ] **MOD7-03**: Добавить tooltip'ы с пояснениями
- [ ] **MOD7-04**: Удалить Mermaid код из MDX файлов Module 7

### Module 8 Migration (MOD8)

**Goal:** Заменить Mermaid диаграммы в Module 8 (Capstone).

- [ ] **MOD8-01**: Аудит диаграмм Module 8
- [ ] **MOD8-02**: Создать glass-версии диаграмм (full pipeline architecture)
- [ ] **MOD8-03**: Добавить tooltip'ы с пояснениями
- [ ] **MOD8-04**: Удалить Mermaid код из MDX файлов Module 8

### Finalization (FINAL)

**Goal:** Финальная проверка, оптимизация и удаление Mermaid.

- [ ] **FINAL-01**: Visual regression testing для всех диаграмм
- [ ] **FINAL-02**: Accessibility audit (WCAG keyboard navigation)
- [ ] **FINAL-03**: Mobile responsiveness verification
- [ ] **FINAL-04**: Remove mermaid dependency from package.json
- [ ] **FINAL-05**: Bundle size optimization verification (~1MB savings)

---

## v1.3 Requirements (Complete)

### Module Naming (UX-01)

**Goal:** Заменить "Модуль N" на описательные названия для лучшей навигации.

- [x] **UX-01a**: Описательные названия модулей в сайдбаре ✓
- [ ] **UX-01b**: Описательные названия в хлебных крошках (deferred - no breadcrumb component)
- [x] **UX-01c**: Описательные названия на homepage ✓

### Homepage Accordion (UX-02)

**Goal:** Организовать уроки по модулям на главной странице с accordion-меню.

- [x] **UX-02a**: Accordion-меню модулей (свёрнуты по умолчанию) ✓
- [x] **UX-02b**: Список уроков раскрывается по клику ✓
- [x] **UX-02c**: Индикатор прогресса по модулю ✓

### Table Redesign (UX-03)

**Goal:** Улучшить читаемость таблиц с чёткими границами и контрастом.

- [x] **UX-03a**: Чёткие границы ячеек (1px solid) ✓
- [x] **UX-03b**: Читаемый контраст текста (WCAG 4.5:1) ✓
- [x] **UX-03c**: Light glass эффект (blur 8px, низкая прозрачность) ✓

### Liquid Glass Design (UX-04)

**Goal:** Применить glassmorphism дизайн к UI элементам.

- [x] **UX-04a**: Gradient background (основа для glass эффекта) ✓
- [x] **UX-04b**: Glass sidebar navigation ✓
- [x] **UX-04c**: Glass callouts (info, warning, tip) ✓
- [x] **UX-04d**: Glass карточки модулей на homepage ✓
- [x] **UX-04e**: Responsive blur (меньше на mobile) ✓
- [x] **UX-04f**: Accessibility fallbacks (prefers-reduced-transparency) ✓

---

## v1.2 Requirements (Complete)

### Course Structure Reorganization (STRUCT-01)

- [x] **STRUCT-01a**: Переименовать директории модулей ✓
- [x] **STRUCT-01b**: Navigation auto-discovers new structure ✓
- [x] **STRUCT-01c**: Обновить все внутренние ссылки между уроками ✓
- [x] **STRUCT-01d**: Обновить roadmap компонент ✓
- [x] **STRUCT-01e**: Обновить progress tracking ✓
- [x] **STRUCT-01f**: Проверить все навигационные ссылки работают ✓
- [x] **STRUCT-01g**: Проверить progress persistence ✓

---

## v1.1 Requirements (Complete)

### MySQL/Aurora MySQL CDC (MYSQL-01 to MYSQL-16)

All 16 requirements complete. See MILESTONES.md for details.

### Infrastructure (INFRA-09 to INFRA-11)

All 3 requirements complete.

### Platform (PLAT-07)

GitHub Pages deployment complete.

---

## Future Requirements (v1.5+)

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
| Drag-and-drop diagram editing | Educational content, not diagramming tool |
| Zoom/pan for diagrams | Most diagrams are simple flowcharts, not complex networks |
| Animated diagram transitions | Performance overhead, minimal educational value |
| Real-time collaboration | Static course content |
| Export diagrams as images | Users can screenshot if needed |

## Traceability

### v1.4

| Requirement | Phase | Status |
|-------------|-------|--------|
| PRIM-01 | Phase 26 | Pending |
| PRIM-02 | Phase 26 | Pending |
| PRIM-03 | Phase 26 | Pending |
| PRIM-04 | Phase 27 | Pending |
| PRIM-05 | Phase 27 | Pending |
| PRIM-06 | Phase 27 | Pending |
| TOOL-01 | Phase 26 | Pending |
| TOOL-02 | Phase 26 | Pending |
| TOOL-03 | Phase 26 | Pending |
| TOOL-04 | Phase 26 | Pending |
| TOOL-05 | Phase 26 | Pending |
| MOD1-01 | Phase 28 | Pending |
| MOD1-02 | Phase 28 | Pending |
| MOD1-03 | Phase 28 | Pending |
| MOD1-04 | Phase 28 | Pending |
| MOD2-01 | Phase 29 | Pending |
| MOD2-02 | Phase 29 | Pending |
| MOD2-03 | Phase 29 | Pending |
| MOD2-04 | Phase 29 | Pending |
| MOD3-01 | Phase 30 | Pending |
| MOD3-02 | Phase 30 | Pending |
| MOD3-03 | Phase 30 | Pending |
| MOD3-04 | Phase 30 | Pending |
| MOD4-01 | Phase 31 | Pending |
| MOD4-02 | Phase 31 | Pending |
| MOD4-03 | Phase 31 | Pending |
| MOD4-04 | Phase 31 | Pending |
| MOD5-01 | Phase 32 | Pending |
| MOD5-02 | Phase 32 | Pending |
| MOD5-03 | Phase 32 | Pending |
| MOD5-04 | Phase 32 | Pending |
| MOD6-01 | Phase 33 | Pending |
| MOD6-02 | Phase 33 | Pending |
| MOD6-03 | Phase 33 | Pending |
| MOD6-04 | Phase 33 | Pending |
| MOD7-01 | Phase 34 | Pending |
| MOD7-02 | Phase 34 | Pending |
| MOD7-03 | Phase 34 | Pending |
| MOD7-04 | Phase 34 | Pending |
| MOD8-01 | Phase 35 | Pending |
| MOD8-02 | Phase 35 | Pending |
| MOD8-03 | Phase 35 | Pending |
| MOD8-04 | Phase 35 | Pending |
| FINAL-01 | Phase 36 | Pending |
| FINAL-02 | Phase 36 | Pending |
| FINAL-03 | Phase 36 | Pending |
| FINAL-04 | Phase 36 | Pending |
| FINAL-05 | Phase 36 | Pending |

**Coverage:**
- v1.4 requirements: 49 total
- Mapped to phases: 49/49
- Unmapped: 0

### v1.3 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| UX-01a | Phase 22 | Complete |
| UX-01b | Phase 22 | Deferred |
| UX-01c | Phase 22 | Complete |
| UX-02a | Phase 23 | Complete |
| UX-02b | Phase 23 | Complete |
| UX-02c | Phase 23 | Complete |
| UX-03a | Phase 24 | Complete |
| UX-03b | Phase 24 | Complete |
| UX-03c | Phase 24 | Complete |
| UX-04a | Phase 22 | Complete |
| UX-04b | Phase 22 | Complete |
| UX-04c | Phase 24 | Complete |
| UX-04d | Phase 23 | Complete |
| UX-04e | Phase 25 | Complete |
| UX-04f | Phase 25 | Complete |

**Coverage:** 15/15 requirements (1 deferred)

### v1.2 (Complete)

**Coverage:** 7/7 requirements

### v1.1 (Complete)

**Coverage:** 20/20 requirements

---
*Requirements defined: 2026-02-02*
*Last updated: 2026-02-02 — v1.4 Interactive Glass Diagrams requirements added*
