# Element-Plus下拉菜单边框去除教程

## 实现步骤

### 1. 安装 Element-Plus

首先，确保你的项目已经安装了 Vue 3，然后通过 npm 或 yarn 安装 Element-Plus：

```bash
npm install element-plus --save
# 或者
yarn add element-plus
```

### 2. 引入 Element-Plus

在你的主文件（通常是 `main.js` 或 `main.ts`）中引入 Element-Plus 并注册为全局可用：

```javascript
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);
app.use(ElementPlus);
app.mount('#app');
```

### 3. 使用 Element-Plus 组件

在你的 Vue 组件中使用 Element-Plus 提供的下拉框（Select）组件：

```vue
<template>
	<el-dropdown>
      <el-avatar :size="45" shape="square" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"/>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>个人中心</el-dropdown-item>
          <el-dropdown-item>修改信息</el-dropdown-item>
          <el-dropdown-item>安全退出</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
</template>

<script>
export default {
  data() {
    return {
      value: '',
    };
  },
};
</script>
```

### 4. 去除边框样式

为了去除下拉框在聚焦时的边框，我们需要在项目的样式文件中添加 CSS 规则。Vue 3 引入了 `:deep()` 伪类，它可以用来穿透组件的样式作用域，修改子组件的样式。

```css
:deep(.el-tooltip__trigger:focus-visible) {
  outline: unset;
}
```

上述样式规则将移除 `el-tooltip__trigger` 类（通常是下拉框的触发元素）在聚焦时的默认边框。`:focus-visible` 伪类确保只有在用户通过键盘聚焦元素时才会应用样式，这样鼠标聚焦时的默认样式不会被影响。
