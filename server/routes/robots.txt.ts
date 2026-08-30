import { defineEventHandler } from 'h3'
import { getSiteBase } from '../utils/url'

export default defineEventHandler((event) => {
  const base = getSiteBase(event)
  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return body
})
