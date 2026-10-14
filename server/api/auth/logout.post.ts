import { defineEventHandler } from 'h3'
import { useAdminSession } from '../../utils/auth'

/** 退出登录：清空会话 */
export default defineEventHandler(async (event) => {
  const session = await useAdminSession(event)
  await session.clear()
  return { ok: true }
})
