<script setup lang="ts">
const route = useRoute()
const rawCategory = computed(() => (route.params.category as string) ?? '')

const { data: posts } = await useAsyncData(`blog-cat-${rawCategory.value}`, () =>
  queryCollection('blog').order('path', 'ASC').all(),
)

const category = computed(() => rawCategory.value.toUpperCase())

useHead(() => ({
  title: `分类 · ${category.value}`,
}))

const list = computed(() =>
  (posts.value ?? []).filter((p) => p.path.startsWith(`/blog/${rawCategory.value}`)),
)
</script>

<template>
  <div>
    <h1 class="page-title">分类：{{ category }}</h1>
    <p class="page-subtitle">该分类下共 {{ list.length }} 篇文章。</p>

    <ul class="article-list">
      <li v-for="post in list" :key="post.path">
        <NuxtLink :to="post.path">
          {{ post.path.split('/').pop() }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>