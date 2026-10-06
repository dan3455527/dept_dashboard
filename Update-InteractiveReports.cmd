@echo off
setlocal
set "PROJECT_ROOT=%~dp0"
powershell.exe -NoProfile -File "%PROJECT_ROOT%Tools\Enhance-ExcelHtmlReports.ps1" -ReportsRoot "%PROJECT_ROOT%reports"
if errorlevel 1 (
  echo.
  echo The report update did not complete. Check that the reports folder exists.
  pause
  exit /b 1
)
echo.
pause
