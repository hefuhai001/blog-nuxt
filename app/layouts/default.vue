<template>
  <div class="min-h-screen">
    <!-- iOS 26 背景光斑层（供玻璃模糊） -->
    <div class="ios-backdrop" aria-hidden="true" />

    <div class="relative z-[1] mx-auto max-w-[1080px] px-6 pb-10">
      <!-- 吸顶悬浮玻璃岛 -->
      <header
        class="sticky top-3.5 z-50 mb-3 flex items-center justify-between gap-3 rounded-full border border-(--glass-border) bg-(--glass-bg-strong) py-2 pl-3.5 pr-2 shadow-[inset_0_1px_0_var(--glass-rim),0_8px_24px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.05)] backdrop-blur-(--glass-blur) backdrop-saturate-(--glass-saturate) max-sm:top-2 max-sm:py-1.5 max-sm:pl-3"
      >
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2.5 font-(family-name:--font-display) text-[19px] font-bold tracking-[-0.3px] text-(--text-primary) max-sm:gap-2 max-sm:text-[17px]"
        >
          <span
            class="inline-flex size-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-[#7aa2ff] to-[#b18cff] text-[17px] shadow-(--shadow-blue) max-sm:size-[30px] max-sm:text-[15px]"
          >🌸</span>
          <span>我的<b class="bg-gradient-to-r from-[#0a7cff] to-[#7a5cff] bg-clip-text text-transparent">技术博客</b></span>
        </NuxtLink>
        <nav class="inline-flex items-center gap-0.5 rounded-full bg-(--glass-bg-weak) p-1 shadow-[inset_0_1px_0_var(--glass-rim)]">
          <NuxtLink
            to="/"
            class="inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-semibold text-(--text-secondary) transition-[color,background-color,box-shadow] duration-200 hover:text-(--text-primary) router-link-active:bg-(--ios-blue-strong) router-link-active:text-white router-link-active:shadow-(--shadow-blue) max-sm:h-[34px] max-sm:px-3 max-sm:text-[13px]"
          >首页</NuxtLink>
          <NuxtLink
            to="/about"
            class="inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-semibold text-(--text-secondary) transition-[color,background-color,box-shadow] duration-200 hover:text-(--text-primary) router-link-active:bg-(--ios-blue-strong) router-link-active:text-white router-link-active:shadow-(--shadow-blue) max-sm:h-[34px] max-sm:px-3 max-sm:text-[13px]"
          >关于</NuxtLink>
          <button
            type="button"
            class="icon-btn max-sm:size-[34px]"
            aria-label="搜索"
            title="搜索（⌘K / Ctrl K）"
            @click="useCommandPalette().open()"
          >
            <svg class="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <ThemeToggle />
        </nav>
      </header>

      <div class="grid grid-cols-[1fr_272px] items-start gap-7 max-[840px]:grid-cols-1">
        <main class="relative z-[1] min-w-0">
          <slot />
        </main>
        <BlogSidebar />
      </div>

      <footer class="mt-14 pt-6 pb-2 text-center text-[13px] text-(--text-tertiary)">
        © {{ new Date().getFullYear() }} · Made with 🍑 Nuxt &amp; Tailwind
      </footer>
    </div>

    <SearchModal />
  </div>
</template>

<script setup lang="ts">
import { useCommandPalette } from '~/composables/command-palette'

useHead({ htmlAttrs: { lang: 'zh-CN' } })
</script>
