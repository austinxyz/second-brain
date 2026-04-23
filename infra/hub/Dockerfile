FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Clone Quartz v4
RUN git clone --depth 1 --branch v4 https://github.com/jackyzha0/quartz.git . \
    && npm ci --no-audit --no-fund

# 复制 Hub 自定义配置
COPY quartz.config.ts ./
COPY quartz.layout.ts ./

# 复制 Hub 自定义 Quartz 插件（处理 KB 嵌入后的 wikilink 路径）
COPY infra/hub/quartz-plugins/kbLinkRewrite.ts ./quartz/plugins/transformers/

# 内容（index.md / blog / projects / 各 KB）全部通过 NAS volume 挂载到 /app/content
# 镜像只保留空 content 目录，由 docker-compose.nas.yml 挂载真源
RUN mkdir -p content

EXPOSE 8080

CMD ["npx", "quartz", "build", "--serve", "--port", "8080"]
