<!--
  PwaInstallButton.vue - PWA 安装应用悬浮按钮
  用途：右下角悬浮按钮引导用户安装本站为应用。
        · Android / 桌面 Chromium：走浏览器原生 beforeinstallprompt，点击直接弹安装框
        · iOS Safari：不支持 beforeinstallprompt，点击改为弹出「添加到主屏幕」图文引导
  使用位置：app.vue
  输入参数：无（原生路径读取 @vite-pwa/nuxt 注入的 $pwa 状态）
  输出：右下角悬浮按钮（+ iOS 引导卡片）
-->
<script setup lang="ts">
import { Download, SquareArrowUp, SquarePlus, X } from '@lucide/vue'

/** iOS 引导「已读」标记：用户点过 × 后不再打扰 */
const IOS_HINT_KEY = 'pwa-ios-hint-dismissed'

/** iOS 上非 Safari 的浏览器 / 应用内嵌 WebView，无法「添加到主屏幕」 */
const NON_SAFARI_UA = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|MicroMessenger|QQ\/|Weibo|Alipay|DingTalk|Baidu|UCBrowser|Quark/i

const pwa = usePWA()

const showIosSheet = ref(false)
/** 是否为 iOS Safari 且尚未安装（客户端 mount 后判定，避免 SSR/首帧不一致） */
const iosInstallable = ref(false)

/** 原生安装路径：浏览器已触发 beforeinstallprompt 且未安装 */
const nativeInstallable = computed(
  () => Boolean(pwa?.showInstallPrompt) && !pwa?.isPWAInstalled,
)

const visible = computed(() => nativeInstallable.value || iosInstallable.value)

function detectIosSafari(): boolean {
  const ua = navigator.userAgent
  // iPadOS 13+ 默认伪装成 macOS，用触点数区分
  const isIpadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  const isIos = /iPad|iPhone|iPod/.test(ua) || isIpadOs
  return isIos && /Safari/.test(ua) && !NON_SAFARI_UA.test(ua)
}

onMounted(() => {
  if (pwa?.isPWAInstalled) return
  if (!detectIosSafari()) return
  if (localStorage.getItem(IOS_HINT_KEY) === 'true') return
  iosInstallable.value = true
})

/** 点击主按钮：能原生安装就直接装，否则（iOS）展开引导卡片 */
async function onInstall() {
  if (nativeInstallable.value) {
    await pwa?.install()
    return
  }
  showIosSheet.value = true
}

/** 永久不再显示此按钮 */
function dismiss() {
  showIosSheet.value = false
  if (iosInstallable.value) {
    localStorage.setItem(IOS_HINT_KEY, 'true')
    iosInstallable.value = false
    return
  }
  pwa?.cancelInstall()
}
</script>

<template>
  <Transition name="pwa-fab">
    <div
      v-if="visible"
      class="pwa-root"
      :style="{ zIndex: showIosSheet ? 110 : 90 }"
    >
      <!-- iOS「添加到主屏幕」引导卡片 -->
      <Transition name="pwa-sheet">
        <div v-if="showIosSheet" class="pwa-sheet" role="dialog" aria-label="添加到主屏幕指引">
          <p class="pwa-sheet__title">安装到主屏幕</p>
          <ol class="pwa-sheet__steps">
            <li>
              点按 Safari 底部的
              <SquareArrowUp class="pwa-sheet__inline" aria-hidden="true" />「分享」按钮
            </li>
            <li>
              在菜单中选择
              <SquarePlus class="pwa-sheet__inline" aria-hidden="true" />「添加到主屏幕」
            </li>
            <li>点右上角「添加」即可完成安装</li>
          </ol>
          <button type="button" class="pwa-sheet__ok" @click="showIosSheet = false">
            知道了
          </button>
          <span class="pwa-sheet__arrow" aria-hidden="true" />
        </div>
      </Transition>

      <div class="pwa-fab">
        <button type="button" class="pwa-fab__main" aria-label="安装应用" @click="onInstall">
          <Download class="pwa-fab__icon" aria-hidden="true" />
          <span class="pwa-fab__label">安装应用</span>
        </button>
        <button type="button" class="pwa-fab__close" aria-label="暂不安装" @click="dismiss">
          <X class="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-root {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.pwa-fab {
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

/* ============ iOS 引导卡片 ============ */
.pwa-sheet {
  position: relative;
  width: min(88vw, 300px);
  padding: 14px 16px 12px;
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  background: var(--surface-strong);
  box-shadow: var(--shadow-card-lg);
  color: var(--text-primary);
}

.pwa-sheet__title {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: 14.5px;
  font-weight: 700;
}

.pwa-sheet__steps {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--text-secondary);
}

.pwa-sheet__inline {
  width: 15px;
  height: 15px;
  margin: 0 1px;
  vertical-align: -3px;
  color: var(--accent);
}

.pwa-sheet__ok {
  display: block;
  width: 100%;
  margin-top: 12px;
  padding: 7px 0;
  border: none;
  border-radius: 999px;
  background: var(--surface-weak);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.pwa-sheet__ok:hover {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

/* 指向下方悬浮按钮的小箭头 */
.pwa-sheet__arrow {
  position: absolute;
  right: 34px;
  bottom: -6px;
  width: 11px;
  height: 11px;
  transform: rotate(45deg);
  border-right: 1px solid var(--surface-border);
  border-bottom: 1px solid var(--surface-border);
  background: var(--surface-strong);
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

.pwa-sheet-enter-active,
.pwa-sheet-leave-active {
  transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.pwa-sheet-enter-from,
.pwa-sheet-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
