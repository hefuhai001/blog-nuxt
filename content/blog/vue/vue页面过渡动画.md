# Vue页面过渡动画

## Vue过渡系统基础

Vue的`<transition>`组件是实现过渡效果的核心。当元素插入或移除时，Vue会自动应用CSS过渡类名：

1. `v-enter-from` / `v-leave-from`: 进入/离开的起始状态
2. `v-enter-active` / `v-leave-active`: 进入/离开的活动状态
3. `v-enter-to` / `v-leave-to`: 进入/离开的结束状态

## 完整实现代码

```html
<template>
  <div id="app">
    <div class="app-container">
      <nav class="sidebar">
        <div class="logo">Vue Transition</div>
        <ul class="nav-menu">
          <li 
            class="nav-item" 
            :class="{ active: $route.path === '/' }"
            @click="navigateTo('/')"
          >
            <span class="nav-icon">🏠</span>
            <span class="nav-text">首页</span>
          </li>
          <li 
            class="nav-item" 
            :class="{ active: $route.path === '/about' }"
            @click="navigateTo('/about')"
          >
            <span class="nav-icon">ℹ️</span>
            <span class="nav-text">关于</span>
          </li>
        </ul>
      </nav>
      
      <main class="content-area">
        <transition name="slide-fade" mode="out-in">
          <router-view class="page-content" />
        </transition>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    navigateTo(path) {
      if (this.$route.path !== path) {
        this.$router.push(path)
      }
    }
  }
}
</script>

<style>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  height: 100vh;
  background: #f5f7fa;
}

.app-container {
  display: flex;
  height: 100%;
}

/* 侧边栏样式 */
.sidebar {
  width: 240px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0 20px 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-menu {
  list-style: none;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  border-left: 3px solid white;
}

.nav-icon {
  margin-right: 10px;
  font-size: 1.1rem;
}

.nav-text {
  font-size: 0.95rem;
}

/* 内容区域样式 */
.content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.page-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  min-height: calc(100% - 60px);
}

/* 过渡动画效果 */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.98);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.98);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .content-area {
    padding: 20px;
  }
  
  .page-content {
    padding: 20px;
    min-height: auto;
  }
}
</style>
```

## 关键实现解析

### 1. 过渡组件配置

```html
<transition name="slide-fade" mode="out-in">
  <router-view class="page-content" />
</transition>
```

- `name="slide-fade"`: 定义过渡类名前缀
- `mode="out-in"`: 确保当前元素先离开，新元素再进入

### 2. CSS过渡动画

```css
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.98);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.98);
}
```

这里使用了`cubic-bezier`曲线创建弹性效果，同时结合了平移和缩放动画，使过渡更加生动。

### 3. 导航优化

```javascript
navigateTo(path) {
  if (this.$route.path !== path) {
    this.$router.push(path)
  }
}
```

添加了路由判断，避免重复导航触发不必要的动画。

## 进阶技巧

### 1. 动态过渡效果

可以根据路由深度应用不同的过渡方向：

```javascript
watch: {
  $route(to, from) {
    const toDepth = to.path.split('/').length
    const fromDepth = from.path.split('/').length
    this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
  }
}
```

### 2. 集成第三方动画库

如使用`animate.css`：

```shell
npm install animate.css
```

然后在组件中使用：

```vue
<transition
  enter-active-class="animate__animated animate__fadeInLeft"
  leave-active-class="animate__animated animate__fadeOutRight"
  mode="out-in"
>
  <router-view></router-view>
</transition>
```
