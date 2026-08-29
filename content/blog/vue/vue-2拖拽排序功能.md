# 使用 Vue CLI 和 vuedraggable 实现拖拽排序功能

## 1. 创建 Vue 项目

首先，确保你已经安装了 [Node.js](https://nodejs.org/) 和 [Vue CLI](https://cli.vuejs.org/). 如果尚未安装 Vue CLI，可以通过以下命令进行安装：

```bash
npm install -g @vue/cli
```

接下来，使用 Vue CLI 创建一个新的 Vue 项目：

```bash
vue create draggable-sortable
```

在创建过程中，你可以选择默认配置，或者根据需要进行自定义配置。创建完成后，进入项目目录：

```bash
cd draggable-sortable
```

## 2. 安装 vuedraggable

`vuedraggable` 是一个基于Sortable.js的Vue组件，用于实现拖拽排序功能。在项目目录中运行以下命令安装 `vuedraggable`：

```bash
npm install vuedraggable
```

## 3. 实现拖拽排序功能

在 `src/components` 目录下创建一个名为 `DraggableList.vue` 的文件，并添加以下代码：

### DraggableList.vue

```vue
<template>
  <div>
    <h3>拖拽排序列表</h3>
    <draggable v-model="list" @end="updateOrder">
      <transition-group>
        <div
          class="item"
          v-for="(item, index) in list"
          :key="item.id"
          :style="{ backgroundColor: item.color }"
        >
          {{ item.name }}
        </div>
      </transition-group>
    </draggable>
    <h4>当前顺序：</h4>
    <pre>{{ JSON.stringify(order, null, 2) }}</pre>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  components: {
    draggable
  },
  data() {
    return {
      list: [
        { id: 1, name: "项目1", color: this.getRandomColor() },
        { id: 2, name: "项目2", color: this.getRandomColor() },
        { id: 3, name: "项目3", color: this.getRandomColor() },
        { id: 4, name: "项目4", color: this.getRandomColor() },
        { id: 5, name: "项目5", color: this.getRandomColor() }
      ],
      order: [] // 用于存储当前顺序
    };
  },
  methods: {
    updateOrder(event) {
      // 更新 order 数据
      this.order = this.list.map((item) => item.id);

      // 打印当前顺序
      console.log("当前顺序：", this.order);
    },
    getRandomColor() {
      // 生成随机颜色
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
  }
};
</script>

<style scoped>
.item {
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ccc;
  color: white; /* 设置文字颜色为白色，以便在深色背景上显示 */
  cursor: move;
}
</style>
```

### 代码说明

1. **`v-model` 绑定数据**：
   - `draggable` 组件通过 `v-model` 绑定一个数组 `list`，该数组中的元素将被渲染为可拖拽的项目。

2. **`@end` 事件**：
   - 在拖拽结束时触发 `updateOrder` 方法，更新 `order` 数据并打印当前顺序。

3. **随机颜色生成**：
   - 通过 `getRandomColor` 方法为每个项目生成随机颜色，并绑定到 `:style="{ backgroundColor: item.color }"`。

4. **显示当前顺序**：
   - 使用 `<pre>{{ JSON.stringify(order, null, 2) }}</pre>` 格式化显示当前顺序。

## 4. 在主应用中使用组件

在 `src/App.vue` 文件中引入并使用 `DraggableList` 组件：

### App.vue

```vue
<template>
  <div id="app">
    <DraggableList />
  </div>
</template>

<script>
import DraggableList from "./components/DraggableList.vue";

export default {
  name: "App",
  components: {
    DraggableList
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
```

## 5. 启动项目

在项目根目录下运行以下命令启动项目：

```bash
npm run serve
```

打开浏览器访问项目，你将看到一个可拖拽排序的列表，每个项目都有随机生成的颜色。拖拽排序后，页面上会显示当前的顺序。
