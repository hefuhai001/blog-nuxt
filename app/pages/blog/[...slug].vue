<script setup lang="ts">
const route = useRoute()
const slug = (route.params.slug as string[]).join('/')
const docPath = `/blog/${slug}`

const { data: doc } = await useAsyncData(`blog-detail-${slug}`, () =>
  queryCollection('blog').path(docPath).first(),
)

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在', fatal: true })
}

// 上一篇 / 下一篇（按路径排序的相邻文章）
const { data: posts } = await useAsyncData(`blog-nav-${slug}`, () =>
  queryCollection('blog').order('path', 'ASC').all(),
)

const index = computed(() =>
  (posts.value ?? []).findIndex((p) => p.path === docPath),
)
const prev = computed(() => {
  const i = index.value
  return i > 0 ? posts.value?.[i - 1] : null
})
const next = computed(() => {
  const i = index.value
  return i >= 0 && i < (posts.value?.length ?? 0) - 1 ? posts.value?.[i + 1] : null
})

const category = computed(() => docPath.split('/')[2].toUpperCase())
const title = computed(() => slug.split('/').pop())

useHead(() => ({ title: `${title.value}` }))
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
      <NuxtLink v-if="prev" :to="prev.path">
        <span class="label">上一篇</span>
        <span>{{ prev.path.split('/').pop() }}</span>
      </NuxtLink>
      <span v-else />
      <NuxtLink v-if="next" :to="next.path">
        <span class="label">下一篇</span>
        <span>{{ next.path.split('/').pop() }}</span>
      </NuxtLink>
      <span v-else />
    </nav>
  </article>
</template>