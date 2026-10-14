<template>
  <div class="min-h-screen">
    <!-- 透视网格 + 氛围光斑背景 -->
    <div class="site-backdrop" aria-hidden="true">
      <div class="grid-ceiling" />
    </div>

    <!-- 通栏导航 -->
    <header
      class="sticky top-0 z-50 border-b border-(--surface-border) bg-(--surface-strong) max-md:relative"
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
            <Home class="size-4" aria-hidden="true" /> 首页
          </NuxtLink>
          <NuxtLink
            to="/blog"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:bg-(--surface-weak) hover:text-(--text-primary) router-link-active:bg-(--accent-soft) router-link-active:text-(--accent)"
          >
            <BookOpen class="size-4" aria-hidden="true" /> 博客文章
          </NuxtLink>
          <NuxtLink
            to="/links"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:bg-(--surface-weak) hover:text-(--text-primary) router-link-active:bg-(--accent-soft) router-link-active:text-(--accent)"
          >
            <Globe class="size-4" aria-hidden="true" /> 网址导航
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:bg-(--surface-weak) hover:text-(--text-primary) router-link-active:bg-(--accent-soft) router-link-active:text-(--accent)"
          >
            <Compass class="size-4" aria-hidden="true" /> 关于本站
          </NuxtLink>
        </nav>

        <!-- 移动端汉堡菜单 -->
        <button
          type="button"
          class="icon-btn md:hidden"
          :aria-expanded="mobileMenuOpen"
          aria-label="打开菜单"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <Menu v-if="!mobileMenuOpen" class="size-4.5" aria-hidden="true" />
          <X v-else class="size-4.5" aria-hidden="true" />
        </button>

        <div class="ml-auto flex items-center gap-2.5">
          <!-- 搜索框（点击唤起命令面板） -->
          <button
            type="button"
            class="hidden h-9 w-56 items-center gap-2 rounded-full border border-(--surface-border) bg-(--surface-weak) px-4 text-[13px] text-(--text-tertiary) transition-colors duration-200 hover:border-(--accent-soft) hover:text-(--text-secondary) md:flex"
            aria-label="搜索文章"
            @click="useCommandPalette().open()"
          >
            <Search class="size-4" aria-hidden="true" />
            搜索文章…
            <kbd class="ml-auto rounded border border-(--surface-border) px-1.5 font-mono text-[11px]">⌘K</kbd>
          </button>
          <button
            type="button"
            class="icon-btn md:hidden"
            aria-label="搜索"
            @click="useCommandPalette().open()"
          >
            <Search class="size-4" aria-hidden="true" />
          </button>
          <ThemeToggle />
          <!-- 登录 / 账号入口（右上角） -->
          <NuxtLink
            v-if="currentUser"
            :to="accountLink"
            class="hidden h-9 items-center gap-1.5 rounded-full border border-(--surface-border) bg-(--surface-weak) px-4 text-[13px] font-semibold text-(--text-secondary) transition-colors duration-200 hover:border-(--accent-soft) hover:text-(--accent) md:inline-flex"
          >
            <User class="size-4" aria-hidden="true" />{{ accountLabel }}
          </NuxtLink>
          <NuxtLink
            v-else
            to="/login"
            class="hidden h-9 items-center gap-2 rounded-full border border-(--surface-border) bg-(--surface-weak) px-4 text-[13px] font-semibold text-(--text-secondary) transition-colors duration-200 hover:border-(--accent-soft) hover:text-(--accent) md:inline-flex"
          >
            <User class="size-4" aria-hidden="true" />登录
          </NuxtLink>
        </div>
      </div>

      <!-- 移动端下拉菜单 -->
      <Transition name="menu-drop">
        <nav
          v-if="mobileMenuOpen"
          class="absolute inset-x-0 top-full border-b border-(--surface-border) bg-(--surface-strong) p-3 shadow-(--shadow-card-lg) md:hidden"
        >
          <ul class="m-0 grid list-none gap-1 p-0">
            <li v-for="item in mobileLinks" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="flex h-11 items-center gap-3 rounded-xl px-4 text-[15px] font-semibold text-(--text-secondary) transition-colors duration-150 hover:bg-(--surface-weak) hover:text-(--text-primary) router-link-active:bg-(--accent-soft) router-link-active:text-(--accent)"
                @click="mobileMenuOpen = false"
              >
                <component :is="item.icon" class="size-4.5" aria-hidden="true" />{{ item.label }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                :to="currentUser ? accountLink : '/login'"
                class="flex h-11 items-center gap-3 rounded-xl px-4 text-[15px] font-semibold text-(--text-secondary) transition-colors duration-150 hover:bg-(--surface-weak) hover:text-(--text-primary) router-link-active:bg-(--accent-soft) router-link-active:text-(--accent)"
                @click="mobileMenuOpen = false"
              >
                <User class="size-4.5" aria-hidden="true" />{{ currentUser ? accountLabel : '登录' }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </Transition>
    </header>

    <div class="relative z-[1] mx-auto max-w-[1200px] px-6 pb-16 max-sm:px-4">
      <slot />
    </div>

    <footer class="relative z-[1] border-t border-(--surface-border) py-8 text-center text-[13px] text-(--text-tertiary)">
      <p class="m-0">
        © {{ new Date().getFullYear() }} CodeTrail · 代码轨迹 · Made with <Zap class="inline size-3.5 align-[-2px] text-(--accent)" aria-hidden="true" /> Nuxt &amp; Tailwind
      </p>
      <p class="m-0 mt-2">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer nofollow"
          class="transition-colors duration-200 hover:text-(--accent)"
        >赣ICP备2025072831号-2</a>
      </p>
    </footer>

    <SearchModal />
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Compass, Globe, Home, Menu, Search, User, X, Zap } from '@lucide/vue'
import { useCommandPalette } from '~/composables/command-palette'

useHead({ htmlAttrs: { lang: 'zh-CN' } })

const route = useRoute()
const mobileMenuOpen = ref(false)

// 当前登录用户（用于右上角登录 / 账号入口，未登录为 null）
const { data: me } = await useFetch<{ user: { name: string; nickname: string; role: 'admin' | 'user' } | null }>('/api/auth/me')
const currentUser = computed(() => me.value?.user ?? null)
const accountLink = computed(() => currentUser.value?.role === 'admin' ? '/admin' : '/account')
const accountLabel = computed(() => currentUser.value?.nickname || currentUser.value?.name || '个人中心')

const mobileLinks = [
  { to: '/', label: '首页', icon: Home },
  { to: '/blog', label: '博客文章', icon: BookOpen },
  { to: '/links', label: '网址导航', icon: Globe },
  { to: '/about', label: '关于本站', icon: Compass },
]

// 路由变化时自动收起菜单
watch(() => route.fullPath, () => { mobileMenuOpen.value = false })
</script>
