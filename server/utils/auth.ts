/**
 * 认证工具：加密会话 Cookie + 鉴权守卫。
 *
 * 用户与会话数据来自数据库（see db.ts）；会话签名密钥来自 runtimeConfig：
 *   NUXT_SESSION_PASSWORD
 */
import { createError, useSession, type H3Event, type SessionConfig } from 'h3'
import { timingSafeEqual } from 'node:crypto'
import type { UserRole } from './db'

export interface UserSession {
  username?: string
  nickname?: string
  role?: UserRole
  loggedInAt?: number
}

/** 恒定时间字符串比较，避免时序侧信道 */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/** 构造当前请求的用户会话（加密 Cookie，8 小时有效） */
export async function useUserSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  const sessionConfig: SessionConfig = {
    password: String(config.sessionPassword),
    name: 'nuxt-blog-session',
    maxAge: 60 * 60 * 8,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      // 仅生产环境加 secure，保证本地 http 开发也能登录
      secure: process.env.NODE_ENV === 'production',
    },
  }
  return useSession<UserSession>(event, sessionConfig)
}

/** 当前登录用户（未登录返回 null） */
export async function getSessionUser(event: H3Event): Promise<{ username: string; nickname: string; role: UserRole } | null> {
  const session = await useUserSession(event)
  const { username, nickname, role } = session.data
  if (!username) return null
  return { username, nickname: nickname ?? username, role: role === 'admin' ? 'admin' : 'user' }
}

/** 要求已登录（任意角色），否则抛 401 */
export async function requireUser(event: H3Event) {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '未登录或会话已过期' })
  }
  return user
}

/** 要求管理员角色：未登录抛 401，已登录但非管理员抛 403 */
export async function requireAdmin(event: H3Event) {
  const user = await requireUser(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: '需要管理员权限' })
  }
  return user
}
