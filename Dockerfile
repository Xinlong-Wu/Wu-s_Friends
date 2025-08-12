# 多阶段构建 Dockerfile
# 第一阶段：构建前端和后端
FROM node:23.11.0-alpine AS builder

# 安装 yarn 2+
RUN corepack enable

# 设置工作目录
WORKDIR /app

# 复制 package 文件、工作区配置和 yarn 配置
COPY package.json yarn.lock* .yarnrc.yml* ./

# 复制 yarn 发行版文件
COPY .yarn/releases/* ./.yarn/releases/

# 复制工作区目录结构
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json

# 安装所有工作区依赖
RUN yarn workspaces foreach -A install --immutable

# 复制源代码
COPY . .

# 构建所有工作区
RUN yarn workspaces foreach -A run build

# 第二阶段：运行时环境
FROM node:23.11.0-alpine AS runtime

# 安装 yarn 2+
RUN corepack enable

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 设置工作目录
WORKDIR /app

# 复制构建结果和依赖
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.yarnrc.yml* ./ 
COPY --from=builder /app/.yarn/releases/* ./.yarn/releases/
COPY --from=builder /app/frontend/package.json ./frontend/package.json
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/start.sh ./start.sh

# 给启动脚本执行权限
RUN chmod +x ./start.sh

# 更改文件所有者
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 8000
EXPOSE 3000

# 启动命令
CMD ["./start.sh"]
