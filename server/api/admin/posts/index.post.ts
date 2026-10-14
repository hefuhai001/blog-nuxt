import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { upsertPost } from '../../../utils/db'

interface CreatePostBody {
  category?: string
  fileName?: string
  title?: string
  description?: string
  bodyMd?: string
}

/** 新建文章：由 category + fileName 拼出 id / slug */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<CreatePostBody>(event)

  const category = String(body.category ?? '').trim()
  const fileName = String(body.fileName ?? '').trim().replace(/\.md$/i, '')
  const title = String(body.title ?? '').trim()

  if (!category || !fileName || !title) {
    throw createError({ statusCode: 400, statusMessage: '分类、文件名、标题均不能为空' })
  }
  if (category.includes('/') || fileName.includes('/')) {
    throw createError({ statusCode: 400, statusMessage: '分类与文件名不能包含斜杠' })
  }

  const slug = `${category}/${fileName}`
  return upsertPost({
    id: `blog/blog/${slug}.md`,
    slug,
    category,
    title,
    description: body.description,
    bodyMd: String(body.bodyMd ?? ''),
  })
})
