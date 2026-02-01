# Debezium Course

## What This Is

Интерактивный веб-курс по Debezium для middle+ дата-инженеров. Глубокое погружение в Change Data Capture с фокусом на реальные интеграции (Aurora DB, PostgreSQL, GCP) и их подводные камни. Статический сайт с интерактивным роадмапом, практической лабораторией на Docker, и 7 модулями от основ до production-ready capstone проекта.

## Core Value

Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций.

## Current State

**Version:** v1.1 (shipped 2026-02-01)
**Live:** https://levoel.github.io/debezium-course/
**Codebase:** 74 source files, 35,000+ LOC (TypeScript, MDX, Astro)
**Content:** 8 modules, 57+ lessons, 400+ code examples
**Lab:** Docker Compose with PostgreSQL, MySQL, Kafka KRaft, Debezium 2.5.x, Prometheus/Grafana

## Completed Milestones

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

## Current Milestone: v1.2 Course Reorganization

**Goal:** Move Module 8 (MySQL) to position 3, creating "Database Track" for better PostgreSQL/MySQL comparison

**Scope:**
- Module directory renaming (08→03, 03-07→04-08)
- Navigation and sidebar updates
- Cross-reference link updates
- Progress tracking key updates

**Phases:** 19-21

## Future Milestone: v1.3

**Potential features:**
- Search functionality across lessons
- Dark/light theme toggle
- Export/import progress

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

### Active

**v1.2 Scope (tentative):**
- [ ] STRUCT-01: Course structure reorganization (MySQL closer to PostgreSQL)
- [ ] PLAT-09: Search functionality across lessons
- [ ] PLAT-10: Dark/light theme toggle

**Deferred:**
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
*Last updated: 2026-02-01 — v1.1 milestone complete*
