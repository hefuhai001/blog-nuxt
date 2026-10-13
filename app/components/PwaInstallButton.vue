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
      class="fixed right-5 bottom-5 flex flex-col items-end gap-3"
      :style="{ zIndex: showIosSheet ? 110 : 90 }"
    >
      <!-- iOS「添加到主屏幕」引导卡片 -->
      <Transition name="pwa-sheet">
        <div
          v-if="showIosSheet"
          class="relative w-[min(88vw,300px)] rounded-2xl border border-line bg-surface-strong px-4 pt-3.5 pb-3 text-content shadow-[var(--shadow-card-lg)]"
          role="dialog"
          aria-label="添加到主屏幕指引"
        >
          <p class="mt-0 mb-2 font-display text-[14.5px] font-bold">安装到主屏幕</p>
          <ol class="m-0 pl-[18px] text-[13px] leading-[1.75] text-content-2">
            <li>
              点按 Safari 底部的
              <SquareArrowUp class="mx-px inline size-[15px] align-[-3px] text-accent" aria-hidden="true" />「分享」按钮
            </li>
            <li>
              在菜单中选择
              <SquarePlus class="mx-px inline size-[15px] align-[-3px] text-accent" aria-hidden="true" />「添加到主屏幕」
            </li>
            <li>点右上角「添加」即可完成安装</li>
          </ol>
          <button
            type="button"
            class="mt-3 block w-full cursor-pointer rounded-full bg-surface-weak py-[7px] text-[13px] font-semibold text-content transition-colors duration-200 hover:bg-accent-soft hover:text-accent-strong"
            @click="showIosSheet = false"
          >
            知道了
          </button>
          <!-- 指向下方悬浮按钮的小箭头 -->
          <span
            class="absolute -bottom-1.5 right-[34px] size-[11px] rotate-45 border-r border-b border-line bg-surface-strong"
            aria-hidden="true"
          />
        </div>
      </Transition>

      <div class="flex items-center gap-0.5 rounded-full border border-line bg-surface-strong p-1 shadow-[var(--shadow-card-lg)]">
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-br from-accent to-accent-strong px-4 py-[9px] font-display text-sm leading-none font-bold text-[#141414] shadow-[var(--shadow-accent)] transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[0_10px_24px_-6px_var(--accent-glow)] active:scale-95 max-[480px]:px-3"
          aria-label="安装应用"
          @click="onInstall"
        >
          <Download class="size-[17px] animate-[pwa-fab-bounce_2.4s_ease-in-out_infinite]" aria-hidden="true" />
          <span class="whitespace-nowrap max-[480px]:hidden">安装应用</span>
        </button>
        <button
          type="button"
          class="grid size-[26px] cursor-pointer place-items-center rounded-full bg-transparent text-content-2 transition-colors duration-200 hover:bg-surface-weak hover:text-content"
          aria-label="暂不安装"
          @click="dismiss"
        >
          <X class="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<!-- 仅保留 Tailwind 无法表达的部分：关键帧动画与 Vue <Transition> 过渡类 -->
<style>
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
