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

const cardTitleClass =
  'm-0 mb-3 font-(family-name:--font-display) text-base font-bold tracking-[-0.2px] text-(--text-primary)'
const tagChipClass =
  'inline-flex items-center rounded-full border border-(--glass-border) bg-(--glass-bg-weak) px-3 py-1 text-[12.5px] font-semibold text-(--text-secondary) backdrop-blur-(--glass-blur) backdrop-saturate-(--glass-saturate) transition-all duration-200 hover:-translate-y-px hover:border-transparent hover:bg-(--ios-blue-soft) hover:text-(--ios-blue-strong)'
const tagChipActiveClass = 'border-transparent bg-(--ios-blue-strong) text-white shadow-(--shadow-blue)'
</script>

<template>
  <aside class="sticky top-6 grid gap-4 max-[840px]:static max-[840px]:grid-cols-2 max-[560px]:grid-cols-1">
    <div class="card p-[18px]">
      <h3 :class="cardTitleClass">文章分类</h3>
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
    <div class="card p-[18px]">
      <h3 :class="cardTitleClass">标签</h3>
      <div class="flex flex-wrap gap-[7px]">
        <NuxtLink
          v-for="cat in categories"
          :key="`tag-${cat.name}`"
          :to="`/category/${cat.name}`"
          :class="[tagChipClass, { [tagChipActiveClass]: currentCategory === cat.name }]"
        >{{ cat.name }}</NuxtLink>
      </div>
    </div>
    <div class="card p-[18px]">
      <h3 :class="cardTitleClass">导航</h3>
      <ul class="list-group">
        <li class="list-row">
          <NuxtLink to="/about" class="list-link">关于本站</NuxtLink>
        </li>
      </ul>
    </div>
  </aside>
</template>
