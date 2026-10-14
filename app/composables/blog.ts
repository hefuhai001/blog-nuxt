/**
 * Nuxt Content v3 集合项在运行时结构较宽松（数据来自 DB 查询），
 * 这里统一以 unknown 接收、在函数内部收窄，避免使用 any。
 */

/** 页面 / 组件中引用的内容项（用于 props 与局部类型标注） */
export interface ContentItem {
  id: string
  path?: string
  title?: string
  category?: string
  text?: string
  words?: number
  readingTime?: number
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

/** 安全读取数字字段 */
function numberField(source: unknown, key: string): number | undefined {
  if (!isRecord(source)) return undefined
  const value = source[key]
  return typeof value === 'number' ? value : undefined
}

/** 正文纯文本（由导入时预计算并存入数据库的 plain_text 字段） */
export function bodyTextOf(doc: unknown): string {
  return stringField(doc, 'text') ?? ''
}

/** 阅读时长（分钟，由导入时预计算） */
export function readingTimeOf(doc: unknown): number {
  return numberField(doc, 'readingTime') ?? 0
}

/** 正文总字数（由导入时预计算） */
export function wordCountOf(doc: unknown): number {
  return numberField(doc, 'words') ?? 0
}

/** 目录：数据库/接口返回的拍平列表（含 id / text / depth） */
export function tocOf(doc: unknown): TocItem[] {
  if (!isRecord(doc)) return []
  const toc = doc.toc
  if (!Array.isArray(toc)) return []

  const out: TocItem[] = []
  for (const item of toc) {
    if (!isRecord(item)) continue
    if (typeof item.id !== 'string' || typeof item.text !== 'string') continue
    out.push({ id: item.id, text: item.text, depth: typeof item.depth === 'number' ? item.depth : 1 })
  }
  return out
}
