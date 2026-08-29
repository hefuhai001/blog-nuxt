<script setup lang="ts">
import { isArticle, categoryOf, articleTitle, articleHref } from '~/composables/blog'

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

const category = computed(() => categoryOf(doc.value).toUpperCase())
const title = computed(() => articleTitle(doc.value))

useHead(() => ({ title }))
</script>

<template>
  <article v-if="doc">
    <div class="article-meta">
      <span class="tag">{{ category }}</span>
    </div>
    <h1 class="page-title" style="margin-bottom: 16px">{{ title }}</h1>

    <div class="markdown-content">
      <ContentRenderer :value="doc" />
    </div>

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