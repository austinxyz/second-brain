# CLAUDE.md

给 Claude Code 的项目指引。全局规则见 `~/.claude/rules/`，这里只写本项目特有的约定。

## 项目定位

Quartz v4 壳层站点，在 Docker 里嵌入多个独立知识库（wealth / job / stock / journal / llm...），部署在家庭 NAS。
详细架构见 [README.md](./README.md)。

## 核心约束

### 1. 这是公开仓库（`austinxyz/second-brain`）

- **严禁提交明文账号密码**（index.md / 任何文件都不行）
- 内网凭证记在用户自建的私人仓库里，不在这里
- Immich 等账号提示最多用"暗号"（user 的个人记忆符号，如 `rule1+@+rule3`），不贴真值

### 2. Docker Hub 账号 ≠ GitHub 账号

- Docker Hub username: **`xuaustin`**（镜像推到 `xuaustin/hub-wiki`）
- GitHub username: `austinxyz`
- 别把两者混了

### 3. 新增 KB 是四处改动

每加一个新 KB 必须同时改（缺一就链接 404 或不挂载）：

1. `infra/hub/quartz-plugins/kbLinkRewrite.ts` 的 `KBS` 常量数组
2. `infra/hub/.env.example` 加 `<KB>_WIKI=...`
3. `infra/hub/docker-compose.nas.yml` 加挂载
4. `infra/hub/docker-compose.ugos.yml` 加挂载
5. `content/index.md` 加卡片入口

### 4. 镜像内容 vs NAS 挂载

- **镜像里**：只有 Quartz v4 + `quartz.config.ts` + `quartz.layout.ts` + `kbLinkRewrite.ts`
- **NAS 挂载**：`content/index.md`、`blog/`、`projects/` 都是从 NAS volume 挂载的（Syncthing 同步源）
- 改 `content/*.md` → 同步到 NAS 即可，不用重 build
- 改 `quartz.config.ts` / `kbLinkRewrite.ts` / `Dockerfile` → **必须重 build + push + pull**

## 端口

- 当前 NAS 部署用 **7777**（避开 Chrome 封禁的 IRC 端口如 6667 / 6666）
- `.env.example` 和 `docker-compose.*.yml` 里的默认值（9999）只是占位，以 `.env` 实际为准
- `quartz.config.ts` 的 `baseUrl` 目前写 `10.0.0.20:8080` 是容器内端口，无实质影响

## Wikilink 解析规则（容易踩坑）

Quartz 的 `markdownLinkResolution: "shortest"` **只能匹配单文件名**。带路径的 wikilink（如 `[[账户类型/00-MOC-账户类型]]`）会退化成"绝对路径"去站根找 → 404。

解决方案是 `kbLinkRewrite` 插件：
- 检测当前文件在某 KB 下（`wealth/...` / `stock/...`）
- 带路径的链接 → 在 KB 内按路径尾匹配；找不到就加 KB 前缀兜底
- 不动：单文件名 / `http(s):` / `mailto:` / `#锚点` / `/绝对路径` / 已有 KB 前缀

**改 KB 白名单时必须重 build 镜像**（插件代码在镜像里，不是 volume 挂载）。

## 提交与沟通风格

- 提交信息用**中文**，conventional commits 前缀（`feat:` / `fix:` / `chore:` / `docs:` 等）
- 回复用户用中文，简短直接；涉及密码 / 公开泄露类风险时主动提示再执行
- 用户常用 `/git-commit-push` skill 推送，一次完成 `add . + commit + push origin main`

## 快速诊断

| 症状 | 先查 |
|---|---|
| KB 内部链接指到站根（如 `/tickers/X` 而不是 `/stock/wiki/tickers/X`） | `kbLinkRewrite.ts` 的 `KBS` 白名单是否包含该 KB；镜像是否重 build |
| 新 KB 卡片打开 404 | compose 文件是否加了挂载；NAS 上目录是否存在；容器是否重启 |
| 壳层改了但 NAS 上没变 | Syncthing 是否同步到 `/volume1/docker/second-brain/content/`；容器是否需重启 |
| 镜像重 build 后改动没生效 | NAS 上 `docker compose pull` 了吗 |

## 不要做的事

- 不要把任何 KB 的真实内容提交到本仓库（`content/wealth/`、`content/stock/` 等路径由 volume 挂载提供）
- 不要删或改 `content/blog/.gitkeep` 和 `content/projects/.gitkeep`（保留空目录结构）
- 不要在 `quartz.config.ts` 的 `ignorePatterns` 里误伤各 KB 路径
- 不要用 `--no-verify` 绕过 hook，也不要用 `git push --force` 到 main
