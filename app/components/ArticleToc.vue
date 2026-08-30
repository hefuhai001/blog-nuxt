<script setup lang="ts">
import type { TocItem } from '~/composables/blog'

defineProps<{ items: TocItem[] }>()

const route = useRoute()
const activeId = ref<string>('')

let observer: IntersectionObserver | null = null

function attachObserver() {
  observer?.disconnect()
  const headings = [...document.querySelectorAll<HTMLElement>('.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4')]
    .filter((el) => el.id)
  const first = headings[0]
  if (!first) return
  const firstId = first.id
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
      if (visible.length) {
        // 取最靠近顶部的可见标题
        const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (top) activeId.value = top.target.id
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
  )
  headings.forEach((h) => observer!.observe(h))
  // 默认高亮第一个
  activeId.value = firstId
}

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 88
    window.scrollTo({ top: y, behavior: 'smooth' })
    history.replaceState(null, '', `#${id}`)
  }
}

onMounted(() => {
  attachObserver()
  // 初始若 URL 带锚点则高亮对应标题
  if (route.hash) activeId.value = route.hash.slice(1)
})
onBeforeUnmount(() => observer?.disconnect())
watch(() => route.fullPath, () => nextTick(attachObserver))
</script>

<template>
  <nav class="article-toc" aria-label="文章目录">
    <div class="toc-title">目录</div>
    <ul v-if="items.length" class="toc-list">
      <li v-for="item in items" :key="item.id">
        <a
          :href="`#${item.id}`"
          class="toc-link"
          :class="{
            'toc-depth-1': item.depth === 1,
            'toc-depth-2': item.depth === 2,
            'toc-depth-3': item.depth === 3,
            active: activeId === item.id,
          }"
          @click.prevent="scrollToId(item.id)"
        >{{ item.text }}</a>
      </li>
    </ul>
    <p v-else class="toc-empty">本文没有小标题</p>
  </nav>
</template>

<style scoped>
.article-toc {
  position: sticky;
  top: 24px;
  align-self: start;
  min-width: 0;
}

.toc-title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  text-transform: uppercase;
  margin-bottom: 10px;
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.toc-link {
  display: block;
  padding: 5px 10px;
  border-radius: 9px;
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-secondary);
  border-left: 2px solid transparent;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-link:hover {
  color: var(--text-primary);
  background: var(--glass-bg-weak);
}

.toc-link.active {
  color: var(--ios-blue-strong);
  background: var(--ios-blue-soft);
  border-left-color: var(--ios-blue-strong);
  font-weight: 600;
}

.toc-depth-1 { padding-left: 10px; }
.toc-depth-2 { padding-left: 24px; }
.toc-depth-3 { padding-left: 38px; }

.toc-empty {
  font-size: 13px;
  color: var(--text-tertiary);
}

/* 窄屏：目录折叠为顶部横向胶囊条目 */
@media (max-width: 860px) {
  .article-toc {
    position: static;
    order: -1;
  }
  .toc-list {
    display: flex;
    flex-wrap: wrap;
    max-height: none;
    gap: 6px;
    overflow: visible;
  }
  .toc-link {
    padding: 4px 10px;
    border-left: none;
    border-radius: 999px;
    background: var(--glass-bg-weak);
    border: 1px solid var(--glass-border);
    white-space: normal;
  }
  .toc-depth-1 { padding-left: 10px; }
  .toc-depth-2 { padding-left: 10px; }
  .toc-depth-3 { padding-left: 10px; }
}
</style>
