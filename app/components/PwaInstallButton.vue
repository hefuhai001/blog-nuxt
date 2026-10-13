<!--
  PwaInstallButton.vue - PWA 安装应用悬浮按钮
  用途：浏览器触发 beforeinstallprompt（应用可安装）时，在右下角显示悬浮按钮引导用户安装
  使用位置：app.vue
  输入参数：无（读取 @vite-pwa/nuxt 注入的 $pwa 状态）
  输出：右下角悬浮安装按钮
-->
<script setup lang="ts">
import { Download, X } from '@lucide/vue'

const pwa = usePWA()

/**
 * 仅在「可安装且尚未安装」时显示。
 * SSR 阶段 $pwa 不存在 → 恒为 false；客户端初始也为 false（等 beforeinstallprompt），
 * 因此不会产生 hydration 不一致。
 */
const visible = computed(() => Boolean(pwa?.showInstallPrompt) && !pwa?.isPWAInstalled)

/** 触发浏览器原生安装弹窗（调用后 showInstallPrompt 会被插件置为 false） */
async function install() {
  await pwa?.install()
}

/** 用户选择「暂不安装」：本次及后续都不再提示（写入 localStorage） */
function dismiss() {
  pwa?.cancelInstall()
}
</script>

<template>
  <Transition name="pwa-fab">
    <div v-if="visible" class="pwa-fab">
      <button
        type="button"
        class="pwa-fab__main"
        :aria-label="'安装应用'"
        @click="install"
      >
        <Download class="pwa-fab__icon" aria-hidden="true" />
        <span class="pwa-fab__label">安装应用</span>
      </button>
      <button
        type="button"
        class="pwa-fab__close"
        aria-label="暂不安装"
        @click="dismiss"
      >
        <X class="size-3.5" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border: 1px solid var(--surface-border);
  border-radius: 999px;
  background: var(--surface-strong);
  box-shadow: var(--shadow-card-lg);
}

.pwa-fab__main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  box-shadow: var(--shadow-accent);
  color: #141414;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pwa-fab__main:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px -6px var(--accent-glow);
}

.pwa-fab__main:active {
  transform: scale(0.96);
}

.pwa-fab__icon {
  width: 17px;
  height: 17px;
  animation: pwa-fab-bounce 2.4s ease-in-out infinite;
}

.pwa-fab__label {
  white-space: nowrap;
}

.pwa-fab__close {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.pwa-fab__close:hover {
  background: var(--surface-weak);
  color: var(--text-primary);
}

/* 小屏只保留图标，避免遮挡内容 */
@media (max-width: 480px) {
  .pwa-fab__label {
    display: none;
  }

  .pwa-fab__main {
    padding: 9px 12px;
  }
}

@keyframes pwa-fab-bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-2px);
  }
}

.pwa-fab-enter-active,
.pwa-fab-leave-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.pwa-fab-enter-from,
.pwa-fab-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.9);
}
</style>
