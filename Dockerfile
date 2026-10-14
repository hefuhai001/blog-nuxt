# ---- 构建阶段 ----
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# 国内镜像：corepack 下载 pnpm 二进制、pnpm/npm 拉取依赖统一走 npmmirror，
# 避免访问 registry.npmjs.org 缓慢（可用 --build-arg NPM_REGISTRY=... 覆盖）
ARG NPM_REGISTRY=https://registry.npmmirror.com
ENV COREPACK_NPM_REGISTRY=${NPM_REGISTRY}
ENV npm_config_registry=${NPM_REGISTRY}

# 启用 pnpm（corepack 按 package.json 的 packageManager 自动匹配版本）
RUN corepack enable

# 先复制依赖清单，利用 Docker 层缓存；再挂载 pnpm store 缓存，
# 锁文件不变时依赖层直接命中，锁文件微变时也只需增量下载
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# 复制源码并构建 Nuxt/Nitro 产物到 .output/
COPY . .
RUN pnpm build

# 移除非生产依赖（devDependencies），只给运行阶段保留最小 node_modules。
# --ignore-scripts：prune 会重跑根项目 postinstall(nuxt prepare) 导致失败，故跳过脚本。
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm prune --prod --ignore-scripts

# ---- 运行阶段 ----
# 避免在运行镜像重复编译并省去编译工具链
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
# 内容数据库改用本地 MySQL（db_blog_nuxt）。容器内如走宿主机 MySQL，
# 可把 host 指到 host.docker.internal 或自定义网络里的服务名。
# 需要时通过 docker run / compose 注入以下环境变量覆盖 nuxt.config 默认值：
#   NUXT_DB_HOST / NUXT_DB_PORT / NUXT_DB_USER / NUXT_DB_PASSWORD / NUXT_DB_DATABASE

# 拷贝 Nuxt/Nitro 构建产物
COPY --from=builder /app/.output ./.output

# gosu（Debian 下 su-exec 的等价物）：供入口脚本以 root 降权到 node 用户运行
# 使用国内 Debian 镜像源（阿里云），加速 apt 下载
RUN set -eux; \
    if [ -f /etc/apt/sources.list.d/debian.sources ]; then \
        sed -i 's|deb.debian.org|mirrors.aliyun.com|g' /etc/apt/sources.list.d/debian.sources; \
    fi; \
    if [ -f /etc/apt/sources.list ]; then \
        sed -i 's|deb.debian.org|mirrors.aliyun.com|g; s|security.debian.org|mirrors.aliyun.com|g' /etc/apt/sources.list; \
    fi; \
    apt-get update; \
    apt-get install -y --no-install-recommends gosu; \
    rm -rf /var/lib/apt/lists/*
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# 兜底：去掉可能的 CRLF（Windows 编辑易引入），否则 shebang 变成 #!/bin/sh\r 会报
# "exec ... no such file or directory"；随后赋予可执行权限
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

# 入口脚本以 root 降权到 node 用户运行，因此不再设置 USER node
ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
