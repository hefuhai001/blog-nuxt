# Node.js核心命令与工具：提升开发效率的实用指南

Node.js是一个基于Chrome V8引擎的开源服务器端JavaScript运行环境，它允许开发者使用JavaScript编写服务器端代码，实现高效的I/O操作和网络通信。Node.js的异步、事件驱动的特性使其非常适合构建可扩展的网络应用。除了内置模块，Node.js的强大之处在于其丰富的生态系统，通过npm（Node Package Manager）可以轻松安装和管理成千上万的第三方模块。

Node.js 提供了一系列的命令行工具和内置模块，使得开发者能够轻松地执行各种任务。以下是一些常用的 Node.js 命令和功能：

### 1. `node` 命令

这是启动 Node.js 应用程序的基本命令。它后面通常跟随要执行的 JavaScript 文件名。

```bash
node app.js
```

### 2. `npm` 命令

Node Package Manager（npm）是 Node.js 的包管理器，用于安装和管理 Node.js 模块。

- 安装全局模块：

  ```bash
  npm install -g <package-name>
  ```

- 安装项目依赖：

  ```bash
  npm install <package-name> --save
  ```

- 更新项目依赖：

  ```bash
  npm update
  ```

- 卸载模块：

  ```bash
  npm uninstall <package-name>
  ```

- 初始化 npm 项目：

  ```bash
  npm init
  ```

### 3. `npx` 命令

`npx` 是 npm 的一个工具，用于执行 Node 包的二进制文件。它允许你运行 Node.js 包的脚本，而无需全局安装它们。

```bash
npx create-react-app my-app
```

### 4. `nodemon` 命令

`nodemon` 是一个工具，用于在文件更改时自动重启 Node.js 应用程序。它通常用于开发过程中，以便快速看到更改的效果。

```bash
nodemon app.js
```

### 5. `forever` 命令

`forever` 是一个 Node.js 模块，用于确保应用程序持续运行。如果应用程序崩溃，它会自动重启。

```bash
forever start -l /var/log/forever -p 3000 app.js
```

### 6. `pm2` 命令

`pm2` 是一个进程管理器，用于保持应用程序的持续运行、负载均衡和日志记录。

- 安装 pm2：

  ```bash
  npm install -g pm2
  ```

- 启动应用程序：

  ```bash
  pm2 start app.js
  ```

- 查看应用程序状态：

  ```bash
  pm2 status
  ```

- 停止应用程序：

  ```bash
  pm2 stop app.js
  ```

### 7. `eslint` 命令

`eslint` 是一个 JavaScript 代码质量工具，用于检测代码中的错误和不一致。

```bash
eslint app.js
```

### 8. `node-inspector` 命令

`node-inspector` 是一个调试工具，提供了一个图形界面，用于调试 Node.js 应用程序。

```bash
node-inspector
```

### 9. `mocha` 命令

`mocha` 是一个流行的 JavaScript 测试框架，用于编写和运行测试。

```bash
mocha test.js
```

### 10. `webpack` 命令

`webpack` 是一个模块打包器，用于将多个模块和资源打包成少数几个文件，通常用于前端资源的打包。

```bash
webpack --watch
```
