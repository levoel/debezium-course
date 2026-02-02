# Debezium Course

## What This Is

Интерактивный веб-курс по Debezium для middle+ дата-инженеров. Глубокое погружение в Change Data Capture с фокусом на реальные интеграции (Aurora DB, PostgreSQL, GCP) и их подводные камни. Статический сайт с интерактивным роадмапом, практической лабораторией на Docker, и 7 модулями от основ до production-ready capstone проекта.

## Core Value

Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций.

## Current State

**Version:** v1.3 (shipped 2026-02-02)
**Live:** https://levoel.github.io/debezium-course/
**Codebase:** 74 source files, 35,000+ LOC (TypeScript, MDX, Astro)
**Content:** 8 modules, 57+ lessons, 400+ code examples, 170 Mermaid diagrams
**Lab:** Docker Compose with PostgreSQL, MySQL, Kafka KRaft, Debezium 2.5.x, Prometheus/Grafana

## Completed Milestones

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

## Current Milestone: v1.4 Interactive Glass Diagrams

**Goal:** Заменить все 170 Mermaid диаграмм на интерактивные React компоненты в стиле liquid glass

**Scope:**
- Создать библиотеку переиспользуемых diagram primitives (FlowNode, Arrow, ModeCard, etc.)
- Заменить все Mermaid flowcharts на glass-styled компоненты
- Добавить tooltip'ы при клике на ноды с пояснениями
- Сохранить мобильную адаптивность и accessibility

**Phases:** 26+

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

### Active

**v1.4 Scope:**
- [ ] DIAG-01: Diagram primitives library (FlowNode, Arrow, Container components)
- [ ] DIAG-02: Tooltip system for node explanations
- [ ] DIAG-03: Replace Module 1 Mermaid diagrams with glass components
- [ ] DIAG-04: Replace Module 2 Mermaid diagrams
- [ ] DIAG-05: Replace Module 3 Mermaid diagrams
- [ ] DIAG-06: Replace Module 4 Mermaid diagrams
- [ ] DIAG-07: Replace Module 5 Mermaid diagrams
- [ ] DIAG-08: Replace Module 6 Mermaid diagrams
- [ ] DIAG-09: Replace Module 7 Mermaid diagrams
- [ ] DIAG-10: Replace Module 8 Mermaid diagrams

**Deferred:**
- [ ] PLAT-09: Search functionality across lessons
- [ ] PLAT-10: Dark/light theme toggle
- [ ] PLAT-11: Export/import progress
- [ ] CONT-01: MongoDB change streams module

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
*Last updated: 2026-02-02 — v1.4 Interactive Glass Diagrams milestone started*
