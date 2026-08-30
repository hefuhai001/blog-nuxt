import { defineEventHandler } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { extractBodyText, articleUrlOf } from '../utils/content'
import { getSiteBase, xmlEscape } from '../utils/url'

/** RSS 2.0 订阅源 */
export default defineEventHandler(async (event) => {
  const base = getSiteBase(event)
  const posts = await queryCollection(event, 'blog')
    .where('extension', '=', 'md')
    .select('id', 'title', 'body')
    .order('id', 'ASC')
    .all()

  const items = posts
    .map((p) => {
      const url = `${base}${articleUrlOf(p.id)}`
      const excerpt = xmlEscape(extractBodyText(p).slice(0, 200))
      const title = xmlEscape(p.title || '')
      return `    <item>
      <title>${title}</title>
      <link>${xmlEscape(url)}</link>
      <guid isPermaLink="true">${xmlEscape(url)}</guid>
      <description>${excerpt}</description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>我的技术博客</title>
    <link>${base || 'https://example.com'}</link>
    <description>个人技术博客，分享 Django、Docker、Vue、Spring、Node.js 等开发实践与踩坑记录</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  return xml
})
