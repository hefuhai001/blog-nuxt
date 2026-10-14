import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { getPost, upsertPost } from '../../../utils/db'

interface UpdatePostBody {
  id?: string
  title?: string
  description?: string
  bodyMd?: string
}

/** 更新文章：id 不可变，复用原有 slug / category */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<UpdatePostBody>(event)
  const id = String(body.id ?? '')
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少文章 id' })

  const existing = await getPost(id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: '文章不存在' })

  return upsertPost({
    id,
    slug: existing.slug,
    category: existing.category,
    title: String(body.title ?? existing.title).trim() || existing.title,
    description: body.description,
    bodyMd: String(body.bodyMd ?? existing.bodyMd),
  })
})
