import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { getPage, listPages } from '../../../utils/db'

/** 后台页面查询：?path= 取单个（含正文），否则返回列表 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { path } = getQuery(event)
  if (path) {
    const page = await getPage(String(path))
    if (!page) throw createError({ statusCode: 404, statusMessage: '页面不存在' })
    return page
  }
  return listPages()
})
