# Wealth 知识库迁移方案

> 将现有独立 Quartz 部署迁移到 Hub 统一架构

---

## 现状

### Wealth repo 目录结构

```
wealth/
├── raw_material/          ← 原始材料
├── wiki/                  ← 结构化知识条目（Obsidian Vault）
├── output/                ← 个人数据，仅本地/NAS，不上 GitHub
├── infra/
│   └── wealth-wiki/       ← 当前独立 Quartz 实例
│       ├── content/
│       │   └── index.md   ← 唯一在 repo 里的内容文件
│       ├── quartz.config.ts
│       ├── quartz.layout.ts
│       ├── Dockerfile
│       ├── docker-compose.nas.yml
│       └── nginx.conf
└── .obsidian/             ← Obsidian vault 配置（vault root = wealth/）
```

### 当前 NAS 部署

- 容器名：`wealth-quartz`，端口：`8899`
- 内容通过 Docker volume 挂载注入（repo 里只有 `index.md`）：

```
NAS /volume1/docker/wealth/content/raw_material  →  /app/content/raw_material
NAS /volume1/docker/wealth/content/wiki          →  /app/content/wiki
NAS /volume1/docker/wealth/content/output        →  /app/content/output
```

---

## 目标

在 Hub repo（`Austin的第二大脑`）中运行统一 Quartz 实例，wealth 内容以子路径形式纳入：

```
hub.nas.local/           ← Hub 首页
hub.nas.local/wealth/    ← Wealth 知识库入口（原 8899 端口）
hub.nas.local/job/       ← 未来：Job 知识库
hub.nas.local/projects/  ← 未来：编程项目
```

---

## 迁移原则

- **wealth repo 内容文件完全不改动**：wiki 条目、raw_material、output 保持原样
- **Obsidian 使用方式不变**：仍可直接打开 `wealth/wiki/` 作为 Vault
- **output 隔离不变**：output 只在 NAS 本地，不经过 GitHub
- **wikilink 不受影响**：Quartz 按文件名解析 `[[xxx]]`，路径迁移不破坏内部链接

---

## 迁移步骤

### 第一步：Hub repo 建立 Quartz 基础

在 `Austin的第二大脑/` 中初始化 Quartz：

```bash
# 克隆 Quartz 模板
npx quartz create

# 目标结构
Austin的第二大脑/
├── content/
│   ├── index.md          ← Hub 总导航首页（新建）
│   ├── projects/         ← 编程项目页（直接写在 Hub repo）
│   └── blog/             ← 博客页（直接写在 Hub repo）
├── quartz.config.ts      ← 从 wealth 合并过来，调整 pageTitle/baseUrl
├── quartz.layout.ts
├── infra/
│   └── hub/
│       ├── Dockerfile
│       ├── docker-compose.nas.yml
│       └── nginx.conf
└── package.json
```

### 第二步：合并 Quartz 配置

以 `wealth/infra/wealth-wiki/quartz.config.ts` 为基础，修改以下字段：

```typescript
// quartz.config.ts（Hub 版）
const config: QuartzConfig = {
  configuration: {
    pageTitle: "🧠 Austin 的第二大脑",   // 改：原为"家庭财富知识库"
    baseUrl: "10.0.0.20:8080",           // 改：Hub 使用新端口（如 8080）
    ignorePatterns: [
      "private", "templates", ".obsidian",
      ".trash", ".DS_Store", "**/.git/**",
      "**/node_modules/**", "infra/**",
      // 保留 wealth 的敏感路径过滤
      "wealth/output/账户凭证/**",
    ],
    // 其余配置（主题、字体、插件）沿用 wealth 现有设置
  },
}
```

### 第三步：Hub docker-compose 挂载 wealth 内容

```yaml
# infra/hub/docker-compose.nas.yml
services:
  quartz:
    image: ${DOCKER_HUB_USER}/hub-wiki:latest
    container_name: hub-quartz
    restart: unless-stopped
    ports:
      - "0.0.0.0:8080:8080"    # Hub 使用新端口，避免与旧 wealth 冲突
    volumes:
      # Hub 自有内容（baked into image，无需挂载）

      # Wealth KB — 挂载到 content/wealth/ 子路径
      - ${WEALTH_RAW:-/volume1/docker/wealth/content/raw_material}:/app/content/wealth/raw_material:ro
      - ${WEALTH_WIKI:-/volume1/docker/wealth/content/wiki}:/app/content/wealth/wiki:ro
      - ${WEALTH_OUTPUT:-/volume1/docker/wealth/content/output}:/app/content/wealth/output:ro

      # Job KB（待添加）
      # - ${JOB_WIKI:-/volume1/docker/job/content/wiki}:/app/content/job/wiki:ro
```

### 第四步：更新 wealth 的 index.md

原 `wealth/infra/wealth-wiki/content/index.md` 将作为 Hub 内的 `content/wealth/index.md`。

链接路径**不需要改动**：由于 index.md 和 wiki/ 同在 `content/wealth/` 下，相对链接 `wiki/00-MOC-总览` 仍可正确解析。

只需更新以下内容：

```markdown
# 🏛️ 家庭财富知识库

> [← 返回 Hub 首页](/)   ← 新增：返回 Hub 导航

（其余内容不变）
```

### 第五步：NAS 上的切换操作

```bash
# 1. 启动 Hub 容器（此时新旧并行，端口不同）
cd /volume1/docker/hub
docker-compose -f docker-compose.nas.yml up -d

# 2. 验证 Hub 可以正常访问 wealth 内容
curl http://localhost:8080/wealth/wiki/00-MOC-总览

# 3. 确认无误后，停掉旧的 wealth-quartz 容器
docker stop wealth-quartz
docker rm wealth-quartz

# 4. （可选）释放 8899 端口，或将 Hub 改到 8899 保持访问习惯
```

### 第六步：清理 wealth repo（可选）

迁移稳定后，可以移除 wealth repo 里不再需要的 Quartz 基础设施：

```bash
# wealth repo 中可以移除的目录
wealth/infra/wealth-wiki/Dockerfile
wealth/infra/wealth-wiki/docker-compose*.yml
wealth/infra/wealth-wiki/quartz.config.ts
wealth/infra/wealth-wiki/quartz.layout.ts
wealth/infra/wealth-wiki/nginx.conf
wealth/infra/wealth-wiki/build-and-push.sh
wealth/infra/wealth-wiki/deploy.sh

# 保留（内容文件，迁移到 Hub 的 content/wealth/index.md）
wealth/infra/wealth-wiki/content/index.md  →  移到 Hub repo 的 content/wealth/index.md
```

---

## 链接兼容性分析

| 链接类型 | 示例 | 迁移后状态 |
|---------|------|-----------|
| Obsidian WikiLink | `[[Roth-IRA]]` | ✅ 不受影响，按文件名解析 |
| 带路径 WikiLink | `[[wiki/账户类型/Roth-IRA\|Roth IRA]]` | ✅ 相对路径，仍在 wealth/ 子树内 |
| index.md 相对链接 | `[总览](wiki/00-MOC-总览)` | ✅ index.md 与 wiki/ 同级，相对路径有效 |
| 跨 KB 引用（未来）| `[[job/面试技巧]]` | ⚠️ 需要用完整路径 `[[job/wiki/面试技巧]]` |

---

## 迁移前后对比

| 项目 | 迁移前 | 迁移后 |
|-----|--------|--------|
| 访问地址 | `nas:8899` | `nas:8080/wealth/` |
| Quartz 实例数 | 1（仅 wealth）| 1（统一 Hub）|
| wealth 内容文件 | 不变 | 不变 |
| Obsidian 使用 | 打开 `wealth/` 或 `wealth/wiki/` | 不变 |
| output 隔离 | NAS volume 挂载 | NAS volume 挂载（不变）|
| GitHub 内容 | raw_material + wiki | 不变 |

---

## 待决定

- [ ] Hub 对外端口（8080 还是沿用 8899？）
- [ ] output 是否继续在 Hub 中展示（wealth 现在是展示的，只过滤了账户凭证）
- [ ] wealth 的 `infra/wealth-wiki/` 何时清理
