<!--
  app.vue - 应用根组件
  用途：全局布局入口，挂载路由与布局
  使用位置：Nuxt 自动入口
  输入参数：无
  输出：全站页面结构 + PWA 新版本刷新提示
-->
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- PWA 新版本就绪提示：新 SW 等待激活时弹出，用户确认后刷新页面切换到新版本 -->
    <PwaPrompt />
  </div>
</template>