# Vue工程setup函数详解

## 一、简介

Vue3 的一大特性函数 ---- setup
　　1、setup函数是处于 生命周期函数 beforeCreate 和 Created 两个钩子函数之间的函数 也就说在 setup函数中是无法 使用 data 和 methods 中的数据和方法的
　　2、setup函数是 Composition API（组合API）的入口
　　3、在setup函数中定义的变量和方法最后都是需要 return 出去的 不然无法再模板中使用

## 二、代码

```html
<template>
  <div>
    <div>{{ readersNumber }}</div>
    <el-button type="primary" @click="onClick">自定义点击事件</el-button>
  </div>
</template>

<script>
/* 方式一：(script 右边写上 setup)*/
// import {onBeforeMount, ref} from "vue";
// const readersNumber = ref('绿色回收')
// const onClick = () => {
//   console.log(readersNumber.value)
//   if (typeof readersNumber.value === "string") {
//     console.log('string')
//   } else {
//     console.log('other')
//   }
//   // alert(readersNumber)
// }
// onBeforeMount(() => {
//   console.log('数据渲染前')
// })


/* 方式二：*/
// import {onBeforeMount, ref} from "vue";
// export default {
//   name: "OrderForm_BP",
//   setup() {
//     const readersNumber = ref('OrderForm_BP')
//     const onClick = () => {
//       console.log(readersNumber.value)
//       if (typeof readersNumber.value === "string") {
//         console.log('string')
//       } else {
//         console.log('other')
//       }
//       // alert(readersNumber)
//     }
//     onBeforeMount(()=>{
//       console.log('数据渲染前')
//     })
//     return {
//       onClick,
//       readersNumber,
//     }
//   }
// }

/* 方式三：*/
import {reactive, toRefs} from "vue";

export default {
  name: "SetupDemo",
  setup() {
    const data = reactive({
      readersNumber: "",
      userList: [],
      tableList: [],
    })
    const onClick = function () {
      console.log(data.readersNumber, '自定义点击事件')
      data.readersNumber = 'readersNumber数据'
      if (data.readersNumber === "readersNumber") {
        console.log('string')
      } else {
        console.log('other')
      }
    }
    return {
      //解构
      ...toRefs(data),
      onClick
    }
  }
}

</script>

<style scoped>

</style>
```

## 三、说明

### NO.1 setup写在script标签内。

使用ref绑定数据，无需export，import的组件页面内可以直接使用，但需要反复const，ref数据。调用数据{数据名}.value。

```html
<script setup>
import {onBeforeMount, ref} from "vue";
const readersNumber = ref('setup写在script标签内')
const onClick = () => {
  console.log(readersNumber.value)
  if (typeof readersNumber.value === "string") {
    console.log('string')
  } else {
    console.log('other')
  }
  // alert(readersNumber)
}
onBeforeMount(() => {
  console.log('数据渲染前')
})

</script>

```

### NO.2 setup写在js中。

使用ref绑定数据，事件和数据都需要return出去。调用数据{数据名}.value。

```html
<script>
import {ref} from "vue";
export default {
  name: "SetupDemo",
  setup() {
    const readersNumber = ref('setup写在js中')
    const onClick = () => {
      console.log(readersNumber.value)
      if (typeof readersNumber.value === "string") {
        console.log('string')
      } else {
        console.log('other')
      }
      // alert(readersNumber)
    }
    return {
      onClick,
      readersNumber,
    }
  }
}
</script>
```

### NO.3 setup写在js中，使用reactive打包页面内数据，再使用toRefs解构。

避免数据反复const和return,事件需要return出去。调用数据data.{数据名}。

```html
<script>
import {reactive, toRefs} from "vue";

export default {
  name: "SetupDemo",
  setup() {
    //data可以自定义名字
    const data = reactive({
      readersNumber: "setup写在js中"
    })
    const onClick = function () {
      console.log(data.readersNumber, '自定义点击事件')
      data.readersNumber = 'setup写在js中'
      if (data.readersNumber === "readersNumber") {
        console.log('string')
      } else {
        console.log('other')
      }
    }
    return {
      //解构
      ...toRefs(data),
      onClick
    }
  }
}
</script>
```

## 四、PS：关于vue3生命周期介绍

```html
<script>
import {onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, reactive, toRefs} from "vue";

export default {
  name: "SetupDemo",
  setup() {
    const data = reactive({
      readersNumber: "",
    })
    const onClick = function () {
      console.log(data.readersNumber, '自定义点击事件')
      data.readersNumber = 'readersNumber'
      if (data.readersNumber === "readersNumber") {
        console.log('string')
      } else {
        console.log('other')
      }
    }
    //生命周期
    onBeforeMount(() => {
      console.log('数据渲染前')
    })
    onMounted(() => {
      console.log('渲染结束')
    })
    onBeforeUpdate(() => {
      console.log('页面Dom更新之前')
    })
    onUpdated(() => {
      console.log('页面Dom更新之后')
    })
    onBeforeUnmount(() => {
      console.log('Vue实例销毁之前')
    })
    onUnmounted(() => {
      console.log('Vue实例销毁之后')
    })
    return {
      //解构
      ...toRefs(data),
      onClick
    }
  }
}
</script>
```
