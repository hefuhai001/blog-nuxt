# Vue 2项目中的屏幕缩放适配

### 1. 安装`vue2-scale-box`

首先，你需要在你的Vue 2项目中安装`vue2-scale-box`。你可以通过npm或yarn来安装：

```shell
npm install vue2-scale-box
# 或者
yarn add vue2-scale-box
```

### 2. 在`App.vue`中使用`ScaleBox`组件

在你的`App.vue`文件中，引入并注册`ScaleBox`组件，并使用它包裹你的应用视图（通常是`<router-view />`）：

```html
<template>
  <div>
    <scale-box :width="1920" :height="1080" bgc="transparent" :delay="100">
      <router-view />
    </scale-box>
  </div>
</template>

<script>
import ScaleBox from "vue2-scale-box";
export default {
  components: { ScaleBox },
};
</script>
```

### 3. 使用Options API风格的代码案例

对于Vue 2项目，如果你想使用Options API风格，可以这样实现：

```html
<template>
  <div id="app">
    <scale-box :width="1920" :height="1080" bgc="transparent" :delay="100">
      <div class="flex-center">
        <form-view></form-view>
      </div>
    </scale-box>
  </div>
</template>

<script>
import ScaleBox from "vue2-scale-box";
import FormView from './components/FormView.vue';

export default {
  name: 'App',
  components: {
    ScaleBox,
    FormView
  }
}
</script>

<style>
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



