/**
 * MySQL 数据层：连接池 + 建表 + 内容查询。
 *
 * 连接参数来自 runtimeConfig.db（默认本地，可用环境变量覆盖）：
 *   NUXT_DB_HOST / NUXT_DB_PORT / NUXT_DB_USER / NUXT_DB_PASSWORD / NUXT_DB_DATABASE
 */
import bcrypt from 'bcryptjs'
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
  // 用户：用户名唯一，密码存 bcrypt 哈希，角色 admin / user
  await p.query(`CREATE TABLE IF NOT EXISTS users (
    id            INT          NOT NULL AUTO_INCREMENT,
    username      VARCHAR(64)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(16)  NOT NULL DEFAULT 'user',
    nickname      VARCHAR(64)  NOT NULL DEFAULT '',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_username (username)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
}

async function withDb<T>(fn: (pool: mysql.Pool) => Promise<T>): Promise<T> {
  if (!schemaReady) schemaReady = createSchema().then(seedDefaultAdmin)
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

/** 写入/更新文章所需字段 */
export interface PostInput {
  id: string
  slug: string
  category: string
  title: string
  description?: string
  bodyMd: string
}

/** 写入/更新文章：现算 plain_text/word_count/reading_time，返回刷新后的详情 */
export async function upsertPost(input: PostInput): Promise<PostDetail> {
  const { text, words, readingTime } = renderMarkdown(input.bodyMd)
  const description = (input.description ?? '').trim() || text.slice(0, 120)
  await withDb(async (p) => {
    await p.execute(
      `INSERT INTO posts (id, slug, category, title, description, body_md, plain_text, word_count, reading_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE slug=VALUES(slug), category=VALUES(category), title=VALUES(title),
         description=VALUES(description), body_md=VALUES(body_md), plain_text=VALUES(plain_text),
         word_count=VALUES(word_count), reading_time=VALUES(reading_time)`,
      [input.id, input.slug, input.category, input.title, description, input.bodyMd, text, words, readingTime],
    )
  })
  const detail = await getPost(input.id)
  if (!detail) throw new Error(`[db] 文章写入后无法读回：${input.id}`)
  return detail
}

/** 删除文章，返回是否删除了记录 */
export async function deletePost(id: string): Promise<boolean> {
  return withDb(async (p) => {
    const [result] = await p.execute<mysql.ResultSetHeader>('DELETE FROM posts WHERE id = ?', [id])
    return result.affectedRows > 0
  })
}

/** 写入/更新页面所需字段 */
export interface PageInput {
  path: string
  title: string
  bodyMd: string
}

/** 写入/更新页面，返回刷新后的详情 */
export async function upsertPage(input: PageInput): Promise<PageDetail> {
  const title = input.title.trim()
  await withDb(async (p) => {
    await p.execute(
      `INSERT INTO pages (path, title, body_md) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE title=VALUES(title), body_md=VALUES(body_md)`,
      [input.path, title, input.bodyMd],
    )
  })
  const detail = await getPage(input.path)
  if (!detail) throw new Error(`[db] 页面写入后无法读回：${input.path}`)
  return detail
}

/** 删除页面，返回是否删除了记录 */
export async function deletePage(path: string): Promise<boolean> {
  return withDb(async (p) => {
    const [result] = await p.execute<mysql.ResultSetHeader>('DELETE FROM pages WHERE path = ?', [path])
    return result.affectedRows > 0
  })
}

/** 页面列表（不含正文） */
export async function listPages(): Promise<Array<{ path: string; title: string; updatedAt: string }>> {
  return withDb(async (p) => {
    const [rows] = await p.query<(mysql.RowDataPacket & { path: string; title: string; updated_at: Date })[]>(
      'SELECT path, title, updated_at FROM pages ORDER BY path ASC',
    )
    return rows.map((row) => ({
      path: String(row.path),
      title: String(row.title ?? ''),
      updatedAt: new Date(row.updated_at).toISOString(),
    }))
  })
}

/** 全量重写网址导航：事务内 DELETE + INSERT，保证读者不会看到中间空状态 */
export async function replaceNav(data: SitesData): Promise<void> {
  return withDb(async (p) => {
    const conn = await p.getConnection()
    try {
      await conn.beginTransaction()
      await conn.query('DELETE FROM nav_links')
      await conn.query('DELETE FROM nav_groups')
      await conn.query('DELETE FROM nav_sites')

      const mySites = Array.isArray(data.mySites) ? data.mySites : []
      const groups = Array.isArray(data.recommendGroups) ? data.recommendGroups : []

      let siteOrder = 0
      for (const site of mySites) {
        await conn.execute(
          'INSERT INTO nav_sites (name, description, url, repo, icon, tags, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            String(site.name ?? ''),
            String(site.desc ?? ''),
            String(site.url ?? ''),
            String(site.repo ?? ''),
            String(site.icon ?? ''),
            JSON.stringify(Array.isArray(site.tags) ? site.tags : []),
            siteOrder++,
          ],
        )
      }

      let groupOrder = 0
      for (const group of groups) {
        const [result] = await conn.execute<mysql.ResultSetHeader>(
          'INSERT INTO nav_groups (category, icon, sort_order) VALUES (?, ?, ?)',
          [String(group.category ?? ''), String(group.icon ?? ''), groupOrder++],
        )
        const groupId = result.insertId
        let linkOrder = 0
        const links = Array.isArray(group.sites) ? group.sites : []
        for (const link of links) {
          await conn.execute(
            'INSERT INTO nav_links (group_id, name, description, url, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [
              groupId,
              String(link.name ?? ''),
              String(link.desc ?? ''),
              String(link.url ?? ''),
              String(link.icon ?? ''),
              linkOrder++,
            ],
          )
        }
      }

      await conn.commit()
    }
    catch (error) {
      await conn.rollback()
      throw error
    }
    finally {
      conn.release()
    }
  })
}

/** 后台概览计数 */
export async function getStats(): Promise<{
  posts: number
  pages: number
  navSites: number
  navGroups: number
  navLinks: number
}> {
  interface StatsRow extends mysql.RowDataPacket {
    posts: number
    pages: number
    navSites: number
    navGroups: number
    navLinks: number
  }
  return withDb(async (p) => {
    const [rows] = await p.query<StatsRow[]>(
      `SELECT
         (SELECT COUNT(*) FROM posts)      AS posts,
         (SELECT COUNT(*) FROM pages)      AS pages,
         (SELECT COUNT(*) FROM nav_sites)  AS navSites,
         (SELECT COUNT(*) FROM nav_groups) AS navGroups,
         (SELECT COUNT(*) FROM nav_links)  AS navLinks`,
    )
    const row = rows[0]
    return {
      posts: Number(row?.posts ?? 0),
      pages: Number(row?.pages ?? 0),
      navSites: Number(row?.navSites ?? 0),
      navGroups: Number(row?.navGroups ?? 0),
      navLinks: Number(row?.navLinks ?? 0),
    }
  })
}

// ---------------------------------------------------------------------------
// 用户系统
// ---------------------------------------------------------------------------

export type UserRole = 'admin' | 'user'

export interface UserPublic {
  id: number
  username: string
  nickname: string
  role: UserRole
  createdAt: string
}

interface UserRow extends mysql.RowDataPacket {
  id: number
  username: string
  password_hash: string
  role: string
  nickname: string
  created_at: Date
}

function toUser(row: UserRow): UserPublic {
  return {
    id: Number(row.id),
    username: String(row.username),
    nickname: String(row.nickname ?? ''),
    role: row.role === 'admin' ? 'admin' : 'user',
    createdAt: new Date(row.created_at).toISOString(),
  }
}

const USER_COLUMNS = 'id, username, password_hash, role, nickname, created_at'

export interface CreateUserInput {
  username: string
  password: string
  nickname?: string
  role?: UserRole
}

/** 创建用户：密码用 bcrypt 哈希，用户名需唯一（冲突由数据库唯一索引兜底） */
export async function createUser(input: CreateUserInput): Promise<UserPublic> {
  const username = input.username.trim()
  const nickname = (input.nickname ?? '').trim() || username
  const role: UserRole = input.role === 'admin' ? 'admin' : 'user'
  const passwordHash = bcrypt.hashSync(input.password, 10)
  await withDb(async (p) => {
    await p.execute(
      'INSERT INTO users (username, password_hash, role, nickname) VALUES (?, ?, ?, ?)',
      [username, passwordHash, role, nickname],
    )
  })
  const user = await getUserByName(username)
  if (!user) throw new Error(`[db] 用户写入后无法读回：${username}`)
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    role: user.role,
    createdAt: user.createdAt,
  }
}

/** 按用户名查询（含密码哈希，登录校验用） */
export async function getUserByName(username: string): Promise<(UserPublic & { passwordHash: string }) | null> {
  return withDb(async (p) => {
    const [rows] = await p.query<UserRow[]>(
      `SELECT ${USER_COLUMNS} FROM users WHERE username = ? LIMIT 1`,
      [username.trim()],
    )
    const row = rows[0]
    if (!row) return null
    return { ...toUser(row), passwordHash: String(row.password_hash) }
  })
}

/** 按 id 查询（不含密码哈希） */
export async function getUserById(id: number): Promise<UserPublic | null> {
  return withDb(async (p) => {
    const [rows] = await p.query<UserRow[]>(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = ? LIMIT 1`,
      [id],
    )
    const row = rows[0]
    return row ? toUser(row) : null
  })
}

/** 全部用户（按 id 升序） */
export async function listUsers(): Promise<UserPublic[]> {
  return withDb(async (p) => {
    const [rows] = await p.query<UserRow[]>(`SELECT ${USER_COLUMNS} FROM users ORDER BY id ASC`)
    return rows.map(toUser)
  })
}

/** 修改用户角色，返回刷新后的用户 */
export async function updateUserRole(id: number, role: UserRole): Promise<UserPublic | null> {
  const safeRole: UserRole = role === 'admin' ? 'admin' : 'user'
  await withDb(async (p) => {
    await p.execute('UPDATE users SET role = ? WHERE id = ?', [safeRole, id])
  })
  return getUserById(id)
}

/** 删除用户，返回是否删除了记录 */
export async function deleteUser(id: number): Promise<boolean> {
  return withDb(async (p) => {
    const [result] = await p.execute<mysql.ResultSetHeader>('DELETE FROM users WHERE id = ?', [id])
    return result.affectedRows > 0
  })
}

/** 用户总数 */
export async function countUsers(): Promise<number> {
  return withDb(async (p) => {
    const [rows] = await p.query<(mysql.RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM users')
    return Number(rows[0]?.total ?? 0)
  })
}

/**
 * 首次建表后若用户表为空，则自动种子一个管理员。
 * 账号密码取自 runtimeConfig.seedAdminUser / seedAdminPassword（可用环境变量覆盖）。
 * 仅在空表时执行，不会覆盖既有用户。
 *
 * 注意：此处直接使用连接池（而非 withDb 公共函数），因为 withDb 会 await schemaReady，
 * 而本函数正是 schemaReady 链条的一部分，避免自引用死锁。
 */
async function seedDefaultAdmin(): Promise<void> {
  const p = getPool()
  const [rows] = await p.query<(mysql.RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM users')
  if (Number(rows[0]?.total ?? 0) > 0) return

  const config = useRuntimeConfig()
  const username = String(config.seedAdminUser || 'admin').trim() || 'admin'
  const password = String(config.seedAdminPassword || 'admin123')
  const passwordHash = bcrypt.hashSync(password, 10)
  await p.execute(
    'INSERT INTO users (username, password_hash, role, nickname) VALUES (?, ?, ?, ?)',
    [username, passwordHash, 'admin', '管理员'],
  )
}

