## Node.js快速入门：搭建基础Web服务器与实现CRUD及登录功能

在Node.js中，创建一个功能完备的Web服务器如同搭积木般简单。借助Node.js的`http`模块和一些强大的第三方库，我们可以快速搭建起一个响应灵敏的服务器。本教程将详细介绍如何使用Node.js进行数据库操作和用户认证，包括创建数据库、实现CRUD操作和登录验证等关键步骤。

## 技术栈介绍

### Node.js

Node.js是一个跨平台的运行时环境，它允许您在服务器上运行JavaScript代码。它基于事件驱动和非阻塞I/O模型，这使得Node.js非常适合处理大量并发连接。

### Express

Express是一个灵活的Node.js Web应用框架，提供了一系列强大的功能，用于构建单页、多页以及混合Web应用。它简化了路由、中间件管理和错误处理等常见Web开发任务。

### mysql

mysql是一个Node.js的客户端库，用于与MySQL数据库进行交互。它提供了一个简单易用的API，用于执行SQL查询和接收数据库响应。

### body-parser

body-parser是Express的一个中间件，用于解析请求体中的JSON和URL编码的数据。它使得处理POST请求和解析复杂数据变得更加容易。

### cors

cors（Cross-Origin Resource Sharing）是一个Node.js的中间件，用于实现跨源资源共享。它允许您指定哪些域名可以访问您的资源，从而避免了跨域请求问题。

## 实现步骤

### 环境搭建

首先，确保您的计算机上安装了Node.js和npm（Node Package Manager），这是Node.js开发的基础工具集。

### 项目初始化

在您的工作目录中，创建一个新的文件夹用于存放项目文件，并在该目录下运行`npm init`命令来初始化一个新的Node.js项目。

### 安装依赖

通过运行`npm install express mysql body-parser cors`命令，安装项目所需的第三方库：Express用于Web框架，`mysql`用于数据库操作，body-parser用于解析请求体，`cors`用于处理跨域请求。

### 配置数据库

首先，我们需要设置一个名为`crud_demo`的数据库，其中包含一个`user`表，字段包括`id`、`name`、`sex`和`age`。

### 编写服务器代码

在项目目录中，创建一个JavaScript文件，例如`server.js`，并开始编写服务器代码。使用`const express = require('express')`引入Express模块，并实例化一个Express应用。

```js
//引用mysql依赖
const mysql = require("mysql");
//引用express依赖
const express = require("express");
//引用body-parser 解析post传参
const bodyParser = require("body-parser");
//express实例化
const app = express();
//引用 cors
const cors = require("cors");
const { json } = require("body-parser");
//关闭Form表单传值
app.use(bodyParser.urlencoded({ extended: false }));
//使用Json传值
app.use(bodyParser.json());
//使用cors 解决跨域问题
app.use(cors());
```



### 配置数据库连接

使用`mysql`模块创建一个连接到MySQL数据库的客户端实例，并提供必要的连接信息。

```js
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",//修改成自己的密码
  database: "crud_demo",//修改成自己的数据库名
});
// 建立数据库连接
connection.connect();
```



### 解析请求体

使用`body-parser`中间件来解析传入的JSON和URL编码的数据。

### 处理跨域请求

通过`cors`中间件配置，允许跨域请求访问您的服务器。

### 实现CRUD操作

为Express应用定义路由，实现对数据库的增删改查操作。

#### Select操作

创建一个GET路由，用于从数据库中检索并返回用户数据。

```js
/**
 * select
 * http://127.0.0.1:3000/api
 */
app.get("/api", (req, res) => {
  let sql = "select * from user";
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    // return results;
    return res.json(results);
  });
});
```



#### Delete操作

创建一个GET路由，接受用户ID作为参数，并从数据库中删除对应记录。

```js
/**
 * delete
 * http://127.0.0.1:3000/api/delete/4
 */
app.get("/api/delete/:id", (req, res) => {
  console.log(req.params);
  console.log(req.params.id);
  let delSql = `DELETE FROM user where id= ${parseInt(req.params.id)}`;
  console.log(delSql);
  connection.query(delSql, function (error, results) {
    if (error) throw error;
    console.log(results);
    // return results;
    return res.json(results);
  });
});
```



#### Insert操作

创建一个GET路由，接受用户信息作为查询参数，并将其插入数据库。

```js
/**
 * insert
 * http://localhost:3000/api/insert?id=4&name=xiaohe&sex=%E7%94%B7&age=19
 */
app.get("/api/insert", (req, res) => {
  console.log(req.query);
  console.log(req.body);
  console.log(req.query.id);
  let insertSql = `insert into user VALUES(?,?,?,?)`;
  console.log(insertSql);
  let data = [req.query.id, req.query.name, req.query.sex, req.query.age];
  connection.query(insertSql, data, function (error, results) {
    if (error) throw error;
    console.log(results);
    // return results;
    return res.json(results);
  });
});
```



#### Update操作

创建一个GET路由，接受用户ID和更新信息作为查询参数，并更新数据库中的记录。

```js
/**
 * update
 * http://localhost:3000/api/update?id=4&name=%E7%99%BE%E5%BA%A6&sex=%E7%94%B7&age=999
 */
app.get("/api/update", (req, res) => {
  console.log(req.query);
  console.log(req.body);
  console.log(req.query.id);
  let updateSql = `update user set name = ?, sex = ?, age = ? where id = ?`;
  console.log(updateSql);
  let data = [req.query.name, req.query.sex, req.query.age, req.query.id];
  connection.query(updateSql, data, function (error, results) {
    if (error) throw error;
    console.log(results);
    // return results;
    return res.json(results);
  });
});
```



#### 实现登录功能

创建一个GET路由，用于接收登录请求，验证用户凭据，并返回登录结果。

```js
/**
 * login
 * http://127.0.0.1:3000/api/login?name="1234567890"&pwd="123456"
 */
app.get("/api/login", (req, res) => {
  let loginSql = `select * from user where name = ? and pwd = ?`;
  console.log(loginSql);
  let data = [req.query.name, req.query.pwd];
  connection.query(loginSql, data, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    // return results;
    if (results.length) {
      console.log("登录成功");
    } else {
      console.log("账号不存在");
    }
    return res.json(results);
  });
});
```



## 启动服务器

使用`app.listen()`方法启动Express服务器，并指定端口号，例如3000。

## 全部代码

```js
//引用mysql依赖
const mysql = require("mysql");
//引用express依赖
const express = require("express");
//引用body-parser 解析post传参
const bodyParser = require("body-parser");
//express实例化
const app = express();
//引用 cors
const cors = require("cors");
const { json } = require("body-parser");
//关闭Form表单传值
app.use(bodyParser.urlencoded({ extended: false }));
//使用Json传值
app.use(bodyParser.json());
//使用cors 解决跨域问题
app.use(cors());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",//修改成自己的密码
  database: "crud_demo",//修改成自己的数据库名
});
// 建立数据库连接
connection.connect();

/**
 * select
 * http://127.0.0.1:3000/api
 */
app.get("/api", (req, res) => {
  let sql = "select * from user";
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    // return results;
    return res.json(results);
  });
});

/**
 * delete
 * http://127.0.0.1:3000/api/delete/4
 */
app.get("/api/delete/:id", (req, res) => {
  console.log(req.params);
  console.log(req.params.id);
  let delSql = `DELETE FROM user where id= ${parseInt(req.params.id)}`;
  console.log(delSql);
  connection.query(delSql, function (error, results) {
    if (error) throw error;
    console.log(results);
    // return results;
    return res.json(results);
  });
});

/**
 * insert
 * http://localhost:3000/api/insert?id=4&name=xiaohe&sex=%E7%94%B7&age=19
 */
app.get("/api/insert", (req, res) => {
  console.log(req.query);
  console.log(req.body);
  console.log(req.query.id);
  let insertSql = `insert into user VALUES(?,?,?,?)`;
  console.log(insertSql);
  let data = [req.query.id, req.query.name, req.query.sex, req.query.age];
  connection.query(insertSql, data, function (error, results) {
    if (error) throw error;
    console.log(results);
    // return results;
    return res.json(results);
  });
});

/**
 * update
 * http://localhost:3000/api/update?id=4&name=%E7%99%BE%E5%BA%A6&sex=%E7%94%B7&age=999
 */
app.get("/api/update", (req, res) => {
  console.log(req.query);
  console.log(req.body);
  console.log(req.query.id);
  let updateSql = `update user set name = ?, sex = ?, age = ? where id = ?`;
  console.log(updateSql);
  let data = [req.query.name, req.query.sex, req.query.age, req.query.id];
  connection.query(updateSql, data, function (error, results) {
    if (error) throw error;
    console.log(results);
    // return results;
    return res.json(results);
  });
});

/**
 * login
 * http://127.0.0.1:3000/api/login?name="1234567890"&pwd="123456"
 */
app.get("/api/login", (req, res) => {
  let loginSql = `select * from user where name = ? and pwd = ?`;
  console.log(loginSql);
  let data = [req.query.name, req.query.pwd];
  connection.query(loginSql, data, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    // return results;
    if (results.length) {
      console.log("登录成功");
    } else {
      console.log("账号不存在");
    }
    return res.json(results);
  });
});

app.listen(3000, () => {
  console.log("服务器启动成功...");
});
```
