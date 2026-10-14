/**
 * 管理后台认证工具：加密会话 Cookie + 鉴权守卫。
 *
 * 凭据与会话密钥来自 runtimeConfig（可用环境变量覆盖）：
 *   NUXT_ADMIN_USER / NUXT_ADMIN_PASSWORD / NUXT_SESSION_PASSWORD
 */
import { createError, useSession, type H3Event, type SessionConfig } from 'h3'
import { timingSafeEqual } from 'node:crypto'

export interface AdminSession {
  user?: string
  loggedInAt?: number
}

/** 恒定时间字符串比较，避免时序侧信道 */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/** 构造当前请求的管理后台会话（加密 Cookie，8 小时有效） */
export async function useAdminSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  const sessionConfig: SessionConfig = {
    password: String(config.sessionPassword),
    name: 'nuxt-blog-admin',
    maxAge: 60 * 60 * 8,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      // 仅生产环境加 secure，保证本地 http 开发也能登录
      secure: process.env.NODE_ENV === 'production',
    },
  }
  return useSession<AdminSession>(event, sessionConfig)
}

/** 未登录则抛 401，供各管理接口前置调用 */
export async function requireAdmin(event: H3Event) {
  const session = await useAdminSession(event)
  if (!session.data.user) {
    throw createError({ statusCode: 401, statusMessage: '未登录或会话已过期' })
  }
  return session
}
