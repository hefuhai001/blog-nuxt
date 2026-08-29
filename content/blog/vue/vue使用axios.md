# Vue工程使用axios

## 安装

```shell
npm i axios
```

## 全局配置

```js
//src/config/index.js
export const baseURL = '/api'
export const timeout = 10000
export const headers = { 'X-Custom-Header': 'foobar' }
```

## 拦截器

```js
//src/request/index.js
import axios from "axios";
import { baseURL, timeout, headers } from '@/config'

const request = axios.create({
    baseURL,
    timeout,
    headers
});

// 添加请求拦截器
request.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
request.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default request;
```

## 代理解决跨域

```js
//vue.config.js
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
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

## 使用

```vue
<template>
  <div>
    
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

