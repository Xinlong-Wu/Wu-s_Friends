#!/bin/sh

# 设置环境变量文件路径
ENV_FILE="/app/.env"

# 如果环境变量文件存在，则复制到后端目录
if [ -f "$ENV_FILE" ]; then
    echo "Copying environment file to backend directory..."
    cp "$ENV_FILE" /app/backend/.env
fi

# 启动后端服务
echo "Starting backend server..."
cd /app/backend
exec node dist/index.js
