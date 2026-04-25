# Design: Leadership & AI 知识库

**日期:** 2026-04-25  
**状态:** 已批准

---

## 背景

在现有的 wealth / stock / job / journal KB 体系之上，新增两个知识库：

| KB | 可见性 | 定位 |
|----|--------|------|
| `leadership` | Private repo | 管理学知识框架 + 私密工作记录 |
| `ai` | Public repo | AI 技术知识库（可公开分享）|

两个 KB 统一挂载到 `austin-second-brain` 的 Quartz Hub 发布到 NAS。

---

## 一、Leadership KB

### 仓库信息

- **路径:** `C:\Users\lorra\projects\personal\leadership`
- **GitHub:** 私有 repo（名称待定，建议 `leadership`）
- **同步:** Syncthing → NAS `/volume1/docker/leadership/`

### 目录结构

```
leadership/
├── raw_material/
│   ├── 书籍/
│   ├── 文章/
│   └── 课程/
├── wiki/
│   ├── 经典框架/        # OKR、情境领导、心理安全、GROW、RACI…
│   ├── 个人领导力/      # 自我认知、沟通风格、情绪管理
│   ├── 团队管理/        # 招聘、绩效、文化建设
│   ├── 向上管理/        # 利益相关方、预期管理
│   ├── 跨部门协作/      # 影响力、冲突处理
│   └── index.md
├── output/              # 私密工作记录（整个 repo 已是 private，无需 gitignore）
│   ├── 1on1/            # 每位直接下属一个子目录，按日期记录
│   ├── 决策日志/        # 重大管理决策：背景 / 选项 / 结论
│   └── 复盘/            # 季度 / 半年个人领导力复盘
├── .obsidian/
├── .gitignore           # 排除 .obsidian/workspace.json
├── CLAUDE.md
└── README.md
```

### Hub 挂载（NAS 路径）

```yaml
- ${LEADERSHIP_RAW:-/volume1/docker/leadership/raw_material}:/app/content/leadership/raw_material:ro
- ${LEADERSHIP_WIKI:-/volume1/docker/leadership/wiki}:/app/content/leadership/wiki:ro
- ${LEADERSHIP_OUTPUT:-/volume1/docker/leadership/output}:/app/content/leadership/output:ro
```

> output 挂载到 Hub（因 leadership repo 本身是 private，output 发布到 NAS 局域网可接受；如不需要可删除此行）

---

## 二、AI KB

### 仓库信息

- **路径:** `C:\Users\lorra\projects\personal\ai`
- **GitHub:** 公开 repo（名称建议 `ai-kb`）
- **同步:** Syncthing → NAS `/volume1/docker/ai/`
- **素材来源:** 迁移 `C:\Users\lorra\projects\knowlege-base` 中的 AI 相关内容（`学习/AI-ML/`、`学习/Infra/`、`工作/技术开发/AI/`）

### 目录结构

```
ai/
├── raw/
│   ├── agents/
│   ├── models/
│   ├── infra/
│   └── applications/
├── wiki/
│   ├── 模型与技术/      # 基础模型、推理、fine-tuning
│   ├── 应用开发/        # Agentic 系统、RAG、工具调用
│   ├── AI基础设施/      # GPU、推理框架、MLOps
│   ├── 行业洞察/        # 竞争格局、政策、趋势
│   └── index.md
├── output/              # 个人感想（gitignore 排除，不公开）
│   └── 学习心得/
├── .obsidian/
├── .gitignore           # 排除 output/、.obsidian/workspace.json
├── CLAUDE.md
└── README.md
```

### Hub 挂载（NAS 路径）

```yaml
- ${AI_RAW:-/volume1/docker/ai/raw}:/app/content/ai/raw:ro
- ${AI_WIKI:-/volume1/docker/ai/wiki}:/app/content/ai/wiki:ro
```

> output 不挂载到 Hub（内容为个人私密感想，不发布）

---

## 三、Hub 接入改动（austin-second-brain）

### 1. `kbLinkRewrite.ts`

```typescript
// 原
const KBS = ["wealth", "job", "llm", "stock", "journal"] as const
// 改（llm → ai，新增 leadership）
const KBS = ["wealth", "job", "ai", "stock", "journal", "leadership"] as const
```

### 2. `.env.example`

新增：
```env
LEADERSHIP_RAW=/volume1/docker/leadership/raw_material
LEADERSHIP_WIKI=/volume1/docker/leadership/wiki
LEADERSHIP_OUTPUT=/volume1/docker/leadership/output

AI_RAW=/volume1/docker/ai/raw
AI_WIKI=/volume1/docker/ai/wiki
```

### 3. `docker-compose.nas.yml` & `docker-compose.ugos.yml`

新增 leadership 和 ai 的 volume 挂载（见上方各 KB 的挂载示例）。

### 4. `content/index.md`

- 学习区：将现有的"AI/LLM 知识库（即将建立）"卡片改为指向 `/ai/wiki/`
- 工作区：新增"Leadership 知识库"卡片，指向 `/leadership/wiki/`

---

## 四、实施顺序

1. 创建 `leadership` 本地目录 + skeleton + git init → push GitHub（private）
2. 创建 `ai` 本地目录 + skeleton + 迁移 knowlege-base AI 内容 → push GitHub（public）
3. 更新 `austin-second-brain` hub（四处改动）→ rebuild 镜像 → NAS pull
