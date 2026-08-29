# Element-Plus 实现动态渲染图标教程

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
import {createApp} from 'vue'
import {createPinia} from 'pinia'

import App from './App.vue'
import router from './router'
const app = createApp(App)

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'dayjs/locale/zh-cn'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

app.use(ElementPlus, {locale: zhCn})
app.use(createPinia())
app.use(router)
app.mount('#app')
```

### 3. 安装导入图标组件

在你的项目中定义 SVG 图标组件，例如：

```shell
# 选择一个你喜欢的包管理器

# NPM
$ npm install @element-plus/icons-vue
# Yarn
$ yarn add @element-plus/icons-vue
# pnpm
$ pnpm install @element-plus/icons-vue
```

```js
const app = createApp(App)
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
```



### 4. 使用动态渲染图标

在你的 Vue 组件中使用 Element-Plus 提供的 `<el-sub-menu>` 组件来创建下拉菜单，并使用 `<component>` 标签来动态渲染图标。

```vue
    <!--  item.id+'' 解决Invalid prop: type check failed for prop "index". Expected String with value "1", got Number with value 1.   -->
    <el-sub-menu v-for="(item,index) in menuAsc" :index="item.id+''">
      <template #title>
        <!--    关键代码    -->
        <component class="icons" :is="item.icon"></component>
        <span>{{ item.name }}</span>
      </template>
      <el-menu-item v-for="(i,num) in menuAsc[index].children" :index="menuAsc[index].children[num].id+''"
                    @click="routerTo(i)">
        {{ i.name }}
      </el-menu-item>
    </el-sub-menu>
```

在这个例子中，`menuAsc` 是一个数组，包含了菜单项和它们的子菜单。每个菜单项都有一个 `icon` 属性，该属性是一个组件的名称，用于指定要渲染的图标。`<component>` 标签的 `:is` 属性用于动态绑定组件名称，从而实现根据条件渲染不同的图标。

### 5. 样式调整

为了确保图标正确显示，我们可以添加一些 CSS 样式：

```css
svg {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}
```
