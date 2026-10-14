<script setup lang="ts">
/**
 * 文章正文增强：代码块复制按钮 + 语言徽章 + 图片 Lightbox。
 * 包裹 ContentRenderer，渲染完成后对 pre / img 做增强。
 */
const wrapper = ref<HTMLElement | null>(null)

const COPY_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
const CHECK_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'

function langOf(code: HTMLElement): string {
  const match = (code.className || '').match(/language-([\w+-]+)/)
  return match?.[1]?.toLowerCase() ?? ''
}

function attachCopyButton(pre: HTMLPreElement) {
  const code = pre.querySelector('code')
  const lang = code ? langOf(code) : ''
  if (lang) {
    const badge = document.createElement('span')
    badge.className = 'prose-lang'
    badge.textContent = lang
    pre.appendChild(badge)
  }
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'prose-copy-btn'
  btn.setAttribute('aria-label', '复制代码')
  btn.innerHTML = COPY_ICON
  btn.addEventListener('click', async (e) => {
    e.stopPropagation()
    const text = code?.innerText ?? pre.innerText
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // clipboard 不可用时降级
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    btn.classList.add('copied')
    btn.innerHTML = CHECK_ICON
    setTimeout(() => {
      btn.classList.remove('copied')
      btn.innerHTML = COPY_ICON
    }, 1500)
  })
  pre.appendChild(btn)
}

/* ---------------- Lightbox ---------------- */
const lightboxIndex = ref(0)
const lightboxImages = ref<HTMLImageElement[]>([])

function openLightbox(img: HTMLImageElement) {
  const images = [...document.querySelectorAll<HTMLImageElement>('.markdown-content img')]
  lightboxImages.value = images
  lightboxIndex.value = images.indexOf(img)
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  document.body.style.overflow = ''
  lightboxImages.value = []
}

function step(dir: number) {
  const n = lightboxImages.value.length
  if (!n) return
  lightboxIndex.value = (lightboxIndex.value + dir + n) % n
}

function onKeydown(e: KeyboardEvent) {
  if (!lightboxImages.value.length) return
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === 'ArrowLeft') step(-1)
  else if (e.key === 'ArrowRight') step(1)
}

/* ---------------- 增强流程 ---------------- */
function enhance() {
  const root = wrapper.value
  if (!root) return
  root.querySelectorAll<HTMLPreElement>('pre').forEach((pre) => {
    if (pre.dataset.enhanced) return
    pre.dataset.enhanced = 'true'
    attachCopyButton(pre)
  })
  root.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    if (img.dataset.enhanced) return
    img.dataset.enhanced = 'true'
    img.classList.add('prose-img')
    img.addEventListener('click', () => openLightbox(img))
  })
}

const route = useRoute()
onMounted(() => {
  nextTick(enhance)
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  closeLightbox()
})
watch(() => route.fullPath, () => nextTick(enhance))
</script>

<template>
  <div ref="wrapper">
    <slot />
  </div>

  <Teleport to="body">
    <div
      v-if="lightboxImages.length"
      class="lightbox"
      role="dialog"
      aria-modal="true"
      @click.self="closeLightbox"
    >
      <button class="lightbox-close" aria-label="关闭" @click="closeLightbox">✕</button>
      <button
        v-if="lightboxImages.length > 1"
        class="lightbox-prev"
        aria-label="上一张"
        @click="step(-1)"
      >‹</button>
      <img
        :src="lightboxImages[lightboxIndex]?.src"
        :alt="lightboxImages[lightboxIndex]?.alt"
        class="lightbox-img"
        @click.self="closeLightbox"
      >
      <button
        v-if="lightboxImages.length > 1"
        class="lightbox-next"
        aria-label="下一张"
        @click="step(1)"
      >›</button>
      <div class="lightbox-counter">{{ lightboxIndex + 1 }} / {{ lightboxImages.length }}</div>
    </div>
  </Teleport>
</template>

<style scoped>
.prose-img {
  cursor: zoom-in;
  transition: opacity 0.2s ease;
}
</style>

<style>
/* 代码块复制按钮 & 语言徽章（在 markdown 容器内） */
.prose-pre {
  position: relative;
}

.prose-copy-btn {
  position: absolute;
  top: 10px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.prose-pre:hover .prose-copy-btn,
.prose-copy-btn:focus-visible {
  opacity: 1;
}

.prose-copy-btn:hover {
  background: var(--glass-bg-strong);
  color: var(--text-primary);
}

.prose-copy-btn.copied {
  color: var(--ios-green);
  opacity: 1;
}

.prose-lang {
  position: absolute;
  top: 12px;
  left: 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  user-select: none;
  pointer-events: none;
}

/* 代码块 padding 预留按钮/徽章空间 */
.markdown-content pre {
  padding-top: 20px;
}

/* Lightbox 覆盖层 */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(10px);
  animation: lightbox-fade 0.2s ease;
}

@keyframes lightbox-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.lightbox-img {
  max-width: 88vw;
  max-height: 86vh;
  border-radius: 12px;
  box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.8);
  object-fit: contain;
  animation: lightbox-zoom 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes lightbox-zoom {
  from { transform: scale(0.92); opacity: 0.4; }
  to { transform: scale(1); opacity: 1; }
}

.lightbox-close,
.lightbox-prev,
.lightbox-next {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.lightbox-close { top: 20px; right: 20px; }
.lightbox-prev { left: 20px; }
.lightbox-next { right: 20px; }

.lightbox-close:hover,
.lightbox-prev:hover,
.lightbox-next:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.06);
}

.lightbox-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
}
</style>
