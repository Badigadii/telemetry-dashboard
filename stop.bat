@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Ostanavlivayu ClickHouse...
docker compose stop
echo Osvobozhdayu pamyat WSL...
wsl --shutdown
echo Gotovo. Okno mozhno zakryt.
pause