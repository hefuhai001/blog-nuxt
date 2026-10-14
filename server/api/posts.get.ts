import { defineEventHandler } from 'h3'

/** 文章元数据列表（供列表页 / 上下篇 / 相关推荐使用），按 id 升序 */
export default defineEventHandler(async () => {
  return listPosts()
})
