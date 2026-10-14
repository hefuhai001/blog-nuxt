import { defineEventHandler } from 'h3'
import { getSites } from '../utils/db'

/**
 * 站点导航数据（我制作的网站 + 我推荐的网站）。
 *
 * 数据存于本地 MySQL（db_blog_nuxt）的 nav_sites / nav_groups / nav_links 表，
 * 由 getSites() 读取后返回；表结构与初始数据由 scripts/import-sites.mjs 写入。
 */
export default defineEventHandler(async () => {
  try {
    return await getSites()
  }
  catch (error) {
    // 查询失败时返回空结构，避免整页 500；同时打印明确日志便于排查
    console.error('[sites] 无法从数据库读取站点数据：', error)
    return { mySites: [], recommendGroups: [] }
  }
})
