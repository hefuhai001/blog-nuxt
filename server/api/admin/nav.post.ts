import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { replaceNav, type SitesData } from '../../utils/db'

/** 后台全量保存网址导航数据 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<SitesData>(event)

  if (!body || !Array.isArray(body.mySites) || !Array.isArray(body.recommendGroups)) {
    throw createError({ statusCode: 400, statusMessage: '数据格式错误：需包含 mySites 与 recommendGroups 数组' })
  }

  await replaceNav(body)
  return { ok: true }
})
