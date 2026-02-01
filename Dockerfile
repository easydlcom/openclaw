# --- 第一阶段：构建 OpenClaw 核心 (完全遵循原版构建逻辑) ---
FROM node:22-bookworm AS builder

# 安装 Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"
RUN corepack enable

WORKDIR /app

# 复制依赖定义
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ui/package.json ./ui/package.json
COPY patches ./patches
COPY scripts ./scripts

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码并编译
COPY . .
RUN OPENCLAW_A2UI_SKIP_MISSING=1 pnpm build
ENV OPENCLAW_PREFER_PNPM=1
RUN pnpm ui:build

# --- 第二阶段：运行时环境 (为了 SaaS 稳定性加入包装层) ---
FROM node:22-bookworm
ENV NODE_ENV=production
WORKDIR /app

# 1. 准备包装层环境
# 注意：确保你的仓库里有 wrapper/package.json (包含 express, http-proxy, tar)
COPY wrapper/package.json ./
RUN npm install --omit=dev && npm cache clean --force

# 2. 从构建阶段拷贝产物
# 映射路径：将编译好的 /app 映射到 wrapper 期待的 /openclaw
COPY --from=builder /app /openclaw

# 3. 拷贝包装层源码和你的脚本
COPY wrapper/server.js ./src/server.js
COPY wrapper/src/setup-app.js ./src/setup-app.js
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 4. 提供 CLI 快捷方式 (修改路径为 /openclaw/dist/index.js)
RUN printf '%s\n' '#!/usr/bin/env bash' 'exec node /openclaw/dist/index.js "$@"' > /usr/local/bin/openclaw \
  && chmod +x /usr/local/bin/openclaw

# 5. 环境变量与端口
# 包装层 server.js 默认监听 8080
ENV PORT=8080
EXPOSE 8080

# 权限处理：由于我们要写 /data 目录，先保持 root 运行 entrypoint 脚本
# 脚本最后会启动 server.js
ENTRYPOINT ["/entrypoint.sh"]