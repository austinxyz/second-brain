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

# 复制 Hub 自有内容（首页、projects、blog）
# 各 KB 内容在 NAS 上通过 volume 挂载，不在镜像内
RUN mkdir -p content
COPY content/index.md ./content/
COPY content/projects/ ./content/projects/
COPY content/blog/ ./content/blog/

EXPOSE 8080

CMD ["npx", "quartz", "build", "--serve", "--port", "8080"]
