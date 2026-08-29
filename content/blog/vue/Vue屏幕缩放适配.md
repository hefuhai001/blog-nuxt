# Vue 3项目中的屏幕缩放适配

### 1. 安装`vue3-scale-box`

对于Vue 3项目，你需要安装`vue3-scale-box`。你可以通过npm或yarn来安装：

```shell
npm install vue3-scale-box
# 或者
yarn add vue3-scale-box
```

### 2. 在Vue 3项目中使用`ScaleBox`组件

在Vue 3项目中，使用`ScaleBox`组件的方式与Vue 2类似，但你需要引入`vue3-scale-box`：

```html
<template>
  <ScaleBox :width="1920" :height="1080" bgc="transparent" :delay="100">
    <router-view />
  </ScaleBox>
</template>

<script>
import ScaleBox from "vue3-scale-box";
</script>
```

### 3. 使用Composition API风格的代码案例

对于Vue 3项目，如果你想使用Composition API风格，可以这样实现：

```html
<template>
  <ScaleBox :width="1920" :height="1080" bgc="transparent" :delay="0" :isFlat="false">
    <div class="flex-center">
      <form-view></form-view>
    </div>
  </ScaleBox>
</template>

<script setup lang="ts">
import ScaleBox from "vue3-scale-box";
import FormView from './components/FormView.vue';
</script>

<style scoped>
.flex-center {
  width: 1920px;
  height: 100vh;
  background-color: gray;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

## `ScaleBox`组件的属性

- `width`：设计稿的宽度，默认为`1920`。
- `height`：设计稿的高度，默认为`1080`。
- `bgc`：背景颜色，默认为`"transparent"`。
- `delay`：自适应缩放防抖延迟时间（ms），默认为`100`。
