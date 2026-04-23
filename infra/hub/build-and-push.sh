#!/bin/bash
# 构建 Hub 镜像并推送到 Docker Hub
#
# 用法（在 repo 根目录运行）：
#   bash infra/hub/build-and-push.sh [tag]
#
# 示例：
#   bash infra/hub/build-and-push.sh
#   bash infra/hub/build-and-push.sh v1.0

set -e

USERNAME="xuaustin"
TAG="${1:-latest}"
IMAGE_NAME="hub-wiki"
FULL_NAME="${USERNAME}/${IMAGE_NAME}:${TAG}"

# 必须在 repo 根目录执行（Dockerfile 需要读取 content/ 等目录）
if [ ! -f "quartz.config.ts" ]; then
    echo "❌ 请在 repo 根目录运行此脚本："
    echo "   bash infra/hub/build-and-push.sh"
    exit 1
fi

echo "========================================"
echo "构建 Hub 镜像：$FULL_NAME"
echo "========================================"
echo ""

echo "📝 确认 Docker Hub 登录..."
docker login

echo ""
echo "🏗️  构建镜像（多架构 AMD64 + ARM64）..."
docker buildx create --use --name hub-builder 2>/dev/null || docker buildx use hub-builder

docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --file infra/hub/Dockerfile \
    --tag "$FULL_NAME" \
    --tag "${USERNAME}/${IMAGE_NAME}:latest" \
    --push \
    .

echo ""
echo "========================================"
echo "✅ 推送成功：$FULL_NAME"
echo "========================================"
echo ""
echo "📥 在 NAS 上部署："
echo "   1. 复制 infra/hub/ 目录到 NAS"
echo "   2. 复制 infra/hub/.env.example 为 .env 并修改路径"
echo "   3. 运行：docker compose -f docker-compose.nas.yml up -d"
echo ""
echo "🌐 访问：http://NAS_IP:9999"
