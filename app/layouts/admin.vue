<template>
  <div class="min-h-screen">
    <div class="site-backdrop" aria-hidden="true">
      <div class="grid-ceiling" />
    </div>

    <div class="relative z-[1] mx-auto flex max-w-[1200px] gap-6 px-6 py-8 max-lg:flex-col max-sm:px-4">
      <!-- 侧边栏 -->
      <aside class="w-56 shrink-0 max-lg:w-full">
        <div class="rounded-2xl border border-(--surface-border) bg-(--surface-strong) p-4 max-lg:flex max-lg:items-center max-lg:justify-between max-lg:gap-4">
          <NuxtLink
            to="/"
            class="flex items-center gap-2.5 font-(family-name:--font-display) text-[16px] font-extrabold tracking-[-0.3px] text-(--text-primary)"
          >
            <span
              class="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-strong) font-mono text-xs text-[#141414] shadow-(--shadow-accent)"
            >&lt;/&gt;</span>
            <span>管理后台</span>
          </NuxtLink>

          <nav class="mt-4 grid gap-1 max-lg:mt-0 max-lg:flex max-lg:flex-wrap">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="inline-flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:bg-(--surface-weak) hover:text-(--text-primary) router-link-active:bg-(--accent-soft) router-link-active:text-(--accent)"
            >
              <component :is="item.icon" class="size-4" aria-hidden="true" />{{ item.label }}
            </NuxtLink>
          </nav>

          <button
            type="button"
            class="mt-4 inline-flex h-10 w-full items-center gap-2.5 rounded-lg border border-(--surface-border) px-3 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:border-(--ios-red)/40 hover:text-(--ios-red) max-lg:mt-0 max-lg:w-auto"
            :disabled="loggingOut"
            @click="logout"
          >
            <LogOut class="size-4" aria-hidden="true" />退出登录
          </button>
        </div>
      </aside>

      <!-- 内容区 -->
      <main class="min-w-0 flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, Files, LayoutDashboard, LogOut, Share2, Users } from '@lucide/vue'

const navItems = [
  { to: '/admin', label: '概览', icon: LayoutDashboard },
  { to: '/admin/posts', label: '文章', icon: FileText },
  { to: '/admin/pages', label: '页面', icon: Files },
  { to: '/admin/nav', label: '网址导航', icon: Share2 },
  { to: '/admin/users', label: '用户', icon: Users },
]

const loggingOut = ref(false)

async function logout() {
  loggingOut.value = true
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/login')
  }
  finally {
    loggingOut.value = false
  }
}
</script>
