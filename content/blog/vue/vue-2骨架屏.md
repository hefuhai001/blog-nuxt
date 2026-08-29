# Vue2 实现骨架屏效果

---

### **方法一：手动编写骨架屏组件**
#### 实现步骤：
1. **创建骨架屏组件**：编写一个模拟页面结构的 Vue 组件。
2. **控制显示时机**：在数据加载前显示骨架屏，加载完成后隐藏。

#### 示例代码：
```html
<!-- Skeleton.vue -->
<template>
  <div class="skeleton">
    <div class="skeleton-header"></div>
    <div class="skeleton-content">
      <div class="skeleton-line" v-for="i in 4" :key="i"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  padding: 20px;
}

.skeleton-header {
  height: 60px;
  background: #f0f0f0;
  margin-bottom: 20px;
  border-radius: 4px;
}

.skeleton-content {
  background: #fff;
}

.skeleton-line {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  margin-bottom: 12px;
  border-radius: 4px;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
```

#### 在父组件中使用：
```vue
<template>
  <div>
    <skeleton v-if="isLoading" />
    <div v-else>
      <!-- 实际内容 -->
    </div>
  </div>
</template>

<script>
import Skeleton from './Skeleton.vue';

export default {
  components: { Skeleton },
  data() {
    return {
      isLoading: true
    };
  },
  async created() {
    await this.fetchData();
    this.isLoading = false;
  },
  methods: {
    async fetchData() {
      // 模拟数据加载
      return new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};
</script>
```

---

### **方法二：使用第三方库 `vue-skeleton-webpack-plugin`**
#### 实现步骤：
1. **安装插件**：
   ```bash
   npm install vue-skeleton-webpack-plugin --save-dev
   ```

2. **创建骨架屏入口文件**：
   ```html
   <!-- skeleton/SkeletonEntry.vue -->
   <template>
     <div class="skeleton-page">
       <!-- 骨架屏内容 -->
     </div>
   </template>
   ```

3. **配置 `vue.config.js`**：
   ```js
   const SkeletonWebpackPlugin = require('vue-skeleton-webpack-plugin');
   
   module.exports = {
     configureWebpack: {
       plugins: [
         new SkeletonWebpackPlugin({
           webpackConfig: {
             entry: './src/skeleton/SkeletonEntry.js' // 骨架屏入口文件
           },
           minimize: true,
           quiet: true
         })
       ]
     }
   };
   ```

4. **在路由中启用**：
   ```js
   // router.js
   import SkeletonPage from './skeleton/SkeletonEntry.vue';
   
   const routes = [
     {
       path: '/',
       component: () => import('./views/Home.vue'),
       meta: {
         skeleton: SkeletonPage // 标记需要骨架屏的路由
       }
     }
   ];
   ```

---

### **方法三：使用 `vue-content-loading` 库**
#### 实现步骤：
1. **安装库**：
   ```bash
   npm install vue-content-loading
   ```

2. **在组件中使用**：
   ```html
   <template>
     <ContentLoader :speed="2" primaryColor="#f3f3f3" secondaryColor="#ecebeb">
       <!-- 模拟矩形、圆形等占位元素 -->
       <rect x="0" y="0" rx="3" ry="3" width="100%" height="60" />
       <rect x="0" y="80" rx="3" ry="3" width="80%" height="20" />
       <rect x="0" y="120" rx="3" ry="3" width="60%" height="20" />
     </ContentLoader>
   </template>
   
   <script>
   import { ContentLoader } from 'vue-content-loading';
   
   export default {
     components: {
       ContentLoader
     }
   };
   </script>
   ```

---

### **方法四：纯CSS骨架屏动画**
在需要占位的地方直接使用CSS动画：
```html
<div class="skeleton-item">
  <div class="skeleton-animation"></div>
</div>

<style>
.skeleton-animation {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
```
