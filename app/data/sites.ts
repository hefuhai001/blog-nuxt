import type { Component } from 'vue'
import {
  Bot, BookOpen, Boxes, Braces, Code2, CodeXml, Cpu, FileText,
  GitBranch, Globe, GraduationCap, Image, Layers, MessageSquare, Palette,
  Search, Send, Sparkles, Wrench, Zap,
} from '@lucide/vue'

/**
 * 站点导航数据结构定义与图标解析。
 *
 * 实际的站点数据存于本地 MySQL（db_blog_nuxt 的 nav_sites / nav_groups / nav_links 表），
 * 由服务端接口 /api/sites 读取后返回；此文件只保留类型与图标映射。
 */

/** 我制作的网站 / 项目 */
export interface MySite {
  name: string
  desc: string
  /** 站点地址；以 / 开头表示站内页面，会使用 NuxtLink 打开 */
  url: string
  /** 源码仓库（Gitee / GitHub）地址，可选 */
  repo?: string
  /** lucide 图标名，需在 siteIconMap 中登记，如 'CodeXml' */
  icon: string
  tags: string[]
}

/** 我推荐的网站 */
export interface RecommendSite {
  name: string
  desc: string
  url: string
  /** lucide 图标名，需在 siteIconMap 中登记 */
  icon: string
}

export interface RecommendGroup {
  category: string
  /** lucide 图标名，需在 siteIconMap 中登记 */
  icon: string
  sites: RecommendSite[]
}

/** /api/sites 返回的数据结构，与 data/sites.json 一致 */
export interface SitesData {
  mySites: MySite[]
  recommendGroups: RecommendGroup[]
}

/**
 * 图标名 → lucide 组件。
 * 在 data/sites.json 里想用新的图标时，先在此处 import 并登记。
 */
export const siteIconMap: Record<string, Component> = {
  Bot, BookOpen, Boxes, Braces, Code2, CodeXml, Cpu, FileText,
  GitBranch, Globe, GraduationCap, Image, Layers, MessageSquare, Palette,
  Search, Send, Sparkles, Wrench, Zap,
}

/** 解析图标名，未登记时回退到 Globe */
export function resolveSiteIcon(name?: string): Component {
  return (name && siteIconMap[name]) || Globe
}
