@echo off
title BibleMate Server
echo BibleMate 서버를 시작합니다...
echo.

:: 현재 배치 파일이 있는 디렉토리로 이동
cd /d "%~dp0"

:: npm run dev 실행
echo 서버를 시작하는 중입니다... (잠시만 기다려주세요)
echo.
echo [접속 방법 안내]
echo 1. 이 PC에서 접속: http://localhost:5173
echo 2. 모바일/태블릿 접속: 아래 IP 주소를 확인하세요 (예: http://192.168.0.X:5173)
echo.
echo [현재 PC의 IP 주소]
ipconfig | findstr "IPv4"
echo.
echo ========================================================
echo  서버가 켜지면 브라우저 창이 자동으로 열리지 않을 수 있습니다.
echo  위 주소를 복사해서 브라우저에 입력해 주세요.
echo ========================================================
echo.

call npm.cmd run dev

:: 서버가 종료되면 창이 닫히지 않도록 대기
pause
