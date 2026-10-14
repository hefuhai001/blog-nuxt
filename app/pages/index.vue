<script setup lang="ts">
import { ArrowRight, Clock, CodeXml, Container, Folder } from '@lucide/vue'
import { NuxtLink } from '#components'
import type { Component } from 'vue'
import { isArticle, categoryOf, articleTitle, articleHref, bodyTextOf, readingTimeOf } from '~/composables/blog'
import { resolveSiteIcon, type SitesData } from '~/data/sites'

const { data: posts } = await useFetch('/api/posts')

// 站点导航数据：运行时从 /api/sites 读取（数据源为 MySQL）
const { data: sites } = await useFetch<SitesData>('/api/sites', { key: 'sites-nav' })
const mySites = computed(() => sites.value?.mySites ?? [])
useHead({ title: 'CodeTrail · 代码轨迹' })

const articles = computed(() => (posts.value ?? []).filter(isArticle))

/** 推荐文章：以字数作为热度代理，取前 6 */
const recommended = computed(() =>
  [...articles.value]
    .sort((a, b) => bodyTextOf(b).length - bodyTextOf(a).length)
    .slice(0, 6),
)

function excerptOf(post: unknown, len = 86): string {
  const text = bodyTextOf(post)
  return text.length > len ? `${text.slice(0, len)}…` : text
}

const catIcon: Record<string, Component> = {
  django: CodeXml,
  docker: Container,
}

function catIconOf(name: string): Component {
  return catIcon[name] ?? Folder
}

/** 以 / 开头视为站内链接，使用 NuxtLink 打开 */
function isInternal(url: string): boolean {
  return url.startsWith('/')
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
          更多文章 <ArrowRight class="size-4" aria-hidden="true" />
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
              <component :is="catIconOf(categoryOf(post))" class="size-8" stroke-width="1.6" aria-hidden="true" />
            </div>
            <div class="min-w-0">
              <span class="chip chip-accent !py-0.5 !text-xs">{{ categoryOf(post) }}</span>
              <h3 class="m-0 mt-2 truncate font-(family-name:--font-display) text-[16px] font-bold text-(--text-primary) transition-colors duration-200 group-hover:text-(--accent)">
                {{ articleTitle(post) }}
              </h3>
              <p class="m-0 mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-(--text-secondary)">
                {{ excerptOf(post) }}
              </p>
              <div class="mt-2 flex items-center gap-1.5 text-xs text-(--text-tertiary)">
                <Clock class="size-3.5" aria-hidden="true" />
                {{ readingTimeOf(post) }} 分钟阅读
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div v-reveal class="mt-8 text-center sm:hidden">
        <NuxtLink to="/blog" class="btn btn-primary">更多文章 <ArrowRight class="size-4" aria-hidden="true" /></NuxtLink>
      </div>
    </section>

    <!-- 网址导航快捷入口 -->
    <section class="mt-14">
      <div v-reveal class="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 class="m-0 font-(family-name:--font-display) text-[26px] font-extrabold tracking-[-0.5px] text-(--text-primary)">
            <span class="font-mono text-(--accent)">//</span> 网址导航
          </h2>
          <p class="mt-1 text-sm text-(--text-secondary)">
            我制作的站点与整理的推荐网站，一键直达。
          </p>
        </div>
        <NuxtLink to="/links" class="btn btn-primary max-sm:hidden">
          全部导航 <ArrowRight class="size-4" aria-hidden="true" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-3 gap-5 max-lg:grid-cols-1">
        <component
          :is="isInternal(site.url) ? NuxtLink : 'a'"
          v-for="(site, i) in mySites"
          v-bind="isInternal(site.url) ? { to: site.url } : { href: site.url, target: '_blank', rel: 'noopener' }"
          :key="site.name"
          v-reveal="{ delay: Math.min(i, 6) * 50 }"
          class="card group flex items-start gap-4 !p-5"
        >
          <div
            class="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-(--accent-soft) to-(--surface-weak) text-(--accent) transition-transform duration-300 group-hover:scale-[1.05]"
          >
            <component :is="resolveSiteIcon(site.icon)" class="size-6" stroke-width="1.6" aria-hidden="true" />
          </div>
          <div class="min-w-0">
            <h3 class="m-0 truncate font-(family-name:--font-display) text-[16px] font-bold text-(--text-primary) transition-colors duration-200 group-hover:text-(--accent)">
              {{ site.name }}
            </h3>
            <p class="m-0 mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-(--text-secondary)">
              {{ site.desc }}
            </p>
          </div>
        </component>
      </div>

      <div v-reveal class="mt-8 text-center sm:hidden">
        <NuxtLink to="/links" class="btn btn-primary">全部导航 <ArrowRight class="size-4" aria-hidden="true" /></NuxtLink>
      </div>
    </section>
  </div>
</template>
