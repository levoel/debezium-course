# Debezium Course

## What This Is

Интерактивный веб-курс по Debezium для middle+ дата-инженеров. Глубокое погружение в Change Data Capture с фокусом на реальные интеграции (Aurora DB, PostgreSQL, GCP) и их подводные камни. Статический сайт с интерактивным роадмапом, практической лабораторией на Docker, и 7 модулями от основ до production-ready capstone проекта.

## Core Value

Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций.

## Current State

**Version:** v1.0 (shipped 2026-02-01)
**Codebase:** 59 source files, 24,273 LOC (TypeScript, MDX, Astro)
**Content:** 7 modules, 42+ lessons, 200+ code examples
**Lab:** Docker Compose with PostgreSQL, Kafka KRaft, Debezium 2.5.x, Prometheus/Grafana

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
- ✓ Complete CDC curriculum (Modules 1-6 + Capstone) — v1.0

### Active

- [ ] GitHub Pages / Vercel deployment (PLAT-07 deferred)
- [ ] Search functionality across lessons
- [ ] Dark/light theme toggle
- [ ] Export/import progress

### Out of Scope

- Backend/API — курс полностью статический
- Авторизация/аккаунты пользователей — прогресс только в localStorage
- Платный контент/подписки — курс бесплатный и открытый
- Мобильное приложение — только веб
- Oracle/SQL Server коннекторы — фокус на PostgreSQL/Aurora
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

---
*Last updated: 2026-02-01 after v1.0 milestone*
