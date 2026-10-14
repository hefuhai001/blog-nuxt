/**
 * 全局鉴权中间件：仅拦截 /admin 下的页面。
 * SSR 阶段用 useRequestFetch 转发浏览器 Cookie，避免服务端拿不到会话而误判未登录。
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return

  const requestFetch = useRequestFetch()
  const { user } = await requestFetch<{ user: { name: string } | null }>('/api/auth/me')
  if (!user) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
