import { getRequestHost, getRequestProtocol, type H3Event } from 'h3'

/** 站点基础 URL：优先取 runtimeConfig.public.siteUrl，否则从请求头推导 */
export function getSiteBase(event: H3Event): string {
  const config = useRuntimeConfig()
  const configured = (config.public?.siteUrl as string | undefined)?.replace(/\/$/, '')
  if (configured) return configured
  try {
    const proto = getRequestProtocol(event)
    const host = getRequestHost(event)
    return `${proto}://${host}`
  } catch {
    return ''
  }
}

/** XML 转义 */
export function xmlEscape(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
