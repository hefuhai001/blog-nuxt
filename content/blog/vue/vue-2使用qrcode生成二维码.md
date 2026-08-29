# 在 Vue 2 中使用 qrcode 库生成二维码

## 1. 安装 qrcode 库

首先，确保你已经安装了 Vue CLI。如果尚未安装 Vue CLI，可以通过以下命令进行安装：

```bash
npm install -g @vue/cli
```

接下来，使用 Vue CLI 创建一个新的 Vue 项目：

```bash
vue create vue-qrcode-example
```

在创建过程中，你可以选择默认配置，或者根据需要进行自定义配置。创建完成后，进入项目目录：

```bash
cd vue-qrcode-example
```

然后，安装 `qrcode` 库：

```bash
npm install qrcode
```

## 2. 创建二维码组件

在 `src/components` 目录下创建一个名为 `QrCode.vue` 的文件，用于封装二维码生成的逻辑。以下是 `QrCode.vue` 的代码示例：

### QrCode.vue

```vue
<template>
  <div>
    <canvas ref="qrCanvas"></canvas>
  </div>
</template>

<script>
import QRCode from 'qrcode';

export default {
  name: 'QrCode',
  props: {
    text: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 200
    }
  },
  mounted() {
    this.generateQrCode();
  },
  methods: {
    generateQrCode() {
      QRCode.toCanvas(this.$refs.qrCanvas, this.text, { width: this.size }, (err) => {
        if (err) {
          console.error('生成二维码失败：', err);
        }
      });
    }
  }
};
</script>
```

### 代码说明

1. **`props`**：
   - `text`：要编码到二维码中的字符串，这是一个必填属性。
   - `size`：二维码的宽度和高度，默认值为 200。

2. **`mounted` 钩子**：
   - 在组件挂载完成后，调用 `generateQrCode` 方法生成二维码。

3. **`generateQrCode` 方法**：
   - 使用 `qrcode` 库的 `toCanvas` 方法将二维码渲染到 `<canvas>` 元素中。
   - 通过 `this.$refs.qrCanvas` 获取 `<canvas>` 元素的引用。
   - 设置二维码的宽度为 `size` 属性的值。

## 3. 在主应用中使用二维码组件

在 `src/App.vue` 文件中引入并使用 `QrCode` 组件：

### App.vue

```vue
<template>
  <div id="app">
    <h1>Vue 2 二维码生成示例</h1>
    <QrCode :text="url" :size="300" />
  </div>
</template>

<script>
import QrCode from './components/QrCode.vue';

export default {
  name: 'App',
  components: {
    QrCode
  },
  data() {
    return {
      url: 'https://www.example.com'
    };
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

### 代码说明

1. **`QrCode` 组件**：
   - 通过 `:text="url"` 将要生成二维码的文本传递给 `QrCode` 组件。
   - 通过 `:size="300"` 设置二维码的大小为 300px。

2. **`data`**：
   - `url`：要生成二维码的文本内容。

## 4. 启动项目

在项目根目录下运行以下命令启动项目：

```bash
npm run serve
```

## 5. 配置选项

`qrcode` 库提供了丰富的配置选项，例如：

- `text`：要编码到二维码中的字符串。
- `width` 和 `height`：二维码的宽度和高度。
- `colorDark` 和 `colorLight`：二维码的暗部和亮部颜色。
- `correctLevel`：二维码的纠错级别。

例如，可以在 `generateQrCode` 方法中添加更多配置：

```javascript
generateQrCode() {
  QRCode.toCanvas(this.$refs.qrCanvas, this.text, {
    width: this.size,
    color: {
      dark: '#000000', // 暗部颜色
      light: '#ffffff' // 亮部颜色
    },
    errorCorrectionLevel: 'H' // 纠错级别
  }, (err) => {
    if (err) {
      console.error('生成二维码失败：', err);
    }
  });
}
```
