/** 文章详情页 URL（用原始中文路径，唯一） */
export function articleUrlOf(id?: string): string {
  if (!id) return ''
  return `/blog/${String(id).replace(/\.md$/, '').split('/').slice(2).join('/')}`
}
