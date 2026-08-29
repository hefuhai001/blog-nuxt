# 📝 使用 VitePress 打造专属技术博客：从零到部署完整指南

### 1. 项目初始化

```bash
# 创建项目目录
mkdir my-blog && cd my-blog

# 初始化 package.json
npm init -y

# 安装 VitePress（当前使用 alpha 版本）
npm install -D vitepress@alpha

# 创建基础目录结构
mkdir docs && echo '# Hello VitePress' > docs/index.md
```

### 2. 基础配置

创建 `docs/.vitepress/config.js`：

```javascript
import { defineConfig } from "vitepress";

export default defineConfig({
  // 站点标题
  title: "你的技术博客",
  description: "分享技术心得，记录成长历程",
  lang: "zh-CN",
  lastUpdated: true, // 显示最后更新时间
  
  themeConfig: {
    // 网站标题（导航栏左侧）
    siteTitle: "你的技术博客",
    
    // 导航栏配置
    nav: [
      { text: "首页", link: "/" },
      { text: "文章", link: "/articles/" },
      { text: "归档", link: "/archive/" },
      { text: "关于", link: "/about/" }
    ],
    
    // 侧边栏配置
    sidebar: {
      '/articles/': [
        {
          text: '前端',
          collapsed: true,
          items: [
            { text: 'Vue3 新特性', link: '/articles/vue3-features' },
            { text: 'React Hooks 实战', link: '/articles/react-hooks' }
          ]
        },
        {
          text: '后端',
          collapsed: true,
          items: [
            { text: 'Spring Boot 入门', link: '/articles/spring-boot' },
            { text: '数据库优化', link: '/articles/database-optimization' }
          ]
        }
      ]
    },
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername' },
      { icon: 'twitter', link: 'https://twitter.com/yourusername' }
    ],
    
    // 搜索功能
    search: {
      provider: 'local'
    },
    
    // 页脚配置
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Your Name'
    }
  }
});
```

### 3. 主题定制

创建 `docs/.vitepress/theme/index.js`：

```javascript
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  ...DefaultTheme,
  // 可以在这里注册全局组件
  enhanceApp({ app }) {
    // app.component('MyGlobalComponent' /* ... */)
  }
}
```

创建 `docs/.vitepress/theme/custom.css`：

```css
/* 品牌色定制 */
:root {
  /* 品牌色 */
  --vp-c-brand-1: #3d8ed4;
  --vp-c-brand-2: #1e6db3;
  --vp-c-brand-3: #0a589c;
  
  /* 背景色 */
  --vp-c-bg: #ffffff;
  --vp-c-bg-alt: #f6f8fa;
  --vp-c-bg-elv: #ffffff;
  
  /* 文字色 */
  --vp-c-text-1: #213547;
  --vp-c-text-2: #5c6a77;
  --vp-c-text-3: #8b949e;
  
  /* 边框色 */
  --vp-c-divider: #e2e8f0;
  --vp-c-gutter: #e2e8f0;
}

/* 深色模式 */
.dark {
  --vp-c-brand-1: #4392d7;
  --vp-c-brand-2: #176cb7;
  --vp-c-brand-3: #0a589c;
  
  --vp-c-bg: #0f172a;
  --vp-c-bg-alt: #1e293b;
  --vp-c-bg-elv: #1e293b;
  
  --vp-c-text-1: #f1f5f9;
  --vp-c-text-2: #cbd5e1;
  --vp-c-text-3: #94a3b8;
  
  --vp-c-divider: #334155;
  --vp-c-gutter: #334155;
}

/* 自定义样式 */
.vp-doc h1 {
  border-bottom: 2px solid var(--vp-c-divider);
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
}

/* 代码块美化 */
.vp-doc div[class*='language-'] {
  border-radius: 8px;
}

/* 首页样式 */
.home {
  .VPHomeHero {
    .name {
      font-size: 3.5rem;
      background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-3));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
}
```

## 📝 Markdown 增强功能

VitePress 支持丰富的 Markdown 扩展：

### 代码高亮

````markdown
```javascript
// 带行号
export default {
  setup() {
    const count = ref(0)
    return { count }
  }
}
```

```bash{1,3-4}
# 特定行高亮
npm install -D vitepress
npm run docs:dev
```
````

### 数学公式支持

先安装数学公式插件：

```bash
npm install -D markdown-it-mathjax3
```

在配置文件中启用：

```javascript
export default defineConfig({
  markdown: {
    math: true
  }
})
```

在 Markdown 中使用：

```markdown
行内公式：$E = mc^2$

块级公式：
$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \mathbf{B} &= 0
\end{aligned}
$$
```

### Vue 组件嵌入

创建 `docs/.vitepress/components/Counter.vue`：

```vue
<template>
  <div class="counter">
    <button @click="count--">-</button>
    <span>{{ count }}</span>
    <button @click="count++">+</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<style scoped>
.counter {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}
</style>
```

在 Markdown 中使用：

```markdown
## 示例组件

<Counter />
```

## 📊 高级配置

### 1. 自动生成侧边栏

创建脚本自动生成侧边栏：

```javascript
// scripts/generateSidebar.js
const fs = require('fs')
const path = require('path')

function generateSidebar(dir, base = '') {
  const items = []
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      // 处理目录
      const children = generateSidebar(fullPath, path.join(base, file))
      if (children.length > 0) {
        items.push({
          text: file.replace(/-/g, ' '),
          collapsed: true,
          items: children
        })
      }
    } else if (file.endsWith('.md') && file !== 'index.md') {
      // 处理 Markdown 文件
      const name = path.basename(file, '.md')
      items.push({
        text: name.replace(/-/g, ' '),
        link: path.join('/', base, name)
      })
    }
  })
  
  return items
}

const sidebar = generateSidebar('docs/articles')
console.log(JSON.stringify(sidebar, null, 2))
```

### 2. 页面元数据

在 Markdown 文件顶部添加 frontmatter：

```yaml
---
title: 文章标题
date: 2024-01-01
tags:
  - Vue
  - 前端
description: 文章描述
---
```

### 3. 自定义布局

创建自定义布局组件：

```vue
<!-- docs/.vitepress/components/CustomLayout.vue -->
<template>
  <div class="custom-layout">
    <header class="header">
      <slot name="header">
        <h1>{{ frontmatter.title }}</h1>
        <div class="meta">
          <time>{{ formatDate(frontmatter.date) }}</time>
          <span class="tags">
            <span v-for="tag in frontmatter.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </span>
        </div>
      </slot>
    </header>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter } = useData()

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
```

## 🚀 部署到 GitHub Pages

### 1. 创建部署脚本

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs",
    "deploy": "npm run docs:build && gh-pages -d docs/.vitepress/dist"
  },
  "devDependencies": {
    "gh-pages": "^5.0.0",
    "vitepress": "^2.0.0-alpha.12"
  }
}
```

### 2. GitHub Actions 自动部署

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy VitePress site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build with VitePress
        run: npm run docs:build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: docs/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3
```

## 🐳 Docker 部署

### Dockerfile

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run docs:build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx 配置

```nginx
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # SPA 路由支持
        location / {
            try_files $uri $uri/ /index.html;
        }

        # 缓存优化
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # 禁止访问隐藏文件
        location ~ /\. {
            deny all;
        }
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  blog:
    build: .
    container_name: vitepress-blog
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

## 💡 实用技巧

### 1. SEO 优化

```javascript
export default defineConfig({
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3d8ed4' }],
    ['meta', { name: 'author', content: '你的名字' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    // 添加结构化数据
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "你的技术博客",
      "url": "https://yourdomain.com"
    })]
  ]
})
```

### 2. 性能优化

- 使用 `<link rel="preload">` 预加载关键资源
- 配置合适的缓存策略
- 启用 Gzip/Brotli 压缩
- 使用图片懒加载

### 3. 文章归档页面

创建 `docs/archive.md`：

```markdown
---
layout: home
---

# 📚 文章归档

<script setup>
import { data } from './articles.data.js'
</script>

<div class="archive">
  <div v-for="article in data" class="article-item">
    <h3>
      <a :href="article.url">{{ article.title }}</a>
    </h3>
    <div class="meta">
      <time>{{ article.date }}</time>
      <span class="tags">
        <span v-for="tag in article.tags" class="tag">{{ tag }}</span>
      </span>
    </div>
  </div>
</div>
```

## 🔧 常见问题解决

### 1. 构建时死链接检查

如果构建时出现死链接警告：

```javascript
export default defineConfig({
  ignoreDeadLinks: [
    /^http:\/\/localhost/,
    /^https?:\/\/localhost/
  ]
})
```

### 2. 图片路径问题

在 Markdown 中使用图片：

```markdown
<!-- 相对路径 -->
![描述](./images/example.png)

<!-- 公共路径 -->
![描述](/public/logo.png)
```

### 3. 自定义域名

在构建时指定 base URL：

```javascript
export default defineConfig({
  base: '/blog/', // 如果部署在子路径
  // 或
  base: '/', // 如果部署在根路径
})
```

## 🌟 我的博客特色配置

基于我的实际配置，这里有一些实用建议：

### 主题色定制
```css
/* 建议使用与个人品牌相符的颜色 */
:root {
  --vp-c-brand-1: #3d8ed4;  /* 主色调 - 科技蓝 */
  --vp-c-brand-2: #1e6db3;  /* 次色调 - 沉稳蓝 */
  --vp-c-brand-3: #0a589c;  /* 强调色 - 深蓝 */
}
```

### 数学公式支持
```javascript
// 安装：npm install -D markdown-it-mathjax3
export default defineConfig({
  markdown: {
    math: true
  }
})
```

### 图标配置
```javascript
head: [
  ['link', { rel: 'icon', href: '/favicon.ico' }],
  ['meta', { name: 'theme-color', content: '#3c3c3c' }]
]
```

## 📈 博客内容规划

### 文章分类建议
```
docs/
├── index.md              # 首页
├── articles/            # 文章目录
│   ├── frontend/       # 前端
│   ├── backend/        # 后端
│   ├── devops/         # 运维
│   └── tools/          # 工具
├── projects/           # 项目展示
├── about.md            # 关于我
└── archive.md          # 归档
```

### 文章模板
```markdown
---
title: 文章标题
date: 2024-01-01
description: 文章简要描述
tags: [标签1, 标签2]
---

# 标题

## 概述
文章引言...

## 主要内容

### 小节标题
内容...

## 总结
文章总结...
```

## 🎉 开始行动吧！

现在你已经掌握了使用 VitePress 搭建技术博客的所有知识。接下来：

1. **立即开始**：创建一个新目录，运行第一个命令
2. **持续写作**：技术博客的价值在于持续输出
3. **分享交流**：将你的博客分享给社区
4. **迭代优化**：根据反馈不断改进

记住，最好的博客不在于技术有多复杂，而在于内容有多真诚，分享有多热情。祝你在技术写作的道路上收获满满！🚀

---

**相关资源**：
- [VitePress 官方文档](https://vitepress.dev/)
- [Vue.js 文档](https://vuejs.org/)
- [GitHub Pages 部署指南](https://pages.github.com/)
- [更多示例项目](https://github.com/vuejs/vitepress/tree/main/examples)