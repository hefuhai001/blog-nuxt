/**
 * 网址导航导入脚本：把 data/sites.json 写入本地 MySQL（db_blog_nuxt）。
 *
 * 用法：
 *   node scripts/import-sites.mjs            # 导入并删除 data/sites.json
 *   node scripts/import-sites.mjs --keep     # 导入后保留 data/sites.json
 *
 * 连接参数（可用环境变量覆盖）：
 *   NUXT_DB_HOST / NUXT_DB_PORT / NUXT_DB_USER / NUXT_DB_PASSWORD / NUXT_DB_DATABASE
 */
import mysql from 'mysql2/promise'
import { readFile, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '..')
const sitesFile = join(rootDir, 'data', 'sites.json')

const dbConfig = {
  host: process.env.NUXT_DB_HOST || 'localhost',
  port: Number(process.env.NUXT_DB_PORT || 3306),
  user: process.env.NUXT_DB_USER || 'root',
  password: process.env.NUXT_DB_PASSWORD || 'root@XH2001!',
  database: process.env.NUXT_DB_DATABASE || 'db_blog_nuxt',
}

const CREATE_NAV_SITES = `CREATE TABLE IF NOT EXISTS nav_sites (
  id          INT          NOT NULL AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  description VARCHAR(1024) NOT NULL DEFAULT '',
  url         VARCHAR(1024) NOT NULL,
  repo        VARCHAR(1024) NOT NULL DEFAULT '',
  icon        VARCHAR(64)  NOT NULL DEFAULT '',
  tags        TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`

const CREATE_NAV_GROUPS = `CREATE TABLE IF NOT EXISTS nav_groups (
  id         INT          NOT NULL AUTO_INCREMENT,
  category   VARCHAR(255) NOT NULL,
  icon       VARCHAR(64)  NOT NULL DEFAULT '',
  sort_order INT          NOT NULL DEFAULT 0,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`

const CREATE_NAV_LINKS = `CREATE TABLE IF NOT EXISTS nav_links (
  id          INT          NOT NULL AUTO_INCREMENT,
  group_id    INT          NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description VARCHAR(1024) NOT NULL DEFAULT '',
  url         VARCHAR(1024) NOT NULL,
  icon        VARCHAR(64)  NOT NULL DEFAULT '',
  sort_order  INT          NOT NULL DEFAULT 0,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_group (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`

async function main() {
  const keep = process.argv.includes('--keep')

  let data
  try {
    data = JSON.parse(await readFile(sitesFile, 'utf-8'))
  }
  catch (error) {
    console.error(`[sites] 无法读取站点数据文件 ${sitesFile}:`, error)
    process.exitCode = 1
    return
  }

  const mySites = Array.isArray(data.mySites) ? data.mySites : []
  const recommendGroups = Array.isArray(data.recommendGroups) ? data.recommendGroups : []

  const conn = await mysql.createConnection({ ...dbConfig, database: undefined })
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  )
  await conn.query(`USE \`${dbConfig.database}\``)
  await conn.query(CREATE_NAV_SITES)
  await conn.query(CREATE_NAV_GROUPS)
  await conn.query(CREATE_NAV_LINKS)

  // 清空后重新写入，保证多次导入结果幂等（导航数据量小，直接重建最简单）
  await conn.query('DELETE FROM nav_links')
  await conn.query('DELETE FROM nav_groups')
  await conn.query('DELETE FROM nav_sites')

  let i = 0
  for (const site of mySites) {
    await conn.execute(
      `INSERT INTO nav_sites (name, description, url, repo, icon, tags, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        String(site.name ?? ''),
        String(site.desc ?? ''),
        String(site.url ?? ''),
        String(site.repo ?? ''),
        String(site.icon ?? ''),
        JSON.stringify(Array.isArray(site.tags) ? site.tags : []),
        i++,
      ],
    )
  }

  let groupCount = 0
  let linkCount = 0
  let groupOrder = 0
  for (const group of recommendGroups) {
    const [groupResult] = await conn.execute(
      'INSERT INTO nav_groups (category, icon, sort_order) VALUES (?, ?, ?)',
      [String(group.category ?? ''), String(group.icon ?? ''), groupOrder++],
    )
    const groupId = groupResult.insertId
    groupCount++

    let linkOrder = 0
    const links = Array.isArray(group.sites) ? group.sites : []
    for (const link of links) {
      await conn.execute(
        `INSERT INTO nav_links (group_id, name, description, url, icon, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          groupId,
          String(link.name ?? ''),
          String(link.desc ?? ''),
          String(link.url ?? ''),
          String(link.icon ?? ''),
          linkOrder++,
        ],
      )
      linkCount++
    }
  }

  await conn.end()
  console.log(`[sites] 完成：我的站点 ${mySites.length} 个，推荐分组 ${groupCount} 个，组内站点 ${linkCount} 个。`)

  if (!keep) {
    await rm(sitesFile, { force: true })
    console.log('[sites] 已删除 data/sites.json（加 --keep 可保留）。')
  }
}

main().catch((err) => {
  console.error('[sites] 导入失败：', err)
  process.exitCode = 1
})
