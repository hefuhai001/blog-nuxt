<template>
  <div class="min-h-screen">
    <!-- 透视网格 + 氛围光斑背景 -->
    <div class="site-backdrop" aria-hidden="true">
      <div class="grid-ceiling" />
    </div>

    <!-- 通栏导航 -->
    <header
      class="sticky top-0 z-50 border-b border-(--surface-border) bg-(--surface-strong) backdrop-blur-xl backdrop-saturate-150"
    >
      <div class="mx-auto flex h-16 max-w-[1200px] items-center gap-8 px-6 max-lg:gap-4 max-sm:px-4">
        <NuxtLink
          to="/"
          class="flex shrink-0 items-center gap-2.5 font-(family-name:--font-display) text-[19px] font-extrabold tracking-[-0.3px] text-(--text-primary)"
        >
          <span
            class="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-(--accent) to-(--accent-strong) font-mono text-sm text-[#141414] shadow-(--shadow-accent)"
          >&lt;/&gt;</span>
          <span>CodeTrail <span class="text-(--accent)">·</span> <b class="font-extrabold">代码轨迹</b></span>
        </NuxtLink>

        <nav class="flex items-center gap-1 max-md:hidden">
          <NuxtLink
            to="/"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:bg-(--surface-weak) hover:text-(--text-primary) router-link-active:bg-(--accent-soft) router-link-active:text-(--accent)"
          >
            <span aria-hidden="true" class="text-xs">🏠</span> 首页
          </NuxtLink>
          <NuxtLink
            to="/blog"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:bg-(--surface-weak) hover:text-(--text-primary) router-link-active:bg-(--accent-soft) router-link-active:text-(--accent)"
          >
            <span aria-hidden="true" class="text-xs">📝</span> 博客文章
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:bg-(--surface-weak) hover:text-(--text-primary) router-link-active:bg-(--accent-soft) router-link-active:text-(--accent)"
          >
            <span aria-hidden="true" class="text-xs">🧭</span> 关于本站
          </NuxtLink>
        </nav>

        <div class="ml-auto flex items-center gap-2.5">
          <!-- 搜索框（点击唤起命令面板） -->
          <button
            type="button"
            class="hidden h-9 w-56 items-center gap-2 rounded-full border border-(--surface-border) bg-(--surface-weak) px-4 text-[13px] text-(--text-tertiary) transition-colors duration-200 hover:border-(--accent-soft) hover:text-(--text-secondary) md:flex"
            aria-label="搜索文章"
            @click="useCommandPalette().open()"
          >
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            搜索文章…
            <kbd class="ml-auto rounded border border-(--surface-border) px-1.5 font-mono text-[11px]">⌘K</kbd>
          </button>
          <button
            type="button"
            class="icon-btn md:hidden"
            aria-label="搜索"
            @click="useCommandPalette().open()"
          >
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <div class="relative z-[1] mx-auto max-w-[1200px] px-6 pb-16 max-sm:px-4">
      <slot />
    </div>

    <footer class="relative z-[1] border-t border-(--surface-border) py-8 text-center text-[13px] text-(--text-tertiary)">
      © {{ new Date().getFullYear() }} CodeTrail · 代码轨迹 · Made with ⚡ Nuxt &amp; Tailwind
    </footer>

    <SearchModal />
  </div>
</template>

<script setup lang="ts">
import { useCommandPalette } from '~/composables/command-palette'

useHead({ htmlAttrs: { lang: 'zh-CN' } })
</script>
