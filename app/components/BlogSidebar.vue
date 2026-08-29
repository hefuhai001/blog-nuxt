<script setup lang="ts">
const { data: posts } = await useAsyncData('sidebar-posts', () =>
  queryCollection('blog').order('path', 'ASC').all(),
)

const categories = computed(() => {
  const map = new Map<string, number>()
  for (const post of posts.value ?? []) {
    const cat = (post.path.split('/')[2] || '未分类').toUpperCase()
    map.set(cat, (map.get(cat) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
})

const route = useRoute()
const currentCategory = computed(() =>
  (route.params.category as string | undefined)?.toUpperCase() ?? '',
)
</script>

<template>
  <aside class="blog-sidebar">
    <div class="side-card">
      <h3>文章分类</h3>
      <ul>
        <li>
          <NuxtLink to="/" :class="{ active: route.path === '/' }" exact-active-class="">
            <span>全部文章</span>
            <span class="count">{{ posts?.length ?? 0 }}</span>
          </NuxtLink>
        </li>
        <li v-for="cat in categories" :key="cat.name">
          <NuxtLink
            :to="`/category/${cat.name.toLowerCase()}`"
            :class="{ active: currentCategory === cat.name }"
          >
            <span>{{ cat.name }}</span>
            <span class="count">{{ cat.count }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div class="side-card" style="margin-top: 16px">
      <h3>导航</h3>
      <ul>
        <li><NuxtLink to="/about">关于本站</NuxtLink></li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.side-card ul li a {
  justify-content: flex-start;
  gap: 10px;
}
</style>