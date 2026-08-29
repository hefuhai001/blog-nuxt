# Vue项目中使用Mock.js进行API模拟

在开发Vue应用时，我们经常需要模拟API响应，以便在后端服务尚未准备好时进行前端开发。Mock.js是一个强大的工具，可以帮助我们轻松创建模拟数据。本教程将指导你如何在Vue项目中集成和使用Mock.js。

## 安装Mock.js

首先，你需要在你的Vue项目中安装Mock.js。

```shell
npm i mockjs
```

## 创建Mock数据

在你的项目中创建一个`mock`目录，并添加一个`index.js`文件。在这个文件中，我们将定义我们的模拟数据。

```javascript
// src/mock/index.js
import Mock from 'mockjs'

// 创建模拟数据
const data = Mock.mock({
  'list|1-10': [{
    'id|+1': 1
  }]
})

// 模拟API响应
Mock.mock('/api/list/', 'get', () => {
  return data.list;
})
```

## 在Vue应用中导入Mock数据

在`main.js`文件中，导入并使用Mock数据。

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import '@/mock' // 导入Mock数据

createApp(App).mount('#app')
```

## 使用Mock数据

在Vue组件中，你可以像往常一样使用`fetch`或`axios`来请求模拟的API。

```vue
// page.vue
<template>
  <div>
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
import request from '@/request/index';
import { onMounted, ref } from 'vue'

onMounted(() => {
  request.get('/list/').then((res: any) => {
    console.log(res.data);
  })
})
</script>

<style scoped></style>
```

## 配置Axios

为了更好地管理API请求，我们通常会使用Axios。首先安装Axios。

```shell
npm i axios
```

然后创建一个`config`目录，并添加一个`index.js`文件来配置Axios。

```javascript
// src/config/index.js
export const baseURL = '/api'
export const timeout = 10000
export const headers = { 'X-Custom-Header': 'foobar' }
```

接着创建一个`request.js`文件来封装Axios请求。

```javascript
import axios from "axios";
import { baseURL, timeout, headers } from "@/config";

//@ts-ignore
const request = axios.create({
  baseURL,
  timeout,
  headers,
});

// 添加请求拦截器
request.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
request.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    return response;
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default request;
```

## 配置Vite代理

如果你的开发环境需要代理API请求，你可以在`vue.config.js`中配置代理。

```javascript
// vue.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5174/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/\/api/, ""),
      },
    },
  },
})
```
