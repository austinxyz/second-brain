import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { KBLinkRewrite } from "./quartz/plugins/transformers/kbLinkRewrite"

/**
 * Austin 的第二大脑 — Hub Quartz 配置
 * 统一承载各知识库、项目导航、博客入口
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "🧠 Austin 的第二大脑",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "zh-CN",
    baseUrl: "10.0.0.20:8080",
    ignorePatterns: [
      "private",
      "templates",
      ".obsidian",
      ".trash",
      ".DS_Store",
      "**/.git/**",
      "**/node_modules/**",
      "infra/**",
      // 各 KB 的敏感 output 子目录
      "wealth/output/账户凭证/**",
    ],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a98c",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a98c",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      // 必须在 OFM 之后、CrawlLinks 之前：给各 KB 内带路径的 wikilink 自动补前缀
      KBLinkRewrite(),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({
        markBroken: true,
        // shortest: 用 Obsidian 风格解析——按文件名/路径片段全站搜索最短匹配
        // 关键作用：让各 KB（wealth/job/llm）原本独立站点的相对/绝对链接
        // 在嵌入 Hub 后无需改动即可正常工作
        markdownLinkResolution: "shortest",
      }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
