import { QuartzTransformerPlugin } from "../types"
import { visit } from "unist-util-visit"
import type { Root, Link } from "mdast"
import type { VFile } from "vfile"

/**
 * KBLinkRewrite — 让嵌入 Hub 的独立 KB 站点的内部 wikilink 正常工作
 *
 * 背景：wealth / job / llm 各自原本是独立 Quartz 站点，内部 wikilink 按"vault 根"写。
 * 嵌入 Hub 后，Quartz 的 "shortest" 策略只匹配单文件名，对带路径的 wikilink
 * （如 `[[output/xxx/yyy]]`、`[[账户类型/00-MOC-账户类型]]`）无能为力，
 * 退化为 absolute 解析 → 站根 → 404。
 *
 * 修法：检测当前文件位于某个 KB 子目录时，对带路径的 link 在 ctx.allSlugs 里
 * 按"路径尾匹配"找真实位置（KB 内优先，再全局），找不到才回退加 KB 前缀。
 *
 * 不动的情况：
 *   - 单文件名 wikilink（交给 markdownLinkResolution="shortest"）
 *   - external/anchor/root-absolute 链接
 *   - 已有 KB 前缀的链接
 *
 * 注意：必须注册在 ObsidianFlavoredMarkdown 之后（OFM 的 textTransform 把 `[[x]]`
 * 转成 markdown link 之后），CrawlLinks 之前。
 */

const KBS = ["wealth", "job", "llm", "stock"] as const

export const KBLinkRewrite: QuartzTransformerPlugin = () => {
  return {
    name: "KBLinkRewrite",
    markdownPlugins(ctx) {
      return [
        () => (tree: Root, file: VFile) => {
          const slug = ((file.data as Record<string, unknown>)?.slug as string) ?? ""
          const kb = KBS.find((k) => slug.startsWith(`${k}/`))
          if (!kb) return

          const allSlugs = ((ctx as Record<string, unknown>)?.allSlugs as string[]) ?? []
          const kbScopedSlugs = allSlugs.filter((s) => s.startsWith(`${kb}/`))

          visit(tree, "link", (node: Link) => {
            const dest = node.url ?? ""
            if (
              !dest ||
              /^(https?:|mailto:|#|\/)/.test(dest) ||
              KBS.some((k) => dest.startsWith(`${k}/`))
            ) {
              return
            }
            // 单文件名（无 /）交给 "shortest" 全局文件名搜索
            if (!dest.includes("/")) return

            // 1. 优先在当前 KB 范围内按路径尾匹配
            const kbMatch = kbScopedSlugs.find(
              (s) => s === `${kb}/${dest}` || s.endsWith(`/${dest}`),
            )
            if (kbMatch) {
              node.url = kbMatch
              return
            }

            // 2. 全局路径尾匹配（处理 KB 之间引用的边角情况）
            const globalMatch = allSlugs.find((s) => s.endsWith(`/${dest}`))
            if (globalMatch) {
              node.url = globalMatch
              return
            }

            // 3. 兜底：加 KB 前缀（对应文件不存在时，至少链接落在正确的 KB 命名空间下）
            node.url = `${kb}/${dest}`
          })
        },
      ]
    },
  }
}
