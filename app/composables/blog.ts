type BlogItem = {
  id: string
  path: string
  title?: string
}

/** 集合项可能为 null（如详情页在守卫前的 computed 值） */
type MaybeBlogItem = BlogItem | null | undefined

/**
 * Nuxt Content 集合项的 id 形如 `blog/blog/django/本地文件上传.md`：
 *   - 去掉开头的 `blog/` 集合前后缀和 `.md` 扩展名后，剩余各段为 [分类, ...文件名]
 * 而 path 字段会被 slug 化（中文被剥离、转小写），纯中文文件名会撞成同一个 path，
 * 因此一律用 id 作为唯一标识来源。
 */
function partsOf(id?: string): string[] {
  if (!id) return []
  return String(id).replace(/\.md$/, '').split('/').slice(2)
}

/** 是否为真实文章项（目录索引项没有 .md 后缀） */
export function isArticle(item: MaybeBlogItem): boolean {
  return !!item?.id && String(item.id).endsWith('.md')
}

/** 当前文章所属分类（一级目录名，如 django / docker） */
export function categoryOf(item: MaybeBlogItem): string {
  return item ? partsOf(item.id)[0] || '未分类' : '未分类'
}

/** 文章标题：优先 Nuxt Content 自动生成的 title，回退到文件名 */
export function articleTitle(item: MaybeBlogItem): string {
  if (!item) return ''
  if (item.title) return item.title
  const parts = partsOf(item.id)
  return parts[parts.length - 1] ?? ''
}

/** 文章详情页 URL（用原始中文路径，唯一） */
export function articleHref(item: MaybeBlogItem): string {
  return item ? `/blog/${partsOf(item.id).join('/')}` : '#'
}