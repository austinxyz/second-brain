# Leadership & AI KB 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建 leadership（私有）和 ai（公开）两个 KB，结构参照 wealth，挂载到 austin-second-brain Quartz Hub 发布到 NAS。

**Architecture:** 每个 KB 是独立 Obsidian vault + git repo，三层结构（raw / wiki / output）。Hub 通过 volume 挂载将两个 KB 内容叠加到 Quartz 站点的 `/app/content/{kb}/` 路径。link rewrite 插件负责跨 KB 内部链接解析。

**Tech Stack:** Bash、git、Obsidian vault（JSON config）、YAML（docker-compose）、TypeScript（kbLinkRewrite.ts 一行改动）

---

## 文件改动总览

### Task 1 — Leadership KB（新建仓库）
- Create: `C:\Users\lorra\projects\personal\leadership\` （整个目录树）
- Create: `leadership\.gitignore`
- Create: `leadership\CLAUDE.md`
- Create: `leadership\README.md`
- Create: `leadership\.obsidian\app.json`
- Create: `leadership\wiki\index.md`
- Create: `leadership\output\1on1\.gitkeep`
- Create: `leadership\output\决策日志\.gitkeep`
- Create: `leadership\output\复盘\.gitkeep`

### Task 2 — AI KB（新建仓库 + 迁移素材）
- Create: `C:\Users\lorra\projects\personal\ai\` （整个目录树）
- Create: `ai\.gitignore`
- Create: `ai\CLAUDE.md`
- Create: `ai\README.md`
- Create: `ai\.obsidian\app.json`
- Create: `ai\wiki\index.md`
- Move/Copy from `knowlege-base\学习\AI-ML\*` → `ai\raw\models\`
- Move/Copy from `knowlege-base\学习\Infra\*` → `ai\raw\infra\`
- Move/Copy from `knowlege-base\工作\技术开发\AI\*` → `ai\raw\applications\`

### Task 3 — Hub 接入（austin-second-brain）
- Modify: `infra\hub\quartz-plugins\kbLinkRewrite.ts`（1 行）
- Modify: `infra\hub\.env.example`（新增 5 行）
- Modify: `infra\hub\docker-compose.nas.yml`（新增 7 行）
- Modify: `infra\hub\docker-compose.ugos.yml`（新增 7 行）
- Modify: `content\index.md`（修改 ai 卡片 + 新增 leadership 卡片）

---

## Task 1：创建 Leadership KB Skeleton

**Files:**
- Create: `C:\Users\lorra\projects\personal\leadership\` 及所有子目录和文件

- [ ] **Step 1：创建目录结构**

```bash
mkdir -p /c/Users/lorra/projects/personal/leadership/{raw_material/{书籍,文章,课程},wiki/{经典框架,个人领导力,团队管理,向上管理,跨部门协作},output/{1on1,决策日志,复盘}}
mkdir -p /c/Users/lorra/projects/personal/leadership/.obsidian
```

- [ ] **Step 2：验证目录树**

```bash
find /c/Users/lorra/projects/personal/leadership -type d | sort
```

期望输出（含以下路径）：
```
.../leadership/raw_material/书籍
.../leadership/raw_material/文章
.../leadership/raw_material/课程
.../leadership/wiki/经典框架
.../leadership/wiki/个人领导力
.../leadership/wiki/团队管理
.../leadership/wiki/向上管理
.../leadership/wiki/跨部门协作
.../leadership/output/1on1
.../leadership/output/决策日志
.../leadership/output/复盘
```

- [ ] **Step 3：创建 .gitignore**

`C:\Users\lorra\projects\personal\leadership\.gitignore`：
```
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.claude/
```

（leadership 整个 repo 是 private，output/ 不需要 gitignore）

- [ ] **Step 4：创建 .obsidian/app.json**

`C:\Users\lorra\projects\personal\leadership\.obsidian\app.json`：
```json
{
  "legacyEditor": false,
  "livePreview": true,
  "defaultViewMode": "preview"
}
```

- [ ] **Step 5：创建 CLAUDE.md**

`C:\Users\lorra\projects\personal\leadership\CLAUDE.md`：
```markdown
# CLAUDE.md

本文件指导 Claude Code 在 `leadership` 知识库中的工作方式。

## 项目核心概念

三层知识库：**原始资料 → 提炼知识 → 工作实录**。

| 目录 | 入库 | 内容性质 |
|------|------|---------|
| `raw_material/` | ✅ | 书籍、文章、课程，通用管理学知识 |
| `wiki/` | ✅ | 提炼后的框架条目，带统一 frontmatter |
| `output/` | ✅（repo 为 private） | 1:1 记录、决策日志、个人复盘 |

## Wiki 条目 Schema

每个 `wiki/<分类>/*.md` 必须有统一 frontmatter：

```yaml
---
title: <条目名称>
category: <经典框架 | 个人领导力 | 团队管理 | 向上管理 | 跨部门协作>
tags: [tag1, tag2]
source: "[[raw_material/<分类>/来源文件名]]"
updated: YYYY-MM-DD
status: <draft | stable | outdated>
---
```

正文使用4段固定结构：

```markdown
## 定义
一句话说清楚这是什么。

## 核心要点
- 要点1
- 要点2

## 与其他概念的关系
- [[wiki/<分类>/相关条目|相关条目]]：关系说明

## 参考来源
- [[raw_material/<分类>/来源文件|来源文件]]
```

## Output 条目 Schema

### 1on1 记录（`output/1on1/<人名>/YYYY-MM-DD.md`）

```yaml
---
date: YYYY-MM-DD
person: <人名>
type: 1on1
---
## 上次跟进
## 本次议题
## 行动项
```

### 决策日志（`output/决策日志/YYYY-MM-DD-<主题>.md`）

```yaml
---
date: YYYY-MM-DD
topic: <决策主题>
type: decision
---
## 背景
## 选项
## 结论
## 复盘时间
```

### 复盘（`output/复盘/YYYY-Q<N>.md`）

```yaml
---
period: YYYY-Q<N>
type: retro
---
## 做得好的
## 需要改进的
## 下季度重点
```

## 命名约定

- 条目文件名：英文或中文（`OKR.md`、`心理安全.md`）
- 用连字符 `-` 替代空格
- MOC 页命名：`00-MOC-<分类>.md`

## WikiLinks（Quartz 兼容）

带路径的 wikilink 必须写完整路径：
- 正确：`[[wiki/经典框架/OKR|OKR]]`
- 错误：`[[OKR]]`、`[[经典框架/OKR]]`

## Git 行为

本 repo 为 private，output/ 可入库。推送前确认无意外文件：
```bash
git status
```
```

- [ ] **Step 6：创建 README.md**

`C:\Users\lorra\projects\personal\leadership\README.md`：
```markdown
# Leadership 知识库

管理学框架 + 工作实录的三层知识库。

## 结构

| 目录 | 内容 |
|------|------|
| `raw_material/` | 书籍、文章、课程原始资料 |
| `wiki/` | 提炼后的管理框架知识条目 |
| `output/` | 1:1 记录、决策日志、个人复盘（私密）|

## 发布

通过 `austin-second-brain` Quartz Hub 发布到内网 NAS，路径：`/leadership/`。
```

- [ ] **Step 7：创建 wiki/index.md**

`C:\Users\lorra\projects\personal\leadership\wiki\index.md`：
```markdown
---
title: Leadership 知识库
---

# Leadership 知识库

管理学框架与领导力实践的结构化知识库。

## 分类

- [[wiki/经典框架/00-MOC-经典框架|经典框架]] — OKR、情境领导、心理安全、GROW、RACI
- [[wiki/个人领导力/00-MOC-个人领导力|个人领导力]] — 自我认知、沟通风格、情绪管理
- [[wiki/团队管理/00-MOC-团队管理|团队管理]] — 招聘、绩效、文化建设
- [[wiki/向上管理/00-MOC-向上管理|向上管理]] — 利益相关方、预期管理
- [[wiki/跨部门协作/00-MOC-跨部门协作|跨部门协作]] — 影响力、冲突处理
```

- [ ] **Step 8：为空目录添加 .gitkeep**

```bash
touch /c/Users/lorra/projects/personal/leadership/raw_material/书籍/.gitkeep
touch /c/Users/lorra/projects/personal/leadership/raw_material/文章/.gitkeep
touch /c/Users/lorra/projects/personal/leadership/raw_material/课程/.gitkeep
touch /c/Users/lorra/projects/personal/leadership/wiki/经典框架/.gitkeep
touch /c/Users/lorra/projects/personal/leadership/wiki/个人领导力/.gitkeep
touch /c/Users/lorra/projects/personal/leadership/wiki/团队管理/.gitkeep
touch /c/Users/lorra/projects/personal/leadership/wiki/向上管理/.gitkeep
touch /c/Users/lorra/projects/personal/leadership/wiki/跨部门协作/.gitkeep
touch /c/Users/lorra/projects/personal/leadership/output/1on1/.gitkeep
touch /c/Users/lorra/projects/personal/leadership/output/决策日志/.gitkeep
touch /c/Users/lorra/projects/personal/leadership/output/复盘/.gitkeep
```

- [ ] **Step 9：git init 并初始提交**

```bash
cd /c/Users/lorra/projects/personal/leadership
git init
git add .
git status  # 确认 .obsidian/workspace.json 不在列表（此时还没有该文件，正常）
git commit -m "feat: leadership KB 初始 skeleton"
```

期望输出：包含 `CLAUDE.md`、`README.md`、`wiki/index.md`、各 `.gitkeep` 文件，不含 `.claude/`。

- [ ] **Step 10：在 GitHub 创建私有 repo 并推送**

```bash
cd /c/Users/lorra/projects/personal/leadership
gh repo create leadership --private --source=. --remote=origin --push
```

期望输出：`✓ Created repository austinxyz/leadership on GitHub`

---

## Task 2：创建 AI KB Skeleton + 迁移素材

**Files:**
- Create: `C:\Users\lorra\projects\personal\ai\` 及所有子目录和文件
- Copy: knowlege-base AI 相关内容到 raw 目录

- [ ] **Step 1：创建目录结构**

```bash
mkdir -p /c/Users/lorra/projects/personal/ai/{raw/{agents,models,infra,applications},wiki/{模型与技术,应用开发,AI基础设施,行业洞察},output/学习心得}
mkdir -p /c/Users/lorra/projects/personal/ai/.obsidian
```

- [ ] **Step 2：验证目录树**

```bash
find /c/Users/lorra/projects/personal/ai -type d | sort
```

- [ ] **Step 3：创建 .gitignore**

`C:\Users\lorra\projects\personal\ai\.gitignore`：
```
output/
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.claude/
```

- [ ] **Step 4：创建 .obsidian/app.json**

`C:\Users\lorra\projects\personal\ai\.obsidian\app.json`：
```json
{
  "legacyEditor": false,
  "livePreview": true,
  "defaultViewMode": "preview"
}
```

- [ ] **Step 5：创建 CLAUDE.md**

`C:\Users\lorra\projects\personal\ai\CLAUDE.md`：
```markdown
# CLAUDE.md

本文件指导 Claude Code 在 `ai` 知识库中的工作方式。

## 项目核心概念

三层知识库：**原始资料 → 提炼知识 → 个人感想**。

| 目录 | 入库 | 内容性质 |
|------|------|---------|
| `raw/` | ✅ | 最新文章、论文、技术报告（公开内容）|
| `wiki/` | ✅ | 提炼后的知识条目，带统一 frontmatter |
| `output/` | ❌ `.gitignore` | 个人学习感想、未整理笔记（不公开）|

## Wiki 条目 Schema

每个 `wiki/<分类>/*.md` 必须有统一 frontmatter：

```yaml
---
title: <条目名称>
category: <模型与技术 | 应用开发 | AI基础设施 | 行业洞察>
tags: [tag1, tag2]
source: "[[raw/<分类>/来源文件名]]"
updated: YYYY-MM-DD
status: <draft | stable | outdated>
---
```

正文使用4段固定结构：

```markdown
## 定义
一句话说清楚这是什么。

## 核心要点
- 要点1
- 要点2

## 与其他概念的关系
- [[wiki/<分类>/相关条目|相关条目]]：关系说明

## 参考来源
- [[raw/<分类>/来源文件|来源文件]]
```

## 命名约定

- 文件名：英文优先（`RAG.md`、`Transformer.md`）
- 用连字符 `-` 替代空格
- MOC 页命名：`00-MOC-<分类>.md`

## WikiLinks（Quartz 兼容）

```
正确：[[wiki/应用开发/RAG|RAG]]
错误：[[RAG]]、[[应用开发/RAG]]
```

## Git 行为

```bash
# 推送前确认 output/ 不在 staged 列表
git status | grep output/ && echo "⚠️ 停止：output/ 不应入库"
```
```

- [ ] **Step 6：创建 README.md**

`C:\Users\lorra\projects\personal\ai\README.md`：
```markdown
# AI 知识库

AI 技术知识的三层结构化知识库（公开）。

## 结构

| 目录 | 内容 |
|------|------|
| `raw/` | 最新文章、论文、技术报告 |
| `wiki/` | 提炼后的 AI 技术知识条目 |
| `output/` | 个人学习感想（gitignore，不公开）|

## 发布

通过 `austin-second-brain` Quartz Hub 发布到内网 NAS，路径：`/ai/`。
```

- [ ] **Step 7：创建 wiki/index.md**

`C:\Users\lorra\projects\personal\ai\wiki\index.md`：
```markdown
---
title: AI 知识库
---

# AI 知识库

AI 技术的结构化知识库，涵盖模型原理、应用开发、基础设施与行业洞察。

## 分类

- [[wiki/模型与技术/00-MOC-模型与技术|模型与技术]] — 基础模型、推理、fine-tuning
- [[wiki/应用开发/00-MOC-应用开发|应用开发]] — Agentic 系统、RAG、工具调用
- [[wiki/AI基础设施/00-MOC-AI基础设施|AI基础设施]] — GPU、推理框架、MLOps
- [[wiki/行业洞察/00-MOC-行业洞察|行业洞察]] — 竞争格局、政策、趋势
```

- [ ] **Step 8：迁移 knowlege-base 中的 AI 素材**

```bash
# 查看要迁移的文件
ls /c/Users/lorra/projects/knowlege-base/学习/AI-ML/
ls /c/Users/lorra/projects/knowlege-base/学习/Infra/
ls /c/Users/lorra/projects/knowlege-base/工作/技术开发/AI/ 2>/dev/null || echo "目录不存在"

# 复制（不移动，保留原始 knowlege-base 不变）
cp /c/Users/lorra/projects/knowlege-base/学习/AI-ML/*.md /c/Users/lorra/projects/personal/ai/raw/models/ 2>/dev/null
cp /c/Users/lorra/projects/knowlege-base/学习/Infra/*.md /c/Users/lorra/projects/personal/ai/raw/infra/ 2>/dev/null
cp /c/Users/lorra/projects/knowlege-base/工作/技术开发/AI/*.md /c/Users/lorra/projects/personal/ai/raw/applications/ 2>/dev/null || true
```

- [ ] **Step 9：验证迁移结果**

```bash
find /c/Users/lorra/projects/personal/ai/raw -name "*.md" | sort
```

期望：能看到从 knowlege-base 复制过来的 .md 文件。

- [ ] **Step 10：为空目录添加 .gitkeep**

```bash
touch /c/Users/lorra/projects/personal/ai/raw/agents/.gitkeep
touch /c/Users/lorra/projects/personal/ai/raw/applications/.gitkeep
touch /c/Users/lorra/projects/personal/ai/wiki/模型与技术/.gitkeep
touch /c/Users/lorra/projects/personal/ai/wiki/应用开发/.gitkeep
touch /c/Users/lorra/projects/personal/ai/wiki/AI基础设施/.gitkeep
touch /c/Users/lorra/projects/personal/ai/wiki/行业洞察/.gitkeep
```

（raw/models 和 raw/infra 已有迁移的文件，不需要 .gitkeep）

- [ ] **Step 11：git init 并初始提交**

```bash
cd /c/Users/lorra/projects/personal/ai
git init
git add .
git status  # 确认 output/ 不在列表（已被 .gitignore 排除）
git commit -m "feat: ai KB 初始 skeleton + 迁移 knowlege-base 素材"
```

- [ ] **Step 12：在 GitHub 创建公开 repo 并推送**

```bash
cd /c/Users/lorra/projects/personal/ai
gh repo create ai-kb --public --source=. --remote=origin --push
```

期望输出：`✓ Created repository austinxyz/ai-kb on GitHub`

---

## Task 3：更新 Hub 接入两个新 KB

**Files:**
- Modify: `infra/hub/quartz-plugins/kbLinkRewrite.ts`
- Modify: `infra/hub/.env.example`
- Modify: `infra/hub/docker-compose.nas.yml`
- Modify: `infra/hub/docker-compose.ugos.yml`
- Modify: `content/index.md`

所有改动在 `C:\Users\lorra\projects\personal\overall\austin-second-brain` 目录下。

- [ ] **Step 1：更新 kbLinkRewrite.ts（llm → ai，新增 leadership）**

文件：`infra/hub/quartz-plugins/kbLinkRewrite.ts`

将：
```typescript
const KBS = ["wealth", "job", "llm", "stock", "journal"] as const
```

改为：
```typescript
const KBS = ["wealth", "job", "ai", "stock", "journal", "leadership"] as const
```

- [ ] **Step 2：更新 .env.example**

文件：`infra/hub/.env.example`

将末尾的：
```
# llm KB（待建）
# LLM_WIKI=/volume1/docker/llm/content/wiki
```

替换为：
```
# ai KB
AI_RAW=/volume1/docker/ai/raw
AI_WIKI=/volume1/docker/ai/wiki

# leadership KB
LEADERSHIP_RAW=/volume1/docker/leadership/raw_material
LEADERSHIP_WIKI=/volume1/docker/leadership/wiki
LEADERSHIP_OUTPUT=/volume1/docker/leadership/output
```

- [ ] **Step 3：更新 docker-compose.nas.yml**

文件：`infra/hub/docker-compose.nas.yml`

将：
```yaml
      # llm KB（待建，注释解开即可启用）
      # - ${LLM_WIKI:-/volume1/docker/llm/content/wiki}:/app/content/llm/wiki:ro
```

替换为：
```yaml
      # ai KB
      - ${AI_RAW:-/volume1/docker/ai/raw}:/app/content/ai/raw:ro
      - ${AI_WIKI:-/volume1/docker/ai/wiki}:/app/content/ai/wiki:ro

      # leadership KB
      - ${LEADERSHIP_RAW:-/volume1/docker/leadership/raw_material}:/app/content/leadership/raw_material:ro
      - ${LEADERSHIP_WIKI:-/volume1/docker/leadership/wiki}:/app/content/leadership/wiki:ro
      - ${LEADERSHIP_OUTPUT:-/volume1/docker/leadership/output}:/app/content/leadership/output:ro
```

- [ ] **Step 4：更新 docker-compose.ugos.yml**

文件：`infra/hub/docker-compose.ugos.yml`

将：
```yaml
      # ─────────────────────────────────────────────
      # LLM 知识库（建好后取消注释）
      # ─────────────────────────────────────────────
      # - /volume1/docker/llm/content/wiki:/app/content/llm/wiki:ro
```

替换为：
```yaml
      # ─────────────────────────────────────────────
      # AI 知识库
      # ─────────────────────────────────────────────
      - /volume1/docker/ai/raw:/app/content/ai/raw:ro
      - /volume1/docker/ai/wiki:/app/content/ai/wiki:ro

      # ─────────────────────────────────────────────
      # Leadership 知识库
      # ─────────────────────────────────────────────
      - /volume1/docker/leadership/raw_material:/app/content/leadership/raw_material:ro
      - /volume1/docker/leadership/wiki:/app/content/leadership/wiki:ro
      - /volume1/docker/leadership/output:/app/content/leadership/output:ro
```

- [ ] **Step 5：更新 content/index.md**

**改动 1：** 学习区 — 将现有的 llm 卡片（`href="/llm/wiki/"`，标签"即将建立"）改为：

```html
  <a class="hub-card" href="/ai/wiki/">
    <div class="hub-card-icon">🤖</div>
    <div class="hub-card-title">AI 知识库</div>
    <div class="hub-card-desc">模型原理 · Agentic 系统 · RAG · AI 基础设施</div>
    <span class="hub-card-tag">知识库</span>
  </a>
```

**改动 2：** 工作区 — 在 `<div class="hub-grid">` 里的求职卡片之后新增 leadership 卡片：

```html
  <a class="hub-card" href="/leadership/wiki/">
    <div class="hub-card-icon">🧭</div>
    <div class="hub-card-title">Leadership 知识库</div>
    <div class="hub-card-desc">管理框架 · 团队建设 · 向上管理 · 领导力实践</div>
    <span class="hub-card-tag">知识库</span>
  </a>
```

- [ ] **Step 6：提交所有 hub 改动**

```bash
cd /c/Users/lorra/projects/personal/overall/austin-second-brain
git add infra/hub/quartz-plugins/kbLinkRewrite.ts \
        infra/hub/.env.example \
        infra/hub/docker-compose.nas.yml \
        infra/hub/docker-compose.ugos.yml \
        content/index.md
git commit -m "feat: 接入 leadership 和 ai 两个新 KB"
```

- [ ] **Step 7：重新 build 并推送镜像**

```bash
cd /c/Users/lorra/projects/personal/overall/austin-second-brain/infra/hub
bash build-and-push.sh
```

（kbLinkRewrite.ts 在镜像里，改动后必须 rebuild）

- [ ] **Step 8：在 NAS 上拉取新镜像并重启**

在 NAS SSH 或 UGOS 终端执行：
```bash
cd /volume1/docker/second-brain
docker compose -f docker-compose.ugos.yml pull
docker compose -f docker-compose.ugos.yml up -d
```

- [ ] **Step 9：验证**

浏览器打开 `http://10.0.0.20:7777`，确认：
1. 首页工作区新增了"Leadership 知识库"卡片
2. 首页学习区的 AI 卡片不再显示"即将建立"
3. 点击 `/leadership/wiki/` 能加载 index.md
4. 点击 `/ai/wiki/` 能加载 index.md

---

## NAS Syncthing 配置备忘（Task 3 后手动操作）

两个新 KB 需要在 Syncthing 上建立同步链路，将本地 repo 同步到 NAS 对应路径：

| 本地路径 | NAS 路径 |
|---------|---------|
| `C:\Users\lorra\projects\personal\leadership` | `/volume1/docker/leadership` |
| `C:\Users\lorra\projects\personal\ai` | `/volume1/docker/ai` |
