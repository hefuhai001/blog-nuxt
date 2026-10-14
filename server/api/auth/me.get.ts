import { defineEventHandler } from 'h3'
import { getSessionUser } from '../../utils/auth'

/** 当前登录用户（未登录返回 { user: null }） */
export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  return {
    user: user
      ? { name: user.username, nickname: user.nickname, role: user.role }
      : null,
  }
})
