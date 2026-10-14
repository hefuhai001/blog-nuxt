import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { upsertPage } from '../../../utils/db'

interface UpdatePageBody {
  path?: string
  title?: string
  bodyMd?: string
}

/** 更新页面：path 不可变 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<UpdatePageBody>(event)
  const path = String(body.path ?? '').trim()
  const title = String(body.title ?? '').trim()

  if (!path || !title) {
    throw createError({ statusCode: 400, statusMessage: '路径与标题均不能为空' })
  }

  return upsertPage({ path, title, bodyMd: String(body.bodyMd ?? '') })
})
