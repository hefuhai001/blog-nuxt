# H5实现Web ECharts教程：轻松创建动态数据图表

## 简介

ECharts是一款由百度前端团队开发的开源可视化库，它提供了丰富的图表类型和灵活的配置选项，使得开发者能够轻松地在Web页面上创建交互式的图表。无论是简单的柱状图、折线图，还是复杂的关系图、地图，ECharts都能够提供强大的支持。

## ECharts概述

ECharts的核心理念是“让数据可视化变得简单”，它不仅支持多种数据格式，还提供了丰富的API接口和详细的配置项，使得开发者可以根据需求定制图表。ECharts的另一个亮点是其优秀的交互性能，包括数据缩放、拖拽、值域漫游等，为用户提供了丰富的交互体验。

## ECharts官网与资源下载

ECharts的官方网站是 [ECharts GitHub](https://github.com/apache/echarts)，你可以在这里找到最新的开发文档、示例代码以及源代码。ECharts的使用非常简单，你可以直接通过CDN引入，或者下载源文件进行本地部署。

### CDN引入

通过CDN是引入ECharts最快捷的方式，只需在HTML文件的`<head>`标签中添加以下代码：

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5.3.3/dist/echarts.js"></script>
```

### 源文件下载

如果你需要对ECharts进行更深入的定制或者贡献代码，可以在ECharts的GitHub仓库中下载最新的源文件。

## 创建第一个ECharts图表

以下是一个简单的ECharts图表示例，展示了如何在H5页面中创建一个基本的柱状图。

1. **创建HTML结构**：

首先，我们需要创建一个具有确定宽高的`<div>`元素，用于放置ECharts图表。

```html
<div id="main" style="width: 600px;height:400px;"></div>
```

2. **引入ECharts库**：

在页面中通过`<script>`标签引入ECharts库。

```html
<script src="echarts.js"></script>
```

3. **初始化ECharts实例**：

在`<script>`标签内，通过`echarts.init`方法初始化一个ECharts实例，并将其绑定到我们之前创建的`<div>`元素上。

```javascript
var myChart = echarts.init(document.getElementById('main'));
```

4. **配置图表选项**：

定义一个`option`对象，包含图表的类型、标题、轴、提示框等配置信息。

```javascript
var option = {
  title: {
    text: 'ECharts 入门示例'
  },
  tooltip: {},
  legend: {
    data: ['销量']
  },
  xAxis: {
    data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
  },
  yAxis: {},
  series: [
    {
      name: '销量',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20]
    }
  ]
};
```

5. **渲染图表**：

使用`setOption`方法将配置项应用到ECharts实例上，渲染图表。

```javascript
myChart.setOption(option);
```

## 全部代码

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ECharts</title>
    <!-- 引入刚刚下载的 ECharts 文件 -->
    <script src="echarts.js"></script>
    <!-- cdn引入 -->
    <!-- <script src="https://cdn.jsdelivr.net/npm/echarts@5.3.3/dist/echarts.js"></script> -->
  </head>
  <body>
    <!-- 为 ECharts 准备一个定义了宽高的 DOM -->
    <div id="main" style="width: 600px;height:400px;"></div>
    <script type="text/javascript">
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('main'));

      // 指定图表的配置项和数据
      var option = {
        //标题
        title: {
          text: 'ECharts 入门示例'
        },
        //提示框
        tooltip: {},
        //柱状元素名字
        legend: {
          data: ['销量']
        },
        //X轴
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        //Y轴
        yAxis: {},
        series: [
          {
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    </script>
  </body>
</html>
```
