<template>
  <div class="min-h-screen">
    <!-- iOS 26 背景光斑层（供玻璃模糊） -->
    <div class="ios-backdrop" aria-hidden="true" />

    <div class="blog-layout">
      <header class="blog-header">
        <NuxtLink to="/" class="site-name">
          <span class="logo-emoji">🌸</span>
          <span>我的<b>技术博客</b></span>
        </NuxtLink>
        <nav class="nav-capsule">
          <NuxtLink to="/" class="nav-link">首页</NuxtLink>
          <NuxtLink to="/about" class="nav-link">关于</NuxtLink>
          <button type="button" class="icon-btn nav-search-btn" aria-label="搜索" title="搜索（⌘K / Ctrl K）" @click="useCommandPalette().open()">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <ThemeToggle />
        </nav>
      </header>

      <div class="blog-body">
        <main class="blog-main">
          <slot />
        </main>
        <BlogSidebar />
      </div>

      <footer class="blog-footer">
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

<style scoped>
.search-icon {
  width: 17px;
  height: 17px;
}
</style>
