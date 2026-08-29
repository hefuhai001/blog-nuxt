# Mock.js 基本语法与应用笔记

Mock.js 是一个基于 JavaScript 的模拟数据生成库，它可以帮助开发者在前端开发过程中模拟后端API，提供测试数据。Mock.js 的主要功能是生成各种类型的模拟数据，包括文本、数字、日期、数组等，同时也支持拦截请求和响应，使得前端可以在不依赖后端API的情况下进行开发和测试。

## 1. Mock 基本语法

### 生成指定字符

```js
import Mock from 'mockjs';

const data = Mock.mock({
    str: '🤣'
});

console.log(data);
```

指定字符和具体个数

```js
const data = Mock.mock({
    'str|3': '🤣'
});
```

指定字符和区间

```js
const data = Mock.mock({
    'str|3-5': '🤣'
});
```

### 生成随机字符

```js
const data = Mock.mock({
    // 一串字母
    str: '@word'
    // 一个汉字
    // str: '@cword'
});
```

指定个数

```js
const data = Mock.mock({
    // 3 个中文汉字
    'str|3': '@cword'
    // str: '@cword(3)'
});
```

指定区间

```js
const data = Mock.mock({
    // 3 到 5 个中文字符
    'str|3-5': '@cword'
    // str: '@cword(3, 5)'
});
```

### 生成标题和句子

```js
const data = Mock.mock({
    title: '@ctitle',
    sentence: '@csentence'
});
```

可以指定标题和句子的汉字长度和范围

```js
// 长度
const data = Mock.mock({
    title: '@ctitle(3)',
    sentence: '@csentence(10)'
});
```

```js
// 范围
const data = Mock.mock({
    title: '@ctitle(3, 5)',
    sentence: '@csentence(10, 15)'
});
```

### 生成段落

```js
const data = Mock.mock({
    content: '@cparagraph'
});
```

指定段落的个数和范围

```js
// 注意这里 3 代表的是 3 个段落，而不是 3 个中文字符
// 1 个句号是 1 段
const data = Mock.mock({
    content: '@cparagraph(3)'
});
```

### 生成数字

生成指定数字

```js
const data = Mock.mock({
    // number: 20,
    // 如果是数值型的 value 将失去意义，最终都表示竖线右边的 20，一般写个 1
    'number|20': 1
});
```

生成数字区间

```js
const data = Mock.mock({
    'number|1-10': 1
});
```

### 生成增量 ID

```js
for (let i = 0; i < 10; i++) {
    const data = Mock.mock({
        // 默认 1，每次增加 1
        // id: '@increment'
        // 每次增加 10
        id: '@increment(10)'
    });
    console.log(data);
}
```

### 身份证号、姓名、地址

```js
const data = Mock.mock({
    id: '@id',
    name: '@cname',
    address: '@city(true)'
});
```

### 生成图片

```js
const data = Mock.mock({
    // 大小、背景色、前景色、格式、文字
    // 注意：颜色要是十六进制，不支持关键字，例如 red
    image: "@image('200x200', '#f00', '#fff', 'jpg', 'H')"
});
```

### 生成时间

```js
const data = Mock.mock({
    time1: '@date', // 年-月-日
    time2: '@date("yyyy-MM-dd HH:mm:ss")'
});
```

### 指定数组返回的长度和范围

```js
const data = Mock.mock({
    'list|1-3': [{
        name: '@cname',
        address: '@city(true)',
        id: '@increment(1)'
    }]
});
```

## 2. Mock 拦截请求

增

POST => `/api/users`

```js
Mock.mock(/^\/api\/users/, 'post', (options) => {
    const user = JSON.parse(options.body);
    user.id = data.list.length ? data.list[data.list.length - 1].id + 1 : 1;
    data.list.push(user);
    return {
        status: 200
    };
});
```

删

DELETE => `/api/users/:id`

```js
Mock.mock(/^\/api\/user\/.+/, 'delete', (options) => {
    const id = options.url.split('/').pop();
    // !注意 id 变成了字符串
    const idx = data.list.findIndex((item) => item.id === +id);
    data.list.splice(idx, 1);
    return {
        status: 200
    };
});
```

改

PUT => `/api/users/:id`

```js
Mock.mock(/^\/api\/users\/.+/, 'put', (options) => {
    const user = JSON.parse(options.body);
    const idx = data.list.findIndex((item) => item.id === +user.id);
    data.list[idx] = user;
    return {
        status: 200
    };
});
```

查

GET => `/api/users`

```js
Mock.mock(/^\/api\/user/, 'get', (options) => {
    const {
        pagenum,
        pagesize,
        query,
        id
    } = qs.parse(options.url.split('?')[1]);
    if (id) {
        const user = data.list.find((item) => item.id === +id);
        return {
            status: 200,
            user
        };
    }
    // 1 10   0 ~ 10
    // 2 10   10 ~ 20
    const start = (pagenum - 1) * pagesize;
    const end = pagenum * pagesize;
    const total = data.list.length;
    const totalPage = Math.ceil(data.list.length / pagesize);
    let list = [];
    if (pagenum > totalPage) {
        list = [];
    } else {
        list = data.list.slice(start, end);
    }
    return {
        status: 200,
        list,
        total
    };
});
```

GET => `/api/users/:id`

```js
Mock.mock(/^\/api\/users\/.+/, 'get', (options) => {
    const id = options.url.split('/').pop();
    const user = data.list.find((item) => item.id === +id);
    return {
        status: 200,
        user
    };
});
```

## 3. Vue 中测试

`User.vue`

```vue
<template>
    <div class="users">
        <el-card class="box-card">
            <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="date" label="日期" width="180" />
                <el-table-column prop="name" label="姓名" width="130" />
                <el-table-column prop="address" label="地址" width="180" />
                <el-table-column
                    fixed="right"
                    label="操作"
                    width="80"
                    align="right"
                >
                    <template slot-scope="scope">
                        <el-button
                            @click="deleteRow(scope.row)"
                            type="text"
                            size="small"
                        >
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="q.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="q.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            >
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            tableData: [],
            q: {
                pagenum: 1,
                pagesize: 5,
                query: ''
            },
            total: 0
        };
    },
    created() {
        this.getUsers();
    },
    methods: {
        async getUsers() {
            const {
                data: { list, total }
            } = await axios.get('/api/users', {
                params: this.q
            });
            this.tableData = list;
            this.total = total;
        },
        handleSizeChange(pagesize) {
            this.q.pagesize = pagesize;
            this.getUsers();
        },
        handleCurrentChange(pagenum) {
            this.q.pagenum = pagenum;
            this.getUsers();
        },
        async deleteRow({ id }) {
            const { data } = await axios.delete(`/api/user/${id}`)
            if (data.status === 200) {
                this.getUsers();
                this.$message.success('删除成功');
            }
        }
    }
};
</script>
<style>
.box-card {
    margin: 40px auto 0;
    width: 630px;
}
.clearfix:before,
.clearfix:after {
    display: table;
    content: '';
}
.clearfix:after {
    clear: both;
}
.el-pagination {
    margin-top: 15px;
}
</style>
```

## 4. 另一种使用方式

`vue.config.js`

```js
const qs = require('querystring');
const Mock = require('mockjs');
const data = Mock.mock({
    'list|27': [
        {
            id: '@increment(1)',
            date: '@date(yyyy-MM-dd hh:mm:ss)',
            name: '@cname',
            address: '@city(true)'
        }
    ]
});
module.exports = {
    devServer: {
        before(app) {
            app.get('/api/users', (req, res) => {
                const { pagenum, pagesize, query } = qs.parse(
                    req.url.split('?')[1]
                );
                const start = (pagenum - 1) * pagesize;
                const end = pagenum * pagesize;
                const total = data.list.length;
                const totalPage = Math.ceil(data.list.length / pagesize);
                let list = [];
                if (pagenum > totalPage) {
                    list = [];
                } else {
                    list = data.list.slice(start, end);
                }
                res.send({
                    status: 200,
                    list,
                    total
                });
            });
            app.delete('/api/users/:id', (req, res) => {
                const idx = data.list.findIndex(
                    (item) => item.id === +req.params.id
                );
                data.list.splice(idx, 1);
                res.send({
                    status: 200
                });
            });
        }
    }
};
```

## 5. vite 项目

`vite.config.js`

```js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteMockServe } from "vite-plugin-mock";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteMockServe({
      mockPath: "mock",
      localEnabled: true,
    }),
  ],
});
```

`mock/index.js`

```js
import Mock from 'mockjs'
// 内存模拟数据
const arr = []
for (let i = 0; i < 10; i++) {
  arr.push({
    id: Mock.mock('@guid'),
    name: Mock.mock('@cname'),
    place: Mock.mock('@county(true)'),
  })
}
export default [
  {
    url: '/list',
    method: 'get',
    response: () => {
      return arr
    }
  },
  {
    url: '/del',
    method: 'delete',
    response: ({query}) => {
      const index = arr.findIndex((item) => item.id === query.id)
      arr.splice(index, 1)
      return { success: true }
    }
  }
]
```
