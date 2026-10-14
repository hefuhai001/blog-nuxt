/**
 * 共享 Markdown 渲染器（纯 ESM，无 Nuxt 依赖）。
 *
 * 同时被两处使用：
 * - Nitro 服务端（server/utils 自动导入）在请求时渲染正文；
 * - 内容导入脚本 scripts/import-content.mjs 复用同一套逻辑提取纯文本。
 */
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import hljs from 'highlight.js'

/** 中文友好的标题锚点：保留 CJK / 字母数字，空格转连字符 */
export function slugifyHeading(text) {
  const slug = String(text ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]+/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'section'
}

/** 渲染后的 HTML 去掉标签，得到用于搜索/统计的纯文本 */
export function htmlToText(html) {
  return String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** 估算阅读时长（中文按 350 字/分钟，英文按 200 词/分钟） */
export function estimateReadingTime(text) {
  if (!text) return 0
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length
  const words = text.replace(/[\u4e00-\u9fff]/g, ' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(cjk / 350 + words / 200))
}

/** 正文字数（去空白后计数） */
export function countWords(text) {
  if (!text) return 0
  return text.replace(/\s+/g, '').length
}

/**
 * 渲染 Markdown。
 * @param {string} src markdown 原文
 * @returns {{ html: string, toc: Array<{id:string,text:string,depth:number}>, text: string, words: number, readingTime: number }}
 */
export function renderMarkdown(src) {
  const toc = []
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: false,
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          const { value } = hljs.highlight(code, { language: lang, ignoreIllegals: true })
          return `<pre class="hljs"><code class="language-${lang}">${value}</code></pre>`
        } catch {
          /* 降级到默认转义 */
        }
      }
      return ''
    },
  })

  md.use(anchor, {
    slugify: slugifyHeading,
    level: [1, 2, 3, 4],
    permalink: false,
    callback(token, info) {
      toc.push({
        id: info.slug,
        text: token.content,
        depth: Number(String(token.tag).slice(1)),
      })
    },
  })

  const html = md.render(String(src ?? ''))
  const text = htmlToText(html)
  return { html, toc, text, words: countWords(text), readingTime: estimateReadingTime(text) }
}
