<template>
  <div class="grid gap-5">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h1 class="m-0 font-(family-name:--font-display) text-2xl font-extrabold text-(--text-primary)">
          用户管理
        </h1>
        <p class="m-0 mt-1 text-sm text-(--text-secondary)">
          共 {{ users?.length ?? 0 }} 个用户。可调整角色或删除账号。
        </p>
      </div>
    </header>

    <p
      v-if="message"
      class="m-0 rounded-lg border border-(--accent)/30 bg-(--accent-soft) px-3 py-2 text-[13px] text-(--accent)"
    >
      {{ message }}
    </p>

    <section class="overflow-hidden rounded-2xl border border-(--surface-border) bg-(--surface-strong) shadow-(--shadow-card)">
      <table class="w-full border-collapse text-left text-sm">
        <thead>
          <tr class="border-b border-(--divider) text-[12px] uppercase tracking-wide text-(--text-tertiary)">
            <th class="px-4 py-3 font-semibold">用户名</th>
            <th class="px-4 py-3 font-semibold">昵称</th>
            <th class="px-4 py-3 font-semibold">角色</th>
            <th class="px-4 py-3 font-semibold max-md:hidden">创建时间</th>
            <th class="px-4 py-3 text-right font-semibold">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!users?.length">
            <td colspan="5" class="px-4 py-8 text-center text-(--text-tertiary)">暂无用户</td>
          </tr>
          <tr
            v-for="u in users"
            :key="u.id"
            class="border-b border-(--divider) transition-colors last:border-0 hover:bg-(--surface-weak)"
          >
            <td class="px-4 py-3 font-(family-name:--font-mono) text-[13px] text-(--text-primary)">{{ u.username }}</td>
            <td class="px-4 py-3 text-(--text-secondary)">{{ u.nickname || '—' }}</td>
            <td class="px-4 py-3">
              <select
                :value="u.role"
                class="h-9 rounded-lg border border-(--surface-border) bg-(--surface-weak) px-2.5 text-[13px] text-(--text-primary) outline-none transition-colors focus:border-(--accent)"
                :disabled="busyId === u.id"
                @change="changeRole(u, ($event.target as HTMLSelectElement).value)"
              >
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </td>
            <td class="px-4 py-3 text-(--text-tertiary) max-md:hidden">{{ formatDate(u.createdAt) }}</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <button
                type="button"
                class="rounded-md border border-(--surface-border) px-2.5 py-1 text-[13px] font-semibold text-(--text-secondary) transition-colors hover:border-(--ios-red)/40 hover:text-(--ios-red)"
                :disabled="busyId === u.id"
                @click="remove(u)"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
interface UserRow {
  id: number
  username: string
  nickname: string
  role: 'admin' | 'user'
  createdAt: string
}

definePageMeta({ layout: 'admin' })
useHead({ title: '用户管理' })

const { data, refresh } = await useFetch<{ users: UserRow[] }>('/api/admin/users')

const users = computed(() => data.value?.users ?? [])
const busyId = ref<number | null>(null)
const message = ref('')

async function changeRole(u: UserRow, role: string) {
  busyId.value = u.id
  message.value = ''
  try {
    await $fetch('/api/admin/users', { method: 'PUT', body: { id: u.id, role } })
    await refresh()
    message.value = '角色已更新'
  }
  catch (err: unknown) {
    message.value = errorMessage(err)
    await refresh()
  }
  finally {
    busyId.value = null
  }
}

async function remove(u: UserRow) {
  if (!window.confirm(`确定删除用户「${u.username}」？此操作不可撤销。`)) return
  busyId.value = u.id
  message.value = ''
  try {
    await $fetch('/api/admin/users', { method: 'DELETE', body: { id: u.id } })
    await refresh()
    message.value = '已删除'
  }
  catch (err: unknown) {
    message.value = errorMessage(err)
  }
  finally {
    busyId.value = null
  }
}

function errorMessage(err: unknown): string {
  const e = err as { data?: { statusMessage?: string }; statusMessage?: string }
  return e?.data?.statusMessage || e?.statusMessage || '操作失败，请重试'
}

function formatDate(value: string): string {
  return value ? new Date(value).toLocaleString('zh-CN') : '—'
}
</script>
