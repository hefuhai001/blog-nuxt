<script setup lang="ts">
import { ArrowRight, Compass, ExternalLink, GitBranch, Globe } from '@lucide/vue'
import { resolveSiteIcon, type SitesData } from '~/data/sites'

useHead({ title: '网址导航 · CodeTrail 代码轨迹' })

// 站点导航数据：运行时从 /api/sites 读取（数据源为 MySQL）
const { data: sites } = await useFetch<SitesData>('/api/sites', { key: 'sites-nav' })
const mySites = computed(() => sites.value?.mySites ?? [])
const recommendGroups = computed(() => sites.value?.recommendGroups ?? [])

/** 以 / 开头视为站内链接，使用 NuxtLink 打开 */
function isInternal(url: string): boolean {
  return url.startsWith('/')
}
</script>

<template>
  <div>
    <!-- 头部名片 -->
    <section v-reveal class="card relative overflow-hidden !p-0">
      <div class="h-24 bg-gradient-to-r from-(--accent-soft) via-(--surface-weak) to-(--accent-soft)" />
      <div class="px-7 pb-7">
        <div
          class="-mt-9 mb-4 grid size-[68px] place-items-center rounded-3xl border border-line bg-surface-strong shadow-(--shadow-card)"
        >
          <Compass class="size-7 text-(--accent)" stroke-width="1.6" aria-hidden="true" />
        </div>
        <h1 class="m-0 font-(family-name:--font-display) text-[26px] font-extrabold tracking-[-0.5px] text-(--text-primary)">
          <span class="font-mono text-(--accent)">//</span> 网址导航
        </h1>
        <p class="mt-2 max-w-[620px] text-[15px] leading-relaxed text-(--text-secondary)">
          收录我做过的站点作品与源码入口，以及日常开发中高频使用的推荐网站——按主题整理，一键直达。
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <a href="#mine" class="btn btn-primary">我的作品</a>
          <a href="#recommend" class="btn btn-ghost">推荐网站</a>
        </div>
      </div>
    </section>

    <!-- 我制作的网站 -->
    <section id="mine" class="mt-12 scroll-mt-24">
      <div v-reveal class="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 class="m-0 font-(family-name:--font-display) text-[24px] font-extrabold tracking-[-0.5px] text-(--text-primary)">
            <span class="font-mono text-(--accent)">//</span> 我制作的网站
          </h2>
          <p class="mt-1 text-sm text-(--text-secondary)">
            个人作品与项目，点击可直接访问站点或在 Gitee 查看源码。
          </p>
        </div>
        <span class="chip chip-accent max-sm:hidden">{{ mySites.length }} 个作品</span>
      </div>

      <div class="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        <article
          v-for="(site, i) in mySites"
          :key="site.name"
          v-reveal="{ delay: Math.min(i, 6) * 50 }"
          class="card group flex flex-col !p-5"
        >
          <div class="flex items-start gap-4">
            <div
              class="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-(--accent-soft) to-(--surface-weak) text-(--accent) transition-transform duration-300 group-hover:scale-[1.05]"
            >
              <component :is="resolveSiteIcon(site.icon)" class="size-7" stroke-width="1.6" aria-hidden="true" />
            </div>
            <div class="min-w-0">
              <h3 class="m-0 font-(family-name:--font-display) text-[17px] font-bold text-(--text-primary) transition-colors duration-200 group-hover:text-(--accent)">
                {{ site.name }}
              </h3>
              <p class="m-0 mt-1.5 text-[13.5px] leading-relaxed text-(--text-secondary)">
                {{ site.desc }}
              </p>
            </div>
          </div>

          <ul class="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
            <li v-for="tag in site.tags" :key="tag">
              <span class="chip chip-accent !py-0.5 !text-xs">{{ tag }}</span>
            </li>
          </ul>

          <div class="mt-4 flex flex-wrap gap-2.5 border-t border-divider pt-4">
            <NuxtLink
              v-if="isInternal(site.url)"
              :to="site.url"
              class="btn btn-primary flex-1 !py-2 !text-sm"
            >
              <Globe class="size-4" aria-hidden="true" /> 访问站点
            </NuxtLink>
            <a
              v-else
              :href="site.url"
              target="_blank"
              rel="noopener"
              class="btn btn-primary flex-1 !py-2 !text-sm"
            >
              <Globe class="size-4" aria-hidden="true" /> 访问站点
            </a>
            <a
              v-if="site.repo"
              :href="site.repo"
              target="_blank"
              rel="noopener"
              class="btn btn-ghost !py-2 !text-sm"
            >
              <GitBranch class="size-4" aria-hidden="true" /> 源码
            </a>
          </div>
        </article>
      </div>
    </section>

    <!-- 我推荐的网站 -->
    <section id="recommend" class="mt-14 scroll-mt-24">
      <div v-reveal class="mb-6">
        <h2 class="m-0 font-(family-name:--font-display) text-[24px] font-extrabold tracking-[-0.5px] text-(--text-primary)">
          <span class="font-mono text-(--accent)">//</span> 我推荐的网站
        </h2>
        <p class="mt-1 text-sm text-(--text-secondary)">
          日常开发中最常打开的站点，按主题分类整理。
        </p>
      </div>

      <div v-for="group in recommendGroups" :key="group.category" class="mb-9">
        <h3
          v-reveal
          class="m-0 mb-3.5 flex items-center gap-2 font-(family-name:--font-display) text-[15px] font-bold text-(--text-primary)"
        >
          <component :is="resolveSiteIcon(group.icon)" class="size-4 text-(--accent)" stroke-width="1.8" aria-hidden="true" />
          {{ group.category }}
        </h3>
        <div class="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <a
            v-for="(s, i) in group.sites"
            :key="s.name"
            v-reveal="{ delay: Math.min(i, 6) * 40 }"
            :href="s.url"
            target="_blank"
            rel="noopener"
            class="card group flex items-start gap-3 !p-4"
          >
            <div
              class="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-weak text-(--text-secondary) transition-colors duration-200 group-hover:bg-(--accent-soft) group-hover:text-(--accent)"
            >
              <component :is="resolveSiteIcon(s.icon)" class="size-5" stroke-width="1.7" aria-hidden="true" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <h4 class="m-0 truncate font-(family-name:--font-display) text-[14.5px] font-bold text-(--text-primary) transition-colors duration-200 group-hover:text-(--accent)">
                  {{ s.name }}
                </h4>
                <ExternalLink
                  class="size-3.5 shrink-0 text-(--text-tertiary) opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </div>
              <p class="m-0 mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-(--text-tertiary)">
                {{ s.desc }}
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- 底部引导 -->
    <section v-reveal class="card mt-4 flex flex-wrap items-center justify-between gap-4 !p-5">
      <p class="m-0 text-sm text-(--text-secondary)">
        想把这些站点也放到首页快捷入口？去首页看看最新的作品速览。
      </p>
      <NuxtLink to="/" class="btn btn-ghost !py-2 !text-sm">
        返回首页 <ArrowRight class="size-4" aria-hidden="true" />
      </NuxtLink>
    </section>
  </div>
</template>