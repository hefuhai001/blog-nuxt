import { createError, defineEventHandler, readBody } from 'h3'
import { getUserById, listUsers, updateUserRole, type UserRole } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'

/** 修改用户角色（仅管理员）；禁止把最后一名管理员降级 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { id, role } = await readBody<{ id?: number; role?: string }>(event)
  const targetId = Number(id)
  const nextRole: UserRole = role === 'admin' ? 'admin' : 'user'
  if (!Number.isInteger(targetId) || targetId <= 0) {
    throw createError({ statusCode: 400, statusMessage: '缺少有效的用户 id' })
  }

  const target = await getUserById(targetId)
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: '用户不存在' })
  }

  if (target.role === 'admin' && nextRole === 'user') {
    const admins = (await listUsers()).filter((u) => u.role === 'admin')
    if (admins.length <= 1) {
      throw createError({ statusCode: 400, statusMessage: '至少保留一名管理员' })
    }
  }

  const updated = await updateUserRole(targetId, nextRole)
  return { user: updated }
})
