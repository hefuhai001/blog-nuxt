## 完整的 Vue + uni-app + uView 搭建 APP 并打包为 APK 的实例教程

## 一、环境准备

```bash
# 1. 安装 HBuilderX（uni-app 官方 IDE）
# 下载地址：https://www.dcloud.io/hbuilderx.html

# 2. 安装 Node.js 环境
node -v  # 建议 v16+

# 3. 安装 Vue CLI（可选，用于命令行创建）
npm install -g @vue/cli
```

## 二、创建项目（两种方式）

### 方式一：使用 HBuilderX 可视化创建（推荐新手）

1. 打开 HBuilderX → 文件 → 新建 → 项目
2. 选择 `uni-app` → 填写项目名称 → 选择 `Vue 3` 或 `Vue 2`
3. 模板选择 `默认模板`

### 方式二：命令行创建

```bash
# 使用官方脚手架
npx degit dcloudio/uni-preset-vue#vite my-uview-app

cd my-uview-app
npm install
```

## 三、集成 uView UI 组件库

### 1. 安装 uView

```bash
# 进入项目目录
cd my-uview-app

# 安装 uView（以 uView 2.0 为例）
npm install uview-ui
```

### 2. 配置 uView

**main.js 配置：**

```javascript
// main.js
import { createSSRApp } from 'vue'
import App from './App.vue'

// 引入 uView
import uView from 'uview-ui'
import 'uview-ui/index.scss'

export function createApp() {
  const app = createSSRApp(App)
  
  // 使用 uView
  app.use(uView)
  
  return {
    app
  }
}
```

**uni.scss 配置：**

```scss
/* uni.scss */
@import 'uview-ui/theme.scss';

/* 自定义主题色 */
$u-primary: #2979ff;
$u-success: #19be6b;
$u-warning: #ff9900;
$u-error: #fa3534;
```

**pages.json 配置：**

```json
{
  "easycom": {
    "^u-(.*)": "uview-ui/components/u-$1/u-$1.vue"
  },
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "uView-App",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  },
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/home.png",
        "selectedIconPath": "static/home-active.png"
      },
      {
        "pagePath": "pages/mine/mine",
        "text": "我的",
        "iconPath": "static/mine.png",
        "selectedIconPath": "static/mine-active.png"
      }
    ]
  }
}
```

## 四、完整示例代码

### 1. 首页（pages/index/index.vue）

```vue
<template>
  <view class="container">
    <!-- 轮播图 -->
    <u-swiper
      :list="bannerList"
      keyName="image"
      showTitle
      :autoplay="true"
      circular
      radius="0"
      height="300rpx"
    ></u-swiper>
    
    <!-- 功能菜单 -->
    <view class="menu-grid">
      <u-grid :border="false" col="4">
        <u-grid-item 
          v-for="(item, index) in menuList" 
          :key="index"
          @click="handleMenuClick(item)"
        >
          <u-icon :name="item.icon" :size="40" color="#2979ff"></u-icon>
          <text class="grid-text">{{ item.title }}</text>
        </u-grid-item>
      </u-grid>
    </view>
    
    <!-- 消息提示 -->
    <u-toast ref="uToast"></u-toast>
    
    <!-- 表单示例 -->
    <view class="form-section">
      <u-text text="快速登录" size="18" bold margin="20rpx 0"></u-text>
      
      <u--form
        labelPosition="left"
        :model="formData"
        :rules="rules"
        ref="formRef"
      >
        <u-form-item label="手机号" prop="phone" borderBottom>
          <u--input
            v-model="formData.phone"
            border="none"
            placeholder="请输入手机号"
            type="number"
          ></u--input>
        </u-form-item>
        
        <u-form-item label="验证码" prop="code" borderBottom>
          <u--input
            v-model="formData.code"
            border="none"
            placeholder="请输入验证码"
            type="number"
          >
            <template slot="suffix">
              <u-code
                ref="uCode"
                @change="codeChange"
                seconds="60"
              ></u-code>
              <u-button
                @tap="getCode"
                :text="tips"
                type="success"
                size="mini"
              ></u-button>
            </template>
          </u--input>
        </u-form-item>
      </u--form>
      
      <u-button
        type="primary"
        text="登录"
        customStyle="margin-top: 50rpx"
        @click="submit"
      ></u-button>
    </view>
    
    <!-- 列表展示 -->
    <view class="list-section">
      <u-text text="最新动态" size="18" bold margin="20rpx 0"></u-text>
      
      <u-list @scrolltolower="loadMore">
        <u-list-item v-for="(item, index) in newsList" :key="index">
          <u-cell
            :title="item.title"
            :label="item.time"
            @click="showDetail(item)"
          >
            <template #icon>
              <u-avatar :src="item.avatar" shape="square" size="40"></u-avatar>
            </template>
          </u-cell>
        </u-list-item>
        
        <u-loadmore :status="loadStatus" />
      </u-list>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 轮播图数据
const bannerList = ref([
  {
    image: 'https://cdn.uviewui.com/uview/swiper/swiper1.png',
    title: '欢迎使用 uView UI'
  },
  {
    image: 'https://cdn.uviewui.com/uview/swiper/swiper2.png',
    title: 'uni-app 跨端开发'
  },
  {
    image: 'https://cdn.uviewui.com/uview/swiper/swiper3.png',
    title: '高效、易用、美观'
  }
])

// 菜单数据
const menuList = ref([
  { title: '扫码', icon: 'scan', path: '/pages/scan/scan' },
  { title: '地图', icon: 'map', path: '/pages/map/map' },
  { title: '相册', icon: 'photo', path: '/pages/album/album' },
  { title: '设置', icon: 'setting', path: '/pages/setting/setting' },
  { title: '消息', icon: 'chat', path: '/pages/message/message' },
  { title: '收藏', icon: 'star', path: '/pages/favorite/favorite' },
  { title: '分享', icon: 'share', path: '/pages/share/share' },
  { title: '更多', icon: 'more-dot-fill', path: '/pages/more/more' }
])

// 表单数据
const formData = reactive({
  phone: '',
  code: ''
})

// 表单规则
const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: ['blur', 'change'] },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: ['blur'] }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: ['blur', 'change'] },
    { len: 6, message: '验证码为6位数字', trigger: ['blur'] }
  ]
}

// 验证码提示
const tips = ref('获取验证码')
const uCode = ref(null)
const uToast = ref(null)
const formRef = ref(null)

// 新闻列表
const newsList = ref([
  { title: 'uView 2.0 正式发布', time: '2024-01-15', avatar: 'https://cdn.uviewui.com/uview/album/1.jpg' },
  { title: 'uni-app 支持鸿蒙 Next', time: '2024-01-14', avatar: 'https://cdn.uviewui.com/uview/album/2.jpg' },
  { title: 'Vue 3 组合式 API 最佳实践', time: '2024-01-13', avatar: 'https://cdn.uviewui.com/uview/album/3.jpg' },
  { title: '移动端适配方案总结', time: '2024-01-12', avatar: 'https://cdn.uviewui.com/uview/album/4.jpg' }
])

const loadStatus = ref('loadmore')

// 获取验证码
const getCode = () => {
  if (!formData.phone) {
    uToast.value.show({
      type: 'error',
      message: '请先输入手机号'
    })
    return
  }
  
  if (uCode.value?.canGetCode) {
    uni.showLoading({ title: '正在获取验证码' })
    
    setTimeout(() => {
      uni.hideLoading()
      uCode.value?.start()
      uToast.value.show({
        type: 'success',
        message: '验证码已发送'
      })
    }, 1000)
  }
}

const codeChange = (text) => {
  tips.value = text
}

// 提交表单
const submit = () => {
  formRef.value?.validate().then(() => {
    uToast.value.show({
      type: 'success',
      message: '登录成功'
    })
  }).catch(errors => {
    console.log('验证失败', errors)
  })
}

// 菜单点击
const handleMenuClick = (item) => {
  uToast.value.show({
    type: 'default',
    message: `点击了 ${item.title}`
  })
}

// 加载更多
const loadMore = () => {
  loadStatus.value = 'loading'
  
  setTimeout(() => {
    const newItems = [
      { title: '新消息标题', time: '刚刚', avatar: 'https://cdn.uviewui.com/uview/album/5.jpg' },
      { title: '另一条消息', time: '1分钟前', avatar: 'https://cdn.uviewui.com/uview/album/6.jpg' }
    ]
    newsList.value.push(...newItems)
    loadStatus.value = 'loadmore'
  }, 1000)
}

// 显示详情
const showDetail = (item) => {
  uni.navigateTo({
    url: `/pages/detail/detail?title=${encodeURIComponent(item.title)}`
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.menu-grid {
  background: #fff;
  padding: 20rpx 0;
  margin: 20rpx;
  border-radius: 16rpx;
}

.grid-text {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
}

.form-section, .list-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}
</style>
```

### 2. 我的页面（pages/mine/mine.vue）

```vue
<template>
  <view class="mine-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <u-avatar :src="userInfo.avatar" size="80"></u-avatar>
      <view class="user-info">
        <text class="username">{{ userInfo.nickname || '未登录' }}</text>
        <text class="user-id">ID: {{ userInfo.id || '--' }}</text>
      </view>
      <u-icon name="arrow-right" color="#fff" size="20"></u-icon>
    </view>
    
    <!-- 数据统计 -->
    <view class="stats-bar">
      <view class="stat-item" v-for="(item, index) in stats" :key="index">
        <text class="stat-num">{{ item.num }}</text>
        <text class="stat-label">{{ item.label }}</text>
      </view>
    </view>
    
    <!-- 功能列表 -->
    <view class="menu-list">
      <u-cell-group>
        <u-cell
          v-for="(item, index) in menuItems"
          :key="index"
          :title="item.title"
          :icon="item.icon"
          isLink
          @click="handleClick(item)"
        ></u-cell>
      </u-cell-group>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-section">
      <u-button 
        type="error" 
        text="退出登录" 
        plain
        @click="logout"
      ></u-button>
    </view>
    
    <u-toast ref="uToast"></u-toast>
    <u-modal 
      :show="showModal" 
      title="确认退出" 
      content="确定要退出登录吗？"
      showCancelButton
      @confirm="confirmLogout"
      @cancel="showModal = false"
    ></u-modal>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'

const userInfo = reactive({
  avatar: 'https://cdn.uviewui.com/uview/album/1.jpg',
  nickname: 'uView用户',
  id: '888888'
})

const stats = ref([
  { num: 128, label: '收藏' },
  { num: 56, label: '关注' },
  { num: '12.5k', label: '获赞' }
])

const menuItems = ref([
  { title: '我的订单', icon: 'order', path: '/pages/order/order' },
  { title: '我的钱包', icon: 'red-packet', path: '/pages/wallet/wallet' },
  { title: '收货地址', icon: 'map', path: '/pages/address/address' },
  { title: '消息通知', icon: 'bell', path: '/pages/notice/notice' },
  { title: '隐私设置', icon: 'lock', path: '/pages/privacy/privacy' },
  { title: '关于我们', icon: 'info-circle', path: '/pages/about/about' }
])

const showModal = ref(false)
const uToast = ref(null)

const handleClick = (item) => {
  uToast.value.show({
    type: 'default',
    message: `进入 ${item.title}`
  })
}

const logout = () => {
  showModal.value = true
}

const confirmLogout = () => {
  showModal.value = false
  uToast.value.show({
    type: 'success',
    message: '已退出登录'
  })
}
</script>

<style lang="scss" scoped>
.mine-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
  color: #fff;
  
  .user-info {
    flex: 1;
    margin-left: 30rpx;
    display: flex;
    flex-direction: column;
    
    .username {
      font-size: 36rpx;
      font-weight: bold;
    }
    
    .user-id {
      font-size: 24rpx;
      opacity: 0.8;
      margin-top: 10rpx;
    }
  }
}

.stats-bar {
  background: #fff;
  margin: -30rpx 30rpx 30rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .stat-num {
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
    }
    
    .stat-label {
      font-size: 24rpx;
      color: #999;
      margin-top: 10rpx;
    }
  }
}

.menu-list {
  background: #fff;
  margin: 0 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.logout-section {
  margin: 60rpx 30rpx;
}
</style>
```

### 3. App.vue 全局配置

```vue
<script>
export default {
  onLaunch() {
    console.log('App Launch')
    // 检查更新
    this.checkUpdate()
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  },
  methods: {
    checkUpdate() {
      // #ifdef APP-PLUS
      plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
        console.log('当前版本:', widgetInfo.version)
      })
      // #endif
    }
  }
}
</script>

<style lang="scss">
/* 全局样式 */
@import "uview-ui/index.scss";

page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>
```

## 五、打包 APK 流程

### 1. 配置 manifest.json

```json
{
  "name": "uView-App",
  "appid": "__UNI__XXXXXXX",
  "description": "基于 uni-app + uView 的跨端应用",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,
  "app-plus": {
    "usingComponents": true,
    "nvueStyleCompiler": "uni-app",
    "compilerVersion": 3,
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    },
    "modules": {},
    "distribute": {
      "android": {
        "permissions": [
          "<uses-permission android:name=\"android.permission.INTERNET\" />",
          "<uses-permission android:name=\"android.permission.CAMERA\" />",
          "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\" />",
          "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\" />"
        ],
        "abiFilters": ["armeabi-v7a", "arm64-v8a"],
        "minSdkVersion": 21,
        "targetSdkVersion": 30
      },
      "ios": {},
      "sdkConfigs": {
        "payment": {},
        "push": {},
        "share": {},
        "statics": {}
      }
    }
  },
  "quickapp": {},
  "mp-weixin": {
    "appid": "",
    "setting": {
      "urlCheck": false
    },
    "usingComponents": true
  },
  "mp-alipay": {
    "usingComponents": true
  },
  "mp-baidu": {
    "usingComponents": true
  },
  "mp-toutiao": {
    "usingComponents": true
  },
  "uniStatistics": {
    "enable": false
  },
  "vueVersion": "3"
}
```

### 2. 云打包 APK（最简单，推荐）

1. **HBuilderX 中操作：**
   - 点击顶部菜单 `发行` → `原生App-云打包`
   
2. **配置打包选项：**
   ```
   Android包名：com.example.uviewapp（需全局唯一）
   证书：使用公共测试证书（开发用）或自有证书
   渠道包：选择需要的应用商店渠道
   广告联盟：不需要则取消勾选
   ```

3. **等待打包完成：**
   - 云打包通常需要 2-10 分钟
   - 完成后自动下载 APK 文件

### 3. 本地打包 APK（高级）

```bash
# 1. 生成本地打包资源
# HBuilderX: 发行 → 原生App-本地打包 → 生成本地打包App资源

# 2. 下载 Android 离线 SDK
# https://nativesupport.dcloud.net.cn/AppDocs/download/android.html

# 3. 使用 Android Studio 打开 SDK 中的 HBuilder-Integrate-AS 项目

# 4. 将生成的资源复制到 assets/apps/ 目录下

# 5. 修改 dcloud_control.xml 中的 appid

# 6. Android Studio 中 Build → Generate Signed Bundle/APK
```

### 4. 自定义基座调试（真机调试）

```bash
# HBuilderX 中：
# 1. 运行 → 运行到手机或模拟器 → 制作自定义基座
# 2. 选择自定义基座运行，可以调试原生功能（如扫码、定位等）
```

## 六、项目结构

```
my-uview-app/
├── pages/                  # 页面
│   ├── index/
│   │   └── index.vue      # 首页
│   └── mine/
│       └── mine.vue       # 我的页面
├── static/                # 静态资源
│   ├── home.png
│   └── mine.png
├── uni.scss               # 全局样式变量
├── App.vue                # 应用入口
├── main.js                # Vue 初始化
├── manifest.json          # 应用配置
├── pages.json             # 页面路由配置
└── package.json
```

## 七、常用 uView 组件速查

| 组件       | 用途     | 示例                                                       |
| ---------- | -------- | ---------------------------------------------------------- |
| `u-button` | 按钮     | `<u-button type="primary" text="确定"></u-button>`         |
| `u-input`  | 输入框   | `<u-input v-model="value" placeholder="请输入"></u-input>` |
| `u-toast`  | 轻提示   | `uToast.value.show({ type: 'success', message: '成功' })`  |
| `u-modal`  | 弹窗     | `<u-modal :show="show" title="提示"></u-modal>`            |
| `u-list`   | 长列表   | `<u-list @scrolltolower="loadMore"></u-list>`              |
| `u-swiper` | 轮播图   | `<u-swiper :list="list" keyName="image"></u-swiper>`       |
| `u-grid`   | 宫格布局 | `<u-grid col="4"></u-grid>`                                |
| `u-avatar` | 头像     | `<u-avatar src="url" size="80"></u-avatar>`                |
| `u-icon`   | 图标     | `<u-icon name="photo" size="28"></u-icon>`                 |

## 八、注意事项

1. **Vue 3 兼容性**：uView 2.0 支持 Vue 3，但部分语法可能有差异
2. **条件编译**：使用 `// #ifdef APP-PLUS` 包裹原生 App 专属代码
3. **性能优化**：长列表使用 `u-list` 而非 `scroll-view`
4. **网络请求**：uni-app 统一使用 `uni.request`，uView 提供 `u-http` 封装

