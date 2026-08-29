# Vue组件间通信实践

在Vue中，组件间的通信是构建复杂应用的关键。本教程将通过几个简单的例子来展示如何在Vue组件之间传递数据和方法。

## defineProps和defineEmits的作用

在Vue 3中，`defineProps`和`defineEmits`是Composition API的一部分，它们用于在组件中声明props（接收来自父组件的数据）和emits（触发事件传递给父组件）。

### defineProps

`defineProps`用于声明组件接收的props。它允许你定义一个接口，指定哪些属性将作为props传递给组件。这有助于提供类型检查和自动完成功能，使得组件的props使用更加清晰和安全。

```javascript
import { defineProps } from 'vue';

const props = defineProps({
  // 定义一个名为 'message' 的 prop，类型为 String
  message: String,
  // 定义一个名为 'age' 的 prop，类型为 Number，可选，默认值为 18
  age: {
    type: Number,
    default: 18
  },
  // 定义一个名为 'isStudent' 的 prop，类型为 Boolean
  isStudent: Boolean
});
```

在上面的例子中，`props`是一个响应式引用，你可以在组件的其他地方使用它来访问这些props。

### defineEmits

`defineEmits`用于声明组件可以触发的事件（emits）。这允许你在组件内部定义可以被父组件监听的事件。与`defineProps`类似，它也提供了类型检查和自动完成的功能。

```javascript
import { defineEmits } from 'vue';

const emits = defineEmits({
  // 定义一个名为 'update:name' 的事件
  // 当这个事件被触发时，它将传递一个名为 'name' 的参数
  'update:name': (name: string) => true,
  // 定义一个名为 'delete' 的事件，没有参数
  'delete': () => true
});
```

在上面的例子中，`emits`是一个对象，它描述了组件可以触发的事件。你可以在组件内部使用`emits`来触发这些事件。

## 父子组件通信

### 父组件传递数据和方法给子组件

在父组件中，我们定义了一些数据和方法，并通过props传递给子组件。

```vue
<template>
  <div>
    <div @click="props.viewFun">***main组件***</div>
    <hello-world
      :fuData="fuData"
      :fuFunc="fuFunc"
      @child-event="receiveCh"
    ></hello-world>
  </div>
</template>

<script setup lang="ts">
import HelloWorld from "@/components/HelloWorld.vue";

// 定义数据和方法
const fuData = "main数据";
const fuFunc = (i: any) => {
  console.log("main组件的方法", i);
};

// 子组件触发的事件处理
const receiveCh = () => {
  console.log("main组件的方法被调用了");
};

// 使用defineProps定义props
import { defineProps } from "vue";
const props = defineProps(["viewFun"]);
</script>
```



### 子组件调用父组件的方法

在子组件中，我们可以通过`emit`来触发父组件的方法。

```vue
<template>
	<--点击子组件，方法在父组件-->
  <div @click="chFunc">---hello组件---</div>
    
  <div @click="fuFunc(111)">{{ fuData }}</div>
  <div>{{ viewData }}</div>
</template>

<script setup lang="ts">
// 使用defineProps接收父组件传递的数据和方法
import { defineProps } from "vue";
interface Props {
  fuData?: String;
  fuFunc?: Function | any;
}
defineProps<Props>();

// 使用defineEmits定义子组件触发的事件
import { defineEmits } from "vue";
const emit = defineEmits(["child-event"]);
const chFunc = (data: any) => {
  emit("child-event", data);
};

// 使用inject接收父组件通过provide注入的数据
import { inject, Ref, ref } from "vue";
const viewData = inject<Ref<number>>("view", ref(0));
</script>
```

## 跨层级组件通信

### 使用provide/inject

在Vue 3中，我们可以使用`provide`和`inject`来实现跨层级组件的通信。

```vue
<template>
  <div>
    <div>@@@页面@@@</div>
    <main-layout :view-fun="viewFun"></main-layout>
  </div>
</template>

<script setup lang="ts">
import MainLayout from "@/components/MainLayout.vue";

// 在父组件中provide数据
import { provide } from "vue";
provide("view", "provide注入数据");

// 在子组件中inject数据
const viewFun = () => {
  console.log("页面加载");
};
</script>
```
