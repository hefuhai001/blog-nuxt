<template>
  <div class="grid gap-6">
    <header>
      <h1 class="m-0 font-(family-name:--font-display) text-2xl font-extrabold text-(--text-primary)">
        后台概览
      </h1>
      <p class="m-0 mt-1 text-sm text-(--text-secondary)">
        内容与网址导航数据均存于本地 MySQL，可在下方各页维护。
      </p>
    </header>

    <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
      <div
        v-for="card in cards"
        :key="card.label"
        class="rounded-2xl border border-(--surface-border) bg-(--surface-strong) p-5 shadow-(--shadow-card)"
      >
        <div class="flex items-center gap-2.5 text-(--text-secondary)">
          <component :is="card.icon" class="size-4" aria-hidden="true" />
          <span class="text-[13px] font-semibold">{{ card.label }}</span>
        </div>
        <p class="m-0 mt-3 font-(family-name:--font-display) text-3xl font-extrabold text-(--accent)">
          {{ card.value }}
        </p>
      </div>
    </div>

    <div class="grid gap-3">
      <NuxtLink
        v-for="item in links"
        :key="item.to"
        :to="item.to"
        class="flex items-center justify-between rounded-xl border border-(--surface-border) bg-(--surface-strong) px-5 py-4 text-sm font-semibold text-(--text-primary) transition-colors duration-200 hover:border-(--accent-soft) hover:text-(--accent)"
      >
        <span>{{ item.label }}</span>
        <ArrowRight class="size-4" aria-hidden="true" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, FileText, Files, Share2 } from '@lucide/vue'

definePageMeta({ layout: 'admin' })
useHead({ title: '后台概览' })

const { data: stats } = await useFetch('/api/admin/stats')

const cards = computed(() => [
  { label: '文章', value: stats.value?.posts ?? 0, icon: FileText },
  { label: '页面', value: stats.value?.pages ?? 0, icon: Files },
  { label: '我的站点', value: stats.value?.navSites ?? 0, icon: Share2 },
  { label: '推荐分组', value: stats.value?.navGroups ?? 0, icon: Share2 },
  { label: '推荐站点', value: stats.value?.navLinks ?? 0, icon: Share2 },
])

const links = [
  { to: '/admin/posts', label: '管理文章 →' },
  { to: '/admin/pages', label: '管理页面 →' },
  { to: '/admin/nav', label: '管理网址导航 →' },
]
</script>
