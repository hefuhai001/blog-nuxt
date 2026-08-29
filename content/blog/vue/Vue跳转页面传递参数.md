# Vue跳转页面传递参数

## 路由

```ts
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "layout",
      component: () => import("../LayoutView.vue"),
      redirect: "/recommend",
      children: [
        {
          path: "/recommend",
          name: "recommend",
          component: () => import("../views/RecommendView.vue"),
        },
        {
          path: "/detail",
          name: "detail",
          component: () => import("../views/DetailView.vue"),
        },
      ],
    },
  ],
});

export default router;
```



## 页面一

### 主要代码

````ts
import {ref} from "vue";

const search = ref("");
import {useRouter, useRoute} from 'vue-router'
const router = useRouter()
function handleSearch() {
  const data = search.value;
  router.push({
    path: "/detail",
    query: {data}
  })
}
````



## 页面二

### 主要代码

````ts
import {onMounted} from "vue";
import {useRouter, useRoute} from 'vue-router'
import api from "@/api";

const route = useRoute()
const search = route.query.data;
onMounted(() => {
  const searchVal = JSON.stringify(search);
  api.home.search(searchVal).then((rs: any) => {
    console.log(rs.data.result.songs);
  })
})
````
