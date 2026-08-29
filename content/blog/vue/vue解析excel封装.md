# Vue3 Excel 导出导入封装

## useExcel.js

```javascript
import * as XLSX from 'xlsx';

export function useExcel() {
    // 导出Excel
    async function exportToExcel(data, filename = 'data.xlsx') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        return XLSX.writeFile(wb, filename);
    }

    // 导入Excel
    function importExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                resolve(json);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsBinaryString(file);
        });
    }

    // 将数据转换为Excel二进制字符串
    function convertDataToExcel(data) {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        return XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    }

    // 导出Excel并下载（自定义下载逻辑）
    async function exportToExcelAndDownLoad(data, filename = 'data.xlsx') {
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
        const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    return { exportToExcel, importExcel, convertDataToExcel, exportToExcelAndDownLoad };
}
```

## 使用示例

```vue
<template>
  <div>
    <button @click="exportData">导出Excel</button>
    <input type="file" @change="importData" />
  </div>
</template>

<script setup>
import { useExcel } from './utils/useExcel';

const { exportToExcel, importExcel } = useExcel();

const exportData = async () => {
  const data = [
    { name: 'John', age: 30, city: 'New York' },
    { name: 'Mike', age: 25, city: 'Chicago' }
  ];
  await exportToExcel(data, '用户数据.xlsx');
};

const importData = async (event) => {
  const file = event.target.files[0];
  const data = await importExcel(file);
  console.log(data);
};
</script>
```

## 依赖安装

```bash
npm install xlsx 
```