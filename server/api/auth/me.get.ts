import { defineEventHandler } from 'h3'
import { useAdminSession } from '../../utils/auth'

/** 当前登录用户（未登录返回 { user: null }） */
export default defineEventHandler(async (event) => {
  const session = await useAdminSession(event)
  return { user: session.data.user ? { name: session.data.user } : null }
})
