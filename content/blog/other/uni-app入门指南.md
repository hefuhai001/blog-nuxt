# 入门指南：使用uni-app构建跨平台应用

uni-app是一个使用Vue.js开发所有前端应用的框架，可以发布到iOS、Android、Web（包括PC和移动端浏览器）、以及各种小程序（微信/支付宝/百度/字节跳动/QQ/钉钉等）和快应用等多个平台。本教程将带你快速了解uni-app的基本使用。

## 环境搭建

### 安装HBuilderX

首先，你需要下载并安装[HBuilderX](https://www.dcloud.io/hbuilderx.html)，这是开发uni-app的官方IDE。
![HBuildX](https://img-blog.csdnimg.cn/direct/1b4c20cf800b47ec8b8997bd235ff4f8.png)

### 创建项目

打开HBuilderX，选择“文件” > “新建” > “项目”，然后选择uni-app模板，填写项目名称和选择项目存储位置，点击“创建”。
![“文件” > “新建” > “项目”](https://img-blog.csdnimg.cn/direct/e6a896e1914a45a19a2cb6d28f252fce.png)
![创建项目](https://img-blog.csdnimg.cn/direct/3b660ad5ce83448b96ac3cde48c08496.png)

## 项目结构

uni-app的项目结构与传统的Vue项目类似，主要包含以下几个部分：
![项目结构](https://img-blog.csdnimg.cn/direct/b18ad1bd56f94073892167d373f4210c.png)

- `pages`：存放页面文件的目录。
- `static`：存放静态资源，如图片、样式文件等。
- `components`：存放自定义组件的目录。
- `main.js`：应用的入口文件，用于初始化Vue实例。
- `App.vue`：应用的根组件。
 - `pages.json`：页面的配置文件和全局样式配置（如app头部背景色，标题）。
- `manifest.json`：应用的配置文件，用于配置应用名称、图标等信息。

## 开发页面

在`pages`目录下创建一个新的`.vue`文件，例如`index.vue`。你可以使用Vue的语法来编写页面内容。

```vue
<template>
  <view class="container">
    <text>欢迎来到uni-app世界！</text>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 页面的初始数据
    };
  },
  methods: {
    // 页面的方法
  }
};
</script>

<style>
/* 页面的样式 */
.container {
  padding: 20px;
  text-align: center;
}
</style>
```
![开发页面](https://img-blog.csdnimg.cn/direct/403337b67d2d4b16939904e9afc17047.png)

## 运行项目

在HBuilderX中，选择你想要运行的平台（例如Edge浏览器），然后点击工具栏上的“运行”按钮，即可在模拟器或真机上查看效果。
![运行项目](https://img-blog.csdnimg.cn/direct/9759b0d92b6e49be910e2eec42c49307.png)

## 组件化开发

uni-app支持Vue组件化开发，你可以创建自定义组件来复用代码。在`components`目录下创建组件文件，然后在页面中引入使用。

### 创建组件

在`components`目录下创建一个名为`my-component.vue`的文件。
![创建组件](https://img-blog.csdnimg.cn/direct/65948036ce07491c91d7ef6f279842c1.png)

```vue
<template>
  <view>
    <text>这是一个自定义组件</text>
  </view>
</template>

<script>
export default {
  // 组件选项
};
</script>
```

### 使用组件

在页面中引入并注册组件。

```vue
<template>
  <view>
    <my-component></my-component>
  </view>
</template>

<script>
import MyComponent from '@/components/my-component.vue';

export default {
  components: {
    MyComponent
  }
};
</script>
```
![使用组件](https://img-blog.csdnimg.cn/direct/9ef71278333a4849b824b4abb85c1355.png)

## 条件编译

uni-app支持条件编译，允许你根据不同的平台编写特定的代码。

```javascript
// #ifdef H5
console.log('这是H5平台特有的代码');
// #endif

// #ifdef MP-WEIXIN
console.log('这是微信小程序平台特有的代码');
// #endif
```
