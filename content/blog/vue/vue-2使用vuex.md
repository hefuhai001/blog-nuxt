# Vue工程使用vuex

## 1.vuex简介

1. Vuex 可以帮助我们管理共享状态，并附带了更多的概念和框架。这需要对短期和长期效益进行权衡。
   如果您不打算开发大型单页应用，使用 Vuex 可能是繁琐冗余的。确实是如此——如果您的应用够简单，您最好不要使用 Vuex。一个简单的 store 模式就足够您所需了。但是，如果您需要构建一个中大型单页应用，您很可能会考虑如何更好地在组件外部管理状态，Vuex 将会成为自然而然的选择。引用 Redux 的作者 Dan Abramov 的话说就是：

## 2.下载vuex

2. 

``` bat
npm install vuex@next --save
yarn add vuex@next --save
```

## 3.新建vuex配置文件

3. 在src目录下新建目录命名为store，在store目录下新建index.js文件，写入如下配置。

``` js
import {createStore} from "vuex";
const $store = createStore({
   //state可以看作是全局公共的数据，需要的组件可以调用
    state: {
        count: 0,
    },
    getters: {},
    //mutations可以看作是调用state的事件，在组件中可以通过commit方法调用和响应
    mutations: {
        increment(state, payload) {
            state.count = state.count + 1
            console.log('payload:' + payload)
        },
    },
    actions: {},
    modules: {}
})

export default $store;
```

## 4.导入配置文件

4. 在main.js中导入刚刚写好的文件


``` js
import $store from '@/store';
app.use($store);
```

## 5.用例

5.在需要使用的组件同样写入

``` js 
import $store from '@/store';
```

就可以开始使用了

``` vue

```
