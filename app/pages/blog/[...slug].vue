<script setup lang="ts">
import {
  isArticle,
  categoryOf,
  articleTitle,
  articleHref,
  readingTimeOf,
  wordCountOf,
  tocOf,
} from '~/composables/blog'

const route = useRoute()
const slugParts = (route.params.slug as string[]) ?? []
const targetId = `blog/blog/${slugParts.join('/')}.md`

const { data: posts } = await useAsyncData(`blog-detail-${slugParts.join('/')}`, () =>
  queryCollection('blog').order('id', 'ASC').all(),
)

const articles = computed(() => (posts.value ?? []).filter(isArticle))

const doc = computed(() => articles.value.find((a) => a.id === targetId) ?? null)

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在', fatal: true })
}

// 上一篇 / 下一篇
const index = computed(() =>
  articles.value.findIndex((a) => a.id === targetId),
)
const prev = computed(() => {
  const i = index.value
  return i > 0 ? articles.value[i - 1] : null
})
const next = computed(() => {
  const i = index.value
  return i >= 0 && i < articles.value.length - 1 ? articles.value[i + 1] : null
})

const categoryName = computed(() => categoryOf(doc.value))
const category = computed(() => categoryName.value.toUpperCase())
const title = computed(() => articleTitle(doc.value))
const readingTime = computed(() => readingTimeOf(doc.value))
const wordCount = computed(() => wordCountOf(doc.value))
const toc = computed(() => tocOf(doc.value))

// 相关推荐：同分类下除当前文章外的前 6 篇
const related = computed(() =>
  articles.value.filter((a) => a.id !== targetId && categoryOf(a) === categoryName.value).slice(0, 6),
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
    <div class="article-meta">
      <NuxtLink :to="`/category/${categoryName}`" class="chip chip-blue">{{ category }}</NuxtLink>
      <span class="chip">
        <svg class="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        {{ readingTime }} 分钟
      </span>
      <span class="chip">{{ wordCount.toLocaleString() }} 字</span>
    </div>

    <h1 class="page-title" style="margin-bottom: 4px">{{ title }}</h1>
    <ArticleStats :post-id="targetId" />

    <div class="article-grid" :class="{ 'has-toc': toc.length }">
      <div class="markdown-content">
        <ProseEnhancer>
          <ContentRenderer :value="doc" />
        </ProseEnhancer>
      </div>
      <ArticleToc v-if="toc.length" :items="toc" />
    </div>

    <RelatedPosts v-if="related.length" :items="related" :category="category" />
    <Giscus :term="route.fullPath" />

    <nav class="article-nav">
      <NuxtLink v-if="prev" :to="articleHref(prev)">
        <span class="label">上一篇</span>
        <span>{{ articleTitle(prev) }}</span>
      </NuxtLink>
      <span v-else />
      <NuxtLink v-if="next" :to="articleHref(next)">
        <span class="label">下一篇</span>
        <span>{{ articleTitle(next) }}</span>
      </NuxtLink>
      <span v-else />
    </nav>
  </article>
</template>
