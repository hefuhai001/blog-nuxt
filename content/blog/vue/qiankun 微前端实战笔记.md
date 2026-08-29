# 把 Vue2 项目“黑盒”嵌进 Vue3：qiankun 微前端实战笔记

> 场景：  
> - 老项目：Vue2 已上线，源码动不了，只有打包产物。  
> - 新项目：Vue3 + Vite / Webpack，想“无痛”把老项目收编成一个页面/路由。  
> - 目标：**不改 Vue2 一行业务代码**，还能像普通组件一样按需加载、双向传参。

下面记录一套亲测可行的方案，从 0 到部署，30 分钟搞定。

---

## 一、思路：为什么选微前端？

| 方案    | 是否改源码 | 样式隔离 | 重复打包 | 结论               |
| ------- | ---------- | -------- | -------- | ------------------ |
| iframe  | 否         | ✅        | ❌        | 宽高/刷新/通信难受 |
| npm 包  | 必须       | ❌        | ✅        | 改到死             |
| qiankun | 否         | ✅        | ❌        | **最香**           |

qiankun 把旧项目当成“子应用”，主应用只要一个 `<div id="subapp-view"></div>` 就能动态加载，完美符合“黑盒”需求。

---

## 二、整体架构图

```
Vue3 主应用（qiankun）
├─ 路由 /vue2  →  加载子应用
└─ props 下发数据 & 回调
         ↑
         └----- Vue2 子应用（独立部署）
                接收 props 并可回调主应用
```

---

## 三、子应用（Vue2）—— 只加 3 件事

1. 新增 `public-path.js`（避免资源 404）
```js
// public-path.js
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

2. `main.js` 导出生命周期
```js
import './public-path'
import Vue from 'vue'
import App from './App.vue'
import router from './router'

let instance = null
function render(props = {}) {
  const { container } = props
  instance = new Vue({ router, render: h => h(App) })
           .$mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) render()

// 微前端生命周期
export async function bootstrap() {}
export async function mount(props) { render(props) }
export async function unmount() { instance.$destroy() }
```

3. `vue.config.js` 配置umd + 跨域
```js
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: '/vue2-child/',
  outputDir: 'dist',
  configureWebpack: {
    output: {
      library: 'vue2App',
      libraryTarget: 'umd',
    }
  },
  devServer: {
    port: 7100,
    headers: { 'Access-Control-Allow-Origin': '*' }
  }
})
```

> 业务代码 **一行不动**，打完包扔到 nginx 即可。

---

## 四、主应用（Vue3）—— 5 行代码接入

1. 装依赖  
```bash
npm i qiankun
```

2. 注册子应用（`src/qiankun/index.js`）
```js
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'vue2App',
    entry: '//localhost:7100',        // 也可换成生产域名
    container: '#subapp-view',        // 挂载点
    activeRule: '/vue2',              // 触发路径
    props: {                          // ← 传参
      userName: 'Alice',
      userId: 123,
      onLogin: (data) => console.log('子应用登录了', data)
    }
  }
])

start({ sandbox: { strictStyleIsolation: true } })   // 样式隔离
```

3. 路由占位（`App.vue`）
```vue
<template>
  <router-link to="/vue2">进入 Vue2 老系统</router-link>
  <div id="subapp-view" />
</template>
```

4. 菜单/路由照常配，访问 `/vue2` 时 qiankun 会自动拉取 `//localhost:7100` 的资源并渲染到 `#subapp-view`。

---

## 五、Props 双向通信示例

### ① 主应用 → 子应用（数据）
已在注册时下发 `userName / userId`，子应用直接读取：

```js
// 子组件 any.vue
computed: {
  userName() { return this.$root.$mainProps?.userName }
}
```

> 小技巧：在 `mount` 里把 `props` 挂到 `Vue.prototype.$mainProps`，全局都能取到。

### ② 子应用 → 主应用（事件）
主应用把回调函数通过 props 传下来，子应用按需调用：

```js
methods: {
  doLogin() {
    this.$mainProps?.onLogin?.({ token: 'abc123' })
  }
}
```

### ③ 全局跨层级通信（可选）
qiankun 自带 `initGlobalState`：

```js
// 主应用
import { initGlobalState } from 'qiankun'
const actions = initGlobalState({ count: 0 })
actions.onGlobalStateChange((n, o) => console.log('主收到', n))

// 子应用
export async function mount(props) {
  props.onGlobalStateChange((n, o) => console.log('子收到', n))
  props.setGlobalState({ count: 1 })
}
```

---

## 六、打包 & 部署要点

1. 子应用 dist 扔到 nginx，location `/vue2-child/` 指向静态目录。  
2. 主应用同样部署，nginx 加反向代理：

```nginx
location /vue2-child/ {
  proxy_pass http://static-server/vue2-child/;
  add_header Access-Control-Allow-Origin *;
}
```

3. 若主/子不同域，子应用 `devServer.headers` 已开 CORS，生产同样加 `Access-Control-Allow-Origin` 即可。

---

## 七、常见坑速查

| 现象         | 原因                         | 解决                               |
| ------------ | ---------------------------- | ---------------------------------- |
| 子应用 404   | publicPath 未配              | 用 `__webpack_public_path__`       |
| 样式冲突     | 未开沙箱                     | `strictStyleIsolation: true`       |
| 路由跳转失败 | history 模式 basename 不一致 | 子应用 `base: '/vue2'`             |
| 热更新失效   | webpack5 需开 `allowedHosts` | 写 `devServer.allowedHosts: 'all'` |

---
