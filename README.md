# 🧠 Austin 的第二大脑 (Second Brain Hub)

基于 [Quartz v4](https://github.com/jackyzha0/quartz) 的家庭内网知识导航站，作为"壳层"统一嵌入多个独立知识库（wealth / job / stock / llm / ...），部署在 NAS 上，仅内网访问。

## 架构概览

```
┌───────────────────────────────────────────────────────────┐
│  Hub Quartz Site  (本仓库 = 壳层)                           │
│  ├─ content/index.md        ← 首页卡片导航                 │
│  ├─ content/blog/           ← 博客                         │
│  ├─ content/projects/       ← 项目                         │
│  └─ content/<kb>/...        ← 各 KB 内容（NAS volume 挂载） │
│                                                            │
│  自定义插件：                                               │
│    infra/hub/quartz-plugins/kbLinkRewrite.ts              │
│      → 修正独立 KB 站点嵌入后带路径的 wikilink              │
└───────────────────────────────────────────────────────────┘
         ▲
         │ Docker volume 挂载（只读）
         │
┌────────┴──────────────────────────────────────────────────┐
│  NAS: /volume1/docker/                                     │
│  ├─ second-brain/content/   ← 本仓库 Hub 壳层（Syncthing） │
│  ├─ wealth/content/{wiki,output,raw_material}              │
│  ├─ job/content/wiki                                       │
│  ├─ stock/content/wiki                                     │
│  └─ llm/content/wiki        (待建)                         │
└────────────────────────────────────────────────────────────┘
```

**关键点**

- **镜像只打壳层 + 插件 + Quartz**，不含任何 KB 内容；KB 由各自仓库 sync 到 NAS，运行时 volume mount
- **`markdownLinkResolution: "shortest"`** + **`kbLinkRewrite`** 插件共同保证：各独立 KB 原样嵌入，内部 wikilink 不用改
- Hub 壳层本身（`content/index.md` / `blog` / `projects`）也从 NAS 挂载，NAS 上是**唯一真源**（通过 Syncthing 双向同步本地与 NAS）

## 目录结构

```
.
├── content/                  # Hub 壳层内容
│   ├── index.md              # 首页（卡片式导航）
│   ├── blog/                 # 博客（.gitkeep）
│   └── projects/             # 项目（.gitkeep）
├── quartz.config.ts          # Quartz 配置（插件、主题、baseUrl）
├── quartz.layout.ts          # Quartz 布局
├── infra/hub/
│   ├── Dockerfile            # 镜像：node:22-slim + Quartz v4 + 自定义插件
│   ├── build-and-push.sh     # 多架构构建并推送到 Docker Hub
│   ├── deploy.sh             # NAS 一键部署脚本
│   ├── docker-compose.nas.yml   # Synology / 通用 NAS
│   ├── docker-compose.ugos.yml  # 绿联 UGOS NAS
│   ├── .env.example          # 环境变量样例（路径 / 端口 / 镜像）
│   └── quartz-plugins/
│       └── kbLinkRewrite.ts  # 嵌入式 KB 的 wikilink 重写
└── .stignore                 # Syncthing 忽略规则
```

## 本地开发

```bash
# 1. 拉 Quartz v4 到临时目录，复制本仓库配置覆盖
git clone --depth 1 --branch v4 https://github.com/jackyzha0/quartz.git /tmp/quartz
cp quartz.config.ts quartz.layout.ts /tmp/quartz/
mkdir -p /tmp/quartz/quartz/plugins/transformers
cp infra/hub/quartz-plugins/kbLinkRewrite.ts /tmp/quartz/quartz/plugins/transformers/

# 2. 把本地 content + 各 KB 软链到 /tmp/quartz/content
# （或直接在 /tmp/quartz/content 下放一份最小测试内容）

# 3. 启动
cd /tmp/quartz && npm ci && npx quartz build --serve
```

## 构建与部署

### 开发机：构建推送镜像

```bash
# 在 repo 根目录
bash infra/hub/build-and-push.sh            # :latest
bash infra/hub/build-and-push.sh v1.0       # + :v1.0
```

多架构（amd64 + arm64），推到 `xuaustin/hub-wiki`。

### NAS：首次部署

```bash
# SSH 到 NAS
cd /volume1/docker/second-brain/infra/hub
cp .env.example .env
# 编辑 .env：端口 / KB 路径
bash deploy.sh
```

### NAS：更新

```bash
cd /volume1/docker/second-brain/infra/hub
docker compose -f docker-compose.nas.yml pull
docker compose -f docker-compose.nas.yml up -d
```

> 仅改 `content/index.md` 这类壳层内容时，**无需重 build 镜像**——Syncthing 同步到 NAS 后，Quartz 容器重启即可。
> 改了 `kbLinkRewrite.ts` / `quartz.config.ts` / `Dockerfile` 时**必须重 build + push + pull**。

## 新增知识库的步骤

以 `stock` 为例（已完成，供模板参考）：

1. `infra/hub/quartz-plugins/kbLinkRewrite.ts` 的 `KBS` 数组加 `"stock"`
2. `infra/hub/.env.example` 新增 `STOCK_WIKI=...`
3. `infra/hub/docker-compose.nas.yml` 和 `docker-compose.ugos.yml` 各加一行挂载 `${STOCK_WIKI}:/app/content/stock/wiki:ro`
4. `content/index.md` 加卡片指向 `/stock/wiki/`（或 KB 内部的首页 slug）
5. 重 build + push + NAS pull

## 相关仓库

| 仓库 | 内容 |
|---|---|
| [second-brain](https://github.com/austinxyz/second-brain)（本仓库） | Hub 壳层 + 部署配置 |
| [wealth](https://github.com/austinxyz/wealth) | 财富 / 投资 / 退休规划 KB |
| job / stock / llm | 各自独立 KB（私有或未公开） |

## 许可

个人项目，内网使用。
