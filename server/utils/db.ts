/**
 * MySQL 数据层：连接池 + 建表 + 内容查询。
 *
 * 连接参数来自 runtimeConfig.db（默认本地，可用环境变量覆盖）：
 *   NUXT_DB_HOST / NUXT_DB_PORT / NUXT_DB_USER / NUXT_DB_PASSWORD / NUXT_DB_DATABASE
 */
import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null
let schemaReady: Promise<void> | null = null

export interface PostMeta {
  id: string
  slug: string
  category: string
  title: string
  description: string
  text: string
  words: number
  readingTime: number
}

export interface PostDetail extends PostMeta {
  bodyMd: string
  updatedAt: string
}

export interface PageDetail {
  path: string
  title: string
  bodyMd: string
  updatedAt: string
}

export function getPool(): mysql.Pool {
  if (!pool) {
    const db = useRuntimeConfig().db
    pool = mysql.createPool({
      host: String(db.host),
      port: Number(db.port),
      user: String(db.user),
      password: String(db.password),
      database: String(db.database),
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4',
    })
  }
  return pool
}

async function createSchema(): Promise<void> {
  const p = getPool()
  await p.query(`CREATE TABLE IF NOT EXISTS posts (
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  await p.query(`CREATE TABLE IF NOT EXISTS pages (
    path       VARCHAR(255) NOT NULL,
    title      VARCHAR(255) NOT NULL DEFAULT '',
    body_md    LONGTEXT     NOT NULL,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (path)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
}

async function withDb<T>(fn: (pool: mysql.Pool) => Promise<T>): Promise<T> {
  if (!schemaReady) schemaReady = createSchema()
  await schemaReady
  return fn(getPool())
}

interface PostRow extends mysql.RowDataPacket {
  id: string
  slug: string
  category: string
  title: string
  description: string
  plain_text: string
  word_count: number
  reading_time: number
}

function toMeta(row: PostRow): PostMeta {
  return {
    id: String(row.id),
    slug: String(row.slug),
    category: String(row.category),
    title: String(row.title),
    description: String(row.description ?? ''),
    text: String(row.plain_text ?? ''),
    words: Number(row.word_count ?? 0),
    readingTime: Number(row.reading_time ?? 0),
  }
}

/** 全部文章元数据（按 id 升序，与旧查询保持一致的顺序） */
export async function listPosts(): Promise<PostMeta[]> {
  return withDb(async (p) => {
    const [rows] = await p.query<PostRow[]>(
      'SELECT id, slug, category, title, description, plain_text, word_count, reading_time FROM posts ORDER BY id ASC',
    )
    return rows.map(toMeta)
  })
}

/** 单篇文章（含 md 原文与更新时间） */
export async function getPost(id: string): Promise<PostDetail | null> {
  return withDb(async (p) => {
    const [rows] = await p.query<(PostRow & { body_md: string; updated_at: Date })[]>(
      'SELECT id, slug, category, title, description, plain_text, word_count, reading_time, body_md, updated_at FROM posts WHERE id = ? LIMIT 1',
      [id],
    )
    const row = rows[0]
    if (!row) return null
    return { ...toMeta(row), bodyMd: String(row.body_md), updatedAt: new Date(row.updated_at).toISOString() }
  })
}

/** 页面（about 等） */
export async function getPage(path: string): Promise<PageDetail | null> {
  return withDb(async (p) => {
    const [rows] = await p.query<(mysql.RowDataPacket & { path: string; title: string; body_md: string; updated_at: Date })[]>(
      'SELECT path, title, body_md, updated_at FROM pages WHERE path = ? LIMIT 1',
      [path],
    )
    const row = rows[0]
    if (!row) return null
    return {
      path: String(row.path),
      title: String(row.title ?? ''),
      bodyMd: String(row.body_md),
      updatedAt: new Date(row.updated_at).toISOString(),
    }
  })
}
