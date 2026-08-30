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
      <h3>标签</h3>
      <div class="tag-cloud">
        <NuxtLink
          v-for="cat in categories"
          :key="`tag-${cat.name}`"
          :to="`/category/${cat.name}`"
          class="tag-chip"
          :class="{ active: currentCategory === cat.name }"
        >{{ cat.name }}</NuxtLink>
      </div>
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

<style scoped>
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--glass-bg-weak);
  border: 1px solid var(--glass-border);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), color 0.2s ease,
    background-color 0.2s ease, border-color 0.2s ease;
}

.tag-chip:hover {
  color: var(--ios-blue-strong);
  background: var(--ios-blue-soft);
  border-color: transparent;
  transform: translateY(-1px);
}

.tag-chip.active {
  color: #fff;
  background: var(--ios-blue-strong);
  border-color: transparent;
  box-shadow: var(--shadow-blue);
}
</style>
