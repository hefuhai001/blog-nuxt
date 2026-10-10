import type { Component } from 'vue'
import {
  Bot, BookOpen, Boxes, Braces, Code2, CodeXml, Cpu, FileText,
  GitBranch, GraduationCap, Image, Layers, MessageSquare, Palette,
  Search, Send, Sparkles, Wrench, Zap,
} from '@lucide/vue'

/** 我制作的网站 / 项目 */
export interface MySite {
  name: string
  desc: string
  /** 站点地址；以 / 开头表示站内页面，会使用 NuxtLink 打开 */
  url: string
  /** 源码仓库（Gitee / GitHub）地址，可选 */
  repo?: string
  icon: Component
  tags: string[]
}

/** 我推荐的网站 */
export interface RecommendSite {
  name: string
  desc: string
  url: string
  icon: Component
}

export interface RecommendGroup {
  category: string
  icon: Component
  sites: RecommendSite[]
}

/** 你的代码托管主页，集中修改这里即可 */
const GITEE = 'https://gitee.com/hefuhai001'

/*
 * 「我制作的网站」——示例数据，请替换为你的真实站点与仓库地址。
 * url 以 / 开头将作为站内链接（NuxtLink）打开，否则作为外链在新标签页打开。
 */
export const mySites: MySite[] = [
  {
    name: 'CodeTrail · 代码轨迹',
    desc: '本站——记录 Django、Docker、数据库与日常踩坑的个人技术博客。',
    url: '/',
    repo: `${GITEE}/blog-nuxt`,
    icon: CodeXml,
    tags: ['Nuxt 4', 'Nuxt Content', 'Tailwind v4'],
  },
  {
    name: 'H5 小游戏合集',
    desc: '打地鼠、扫雷、俄罗斯方块等纯前端小游戏的在线试玩与源码。',
    url: 'https://hefuhai001.gitee.io/h5-games',
    repo: `${GITEE}/h5-games`,
    icon: Sparkles,
    tags: ['Vue 3', 'Canvas', 'Vite'],
  },
  {
    name: '开发工具速查手册',
    desc: '常用命令行、配置片段与脚手架模板的在线速查。',
    url: '/blog?category=other',
    repo: `${GITEE}/dev-cheatsheet`,
    icon: Wrench,
    tags: ['Nuxt Content', 'Markdown'],
  },
]

/*
 * 「我推荐的网站」——按主题分组，可直接增删分组或条目。
 */
export const recommendGroups: RecommendGroup[] = [
  {
    category: '开发协作',
    icon: Code2,
    sites: [
      { name: 'GitHub', desc: '全球最大的代码托管与开源协作社区', url: 'https://github.com', icon: GitBranch },
      { name: 'Gitee 码云', desc: '国内代码托管平台，访问速度友好', url: 'https://gitee.com', icon: GitBranch },
      { name: 'Stack Overflow', desc: '编程问答社区，疑难杂症的终点站', url: 'https://stackoverflow.com', icon: MessageSquare },
      { name: 'npm', desc: 'JavaScript 包管理与依赖生态', url: 'https://www.npmjs.com', icon: Boxes },
    ],
  },
  {
    category: '学习文档',
    icon: GraduationCap,
    sites: [
      { name: 'MDN Web Docs', desc: 'Web 技术权威文档，前端必备', url: 'https://developer.mozilla.org', icon: BookOpen },
      { name: 'Vue.js', desc: '渐进式 JavaScript 框架官方文档', url: 'https://cn.vuejs.org', icon: Layers },
      { name: 'Nuxt', desc: '基于 Vue 的全栈应用框架', url: 'https://nuxt.com', icon: Zap },
      { name: 'DevDocs', desc: '聚合多种 API 文档，支持快速检索', url: 'https://devdocs.io', icon: FileText },
    ],
  },
  {
    category: '效率工具',
    icon: Wrench,
    sites: [
      { name: 'Can I use', desc: '查询浏览器特性兼容性支持情况', url: 'https://caniuse.com', icon: Search },
      { name: 'Regex101', desc: '正则表达式在线调试与解释', url: 'https://regex101.com', icon: Braces },
      { name: 'Carbon', desc: '把代码片段生成精美分享图片', url: 'https://carbon.now.sh', icon: Image },
      { name: 'Excalidraw', desc: '手绘风格的在线白板与流程图', url: 'https://excalidraw.com', icon: Palette },
    ],
  },
  {
    category: 'AI 助手',
    icon: Bot,
    sites: [
      { name: 'ChatGPT', desc: 'OpenAI 对话助手，通用能力强', url: 'https://chat.openai.com', icon: Sparkles },
      { name: 'Claude', desc: 'Anthropic 对话助手，擅长长文与代码', url: 'https://claude.ai', icon: Bot },
      { name: 'DeepSeek', desc: '国产大模型，代码与推理表现优秀', url: 'https://chat.deepseek.com', icon: Cpu },
      { name: '豆包', desc: '字节跳动 AI 助手，中文场景友好', url: 'https://www.doubao.com', icon: Send },
    ],
  },
]