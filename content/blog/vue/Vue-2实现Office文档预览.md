# Vue2实现Office文档（docx、xlsx、pdf）在线预览

在现代的Web应用开发中，实现Office文档（如docx、xlsx、pdf）的在线预览功能是一个常见的需求。这不仅可以提升用户体验，还能使文档的共享和协作更加便捷。本文将介绍如何在Vue2项目中使用`@vue-office/docx`、`@vue-office/excel`和`@vue-office/pdf`这三个库来实现docx、xlsx和pdf文件的在线预览。

`@vue-office/docx`、`@vue-office/excel`和`@vue-office/pdf`的官方文档及相关资源如下：
- **GitHub主页**：[https://github.com/501351981/vue-office](https://github.com/501351981/vue-office)  ，这是该组件库的官方GitHub仓库，你可以在这里查看项目的源代码、提交问题、参与贡献等。
- **GitHub Pages文档**：[https://501351981.github.io/vue-office/examples/docs/guide/](https://501351981.github.io/vue-office/examples/docs/guide/)  ，这里提供了详细的使用指南和示例，包括如何安装、如何使用网络地址预览、如何设置组件的样式等。
- **npm页面**：[https://www.npmjs.com/package/@vue-office/pdf](https://www.npmjs.com/package/@vue-office/pdf)  ，在npm页面中可以查看各个包的版本信息、安装命令、依赖关系等。
- **其他参考资料**：
    - 博客园上有一篇关于在vue2/3中使用`@vue-office/docx`预览docx文件的文章，介绍了使用示例和相关代码。
    - CSDN博客上也有相关文章，对`vue-office`组件库进行了介绍，并提供了使用示例。
    - 简书上也有文章介绍了如何在vue中使用`vue-office`实现docx、excel、pdf等文件的预览。

## 项目背景

在许多业务场景中，用户需要在Web页面上直接查看和操作Office文档，而无需下载到本地再打开。例如，在企业内部的文档管理系统、在线教育平台、项目协作工具等场景中，这种需求尤为常见。通过在前端实现文档的在线预览，可以减少用户操作步骤，提高工作效率，同时也能更好地保护文档的安全性，避免文档在传输过程中被篡改或泄露。

## 技术选型

为了实现这一功能，我们选择了`@vue-office/docx`、`@vue-office/excel`和`@vue-office/pdf`这三个库。它们都是基于Vue.js的开源库，专门用于在Vue项目中实现Office文档的在线预览。这些库封装了底层的文档解析和渲染逻辑，提供了简洁易用的API，能够方便地与Vue项目集成。

## 实现步骤

### 1. 安装依赖

在项目根目录下运行以下命令，安装所需的库：

```bash
npm install @vue-office/docx @vue-office/excel @vue-office/pdf
```

### 2. 配置Vue项目

在`vue.config.js`文件中配置代理，以便在开发环境中能够正确访问后端接口。例如：

```javascript
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:9090',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        },
        client: {
            overlay: false, // 解决全屏报错
        },
    }
})
```

### 3. 实现docx文件预览

在`src/components/VueOfficeDocxDemo.vue`文件中，实现docx文件的预览功能：

```vue
<template>
    <div>
        <vue-office-docx :src="docx" style="height: 100vh;" @rendered="renderedHandler" @error="errorHandler" />
    </div>
</template>

<script>
// 引入VueOfficeDocx组件
import VueOfficeDocx from '@vue-office/docx'
// 引入相关样式
import '@vue-office/docx/lib/index.css'

export default {
    name: "VueOfficeDocxDemo",
    components: {
        VueOfficeDocx
    },
    data() {
        return {
            docx: 'http://127.0.0.1:9000/senior-valve-hub/tutorials/%E6%B5%8B%E8%AF%953.0.docx', // 设置文档地址
        }
    },
    methods: {
        renderedHandler() {
            console.log("渲染完成")
        },
        errorHandler() {
            console.log("渲染失败")
        }
    }
};
</script>
```

### 4. 实现xlsx文件预览

在`src/components/VueOfficeExcelDemo.vue`文件中，实现xlsx文件的预览功能：

```vue
<template>
    <div>
        <vue-office-excel :src="excel" :options="options" style="height: 100vh;" @rendered="renderedHandler"
            @error="errorHandler" />
    </div>
</template>

<script>
// 引入VueOfficeExcel组件
import VueOfficeExcel from '@vue-office/excel'
// 引入相关样式
import '@vue-office/excel/lib/index.css'

export default {
    name: "VueOfficeExcelDemo",
    components: {
        VueOfficeExcel
    },
    data() {
        return {
            options: {
                xls: true, // 预览xlsx文件设为false；预览xls文件设为true
                minColLength: 10, // excel最少渲染多少列
                minRowLength: 10, // excel最少渲染多少行
                widthOffset: 10, // 单元格宽度偏移量
                heightOffset: 10, // 单元格高度偏移量
                beforeTransformData: (workbookData) => { return workbookData }, // 数据预处理
                transformData: (workbookData) => { return workbookData }, // 数据转换
            },
            excel: 'http://127.0.0.1:9000/senior-valve-hub/tutorials/example.xlsx', // 设置文档地址
        }
    },
    methods: {
        renderedHandler() {
            console.log("渲染完成")
        },
        errorHandler() {
            console.log("渲染失败")
        }
    }
};
</script>
```

### 5. 实现pdf文件预览

在`src/components/VueOfficePdfDemo.vue`文件中，实现pdf文件的预览功能：

```vue
<template>
    <vue-office-pdf :src="pdf" @rendered="renderedHandler" @error="errorHandler" />
</template>

<script>
// 引入VueOfficePdf组件
import VueOfficePdf from '@vue-office/pdf'

export default {
    name: "VueOfficePdfDemo",
    components: {
        VueOfficePdf
    },
    data() {
        return {
            pdf: 'http://127.0.0.1:9000/senior-valve-hub/tutorials/example.pdf', // 设置文档地址
        }
    },
    methods: {
        renderedHandler() {
            console.log("渲染完成")
        },
        errorHandler() {
            console.log("渲染失败")
        }
    }
};
</script>
```

### 6. 在主页面中引入组件

在`src/App.vue`文件中，引入上述三个组件，并在页面中展示：

```vue
<template>
    <div id="app">
        <h1>Vue2 Office文档预览</h1>
        <vue-office-docx-demo />
        <vue-office-excel-demo />
        <vue-office-pdf-demo />
    </div>
</template>

<script>
import VueOfficeDocxDemo from './components/VueOfficeDocxDemo.vue'
import VueOfficeExcelDemo from './components/VueOfficeExcelDemo.vue'
import VueOfficePdfDemo from './components/VueOfficePdfDemo.vue'

export default {
    name: 'App',
    components: {
        VueOfficeDocxDemo,
        VueOfficeExcelDemo,
        VueOfficePdfDemo
    }
}
</script>

<style>
#app {
    text-align: center;
    margin-top: 60px;
}
</style>
```
