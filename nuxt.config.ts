// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
  ],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  runtimeConfig: {
    public: {
      // 部署后改为你的正式域名，如 'https://blog.example.com'
      siteUrl: '',
      giscus: {
        repo: '',
        repoId: '',
        category: '',
        categoryId: '',
      },
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: '我的技术博客',
      short_name: '技术博客',
      description: '个人技术博客，分享 Django、Docker、Vue、Spring、Node.js 等开发实践与踩坑记录',
      lang: 'zh-CN',
      display: 'standalone',
      start_url: '/',
      theme_color: '#0a7cff',
      background_color: '#f2f2f7',
      icons: [
        { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        { src: '/maskable-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '我的技术博客',
      titleTemplate: '%s · 我的技术博客',
      meta: [
        { name: 'charset', content: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '个人技术博客，分享 Django、Docker、Vue、Spring、Node.js 等开发实践与踩坑记录' },
        { name: 'theme-color', content: '#0a7cff' },
        { property: 'og:site_name', content: '我的技术博客' },
        { property: 'og:locale', content: 'zh_CN' },
        { name: 'twitter:card', content: 'summary' },
      ],
    },
  },
})
