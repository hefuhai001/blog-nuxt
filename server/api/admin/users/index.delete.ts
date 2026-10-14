import { createError, defineEventHandler, readBody } from 'h3'
import { deleteUser, getUserById } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'

/** 删除用户（仅管理员）；禁止删除自己 */
export default defineEventHandler(async (event) => {
  const current = await requireAdmin(event)

  const { id } = await readBody<{ id?: number }>(event)
  const targetId = Number(id)
  if (!Number.isInteger(targetId) || targetId <= 0) {
    throw createError({ statusCode: 400, statusMessage: '缺少有效的用户 id' })
  }

  const target = await getUserById(targetId)
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: '用户不存在' })
  }
  if (target.username === current.username) {
    throw createError({ statusCode: 400, statusMessage: '不能删除当前登录的账号' })
  }

  const ok = await deleteUser(targetId)
  return { ok }
})
