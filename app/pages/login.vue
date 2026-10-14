<template>
  <div class="relative flex min-h-screen items-center justify-center px-4">
    <div class="site-backdrop" aria-hidden="true">
      <div class="grid-ceiling" />
    </div>

    <div class="relative z-[1] w-full max-w-sm rounded-2xl border border-(--surface-border) bg-(--surface-strong) p-8 shadow-(--shadow-card-lg)">
      <div class="mb-6 flex flex-col items-center text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2.5 font-(family-name:--font-display) text-[17px] font-extrabold tracking-[-0.3px] text-(--text-primary)"
        >
          <span
            class="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-(--accent) to-(--accent-strong) font-mono text-sm text-[#141414] shadow-(--shadow-accent)"
          >&lt;/&gt;</span>
          <span>CodeTrail <span class="text-(--accent)">·</span> 代码轨迹</span>
        </NuxtLink>
        <h1 class="mt-4 text-lg font-bold text-(--text-primary)">
          登录
        </h1>
      </div>

      <form class="grid gap-4" @submit.prevent="submit">
        <label class="grid gap-1.5 text-[13px] font-semibold text-(--text-secondary)">
          用户名
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            placeholder="请输入用户名"
            class="h-10 rounded-lg border border-(--surface-border) bg-(--surface-weak) px-3 text-sm font-normal text-(--text-primary) outline-none transition-colors duration-200 placeholder:text-(--text-tertiary) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)"
          >
        </label>

        <label class="grid gap-1.5 text-[13px] font-semibold text-(--text-secondary)">
          密码
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
            class="h-10 rounded-lg border border-(--surface-border) bg-(--surface-weak) px-3 text-sm font-normal text-(--text-primary) outline-none transition-colors duration-200 placeholder:text-(--text-tertiary) focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)"
          >
        </label>

        <p
          v-if="error"
          class="m-0 rounded-lg border border-(--ios-red)/30 bg-(--ios-red)/10 px-3 py-2 text-[13px] text-(--ios-red)"
        >
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="mt-1 inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-strong) text-sm font-bold text-[#141414] shadow-(--shadow-accent) transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? '登录中…' : '登录' }}
        </button>

        <NuxtLink
          to="/register"
          class="text-center text-[13px] text-(--text-secondary) transition-colors duration-200 hover:text-(--accent)"
        >
          没有账号？<span class="font-semibold text-(--accent)">立即注册</span>
        </NuxtLink>

        <NuxtLink
          to="/"
          class="text-center text-[13px] text-(--text-tertiary) transition-colors duration-200 hover:text-(--accent)"
        >
          返回首页
        </NuxtLink>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: '登录' })

const route = useRoute()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const res = await $fetch<{ user: { name: string; nickname: string; role: 'admin' | 'user' } }>('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })
    // 优先跳回来源页；否则按角色分流：管理员进后台，普通用户进个人中心
    const raw = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const home = res.user.role === 'admin' ? '/admin' : '/account'
    const canUseRedirect = raw.startsWith('/')
      && (raw.startsWith('/admin') ? res.user.role === 'admin' : true)
    await navigateTo(canUseRedirect ? raw : home)
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; statusMessage?: string }
    error.value = e?.data?.statusMessage || e?.statusMessage || '登录失败，请重试'
  }
  finally {
    loading.value = false
  }
}
</script>
