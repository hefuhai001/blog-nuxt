# 实战！Vue 集成百度地图WebGL版：图层+覆盖物+定位全实现

## 核心功能

基于 Vue 实现百度地图 WebGL 版的多组件切换，包含行政区划图层展示、自定义覆盖物（圆形/矩形）、定位标记三大核心功能，组件化设计可直接复用。

## 一、核心代码结构（可直接复制使用）

### 1. 工程结构

```
src/
├── components/
│   ├── BMapLayer.vue    # 行政区划图层展示
│   ├── BMapOverlay.vue  # 覆盖物（圆形/矩形）添加/删除
│   ├── BMapShow.vue     # 定位+标记功能
├── App.vue              # 组件切换入口
public/index.html        # 基础页面（可选预加载地图API）
```

### 2. 关键组件核心代码

#### （1）BMapLayer.vue（行政区划图层）

```vue

<template>
  <div class="map-wrapper">
    <div id="container" ref="container"></div>
    <div v-if="loading" class="mask">地图加载中…</div>
    <div v-if="error" class="mask error">{{ error }}</div>
  </div>
</template>
<script>
  export default {
    name: 'BMapLayer',
    data() {
      return {map: null, distLayer: null, loading: true, error: null}
    },
    async mounted() {
      try {
        await this.loadScripts()
        this.initMap()
        this.addDistrictLayer()
      } catch (e) {
        this.error = e.message || '初始化失败'
      } finally {
        this.loading = false
      }
    },
    beforeDestroy() {
      this.map && this.map.destroy()
    },
    methods: {
      // 动态加载百度API+行政区划数据
      loadScripts() {
        return Promise.all([
          this.loadScript('http://api.map.baidu.com/api?type=webgl&v=1.0&ak=你的AK'),
          this.loadScript('http://bj.bcebos.com/v1/mapopen/api-demos/data/province.js')
        ])
      },
      loadScript(src) {
        return new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) return resolve()
          const script = document.createElement('script')
          script.src = src
          script.onload = resolve
          script.onerror = () => reject(new Error(`${src} 加载失败`))
          document.head.appendChild(script)
        })
      },
      // 初始化地图
      initMap() {
        this.map = new BMapGL.Map(this.$refs.container)
        this.map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 7)
        this.map.enableScrollWheelZoom(true)
        this.map.addControl(new BMapGL.NavigationControl3D())
      },
      // 添加行政区划图层
      addDistrictLayer() {
        this.distLayer = new BMapGL.DistrictLayer({
          name: '(南昌市)',
          kind: 1,
          fillColor: '#618bf8',
          fillOpacity: 1,
          strokeColor: '#daeafa',
          viewport: true
        })
        this.map.addDistrictLayer(this.distLayer)
        // 鼠标悬浮/离开样式切换
        this.distLayer.addEventListener('mouseover', e => {
          e.currentTarget.setFillColor('#9169db')
        })
        this.distLayer.addEventListener('mouseout', e => {
          e.currentTarget.setFillColor('#618bf8')
        })
      }
    }
  }
</script>
<style scoped>
  .map-wrapper {
    position: relative;
    width: 100%;
    height: 500px;
  }

  #container {
    width: 100%;
    height: 500px;
  }

  .mask {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 12px 24px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    border-radius: 4px;
  }

  .mask.error {
    background: rgba(255, 0, 0, 0.6);
  }
</style>
```

#### （2）BMapOverlay.vue（覆盖物操作）

```vue

<template>
  <div class="map-wrapper">
    <div id="allmap" ref="mapContainer"></div>
    <div v-if="loading" class="mask">地图加载中，请稍候…</div>
    <div v-if="error" class="mask error">{{ error }}</div>
    <div v-show="!loading && !error">
      <button @click="addOverlay">添加覆盖物</button>
      <button @click="removeOverlay">删除覆盖物</button>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'BMapOverlay',
    data() {
      return {map: null, circle: null, rectangle: null, loading: true, error: null}
    },
    async mounted() {
      try {
        await this.loadBMapApi()
        this.initMap()
        this.createOverlays()
      } catch (e) {
        this.error = e.message || '地图初始化失败'
      } finally {
        this.loading = false
      }
    },
    beforeDestroy() {
      this.map && this.map.destroy()
    },
    methods: {
      loadBMapApi() {
        return new Promise((resolve, reject) => {
          if (window.BMapGL) return resolve()
          const script = document.createElement('script')
          script.src = 'http://api.map.baidu.com/api?type=webgl&v=1.0&ak=你的AK'
          script.onload = resolve
          script.onerror = () => reject(new Error('BMapGL 加载失败'))
          document.head.appendChild(script)
        })
      },
      initMap() {
        const point = new BMapGL.Point(115.864587, 28.689449)
        this.map = new BMapGL.Map(this.$refs.mapContainer)
        this.map.centerAndZoom(point, 10)
        this.map.enableScrollWheelZoom(true)
      },
      // 创建圆形+矩形覆盖物
      createOverlays() {
        const center = new BMapGL.Point(115.864587, 28.689449)
        // 圆形（中心坐标+半径5000米）
        this.circle = new BMapGL.Circle(center, 5000, {
          strokeColor: 'blue', strokeWeight: 2, strokeOpacity: 0.5
        })
        // 矩形（四个顶点坐标）
        this.rectangle = new BMapGL.Polygon([
          new BMapGL.Point(115.864587, 28.689449),
          new BMapGL.Point(115.811187, 28.689449),
          new BMapGL.Point(115.811187, 28.611149),
          new BMapGL.Point(115.864587, 28.611149)
        ], {strokeColor: 'blue', strokeWeight: 2, strokeOpacity: 0.5})
      },
      // 添加覆盖物
      addOverlay() {
        this.map.addOverlay(this.circle)
        this.map.addOverlay(this.rectangle)
      },
      // 清空所有覆盖物
      removeOverlay() {
        this.map.clearOverlays()
      }
    }
  }
</script>
<style scoped>
  .map-wrapper {
    position: relative;
    width: 100%;
    height: 500px;
  }

  #allmap {
    width: 100%;
    height: 500px;
  }

  .mask {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 12px 24px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    border-radius: 4px;
  }

  .mask.error {
    background: rgba(255, 0, 0, 0.6);
  }
</style>
```

#### （3）App.vue（组件切换）

```vue

<template>
  <div id="app">
    <button @click="active = 'BMapShow'">显示定位地图</button>
    <button @click="active = 'BMapOverlay'">显示覆盖物地图</button>
    <button @click="active = 'BMapLayer'">显示行政区划地图</button>
    <component :is="active"/>
  </div>
</template>
<script>
  import BMapShow from '@/components/BMapShow.vue'
  import BMapOverlay from '@/components/BMapOverlay.vue'
  import BMapLayer from '@/components/BMapLayer.vue'

  export default {
    name: 'App',
    components: {BMapShow, BMapOverlay, BMapLayer},
    data() {
      return {active: 'BMapShow'}
    }
  }
</script>
<style>
  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
</style>
```

## 二、关键注意事项

1. **AK替换**：所有代码中的 `FvibPOTtrtCn6z91J0SNPHBQe8NdfICU` 需替换为你自己的百度地图AK（需开通WebGL权限）；
2. **API加载**：推荐动态加载API（代码中已实现），避免index.html重复加载导致冲突；
3. **内存释放**：所有组件在 `beforeDestroy` 中调用 `map.destroy()`，防止内存泄漏；
4. **定位权限**：BMapShow.vue的定位功能需要浏览器授予定位权限，本地调试需用HTTPS或localhost；
5. **行政区划数据**：BMapLayer.vue中加载的province.js为示例数据，可替换为自定义区域数据。
