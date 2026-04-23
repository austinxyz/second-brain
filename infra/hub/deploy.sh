#!/bin/bash
# Hub 一键部署脚本
# 在 NAS 上 SSH 进入 infra/hub/ 目录后执行
#
# 用法：bash deploy.sh

set -e

echo "========================================"
echo "Austin 的第二大脑 — Hub 部署脚本"
echo "========================================"
echo ""

# 检查当前目录
if [ ! -f "docker-compose.nas.yml" ]; then
    echo "❌ 请在 infra/hub/ 目录运行此脚本"
    exit 1
fi

# 检查 .env
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env，从 .env.example 创建..."
    cp .env.example .env
    echo ""
    echo "🔧 请编辑 .env，确认以下路径在 NAS 上存在："
    echo "   WEALTH_RAW  — wealth raw_material 目录"
    echo "   WEALTH_WIKI — wealth wiki 目录"
    echo "   WEALTH_OUTPUT — wealth output 目录"
    echo "   JOB_WIKI    — job wiki 目录"
    echo ""
    echo "编辑完成后重新运行本脚本"
    exit 0
fi

# 加载 .env
set -a
source .env
set +a

echo "⚙️  配置确认："
echo "   端口：${WEB_PORT:-9999}"
echo "   镜像：${DOCKER_HUB_USER:-austinxyz}/hub-wiki:latest"
echo ""

# 检查 wealth 路径（必须）
for path in "$WEALTH_RAW" "$WEALTH_WIKI" "$WEALTH_OUTPUT"; do
    if [ ! -d "$path" ]; then
        echo "❌ 路径不存在：$path"
        echo "   请在 .env 中修改为实际路径"
        exit 1
    fi
done
echo "✅ wealth KB 路径检查通过"

# job KB 路径（可选，不存在则跳过）
if [ -n "$JOB_WIKI" ] && [ ! -d "$JOB_WIKI" ]; then
    echo "⚠️  job wiki 路径不存在，跳过：$JOB_WIKI"
fi

echo ""
echo "📦 拉取最新镜像..."
docker compose -f docker-compose.nas.yml pull

echo ""
echo "🚀 启动服务..."
docker compose -f docker-compose.nas.yml up -d

echo ""
echo "⏳ 等待服务启动（首次约 2-3 分钟）..."
sleep 15

if docker compose -f docker-compose.nas.yml ps | grep -q "Up"; then
    NAS_IP=$(hostname -I | awk '{print $1}')
    echo ""
    echo "========================================"
    echo "✅ 部署成功！"
    echo "========================================"
    echo ""
    echo "🌐 访问地址：http://${NAS_IP}:${WEB_PORT:-9999}"
    echo ""
    echo "📋 常用命令："
    echo "   查看日志：docker compose -f docker-compose.nas.yml logs -f"
    echo "   重启：   docker compose -f docker-compose.nas.yml restart"
    echo "   停止：   docker compose -f docker-compose.nas.yml down"
    echo "   更新：   bash deploy.sh"
    echo ""
else
    echo "❌ 服务启动失败，查看日志："
    docker compose -f docker-compose.nas.yml logs
    exit 1
fi
