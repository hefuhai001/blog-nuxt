<!--
  PwaPrompt.vue - PWA 版本 / 离线提示条
  用途：新版本 Service Worker 就绪时提示刷新；离线可访问时给出提示
  使用位置：app.vue
  输入参数：无（读取 @vite-pwa/nuxt 注入的 $pwa 状态）
  输出：右下角提示条
  说明：安装按钮由 PwaInstallButton.vue 负责，本组件只处理版本/离线提示
-->
<script setup lang="ts">
import { RefreshCw, X } from '@lucide/vue'

const pwa = usePWA()

const showUpdate = computed(() => Boolean(pwa?.needRefresh || pwa?.offlineReady))

function reload() {
  pwa?.updateServiceWorker(true)
}
</script>

<template>
  <Transition name="pwa-toast">
    <div
      v-if="pwa && showUpdate"
      class="fixed right-5 bottom-[84px] z-100 flex max-w-[min(92vw,420px)] items-center gap-2.5 rounded-[14px] border border-line bg-surface-strong px-3.5 py-3 text-sm text-content shadow-[var(--shadow-card-lg)]"
      role="status"
      aria-live="polite"
    >
      <RefreshCw
        class="size-[18px] shrink-0 text-accent"
        :class="{ 'animate-[pwa-spin_1.4s_linear_infinite]': pwa.needRefresh }"
        aria-hidden="true"
      />
      <p class="m-0 leading-snug">
        {{ pwa.needRefresh ? '发现新版本，刷新以获取最新内容' : '本站已可离线访问' }}
      </p>
      <button
        v-if="pwa.needRefresh"
        type="button"
        class="shrink-0 cursor-pointer rounded-full bg-accent px-3 py-1.5 text-[13px] font-semibold text-[#141414] transition-[background-color,transform] duration-200 hover:bg-accent-strong active:scale-95"
        @click="reload"
      >
        立即刷新
      </button>
      <button
        type="button"
        class="grid size-[26px] shrink-0 cursor-pointer place-items-center rounded-lg bg-transparent text-content-2 transition-colors duration-200 hover:bg-surface-weak hover:text-content"
        aria-label="关闭提示"
        @click="pwa.cancelPrompt()"
      >
        <X class="size-4" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>

<!-- 仅保留 Tailwind 无法表达的部分：关键帧动画与 Vue <Transition> 过渡类 -->
<style>
@keyframes pwa-spin {
  to {
    transform: rotate(360deg);
  }
}

.pwa-toast-enter-active,
.pwa-toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.pwa-toast-enter-from,
.pwa-toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
