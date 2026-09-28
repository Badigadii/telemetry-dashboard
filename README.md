# Telemetry Dashboard

Учебный проект мониторинга данных на стеке ClickHouse + Python + Express + React.

## Стек

- **ClickHouse** — колоночная БД для аналитики
- **Python (pandas)** — ETL-конвейер
- **Docker** — контейнеризация
- **DBeaver** — SQL-клиент

## Данные

NYC Yellow Taxi 2024 (~40 млн поездок, 12 месяцев).

Источник: https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page

## Метрики (план)

- **Покрытие данными** — минуты с данными vs ожидаемые
- **Качество данных** — доля аномалий (0 пассажиров, нулевая дистанция)
- **Производительность** — p95/p99 длительности поездок

## Запуск

См. [START.md](START.md)