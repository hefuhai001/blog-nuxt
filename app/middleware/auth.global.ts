/**
 * 全局鉴权中间件：
 * - /admin 下的页面要求管理员角色；未登录 → /login，已登录但非管理员 → /account
 * - /account（个人中心）要求登录
 * SSR 阶段用 useRequestFetch 转发浏览器 Cookie，避免服务端拿不到会话而误判未登录。
 */
interface MeResponse {
  user: { name: string; nickname: string; role: 'admin' | 'user' } | null
}

export default defineNuxtRouteMiddleware(async (to) => {
  const needAdmin = to.path.startsWith('/admin')
  const needLogin = to.path.startsWith('/account')
  if (!needAdmin && !needLogin) return

  const requestFetch = useRequestFetch()
  const { user } = await requestFetch<MeResponse>('/api/auth/me')

  if (!user) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
  if (needAdmin && user.role !== 'admin') {
    return navigateTo('/account')
  }
})
