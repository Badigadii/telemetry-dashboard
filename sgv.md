Архитектура
[браузер :5173]  --/api-->  [backend :3001]  --SQL-->  [clickhouse :8123] React + Recharts           Express                 база, 41.15 млн строк
Сервис	Порт	Что это
frontend	5173	React-страница с графиками (Vite)
backend	3001	Express, «официант»: берёт SQL-результаты, отдаёт JSON
clickhouse	8123 (HTTP) / 9000 (native)	база данных
Правило адресов: из Windows всегда localhost, из контейнеров — имена сервисов(http://clickhouse:8123, http://backend:3001). Это разные сети, не перепутывать.

Ежедневный цикл
Действие	Команда
Запустить всё	start.bat (или docker compose up -d)
Остановить всё	stop.bat (или docker compose stop)
Проверить, кто жив	docker compose ps
Логи сервиса (поток)	docker compose logs -f backend (выход — Ctrl+C)
start.bat проверяет Docker, поднимает контейнеры, ждёт ответа базы (/ping)
stop.bat останавливает контейнеры и глушит WSL (освобождает память)
docker compose stop — контейнеры остаются, данные на месте
docker compose down — контейнеры удаляются, данные на месте (в volume ch_data)
docker compose down -v — УДАЛЯЕТ БАЗУ. Никогда без крайней нужды
ГЛАВНОЕ ПРАВИЛО РАЗРАБОТКИ (Windows + Docker)
Поменял код backend  →  docker compose restart backendПоменял код frontend →  обычно подхватится само; не подхватилось — restart frontendПоменял compose.yml  →  docker compose up -d
Hot-reload через watch на Windows ненадёжен (файловые события не пробрасываются в контейнер).Сервер знает только то, что прочитал при старте. 2 секунды рестарта экономят час отладки.

Адреса для проверки (браузер / curl.exe)
URL	Ожидание
http://localhost:5173	дашборд с графиком
http://localhost:3001/api/health	{"ok":true}
http://localhost:3001/api/coverage	12 строк по месяцам
http://localhost:3001/api/quality	объект: аномалии
http://localhost:8123/ping	Ok.
Браузер может кэшировать — проверяй через curl.exe (не кэширует):

curl.exe -s http://localhost:3001/api/coverage
Запрос к базе напрямую, мимо backend (для проверки SQL)
curl.exe -s "http://localhost:8123/" -u 'default:ПАРОЛЬ_из_.env' -d "SELECT ... FORMAT JSONEachRow"
FORMAT JSONEachRow — база сама превращает таблицу в JSON (одна строка таблицы = один объект)
то же самое умеет DBeaver (localhost:8123, user default) и Play UI: http://localhost:8123/play
Контрольные SQL (санити данных)
SELECT count(), min(ts), max(ts) FROM trips;          -- 41 155 796, весь 2024 годSELECT toYYYYMM(ts) AS month, count() AS tripsFROM trips GROUP BY month ORDER BY month;             -- 12 строк, 2.9–3.9 млн
Данные в UTC → час NYC: toHour(ts, 'America/New_York').

Как добавить новый график (паттерн, всегда одинаковый)
SQL в DBeaver — крути, пока результат не станет «массивом для графика»(много строк = график; одна строка = KPI-карточки)
Эндпоинт: копия блока app.get в backend/src/index.js, поменять путь и SQL.Алиасы в SQL (AS month, AS trips) = ключи будущего JSON = dataKey графика
docker compose restart backend (правило выше!)
Проверка в браузере/curl — JSON пришёл? Эндпоинт готов.
React: fetch('/api/...') → setData(...) → dataKey в компоненте Recharts
Структура репозитория
telemetry-dashboard/├── docker-compose.yml    # описание всех контейнеров — единственный источник правды├── .env                  # CLICKHOUSE_PASSWORD (в git НЕ попадает)├── start.bat / stop.bat  # запуск/остановка├── etl/load_data.py      # загрузка 12 parquet в базу├── data/                 # сырые parquet (в git НЕ попадают, перегенерируются)├── backend/              # Express + @clickhouse/client│   ├── package.json      # список зависимостей (пишет человек)│   ├── package-lock.json # точные версии (пишет npm, коммитим)│   └── src/index.js      # все эндпоинты здесь└── frontend/             # React + Vite + Recharts    ├── vite.config.js    # proxy /api → backend, host, polling    └── src/App.jsx       # страница с графиками
В git не едут (см. .gitignore): data/, .env, node_modules/.

Развернуть с нуля (новый компьютер / утеря данных)
1. git clone https://github.com/Badigadii/telemetry-dashboard.git2. создать .env:  CLICKHOUSE_PASSWORD=...3. start.bat4. python etl/load_data.py          # качает 12 parquet (~600 МБ) и грузит в базу5. чистка (см. ниже)                # 41 169 636 → 41 155 7966. проверка: count() = 41 155 796
Чистка (каждый запрос отдельно, по порядку):

CREATE TABLE trips_clean AS trips;INSERT INTO trips_clean SELECT * FROM tripsWHERE ts >= '2024-01-01' AND ts < '2025-01-01'  AND dropoff_ts > ts  AND dateDiff('hour', ts, dropoff_ts) <= 24;SELECT count() FROM trips_clean;      -- проверить число, потом:DROP TABLE trips;                     -- если trips_raw уже переименованRENAME TABLE trips_clean TO trips;
Проблемы и решения (проверено на практике)
Симптом	Причина	Решение
DBeaver: 08000 Query request failed	контейнер лежит	docker ps -a, потом start.bat
контейнер Exited (137)	убит по памяти	Docker Desktop Settings → Resources → Memory ≥ 4GB; или .wslconfig
Cannot GET /api/...	сервер жив, но маршрута нет / старый код	проверь имя пути; docker compose restart backend
браузер ERR_CONNECTION_REFUSED	контейнер не поднят / порт занят	docker compose ps, docker compose logs -f ...
vite: Failed to load url /src/main.jsx	файлы не в той папке	src/ внутри frontend/; проверить docker compose exec frontend ls /app/src
Code: 516 Authentication failed	не тот пользователь/пароль	креды: user default, пароль из .env
{"error":"internal"}	упал SQL в эндпоинте	docker compose logs backend — причина напечатана там
страница вечно «Загрузка...»	backend не отвечает	docker compose logs backend
логи vite: proxy error ECONNREFUSED	backend лежит или имя сервиса не совпало	docker compose restart backend, сверить имена в compose
поменял код — ничего не произошло	watch не сработал (Windows)	docker compose restart backend / restart frontend
vmmem съел память	WSL без лимита	.wslconfig: [wsl2] memory=6GB → wsl --shutdown
Git — обычный цикл
git add -Agit commit -m "что сделал"git push
Коммитить после каждого рабочего шага. Токен в URL remote не зашивать(пользоваться gh auth login / Credential Manager).

Три примечания:

Числа в шпаргалке твои реальные (41 155 796) — это контрольная точка: если когда-нибудь сомневаешься в базе, одна команда вернёт уверенность.
Блок про чистку я адаптировал под твоё текущее состояние (trips_raw уже существует) — старую версию с RENAME можно забыть.
Когда дорастёшь до .bat-независимости, команды из шпаргалки работают и на Linux/Mac — то есть переносимость, ради которой всё затевалось, уже в файле.