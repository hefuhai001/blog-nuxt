<script setup lang="ts">
import { isArticle, categoryOf, articleTitle, articleHref } from '~/composables/blog'

const route = useRoute()
const rawCategory = computed(() => (route.params.category as string) ?? '')

const { data: posts } = await useAsyncData(`blog-cat-${rawCategory.value}`, () =>
  queryCollection('blog').order('path', 'ASC').all(),
)

useHead(() => ({
  title: `分类 · ${rawCategory.value}`,
}))

const list = computed(() =>
  (posts.value ?? [])
    .filter(isArticle)
    .filter((p) => categoryOf(p) === rawCategory.value),
)
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">分类：{{ rawCategory }}</h1>
        <p class="page-subtitle">该分类下共 {{ list.length }} 篇文章。</p>
      </div>
      <NuxtLink to="/" class="btn btn-ghost">← 全部文章</NuxtLink>
    </div>

    <ul class="list-group article-list">
      <li v-for="post in list" :key="post.id" class="list-row">
        <NuxtLink :to="articleHref(post)" class="list-link">
          {{ articleTitle(post) }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
