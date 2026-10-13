import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineEventHandler } from 'h3'

/**
 * 站点导航数据（我制作的网站 + 我推荐的网站）。
 *
 * 数据不再写死在构建产物里，而是运行时从 JSON 文件读取：
 * - 默认路径 ./data/sites.json（相对进程工作目录，容器内即 /app/data/sites.json）
 * - 可通过 nuxt.config 的 runtimeConfig.sitesFile 或环境变量 NUXT_SITES_FILE 覆盖
 *
 * 这样在 Docker 中把该文件/目录挂载出来，改完重启容器即可生效，无需重新构建镜像。
 */
export default defineEventHandler(async (event) => {
  const { sitesFile } = useRuntimeConfig(event)
  const file = resolve(process.cwd(), sitesFile)

  try {
    const raw = await readFile(file, 'utf-8')
    return JSON.parse(raw)
  }
  catch (error) {
    // 读取/解析失败时返回空结构，避免整页 500；同时打印明确日志便于排查
    console.error(`[sites] 无法读取站点数据文件 ${file}:`, error)
    return { mySites: [], recommendGroups: [] }
  }
})
