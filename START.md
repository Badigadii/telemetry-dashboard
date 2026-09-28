# START.md — инструкция для возвращения в проект

Открыл этот файл через месяц и ничего не помнишь? Нормально. Всё здесь.

## Что это за проект
Учебный дашборд мониторинга данных: NYC Yellow Taxi 2024 (~40 млн поездок,
12 месяцев) загружены в ClickHouse. Метрики покрытия, качества и
производительности считаются SQL-запросами. Дальше по плану — API на Express
и графики на React + Highcharts.

## Что где лежит
| Путь | Что это |
|---|---|
| `start.bat` / `stop.bat` | запуск и остановка двойным кликом |
| `docker-compose.yml` | описание контейнера ClickHouse |
| `.env` | пароль ClickHouse (НЕ в Git!) |
| `etl/load_data.py` | ETL: читает parquet из `data/`, грузит в ClickHouse |
| `data/*.parquet` | сырые данные, 12 файлов (НЕ в Git) |
| `sql/` | (появится) файлы с запросами метрик |

## Доступы
- ClickHouse: `http://localhost:8123`, пользователь `default`, пароль в `.env`
- DBeaver: Host `localhost`, Port `8123`, Database `default`
- Имя контейнера: `clickhouse`

## Быстрый старт
1. Двойной клик по **start.bat**
2. Дождаться надписи GOTOTOVO
3. Открыть DBeaver → Connect

Если скрипт сказал, что Docker не запущен: открыть Docker Desktop из меню
Пуск, дождаться зелёного кита в трее, нажать любую клавишу в окне скрипта.

## Ручной старт (если bat не сработал)
```powershell
cd D:\dev\telemetry-dashboard
docker compose up -d
docker ps
curl.exe http://localhost:8123/ping   # должно вывести Ok.