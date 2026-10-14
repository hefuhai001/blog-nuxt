// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image', 
    '@nuxt/ui'
  ],
  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      // 让 SSR 构建把 lucide 图标组件与应用的 Vue 实例打进同一份运行时，
      // 否则外部化的 @lucide/vue 会 require 到另一份 Vue，导致 SSR 渲染时
      // inject() 取不到当前实例（图标组件报错）。
      noExternal: ['@lucide/vue'],
    },
  },
  nitro: {
    externals: {
      inline: [/^@lucide\/vue/],
    },
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  runtimeConfig: {
    // 站点导航数据文件路径；可通过挂载覆盖，或用环境变量 NUXT_SITES_FILE 指定
    sitesFile: './data/sites.json',
    // 内容数据库（本地 MySQL）；可用环境变量覆盖：
    // NUXT_DB_HOST / NUXT_DB_PORT / NUXT_DB_USER / NUXT_DB_PASSWORD / NUXT_DB_DATABASE
    db: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root@XH2001!',
      database: 'db_blog_nuxt',
    },
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
