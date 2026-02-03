# Debezium Course

## What This Is

Интерактивный веб-курс по Debezium для middle+ дата-инженеров. Глубокое погружение в Change Data Capture с фокусом на реальные интеграции (Aurora DB, PostgreSQL, GCP) и их подводные камни. Статический сайт с интерактивным роадмапом, практической лабораторией на Docker, и 7 модулями от основ до production-ready capstone проекта.

## Core Value

Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций.

## Current State

**Version:** v1.7 (shipped 2026-02-03)
**Live:** https://levoel.github.io/debezium-course/
**Codebase:** 160+ source files, 67,000+ LOC (TypeScript, MDX, Astro, React)
**Content:** 9 modules, 65+ lessons, 27 glossary terms, 20 troubleshooting entries, 170 diagrams
**Lab:** Docker Compose with PostgreSQL, MySQL, Kafka KRaft, Debezium 2.5.x, Prometheus/Grafana
**Bundle:** 1.0MB JavaScript (72% reduction from 3.6MB after Mermaid removal)

## Completed Milestones

### v1.7 Glossary & Troubleshooting (shipped 2026-02-03)

**Delivered:**
- Glossary page with 27 CDC terms across 5 categories (PostgreSQL, MySQL, Kafka, Debezium, General)
- Each term: definition + code example + related lesson links
- Troubleshooting page with 20 common errors
- Filters by connector (PostgreSQL/MySQL) and category (connection/snapshot/streaming/configuration)
- Expandable error cards with symptoms, cause, solution
- Sidebar navigation to both pages
- Full Pagefind search integration

### v1.6 Full-Text Search (shipped 2026-02-03)

**Delivered:**
- Pagefind search index (1.5MB) covering 65+ lessons with Russian morphology
- SearchModal with Cmd+K/Ctrl+K keyboard shortcut and 200ms debounce
- SearchButton for click access (Brave browser compatibility)
- Glass design integration with yellow highlighting
- Module 0 documentation updated with search instructions

### v1.5 Onboarding & Polish (shipped 2026-02-03)

**Delivered:**
- Module 0 "Как пользоваться" with 4 onboarding lessons (navigation, progress, lab, structure)
- GitHub repository link in header with glass hover effect
- 8 module summary mini-lessons with glass-card styling
- Standardized "Что дальше?" sections linking modules together

### v1.4 Interactive Glass Diagrams (shipped 2026-02-03)

**Delivered:**
- Primitives library: FlowNode, Arrow, DiagramContainer, DiagramTooltip, SequenceActor, SequenceLifeline, SequenceMessage, SequenceDiagram
- 170 interactive glass diagram components across all 8 modules
- 2.6MB JavaScript bundle reduction (72%) - Mermaid removed
- Full keyboard accessibility with Radix tooltips (Tab, Enter/Space, Escape)
- Mobile-responsive layouts verified at 390x844 viewport
- Russian-language tooltips with contextual explanations

### v1.3 UX/Design Refresh (shipped 2026-02-02)

**Delivered:**
- Liquid glass design system (CSS variables, gradient backgrounds, glass utilities)
- Descriptive module names instead of "Module N"
- Homepage with accordion menu and module progress indicators
- Glass-styled tables, callouts, sidebar, and cards
- Responsive blur reduction for mobile performance
- Accessibility fallbacks (prefers-reduced-transparency, prefers-reduced-motion)

### v1.2 Course Reorganization (shipped 2026-02-01)

**Delivered:**
- MySQL module moved to position 3 (Database Track with PostgreSQL)
- Cross-reference updates across all lessons
- Progress migration for existing users
- Playwright E2E test suite

### v1.1 MySQL/Aurora MySQL + Deployment (shipped 2026-02-01)

**Delivered:**
- MySQL binlog deep-dive (binary log formats, GTID mode, server configuration)
- Aurora MySQL specifics (parameter groups, Enhanced Binlog, limitations)
- MySQL connector production operations (monitoring, failover, snapshots)
- Multi-database capstone (PostgreSQL + MySQL unified pipeline)
- GitHub Pages deployment with CI/CD

### v1.0 MVP (shipped 2026-02-01)

- Complete CDC curriculum (Modules 1-7)
- Interactive roadmap and progress tracking
- Docker Compose lab environment (ARM64)

## Next Milestone Goals

**v1.8+ candidates:**
- Dark/light theme toggle
- Search enhancements (scope filtering, recent searches)
- Export/import progress
- MongoDB change streams module

## Requirements

### Validated

- ✓ Interactive roadmap with module visualization — v1.0
- ✓ Clickable roadmap navigation — v1.0
- ✓ Progress persistence in localStorage — v1.0
- ✓ Module/topic menu navigation — v1.0
- ✓ Syntax highlighting (Python, YAML, SQL, JSON) — v1.0
- ✓ Mermaid diagram rendering — v1.0
- ✓ Mobile responsive design — v1.0
- ✓ Docker Compose lab environment (ARM64) — v1.0
- ✓ Complete CDC curriculum (Modules 1-7 + Capstone) — v1.0
- ✓ MySQL/Aurora MySQL comprehensive module (15 lessons) — v1.1
- ✓ Multi-database capstone extension — v1.1
- ✓ GitHub Pages deployment with CI/CD — v1.1
- ✓ Course reorganization (MySQL = Module 3) — v1.2
- ✓ Progress migration for structure changes — v1.2
- ✓ E2E test suite (Playwright) — v1.2
- ✓ Liquid glass design system — v1.3
- ✓ Descriptive module names — v1.3
- ✓ Homepage accordion menu — v1.3
- ✓ Glass-styled tables and callouts — v1.3
- ✓ Accessibility fallbacks — v1.3
- ✓ Diagram primitives library (FlowNode, Arrow, Container, Tooltip) — v1.4
- ✓ Sequence diagram primitives (Actor, Lifeline, Message, Layout) — v1.4
- ✓ 170 interactive glass diagrams across 8 modules — v1.4
- ✓ 2.6MB bundle reduction (Mermaid removed) — v1.4
- ✓ Keyboard accessibility (Tab, Enter/Space, Escape) — v1.4
- ✓ Mobile responsiveness verified (390x844) — v1.4
- ✓ Module 0 platform guide (4 onboarding lessons) — v1.5
- ✓ GitHub repository link in header — v1.5
- ✓ Module summary mini-lessons (8 modules) — v1.5
- ✓ Glass styling for module summaries — v1.5
- ✓ Cmd+K / Ctrl+K search modal — v1.6
- ✓ Pagefind search indexing with Russian morphology — v1.6
- ✓ Keyboard navigation through search results — v1.6
- ✓ Glass design integration for search — v1.6
- ✓ Search usage documentation in Module 0 — v1.6
- ✓ Glossary page with 27 CDC terms — v1.7
- ✓ Term entries with definition, example, lesson links — v1.7
- ✓ Category-based navigation (5 categories) — v1.7
- ✓ Pagefind indexing for glossary terms — v1.7
- ✓ Troubleshooting page with 20 errors — v1.7
- ✓ Error entries with symptoms, cause, solution — v1.7
- ✓ Category filters (connector, error type) — v1.7
- ✓ Related lessons links for each error — v1.7
- ✓ Pagefind indexing for error messages — v1.7
- ✓ Sidebar navigation to glossary and troubleshooting — v1.7

### Future

**Candidates for v1.8+:**
- PLAT-10: Dark/light theme toggle
- PLAT-11: Export/import progress
- SRCH-F01: Search scope filtering
- SRCH-F02: Recent searches history
- CONT-01: MongoDB change streams module

### Out of Scope

- Backend/API — курс полностью статический
- Авторизация/аккаунты пользователей — прогресс только в localStorage
- Платный контент/подписки — курс бесплатный и открытый
- Мобильное приложение — только веб
- Oracle/SQL Server коннекторы — фокус на PostgreSQL/MySQL/Aurora
- MongoDB connector — different paradigm, defer to v2+
- Custom connector development — слишком продвинутая тема

## Context

**Целевая аудитория:** Middle+ дата-инженеры, которые уже работают с данными и хотят освоить CDC через Debezium на production-уровне.

**Формат обучения:**
- Теория с глубоким погружением в архитектуру и внутренности
- Практические задания в локальном Docker-окружении
- Реальные сценарии и подводные камни из production

**Tech Stack:**
- Astro 5, React 19, Tailwind CSS 4
- MDX with Shiki syntax highlighting
- nanostores for state management
- Docker Compose for lab infrastructure

**Локализация:** Русский язык (Russian text, English code/config)

## Constraints

- **Platform**: macOS M-series (ARM64) — Docker образы должны поддерживать ARM64
- **No Backend**: Весь функционал через статику и localStorage
- **Tech Stack (web)**: Astro 5, React 19, Tailwind CSS 4
- **Tech Stack (course content)**: Python для всех практических примеров

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Astro 5 for static site | Modern SSG with React islands | ✓ Good |
| nanostores for state | Cross-island state sharing | ✓ Good |
| Debezium 2.5.x (not 3.x) | Java 21 ARM64 compatibility | ✓ Good |
| Confluent Kafka 7.8.1 | ARM64 native support | ✓ Good |
| Russian text / English code | Target audience + code portability | ✓ Good |
| BACKWARD Schema Registry | Easier consumer upgrades | ✓ Good |
| Groovy for Filter SMT | Most documented approach | ✓ Good |
| MySQL 8.0.40 | Stable, ARM64 compatible, binlog features complete | ✓ Good |
| Port 3307 for MySQL | Avoids host conflicts with local MySQL | ✓ Good |
| server.id range 184000-184999 | Debezium convention, avoids cluster conflicts | ✓ Good |
| withastro/action@v5 | Official Astro action for GitHub Pages | ✓ Good |

---
*Last updated: 2026-02-03 after v1.7 milestone shipped*
