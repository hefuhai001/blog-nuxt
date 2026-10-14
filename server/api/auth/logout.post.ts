import { defineEventHandler } from 'h3'
import { useUserSession } from '../../utils/auth'

/** 退出登录：清空会话 */
export default defineEventHandler(async (event) => {
  const session = await useUserSession(event)
  await session.clear()
  return { ok: true }
})
