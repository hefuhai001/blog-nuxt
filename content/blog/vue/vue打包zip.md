# Vue3 ZIP 压缩下载封装

## useZip.js

```javascript
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useExcel } from './useExcel';

export function useZip() {
    const { convertDataToExcel } = useExcel();

    // 数据转Excel打包ZIP
    const createZipAndDownload = (data, zipName = 'data.zip') => {
        const zip = new JSZip();
        const excelData = convertDataToExcel(data);
        const s2ab = (s) => {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i !== s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        };
        const arrayBuffer = s2ab(excelData);
        zip.file('data.xlsx', arrayBuffer, { binary: true });
        
        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, zipName);
        });
    };

    // 多文件打包ZIP
    function zipFiles(files, zipName = 'archive.zip') {
        const zip = new JSZip();
        files.forEach(file => {
            if (file.content instanceof Blob) {
                zip.file(file.name, file.content, { binary: true });
            } else {
                const blob = new Blob([file.content], { type: 'application/octet-stream' });
                zip.file(file.name, blob, { binary: true });
            }
        });

        zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, zipName);
        });
    }

    return { createZipAndDownload, zipFiles };
}
```

## 使用示例

```vue
<template>
  <div>
    <button @click="exportDataAsZip">数据打包ZIP</button>
    <button @click="exportPhotoAsZip">图片打包ZIP</button>
  </div>
</template>

<script setup>
import { useZip } from './utils/useZip';

const { createZipAndDownload, zipFiles } = useZip();

// 导出数据为Excel并打包
const exportDataAsZip = () => {
  const data = [
    { name: 'John', age: 30, city: 'New York' },
    { name: 'Mike', age: 25, city: 'Chicago' }
  ];
  createZipAndDownload(data, '数据备份.zip');
};

// 下载网络图片并打包
const exportPhotoAsZip = async () => {
  const photoUrl = 'https://example.com/photo.jpg';
  const response = await fetch(photoUrl);
  const blob = await response.blob();
  
  const files = [{ name: 'photo.jpg', content: blob }];
  zipFiles(files, '图片打包.zip');
};
</script>
```

## 依赖安装

```bash
npm install jszip file-saver
```