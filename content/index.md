---
title: Austin 的第二大脑
---

<style>
  /* 隐藏默认 H1（hero 自带标题） */
  article > h1:first-of-type { display: none; }

  /* === Hero === */
  .hub-hero {
    margin: 1rem 0 2.5rem;
    padding: 2.5rem 2rem;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--secondary) 0%, var(--tertiary) 100%);
    color: white;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
  }
  .hub-hero::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .hub-hero h1 {
    margin: 0 0 0.5rem;
    font-size: 2.4rem;
    font-weight: 700;
    color: white;
    border: none;
    line-height: 1.2;
  }
  .hub-hero p {
    margin: 0;
    font-size: 1.05rem;
    opacity: 0.92;
    font-weight: 300;
  }

  /* === Section header === */
  .hub-section {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    margin: 2.5rem 0 1.25rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--lightgray);
  }
  .hub-section h2 {
    margin: 0;
    font-size: 1.5rem;
    border: none;
    padding: 0;
  }
  .hub-section .hub-section-desc {
    color: var(--gray);
    font-size: 0.9rem;
  }

  /* === Card grid === */
  .hub-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1rem;
    margin: 0 0 1rem;
  }
  .hub-card {
    display: flex !important;
    flex-direction: column;
    box-sizing: border-box;
    padding: 1.5rem !important;
    min-height: 180px;
    border: 1px solid var(--lightgray);
    border-radius: 12px;
    background: var(--light);
    text-decoration: none !important;
    color: var(--dark) !important;
    transition: all 0.2s ease;
    position: relative;
    line-height: 1.5;
  }
  .hub-card:hover {
    transform: translateY(-3px);
    border-color: var(--secondary);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    background: var(--light);
  }
  /* 重置所有子元素的默认 margin，防止各类浏览器/Quartz 默认样式影响对齐 */
  .hub-card > * {
    margin: 0;
  }
  .hub-card-icon {
    font-size: 2rem;
    line-height: 1;
    height: 2.25rem;
    display: flex;
    align-items: center;
    margin-bottom: 0.6rem !important;
  }
  .hub-card-title {
    font-weight: 600;
    font-size: 1.05rem;
    margin-bottom: 0.35rem !important;
    color: var(--dark);
  }
  .hub-card-desc {
    font-size: 0.85rem;
    color: var(--darkgray);
    line-height: 1.5;
    margin-bottom: 0.75rem !important;
    flex-grow: 1;  /* 占据剩余空间，把 tag 挤到底部 */
  }
  .hub-card-tag {
    display: inline-block;
    align-self: flex-start;  /* 不拉伸，靠左 */
    font-size: 0.7rem;
    padding: 3px 10px;
    border-radius: 4px;
    background: var(--highlight);
    color: var(--secondary);
    font-weight: 500;
    margin-top: auto !important;  /* flex 下推到底部 */
  }
  .hub-card-tag.tag-wip {
    background: rgba(220, 165, 80, 0.15);
    color: #b8860b;
  }
  .hub-card-tag.tag-ext {
    background: rgba(120, 120, 200, 0.15);
    color: var(--secondary);
  }
  /* 平台品牌色标签 */
  .hub-card-tag.tag-juejin   { background: rgba(30, 128, 255, 0.15);  color: #1e80ff; }
  .hub-card-tag.tag-medium   { background: rgba(0, 171, 108, 0.15);   color: #00ab6c; }
  .hub-card-tag.tag-linkedin { background: rgba(0, 119, 181, 0.15);   color: #0077b5; }
  .hub-card-tag.tag-github   { background: rgba(80, 80, 90, 0.2);     color: #4e4e4e; }
  [saved-theme="dark"] .hub-card-tag.tag-github { color: #c0c0c8; }

  /* External link 标记 */
  .hub-card[data-ext]::after {
    content: "↗";
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: var(--gray);
    font-size: 0.9rem;
  }

  /* === 双链接卡片（访问地址 + GitHub 源码） === */
  .hub-card-wrap {
    position: relative;
    display: flex;
  }
  .hub-card-wrap > .hub-card {
    flex: 1;
    padding-bottom: 2.75rem !important;  /* 给底部 GitHub 链接留空间 */
  }
  .hub-card-repo {
    position: absolute;
    bottom: 0.85rem;
    right: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.72rem;
    padding: 3px 10px;
    border-radius: 4px;
    background: rgba(80, 80, 90, 0.12);
    color: var(--darkgray) !important;
    text-decoration: none !important;
    z-index: 2;
    transition: background 0.15s ease;
  }
  .hub-card-repo:hover {
    background: rgba(80, 80, 90, 0.25);
  }
  [saved-theme="dark"] .hub-card-repo {
    background: rgba(255, 255, 255, 0.08);
    color: #c0c0c8 !important;
  }
  [saved-theme="dark"] .hub-card-repo:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  /* === 笔记/提示区 === */
  .hub-notes {
    margin: 2rem 0;
    padding: 1.25rem 1.5rem;
    background: var(--highlight);
    border-left: 3px solid var(--secondary);
    border-radius: 6px;
  }
  .hub-notes h3 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    border: none;
  }
  .hub-notes ul {
    margin: 0;
    padding-left: 1.2rem;
    font-size: 0.9rem;
  }

  /* 暗色模式微调 */
  [saved-theme="dark"] .hub-card {
    background: rgba(255, 255, 255, 0.03);
  }
  [saved-theme="dark"] .hub-card:hover {
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  [saved-theme="dark"] .hub-hero {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  }
  [saved-theme="dark"] .hub-card-tag.tag-wip {
    background: rgba(220, 165, 80, 0.2);
    color: #e0b070;
  }
</style>

# Austin 的第二大脑

<div class="hub-hero">
  <h1>🧠 Austin 的第二大脑</h1>
  <p>家庭内网知识导航 · 思考的延伸 · 工具的总和</p>
</div>

<div class="hub-section">
  <h2>🌐 我的链接</h2>
  <span class="hub-section-desc">写作 · 代码 · 职场</span>
</div>

<div class="hub-grid">
  <a class="hub-card" href="https://juejin.cn/user/2719523382507658/posts" data-ext>
    <div class="hub-card-icon">💎</div>
    <div class="hub-card-title">掘金</div>
    <div class="hub-card-desc">中文技术写作社区 · 工程实践、AI、效率工具</div>
    <span class="hub-card-tag tag-juejin">技术博客</span>
  </a>

  <a class="hub-card" href="https://medium.com/@austin.xyz" data-ext>
    <div class="hub-card-icon">✒️</div>
    <div class="hub-card-title">Medium</div>
    <div class="hub-card-desc">英文长文 · 技术深度文章与观点</div>
    <span class="hub-card-tag tag-medium">技术博客</span>
  </a>

  <a class="hub-card" href="https://www.linkedin.com/in/austin-xyz/" data-ext>
    <div class="hub-card-icon">👔</div>
    <div class="hub-card-title">LinkedIn</div>
    <div class="hub-card-desc">职业经历 · 工作动态 · 行业网络</div>
    <span class="hub-card-tag tag-linkedin">职场</span>
  </a>

  <a class="hub-card" href="https://github.com/austinxyz" data-ext>
    <div class="hub-card-icon">🐙</div>
    <div class="hub-card-title">GitHub</div>
    <div class="hub-card-desc">开源项目 · 代码仓库 · 实验性工具</div>
    <span class="hub-card-tag tag-github">代码</span>
  </a>
</div>

<div class="hub-section">
  <h2>🏠 生活</h2>
  <span class="hub-section-desc">家庭财务 · 投资理财 · 照片</span>
</div>

<div class="hub-grid">
  <a class="hub-card" href="/wealth/output/00-MOC-个人数据">
    <div class="hub-card-icon">💰</div>
    <div class="hub-card-title">财富知识库</div>
    <div class="hub-card-desc">账户类型 · 税务策略 · 退休规划 · 中美对比</div>
    <span class="hub-card-tag">130+ 条目</span>
  </a>

  <div class="hub-card-wrap">
    <a class="hub-card" href="http://10.0.0.20:3000" data-ext>
      <div class="hub-card-icon">📈</div>
      <div class="hub-card-title">Finance</div>
      <div class="hub-card-desc">个人财务分析工具，预算追踪、投资组合管理</div>
      <span class="hub-card-tag tag-ext">编程项目</span>
    </a>
    <a class="hub-card-repo" href="https://github.com/austinxyz/finance" title="源码仓库">🐙 GitHub</a>
  </div>

  <a class="hub-card" href="/stock/wiki/">
    <div class="hub-card-icon">📊</div>
    <div class="hub-card-title">股票知识库</div>
    <div class="hub-card-desc">股票研究 · 量化策略 · 个股笔记</div>
    <span class="hub-card-tag">知识库</span>
  </a>

  <a class="hub-card" href="http://10.0.0.20:2283" data-ext>
    <div class="hub-card-icon">🖼️</div>
    <div class="hub-card-title">Immich 照片</div>
    <div class="hub-card-desc">家庭照片库，智能识别与时间线浏览 · 内网访问</div>
    <span class="hub-card-tag tag-ext">媒体</span>
  </a>
</div>

<div class="hub-section">
  <h2>💼 工作</h2>
  <span class="hub-section-desc">求职 · 职业规划</span>
</div>

<div class="hub-grid">
  <a class="hub-card" href="/job/wiki/">
    <div class="hub-card-icon">🎯</div>
    <div class="hub-card-title">求职知识库</div>
    <div class="hub-card-desc">面试准备 · 简历优化 · 谈薪策略 · 行业研究</div>
    <span class="hub-card-tag">知识库</span>
  </a>
</div>

<div class="hub-section">
  <h2>📖 学习</h2>
  <span class="hub-section-desc">AI · 技术 · 成长</span>
</div>

<div class="hub-grid">
  <a class="hub-card" href="/llm/wiki/">
    <div class="hub-card-icon">🤖</div>
    <div class="hub-card-title">AI / LLM 知识库</div>
    <div class="hub-card-desc">LLM 原理 · 提示词工程 · Agent 构建</div>
    <span class="hub-card-tag tag-wip">即将建立</span>
  </a>

  <div class="hub-card-wrap">
    <a class="hub-card" href="http://10.0.0.20:3001" data-ext>
      <div class="hub-card-icon">🌱</div>
      <div class="hub-card-title">Growing</div>
      <div class="hub-card-desc">学习，求职</div>
      <span class="hub-card-tag tag-ext">编程项目</span>
    </a>
    <a class="hub-card-repo" href="https://github.com/austinxyz/growing" title="源码仓库">🐙 GitHub</a>
  </div>

  <a class="hub-card" href="https://austinxyz.github.io/blogs/" data-ext>
    <div class="hub-card-icon">💻</div>
    <div class="hub-card-title">技术博客</div>
    <div class="hub-card-desc">编程、工具、AI 实践 · GitHub Pages</div>
    <span class="hub-card-tag tag-ext">博客</span>
  </a>
</div>

<div class="hub-section">
  <h2>🎮 娱乐</h2>
  <span class="hub-section-desc">运动 · 兴趣爱好</span>
</div>

<div class="hub-grid">
  <div class="hub-card-wrap">
    <a class="hub-card" href="https://tennis-lineup.fly.dev/" data-ext>
      <div class="hub-card-icon">🎾</div>
      <div class="hub-card-title">Tennis</div>
      <div class="hub-card-desc">网球训练数据记录与分析</div>
      <span class="hub-card-tag tag-ext">编程项目</span>
    </a>
    <a class="hub-card-repo" href="https://github.com/austinxyz/tennis-lineup" title="源码仓库">🐙 GitHub</a>
  </div>

  <a class="hub-card" href="#">
    <div class="hub-card-icon">✍️</div>
    <div class="hub-card-title">个人博客</div>
    <div class="hub-card-desc">生活、思考、记录</div>
    <span class="hub-card-tag tag-wip">待建</span>
  </a>
</div>

<div class="hub-notes">
  <h3>📝 笔记系统</h3>
  <ul>
    <li><strong>Notion</strong> — 云端日常捕捉，跨设备同步</li>
    <li><strong>Obsidian</strong> — 本地知识加工，各知识库独立 Vault</li>
  </ul>
</div>

<div class="hub-notes">
  <h3>🔍 使用提示</h3>
  <ul>
    <li>左侧搜索框支持中英文全文检索</li>
    <li>左侧 Explorer 浏览所有知识库</li>
    <li>右侧 Graph 查看知识图谱与反向链接</li>
    <li>页面右上角切换暗色模式</li>
  </ul>
</div>
