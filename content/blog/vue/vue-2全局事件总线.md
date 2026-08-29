# Vue 全局事件总线：Vue 2 vs Vue 3 实现

## Vue 2 全局事件总线

在Vue 2中，全局事件总线通常通过创建一个新的Vue实例来实现，这个实例作为中央枢纽供所有组件使用。

### 实现步骤

1. **创建事件总线**

```javascript
// event-bus.js
import Vue from 'vue';
export const EventBus = new Vue();
```

2. **在组件中使用事件总线**

```vue
<template>
  <button @click="emitEvent">发射事件</button>
</template>

<script>
import { EventBus } from './event-bus.js';

export default {
  methods: {
    emitEvent() {
      EventBus.$emit('my-event', '这是来自组件A的消息');
    }
  }
}
</script>
```

```vue
<template>
  <div>
    <h2>事件消息：{{ message }}</h2>
  </div>
</template>

<script>
import { EventBus } from './event-bus.js';

export default {
  data() {
    return {
      message: ''
    };
  },
  created() {
    EventBus.$on('my-event', this.handleEvent);
  },
  methods: {
    handleEvent(msg) {
      this.message = msg;
    }
  },
  beforeDestroy() {
    EventBus.$off('my-event', this.handleEvent);
  }
}
</script>
```

## Vue 3 全局事件总线

Vue 3引入了组合式API，提供了更多灵活性。我们可以利用这些新特性来实现全局事件总线。

### 实现步骤

1. **创建事件总线**

```javascript
// event-bus.js
import { reactive, readonly } from 'vue';

const state = reactive(new Map());

function emit(event, payload) {
  (state.get(event) || []).forEach((callback) => callback(payload));
}

function on(event, callback) {
  if (!state.has(event)) {
    state.set(event, []);
  }
  state.get(event).push(callback);
  return () => off(event, callback);
}

function off(event, callback) {
  const callbacks = state.get(event);
  if (callbacks) {
    callbacks.splice(callbacks.indexOf(callback), 1);
  }
}

export const EventBus = {
  emit,
  on,
  off,
  readonly: readonly(state),
};
```

2. **在组件中使用事件总线**

```vue
<template>
  <button @click="emitEvent">发射事件</button>
</template>

<script setup>
import { EventBus } from './event-bus.js';

const emitEvent = () => {
  EventBus.emit('my-event', '这是来自组件A的消息');
};
</script>
```

```vue
<template>
  <div>
    <h2>事件消息：{{ message }}</h2>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { EventBus } from './event-bus.js';

const message = ref('');

const listener = (msg) => {
  message.value = msg;
};

EventBus.on('my-event', listener);

onUnmounted(() => {
  EventBus.off('my-event', listener);
});
</script>
```
