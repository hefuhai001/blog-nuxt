<template>
  <div class="grid gap-5">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h1 class="m-0 font-(family-name:--font-display) text-2xl font-extrabold text-(--text-primary)">
          文章管理
        </h1>
        <p class="m-0 mt-1 text-sm text-(--text-secondary)">
          共 {{ posts?.length ?? 0 }} 篇。正文为 Markdown，保存后自动重算摘要与阅读时长。
        </p>
      </div>
      <button
        type="button"
        class="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-strong) px-4 text-sm font-bold text-[#141414] shadow-(--shadow-accent) transition-opacity duration-200 hover:opacity-90"
        @click="openCreate"
      >
        <Plus class="size-4" aria-hidden="true" />新建文章
      </button>
    </header>

    <p
      v-if="message"
      class="m-0 rounded-lg border border-(--accent)/30 bg-(--accent-soft) px-3 py-2 text-[13px] text-(--accent)"
    >
      {{ message }}
    </p>

    <!-- 编辑 / 新建表单 -->
    <section
      v-if="form.open"
      class="rounded-2xl border border-(--surface-border) bg-(--surface-strong) p-5 shadow-(--shadow-card)"
    >
      <h2 class="m-0 mb-4 text-base font-bold text-(--text-primary)">
        {{ form.mode === 'create' ? '新建文章' : `编辑：${form.id}` }}
      </h2>
      <div class="grid gap-4">
        <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <label class="grid gap-1.5 text-[13px] font-semibold text-(--text-secondary)">
            分类（目录名）
            <input
              v-model="form.category"
              :disabled="form.mode === 'edit'"
              type="text"
              placeholder="如 django"
              class="h-10 rounded-lg border border-(--surface-border) bg-(--surface-weak) px-3 text-sm font-normal text-(--text-primary) outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft) disabled:opacity-60"
            >
          </label>
          <label class="grid gap-1.5 text-[13px] font-semibold text-(--text-secondary)">
            文件名
            <input
              v-model="form.fileName"
              :disabled="form.mode === 'edit'"
              type="text"
              placeholder="如 hello-world"
              class="h-10 rounded-lg border border-(--surface-border) bg-(--surface-weak) px-3 text-sm font-normal text-(--text-primary) outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft) disabled:opacity-60"
            >
          </label>
        </div>
        <label class="grid gap-1.5 text-[13px] font-semibold text-(--text-secondary)">
          标题
          <input
            v-model="form.title"
            type="text"
            placeholder="文章标题"
            class="h-10 rounded-lg border border-(--surface-border) bg-(--surface-weak) px-3 text-sm font-normal text-(--text-primary) outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)"
          >
        </label>
        <label class="grid gap-1.5 text-[13px] font-semibold text-(--text-secondary)">
          描述（留空自动取正文摘要）
          <input
            v-model="form.description"
            type="text"
            placeholder="可选"
            class="h-10 rounded-lg border border-(--surface-border) bg-(--surface-weak) px-3 text-sm font-normal text-(--text-primary) outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent-soft)"
          >
        </label>
        <label class="grid gap-1.5 text-[13px] font-semibold text-(--text-secondary)">
          正文（Markdown）
          <textarea
            v-model="form.bodyMd"
            rows="14"
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

    <!-- 列表 -->
    <section class="overflow-hidden rounded-2xl border border-(--surface-border) bg-(--surface-strong) shadow-(--shadow-card)">
      <table class="w-full border-collapse text-left text-sm">
        <thead>
          <tr class="border-b border-(--divider) text-[12px] uppercase tracking-wide text-(--text-tertiary)">
            <th class="px-4 py-3 font-semibold">标题</th>
            <th class="px-4 py-3 font-semibold max-md:hidden">分类</th>
            <th class="px-4 py-3 font-semibold max-lg:hidden">字数</th>
            <th class="px-4 py-3 font-semibold max-lg:hidden">阅读</th>
            <th class="px-4 py-3 text-right font-semibold">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!posts?.length">
            <td colspan="5" class="px-4 py-8 text-center text-(--text-tertiary)">暂无文章</td>
          </tr>
          <tr
            v-for="post in posts"
            :key="post.id"
            class="border-b border-(--divider) transition-colors last:border-0 hover:bg-(--surface-weak)"
          >
            <td class="px-4 py-3">
              <NuxtLink
                :to="`/blog/${post.slug}`"
                target="_blank"
                class="font-semibold text-(--text-primary) transition-colors hover:text-(--accent)"
              >{{ post.title }}</NuxtLink>
              <div class="mt-0.5 font-(family-name:--font-mono) text-[11px] text-(--text-tertiary)">{{ post.slug }}</div>
            </td>
            <td class="px-4 py-3 text-(--text-secondary) max-md:hidden">{{ post.category || '—' }}</td>
            <td class="px-4 py-3 text-(--text-secondary) max-lg:hidden">{{ post.words }}</td>
            <td class="px-4 py-3 text-(--text-secondary) max-lg:hidden">{{ post.readingTime }} 分钟</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <button
                type="button"
                class="mr-2 rounded-md border border-(--surface-border) px-2.5 py-1 text-[13px] font-semibold text-(--text-secondary) transition-colors hover:text-(--accent)"
                @click="openEdit(post)"
              >
                编辑
              </button>
              <button
                type="button"
                class="rounded-md border border-(--surface-border) px-2.5 py-1 text-[13px] font-semibold text-(--text-secondary) transition-colors hover:border-(--ios-red)/40 hover:text-(--ios-red)"
                @click="remove(post)"
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

interface PostMeta {
  id: string
  slug: string
  category: string
  title: string
  description: string
  words: number
  readingTime: number
}
interface PostDetail extends PostMeta {
  bodyMd: string
  updatedAt: string
}

definePageMeta({ layout: 'admin' })
useHead({ title: '文章管理' })

const { data: posts, refresh } = await useFetch<PostMeta[]>('/api/admin/posts')

const saving = ref(false)
const message = ref('')
const form = reactive({
  open: false,
  mode: 'create' as 'create' | 'edit',
  id: '',
  category: '',
  fileName: '',
  title: '',
  description: '',
  bodyMd: '',
})

function resetForm() {
  form.id = ''
  form.category = ''
  form.fileName = ''
  form.title = ''
  form.description = ''
  form.bodyMd = ''
}

function openCreate() {
  message.value = ''
  resetForm()
  form.mode = 'create'
  form.open = true
}

async function openEdit(post: PostMeta) {
  message.value = ''
  const detail = await $fetch<PostDetail>('/api/admin/posts', { query: { id: post.id } })
  form.id = detail.id
  form.category = detail.category
  form.fileName = detail.slug.split('/').slice(1).join('/')
  form.title = detail.title
  form.description = detail.description
  form.bodyMd = detail.bodyMd
  form.mode = 'edit'
  form.open = true
}

async function save() {
  saving.value = true
  message.value = ''
  try {
    if (form.mode === 'create') {
      await $fetch('/api/admin/posts', {
        method: 'POST',
        body: {
          category: form.category,
          fileName: form.fileName,
          title: form.title,
          description: form.description,
          bodyMd: form.bodyMd,
        },
      })
    }
    else {
      await $fetch('/api/admin/posts', {
        method: 'PUT',
        body: { id: form.id, title: form.title, description: form.description, bodyMd: form.bodyMd },
      })
    }
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

async function remove(post: PostMeta) {
  if (!window.confirm(`确定删除《${post.title}》？此操作不可撤销。`)) return
  message.value = ''
  try {
    await $fetch('/api/admin/posts', { method: 'DELETE', body: { id: post.id } })
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
</script>
