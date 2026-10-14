function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** 从 Nuxt Content v3 的 body（minimark 树）提取纯文本 */
export function extractBodyText(doc: unknown): string {
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

/** 分类 = id 的 `blog/blog/<分类>/xxx.md` 中的第一段 */
export function categoryOfId(id?: string): string {
  if (!id) return '未分类'
  return String(id).replace(/\.md$/, '').split('/').slice(2)[0] || '未分类'
}

/** 文章详情页 URL（用原始中文路径，唯一） */
export function articleUrlOf(id?: string): string {
  if (!id) return ''
  return `/blog/${String(id).replace(/\.md$/, '').split('/').slice(2).join('/')}`
}
