/**
 * Nuxt Content v3 集合项在运行时结构较宽松（数据来自 DB 查询），
 * 这里统一以 unknown 接收、在函数内部收窄，避免使用 any。
 */

/** 页面 / 组件中引用的内容项（用于 props 与局部类型标注） */
export interface ContentItem {
  id: string
  path?: string
  title?: string
}

/** 目录项：拍平后的标题，带层级 */
export type TocItem = { id: string; text: string; depth: number }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** 安全读取字符串字段 */
function stringField(source: unknown, key: string): string | undefined {
  if (!isRecord(source)) return undefined
  const value = source[key]
  return typeof value === 'string' ? value : undefined
}

/**
 * Nuxt Content 集合项的 id 形如 `blog/blog/django/本地文件上传.md`：
 *   - 去掉开头的 `blog/` 集合前后缀和 `.md` 扩展名后，剩余各段为 [分类, ...文件名]
 * 而 path 字段会被 slug 化（中文被剥离、转小写），纯中文文件名会撞成同一个 path，
 * 因此一律用 id 作为唯一标识来源。
 */
function partsOf(id?: string): string[] {
  if (!id) return []
  return id.replace(/\.md$/, '').split('/').slice(2)
}

/** 是否为真实文章项（目录索引项没有 .md 后缀） */
export function isArticle(item: unknown): boolean {
  const id = stringField(item, 'id')
  return !!id && id.endsWith('.md')
}

/** 当前文章所属分类（一级目录名，如 django / docker） */
export function categoryOf(item: unknown): string {
  return partsOf(stringField(item, 'id'))[0] || '未分类'
}

/** 文章标题：优先 Nuxt Content 自动生成的 title，回退到文件名 */
export function articleTitle(item: unknown): string {
  const title = stringField(item, 'title')
  if (title) return title
  const parts = partsOf(stringField(item, 'id'))
  return parts[parts.length - 1] ?? ''
}

/** 文章详情页 URL（用原始中文路径，唯一） */
export function articleHref(item: unknown): string {
  if (!item) return '#'
  return `/blog/${partsOf(stringField(item, 'id')).join('/')}`
}

/**
 * 从 Nuxt Content v3 的 body（minimark 树）中提取纯文本。
 * minimark 元素为 `[tag, props, ...children]`，文本节点即字符串。
 */
export function bodyTextOf(doc: unknown): string {
  if (!doc) return ''
  const parts: string[] = []
  const walk = (node: unknown): void => {
    if (node == null) return
    if (typeof node === 'string') {
      parts.push(node)
      return
    }
    if (Array.isArray(node)) {
      for (const child of node) walk(child)
      return
    }
    if (isRecord(node)) {
      if (node.type === 'text' && typeof node.value === 'string') parts.push(node.value)
      if (Array.isArray(node.children)) for (const child of node.children) walk(child)
      else if (Array.isArray(node.value)) for (const child of node.value) walk(child)
    }
  }
  const source = isRecord(doc) ? (doc.body ?? doc) : doc
  walk(source)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

/** 估算阅读时长（中文按 350 字/分钟，英文按 200 词/分钟） */
export function readingTimeOf(doc: unknown): number {
  const text = bodyTextOf(doc)
  if (!text) return 0
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length
  const words = text.replace(/[\u4e00-\u9fff]/g, ' ').trim().split(/\s+/).filter(Boolean).length
  const minutes = cjk / 350 + words / 200
  return Math.max(1, Math.ceil(minutes))
}

/** 正文总字数（用于展示） */
export function wordCountOf(doc: unknown): number {
  const text = bodyTextOf(doc)
  if (!text) return 0
  return text.replace(/\s+/g, '').length
}

/** 目录：取 body.toc.links，并拍平成带 depth 的列表供滚动高亮 */
export function tocOf(doc: unknown): TocItem[] {
  const body = isRecord(doc) ? doc.body : undefined
  const toc = isRecord(body) ? body.toc : undefined
  const links = isRecord(toc) ? toc.links : undefined
  if (!Array.isArray(links)) return []

  const out: TocItem[] = []
  const walk = (items: unknown[], depth: number): void => {
    for (const item of items) {
      if (!isRecord(item)) continue
      const id = item.id
      if (typeof id !== 'string') continue
      const text = typeof item.text === 'string'
        ? item.text
        : typeof item.title === 'string' ? item.title : ''
      out.push({ id, text, depth })
      if (Array.isArray(item.children)) walk(item.children, depth + 1)
    }
  }
  walk(links, 1)
  return out
}
