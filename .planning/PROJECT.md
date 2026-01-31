# Debezium Course

## What This Is

Интерактивный веб-курс по Debezium для middle+ дата-инженеров. Глубокое погружение в Change Data Capture с фокусом на реальные интеграции (Aurora DB, PostgreSQL, GCP) и их подводные камни. Статический сайт без бэкенда с интерактивным роадмапом и практической лабораторией на Docker.

## Core Value

Инженер после прохождения курса может самостоятельно проектировать и реализовывать production-ready CDC-пайплайны на Debezium с пониманием всех критических нюансов интеграций.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Подробный контент для middle+ уровня с глубоким разбором тем
- [ ] Чёткое разделение на топики в меню навигации
- [ ] Интерактивный роадмап (навигация по модулям + трекинг прогресса)
- [ ] Прогресс сохраняется в localStorage
- [ ] Docker Compose окружение для практики (ARM64, macOS M-series)
- [ ] Интеграция с PostgreSQL — настройка, подводные камни
- [ ] Интеграция с Aurora DB — специфика, ограничения, workarounds
- [ ] Интеграция с GCP — Pub/Sub, Cloud SQL, особенности
- [ ] Python: Kafka consumers/producers для чтения CDC-событий
- [ ] Python: обработка данных (Pandas, трансформации)
- [ ] Python: потоковая обработка (PyFlink / PySpark)
- [ ] Python: скрипты автоматизации (управление коннекторами, мониторинг)
- [ ] Деплой как статический сайт (GitHub Pages / Vercel)

### Out of Scope

- Backend/API — курс полностью статический
- Авторизация/аккаунты пользователей — прогресс только в localStorage
- Платный контент/подписки — курс бесплатный и открытый
- Мобильное приложение — только веб

## Context

**Целевая аудитория:** Middle+ дата-инженеры, которые уже работают с данными и хотят освоить CDC через Debezium на production-уровне.

**Формат обучения:**
- Теория с глубоким погружением в архитектуру и внутренности
- Практические задания в локальном Docker-окружении
- Реальные сценарии и подводные камни из production

**Инструменты в курсе:**
- Debezium (core)
- Apache Kafka
- PostgreSQL, Aurora DB, GCP Cloud SQL
- Python (confluent-kafka, pandas, pyflink/pyspark)
- Docker Compose

**Локализация:** Русский язык

## Constraints

- **Platform**: macOS M-series (ARM64) — Docker образы должны поддерживать ARM64
- **No Backend**: Весь функционал через статику и localStorage
- **Tech Stack (web)**: TBD — определится на этапе research
- **Tech Stack (course content)**: Python для всех практических примеров

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Статический сайт без бэкенда | Простота деплоя, нет инфраструктурных затрат | — Pending |
| Прогресс в localStorage | Достаточно для персонального курса без аккаунтов | — Pending |
| Docker Compose для практики | Универсальный, работает локально, не требует облака | — Pending |
| Python как основной язык примеров | Стандарт для дата-инженеров, богатая экосистема | — Pending |
| ARM64 как целевая платформа | Большинство современных Mac на M-series | — Pending |

---
*Last updated: 2026-01-31 after initialization*
