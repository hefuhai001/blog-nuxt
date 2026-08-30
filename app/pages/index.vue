<script setup lang="ts">
import { isArticle, categoryOf, articleTitle, articleHref, bodyTextOf, readingTimeOf } from '~/composables/blog'

const { data: posts } = await useAsyncData('blog-index', () =>
  queryCollection('blog').order('path', 'ASC').all(),
)
useHead({ title: 'CodeTrail · 代码轨迹' })

const articles = computed(() => (posts.value ?? []).filter(isArticle))

/** 推荐文章：以字数作为热度代理，取前 6 */
const recommended = computed(() =>
  [...articles.value]
    .sort((a, b) => bodyTextOf(b).length - bodyTextOf(a).length)
    .slice(0, 6),
)

function excerptOf(post: any, len = 86): string {
  const text = bodyTextOf(post)
  return text.length > len ? `${text.slice(0, len)}…` : text
}

const catIcon: Record<string, string> = {
  django: '🐍',
  docker: '🐳',
}
</script>

<template>
  <div>
    <HeroSection />

    <section class="mt-4">
      <div v-reveal class="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 class="m-0 font-(family-name:--font-display) text-[26px] font-extrabold tracking-[-0.5px] text-(--text-primary)">
            <span class="font-mono text-(--accent)">//</span> 推荐文章
          </h2>
          <p class="mt-1 text-sm text-(--text-secondary)">
            精选干货，从 {{ articles.length }} 篇文章中挑选。
          </p>
        </div>
        <NuxtLink to="/blog" class="btn btn-primary max-sm:hidden">
          更多文章 <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        <div
          v-for="(post, i) in recommended"
          :key="post.id"
          v-reveal="{ delay: Math.min(i, 6) * 50 }"
          class="card group !p-5"
        >
          <NuxtLink :to="articleHref(post)" class="grid grid-cols-[112px_1fr] gap-4 max-sm:grid-cols-1 max-sm:gap-3">
            <div
              class="grid h-[80px] place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-(--accent-soft) to-(--surface-weak) font-(family-name:--font-display) text-3xl font-extrabold text-(--accent) transition-transform duration-300 group-hover:scale-[1.03] max-sm:h-14"
            >
              {{ catIcon[categoryOf(post)] ?? '📝' }}
            </div>
            <div class="min-w-0">
              <span class="chip chip-accent !py-0.5 !text-xs">{{ categoryOf(post) }}</span>
              <h3 class="m-0 mt-2 truncate font-(family-name:--font-display) text-[16px] font-bold text-(--text-primary) transition-colors duration-200 group-hover:text-(--accent)">
                {{ articleTitle(post) }}
              </h3>
              <p class="m-0 mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-(--text-secondary)">
                {{ excerptOf(post) }}
              </p>
              <div class="mt-2 flex items-center gap-3 text-xs text-(--text-tertiary)">
                <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ readingTimeOf(post) }} 分钟阅读
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div v-reveal class="mt-8 text-center sm:hidden">
        <NuxtLink to="/blog" class="btn btn-primary">更多文章 →</NuxtLink>
      </div>
    </section>
  </div>
</template>
