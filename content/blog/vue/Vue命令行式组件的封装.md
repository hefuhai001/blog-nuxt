# Vue命令行式组件的封装

#### 一. 组件封装

##### 1.解决js文件中如何书写渲染html

```js
render(ctx) {
        const {$props, $emit} = ctx;
        return <DivModal>
            <DivBox>
                <h4>{$props.msg}</h4>
                <DivButton click={$emit('onClick')}>确认</DivButton>
            </DivBox>
        </DivModal>;
    }
    /*使用render方法将html元素渲染到页面上，在showMsg函数中，创建了一个div元素，使用createApp方法创建一个vue实例app，将div挂载到app应用中。*/
```



##### 2.解决js文件中如何将html元素加上样式

```json
//package.json
"@styils/vue": "^1.1.6",
```

```js
//showMsg.js
const DivModal = styled('div', {
    position: 'fixed',
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    background: 'rgba(0,0,0,.4)',
})
/*参考react中的方法，使用styiles第三方库实现，将需要加样式的元素声明为一个对象代替，将对象赋予上样式完成。*/
```

使用时div 标签由 DivModal 代替：

```js
//showMsg.js
render(ctx) {
        const {$props, $emit} = ctx;
        //div 标签由 DivModal 代替
        return <DivModal>
            ...
        </DivModal>;
    }
```

##### 3.showMsg.js 组件全部代码

```js
//showMsg.js
// import MessageBox from "@/components/MessageBox.vue";
import {createApp} from "vue";
import {styled} from "@styils/vue";

const DivModal = styled('div', {
    position: 'fixed',
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    background: 'rgba(0,0,0,.4)',
})

const DivBox = styled('div', {
    position: 'fixed',
    width: '300px',
    height: '100px',
    top: '40%',
    left: 'calc(50% - 150px)',
    background: 'white',
    borderRadius: '10px',
    border: '2px solid #707070',
    color: '#000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
})

const DivButton = styled('el-button', {
    cursor: 'pointer',
    borderRadius: '5px',
    padding: '5px 10px',
    background: '#409eff',
    color: 'white',
    fontSize: '14px',
})


const MessageBox = {
    props: {
        msg: {
            type: String,
            required: true,
        }
    },
    render(ctx) {
        const {$props, $emit} = ctx;
        return <DivModal>
            <DivBox>
                <h4>{$props.msg}</h4>
                <DivButton click={$emit('onClick')}>确认</DivButton>
            </DivBox>
        </DivModal>;
    }
}

function showMsg(msg, clickHandle) {
	//创建一个div元素
    const div = document.createElement('div')
    document.body.appendChild(div)
	//创建app应用
    const app = createApp(MessageBox, {
        msg, onClick() {
            clickHandle & clickHandle(() => {
            	//卸载app应用
                app.unmount(div);
                //移除div元素
                div.remove();
            })
        }
    });
    //将div挂载到app应用上
    app.mount(div);
}

export default showMsg;

```



#### 二. 如何使用组件

##### 1.导入

```js
//MessageView.vue
import showMsg from '@/components/showMsg';
```

##### 2.使用

```js
//MessageView.vue
const clickHandle = () => {
  showMsg('我是弹出框,点击确认隐藏', (close) => {
    console.log('点击了确认')
    close();
  });
}
```

##### 3.示例

```vue
//MessageView.vue
<template>
  <div>
    <el-button type="primary" @click="clickHandle">显示</el-button>
  </div>
</template>

<script setup>
import showMsg from '@/components/showMsg';

const clickHandle = () => {
  showMsg('我是弹出框,点击确认隐藏', (close) => {
    console.log('点击了确认')
    close();
  });
}

</script>

```
