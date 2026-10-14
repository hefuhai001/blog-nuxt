<script setup lang="ts">
import { Clock } from '@lucide/vue'
import {
  isArticle,
  articleHref,
  articleTitle,
  tocOf,
} from '~/composables/blog'

interface PostDetail {
  id: string
  slug: string
  category: string
  title: string
  description: string
  text: string
  words: number
  readingTime: number
  html: string
  toc: Array<{ id: string, text: string, depth: number }>
}

const route = useRoute()
const slugParts = (route.params.slug as string[]) ?? []

// 列表：用于上一篇 / 下一篇与相关推荐
const { data: posts } = await useFetch('/api/posts')

// 详情：服务端渲染好的 HTML 与目录
const detailUrl = `/api/posts/${slugParts.map(encodeURIComponent).join('/')}`
const { data: doc } = await useFetch<PostDetail>(detailUrl)

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在', fatal: true })
}

const articles = computed(() => (posts.value ?? []).filter(isArticle))

const targetId = computed(() => doc.value?.id ?? '')
const categoryName = computed(() => doc.value?.category ?? '未分类')
const category = computed(() => categoryName.value.toUpperCase())
const title = computed(() => doc.value?.title ?? '')
const readingTime = computed(() => doc.value?.readingTime ?? 0)
const wordCount = computed(() => doc.value?.words ?? 0)
const toc = computed(() => tocOf(doc.value))

// 上一篇 / 下一篇
const index = computed(() =>
  articles.value.findIndex((a) => a.id === targetId.value),
)
const prev = computed(() => {
  const i = index.value
  return i > 0 ? articles.value[i - 1] : null
})
const next = computed(() => {
  const i = index.value
  return i >= 0 && i < articles.value.length - 1 ? articles.value[i + 1] : null
})

// 相关推荐：同分类下除当前文章外的前 6 篇
const related = computed(() =>
  articles.value.filter((a) => a.id !== targetId.value && (a.category ?? '未分类') === categoryName.value).slice(0, 6),
)

useHead(() => ({
  title,
  meta: [
    { property: 'og:title', content: title.value },
    { property: 'og:type', content: 'article' },
    { property: 'og:description', content: `${category.value} · 约 ${wordCount.value} 字 · 阅读 ${readingTime.value} 分钟` },
  ],
}))
</script>

<template>
  <article v-if="doc" class="card article-card">
    <div class="mb-3.5 flex flex-wrap items-center gap-2">
      <NuxtLink :to="{ path: '/blog', query: { category: categoryName } }" class="chip chip-accent">{{ category }}</NuxtLink>
      <span class="chip">
        <Clock class="size-[13px] opacity-80" aria-hidden="true" />
        {{ readingTime }} 分钟
      </span>
      <span class="chip">{{ wordCount.toLocaleString() }} 字</span>
    </div>

    <h1 class="mb-1 font-(family-name:--font-display) text-[30px] font-extrabold tracking-[-0.5px] text-(--text-primary)">{{ title }}</h1>
    <ArticleStats :post-id="targetId" />

    <div
      class="grid items-start gap-7"
      :class="toc.length ? 'grid-cols-[minmax(0,1fr)_216px] max-[860px]:grid-cols-1' : ''"
    >
      <div class="markdown-content">
        <ProseEnhancer>
          <div v-html="doc.html" />
        </ProseEnhancer>
      </div>
      <ArticleToc v-if="toc.length" :items="toc" />
    </div>

    <RelatedPosts v-if="related.length" :items="related" :category="category" />
    <Giscus :term="route.fullPath" />

    <nav class="mt-9 flex justify-between gap-3">
      <NuxtLink
        v-if="prev"
        :to="articleHref(prev)"
        class="min-w-0 max-w-[48%] flex-1 rounded-2xl border border-(--surface-border) bg-(--surface-weak) px-[18px] py-3.5 text-sm text-(--text-primary) transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-(--surface)"
      >
        <span class="mb-0.5 block text-xs text-(--text-secondary)">上一篇</span>
        <span>{{ articleTitle(prev) }}</span>
      </NuxtLink>
      <span v-else />
      <NuxtLink
        v-if="next"
        :to="articleHref(next)"
        class="min-w-0 max-w-[48%] flex-1 rounded-2xl border border-(--surface-border) bg-(--surface-weak) px-[18px] py-3.5 text-right text-sm text-(--text-primary) transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-(--surface)"
      >
        <span class="mb-0.5 block text-xs text-(--text-secondary)">下一篇</span>
        <span>{{ articleTitle(next) }}</span>
      </NuxtLink>
      <span v-else />
    </nav>
  </article>
</template>
