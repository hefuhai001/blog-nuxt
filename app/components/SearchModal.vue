<script setup lang="ts">
import { articleHref } from '~/composables/blog'
import { useCommandPalette } from '~/composables/command-palette'

type SearchIndexItem = { id: string; title: string; category: string; text: string; words: number }

const { isOpen, close } = useCommandPalette()
const router = useRouter()

// 一次性拉取轻量索引（缓存）
const { data: index } = await useFetch<SearchIndexItem[]>('/api/search', {
  server: false,
  default: () => [],
})

const q = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const activeIndex = ref(0)

const results = computed<SearchIndexItem[]>(() => {
  const query = q.value.trim().toLowerCase()
  if (!query) return []
  const items = index.value ?? []
  const scored = items
    .map((item) => {
      const title = item.title.toLowerCase()
      const text = item.text.toLowerCase()
      let score = 0
      if (title.includes(query)) score += 200 - title.indexOf(query)
      if (text.includes(query)) score += 20
      return { item, score }
    })
    .filter((r) => r.score > 0)
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 50).map((r) => r.item)
})

watch(results, (list) => {
  if (activeIndex.value >= list.length) activeIndex.value = 0
})

// 高亮命中片段
function highlight(text: string, query: string) {
  const needle = query.trim()
  if (!needle) return text
  const parts: string[] = []
  let rest = text
  const lower = needle.toLowerCase()
  while (true) {
    const i = rest.toLowerCase().indexOf(lower)
    if (i < 0) {
      parts.push(rest)
      break
    }
    parts.push(rest.slice(0, i))
    parts.push(`<mark>${rest.slice(i, i + needle.length)}</mark>`)
    rest = rest.slice(i + needle.length)
  }
  return parts.join('')
}

// 摘要：命中位置附近截取一段
function excerpt(item: SearchIndexItem): string {
  const needle = q.value.trim().toLowerCase()
  const i = item.text.toLowerCase().indexOf(needle)
  if (i < 0) return item.text.slice(0, 100)
  const start = Math.max(0, i - 40)
  const slice = item.text.slice(start, i + needle.length + 80)
  return (start > 0 ? '…' : '') + slice + '…'
}

function go(index: number) {
  const target = results.value[index]
  if (target) {
    router.push(articleHref(target))
    close()
  }
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    useCommandPalette().toggle()
    return
  }
  if (!isOpen.value) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    go(activeIndex.value)
  }
}

watch(isOpen, (open) => {
  if (open) {
    q.value = ''
    activeIndex.value = 0
    nextTick(() => inputEl.value?.focus())
  }
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="palette">
      <div v-if="isOpen" class="palette-backdrop" @click.self="close">
        <div class="palette" role="dialog" aria-modal="true" aria-label="搜索文章">
          <div class="palette-search">
            <svg class="palette-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref="inputEl"
              v-model="q"
              type="text"
              class="palette-input"
              placeholder="搜索文章标题或正文…"
              autocomplete="off"
              spellcheck="false"
            >
            <kbd class="palette-kbd">ESC</kbd>
          </div>

          <div class="palette-body">
            <div v-if="q.trim() && !results.length" class="palette-empty">
              没有找到与「{{ q }}」相关的文章
            </div>

            <ul v-else class="palette-results">
              <li v-for="(item, i) in results" :key="item.id">
                <button
                  class="palette-row"
                  :class="{ active: i === activeIndex }"
                  @mouseenter="activeIndex = i"
                  @click="go(i)"
                >
                  <span class="palette-cat">{{ item.category }}</span>
                  <span class="palette-main">
                    <span class="palette-title" v-html="highlight(item.title, q)" />
                    <span class="palette-excerpt" v-html="highlight(excerpt(item), q)" />
                  </span>
                  <svg class="palette-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </li>
            </ul>

            <div v-if="!q.trim() && index?.length" class="palette-hint">
              输入关键词搜索全部 {{ index.length }} 篇文章
            </div>
          </div>

          <div class="palette-footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
            <span><kbd>Enter</kbd> 打开</span>
            <span><kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> 切换</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: min(16vh, 120px);
  background: rgba(0, 0, 0, 0.42);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  backdrop-filter: blur(14px) saturate(140%);
}

.palette {
  width: min(620px, calc(100vw - 32px));
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: var(--shadow-glass-lg);
  overflow: hidden;
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  backdrop-filter: blur(30px) saturate(180%);
}

.palette-search {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--glass-divider);
}

.palette-search-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--text-tertiary);
}

.palette-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 17px;
  color: var(--text-primary);
}

.palette-input::placeholder {
  color: var(--text-tertiary);
}

.palette-kbd {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--text-tertiary);
  border: 1px solid var(--glass-divider);
  border-radius: 6px;
  padding: 2px 6px;
}

.palette-body {
  max-height: min(52vh, 420px);
  overflow-y: auto;
}

.palette-results {
  list-style: none;
  margin: 0;
  padding: 8px;
}

.palette-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 12px;
  border: none;
  border-radius: 12px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.palette-row.active {
  background: var(--ios-blue-soft);
}

.palette-cat {
  flex-shrink: 0;
  min-width: 52px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--ios-blue-strong);
  background: var(--ios-blue-soft);
  border-radius: 999px;
  padding: 3px 9px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.palette-main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 3px;
}

.palette-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.palette-excerpt {
  font-size: 12.5px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.palette-go {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
}

.palette-row.active .palette-go {
  color: var(--ios-blue-strong);
}

.palette-empty,
.palette-hint {
  padding: 28px 20px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.palette-footer {
  display: flex;
  gap: 16px;
  padding: 10px 18px;
  border-top: 1px solid var(--glass-divider);
  font-size: 11.5px;
  color: var(--text-tertiary);
}

.palette-footer kbd {
  font-family: var(--font-body);
  border: 1px solid var(--glass-divider);
  border-radius: 5px;
  padding: 1px 5px;
  margin: 0 2px;
}

/* 命中高亮 */
:deep(mark) {
  background: rgba(255, 204, 0, 0.45);
  color: inherit;
  border-radius: 3px;
  padding: 0 1px;
}

/* 过渡动画 */
.palette-enter-active,
.palette-leave-active {
  transition: opacity 0.18s ease;
}
.palette-enter-active .palette,
.palette-leave-active .palette {
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.18s ease;
}
.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}
.palette-enter-from .palette,
.palette-leave-to .palette {
  opacity: 0;
  transform: translateY(-14px) scale(0.98);
}
</style>
