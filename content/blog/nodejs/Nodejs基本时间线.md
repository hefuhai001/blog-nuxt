## JavaScript 模块系统时间线

### 1. **CommonJS (2009年)**
- **诞生背景**: Node.js 项目启动时创建，由 **Ryan Dahl** 设计
- **目标环境**: 服务端 JavaScript（Node.js）
- **核心语法**:
  
  ```javascript
  // 导出
  module.exports = { foo: 'bar' };
  exports.foo = 'bar';
  
  // 导入
  const module = require('./module');
  ```
- **特点**: 同步加载，适合服务器环境，文件系统读取速度快
- **现状**: 仍是 Node.js 的默认模块系统，但 ESM 正在逐步取代

---

### 2. **AMD - Asynchronous Module Definition (2009年)**
- **提出者**: **James Burke**（RequireJS 的作者）
- **目标环境**: 浏览器端
- **核心语法**:
  ```javascript
  // 定义模块
  define(['dependency1', 'dependency2'], function(dep1, dep2) {
    return { /* 模块导出内容 */ };
  });
  
  // 使用模块
  require(['module'], function(module) {
    // 使用模块
  });
  ```
- **特点**: 异步加载，适合浏览器网络环境，解决回调地狱问题
- **现状**: 已基本被淘汰，被 ESM 取代

---

### 3. **CMD - Common Module Definition (2011年)**
- **提出者**: **玉伯**（阿里前端大佬，Sea.js 作者）
- **目标环境**: 浏览器端（中国国内流行）
- **核心语法**:
  ```javascript
  // 定义模块
  define(function(require, exports, module) {
    // 依赖就近声明，用时再 require
    var a = require('./a');
    a.doSomething();
    
    // 导出
    exports.foo = 'bar';
    // 或
    module.exports = { foo: 'bar' };
  });
  ```
- **特点**: 
  - 推崇"依赖就近"原则（用到时才 require）
  - 与 CommonJS 语法相似，降低学习成本
  - 异步加载，适合浏览器
- **现状**: Sea.js 已停止维护，CMD 基本退出历史舞台

> **AMD vs CMD 的区别**: AMD 是"依赖前置"（提前声明所有依赖），CMD 是"依赖就近"（用时再 require）。两者都是浏览器端的异步模块方案，只是风格不同。

---

### 4. **UMD - Universal Module Definition (2011-2012年)**
- **诞生背景**: 为了解决"一种代码，多端运行"的问题
- **目标**: 让同一份代码在 **AMD、CommonJS、全局变量** 三种环境中都能运行
- **核心思想**: 运行时检测环境，自动适配
- **典型代码结构**:
  ```javascript
  (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD 环境
      define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
      // CommonJS 环境
      module.exports = factory(require('jquery'));
    } else {
      // 浏览器全局变量
      root.returnExports = factory(root.jQuery);
    }
  }(this, function ($) {
    // 模块实际代码
    return { /* 导出内容 */ };
  }));
  ```
- **特点**: 兼容性极强，是库作者的首选方案
- **现状**: 仍广泛使用于第三方库（如 jQuery、Lodash 等），但随着 ESM 普及，重要性在下降

---

### 5. **ES Modules / ESM (ES6/ES2015, 2015年发布)**
- **标准化**: TC39 正式纳入 ECMAScript 标准
- **目标环境**: 浏览器 + Node.js（现代环境统一）
- **核心语法**:
  ```javascript
  // 导出
  export const foo = 'bar';
  export default function() {};
  
  // 导入
  import { foo } from './module.js';
  import module from './module.js';
  ```
- **特点**: 
  - 静态分析（编译时确定依赖关系）
  - 支持 Tree Shaking（摇树优化）
  - 原生浏览器支持（`<script type="module">`）
  - Node.js 13.2+ 开始稳定支持
- **现状**: **现代前端的标准方案**，正在全面取代其他模块系统

---

## 📊 完整时间线总结

| 年份          | 模块规范             | 作者/组织                | 主要环境                  | 现状                     |
| ------------- | -------------------- | ------------------------ | ------------------------- | ------------------------ |
| **2009**      | **CommonJS**         | Ryan Dahl / Node.js 团队 | Node.js 服务端            | ⚠️ 逐步被 ESM 取代        |
| **2009**      | **AMD**              | James Burke / RequireJS  | 浏览器（旧时代）          | ❌ 基本淘汰               |
| **2011**      | **CMD**              | 玉伯 / Sea.js            | 浏览器（中国流行）        | ❌ 已停止维护             |
| **2011-2012** | **UMD**              | 社区共识                 | 跨环境兼容库              | ⚠️ 仍用于旧库，新项目减少 |
| **2015**      | **ES Modules (ESM)** | TC39 / ECMAScript 标准   | 浏览器 + Node.js 现代环境 | ✅ **当前标准，推荐使用** |

---

## 🎯 现代前端的最佳实践

1. **新项目**: 直接使用 **ESM**（`import/export`）
2. **Node.js 项目**: 使用 `.mjs` 扩展名或在 `package.json` 中设置 `"type": "module"`
3. **构建工具**（Webpack/Vite/Rollup）: 内部统一转换为 ESM 处理
4. **发布 npm 包**: 同时提供 `ESM` + `CommonJS` 双格式（通过 `exports` 字段配置）
5. **UMD**: 仅在需要兼容 IE 或非常老旧环境时使用

---

## 💡 关键理解

- **CommonJS vs ESM 的核心区别**:
  - CommonJS: 动态运行时加载，`require` 可以放在任何地方
  - ESM: 静态编译时分析，`import` 必须在顶层，支持 Tree Shaking

- **CMD 和 AMD 都是浏览器端的异步方案**，CMD 更接近 CommonJS 语法风格，AMD 更强调依赖前置

- **UMD 不是独立的模块系统**，而是一种"兼容性包装模式"，让代码在各种环境中都能跑

希望这个时间线能帮你彻底理清 JavaScript 模块化的演进脉络！