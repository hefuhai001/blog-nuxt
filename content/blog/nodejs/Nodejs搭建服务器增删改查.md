# Nodejs搭建服务器增删改查和登录操作实例

在 node.js 中创建一个服务器非常简单，只需要使用 node.js 为我们提供的 http 模块及相关 API 即可创建一个麻雀虽小但五脏俱全的web 服务器，相比 Java/Python/Ruby 搭建web服务器的过程简单的很。

## 1.数据库
数据库名：crud_demo
表名：user
字段：id，name，sex，age
## 2.代码

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

## 3.运行
```bat
node 文件名字
```
