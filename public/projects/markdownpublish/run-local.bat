@echo off
cd /d "%~dp0"
echo Starting MarkDownPublish at http://localhost:8080
where py >nul 2>nul
if %ERRORLEVEL%==0 (
  start "MarkDownPublish Server" /min cmd /c "cd /d \"%~dp0\" && py -m http.server 8080"
) else (
  start "MarkDownPublish Server" /min cmd /c "cd /d \"%~dp0\" && python -m http.server 8080"
)
timeout /t 1 /nobreak >nul
start "" http://localhost:8080
