import { createError, defineEventHandler, readBody } from 'h3'
import { createUser, getUserByName } from '../../utils/db'
import { useUserSession } from '../../utils/auth'

/**
 * 用户注册：开放自助注册，注册即 user 角色，注册成功直接登录。
 * body: { username, password, nickname? }
 */
export default defineEventHandler(async (event) => {
  const { username, password, nickname } = await readBody<{
    username?: string
    password?: string
    nickname?: string
  }>(event)

  const name = String(username ?? '').trim()
  const pass = String(password ?? '')

  if (name.length < 3 || name.length > 32) {
    throw createError({ statusCode: 400, statusMessage: '用户名长度需为 3-32 个字符' })
  }
  if (pass.length < 6) {
    throw createError({ statusCode: 400, statusMessage: '密码长度至少 6 位' })
  }

  const existing = await getUserByName(name)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: '用户名已被占用' })
  }

  const user = await createUser({ username: name, password: pass, nickname, role: 'user' })

  const session = await useUserSession(event)
  await session.update({
    username: user.username,
    nickname: user.nickname,
    role: user.role,
    loggedInAt: Date.now(),
  })

  return { user: { name: user.username, nickname: user.nickname, role: user.role } }
})
