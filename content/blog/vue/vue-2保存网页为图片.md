# Vue2 将网页内容转换为图片保存

### **一、常用第三方库**

#### 1. **html2canvas** [*主流方案，支持大部分场景*]

- **功能**：将指定 DOM 元素渲染为 Canvas，再转换为图片（支持 PNG/JPEG 格式）。
- **特点**：
    
    - 支持跨域图片（需配置 `useCORS: true`）。
    - 部分 CSS 属性不支持（如 `box-shadow`、`text-overflow: ellipsis`）。
- **安装**：
  ```bash
  npm install html2canvas --save
  ```

#### 2. **dom-to-image** [*轻量级替代方案*]

- **功能**：类似 html2canvas，但更轻量，兼容性稍弱。
- **特点**：

    - 生成 SVG 或 PNG。
    - 对复杂 CSS 支持有限。
- **安装**：
  ```bash
  npm install dom-to-image --save
  ```

---

### **二、实现步骤与示例代码**

#### **方案一：使用 html2canvas 实现**

##### **1. 基础用法（生成图片并下载）**

```vue

<template>
  <div>
    <!-- 目标 DOM 元素 -->
    <div ref="captureElement" class="content-box">
      <h1>需要保存的内容</h1>
      <p>示例文本</p>
    </div>
    <button @click="saveAsImage">保存为图片</button>
  </div>
</template>

<script>
  import html2canvas from 'html2canvas';

  export default {
    methods: {
      saveAsImage() {
        html2canvas(this.$refs.captureElement).then(canvas => {
          const imgUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = 'screenshot.png';
          link.href = imgUrl;
          link.click();
        });
      }
    }
  };
</script>
```

**说明**：

- 通过 `ref` 获取 DOM 元素。
- 使用 `html2canvas` 生成 Canvas，并通过 `toDataURL` 转换为 Base64 图片地址。
- 创建隐藏的 `<a>` 标签触发下载。

##### **2. 处理移动端兼容性问题**

微信浏览器等移动端环境可能无法直接下载，需引导用户长按保存：

```vue

<script>
  methods: {
    saveAsImage()
    {
      html2canvas(this.$refs.captureElement).then(canvas => {
        const imgUrl = canvas.toDataURL('image/png');
        // 移动端通过图片预览引导用户长按保存
        if (this.isMobile()) {
          ImagePreview([imgUrl]); // 使用 Vant 等 UI 库的预览组件
          this.$toast('请长按图片保存到相册');
        } else {
          // PC 端直接下载
          const link = document.createElement('a');
          link.href = imgUrl;
          link.download = 'screenshot.png';
          link.click();
        }
      });
    }
  ,
    isMobile()
    {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
  }
</script>
```

**说明**：

##### **3. 高级配置（背景透明、跨域图片）**

```javascript
html2canvas(this.$refs.captureElement, {
    backgroundColor: null, // 透明背景
    useCORS: true,         // 允许加载跨域图片
    scale: 2               // 提高分辨率
}).then(canvas => { /* ... */
});
```

**说明**：

---

#### **方案二：使用 dom-to-image**

##### **1. 生成图片并下载**

```vue

<script>
  import domtoimage from 'dom-to-image';

  export default {
    methods: {
      saveAsImage() {
        domtoimage.toPng(this.$refs.captureElement)
            .then(imgUrl => {
              const link = document.createElement('a');
              link.download = 'screenshot.png';
              link.href = imgUrl;
              link.click();
            });
      }
    }
  };
</script>
```

---

### **三、常见问题与解决方案**

#### **1. 图片内容缺失**

- **原因**：部分 CSS 属性不支持（如 `box-shadow`）。
- **解决**：调整 CSS 样式，使用兼容性更好的属性。

#### **2. 跨域图片无法加载**

- **解决**：
    - 配置 `html2canvas` 的 `useCORS: true`。
    - 确保图片服务器允许跨域访问。

#### **3. 微信浏览器下载限制**

- **解决**：引导用户长按图片保存，或通过后端接口生成图片链接。

---

### **四、完整示例（含 Blob 转换）**

```vue

<script>
  methods: {
    saveAsImage()
    {
      html2canvas(this.$refs.captureElement).then(canvas => {
        const imgUrl = canvas.toDataURL('image/png');
        // 将 Base64 转为 Blob 对象（解决部分浏览器兼容性问题）
        const blob = this.dataURLtoBlob(imgUrl);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'screenshot.png';
        link.click();
        URL.revokeObjectURL(link.href);
      });
    }
  ,
    dataURLtoBlob(dataURL)
    {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {type: mime});
    }
  }
</script>
```
