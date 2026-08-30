<script setup lang="ts">
/**
 * Giscus 评论组件。
 * 需要先在 nuxt.config.ts 的 runtimeConfig.public.giscus 中填写
 * repo / repoId / category / categoryId（GitHub Discussion 相关配置），
 * 未配置时自动不渲染。
 */
const props = defineProps<{ term: string }>()

interface GiscusConfig {
  repo: string
  repoId?: string
  category?: string
  categoryId?: string
  mapping?: string
  strict?: string
  reactionsEnabled?: string
  emitMetadata?: string
  inputPosition?: string
  theme?: string
  lang?: string
}

const config = useRuntimeConfig().public.giscus as GiscusConfig | undefined
const enabled = computed(() => !!config?.repo)

let mountedEl: HTMLElement | null = null

function loadScript() {
  if (!config?.repo) return
  const cfg = config
  nextTick(() => {
    const container = document.querySelector('.giscus-container')
    if (!container) return
    container.innerHTML = ''
    mountedEl = container as HTMLElement
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', cfg.repo)
    script.setAttribute('data-repo-id', cfg.repoId || '')
    script.setAttribute('data-category', cfg.category || 'Announcements')
    script.setAttribute('data-category-id', cfg.categoryId || '')
    script.setAttribute('data-mapping', cfg.mapping || 'pathname')
    script.setAttribute('data-strict', cfg.strict || '0')
    script.setAttribute('data-reactions-enabled', cfg.reactionsEnabled ?? '1')
    script.setAttribute('data-emit-metadata', cfg.emitMetadata || '0')
    script.setAttribute('data-input-position', cfg.inputPosition || 'top')
    script.setAttribute('data-theme', cfg.theme || 'preferred_color_scheme')
    script.setAttribute('data-lang', cfg.lang || 'zh-CN')
    script.setAttribute('data-loading', 'lazy')
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true
    container.appendChild(script)
  })
}

onMounted(loadScript)
onBeforeUnmount(() => {
  // 清空已插入的 giscus iframe 容器，避免路由切换时残留
  if (mountedEl) mountedEl.innerHTML = ''
})
</script>

<template>
  <section v-if="enabled" class="giscus-wrap">
    <h2 class="giscus-title">评论</h2>
    <div class="giscus-container" />
  </section>
</template>

<style scoped>
.giscus-wrap {
  margin-top: 32px;
  padding-top: 22px;
  border-top: 1px solid var(--glass-divider);
}

.giscus-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-secondary);
  margin: 0 0 12px;
  letter-spacing: 0.02em;
}
</style>
