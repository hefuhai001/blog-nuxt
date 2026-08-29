# 在Vue中处理接口返回的二进制图片数据

## 1. 问题分析

### 1.1 环境检查

确保你的Vue项目能够正常发起网络请求，并且后端接口的跨域设置是正确的。如果需要，可以参考相关文档配置axios以适应跨域请求。

### 1.2 问题描述

当后端接口返回的响应类型为`application/octet-stream`或`image/png`等二进制格式时，我们需要特殊处理这些数据。

## 2. 接口对接

### 2.1 添加接口返回头

在axios请求中，我们需要指定`responseType`为`arraybuffer`，以便接收二进制数据。

```javascript
// 使用axios获取二进制数据
request.get("/commonEntity/generateImageCode", {
  responseType: "arraybuffer",
}).then((res) => {
  console.log(res.data); // 二进制数据
});
```

### 2.2 请求数据示例

接口返回的二进制数据通常是一个`ArrayBuffer`对象。

### 2.3 使用`bufferUrl`和`btoa`函数

为了将二进制数据转换为Base64编码，我们可以使用`btoa`函数。然后，我们可以将Base64编码的字符串作为图片的`src`属性。

```javascript
import request from "@/request";
import { onMounted, ref } from "vue";

const imgSrc = ref('');

onMounted(() => {
  request.get("/commonEntity/generateImageCode", {
    responseType: "arraybuffer",
  }).then((res) => {
    // 将ArrayBuffer转换为Base64编码的字符串
    const buffer = new Uint8Array(res);
    const base64String = btoa(
      buffer.reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    imgSrc.value = "data:image/png;base64," + base64String;
  });
});
```

## 3. 全部代码

以下是一个完整的Vue组件示例，展示了如何获取二进制图片数据并将其显示在页面上。

```vue
<template>
  <img :src="imgSrc" alt="二进制图片">
</template>

<script setup lang="ts">
import request from "@/request";
import { onMounted, ref } from "vue";

// 定义响应式引用imgSrc
const imgSrc = ref('');

// 在组件挂载后发起请求
onMounted(() => {
  // 发起请求并处理二进制数据
  request.get("/commonEntity/generateImageCode", {
    responseType: "arraybuffer",
  }).then((res) => {
    // 将二进制数据转换为Base64编码
    const buffer = new Uint8Array(res);
    const base64String = btoa(
      buffer.reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    // 更新imgSrc的值为Base64编码的图片URL
    imgSrc.value = "data:image/png;base64," + base64String;
  });
});
</script>
```
