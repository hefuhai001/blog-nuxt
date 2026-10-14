<template>
  <div class="grid gap-5">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h1 class="m-0 font-(family-name:--font-display) text-2xl font-extrabold text-(--text-primary)">
          页面管理
        </h1>
        <p class="m-0 mt-1 text-sm text-(--text-secondary)">
          共 {{ pages?.length ?? 0 }} 个。路径即访问地址（如 /about）。
        </p>
      </div>
      <button
        type="button"
        class="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-strong) px-4 text-sm font-bold text-[#141414] shadow-(--shadow-accent) transition-opacity duration-200 hover:opacity-90"
        @click="openCreate"
      >
        <Plus class="size-4" aria-hidden="true" />新建页面
      </button>
    </header>

    <p
      v-if="message"
      class="m-0 rounded-lg border border-(--accent)/30 bg-(--accent-soft) px-3 py-2 text-[13px] text-(--accent)"
    >
      {{ message }}
    </p>

    <section
      v-if="form.open"
      class="rounded-2xl border border-(--surface-border) bg-(--surface-strong) p-5 shadow-(--shadow-card)"
    >
      <h2 class="m-0 mb-4 text-base font-bold text-(--text-primary)">
        {{ form.mode === 'create' ? '新建页面' : `编辑：${form.path}` }}
      </h2>
      <div class="grid gap-4">
        <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <label class="grid gap-1.5 text-[13px] font-semibold text-(--text-secondary)">
            路径
            <input
              v-model="form.path"
              :disabled="form.mode === 'edit'"
              type="text"
              placeholder="如 /about"
              class="h-10 rounded-lg border border-(--surface-border) bg-(--surface-weak) px-3 text-sm font-normal text-(--text-primary) outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft) disabled:opacity-60"
            >
          </label>
          <label class="grid gap-1.5 text-[13px] font-semibold text-(--text-secondary)">
            标题
            <input
              v-model="form.title"
              type="text"
              placeholder="页面标题"
              class="h-10 rounded-lg border border-(--surface-border) bg-(--surface-weak) px-3 text-sm font-normal text-(--text-primary) outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)"
            >
          </label>
        </div>
        <label class="grid gap-1.5 text-[13px] font-semibold text-(--text-secondary)">
          正文（Markdown）
          <textarea
            v-model="form.bodyMd"
            rows="12"
            placeholder="# 标题&#10;&#10;正文…"
            class="rounded-lg border border-(--surface-border) bg-(--surface-weak) px-3 py-2 font-(family-name:--font-mono) text-[13px] font-normal leading-relaxed text-(--text-primary) outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)"
          />
        </label>
        <div class="flex items-center gap-3">
          <button
            type="button"
            :disabled="saving"
            class="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-strong) px-5 text-sm font-bold text-[#141414] shadow-(--shadow-accent) transition-opacity hover:opacity-90 disabled:opacity-60"
            @click="save"
          >
            {{ saving ? '保存中…' : '保存' }}
          </button>
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center rounded-lg border border-(--surface-border) px-5 text-sm font-semibold text-(--text-secondary) transition-colors hover:text-(--text-primary)"
            @click="form.open = false"
          >
            取消
          </button>
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-2xl border border-(--surface-border) bg-(--surface-strong) shadow-(--shadow-card)">
      <table class="w-full border-collapse text-left text-sm">
        <thead>
          <tr class="border-b border-(--divider) text-[12px] uppercase tracking-wide text-(--text-tertiary)">
            <th class="px-4 py-3 font-semibold">路径</th>
            <th class="px-4 py-3 font-semibold">标题</th>
            <th class="px-4 py-3 font-semibold max-md:hidden">更新时间</th>
            <th class="px-4 py-3 text-right font-semibold">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!pages?.length">
            <td colspan="4" class="px-4 py-8 text-center text-(--text-tertiary)">暂无页面</td>
          </tr>
          <tr
            v-for="page in pages"
            :key="page.path"
            class="border-b border-(--divider) transition-colors last:border-0 hover:bg-(--surface-weak)"
          >
            <td class="px-4 py-3 font-(family-name:--font-mono) text-[13px] text-(--text-primary)">{{ page.path }}</td>
            <td class="px-4 py-3 text-(--text-secondary)">{{ page.title }}</td>
            <td class="px-4 py-3 text-(--text-tertiary) max-md:hidden">{{ formatDate(page.updatedAt) }}</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <button
                type="button"
                class="mr-2 rounded-md border border-(--surface-border) px-2.5 py-1 text-[13px] font-semibold text-(--text-secondary) transition-colors hover:text-(--accent)"
                @click="openEdit(page)"
              >
                编辑
              </button>
              <button
                type="button"
                class="rounded-md border border-(--surface-border) px-2.5 py-1 text-[13px] font-semibold text-(--text-secondary) transition-colors hover:border-(--ios-red)/40 hover:text-(--ios-red)"
                @click="remove(page)"
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
import { Plus } from '@lucide/vue'

interface PageMeta {
  path: string
  title: string
  updatedAt: string
}
interface PageDetail extends PageMeta {
  bodyMd: string
}

definePageMeta({ layout: 'admin' })
useHead({ title: '页面管理' })

const { data: pages, refresh } = await useFetch<PageMeta[]>('/api/admin/pages')

const saving = ref(false)
const message = ref('')
const form = reactive({
  open: false,
  mode: 'create' as 'create' | 'edit',
  path: '',
  title: '',
  bodyMd: '',
})

function openCreate() {
  message.value = ''
  form.mode = 'create'
  form.path = ''
  form.title = ''
  form.bodyMd = ''
  form.open = true
}

async function openEdit(page: PageMeta) {
  message.value = ''
  const detail = await $fetch<PageDetail>('/api/admin/pages', { query: { path: page.path } })
  form.mode = 'edit'
  form.path = detail.path
  form.title = detail.title
  form.bodyMd = detail.bodyMd
  form.open = true
}

async function save() {
  saving.value = true
  message.value = ''
  try {
    await $fetch('/api/admin/pages', {
      method: form.mode === 'create' ? 'POST' : 'PUT',
      body: { path: form.path, title: form.title, bodyMd: form.bodyMd },
    })
    await refresh()
    form.open = false
    message.value = '保存成功'
  }
  catch (err: unknown) {
    message.value = errorMessage(err)
  }
  finally {
    saving.value = false
  }
}

async function remove(page: PageMeta) {
  if (!window.confirm(`确定删除页面 ${page.path}？此操作不可撤销。`)) return
  message.value = ''
  try {
    await $fetch('/api/admin/pages', { method: 'DELETE', body: { path: page.path } })
    await refresh()
    message.value = '已删除'
  }
  catch (err: unknown) {
    message.value = errorMessage(err)
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
