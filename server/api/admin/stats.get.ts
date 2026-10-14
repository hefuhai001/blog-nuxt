import { defineEventHandler } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { getStats } from '../../utils/db'

/** 后台概览计数 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return getStats()
})
