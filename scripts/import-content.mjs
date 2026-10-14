/**
 * 内容导入脚本：把 content/ 下的 Markdown 写入本地 MySQL（db_blog_nuxt）。
 *
 * 用法：
 *   node scripts/import-content.mjs            # 导入并删除 content/ 目录
 *   node scripts/import-content.mjs --keep     # 导入后保留 content/ 目录
 *
 * 连接参数（可用环境变量覆盖）：
 *   NUXT_DB_HOST / NUXT_DB_PORT / NUXT_DB_USER / NUXT_DB_PASSWORD / NUXT_DB_DATABASE
 */
import mysql from 'mysql2/promise'
import { readdir, readFile, rm } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderMarkdown } from '../server/utils/markdown.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '..')
const contentDir = join(rootDir, 'content')

const dbConfig = {
  host: process.env.NUXT_DB_HOST || 'localhost',
  port: Number(process.env.NUXT_DB_PORT || 3306),
  user: process.env.NUXT_DB_USER || 'root',
  password: process.env.NUXT_DB_PASSWORD || 'root@XH2001!',
  database: process.env.NUXT_DB_DATABASE || 'db_blog_nuxt',
}

const CREATE_POSTS = `CREATE TABLE IF NOT EXISTS posts (
  id           VARCHAR(255) NOT NULL,
  slug         VARCHAR(255) NOT NULL,
  category     VARCHAR(64)  NOT NULL DEFAULT '',
  title        VARCHAR(255) NOT NULL DEFAULT '',
  description  VARCHAR(1024) NOT NULL DEFAULT '',
  body_md      LONGTEXT     NOT NULL,
  plain_text   LONGTEXT     NOT NULL,
  word_count   INT          NOT NULL DEFAULT 0,
  reading_time INT          NOT NULL DEFAULT 0,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`

const CREATE_PAGES = `CREATE TABLE IF NOT EXISTS pages (
  path       VARCHAR(255) NOT NULL,
  title      VARCHAR(255) NOT NULL DEFAULT '',
  body_md    LONGTEXT     NOT NULL,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`

/** 递归收集所有 .md 文件（返回相对 content/ 的 POSIX 路径） */
async function walk(dir) {
  const out = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await walk(full))
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      out.push(relative(contentDir, full).split(sep).join('/'))
    }
  }
  return out.sort()
}

/** 提取正文首个 H1 作为标题；返回去除该 H1 后的正文 */
function extractTitle(markdown, fallback) {
  const lines = markdown.split(/\r?\n/)
  const idx = lines.findIndex((l) => /^#\s+\S/.test(l))
  if (idx === -1) return { title: fallback, body: markdown }
  const title = lines[idx].replace(/^#\s+/, '').trim()
  const body = [...lines.slice(0, idx), ...lines.slice(idx + 1)].join('\n').replace(/^\s*\n/, '')
  return { title, body }
}

async function main() {
  const keep = process.argv.includes('--keep')
  const files = await walk(contentDir)
  if (!files.length) {
    console.log('[import] content/ 下没有找到 Markdown 文件，退出。')
    return
  }

  const conn = await mysql.createConnection({ ...dbConfig, database: undefined })
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  )
  await conn.query(`USE \`${dbConfig.database}\``)
  await conn.query(CREATE_POSTS)
  await conn.query(CREATE_PAGES)

  let postCount = 0
  let pageCount = 0

  for (const rel of files) {
    const raw = await readFile(join(contentDir, rel), 'utf-8')
    const fileName = rel.split('/').pop().replace(/\.md$/i, '')

    if (rel.startsWith('blog/')) {
      const segments = rel.replace(/\.md$/i, '').split('/') // ['blog', cat, ...name]
      const category = segments.length > 2 ? segments[1] : ''
      const slug = segments.slice(1).join('/')
      const id = `blog/${rel}`
      const { title, body } = extractTitle(raw, fileName)
      const { text, words, readingTime } = renderMarkdown(body)

      await conn.execute(
        `INSERT INTO posts (id, slug, category, title, description, body_md, plain_text, word_count, reading_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE slug=VALUES(slug), category=VALUES(category), title=VALUES(title),
           description=VALUES(description), body_md=VALUES(body_md), plain_text=VALUES(plain_text),
           word_count=VALUES(word_count), reading_time=VALUES(reading_time)`,
        [id, slug, category, title, text.slice(0, 120), body, text, words, readingTime],
      )
      postCount++
    } else {
      const path = rel.toLowerCase() === 'index.md' ? '/' : `/${fileName}`
      const { title, body } = extractTitle(raw, fileName)
      await conn.execute(
        `INSERT INTO pages (path, title, body_md) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE title=VALUES(title), body_md=VALUES(body_md)`,
        [path, title, body],
      )
      pageCount++
    }
  }

  await conn.end()
  console.log(`[import] 完成：文章 ${postCount} 篇，页面 ${pageCount} 个。`)

  if (!keep) {
    await rm(contentDir, { recursive: true, force: true })
    console.log('[import] 已删除 content/ 目录（加 --keep 可保留）。')
  }
}

main().catch((err) => {
  console.error('[import] 导入失败：', err)
  process.exitCode = 1
})
