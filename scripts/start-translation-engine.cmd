@echo off
REM Starts the local LibreTranslate engine that auto-translates admin CMS
REM content (ticker messages, announcements) into ru/tr/ar/zh.
REM
REM One-time setup (needs Python 3.10/3.11 — NOT 3.13):
REM   python -m venv D:\PATSF\lt-venv
REM   D:\PATSF\lt-venv\Scripts\python.exe -m pip install libretranslate
REM
REM The app only uses it when AUTO_TRANSLATE_URL=http://127.0.0.1:5000 is set
REM in .env. Without the engine everything still works (manual translations +
REM English fallback). Set LT_VENV to override the virtualenv location.

if "%LT_VENV%"=="" set "LT_VENV=D:\PATSF\lt-venv"
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8

"%LT_VENV%\Scripts\libretranslate.exe" --host 127.0.0.1 --port 5000 --load-only en,ru,tr,ar,zh --disable-web-ui
