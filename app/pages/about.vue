<script setup lang="ts">
import { Keyboard } from '@lucide/vue'
import { isArticle, categoryOf, bodyTextOf, readingTimeOf } from '~/composables/blog'

const { data: posts } = await useAsyncData('about-posts', () =>
  queryCollection('blog').order('path', 'ASC').all(),
)
const { data: about } = await useAsyncData('about-page', () =>
  queryCollection('content').path('/about').first(),
)
useHead({ title: '关于本站 · CodeTrail 代码轨迹' })

const articles = computed(() => (posts.value ?? []).filter(isArticle))

const stats = computed(() => {
  const list = articles.value
  const totalWords = list.reduce((sum, p) => sum + bodyTextOf(p).length, 0)
  const cats = new Set(list.map(categoryOf))
  const hours = list.reduce((sum, p) => sum + readingTimeOf(p), 0)
  return [
    { label: '文章', value: String(list.length) },
    { label: '分类', value: String(cats.size) },
    { label: '总字数', value: totalWords > 10000 ? `${(totalWords / 10000).toFixed(1)}w` : String(totalWords) },
    { label: '约需阅读', value: `${hours} 分钟` },
  ]
})

const stack = ['Nuxt 4', 'Vue 3', 'TypeScript', 'Tailwind CSS v4', 'Nuxt Content', 'Giscus 评论', 'PWA']
</script>

<template>
  <div class="mx-auto max-w-[880px]">
    <!-- 站点名片 -->
    <section v-reveal class="card relative overflow-hidden !p-0">
      <div class="h-28 bg-gradient-to-r from-(--accent-soft) via-(--surface-weak) to-(--accent-soft)" />
      <div class="px-7 pb-7">
        <div class="-mt-10 mb-4 grid size-20 place-items-center rounded-3xl border border-line bg-surface-strong text-4xl shadow-(--shadow-card)">
          <Keyboard class="size-8 text-(--accent)" stroke-width="1.6" aria-hidden="true" />
        </div>
        <h1 class="m-0 font-(family-name:--font-display) text-[26px] font-extrabold tracking-[-0.5px] text-(--text-primary)">
          CodeTrail · 代码轨迹
        </h1>
        <p class="mt-2 max-w-[560px] text-[15px] leading-relaxed text-(--text-secondary)">
          一个关于后端开发与工程实践的技术博客——记录 Django、Docker、数据库与日常踩坑，
          把每一次调试的弯路都变成下一段可复用的轨迹。
        </p>
        <ul class="m-0 mt-4 grid list-none flex-wrap gap-2 p-0">
          <li v-for="item in stack" :key="item">
            <span class="chip chip-accent !py-1 !text-xs">{{ item }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- 数据统计 -->
    <section v-reveal="{ delay: 80 }" class="mt-6 grid grid-cols-4 gap-4 max-sm:grid-cols-2">
      <div v-for="s in stats" :key="s.label" class="card !p-4 text-center">
        <div class="font-(family-name:--font-display) text-2xl font-extrabold text-(--accent)">{{ s.value }}</div>
        <div class="mt-0.5 text-xs text-(--text-tertiary)">{{ s.label }}</div>
      </div>
    </section>

    <!-- 详细说明 -->
    <section v-reveal="{ delay: 140 }" class="card mt-6">
      <div class="markdown-content">
        <ContentRenderer v-if="about" :value="about" />
      </div>
    </section>
  </div>
</template>
