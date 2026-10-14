/** 静态页面（about 等）详情：返回渲染后的 HTML */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'path')
  const path = `/${slug ?? ''}`.replace(/\/$/, '') || '/'
  const page = await getPage(path)
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: '页面不存在' })
  }
  const { html } = renderMarkdown(page.bodyMd)
  return { path: page.path, title: page.title, html }
})
