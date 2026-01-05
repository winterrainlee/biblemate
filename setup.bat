@echo off
title BibleMate Setup
echo ========================================
echo       BibleMate 초기 설정을 시작합니다
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 메인 패키지 설치 중...
call npm.cmd install
echo.

echo [2/3] 클라이언트 패키지 설치 중...
cd client
call npm.cmd install
cd ..
echo.

echo [3/3] 성경 데이터베이스 생성 중...
call npm.cmd run import-bible
echo.

echo ========================================
echo       모든 설정이 완료되었습니다! ✨
echo ========================================
echo.
echo 이제 'start-biblemate.bat' 파일을 실행하여
echo 서버를 시작할 수 있습니다.
echo.
pause
