/** 浏览量 / 点赞统计（localStorage + sessionStorage，纯本地） */
const STORE_KEY = 'blog:stats:v1'
const SEEN_KEY = 'blog:stats:seen'

export type PostStats = { views: number; likes: number; liked: boolean }

function readStore(): Record<string, PostStats> {
  if (!import.meta.client) return {}
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') as Record<string, PostStats>
  } catch {
    return {}
  }
}

function writeStore(map: Record<string, PostStats>) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(map))
  } catch {
    /* 隐私模式等场景忽略 */
  }
}

/** 以文章 id 为键的本地统计 */
export function usePostStats(postId: string) {
  const stats = ref<PostStats>({ views: 0, likes: 0, liked: false })
  let loaded = false

  function ensure() {
    if (loaded || !import.meta.client) return
    loaded = true
    stats.value = { views: 0, likes: 0, liked: false, ...readStore()[postId] }
  }

  /** 每次会话对同一篇文章只累计一次浏览量 */
  function trackView() {
    if (!import.meta.client) return
    ensure()
    let seen: string[] = []
    try {
      seen = JSON.parse(sessionStorage.getItem(SEEN_KEY) || '[]')
    } catch {
      /* ignore */
    }
    if (!seen.includes(postId)) {
      seen.push(postId)
      try {
        sessionStorage.setItem(SEEN_KEY, JSON.stringify(seen))
      } catch {
        /* ignore */
      }
      stats.value.views += 1
      persist()
    }
  }

  function toggleLike() {
    if (!import.meta.client) return
    ensure()
    stats.value.liked = !stats.value.liked
    stats.value.likes += stats.value.liked ? 1 : -1
    persist()
  }

  function persist() {
    const map = readStore()
    map[postId] = { ...stats.value }
    writeStore(map)
  }

  return { stats, trackView, toggleLike }
}
