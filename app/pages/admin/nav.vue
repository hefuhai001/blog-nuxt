<template>
  <div class="grid gap-5">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h1 class="m-0 font-(family-name:--font-display) text-2xl font-extrabold text-(--text-primary)">
          网址导航管理
        </h1>
        <p class="m-0 mt-1 text-sm text-(--text-secondary)">
          图标名取自 lucide，需在 app/data/sites.ts 的 siteIconMap 中登记，未登记会回退为地球图标。
        </p>
      </div>
      <button
        type="button"
        :disabled="saving"
        class="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-strong) px-5 text-sm font-bold text-[#141414] shadow-(--shadow-accent) transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
        @click="save"
      >
        {{ saving ? '保存中…' : '保存全部' }}
      </button>
    </header>

    <p
      v-if="message"
      class="m-0 rounded-lg border border-(--accent)/30 bg-(--accent-soft) px-3 py-2 text-[13px] text-(--accent)"
    >
      {{ message }}
    </p>

    <datalist id="icon-options">
      <option v-for="name in iconNames" :key="name" :value="name" />
    </datalist>

    <!-- 我制作的网站 -->
    <section class="rounded-2xl border border-(--surface-border) bg-(--surface-strong) p-5 shadow-(--shadow-card)">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="m-0 text-base font-bold text-(--text-primary)">
          我制作的网站
        </h2>
        <button
          type="button"
          class="rounded-md border border-(--surface-border) px-2.5 py-1 text-[13px] font-semibold text-(--text-secondary) transition-colors hover:text-(--accent)"
          @click="addMySite"
        >
          + 添加
        </button>
      </div>

      <div class="grid gap-4">
        <div
          v-for="(site, i) in mySites"
          :key="`mysite-${i}`"
          class="grid gap-3 rounded-xl border border-(--divider) bg-(--surface-weak) p-4"
        >
          <div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <input v-model="site.name" placeholder="名称" class="input">
            <input v-model="site.url" placeholder="地址（站内以 / 开头，如 /blog）" class="input">
          </div>
          <input v-model="site.desc" placeholder="描述" class="input">
          <div class="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
            <input v-model="site.repo" placeholder="源码仓库（可选）" class="input">
            <input v-model="site.icon" list="icon-options" placeholder="图标名，如 CodeXml" class="input">
            <input v-model="site.tagsText" placeholder="标签，逗号分隔" class="input">
          </div>
          <button
            type="button"
            class="justify-self-start rounded-md border border-(--surface-border) px-2.5 py-1 text-[13px] font-semibold text-(--text-secondary) transition-colors hover:border-(--ios-red)/40 hover:text-(--ios-red)"
            @click="mySites.splice(i, 1)"
          >
            删除
          </button>
        </div>
        <p v-if="!mySites.length" class="m-0 text-sm text-(--text-tertiary)">暂无数据</p>
      </div>
    </section>

    <!-- 推荐网站分组 -->
    <section class="rounded-2xl border border-(--surface-border) bg-(--surface-strong) p-5 shadow-(--shadow-card)">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="m-0 text-base font-bold text-(--text-primary)">
          推荐网站
        </h2>
        <button
          type="button"
          class="rounded-md border border-(--surface-border) px-2.5 py-1 text-[13px] font-semibold text-(--text-secondary) transition-colors hover:text-(--accent)"
          @click="addGroup"
        >
          + 添加分组
        </button>
      </div>

      <div class="grid gap-5">
        <div
          v-for="(group, gi) in recommendGroups"
          :key="`group-${gi}`"
          class="grid gap-3 rounded-xl border border-(--divider) bg-(--surface-weak) p-4"
        >
          <div class="grid grid-cols-[1fr_1fr_auto] items-end gap-3 max-sm:grid-cols-1">
            <input v-model="group.category" placeholder="分组名称" class="input">
            <input v-model="group.icon" list="icon-options" placeholder="分组图标名" class="input">
            <button
              type="button"
              class="h-10 rounded-md border border-(--surface-border) px-2.5 text-[13px] font-semibold text-(--text-secondary) transition-colors hover:border-(--ios-red)/40 hover:text-(--ios-red)"
              @click="recommendGroups.splice(gi, 1)"
            >
              删除分组
            </button>
          </div>

          <div class="grid gap-3 border-l-2 border-(--divider) pl-3">
            <div
              v-for="(link, li) in group.sites"
              :key="`link-${gi}-${li}`"
              class="grid gap-3 rounded-lg border border-(--divider) bg-(--surface-strong) p-3"
            >
              <div class="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                <input v-model="link.name" placeholder="站点名称" class="input">
                <input v-model="link.url" placeholder="地址" class="input">
              </div>
              <input v-model="link.desc" placeholder="描述" class="input">
              <div class="flex items-center gap-3">
                <input v-model="link.icon" list="icon-options" placeholder="图标名" class="input flex-1">
                <button
                  type="button"
                  class="h-10 shrink-0 rounded-md border border-(--surface-border) px-2.5 text-[13px] font-semibold text-(--text-secondary) transition-colors hover:border-(--ios-red)/40 hover:text-(--ios-red)"
                  @click="group.sites.splice(li, 1)"
                >
                  删除
                </button>
              </div>
            </div>
            <button
              type="button"
              class="justify-self-start rounded-md border border-(--surface-border) px-2.5 py-1 text-[13px] font-semibold text-(--text-secondary) transition-colors hover:text-(--accent)"
              @click="group.sites.push({ name: '', desc: '', url: '', icon: '' })"
            >
              + 添加站点
            </button>
          </div>
        </div>
        <p v-if="!recommendGroups.length" class="m-0 text-sm text-(--text-tertiary)">暂无数据</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { SitesData } from '~/data/sites'
import { siteIconMap } from '~/data/sites'

interface MySiteForm {
  name: string
  desc: string
  url: string
  repo: string
  icon: string
  tagsText: string
}
interface LinkForm {
  name: string
  desc: string
  url: string
  icon: string
}
interface GroupForm {
  category: string
  icon: string
  sites: LinkForm[]
}

definePageMeta({ layout: 'admin' })
useHead({ title: '网址导航管理' })

const { data } = await useFetch<SitesData>('/api/admin/nav')

const mySites = ref<MySiteForm[]>((data.value?.mySites ?? []).map(site => ({
  name: site.name,
  desc: site.desc,
  url: site.url,
  repo: site.repo ?? '',
  icon: site.icon ?? '',
  tagsText: (site.tags ?? []).join(', '),
})))

const recommendGroups = ref<GroupForm[]>((data.value?.recommendGroups ?? []).map(group => ({
  category: group.category,
  icon: group.icon ?? '',
  sites: group.sites.map(link => ({
    name: link.name,
    desc: link.desc,
    url: link.url,
    icon: link.icon ?? '',
  })),
})))

const iconNames = Object.keys(siteIconMap).sort()

const saving = ref(false)
const message = ref('')

function addMySite() {
  mySites.value.push({ name: '', desc: '', url: '', repo: '', icon: '', tagsText: '' })
}

function addGroup() {
  recommendGroups.value.push({ category: '', icon: '', sites: [] })
}

async function save() {
  saving.value = true
  message.value = ''
  try {
    await $fetch('/api/admin/nav', {
      method: 'POST',
      body: {
        mySites: mySites.value.map(site => ({
          name: site.name,
          desc: site.desc,
          url: site.url,
          repo: site.repo || undefined,
          icon: site.icon,
          tags: site.tagsText.split(',').map(t => t.trim()).filter(Boolean),
        })),
        recommendGroups: recommendGroups.value.map(group => ({
          category: group.category,
          icon: group.icon,
          sites: group.sites.map(link => ({
            name: link.name,
            desc: link.desc,
            url: link.url,
            icon: link.icon,
          })),
        })),
      },
    })
    message.value = '保存成功'
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; statusMessage?: string }
    message.value = e?.data?.statusMessage || e?.statusMessage || '保存失败，请重试'
  }
  finally {
    saving.value = false
  }
}
</script>

<style scoped>
.input {
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--surface-border);
  background: var(--surface);
  padding: 0 0.75rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
}
.input::placeholder {
  color: var(--text-tertiary);
}
.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}
</style>
