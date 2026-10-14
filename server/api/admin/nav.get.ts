import { defineEventHandler } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { getSites } from '../../utils/db'

/** 后台读取网址导航数据 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return getSites()
})
