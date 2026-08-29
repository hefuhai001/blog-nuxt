<script setup lang="ts">
const { data: posts } = await useAsyncData('blog-index', () =>
  queryCollection('blog').order('path', 'ASC').all(),
)
useHead({ title: '首页' })

const grouped = computed<Record<string, any[]>>(() => {
  const map: Record<string, any[]> = {}
  for (const post of posts.value ?? []) {
    const cat = post.path.split('/')[2] || '未分类'
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
      共收录 {{ posts?.length ?? 0 }} 篇文章，按技术分类整理归档。
    </p>

    <section v-for="cat in categories" :key="cat" class="category-block">
      <h2>
        <NuxtLink :to="`/category/${cat.toLowerCase()}`">{{ cat }}</NuxtLink>
      </h2>
      <ul class="article-list">
        <li v-for="post in grouped[cat]" :key="post.path">
          <NuxtLink :to="post.path">
            {{ post.path.split('/').pop() }}
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>