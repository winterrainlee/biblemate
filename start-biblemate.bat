@echo off
title BibleMate Server
echo BibleMate 서버를 시작합니다...
echo.

:: 현재 배치 파일이 있는 디렉토리로 이동
cd /d "%~dp0"

:: npm run dev 실행
call npm.cmd run dev

:: 서버가 종료되면 창이 닫히지 않도록 대기
pause
