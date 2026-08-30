<script setup lang="ts">
// 副标题打字机：循环打字/删除
const phrases = [
  '程序员的终身学习路线图',
  'VibeCoding + AI 工具实战',
  '把每一行代码，变成成长的足迹',
]
const typed = ref('')
const phraseIndex = ref(0)

onMounted(() => {
  let charIndex = 0
  let deleting = false
  let timer: ReturnType<typeof setTimeout>

  const tick = () => {
    const current = phrases[phraseIndex.value]!
    if (!deleting) {
      charIndex++
      typed.value = current.slice(0, charIndex)
      if (charIndex === current.length) {
        deleting = true
        timer = setTimeout(tick, 2200)
        return
      }
      timer = setTimeout(tick, 90)
    } else {
      charIndex--
      typed.value = current.slice(0, charIndex)
      if (charIndex === 0) {
        deleting = false
        phraseIndex.value = (phraseIndex.value + 1) % phrases.length
        timer = setTimeout(tick, 400)
        return
      }
      timer = setTimeout(tick, 35)
    }
  }
  timer = setTimeout(tick, 400)
  onUnmounted(() => clearTimeout(timer))
})

// 代码窗口逐行打字
const codeLines = [
  '// 欢迎来到 CodeTrail 代码轨迹',
  'const developer = {',
  "  name: '你',",
  "  skills: ['Vue', 'Nuxt', 'Java'],",
  "  goal: '成为更好的程序员',",
  '};',
  '',
  '// 开启学习之旅 …',
] as const

const doneLines = ref<string[]>([])
const currentLine = ref('')

onMounted(() => {
  let line = 0
  let col = 0
  let timer: ReturnType<typeof setTimeout>

  const tick = () => {
    if (line >= codeLines.length) {
      // 全部打完，停留 4s 后重放
      timer = setTimeout(() => {
        line = 0
        col = 0
        doneLines.value = []
        currentLine.value = ''
        tick()
      }, 4000)
      return
    }
    const target = codeLines[line]!
    col++
    currentLine.value = target.slice(0, col)
    if (col >= target.length) {
      doneLines.value = [...doneLines.value, target]
      currentLine.value = ''
      line++
      col = 0
      timer = setTimeout(tick, line === 6 ? 350 : 180)
      return
    }
    timer = setTimeout(tick, 24 + Math.random() * 40)
  }
  timer = setTimeout(tick, 800)
  onUnmounted(() => clearTimeout(timer))
})

function tokenClass(line: string): string {
  if (line.trimStart().startsWith('//')) return 'text-[#6a708a]'
  if (/^(const|let|return)/.test(line.trimStart())) return 'text-[#c792ea]'
  if (line.includes(':')) return 'text-[#e8e8ef]'
  return 'text-[#f0b350]'
}
</script>

<template>
  <section class="relative mb-16 grid min-h-[540px] items-center gap-12 py-16 lg:grid-cols-[1.1fr_1fr] max-[840px]:min-h-0 max-[840px]:py-8">
    <!-- 左：标语 -->
    <div v-reveal>
      <span class="inline-flex items-center gap-2 rounded-full border border-(--surface-border) bg-(--surface-weak) px-4 py-1.5 text-[13px] font-semibold text-(--accent)">
        <span class="size-1.5 animate-pulse rounded-full bg-(--accent)" />
        全栈 · AI · 终身学习
      </span>

      <h1 class="mt-6 flex items-center gap-4 font-(family-name:--font-display) text-[64px] leading-[1.05] font-extrabold tracking-[-2px] max-lg:text-[44px] max-sm:text-[36px] max-sm:tracking-[-1px]">
        <span
          class="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-(--accent) to-(--accent-strong) font-mono text-2xl text-[#141414] shadow-(--shadow-accent) max-sm:size-11 max-sm:text-xl"
        >&lt;/&gt;</span>
        <span class="bg-gradient-to-r from-(--accent) via-(--accent-strong) to-(--accent) bg-clip-text text-transparent">CodeTrail</span>
      </h1>

      <p class="mt-5 flex min-h-[1.6em] items-center font-(family-name:--font-display) text-[26px] font-bold text-(--text-primary) max-sm:text-xl">
        {{ typed }}<span class="type-cursor" />
      </p>

      <p class="mt-4 max-w-lg text-[15px] leading-relaxed text-(--text-secondary)">
        技术教程、实战项目与开发笔记，按分类沉淀成可追溯的轨迹 —— 每一步都算数。
      </p>

      <div class="mt-8 flex flex-wrap items-center gap-4">
        <a href="#articles" class="btn btn-primary">
          <span aria-hidden="true">📖</span> 开始阅读
        </a>
        <NuxtLink to="/about" class="btn btn-ghost">关于本站</NuxtLink>
      </div>
    </div>

    <!-- 右：代码窗口 -->
    <div v-reveal="{ delay: 150 }" class="code-window max-lg:max-w-xl">
      <div class="code-window-head">
        <span class="code-dot bg-[#ff5f57]" />
        <span class="code-dot bg-[#febc2e]" />
        <span class="code-dot bg-[#28c840]" />
        <span class="ml-2">developer.js</span>
      </div>
      <div class="min-h-[240px] p-5 text-[13.5px] leading-[1.8]">
        <div
          v-for="(line, i) in doneLines"
          :key="i"
          :class="tokenClass(line)"
          class="whitespace-pre"
        >{{ line || ' ' }}</div>
        <div v-if="currentLine" :class="tokenClass(currentLine)" class="whitespace-pre">
          {{ currentLine }}<span class="type-cursor" />
        </div>
        <div v-else-if="doneLines.length >= codeLines.length" class="text-(--accent)">
          <span class="type-cursor" />
        </div>
      </div>
    </div>
  </section>
</template>
