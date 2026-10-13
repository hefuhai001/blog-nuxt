// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
  ],
  content: {
    // 开发/构建期的本地数据库统一落到 data/（不再使用 .data）
    _localDatabase: {
      type: 'sqlite',
      filename: 'data/content/contents.sqlite',
    },
    // 运行时数据库路径由容器环境变量 NUXT_CONTENT_DATABASE_FILENAME 指定为
    // /app/data/content/contents.sqlite（见 Dockerfile）。默认的相对路径会被解析到
    // 只读的 .output 目录，导致 SQLITE_CANTOPEN。
    // 如需在非容器环境运行构建产物，请设置同名环境变量为可写的绝对路径。
  },
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
    // 站点导航数据文件路径；可通过挂载覆盖，或用环境变量 NUXT_SITES_FILE 指定
    sitesFile: './data/sites.json',
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
    // 'prompt' 模式：新版本 SW 安装完成后进入等待状态，
    // 旧 SW + 旧缓存保持一致，用户确认刷新后才切换，
    // 避免旧 HTML 引用已失效的 hash 资源导致出现无样式页面
    registerType: 'prompt',
    manifest: {
      name: 'CodeTrail · 代码轨迹 · IT技术学习',
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
      // 这些请求不走 SPA 回退，避免接口/静态资源被回退成 index.html
      navigateFallbackDenylist: [
        /^\/api\//,
        /^\/_nuxt\//,
        /^\/_payload/,
        /^\/@/,
        /^\/__nuxt_error/,
        /\.(xml|txt|json|webmanifest|svg|ico|png|jpg|jpeg|webp|woff2?)$/,
      ],
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
