# Vue3 图片裁剪：从安装到上线

## 1. 极速安装

```bash
# Vue2 项目
npm i vue-cropper@0.6.5 -S

# Vue3 项目（官方 1.x 已支持）
npm i vue-cropper@next -S
```

---

## 2. 完整代码

### 2.1 封装组件CropperView.vue

```vue
<template>
  <div class="cropper-wrapper">
    <h3>Step1：选图</h3>
    <input type="file" accept="image/*" @change="handleFileChange" />

    <div v-if="option.img" class="box">
      <vue-cropper
        ref="cropper"
        :img="option.img"
        :output-size="option.outputSize"
        :output-type="option.outputType"
        :auto-crop="option.autoCrop"
        :auto-crop-width="option.autoCropWidth"
        :auto-crop-height="option.autoCropHeight"
        :fixed="option.fixed"
        :fixed-number="option.fixedNumber"
        :center-box="option.centerBox"
        style="width: 100%; height: 400px"
      />
      <div class="toolbar">
        <button @click="rotateLeft">↺ 左旋转</button>
        <button @click="rotateRight">↻ 右旋转</button>
        <button @click="cropImage" class="primary">✂️ 立即裁剪</button>
      </div>

      <div v-if="croppedBlob" class="preview">
        <h3>Step2：预览 / 上传</h3>
        <img :src="previewUrl" alt="preview" />
        <a :href="previewUrl" download="cropped.png">📥 下载</a>
        <button @click="upload" class="success">☁️ 上传服务器</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { VueCropper } from 'vue-cropper'

const cropper = ref(null)
const croppedBlob = ref(null)
const previewUrl = ref('')

const option = reactive({
  img: '',               // 原图 base64
  outputSize: 0.9,       // 质量 0.1-1
  outputType: 'png',
  autoCrop: true,
  autoCropWidth: 300,
  autoCropHeight: 300,
  fixed: true,           // 固定比例
  fixedNumber: [1, 1],   // 1:1 正方形，可改 [16,9] 等
  centerBox: true
})

/* 1. 选图 */
function handleFileChange (e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (evt) => { option.img = evt.target.result }
  reader.readAsDataURL(file)
}

/* 2. 旋转 */
function rotateLeft () { cropper.value.rotateLeft() }
function rotateRight () { cropper.value.rotateRight() }

/* 3. 裁剪 */
function cropImage () {
  cropper.value.getCropBlob(blob => {
    croppedBlob.value = blob
    previewUrl.value = URL.createObjectURL(blob)
  })
}

/* 4. 上传（示例：伪代码） */
async function upload () {
  const form = new FormData()
  form.append('file', croppedBlob.value, 'avatar.png')
  const res = await fetch('/api/upload', { method: 'POST', body: form })
  const json = await res.json()
  alert('上传成功：' + json.url)
}
</script>

<style scoped>
.cropper-wrapper { max-width: 800px; margin: 40px auto; }
.toolbar { margin-top: 12px; }
.toolbar button { margin-right: 8px; }
.primary { background: #409eff; color: #fff; }
.success { background: #67c23a; color: #fff; }
.preview { margin-top: 20px; text-align: center; }
.preview img { max-width: 300px; margin: 10px 0; display: block; }
</style>
```

### 2.2 全局注册（main.js）

```js
import { createApp } from 'vue'
import App from './App.vue'
import 'vue-cropper/dist/index.css'   // 记得引入样式

createApp(App).mount('#app')
```

---

## 3. 常用配置速查表

| 属性                     | 含义               | 示例值              |
| ------------------------ | ------------------ | ------------------- |
| `autoCropWidth / Height` | 初始裁剪框大小     | 300                 |
| `fixed`                  | 是否锁定比例       | true                |
| `fixedNumber`            | 比例数组           | [16,9]              |
| `canScale`               | 滚轮放大           | true                |
| `canMove / canMoveBox`   | 图片/裁剪框拖动    | true                |
| `centerBox`              | 裁剪框限制在图片内 | true                |
| `info`                   | 右上角信息提示     | true                |
| `mode`                   | 图片填充模式       | `contain` / `cover` |

