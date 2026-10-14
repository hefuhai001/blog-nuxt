import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { upsertPage } from '../../../utils/db'

interface SavePageBody {
  path?: string
  title?: string
  bodyMd?: string
}

/** 新建/保存页面：以 path 为主键 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<SavePageBody>(event)
  const path = String(body.path ?? '').trim()
  const title = String(body.title ?? '').trim()

  if (!path || !title) {
    throw createError({ statusCode: 400, statusMessage: '路径与标题均不能为空' })
  }
  if (!path.startsWith('/')) {
    throw createError({ statusCode: 400, statusMessage: '路径需以 / 开头，如 /about' })
  }

  return upsertPage({ path, title, bodyMd: String(body.bodyMd ?? '') })
})
