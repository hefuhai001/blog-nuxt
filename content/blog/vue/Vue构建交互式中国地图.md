# Vue项目中使用ECharts构建交互式中国地图的详细指南

### 步骤 1: 安装 ECharts 和 ECharts 相关插件

首先，确保你的项目中已经安装了ECharts。如果没有，可以使用npm或yarn来安装：

```bash
npm install echarts --save
```

### 步骤 2: 安装中国地图数据

地图数据获取网站：[阿里云数据可视化平台](http://datav.aliyun.com/portal/school/atlas/area_selector#&lat=30.37018632615852&lng=106.68898666525287&zoom=3.5)

ECharts 使用 JSON 格式的地理数据来渲染地图。你可以在上面这个网站下载中国省级行政区划的 JSON 文件。放入工程的静态文件目录下方。

### 步骤 3: 在 Vue 组件中引入 ECharts 和 地图数据

在你的Vue组件中，引入ECharts和中国地图数据：

```javascript
import * as echarts from "echarts";
import china from "@/assets/china.json"; // 引入中国地图数据
```

### 步骤 4: 创建地图实例并配置

在你的Vue组件的`mounted`生命周期钩子中，创建ECharts实例并配置地图选项：

```javascript
import { ref, onMounted, getCurrentInstance } from "vue";
import * as echarts from "echarts";
import china from "@/assets/china.json";
const mapData: any = china;
const points = ref([
  // 散点图数据
  {
    name: "广东",
    value: [113.266887, 23.133306],
    itemStyle: { color: "#00EEFF" },
  }, // 广东
]);
const linesData = ref([
  {
    coords: [
      [116.407387, 39.904179],
      [113.266887, 23.133306],
    ],
  }, // 北京->广东
]);
const planePath = // 飞机svg
  "path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z";
onMounted(() => {
  // getCurrentInstance().refs.charts 获取charts节点对象
  const Instance: any = getCurrentInstance();
  const refCharts: any = Instance.refs.charts;
  const charts: any = echarts.init(refCharts);
  initCharts(charts);
});
function initCharts(charts: any) {
  const option = {
    backgroundColor: "#0E2152", // 背景颜色
    geo: {
      // 地图配置
      map: "china",
      label: {
        // 图形上的文本标签
        normal: {
          // 通常状态下的样式
          show: true,
          textStyle: {
            color: "#fff",
          },
        },
        emphasis: {
          // 鼠标放上去高亮的样式
          textStyle: {
            color: "#fff",
          },
        },
      },
      itemStyle: {
        // 地图区域的样式设置
        normal: {
          // 通常状态下的样式
          borderColor: "#5089EC",
          borderWidth: 1,
          areaColor: {
            //地图区域的颜色
            type: "radial", // 径向渐变
            x: 0.5, // 圆心
            y: 0.5, // 圆心
            r: 0.8, // 半径
            colorStops: [
              {
                // 0% 处的颜色
                offset: 0,
                color: "rgba(0, 102, 154, 0)",
              },
              {
                // 100% 处的颜色
                offset: 1,
                color: "rgba(0, 102, 154, .4)",
              },
            ],
          },
        },
        // 鼠标放上去高亮的样式
        emphasis: {
          areaColor: "#2386AD",
          borderWidth: 0,
        },
      },
    },
    series: [
      {
        // 散点系列数据
        type: "effectScatter", // 带有涟漪特效动画的散点（气泡）图
        coordinateSystem: "geo", //该系列使用的坐标系:地理坐标系
        // 特效类型,目前只支持涟漪特效'ripple'，意为“涟漪”
        effectType: "ripple",
        // 配置何时显示特效。可选'render'和'emphasis' 。
        showEffectOn: "render",
        rippleEffect: {
          // 涟漪特效相关配置。
          period: 10, // 动画的周期，秒数。
          scale: 4, // 动画中波纹的最大缩放比例。
          // 波纹的绘制方式，可选 'stroke' 和 'fill'。
          brushType: "fill",
        },
        zlevel: 1, // 所有图形的 zlevel 值。
        data: points.value,
      },
      {
        // 线条系列数据
        type: "lines",
        zlevel: 2,
        symbol: ["none", "arrow"], // 标记的图形: 箭头
        symbolSize: 10, // 标记的大小
        effect: {
          // 线条特效的配置
          show: true,
          period: 6, // 特效动画的时间，单位s
          trailLength: 0, // 特效尾迹的长度。取值[0,1]值越大，尾迹越重
          symbol: planePath, // 特效图形的标记 可选'circle'等
          symbolSize: 15, // 特效标记的大小
        },
        lineStyle: {
          // 线条样式
          normal: {
            color: "#93EBF8",
            width: 2.5, // 线条宽度
            opacity: 0.6, // 尾迹线条透明度
            curveness: 0.2, // 尾迹线条曲直度
          },
        },
        data: linesData.value,
      },
    ],
  };
  // 地图注册，第一个参数的名字必须和option.geo.map一致
  echarts.registerMap("china", /**/ mapData);
  charts.setOption(option);
}
```

### 步骤 5: 在模板中添加地图容器

在你的Vue组件的模板中，添加一个容器来承载地图：

```html
<template>
  <div class="content">
    <div
      ref="charts"
      style="width: 1200px; height: 100vh; margin: 0 auto"
    ></div>
  </div>
</template>
```

### 步骤 6: 调整和优化

```css
.content {
  background-color: #0e2152;
  height: 100%;
}
```

根据你的实际需求，你可以调整地图的样式、颜色、数据等。你还可以为地图添加交互，如点击事件、提示框等。

### 立体效果

![在这里插入图片描述](https://img-blog.csdnimg.cn/direct/419588282ea349108847f1fd980490ea.png#pic_center)



```vue
<template>
  <div class="content">
    <div class="chart-container">
      <div ref="upperChartContainer" class="upper-chart"></div>
      <div ref="lowerChartContainer" class="lower-chart"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import jiangxi from "@/assets/jiangxi.json";
const mapData: any = jiangxi;
const upperChartContainer = ref<HTMLElement | null>(null);
const lowerChartContainer = ref<HTMLElement | null>(null);
let upperChart: echarts.ECharts | null = null;
let lowerChart: echarts.ECharts | null = null;

onMounted(() => {
  upperChart = echarts.init(upperChartContainer.value!);
  lowerChart = echarts.init(lowerChartContainer.value!);
  initUpperChart();
  initLowerChart();
  addClickEventListener();
});

onBeforeUnmount(() => {
  if (upperChart) {
    upperChart.dispose();
    upperChart = null;
  }
  if (lowerChart) {
    lowerChart.dispose();
    lowerChart = null;
  }
});

function initUpperChart() {
  echarts.registerMap("jiangxi", mapData);

  const option: echarts.EChartsOption = {
    backgroundColor: "transparent",
    series: [
      {
        type: "map",
        map: "jiangxi",
        roam: false,
        emphasis: {
          label: {
            show: true,
          },
        },
        itemStyle: {
          areaColor: "#0e2152", // 上层地图颜色
        },
        data: [],
      },
    ],
  };

  if (upperChart) {
    upperChart.setOption(option);
  }
}

function initLowerChart() {
  echarts.registerMap("jiangxi", mapData);

  const option: echarts.EChartsOption = {
    backgroundColor: "transparent",
    title: {
      text: "地图",
      left: "center",
      textStyle: {
        color: "#000",
        fontSize: 28,
      },
    },
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        // const { name, center, centroid } = params;
        return `地区名称: ${params.name}<br/>ID: ${params.dataIndex}`;
      },
    },
    series: [
      {
        type: "map",
        map: "jiangxi",
        roam: false,
        emphasis: {
          label: {
            show: true,
          },
        },
        itemStyle: {
          areaColor: "#fff", // 下层地图颜色
        },
        label: {
          show: true,
        },
        data: [],
      },
    ],
  };

  if (lowerChart) {
    lowerChart.setOption(option);
  }
}

function addClickEventListener() {
  if (lowerChart) {
    lowerChart.on("click", (params: any) => {
      if (params.name) {
        console.log("点击了上层地图区域：" + params.name);
      }
    });
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 800px;
}

.upper-chart {
  width: 100%;
  height: 100vh; /* 总高度为 800 像素，上下距离为 50 像素，因此上层地图高度为 750 像素 */
}

.lower-chart {
  width: 100%;
  height: 100vh;
  transform: translateY(-101vh) translateX(-10px);
}
</style>
```
