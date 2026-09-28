@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   Telemetry Dashboard - start
echo ============================================
echo.

echo [1/3] Proveryayu Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo Docker engine ne zapushchen.
    echo Otkroy Docker Desktop, dozhdis zelenogo kita
    echo i zapusti start.bat eshe raz.
    pause
    exit /b 1
)
echo    Docker OK.
echo.

echo [2/3] Podnimayu kontejnery...
docker compose up -d
if errorlevel 1 (
    echo Oshibka compose. Poslednie logi:
    docker compose logs --tail 20
    pause
    exit /b 1
)
echo.

echo [3/3] Zhdu ClickHouse...
set /a tries=0

:wait_ping
set /a tries+=1
if %tries% gtr 30 (
    echo ClickHouse ne otvetil za 30 sekund. Logi:
    docker compose logs --tail 30 clickhouse
    pause
    exit /b 1
)
curl.exe -s http://localhost:8123/ping | findstr /C:"Ok" >nul
if errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto wait_ping
)
echo    ClickHouse otvechaet.
echo.

echo ============================================
echo   GOTOTOVO!
echo   DBeaver: localhost:8123
echo   Proverka: SELECT count() FROM trips;
echo ============================================
pause