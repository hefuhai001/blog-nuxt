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

/** 我制作的网站 / 项目 */
export interface MySite {
  name: string
  desc: string
  url: string
  repo?: string
  icon: string
  tags: string[]
}

/** 我推荐的网站 */
export interface RecommendSite {
  name: string
  desc: string
  url: string
  icon: string
}

export interface RecommendGroup {
  category: string
  icon: string
  sites: RecommendSite[]
}

/** /api/sites 返回的数据结构 */
export interface SitesData {
  mySites: MySite[]
  recommendGroups: RecommendGroup[]
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
  // 网址导航：我制作的网站（nav_sites）、推荐网站分组（nav_groups）与组内站点（nav_links）
  await p.query(`CREATE TABLE IF NOT EXISTS nav_sites (
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  await p.query(`CREATE TABLE IF NOT EXISTS nav_groups (
    id         INT          NOT NULL AUTO_INCREMENT,
    category   VARCHAR(255) NOT NULL,
    icon       VARCHAR(64)  NOT NULL DEFAULT '',
    sort_order INT          NOT NULL DEFAULT 0,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  await p.query(`CREATE TABLE IF NOT EXISTS nav_links (
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

interface NavSiteRow extends mysql.RowDataPacket {
  name: string
  description: string
  url: string
  repo: string
  icon: string
  tags: string
}

interface NavGroupRow extends mysql.RowDataPacket {
  id: number
  category: string
  icon: string
}

interface NavLinkRow extends mysql.RowDataPacket {
  group_id: number
  name: string
  description: string
  url: string
  icon: string
}

/** 网址导航数据：我制作的网站 + 推荐网站分组 */
export async function getSites(): Promise<SitesData> {
  return withDb(async (p) => {
    const [siteRows] = await p.query<NavSiteRow[]>(
      'SELECT name, description, url, repo, icon, tags FROM nav_sites ORDER BY sort_order ASC, id ASC',
    )
    const mySites: MySite[] = siteRows.map((row) => {
      let tags: string[] = []
      try {
        const parsed = JSON.parse(row.tags || '[]')
        if (Array.isArray(parsed)) tags = parsed.map(String)
      }
      catch { /* 解析失败则视为无标签 */ }
      return {
        name: String(row.name),
        desc: String(row.description ?? ''),
        url: String(row.url),
        repo: row.repo ? String(row.repo) : undefined,
        icon: String(row.icon ?? ''),
        tags,
      }
    })

    const [groupRows] = await p.query<NavGroupRow[]>(
      'SELECT id, category, icon FROM nav_groups ORDER BY sort_order ASC, id ASC',
    )
    const [linkRows] = await p.query<NavLinkRow[]>(
      'SELECT group_id, name, description, url, icon FROM nav_links ORDER BY sort_order ASC, id ASC',
    )
    const linksByGroup = new Map<number, RecommendSite[]>()
    for (const row of linkRows) {
      const list = linksByGroup.get(Number(row.group_id)) ?? []
      list.push({
        name: String(row.name),
        desc: String(row.description ?? ''),
        url: String(row.url),
        icon: String(row.icon ?? ''),
      })
      linksByGroup.set(Number(row.group_id), list)
    }

    const recommendGroups: RecommendGroup[] = groupRows.map((row) => ({
      category: String(row.category),
      icon: String(row.icon ?? ''),
      sites: linksByGroup.get(Number(row.id)) ?? [],
    }))

    return { mySites, recommendGroups }
  })
}
