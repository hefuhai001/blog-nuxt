我来为你创建一个使用 `vite-plugin-svg-icons` 的动态 SVG 图标实例。这是一个非常实用的方案，支持自动导入、按需加载和动态切换图标。

## 完整实现

### 1. 安装依赖

```bash
npm install vite-plugin-svg-icons@2.0.1 fast-glob@3 --save-dev
# 或
yarn add vite-plugin-svg-icons@2.0.1 fast-glob@3 --dev
```

### 2. Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      // 指定symbolId格式
      symbolId: 'icon-[name]',
      // 是否压缩
      svgoOptions: true,
      // 自定义插入位置
      inject: 'body-last',
      // 自定义DOM ID
      customDomId: '__svg__icons__dom__',
    }),
  ],
})
```

### 3. 主入口文件注册

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 引入虚拟模块，注册所有图标
import 'virtual:svg-icons-register'

createApp(App).mount('#app')
```

### 4. 动态图标组件

```vue
<!-- components/SvgIcon.vue -->
<template>
  <svg
    :class="['svg-icon', spin && 'svg-icon-spin']"
    :style="iconStyle"
    aria-hidden="true"
  >
    <use :href="symbolId" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 图标名称（assets/icons 目录下的文件名，不含扩展名）
  name: string
  // 前缀
  prefix?: string
  // 颜色
  color?: string
  // 尺寸
  size?: number | string
  // 是否旋转
  spin?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  prefix: 'icon',
  color: 'currentColor',
  size: 16,
  spin: false,
})

const symbolId = computed(() => `#${props.prefix}-${props.name}`)

const iconStyle = computed(() => {
  const { size } = props
  const s = typeof size === 'number' ? `${size}px` : size
  return {
    width: s,
    height: s,
  }
})
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  overflow: hidden;
  vertical-align: -0.15em;
  fill: currentColor;
  transition: all 0.3s;
}

.svg-icon-spin {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
```

### 5. 高级动态图标组件（支持更多交互）

```vue
<!-- components/DynamicIcon.vue -->
<template>
  <div class="dynamic-icon-wrapper">
    <SvgIcon
      :name="currentIcon"
      :size="size"
      :color="currentColor"
      :spin="spin"
      @click="handleClick"
      :class="{ 'cursor-pointer': clickable }"
    />
    
    <!-- 动态切换演示 -->
    <div v-if="showControls" class="icon-controls">
      <select v-model="currentIcon" class="icon-select">
        <option v-for="icon in availableIcons" :key="icon" :value="icon">
          {{ icon }}
        </option>
      </select>
      
      <input 
        type="color" 
        v-model="currentColor" 
        class="color-picker"
        title="选择颜色"
      />
      
      <button @click="spin = !spin" :class="['btn', { active: spin }]">
        {{ spin ? '停止' : '旋转' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SvgIcon from './SvgIcon.vue'

// 自动获取所有可用图标（开发时可用，生产环境建议硬编码）
const availableIcons = ref([
  'home',
  'user', 
  'settings',
  'heart',
  'star',
  'search',
  'bell',
  'menu',
  'close',
  'check',
  'loading',
  'arrow-right',
  'edit',
  'delete',
  'download',
  'upload',
  'share',
  'lock',
  'unlock',
  'eye',
  'eye-off'
])

interface Props {
  initialIcon?: string
  size?: number | string
  color?: string
  showControls?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialIcon: 'home',
  size: 24,
  color: '#333',
  showControls: false,
  clickable: false,
})

const currentIcon = ref(props.initialIcon)
const currentColor = ref(props.color)
const spin = ref(false)

const emit = defineEmits<{
  (e: 'click', icon: string): void
  (e: 'change', icon: string): void
}>()

const handleClick = () => {
  if (props.clickable) {
    emit('click', currentIcon.value)
  }
}

// 暴露方法供父组件调用
defineExpose({
  setIcon: (name: string) => {
    currentIcon.value = name
    emit('change', name)
  },
  setColor: (color: string) => {
    currentColor.value = color
  },
  toggleSpin: () => {
    spin.value = !spin.value
  }
})
</script>

<style scoped>
.dynamic-icon-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.cursor-pointer {
  cursor: pointer;
}

.icon-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-top: 8px;
}

.icon-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.color-picker {
  width: 40px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover {
  background: #e0e0e0;
}

.btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}
</style>
```

### 6. 图标批量加载工具（可选）

```typescript
// utils/iconLoader.ts
/**
 * 动态导入图标（用于异步加载场景）
 */
export const loadIcon = async (name: string): Promise<string> => {
  try {
    // 动态导入单个图标
    const module = await import(`@/assets/icons/${name}.svg?raw`)
    return module.default
  } catch (error) {
    console.error(`Failed to load icon: ${name}`, error)
    return ''
  }
}

/**
 * 获取所有图标名称（基于虚拟模块）
 */
export const getAllIcons = (): string[] => {
  // 通过虚拟模块获取所有图标ID
  const modules = import.meta.glob('@/assets/icons/**/*.svg', { eager: true })
  return Object.keys(modules).map(path => {
    const match = path.match(/\/([^/]+)\.svg$/)
    return match ? match[1] : ''
  }).filter(Boolean)
}
```

### 7. 使用示例

```vue
<!-- App.vue -->
<template>
  <div class="demo-container">
    <h1>🎨 Vite SVG Icons 动态演示</h1>
    
    <!-- 基础使用 -->
    <section class="demo-section">
      <h2>基础用法</h2>
      <div class="icon-row">
        <SvgIcon name="home" :size="32" color="#409eff" />
        <SvgIcon name="user" :size="32" color="#67c23a" />
        <SvgIcon name="settings" :size="32" color="#e6a23c" />
        <SvgIcon name="heart" :size="32" color="#f56c6c" />
      </div>
    </section>

    <!-- 动态切换 -->
    <section class="demo-section">
      <h2>动态切换（带控制面板）</h2>
      <DynamicIcon 
        initial-icon="star" 
        :size="48" 
        show-controls 
        clickable
        @click="handleIconClick"
        @change="handleIconChange"
        ref="dynamicIconRef"
      />
    </section>

    <!-- 动态列表渲染 -->
    <section class="demo-section">
      <h2>动态列表（v-for）</h2>
      <div class="icon-grid">
        <div 
          v-for="item in menuItems" 
          :key="item.name"
          class="icon-card"
          :class="{ active: activeItem === item.name }"
          @click="activeItem = item.name"
        >
          <SvgIcon 
            :name="item.icon" 
            :size="28" 
            :color="activeItem === item.name ? '#409eff' : '#666'"
          />
          <span class="icon-label">{{ item.label }}</span>
        </div>
      </div>
    </section>

    <!-- 加载状态 -->
    <section class="demo-section">
      <h2>加载动画</h2>
      <div class="loading-demo">
        <SvgIcon name="loading" :size="40" spin color="#409eff" />
        <span>加载中...</span>
      </div>
    </section>

    <!-- 主题切换 -->
    <section class="demo-section">
      <h2>主题色切换</h2>
      <div class="theme-switcher">
        <button 
          v-for="theme in themes" 
          :key="theme.color"
          :style="{ background: theme.color }"
          class="theme-btn"
          @click="currentTheme = theme.color"
        >
          <SvgIcon 
            v-if="currentTheme === theme.color"
            name="check" 
            :size="16" 
            color="white" 
          />
        </button>
      </div>
      <div class="theme-preview" :style="{ color: currentTheme }">
        <SvgIcon name="star" :size="64" :color="currentTheme" />
        <p>当前主题色</p>
      </div>
    </section>

    <!-- 程序化控制 -->
    <section class="demo-section">
      <h2>程序化控制</h2>
      <div class="control-panel">
        <button @click="dynamicIconRef?.setIcon('heart')">切换为爱心</button>
        <button @click="dynamicIconRef?.setIcon('star')">切换为星星</button>
        <button @click="dynamicIconRef?.setColor('#ff6b6b')">变红</button>
        <button @click="dynamicIconRef?.setColor('#4ecdc4')">变青</button>
        <button @click="dynamicIconRef?.toggleSpin()">切换旋转</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SvgIcon from './components/SvgIcon.vue'
import DynamicIcon from './components/DynamicIcon.vue'

const dynamicIconRef = ref<InstanceType<typeof DynamicIcon>>()

const activeItem = ref('home')
const currentTheme = ref('#409eff')

const menuItems = [
  { name: 'home', icon: 'home', label: '首页' },
  { name: 'user', icon: 'user', label: '用户' },
  { name: 'settings', icon: 'settings', label: '设置' },
  { name: 'favorite', icon: 'heart', label: '收藏' },
  { name: 'search', icon: 'search', label: '搜索' },
  { name: 'notify', icon: 'bell', label: '通知' },
]

const themes = [
  { name: 'blue', color: '#409eff' },
  { name: 'green', color: '#67c23a' },
  { name: 'orange', color: '#e6a23c' },
  { name: 'red', color: '#f56c6c' },
  { name: 'purple', color: '#9b59b6' },
]

const handleIconClick = (icon: string) => {
  console.log('点击了图标:', icon)
}

const handleIconChange = (icon: string) => {
  console.log('图标切换为:', icon)
}
</script>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
}

.demo-section {
  margin-bottom: 40px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

h2 {
  margin-top: 0;
  color: #666;
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #eee;
}

.icon-row {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: center;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.icon-card:hover {
  background: #f5f7fa;
}

.icon-card.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.icon-label {
  font-size: 14px;
  color: #666;
}

.loading-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #666;
}

.theme-switcher {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.theme-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.theme-btn:hover {
  transform: scale(1.1);
}

.theme-btn:has(.svg-icon) {
  border-color: #333;
}

.theme-preview {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: #f5f7fa;
  transition: all 0.3s;
}

.control-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.control-panel button {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.control-panel button:hover {
  background: #409eff;
  color: white;
  border-color: #409eff;
}
</style>
```

### 8. TypeScript 类型声明

```typescript
// types/svg.d.ts
declare module 'virtual:svg-icons-register' {
  // 虚拟模块，无需实际导出
}

declare module '*.svg?raw' {
  const content: string
  export default content
}

// 图标名称类型提示（可选，用于自动补全）
type IconName = 
  | 'home' 
  | 'user' 
  | 'settings' 
  | 'heart' 
  | 'star' 
  | 'search' 
  | 'bell' 
  | 'menu' 
  | 'close' 
  | 'check'
  | 'loading'
  | 'arrow-right'
  | 'edit'
  | 'delete'
  | 'download'
  | 'upload'
  | 'share'
  | 'lock'
  | 'unlock'
  | 'eye'
  | 'eye-off'
```

## 目录结构

```
src/
├── assets/
│   └── icons/              # 存放所有 SVG 图标文件
│       ├── home.svg
│       ├── user.svg
│       ├── settings.svg
│       ├── heart.svg
│       ├── star.svg
│       ├── search.svg
│       ├── bell.svg
│       ├── menu.svg
│       ├── close.svg
│       ├── check.svg
│       └── loading.svg
├── components/
│   ├── SvgIcon.vue         # 基础图标组件
│   └── DynamicIcon.vue     # 高级动态组件
├── utils/
│   └── iconLoader.ts       # 图标加载工具
├── types/
│   └── svg.d.ts            # 类型声明
├── App.vue
└── main.ts
```

## 核心特性

| 特性 | 说明 |
|------|------|
| **自动导入** | 放在 `icons` 目录的 SVG 自动注册为 Symbol |
| **动态切换** | 通过修改 `name` 属性实时切换图标 |
| **类型安全** | 完整的 TypeScript 类型支持 |
| **按需加载** | 只打包使用到的图标 |
| **样式可控** | 支持颜色、大小、旋转等动态样式 |
| **程序控制** | 通过 ref 暴露方法供父组件调用 |

这样你就拥有了一个完整的、可动态控制的 SVG 图标系统！



