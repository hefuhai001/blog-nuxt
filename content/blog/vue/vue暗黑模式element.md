# 🔥 Vue3 + Element Plus 一键切换暗黑主题（开箱即用）

直接上可落地的完整方案，核心代码+关键配置一步到位。

## 一、核心依赖配置

先确保正确引入Element Plus暗黑主题样式，这是基础：

```js
// main.js / main.ts
import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 必须引入暗黑主题的css变量文件
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```

## 二、主题切换组件（ThemeToggle.vue）

封装独立组件，支持本地存储记忆主题：

```vue

<template>
  <el-switch
      v-model="isDark"
      inline-prompt
      :active-icon="Moon"
      :inactive-icon="Sunny"
      @change="toggleTheme"
  />
</template>

<script setup>
  import {ref, onMounted} from 'vue'
  import {Sunny, Moon} from '@element-plus/icons-vue'

  const isDark = ref(false)

  // 初始化：读取本地存储的主题设置
  onMounted(() => {
    const savedTheme = localStorage.getItem('dark')
    if (savedTheme === 'true') {
      isDark.value = true
      document.documentElement.classList.add('dark')
    }
  })

  // 切换主题核心逻辑
  const toggleTheme = (value) => {
    const root = document.documentElement
    value ? root.classList.add('dark') : root.classList.remove('dark')
    localStorage.setItem('dark', value) // 持久化存储
  }
</script>
```

## 三、使用组件

在任意页面引入即可使用，示例页面完整代码：

```vue

<template>
  <div class="app-container">
    <!-- 主题切换按钮（固定在右上角） -->
    <div class="theme-toggle">
      <ThemeToggle/>
    </div>

    <!-- 测试内容：验证暗黑主题生效 -->
    <div class="demo-content">
      <el-card>
        <template #header>
          <span>Element Plus 暗黑主题示例</span>
        </template>
        <el-button type="primary">主要按钮</el-button>
        <el-button type="success">成功按钮</el-button>
        <el-alert title="提示信息" type="info" show-icon/>
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="date" label="日期"/>
          <el-table-column prop="name" label="姓名"/>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
  import {ref} from 'vue'
  import ThemeToggle from './components/ThemeToggle.vue'

  // 测试表格数据
  const tableData = ref([
    {date: '2024-01-01', name: '张三', address: '上海市普陀区金沙江路 1518 弄'},
    {date: '2024-01-02', name: '李四', address: '上海市普陀区金沙江路 1517 弄'}
  ])
</script>

<style scoped>
  .app-container {
    min-height: 100vh;
    padding: 20px;
  }

  .theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
  }

  .demo-content {
    max-width: 1200px;
    margin: 60px auto 0;
  }
</style>
```

### 核心关键点

1. 必须引入 `element-plus/theme-chalk/dark/css-vars.css`，否则暗黑样式不生效；
2. 通过操作 `document.documentElement.classList` 添加/移除 `dark` 类，触发Element Plus暗黑主题；
3. 利用 `localStorage` 持久化主题设置，页面刷新后保留用户选择；
4. 组件化封装切换逻辑，可在任意页面复用。

### 效果说明

切换开关后，Element Plus所有组件（按钮、表格、弹窗、提示框等）会自动切换暗黑样式，无需单独写自定义样式适配。