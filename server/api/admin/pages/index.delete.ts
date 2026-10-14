import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { deletePage } from '../../../utils/db'

/** 删除页面 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { path } = await readBody<{ path?: string }>(event)
  if (!path) throw createError({ statusCode: 400, statusMessage: '缺少页面路径' })

  const removed = await deletePage(String(path))
  if (!removed) throw createError({ statusCode: 404, statusMessage: '页面不存在' })
  return { ok: true }
})
