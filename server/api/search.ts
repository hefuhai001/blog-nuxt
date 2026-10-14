/**
 * 轻量搜索索引：服务端从 MySQL 生成（id / 标题 / 分类 / 全文文本），
 * 客户端一次性拉取后做即时子串过滤，对中文内容友好。
 */
export default defineEventHandler(async () => {
  const posts = await listPosts()
  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    text: p.text,
    words: p.words,
  }))
})
