# 在Vue中使用IndexedDB的实用指南

## IndexedDB简介

IndexedDB是一个在浏览器中运行的非关系型数据库，它允许网页应用存储和检索大量结构化数据。与LocalStorage相比，IndexedDB提供了更高级的数据存储和查询能力，支持事务、索引和二进制数据存储。

## 封装IndexedDB操作

为了简化IndexedDB的使用，我们可以封装一系列操作，如打开数据库、添加数据、获取数据、更新数据和删除数据。以下是db.js文件的封装示例：

```js
// db.js
const DB_NAME = 'my-database';
const DB_VERSION = 1;
const STORE_NAME = 'my-store';

// 打开数据库
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (event) => {
      reject('Database error: ' + event.target.errorCode);
    };
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// 添加数据
function addData(data) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(data);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    }).catch(reject);
  });
}

// 获取数据
function getData(key) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    }).catch(reject);
  });
}

// 更新数据
function updateData(key, data) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    }).catch(reject);
  });
}

// 删除数据
function deleteData(key) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    }).catch(reject);
  });
}

export { addData, getData, updateData, deleteData };
```

## Options API 示例

在Vue组件中使用Options API调用utils工具：

```html
<template>
  <div>
    <h1>IndexedDB Operations</h1>
    <button @click="addItem">Add Item</button>
    <button @click="getItem">Get Item</button>
    <button @click="updateItem">Update Item</button>
    <button @click="deleteItem">Delete Item</button>
  </div>
</template>

<script>
import { addData, getData, updateData, deleteData } from './db';

export default {
  data() {
    return {
      itemId: 1,
      itemName: 'New Item'
    };
  },
  methods: {
    addItem() {
      addData({ id: this.itemId, name: this.itemName })
        .then(() => alert('Item added'))
        .catch((error) => alert('Error adding item: ' + error));
    },
    getItem() {
      getData(this.itemId)
        .then((item) => alert(`Item retrieved: ${JSON.stringify(item)}`))
        .catch((error) => alert('Error retrieving item: ' + error));
    },
    updateItem() {
      updateData(this.itemId, { id: this.itemId, name: 'Updated Item' })
        .then(() => alert('Item updated'))
        .catch((error) => alert('Error updating item: ' + error));
    },
    deleteItem() {
      deleteData(this.itemId)
        .then(() => alert('Item deleted'))
        .catch((error) => alert('Error deleting item: ' + error));
    }
  }
};
</script>
```

## Composition API 示例

在Vue组件中使用Composition API调用utils工具：

```html
<template>
  <div>
    <h1>IndexedDB Operations</h1>
    <button @click="addItem">Add Item</button>
    <button @click="getItem">Get Item</button>
    <button @click="updateItem">Update Item</button>
    <button @click="deleteItem">Delete Item</button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { addData, getData, updateData, deleteData } from './db';

export default {
  setup() {
    const itemId = ref(1);
    const itemName = ref('New Item');

    const addItem = () => {
      addData({ id: itemId.value, name: itemName.value })
        .then(() => alert('Item added'))
        .catch((error) => alert('Error adding item: ' + error));
    };

    const getItem = () => {
      getData(itemId.value)
        .then((item) => alert(`Item retrieved: ${JSON.stringify(item)}`))
        .catch((error) => alert('Error retrieving item: ' + error));
    };

    const updateItem = () => {
      updateData(itemId.value, { id: itemId.value, name: 'Updated Item' })
        .then(() => alert('Item updated'))
        .catch((error) => alert('Error updating item: ' + error));
    };

    const deleteItem = () => {
      deleteData(itemId.value)
        .then(() => alert('Item deleted'))
        .catch((error) => alert('Error deleting item: ' + error));
    };

    return {
      addItem,
      getItem,
      updateItem,
      deleteItem,
      itemId,
      itemName
    };
  }
};
</script>
```
