# Ajax技术

## 一. 初识前后端交互

### **传统网站的问题：**

- 为了获取数据，需要重新加载，浪费资源，增加等待时间，性能不好
- 验证表单过程中，一项内容不合格，页面需要重新加载，体验不好

### **解决问题:**     

- `ajax` 全名 `async javascript and XML`
- 是前后台交互的能力
- 也就是我们客户端给服务端发送消息的工具，以及接受响应的工具
- 是一个 **默认异步** 执行机制的功能



## AJAX 的优势

1. 不需要插件的支持，原生 js 就可以使用
2. 用户体验好（不需要刷新页面就可以更新数据）
3. 减轻服务端和带宽的负担
4. 缺点： 搜索引擎的支持度不够，因为数据都不在页面上，搜索引擎搜索不到



## 二. 原生Ajax

### 1. AJAX 基础

- 在 js 中有内置的构造函数来创建 ajax 对象
- 创建 ajax 对象以后，我们就使用 ajax 对象的方法去发送请求和接受响应



#### 创建一个 ajax 对象

```javascript
// IE9及以上
const xhr = new XMLHttpRequest()

// IE9以下
const xhr = new ActiveXObject('Mricosoft.XMLHTTP')
```

- 上面就是有了一个 ajax 对象
- 我们就可以使用这个 `xhr` 对象来发送 ajax 请求了



#### 配置链接信息

```javascript
const xhr = new XMLHttpRequest()

// xhr 对象中的 open 方法是来配置请求信息的
// 第一个参数是本次请求的请求方式 get / post / put / ...
// 第二个参数是本次请求的 url 
// 第三个参数是本次请求是否异步，默认 true 表示异步，false 表示同步
// xhr.open('请求方式', '请求地址', 是否异步)
xhr.open('get', './data.php')
```

- 上面的代码执行完毕以后，本次请求的基本配置信息就写完了



#### 发送请求

```javascript
const xhr = new XMLHttpRequest()
xhr.open('get', './data.php')

// 使用 xhr 对象中的 send 方法来发送请求
xhr.send()
```

- 上面代码是把配置好信息的 ajax 对象发送到服务端



#### 一个基本的 ajax 请求

- 一个最基本的 ajax 请求就是上面三步
- 但是光有上面的三个步骤，我们确实能把请求发送的到服务端
- 如果服务端正常的话，响应也能回到客户端
- 但是我们拿不到响应
- 如果想拿到响应，我们有两个前提条件
  1. 本次 HTTP 请求是成功的，也就是我们之前说的 http 状态码为 200 ~ 299
  2. ajax 对象也有自己的状态码，用来表示本次 ajax 请求中各个阶段



#### ajax 状态码

- ajax 状态码 - `xhr.readyState`
- 是用来表示一个 ajax 请求的全部过程中的某一个状态
  - `readyState === 0`：  表示未初始化完成，也就是 `open` 方法还没有执行
  - `readyState === 1`：  表示配置信息已经完成，也就是执行完 `open` 之后
  - `readyState === 2`：  表示 `send` 方法已经执行完成
  - `readyState === 3`：  表示正在解析响应内容
  - `readyState === 4`：  表示响应内容已经解析完毕，可以在客户端使用了
- 这个时候我们就会发现，当一个 ajax 请求的全部过程中，只有当 `readyState === 4` 的时候，我们才可以正常使用服务端给我们的数据
- 所以，配合 http 状态码为 200 ~ 299 
  - 一个 ajax 对象中有一个成员叫做 `xhr.status` 
  - 这个成员就是记录本次请求的 http 状态码的
- 两个条件都满足的时候，才是本次请求正常完成



#### readyStateChange

- 在 ajax 对象中有一个事件，叫做 `readyStateChange` 事件

- 这个事件是专门用来监听 ajax 对象的 `readyState` 值改变的的行为

- 也就是说只要 `readyState` 的值发生变化了，那么就会触发该事件

- 所以我们就在这个事件中来监听 ajax 的 `readyState` 是不是到 4 了

  ```javascript
  const xhr = new XMLHttpRequest()
  xhr.open('get', './data.php')
  
  xhr.send()
  
  xhr.onreadyStateChange = function () {
    // 每次 readyState 改变的时候都会触发该事件
    // 我们就在这里判断 readyState 的值是不是到 4
    // 并且 http 的状态码是不是 200 ~ 299
    if (xhr.readyState === 4 && /^2\d{2}$/.test(xhr.status)) {
      // 这里表示验证通过
      // 我们就可以获取服务端给我们响应的内容了
    }
  }
  ```

  

#### responseText

- ajax 对象中的 `responseText` 成员

- 就是用来记录服务端给我们的响应体内容的

- 所以我们就用这个成员来获取响应体内容就可以

  ```javascript
  const xhr = new XMLHttpRequest()
  xhr.open('get', './data.php')
  
  xhr.send()
  
  xhr.onreadyStateChange = function () {
    if (xhr.readyState === 4 && /^2\d{2}$/.test(xhr.status)) {
      // 我们在这里直接打印 xhr.responseText 来查看服务端给我们返回的内容
      console.log(xhr.responseText)
    }
  }
  ```

  

### 2. 使用 ajax 发送请求时携带参数

- 我们使用 ajax 发送请求也是可以携带参数的
- 参数就是和后台交互的时候给他的一些信息
- 但是携带参数 get 和 post 两个方式还是有区别的



#### 发送一个带有参数的 get 请求

- get 请求的参数就直接在 url 后面进行拼接就可以

  ```javascript
  const xhr = new XMLHttpRequest()
  // 直接在地址后面加一个 ?，然后以 key=value 的形式传递
  // 两个数据之间以 & 分割
  xhr.open('get', './data.php?a=100&b=200')
  
  xhr.send()
  ```

  - 这样服务端就能接受到两个参数
  - 一个是 a，值是 100
  - 一个是 b，值是 200



#### 发送一个带有参数的 post 请求

- post 请求的参数是携带在请求体中的，所以不需要再 url 后面拼接

  ```javascript
  const xhr = new XMLHttpRequest()
  xhr.open('get', './data.php')
  
  // 如果是用 ajax 对象发送 post 请求，必须要先设置一下请求头中的 content-type
  // 告诉一下服务端我给你的是一个什么样子的数据格式
  xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded')
  
  // 请求体直接再 send 的时候写在 () 里面就行
  // 不需要问号，直接就是 'key=value&key=value' 的形式
  xhr.send('a=100&b=200')
  ```

  - `application/x-www-form-urlencoded` 表示的数据格式就是 `key=value&key=value`

#### 不同的请求方式

- get  偏向获取 

- post 偏向提交 

- put  偏向更新

- patch  偏向修改部分

- delete 偏向删除信息

- head 偏向获取服务器头的信息

- option 偏向获取服务器设备信息

- connnect 保留请求方式



## 三. Fetch

	*XMLHttpRequest 是一个设计粗糙的 API，配置和调用方式非常混乱， 而且基于事件的异步模型写起来不友好。* 
	
	**兼容性不好 polyfill: https://github.com/camsong/fetch-ie8**

### 1. 用法

```js
fetch("http://localhost:3000/users")
            .then(res=>res.json())
            .then(res=>{
                console.log(res)
            })


fetch("http://localhost:3000/users",{
            method:"POST",
            headers:{
                "content-type":"application/json"
            },
            body:JSON.stringify({
                username:"kerwin",
                password:"123"
            })
        })
            .then(res=>res.json())
            .then(res=>{
                console.log(res)
            })

fetch("http://localhost:3000/users/5",{
            method:"PUT",
            headers:{
                "content-type":"application/json"
            },
            body:JSON.stringify({
                username:"kerwin",
                password:"456"
            })
        })
            .then(res=>res.json())
            .then(res=>{
                console.log(res)
            })

fetch("http://localhost:3000/users/5",{
            method:"DELETE"
        })
            .then(res=>res.json())
            .then(res=>{
                console.log(res)
            })
```
### 2. 错误处理

```js
//
fetch("http://localhost:3000/users1")
            .then(res=>{
                if(res.ok){
                    return res.json()
                }else{
                    return Promise.reject({
                        status:res.status,
                        statusText:res.statusText
                    })
                }
            })
            .then(res=>{
                console.log(res)
            })
            .catch(err=>{
                console.log(err)
            })
```



## 四. axios

> Axios是一个基于promise 的 HTTP 库，可以用在浏览器和 node.js中。

> https://www.npmjs.com/package/axios

```html
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
```



### 1. get请求

```js
axios.get("http://localhost:3000/users",{
    params:{
        name:"kerwin"
    }
}).then(res=>{
    console.log(res.data)
})
```

### 2.post请求

```js
axios.post("http://localhost:3000/users",{
    name:"kerwin",
    age:100
}).then(res=>{
	console.log(res.data)
})
```

### 3. put请求

```js
axios.put("http://localhost:3000/users/12",{
    name:"kerwin111",
    age:200
}).then(res=>{
    console.log(res.data)
})
```

### 4. delete请求

```js
axios.delete("http://localhost:3000/users/11").then(res=>{
    console.log(res.data)
})
```

### 5. axios(config)配置

```js

axios({
    method: 'post',
    url: 'http://localhost:3000/users',
    data: {
        name: 'kerwin',
        age: 100
    }
})
    .then(res => {
    console.log(res.data)
}).catch(err=>{
    console.log(err)
})
```



### 6. axios拦截器

```js
axios.interceptors.request.use(function (config) {
    // Do something before request is sent
    console.log("loading-开始")
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    console.log("loading-结束")
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log("loading---结束")
    return Promise.reject(error);
});
```

### 7. axios 中断器

```js
const controller = new AbortController();

axios.get('/foo/bar', {
   signal: controller.signal
}).then(function(response) {
   //...
});
// cancel the request
controller.abort()

```



## 五. 同源策略(Same-origin policy)



一个 URL  有三部分组成：协议、域名(指向主机)、端口，只有这三个完全相同的 URL 才能称之为同源。如下，能和  `http://www.example.com/dir1/index.html`  同源的是？

| URL                                       | 结果   | 原因                               |
| ----------------------------------------- | ------ | ---------------------------------- |
| `http://www.example.com/dir2/api`         | 同源   | 只有路径不同                       |
| `https://www.example.com/api`             | 不同源 | 协议不同                           |
| `http://www.example.com:81/dir1/etc.html` | 不同源 | 端口不同 ( `http://` 默认端口是80) |
| `http://www.kerwin.com/dir1/other.html`   | 不同源 | 域名不同                           |

------



> （1） 无法读取非同源网页的 Cookie、LocalStorage 。
> （2） 无法接触非同源网页的 DOM。
> （3） 无法向非同源地址发送 AJAX 请求（可以发送，但浏览器会拒绝接受响应）。



### **注意：**

同源策略是浏览器的行为，是为了保护本地数据不被JavaScript代码获取回来的数据污染，因此拦截的是客户端发出的请求回来的数据接收，即请求发送了，服务器响应了，但是无法被浏览器接收。





## 六. jsonp



Jsonp(JSON with Padding) 是 json 的一种"使用模式"，可以让网页从别的域名（网站）那获取资料，即跨域读取数据。

为什么我们从不同的域（网站）访问数据需要一个特殊的技术( JSONP )呢？这是因为同源策略。



```js
const script = document.createElement('script')
script.src = './kerwin.txt'
document.body.appendChild(script)
```

### **实战**

````js
mysearch.oninput = function(evt){
    console.log(evt.target.value)
    if(!evt.target.value){
        list.innerHTML = ""
        return 
    }

    var oscript = document.createElement("script")
    oscript.src = `https://www.baidu.com/sugrec?pre=1&p=3&ie=utf-8&json=1&prod=pc&from=pc_web&sugsid=36542,36464,36673,36454,31660,36692,36166,36695,36697,36570,36074,36655,36345,26350,36469,36314&wd=${evt.target.value}&req=2&csor=1&cb=test&_=1656294200527`
    document.body.appendChild(oscript)

    oscript.onload = function(){
        oscript.remove()
    }
}

function test(obj){
    console.log(obj.g)

    list.innerHTML = obj.g.map(item=>
                               `<li>${item.q}</li>`
                              ).join("")
}

````
