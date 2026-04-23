# Journal — 私人博客 KB 设计

**日期**：2026-04-23
**作者**：Austin（with brainstorming skill）
**状态**：Design approved，待 implementation plan

## 目标

在 Hub（austin-second-brain）下挂一个私人博客/随笔 KB，叫 **journal**。存生活感悟、旅行日志、访谈记录、设计人生笔记、休闲娱乐（打球出游等）。仅家庭内网可读，仓库 private。

## 范围

**In scope**
- 新建 private GitHub 仓库 `austinxyz/journal`
- NAS 上建内容目录 + Syncthing 同步
- Hub 接入（kbLinkRewrite 白名单 / compose 挂载 / 首页卡片）
- MVP 内容：从 Notion 挑 3–5 篇精选 + 中国行笔记 2–3 篇

**Out of scope（明确不做）**
- Notion 全量自动导入（未来视情况做"C 路线"）
- RSS / 订阅 / 评论 / 统计 / 自定义搜索
- 中英双语切换
- 封面图自动化

## 拓扑

```
GitHub: github.com/austinxyz/journal  (Private)
   ↓ Syncthing
NAS:    /volume1/docker/journal/content/   （唯一真源）
   ↓ Docker volume mount (ro)
Hub:    /app/content/journal/  →  http://10.0.0.20:7777/journal/
```

**隐私边界**：
- Hub 部署只走家庭内网（`10.0.0.20:7777`），外网不可达
- 公开仓库 `austinxyz/second-brain` 只含"壳层"（Quartz 配置 + 插件），不含 journal 内容
- journal 内容全程在 private repo ↔ NAS ↔ 内网浏览器之间流动，不会被推到公网
- 草稿用 frontmatter `draft: true`，Quartz `RemoveDrafts` 过滤器会跳过

## 仓库内目录

```
journal/
├── README.md                      # 私有
├── .obsidian/                     # Obsidian vault 配置
├── .stignore                      # Syncthing 忽略规则
├── .gitignore
└── content/
    ├── index.md                   # Journal 首页
    ├── essays/                    # 人生感悟、随笔
    ├── travel/                    # 旅行日志（含中国行）
    ├── leisure/                   # 打球、出游、娱乐
    ├── interviews/                # 访谈记录
    └── life-design/               # 设计人生笔记
```

- 文件命名：`YYYY-MM-DD-主题.md`（中文标题可直接入文件名，Quartz 会处理 URL encoding）
- 时间轴靠文件名；跨类目聚合靠 frontmatter `tags`
- Frontmatter 模板：

```markdown
---
title: 香港三日漫记
date: 2026-04-15
tags: [travel, china-2026]
draft: false
---
```

## Hub 侧改动（`austin-second-brain` 仓库）

改动点全部打包一次 PR：

1. **`infra/hub/quartz-plugins/kbLinkRewrite.ts`**
   - `KBS` 数组加入 `"journal"`

2. **`infra/hub/.env.example`**
   - 新增 `JOURNAL_CONTENT=/volume1/docker/journal/content`

3. **`infra/hub/docker-compose.nas.yml`**
   - 新增挂载：`${JOURNAL_CONTENT:-/volume1/docker/journal/content}:/app/content/journal:ro`

4. **`infra/hub/docker-compose.ugos.yml`**
   - 同上挂载（绿联 NAS 路径风格）

5. **`content/index.md`**
   - 🎮 娱乐 区现有的"个人博客 / 待建"WIP 卡片替换为 Journal 入口：
     - 图标：`✍️`
     - 标题：`Journal`
     - 描述：`生活感悟 · 旅行 · 访谈 · 设计人生`
     - `href="/journal/"`（不加 `data-ext`）
     - Tag：`日志`（或去掉）

**部署步骤**：`bash infra/hub/build-and-push.sh` → NAS `docker compose pull && up -d`（插件代码改动，必须重 build 镜像）

## MVP 内容清单（B 路线：骨架 + 精选）

**Notion 精选** — 从个人文集里挑 3–5 篇最成熟的：
- 使用 Notion 自带 "Export → Markdown & CSV" 导出
- 人工清理：删 Notion-generated 后缀 ID、拍平嵌套 toggle、图片相对路径修正
- 入 `essays/` 或对应分类

**中国行笔记** — 从你的笔记源挑 2–3 篇：
- 1–2 篇旅行日志 → `travel/`
- 1 篇最满意的访谈 / 设计人生笔记 → `interviews/` 或 `life-design/`

**`content/index.md`**：Journal 自己的首页，5 张分类入口卡片（可复用 Hub 的 `.hub-card` CSS，也可起步用纯 markdown 链接列表）

**上线目标**：打开 Hub 首页 → 点 Journal 卡片 → 看到 5 个分类入口 + 5–8 篇真实内容（非空架子）

## 未来演化（记在档，不在本 spec 实施）

- **C 路线**：跑成熟了之后做 Notion 全量批量导入 + 自动 frontmatter 规范化脚本
- 若日后想把某些篇章公开 → 单开一个 public mirror 仓库，手动 cherry-pick

## 验收标准

- [ ] `github.com/austinxyz/journal` 建好（private）
- [ ] NAS 目录同步跑通（本地改 → NAS 可见）
- [ ] Hub 5 处改动合入 main 并部署生效
- [ ] Hub 首页 Journal 卡片可点，进去能看到 5 个分类入口
- [ ] MVP 内容：5–8 篇真实文章分布在对应分类里
- [ ] Wikilink 测试：文章内部 `[[xxx]]` 跳转正常（kbLinkRewrite 生效）
- [ ] `draft: true` 标记的文件不会出现在站点上
