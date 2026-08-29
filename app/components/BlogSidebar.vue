<script setup lang="ts">
import { isArticle, categoryOf } from '~/composables/blog'

const { data: posts } = await useAsyncData('sidebar-posts', () =>
  queryCollection('blog').order('path', 'ASC').all(),
)

const articles = computed(() => (posts.value ?? []).filter(isArticle))

const categories = computed(() => {
  const map = new Map<string, number>()
  for (const post of articles.value) {
    const cat = categoryOf(post)
    map.set(cat, (map.get(cat) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
})

const route = useRoute()
const currentCategory = computed(() =>
  (route.params.category as string | undefined) ?? '',
)
</script>

<template>
  <aside class="blog-sidebar">
    <div class="card side-card">
      <h3>文章分类</h3>
      <ul class="list-group">
        <li class="list-row">
          <NuxtLink to="/" class="list-link" :class="{ active: route.path === '/' }">
            <span>全部文章</span>
            <span class="count">{{ articles.length }}</span>
          </NuxtLink>
        </li>
        <li v-for="cat in categories" :key="cat.name" class="list-row">
          <NuxtLink
            :to="`/category/${cat.name}`"
            class="list-link"
            :class="{ active: currentCategory === cat.name }"
          >
            <span>{{ cat.name }}</span>
            <span class="count">{{ cat.count }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div class="card side-card">
      <h3>导航</h3>
      <ul class="list-group">
        <li class="list-row">
          <NuxtLink to="/about" class="list-link">关于本站</NuxtLink>
        </li>
      </ul>
    </div>
  </aside>
</template>
