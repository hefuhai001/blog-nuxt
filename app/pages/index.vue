<script setup lang="ts">
import { isArticle, categoryOf, articleTitle, articleHref } from '~/composables/blog'

const { data: posts } = await useAsyncData('blog-index', () =>
  queryCollection('blog').order('path', 'ASC').all(),
)
useHead({ title: '首页' })

const articles = computed(() => (posts.value ?? []).filter(isArticle))

const grouped = computed<Record<string, any[]>>(() => {
  const map: Record<string, any[]> = {}
  for (const post of articles.value) {
    const cat = categoryOf(post)
    ;(map[cat] ||= []).push(post)
  }
  return map
})

const categories = computed(() => Object.keys(grouped.value))
</script>

<template>
  <div>
    <h1 class="page-title">文章列表</h1>
    <p class="page-subtitle">
      共收录 {{ articles.length }} 篇文章，按技术分类整理归档。
    </p>

    <section v-for="cat in categories" :key="cat" class="category-block">
      <h2 class="category-title">
        <NuxtLink :to="`/category/${cat}`">{{ cat }}</NuxtLink>
      </h2>
      <ul class="list-group article-list">
        <li v-for="post in grouped[cat]" :key="post.id" class="list-row">
          <NuxtLink :to="articleHref(post)" class="list-link">
            {{ articleTitle(post) }}
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
