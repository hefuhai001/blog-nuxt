# React基本使用

## 1.安装

1.网页下载

```bat
npm i react react-dom
```

2.全局安装脚手架

```bat
npm i -g create-react-app
```


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

## 4.快速开始

```js
import React from 'react';
import ReactDom from 'react-dom';
```

## 5. 安装antd，创建项目

```bat
1.全局
npm install antd-init -g

antd-init

2.项目
npm install antd --save
```

## 6. 安装react-router-dom

```bat
npm install react-router-dom
```

```js
//index.js
import Router from './router';
//router/index.js
import App from '../App';
import List from "../pages/List/List.jsx";
import Edit from "../pages/Edit/Edit.jsx";
import Means from "../pages/Means/Means.jsx";
import Login from "../pages/Login/Login.jsx";
import Register from "../pages/Register/Register.jsx";
import { BrowserRouter as BaseRouter, Routes, Route } from "react-router-dom";

const Router = () => (
  <BaseRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="/list" element={<List />}></Route>
        <Route path="/edit" element={<Edit />}></Route>
        <Route path="/means" element={<Means />}></Route>
      </Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/register" element={<Register />}></Route>
    </Routes>
  </BaseRouter>
);
export default Router
```

## 7. 暴露webpack

```bat
git add .

git commit -m '解包前'

npm run eject
```

## 8. 配置less

webpack.config.js
查找sasaModuleRegex

```js
{
	test:/\.less$/,
	use:getStyleLoaders(
		{
			//暂不配置
		},
		'less-loader'
	),
},
```

```bat
npm install less-loader
```

## 9.使用antd组件

https://ant.design/components/button-cn

