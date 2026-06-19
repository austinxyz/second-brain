# Second Brain 概念分析

> 日期：2026-06-19

## Tiago Forte 的官方定义（Building a Second Brain / BASB）

方法论核心：CODE 四步

| 步骤 | 含义 |
|------|------|
| **C**apture | 收集值得保存的信息 |
| **O**rganize | 按 PARA 归档（Projects / Areas / Resources / Archives） |
| **D**istill | 提炼要点（Progressive Summarization） |
| **E**xpress | 输出、创作、行动 |

核心是 **capture → output 的完整闭环**，强调"为未来的自己服务"。

---

## 本系统架构映射

每个 KB（wealth / stock / job / AI / leadership…）独立维护，统一结构：

```
KB
├── raw_material  → Capture（摄入原始素材）
├── wiki          → Organize + Distill（系统化整理与提炼）
└── output        → Express（策略分析、具体输出）

hub-quartz        → 统一浏览门户（Quartz v4 聚合多 KB）
```

CODE 覆盖度：

| 维度 | 对应层 | 覆盖情况 |
|------|--------|---------|
| Capture | raw_material | ✅ 完整 |
| Organize | wiki 结构 | ✅ 完整 |
| Distill | wiki 提炼 + Karpathy LLM Wiki 方法 | ✅ 完整 |
| Express | output 目录 | ✅ 完整 |

---

## 结论

**"Second Brain" 命名完全合适。**

本系统是 BASB 的进化版，而非简化版：

- Tiago Forte 的 BASB：单一平铺结构（PARA 文件夹）
- 本系统：**多领域分库**，每个领域独立维护 raw→wiki→output 闭环，通过 hub-quartz 聚合

多 KB 分库结构更适合知识体量大、领域差异明显的场景（理财 / 股票 / 求职 / AI 各有专属工具链）。

### 命名建议

| 场景 | 建议 |
|------|------|
| 个人使用 / 项目内部 | `second-brain` / `austin-second-brain` — 完全没问题 |
| 对外展示（公开 README、课程素材） | 补充说明："多领域分库式 Second Brain"，避免与 Tiago Forte 课程混淆 |
