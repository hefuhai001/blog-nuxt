<template>
  <div class="py-8">
    <header class="mb-6">
      <h1 class="m-0 font-(family-name:--font-display) text-2xl font-extrabold text-(--text-primary)">
        个人中心
      </h1>
      <p class="m-0 mt-1 text-sm text-(--text-secondary)">
        查看账号信息与登录状态。
      </p>
    </header>

    <section class="rounded-2xl border border-(--surface-border) bg-(--surface-strong) p-6 shadow-(--shadow-card)">
      <dl class="m-0 grid gap-4">
        <div class="flex items-center justify-between gap-4 border-b border-(--divider) pb-4">
          <dt class="text-[13px] font-semibold text-(--text-secondary)">昵称</dt>
          <dd class="m-0 text-sm font-semibold text-(--text-primary)">{{ user?.nickname || '—' }}</dd>
        </div>
        <div class="flex items-center justify-between gap-4 border-b border-(--divider) pb-4">
          <dt class="text-[13px] font-semibold text-(--text-secondary)">用户名</dt>
          <dd class="m-0 font-(family-name:--font-mono) text-sm text-(--text-primary)">{{ user?.name || '—' }}</dd>
        </div>
        <div class="flex items-center justify-between gap-4">
          <dt class="text-[13px] font-semibold text-(--text-secondary)">角色</dt>
          <dd class="m-0">
            <span
              class="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold"
              :class="user?.role === 'admin'
                ? 'bg-(--accent-soft) text-(--accent)'
                : 'bg-(--surface-weak) text-(--text-secondary)'"
            >
              {{ user?.role === 'admin' ? '管理员' : '普通用户' }}
            </span>
          </dd>
        </div>
      </dl>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <NuxtLink
          v-if="user?.role === 'admin'"
          to="/admin"
          class="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-strong) px-5 text-sm font-bold text-[#141414] shadow-(--shadow-accent) transition-opacity duration-200 hover:opacity-90"
        >
          进入管理后台
        </NuxtLink>
        <button
          type="button"
          :disabled="loggingOut"
          class="inline-flex h-10 items-center justify-center rounded-lg border border-(--surface-border) px-5 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:border-(--ios-red)/40 hover:text-(--ios-red) disabled:opacity-60"
          @click="logout"
        >
          {{ loggingOut ? '退出中…' : '退出登录' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '个人中心' })

interface MeUser {
  name: string
  nickname: string
  role: 'admin' | 'user'
}

const { data } = await useFetch<{ user: MeUser | null }>('/api/auth/me')
const user = computed(() => data.value?.user ?? null)

const loggingOut = ref(false)

async function logout() {
  loggingOut.value = true
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/')
  }
  finally {
    loggingOut.value = false
  }
}
</script>
