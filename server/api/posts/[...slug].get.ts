/** 单篇文章详情：返回渲染后的 HTML 与目录（按更新时间做内存缓存） */
interface Rendered {
  updatedAt: string
  html: string
  toc: Array<{ id: string, text: string, depth: number }>
}

const cache = new Map<string, Rendered>()
const MAX_CACHE = 200

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: '缺少文章路径' })
  }
  const id = `blog/blog/${slug}.md`
  const post = await getPost(id)
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: '文章不存在' })
  }

  let rendered = cache.get(id)
  if (!rendered || rendered.updatedAt !== post.updatedAt) {
    const result = renderMarkdown(post.bodyMd)
    rendered = { updatedAt: post.updatedAt, html: result.html, toc: result.toc }
    if (cache.size >= MAX_CACHE) {
      const oldest = cache.keys().next().value
      if (oldest !== undefined) cache.delete(oldest)
    }
    cache.set(id, rendered)
  }

  return {
    id: post.id,
    slug: post.slug,
    category: post.category,
    title: post.title,
    description: post.description,
    text: post.text,
    words: post.words,
    readingTime: post.readingTime,
    html: rendered.html,
    toc: rendered.toc,
  }
})
