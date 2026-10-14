import { defineEventHandler } from 'h3'
import { articleUrlOf } from '../utils/content'
import { getSiteBase, xmlEscape } from '../utils/url'

/** XML Sitemap */
export default defineEventHandler(async (event) => {
  const base = getSiteBase(event)
  const posts = await listPosts()

  const urls = [
    '',
    '/about',
    ...posts.map((p) => articleUrlOf(p.id)),
  ]
    .map((path) => `  <url>\n    <loc>${xmlEscape(`${base}${path}`)}</loc>\n  </url>`)
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})
