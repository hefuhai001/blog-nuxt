import { defineEventHandler } from 'h3'
import { listUsers } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'

/** 用户列表（仅管理员） */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return { users: await listUsers() }
})
