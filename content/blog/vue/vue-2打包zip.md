# Vue 2 中实现文件导出为压缩包的通用方法

在开发 Web 应用时，经常会遇到需要将多个文件打包成一个压缩包并导出的需求。例如，用户可能需要下载多个文件，或者从服务器获取文件内容后进行打包。在 Vue 2 中，可以通过一些 JavaScript 库（如 `jszip` 和 `file-saver`）轻松实现这一功能。本文将详细介绍如何封装一个通用的文件导出压缩包的函数，并在 Vue 2 项目中使用它。

## 1. 安装依赖

首先，我们需要安装 `jszip` 和 `file-saver` 库。这些库分别用于创建和操作压缩包，以及将生成的压缩包保存到本地。

```bash
npm install jszip file-saver
```

## 2. 封装通用导出压缩包的函数

接下来，我们封装一个通用的函数 `exportZip`，它可以接受文件列表或文件内容，并生成压缩包。

### exportZip.js

```javascript
import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * 导出压缩包
 * @param {Array} files - 文件列表，每个文件可以是一个 File 对象或 { name: string, content: string } 对象
 * @param {string} zipName - 生成的压缩包文件名
 */
export async function exportZip(files, zipName = "exported_files.zip") {
  const zip = new JSZip();

  // 遍历文件列表，添加文件到压缩包
  for (const file of files) {
    if (file instanceof File) {
      // 如果是 File 对象，直接添加
      zip.file(file.name, file);
    } else if (typeof file === "object" && file.name && file.content) {
      // 如果是 { name, content } 对象，添加内容
      zip.file(file.name, file.content);
    } else {
      console.warn("Invalid file format:", file);
    }
  }

  // 生成压缩包内容
  const content = await zip.generateAsync({ type: "blob" });

  // 保存压缩包
  saveAs(content, zipName);
}
```

## 3. 使用封装函数

### 示例 1：从 `<input type="file">` 获取文件并导出压缩包

在 Vue 2 项目中，我们可以使用 `<input type="file">` 获取用户选择的文件，并调用 `exportZip` 函数将这些文件打包成压缩包。

```html
<template>
  <div>
    <input type="file" multiple @change="handleFileChange" />
    <button @click="exportFiles">导出压缩包</button>
  </div>
</template>

<script>
import { exportZip } from "./exportZip";

export default {
  name: "ExportZipExample",
  data() {
    return {
      files: [],
    };
  },
  methods: {
    handleFileChange(event) {
      this.files = event.target.files;
    },
    exportFiles() {
      exportZip(this.files, "selected_files.zip");
    },
  },
};
</script>
```

### 示例 2：从服务器获取文件内容并导出压缩包

我们也可以从服务器获取文件内容，并将这些内容封装成对象，然后调用 `exportZip` 函数将这些文件内容打包成压缩包。

```html
<template>
  <div>
    <button @click="exportFilesFromServer">从服务器导出压缩包</button>
  </div>
</template>

<script>
import { exportZip } from "./exportZip";

export default {
  name: "ExportZipExample",
  methods: {
    async exportFilesFromServer() {
      const files = [];

      // 示例：从服务器获取文件内容
      const response1 = await fetch("https://example.com/file1.txt");
      const text1 = await response1.text();
      files.push({ name: "file1.txt", content: text1 });

      const response2 = await fetch("https://example.com/file2.txt");
      const text2 = await response2.text();
      files.push({ name: "file2.txt", content: text2 });

      // 导出压缩包
      exportZip(files, "server_files.zip");
    },
  },
};
</script>
```

## 4. 代码说明

### `exportZip` 函数

- **参数**：
  - `files`：文件列表，每个文件可以是一个 `File` 对象（如从 `<input type="file">` 获取的文件），也可以是一个包含 `name` 和 `content` 的对象（如从服务器获取的文件内容）。
  - `zipName`：生成的压缩包文件名，默认为 `exported_files.zip`。

- **功能**：
  - 使用 `JSZip` 将文件添加到压缩包中。
  - 使用 `file-saver` 将生成的压缩包保存到本地。
