@echo off
chcp 65001 >nul
title 启动 Polarsky's Blog
color 0A

echo.
echo ========================================
echo        Polarsky's Blog 启动工具
echo ========================================
echo.

echo 正在检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Python
    echo.
    echo 请安装Python并添加到PATH环境变量
    echo 下载地址: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✅ Python环境检查通过
echo.

echo 正在启动HTTP服务器...
echo 📁 目录: %CD%
echo 🌐 博客地址: http://localhost:8000
echo 🔧 路径测试: http://localhost:8000/path-test.html
echo.
echo ⚠️  请保持此窗口打开
echo 💡 按 Ctrl+C 停止服务器
echo.

start http://localhost:8000

python -m http.server 8000

echo.
echo 服务器已停止
pause
