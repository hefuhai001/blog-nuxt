import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { getPost, listPosts } from '../../../utils/db'

/** 后台文章查询：?id= 取单篇（含正文），否则返回列表 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = getQuery(event)
  if (id) {
    const post = await getPost(String(id))
    if (!post) throw createError({ statusCode: 404, statusMessage: '文章不存在' })
    return post
  }
  return listPosts()
})
