import { createError, defineEventHandler, readBody } from 'h3'
import { safeEqual, useAdminSession } from '../../utils/auth'

/** 后台登录：校验用户名/密码，成功写入会话 */
export default defineEventHandler(async (event) => {
  const { username, password } = await readBody<{ username?: string; password?: string }>(event)
  const config = useRuntimeConfig(event)

  // 两个比较都执行后再判断，避免 && 短路削弱恒定时间
  const userOk = safeEqual(String(username ?? ''), String(config.adminUser))
  const passOk = safeEqual(String(password ?? ''), String(config.adminPassword))
  if (!(userOk && passOk)) {
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误' })
  }

  const session = await useAdminSession(event)
  await session.update({ user: String(config.adminUser), loggedInAt: Date.now() })
  return { user: { name: String(config.adminUser) } }
})
