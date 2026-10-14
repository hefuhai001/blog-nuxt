import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { deletePost } from '../../../utils/db'

/** 删除文章 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = await readBody<{ id?: string }>(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少文章 id' })

  const removed = await deletePost(String(id))
  if (!removed) throw createError({ statusCode: 404, statusMessage: '文章不存在' })
  return { ok: true }
})
