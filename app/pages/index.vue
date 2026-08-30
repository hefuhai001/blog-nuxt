<script setup lang="ts">
import { isArticle, categoryOf, articleTitle, articleHref, bodyTextOf, readingTimeOf } from '~/composables/blog'

const { data: posts } = await useAsyncData('blog-index', () =>
  queryCollection('blog').order('path', 'ASC').all(),
)
useHead({ title: 'CodeTrail · 代码轨迹' })

const articles = computed(() => (posts.value ?? []).filter(isArticle))

/** 摘要：正文纯文本截断 */
function excerptOf(post: any, len = 86): string {
  const text = bodyTextOf(post)
  return text.length > len ? `${text.slice(0, len)}…` : text
}

function metaOf(post: any): string {
  return `${readingTimeOf(post)} 分钟阅读`
}

/** 按分类分组（保持目录序） */
const grouped = computed<Record<string, any[]>>(() => {
  const map: Record<string, any[]> = {}
  for (const post of articles.value) {
    const cat = categoryOf(post)
    ;(map[cat] ||= []).push(post)
  }
  return map
})

const categories = computed(() =>
  Object.entries(grouped.value).map(([name, items]) => ({ name, count: items.length })),
)

const route = useRoute()
const currentCategory = computed(() => (route.params.category as string | undefined) ?? '')

/** 热门文章：以字数作为热度代理，取前 8 */
const hotPosts = computed(() =>
  [...articles.value]
    .sort((a, b) => bodyTextOf(b).length - bodyTextOf(a).length)
    .slice(0, 8),
)

const catIcon: Record<string, string> = {
  django: '🐍',
  docker: '🐳',
}

/** 选中分类后的列表 */
const shownList = computed(() =>
  currentCategory.value ? grouped.value[currentCategory.value] ?? [] : articles.value,
)
</script>

<template>
  <div>
    <HeroSection />

    <div class="grid grid-cols-[210px_1fr_272px] items-start gap-6 max-2xl:grid-cols-[190px_1fr] max-xl:grid-cols-1">
      <!-- 左：分类导航 -->
      <aside v-reveal class="card sticky top-24 !p-3 max-xl:hidden">
        <h3 class="m-0 flex items-center gap-2 px-3 pb-3 pt-1 font-(family-name:--font-display) text-[15px] font-bold text-(--text-primary)">
          <span aria-hidden="true">🗂️</span> 文章分类
        </h3>
        <ul class="m-0 grid list-none p-0">
          <li>
            <NuxtLink
              to="/"
              class="mb-1 flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-150"
              :class="route.path === '/'
                ? 'bg-(--accent) text-[#141414] shadow-(--shadow-accent)'
                : 'text-(--text-secondary) hover:bg-(--surface-weak) hover:text-(--text-primary)'"
            >全部<span class="text-xs opacity-70">{{ articles.length }}</span></NuxtLink>
          </li>
          <li v-for="cat in categories" :key="cat.name">
            <NuxtLink
              :to="`/category/${cat.name}`"
              class="mb-1 flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-150"
              :class="currentCategory === cat.name
                ? 'bg-(--accent) text-[#141414] shadow-(--shadow-accent)'
                : 'text-(--text-secondary) hover:bg-(--surface-weak) hover:text-(--text-primary)'"
            >
              <span class="flex items-center gap-2">
                <span aria-hidden="true">{{ catIcon[cat.name] ?? '📁' }}</span>{{ cat.name }}
              </span>
              <span class="text-xs opacity-70">{{ cat.count }}</span>
            </NuxtLink>
          </li>
        </ul>
      </aside>

      <!-- 中：文章卡片流 -->
      <section>
        <div
          v-for="(post, i) in shownList"
          :key="post.id"
          v-reveal="{ delay: Math.min(i, 6) * 50 }"
          class="card group mb-5 !p-5"
        >
          <NuxtLink :to="articleHref(post)" class="grid grid-cols-[132px_1fr] gap-5 max-sm:grid-cols-1 max-sm:gap-3">
            <!-- 缩略图位：分类渐变块 -->
            <div
              class="grid h-[92px] place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-(--accent-soft) to-(--surface-weak) font-(family-name:--font-display) text-3xl font-extrabold text-(--accent) transition-transform duration-300 group-hover:scale-[1.03] max-sm:h-16"
            >
              {{ catIcon[categoryOf(post)] ?? '📝' }}
            </div>

            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="chip chip-accent !py-0.5 !text-xs">{{ categoryOf(post) }}</span>
              </div>
              <h3 class="m-0 mt-2 truncate font-(family-name:--font-display) text-[17px] font-bold text-(--text-primary) transition-colors duration-200 group-hover:text-(--accent)">
                {{ articleTitle(post) }}
              </h3>
              <p class="m-0 mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-(--text-secondary)">
                {{ excerptOf(post) }}
              </p>
              <div class="mt-2.5 flex items-center gap-4 text-xs text-(--text-tertiary)">
                <span class="flex items-center gap-1">
                  <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ metaOf(post) }}
                </span>
                <span class="ml-auto flex items-center gap-1 text-(--accent) opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  阅读全文 <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- 右：热门文章 -->
      <aside v-reveal="{ delay: 120 }" class="card sticky top-24 !p-5 max-2xl:hidden">
        <h3 class="m-0 flex items-center gap-2 border-b border-(--divider) pb-3 font-(family-name:--font-display) text-[15px] font-bold text-(--text-primary)">
          <span aria-hidden="true">🔥</span> 热门文章
        </h3>
        <ol class="m-0 grid list-none gap-4 p-0 pt-4">
          <li v-for="(post, i) in hotPosts" :key="post.id">
            <NuxtLink :to="articleHref(post)" class="group grid grid-cols-[24px_1fr] items-start gap-2.5">
              <span
                class="grid size-6 place-items-center rounded-md font-mono text-xs font-bold"
                :class="i < 3
                  ? 'bg-(--accent) text-[#141414]'
                  : 'bg-(--surface-weak) text-(--text-tertiary) group-hover:text-(--accent)'"
              >{{ i + 1 }}</span>
              <span class="line-clamp-2 text-[13.5px] leading-snug font-medium text-(--text-primary) transition-colors duration-150 group-hover:text-(--accent)">{{ articleTitle(post) }}</span>
            </NuxtLink>
          </li>
        </ol>
      </aside>
    </div>
  </div>
</template>
