# Journal 私人博客 KB 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 spec 把 `journal` 作为新的私有 KB 接入 Hub，并搬 5–8 篇 MVP 内容上线。

**Architecture:** 双仓库协同——`austinxyz/journal`（新、private）承载内容；`austinxyz/second-brain`（当前、public）改 5 处完成 Hub 接入；NAS 通过 Syncthing 拉内容，Docker volume mount 给 Quartz。

**Tech Stack:** Quartz v4 · Obsidian · Docker Compose · Syncthing · GitHub (private) · Bash

---

## 任务概览

| # | 任务 | 执行方 | 仓库 |
|---|---|---|---|
| 1 | Hub: 扩 kbLinkRewrite 白名单 | agent | second-brain |
| 2 | Hub: 扩 compose + env 配置 | agent | second-brain |
| 3 | Hub: 替换 index.md 卡片 | agent | second-brain |
| 4 | Hub: 本地校验 + 提交 | agent | second-brain |
| 5 | Hub: build & push 镜像 | agent | second-brain |
| 6 | 初始化 journal 本地仓库骨架 | agent | journal |
| 7 | journal: 生成 MVP 目录 + 首页 + Hello World | agent | journal |
| 8 | GitHub: 建 private repo 推上去 | user + agent | journal |
| 9 | NAS: Syncthing 接入 + 拉镜像部署 | user | — |
| 10 | 内容搬运：Notion 精选 3–5 篇 | user | journal |
| 11 | 内容搬运：中国行笔记 2–3 篇 | user | journal |
| 12 | 端到端验收 | agent + user | — |

> 说明：标 **user** 的任务涉及 GitHub UI / NAS SSH / 读 Notion，Claude 无法直接代做。标 **agent** 的可由实现者（包括 Claude subagent）完成。

---

## Part A: Hub 侧改动（`second-brain` 仓库）

### Task 1: 扩 kbLinkRewrite KBS 白名单

**Files:**
- Modify: `infra/hub/quartz-plugins/kbLinkRewrite.ts:26`

- [ ] **Step 1: 改 KBS 常量数组**

找到：
```typescript
const KBS = ["wealth", "job", "llm", "stock"] as const
```

改成：
```typescript
const KBS = ["wealth", "job", "llm", "stock", "journal"] as const
```

- [ ] **Step 2: 验证改动**

```bash
grep "journal" infra/hub/quartz-plugins/kbLinkRewrite.ts
```
Expected: 匹配到 `"journal"` 在 `KBS` 行里。

---

### Task 2: 扩 compose 配置 + .env.example

**Files:**
- Modify: `infra/hub/.env.example`
- Modify: `infra/hub/docker-compose.nas.yml`
- Modify: `infra/hub/docker-compose.ugos.yml`

- [ ] **Step 1: 在 `.env.example` 追加 journal 变量**

找到 stock KB 那段后面追加：
```
# journal KB (private)
JOURNAL_CONTENT=/volume1/docker/journal/content
```

- [ ] **Step 2: 在 `docker-compose.nas.yml` 加挂载**

在 stock 挂载那行后面、llm 注释那行前面加：
```yaml
      # journal KB (private)
      - ${JOURNAL_CONTENT:-/volume1/docker/journal/content}:/app/content/journal:ro
```

- [ ] **Step 3: 在 `docker-compose.ugos.yml` 加挂载**

在 Stock 知识库那段后面加：
```yaml
      # ─────────────────────────────────────────────
      # Journal 知识库（私人博客）
      # ─────────────────────────────────────────────
      - /volume1/docker/journal/content:/app/content/journal:ro
```

- [ ] **Step 4: 语法验证**

```bash
cd infra/hub && docker compose -f docker-compose.nas.yml config > /dev/null && echo OK
cd infra/hub && docker compose -f docker-compose.ugos.yml config > /dev/null && echo OK
```
Expected: 两次都打印 `OK`；报错说明 YAML 语法坏了。

---

### Task 3: Hub 首页把"个人博客"WIP 卡替换成 Journal

**Files:**
- Modify: `content/index.md`

- [ ] **Step 1: 替换 🎮 娱乐 section 中的 WIP 卡片**

找到：
```html
  <a class="hub-card" href="#">
    <div class="hub-card-icon">✍️</div>
    <div class="hub-card-title">个人博客</div>
    <div class="hub-card-desc">生活、思考、记录</div>
    <span class="hub-card-tag tag-wip">待建</span>
  </a>
```

替换为：
```html
  <a class="hub-card" href="/journal/">
    <div class="hub-card-icon">✍️</div>
    <div class="hub-card-title">Journal</div>
    <div class="hub-card-desc">生活感悟 · 旅行 · 访谈 · 设计人生</div>
    <span class="hub-card-tag">日志</span>
  </a>
```

- [ ] **Step 2: 确认没留多余的 WIP 标签**

```bash
grep -c "tag-wip" content/index.md
```
Expected: 数字应为之前值 - 1（因为替换掉了一个）。具体剩几个取决于其他 WIP 项，只要比之前少 1 就对。

---

### Task 4: Hub 改动提交

**Files:**
- 所有 Task 1–3 改动

- [ ] **Step 1: git diff 确认**

```bash
git status
git diff --stat
```
Expected: 列出 5 个文件改动 —— `content/index.md`、`infra/hub/.env.example`、`infra/hub/docker-compose.nas.yml`、`infra/hub/docker-compose.ugos.yml`、`infra/hub/quartz-plugins/kbLinkRewrite.ts`。

- [ ] **Step 2: commit**

```bash
git add . && git commit -m "$(cat <<'EOF'
feat: 接入 journal 私有博客 KB

- kbLinkRewrite: KBS 白名单加入 journal
- .env.example / docker-compose.{nas,ugos}.yml: 新增 JOURNAL_CONTENT 挂载
- index.md: 🎮 娱乐 section 的个人博客 WIP 卡片替换为 /journal/ 入口
EOF
)"
```

- [ ] **Step 3: push**

```bash
git push origin main
```
Expected: 推到 `austinxyz/second-brain`。

---

### Task 5: Hub 镜像重 build + push

**Files:** 无改动，纯命令。

- [ ] **Step 1: 确认 Docker 已登录 xuaustin 账号**

```bash
docker-credential-desktop get <<< "https://index.docker.io/v1/" | grep -o '"Username":"[^"]*"'
```
Expected: `"Username":"xuaustin"`。不是就先 `docker login`。

- [ ] **Step 2: 构建并推送**

```bash
bash infra/hub/build-and-push.sh
```
Expected: 日志最后出现 `✅ 推送成功：xuaustin/hub-wiki:latest` 并附 sha256。多架构（amd64 + arm64）构建约 2–4 分钟。

> 这一步让插件新版（含 `journal` 白名单）和 compose 里的新挂载点都进 Docker Hub。NAS 拉新 image 才会生效。

---

## Part B: `journal` 仓库

### Task 6: 初始化 journal 本地仓库骨架

**Files:**
- Create: `C:/Users/lorra/projects/personal/journal/.gitignore`
- Create: `C:/Users/lorra/projects/personal/journal/.stignore`
- Create: `C:/Users/lorra/projects/personal/journal/README.md`

- [ ] **Step 1: 建目录并 git init**

```bash
mkdir -p /c/Users/lorra/projects/personal/journal
cd /c/Users/lorra/projects/personal/journal
git init -b main
```

- [ ] **Step 2: 写 `.gitignore`**

内容：
```
# Obsidian workspace（跨设备不同步）
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.obsidian/workspace.json.bak

# 系统文件
.DS_Store
Thumbs.db
*.tmp
*.swp

# Syncthing 元数据
.stfolder
.stversions
```

- [ ] **Step 3: 写 `.stignore`**（Syncthing 忽略规则，对齐 Hub 仓库现有模板）

内容：
```
*.tmp
*.temp
*.swp
*.lnk
*.pst
~*.*
@eadir
.SynologyWorkingDirectory
#recycle
desktop.ini
.DS_Store
Icon\r
thumbs.db
$Recycle.Bin
@sharebin
System Volume Information
#snapshot
*.ug-tmp
(?d).*
```

- [ ] **Step 4: 写 `README.md`**（私有文档，只给自己看）

内容：
```markdown
# Journal — 个人博客

私人笔记 / 感悟 / 旅行 / 访谈 / 设计人生。

## 结构

- `content/essays/` — 人生感悟、随笔
- `content/travel/` — 旅行日志
- `content/leisure/` — 打球、出游、娱乐
- `content/interviews/` — 访谈记录
- `content/life-design/` — 设计人生笔记

## 部署

内容通过 Syncthing 同步到 NAS `/volume1/docker/journal/content`，被 Hub (`austinxyz/second-brain`) 以只读 volume 挂载方式嵌入到 `http://10.0.0.20:7777/journal/`，**仅家庭内网可读**。

## Frontmatter 模板

\`\`\`markdown
---
title: 文章标题
date: 2026-04-23
tags: [travel, china-2026]
draft: false
---
\`\`\`

`draft: true` 的文件 Quartz 会自动跳过，可用来打草稿。

## 文件命名

`YYYY-MM-DD-主题.md`，例如 `2026-04-15-香港三日.md`。
```

- [ ] **Step 5: 提交骨架**

```bash
git add .gitignore .stignore README.md
git commit -m "chore: 初始化 journal 仓库骨架"
```

---

### Task 7: MVP 目录 + 首页 + Hello World

**Files（都在 `C:/Users/lorra/projects/personal/journal/`）：**
- Create: `content/index.md`
- Create: `content/essays/.gitkeep`
- Create: `content/travel/.gitkeep`
- Create: `content/leisure/.gitkeep`
- Create: `content/interviews/.gitkeep`
- Create: `content/life-design/.gitkeep`
- Create: `content/essays/2026-04-23-hello.md`

- [ ] **Step 1: 建 5 个分类目录，每个放 `.gitkeep`**

```bash
cd /c/Users/lorra/projects/personal/journal
mkdir -p content/{essays,travel,leisure,interviews,life-design}
touch content/essays/.gitkeep content/travel/.gitkeep content/leisure/.gitkeep content/interviews/.gitkeep content/life-design/.gitkeep
```

- [ ] **Step 2: 写 `content/index.md`**

内容：
```markdown
---
title: Journal
---

# ✍️ Journal

生活感悟、旅行、访谈、设计人生 —— 给未来的自己看。

## 分类

- [[essays/|📝 随笔 · 人生感悟]]
- [[travel/|🌏 旅行日志]]
- [[leisure/|🎾 休闲娱乐]]
- [[interviews/|🎤 访谈记录]]
- [[life-design/|🧭 设计人生]]

## 最新

_（内容上线后陆续填充；也可以用 Quartz 的 recent notes 组件自动列出）_
```

- [ ] **Step 3: 写 `content/essays/2026-04-23-hello.md`**（验证用的 hello world）

内容：
```markdown
---
title: 开张
date: 2026-04-23
tags: [meta]
draft: false
---

# 开张

从今天开始，把散落在 Notion、笔记本、脑子里的东西搬到这里。

一个比朋友圈慢、比博客私、比日记有结构的地方。
```

- [ ] **Step 4: 提交 MVP 骨架**

```bash
git add content/
git commit -m "feat: 初始化 MVP 目录结构与首页"
```

---

### Task 8: 推到 GitHub（private）

**执行方：** user + agent（gh CLI 可以自动建 repo）

- [ ] **Step 1: 用 gh CLI 建 private repo 并推送**

```bash
cd /c/Users/lorra/projects/personal/journal
gh repo create austinxyz/journal --private --source=. --remote=origin --push
```
Expected: GitHub 新建 `austinxyz/journal` 仓库（private），本地 main 推上去。

> 若 gh 没登录 / 没权限，人工在 github.com 建 private repo，然后：
> ```bash
> git remote add origin https://github.com/austinxyz/journal.git
> git push -u origin main
> ```

- [ ] **Step 2: 验证**

```bash
gh repo view austinxyz/journal --json visibility,defaultBranchRef
```
Expected: `"visibility": "PRIVATE"` 且 `defaultBranchRef.name = "main"`。

---

## Part C: NAS 部署（由 user 在 NAS 上执行）

### Task 9: NAS 上 Syncthing 接入 + 拉镜像

**执行方：** user（在 NAS 上 SSH 操作）

- [ ] **Step 1: Syncthing 配置**

- 在本机 Syncthing 里添加 `C:\Users\lorra\projects\personal\journal` 作为同步源
- 在 NAS Syncthing 里接收，目标路径 `/volume1/docker/journal`
- 忽略规则用仓库内 `.stignore`（Syncthing 会自动读取）
- 等待首次同步完成，确认 NAS 上存在 `/volume1/docker/journal/content/index.md`

- [ ] **Step 2: 拉新 image 并重启 Hub**

```bash
# SSH 到 NAS
cd /volume1/docker/second-brain/infra/hub   # 或实际目录
docker compose -f docker-compose.nas.yml pull
docker compose -f docker-compose.nas.yml up -d
```
Expected: `hub-quartz` 容器状态 `Up`。首次 Quartz 构建 2–3 分钟，之后 `http://10.0.0.20:7777/journal/` 应能访问。

- [ ] **Step 3: 浏览器端验证**

访问 `http://10.0.0.20:7777/journal/`，预期看到：
- Journal 首页（"开张"文章列表里至少有 hello world 这篇）
- 5 个分类链接能点进去（即使是空目录也应该有 folder page）
- 从 Hub 首页（`/`）的"🎮 娱乐"区能点击 Journal 卡片跳到 `/journal/`

---

## Part D: MVP 内容搬运（user 操作）

### Task 10: Notion 精选 3–5 篇

**执行方：** user

- [ ] **Step 1: Notion 导出**

- 登录 Notion，打开个人文集（链接：https://www.notion.so/5b25eb023ff94801b209ed1e2d872db1 ）
- 从里面挑 3–5 篇最成熟的页面
- 每篇用 `Export → Markdown & CSV`，下载 zip

- [ ] **Step 2: 清理 & 归档到 journal**

对每个导出的 `.md` 文件：
1. 文件名 rename 为 `YYYY-MM-DD-主题.md`（删掉 Notion 生成的 UUID 后缀）
2. 顶部加 frontmatter：
   ```markdown
   ---
   title: 文章标题
   date: YYYY-MM-DD
   tags: [essay]
   draft: false
   ---
   ```
3. 目测一遍，拍平嵌套 toggle（Notion 导出经常会留奇怪的缩进）
4. 图片：如果 Notion 导出带 `images/` 子目录，把图片放到 `content/essays/<文章slug>/` 并调整 markdown 里路径为相对路径
5. 放到 `content/essays/` 或合适分类

- [ ] **Step 3: 本地预览（可选）**

如果你想在推 NAS 前先本地预览，参考 `second-brain` 仓库 README 的"本地开发"一节。

- [ ] **Step 4: commit + push**

```bash
cd /c/Users/lorra/projects/personal/journal
git add content/essays/
git commit -m "content: 从 Notion 精选 N 篇随笔"
git push
```

---

### Task 11: 中国行笔记 2–3 篇

**执行方：** user

> 提示：源笔记可能在 `C:\Users\lorra\projects\personal\china\` 目录，也可能在 Notion / 本地笔记 / 手机里。

- [ ] **Step 1: 挑内容**

- 1–2 篇旅行日志 → `content/travel/`
- 1 篇最满意的访谈 or 设计人生笔记 → `content/interviews/` 或 `content/life-design/`

- [ ] **Step 2: 按 frontmatter + 命名规范改写**（同 Task 10 Step 2）

- [ ] **Step 3: commit + push**

```bash
cd /c/Users/lorra/projects/personal/journal
git add content/
git commit -m "content: 中国行笔记 N 篇"
git push
```

---

## Part E: 验收

### Task 12: 端到端验收

**执行方：** user + agent

对照 spec 验收清单逐条过一遍：

- [ ] **Check 1: `github.com/austinxyz/journal` 建好（private）**

```bash
gh repo view austinxyz/journal --json visibility,defaultBranchRef | grep PRIVATE
```

- [ ] **Check 2: NAS 目录同步跑通**

```bash
# 在本机改一个文件（加个空格再删掉），看 NAS 是否同步到
ls /volume1/docker/journal/content/essays/*.md 2>&1 | wc -l    # SSH 到 NAS 执行
```
Expected: 数字 ≥ 4（hello + 至少 3 篇 Notion 迁移内容）。

- [ ] **Check 3: Hub 5 处改动已合入 main 并部署生效**

```bash
cd /c/Users/lorra/projects/personal/overall/austin-second-brain
git log --oneline main -5     # 应看到 "feat: 接入 journal ..." 这条
```

NAS 上：
```bash
docker inspect hub-quartz --format '{{.Image}}'
```
Expected: image id 和最新推送的 sha 对得上（或 `docker compose ps` 显示最近启动时间）。

- [ ] **Check 4: Hub 首页 Journal 卡片可点**

浏览器打开 `http://10.0.0.20:7777/`，"🎮 娱乐" 区里有 Journal 卡片（不是"待建"），点击跳到 `/journal/`。

- [ ] **Check 5: MVP 内容 5–8 篇分散在分类里**

浏览器点每个分类（essays / travel / leisure / interviews / life-design）folder page，确认文章列表能展开。

- [ ] **Check 6: Wikilink 测试**

随便找一篇 journal 文章，里面如果有 `[[other-file]]` 或 `[[subfolder/file.md]]` 这类内部链接，点一下确认跳对（说明 kbLinkRewrite 对 journal 生效了）。

如果某篇没有内部链接可测，手动在 hello.md 里加一个：
```markdown
推荐读：[[2026-04-23-hello|开张]]（指向自己，纯测试）
```

- [ ] **Check 7: `draft: true` 隐藏验证**

临时在某篇 frontmatter 设 `draft: true`，同步到 NAS，重启容器（或等下次增量构建），确认该页面在站点上看不到。验完改回 `draft: false`。

- [ ] **Check 8: 归档整理**

- [ ] spec 文档归入 `docs/superpowers/specs/`（已完成）
- [ ] 本实施计划归入 `docs/superpowers/plans/`（本文件）
- [ ] 更新 `austin-second-brain` 的 `README.md`，"相关仓库"表加入 journal 条目（note 是 private）
- [ ] 更新 `CLAUDE.md`，新增 KB 步骤列表从 3 个示例 KB 加上 journal

---

## 回滚 / 应急

**如果 Hub 部署后首页挂了**：
- NAS `docker compose logs hub-quartz | tail -50` 看报错
- 常见问题：`/volume1/docker/journal/content` 目录不存在 → 挂载失败 → 整个容器起不来。先去 NAS 上建空目录再重启。

**如果 journal 内容里有 wikilink 跳错**：
- 先确认新 image 已拉（Task 5 → Task 9 Step 2）
- 按现有 CLAUDE.md "快速诊断" 表排查

**如果误推了私有内容到 public 仓**：
- 立刻 rewrite history + force push（但 force push 到 main 需要你明确授权，我不会主动做）
- 改掉可能暴露的凭证
