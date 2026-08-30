import { defineEventHandler } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { categoryOfId, extractBodyText } from '../utils/content'

/**
 * 轻量搜索索引：服务端生成（id / 标题 / 分类 / 全文文本），
 * 客户端一次性拉取后做即时子串过滤，对中文内容友好（FTS5 会把 CJK 拆成单字，不适用）。
 */
export default defineEventHandler(async (event) => {
  const posts = await queryCollection(event, 'blog')
    .where('extension', '=', 'md')
    .select('id', 'title', 'body')
    .order('id', 'ASC')
    .all()

  return posts.map((p) => {
    const text = extractBodyText(p)
    return {
      id: p.id,
      title: p.title || '',
      category: categoryOfId(p.id),
      text,
      words: text.length,
    }
  })
})
