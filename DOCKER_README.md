# Docker 部署指南

本项目支持使用 Docker 将前后端部署在同一个容器中，并通过本地 `.env` 文件传递环境变量。

## 构建和运行

### 构建镜像
```bash
docker build -t ai-chat-app .
```

### 运行容器
```bash
# 使用本地 .env 文件
docker run -p 8000:8000 -p 3000:3000 -v $(pwd)/.env:/app/.env ai-chat-app
```

或者如果您想使用不同的环境变量文件：
```bash
docker run -p 8000:8000 -p 3000:3000 -v /path/to/your/env.file:/app/.env ai-chat-app
```

## Dockerfile 特性

- 使用 Node.js v23.11.0-alpine
- 多阶段构建优化镜像大小
- 前后端代码在同一个容器中运行
- 前端静态文件由后端 Express 服务器提供
- 使用非 root 用户提高安全性
- 支持通过挂载卷传递环境变量
- 使用 Yarn 4.9.2 进行依赖管理
- 使用 Yarn Workspaces 管理前后端依赖
- 使用 `--immutable` 标志确保依赖一致性

## 环境变量

容器内的环境变量从挂载的 `.env` 文件加载，该文件应包含以下变量：

```
# Server configuration
PORT=8000

ALIYUN_AI_APP_ID=your-app-id
ALIYUN_AI_API_URL=your-api-url
ALIYUN_API_KEY=your-api-key

JWT_SECRET=your-jwt-secret

TEST_USER_EMAIL=your-email
TEST_USER_NAME=your-name
TEST_USER_PASSWORD=your-password
```

## 目录结构说明

- `frontend/dist/` - 前端构建产物，由后端提供静态文件
- `backend/dist/` - 后端编译代码
- `backend/.env` - 环境变量文件（由宿主机挂载）

## 注意事项

1. 确保在运行容器前已经构建了前端和后端代码
2. 环境变量文件必须包含所有必需的配置项
3. 容器默认监听 8000 端口
4. 建议使用非 root 用户运行容器以提高安全性
5. 项目使用 Yarn 4.9.2 进行依赖管理，Dockerfile 已配置相应环境
6. 使用 `--immutable` 标志确保依赖安装的一致性，避免锁文件被修改
7. 项目使用 Yarn Workspaces 管理前后端依赖，Dockerfile 已正确配置工作区
