# CodeTrail · 代码轨迹

一个基于 **Nuxt 4 + Nuxt Content** 构建的暗黑科技风个人技术博客，记录后端开发与工程实践中的真实经验——Django、Docker、数据库与日常踩坑，把每一次调试的弯路变成可复用的轨迹。

## ✨ 特性

- **🎨 暗黑金色设计系统**：CodeTrail 自定义主题，实色表面 + 金色强调 + 透视网格背景，支持亮/暗主题切换（默认暗黑）
- **📝 Markdown 驱动**：文章基于 Nuxt Content 3，按目录自动分类，支持代码高亮（Shiki）
- **🖥️ Hero 代码窗口**：首页打字机动画 + 逐字符渲染的 mac 风代码窗口
- **🗂️ 三栏博客列表**：分类导航 + 文章卡片流 + 热门文章榜（mars-coder 风格），分类通过 `?category=xxx` 本页筛选
- **🔍 全文搜索**：命令面板式搜索弹窗（`⌘K` 唤起）
- **📊 文章统计**：浏览计数与点赞（localStorage 本机实现，可扩展为服务端）
- **💬 Giscus 评论**：基于 GitHub Discussions，在 `nuxt.config.ts` 配置即可启用
- **📱 PWA**：可安装、离线回退，SVG 图标适配 maskable
- **♿ 无障碍**：滚动渐入动效遵循 `prefers-reduced-motion`，全站 Lucide 线性图标

## 🛠️ 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Nuxt 4 / Vue 3 / TypeScript |
| 样式 | Tailwind CSS v4（`@theme inline` 设计令牌） |
| 内容 | Nuxt Content 3（Markdown + Shiki） |
| 图标 | Lucide（`@lucide/vue`） |
| 评论 | Giscus |
| PWA | @vite-pwa/nuxt（Workbox） |

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器 http://localhost:3000
pnpm dev

# 类型检查
pnpm typecheck

# 生产构建 + 预览
pnpm build
pnpm preview
```

## 📁 目录结构

```
├── app/
│   ├── assets/css/main.css      # 设计令牌 + 组件样式（Tailwind v4）
│   ├── components/              # HeroSection、SearchModal、ArticleStats 等
│   ├── composables/blog.ts      # 文章工具函数（分类/标题/摘要/阅读时长）
│   ├── layouts/default.vue      # 通用布局：通栏导航 + 移动端汉堡菜单
│   ├── pages/
│   │   ├── index.vue            # 首页：Hero + 推荐文章
│   │   ├── blog/index.vue       # 博客列表：三栏布局，?category= 本页筛选
│   │   ├── blog/[...slug].vue   # 文章详情：TOC、统计、评论
│   │   └── about.vue            # 关于本站
│   └── plugins/reveal.ts        # v-reveal 滚动渐入指令
├── content/
│   ├── blog/                    # 博客文章（Markdown，目录即分类）
│   └── about.md                 # 关于页内容
└── nuxt.config.ts               # PWA、站点元信息、Giscus 配置
```

## ✍️ 写文章

在 `content/blog/<分类>/<文章名>.md` 下新建 Markdown 文件即可，目录名会自动成为分类：

```markdown
---
title: 文章标题
description: 一句话简介
date: 2026-08-31
---

正文使用 Markdown 语法编写…
```

## ⚙️ 配置

部署前在 [nuxt.config.ts](nuxt.config.ts) 中设置：

```ts
runtimeConfig: {
  public: {
    siteUrl: 'https://your-domain.com', // 正式域名
    giscus: {
      repo: 'your-name/your-repo',
      repoId: '...',        // 从 giscus.app 获取
      category: 'Announcements',
      categoryId: '...',
    },
  },
}
```

## 📦 部署

支持任何能跑 Node 的平台（Vercel / Netlify / Railway / 自建服务器），或使用 NuxtHub 部署到 Cloudflare：

```bash
pnpm build   # 产出 .output 目录
```

---

© CodeTrail · 代码轨迹 · Made with ⚡ Nuxt & Tailwind
