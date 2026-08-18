@echo off
setlocal
REM Starts the local LibreTranslate engine that auto-translates admin CMS
REM content (ticker messages, announcements) into ru/tr/ar/zh.
REM
REM One-time setup (needs Python 3.10/3.11 -- NOT 3.13):
REM   python -m venv D:\lt-venv
REM   D:\lt-venv\Scripts\python.exe -m pip install libretranslate
REM
REM The app only uses it when AUTO_TRANSLATE_URL=http://127.0.0.1:5000 is set
REM in .env. Without the engine everything still works (manual translations +
REM English fallback). Set LT_VENV to override the virtualenv location.

REM Resolve the virtualenv: an explicit LT_VENV wins, otherwise probe the
REM known locations. The first one that actually holds libretranslate.exe is
REM used, so moving the venv no longer breaks this script.
set "LT_EXE="
if not "%LT_VENV%"=="" call :try "%LT_VENV%"
if not defined LT_EXE call :try "D:\lt-venv"
if not defined LT_EXE call :try "%~dp0..\..\lt-venv"
if not defined LT_EXE call :try "%USERPROFILE%\lt-venv"
if not defined LT_EXE call :try "D:\PATSF\lt-venv"

if not defined LT_EXE goto :missing

REM A venv only stores the ABSOLUTE path of the interpreter it was built
REM from; uninstalling that Python leaves every .exe shim in the venv dead
REM with a bare "No Python at ..." message. Catch that here instead.
for %%D in ("%LT_EXE%\..\..") do set "LT_ROOT=%%~fD"
set "LT_HOME="
if exist "%LT_ROOT%\pyvenv.cfg" (
  for /f "tokens=1,* delims== " %%A in ('findstr /b /c:"home" "%LT_ROOT%\pyvenv.cfg"') do set "LT_HOME=%%B"
)
if defined LT_HOME if not exist "%LT_HOME%\python.exe" goto :deadbase

set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8

echo Starting LibreTranslate from "%LT_EXE%"
"%LT_EXE%" --host 127.0.0.1 --port 5000 --load-only en,ru,tr,ar,zh --disable-web-ui
exit /b %ERRORLEVEL%

:try
if defined LT_EXE exit /b 0
if exist "%~1\Scripts\libretranslate.exe" set "LT_EXE=%~1\Scripts\libretranslate.exe"
exit /b 0

:deadbase
echo.
echo   The virtualenv at "%LT_ROOT%" is orphaned.
echo.
echo   It was built against  %LT_HOME%\python.exe
echo   which is no longer installed, so every command inside it fails
echo   with "No Python at ...".
echo.
echo   Its packages are compiled for that exact Python version, so the
echo   quickest fix is to reinstall it (3.10 or 3.11, NOT 3.13+) from
echo   https://www.python.org/downloads/ and, if it lands somewhere else,
echo   update the "home" and "executable" lines in:
echo     %LT_ROOT%\pyvenv.cfg
echo.
echo   Rebuilding from scratch also works but re-downloads the models:
echo     rmdir /s /q "%LT_ROOT%"
echo     python -m venv "%LT_ROOT%"
echo     "%LT_ROOT%\Scripts\python.exe" -m pip install libretranslate
echo.
exit /b 1

:missing
echo.
echo   LibreTranslate was not found.
echo.
echo   Looked in:
if not "%LT_VENV%"=="" echo     %LT_VENV%
echo     D:\lt-venv
echo     %~dp0..\..\lt-venv
echo     %USERPROFILE%\lt-venv
echo     D:\PATSF\lt-venv
echo.
echo   Create the virtualenv (Python 3.10 or 3.11, NOT 3.13):
echo     python -m venv D:\lt-venv
echo     D:\lt-venv\Scripts\python.exe -m pip install libretranslate
echo.
echo   Or point LT_VENV at an existing one, e.g.:
echo     set LT_VENV=D:\lt-venv ^&^& "%~f0"
echo.
exit /b 1
