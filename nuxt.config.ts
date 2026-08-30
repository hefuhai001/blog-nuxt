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
    preference: 'dark',
    fallback: 'dark',
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
      name: 'CodeTrail · 代码轨迹',
      short_name: 'CodeTrail',
      description: '后端开发与工程实践技术博客，记录 Django、Docker、数据库与日常踩坑的代码轨迹',
      lang: 'zh-CN',
      display: 'standalone',
      start_url: '/',
      theme_color: '#0a0a0d',
      background_color: '#0a0a0d',
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
      title: 'CodeTrail · 代码轨迹',
      titleTemplate: '%s · CodeTrail 代码轨迹',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
      ],
      meta: [
        { name: 'charset', content: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '后端开发与工程实践技术博客，记录 Django、Docker、数据库与日常踩坑的代码轨迹' },
        { name: 'theme-color', content: '#0a0a0d' },
        { property: 'og:site_name', content: 'CodeTrail · 代码轨迹' },
        { property: 'og:locale', content: 'zh_CN' },
        { name: 'twitter:card', content: 'summary' },
      ],
    },
  },
})
