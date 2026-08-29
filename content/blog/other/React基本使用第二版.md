# React基本使用第二版

## 1.安装

1.网页下载

```bat
npm i react react-dom
```

2.全局安装脚手架

```bat
npm i -g create-react-app
``

## 2.创建项目

1.直接创建项目

```bat
npx create-react-app my-app
```

2.npm创建项目

```bat
npx create-react-app my-app --use-npm
```

3.脚手架创建项目

```bat
create-react-app my-app
```

## 3.运行、构建、测试、打包、

```bat
npm start

npm run build

npm test

npm run eject
```



## 4.项目结构

一、node_modules(依赖目录)

二、public(公共资源目录)

三、src(源文件目录)

​		1.index.js(项目的入口文件)

​		2.app.js(从入口文件出获取到的app实例文件)

​		//  需要手动创建

​		3.api目录

​		4.assets目录

​		5.components目录

​		6.config目录

​		7.utils目录

​		8.views目录



## 5.快捷键

```js
// 1.rfc --- 快速生成页面框架代码

import React from 'react'

export default function Layout() {
  return (
    <div>Layout</div>
  )
}
```



## 6.配置eslint

在package中，可以先把eslint配置的这段代码删掉，以免不必要的报错。

```js
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
```

## 7. 安装和引入antd

```bat
1.全局
npm install antd-init -g

antd-init

2.项目
npm install antd --save
```

```js
//index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "antd/dist/reset.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
```

## 8. 使用antd组件

[antd官网]: https://ant.design/components/button-cn	"antd"



## 7. 安装react-router-dom

```bat
npm install react-router-dom
```



## 9.配置路由

react项目的入口文件为index.js，我一般把路由直接写在app.js中，也可以新建一个router文件夹下写。

```js
//app.js
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./views/Layout/Layout";
import Login from "./views/Login/Login";
import Sale from "./views/Sale/Sale";
import Detail from "./views/Detail/Detail";
import User from "./views/User/User";
import Role from "./views/Role/Role";
import Room from "./views/Room/Room";
import Type from "./views/Type/Type";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/layout" element={<Layout />}>
          <Route path="sale" element={<Sale />}></Route>
          <Route path="detail" element={<Detail />}></Route>
          <Route path="role" element={<Role />}></Route>
          <Route path="user" element={<User />}></Route>
          <Route path="room" element={<Room />}></Route>
          <Route path="type" element={<Type />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

```js
//index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "antd/dist/reset.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
```



## 10.二级页面路由和重定向

```js
// 1.在需要跳转的
import { Outlet } from "react-router-dom";

// 2.在需要路由的地方写上Outlet标签
<Outlet></Outlet>

// 3.使用如下生命周期钩子函数将页面在渲染前跳转到重定向位置
  useEffect(() => {
    setCurrent("1-1");
    navigate("/layout/sale");
  }, []);
```



## 11.页面跳转

```js
// 1.在需要跳转的页面导入如下，跳转到二级页面时一般配合使用。
import { useNavigate, Outlet } from "react-router-dom";

// 2.对方法进行适当改造，方便使用。
let navigate = useNavigate();

// 3.编写跳转页面的方法，跳转页面。
const clickMenu = (e) => {
    setCurrent(e.key);
    switch (e.key) {
      case "1-1":
        navigate("/layout/sale");
        break;
      case "1-2":
        navigate("/layout/detail");
        break;
      case "2-1":
        navigate("/layout/role");
        break;
      case "2-2":
        navigate("/layout/user");
        break;
    }
  };
  
  // 方法触发位置在这里
          <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1-1"]}
          items={asideMenu}
          onClick={clickMenu}
          selectedKeys={current}
        />
```



## 12.hooks

[Hooks]: https://zh-hans.react.dev/reference/react	"React Hook"
