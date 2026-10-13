<!--
  PwaPrompt.vue - PWA 版本/离线提示条
  用途：新版本 Service Worker 就绪时提示用户刷新，离线可访问时给出提示
  使用位置：app.vue
  输入参数：无（读取 @vite-pwa/nuxt 注入的 $pwa 状态）
  输出：右下角浮层提示
-->
<script setup lang="ts">
import { RefreshCw, X } from '@lucide/vue'

const pwa = usePWA()

const visible = computed(() => Boolean(pwa?.needRefresh || pwa?.offlineReady))

function reload() {
  pwa?.updateServiceWorker(true)
}
</script>

<template>
  <Transition name="pwa-toast">
    <div v-if="pwa && visible" class="pwa-toast" role="status" aria-live="polite">
      <RefreshCw class="pwa-toast__icon" :class="{ spin: pwa.needRefresh }" aria-hidden="true" />
      <p class="pwa-toast__text">
        {{ pwa.needRefresh ? '发现新版本，刷新以获取最新内容' : '本站已可离线访问' }}
      </p>
      <button v-if="pwa.needRefresh" type="button" class="pwa-toast__action" @click="reload">
        立即刷新
      </button>
      <button
        type="button"
        class="pwa-toast__close"
        aria-label="关闭提示"
        @click="pwa.cancelPrompt()"
      >
        <X class="size-4" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-toast {
  position: fixed;
  right: 20px;
  /* 抬高，给右下角的 PWA 安装悬浮按钮留出位置 */
  bottom: 84px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(92vw, 420px);
  padding: 12px 14px;
  border: 1px solid var(--surface-border);
  border-radius: 14px;
  background: var(--surface-strong);
  box-shadow: var(--shadow-card-lg);
  color: var(--text-primary);
  font-size: 14px;
}

.pwa-toast__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--accent);
}

.pwa-toast__icon.spin {
  animation: pwa-spin 1.4s linear infinite;
}

.pwa-toast__text {
  margin: 0;
  line-height: 1.4;
}

.pwa-toast__action {
  flex-shrink: 0;
  padding: 6px 12px;
  border: none;
  border-radius: 999px;
  background: var(--accent);
  color: #141414;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease;
}

.pwa-toast__action:hover {
  background: var(--accent-strong);
}

.pwa-toast__action:active {
  transform: scale(0.95);
}

.pwa-toast__close {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.pwa-toast__close:hover {
  background: var(--surface-weak);
  color: var(--text-primary);
}

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
