import bcrypt from 'bcryptjs'
import { createError, defineEventHandler, readBody } from 'h3'
import { getUserByName } from '../../utils/db'
import { useUserSession } from '../../utils/auth'

/** 登录：校验数据库中的用户名/密码，成功写入会话 */
export default defineEventHandler(async (event) => {
  const { username, password } = await readBody<{ username?: string; password?: string }>(event)

  const name = String(username ?? '').trim()
  const pass = String(password ?? '')

  const user = await getUserByName(name)
  // 用户不存在与密码错误返回同一提示，避免暴露用户名是否存在
  if (!user || !bcrypt.compareSync(pass, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误' })
  }

  const session = await useUserSession(event)
  await session.update({
    username: user.username,
    nickname: user.nickname,
    role: user.role,
    loggedInAt: Date.now(),
  })

  return { user: { name: user.username, nickname: user.nickname, role: user.role } }
})
