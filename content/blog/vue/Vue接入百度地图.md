# vue3接入百度地图的基本步骤及代码实现:

1. 引入百度地图API

在页面头部引入百度地图API

``` html
<script src="http://api.map.baidu.com/api?v=3.0&ak=您的密钥"></script>
```

其中，`ak` 是您的百度地图 API 密钥。如果您还没有密钥，可以在 [这里](https://lbsyun.baidu.com/index.php?title=jspopular3.0/guide/getkey) 进行申请。

2. 在 vue3 组件中创建地图

在 `mounted` 钩子函数中创建地图实例：

```javascript
mounted() {
    const map = new BMap.Map("map-container");  
    //开始初始地图 
    map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);
    // 开启鼠标滚轮缩放
    map.enableScrollWheelZoom(true);
}
```

其中，`map-container` 是在页面中预设的地图容器。

3. 添加标注

在地图中添加标注，示例代码如下：

```javascript
// 创建标注
const marker = new BMap.Marker(new BMap.Point(116.404, 39.915));
// 添加标注到地图
map.addOverlay(marker);
```

4. 获取当前位置

获取当前位置并在地图中进行显示

```javascript
// 定位当前位置
var geolocation = new BMap.Geolocation();
geolocation.getCurrentPosition(function(r) {
    if(this.getStatus() == BMAP_STATUS_SUCCESS){
        // 显示当前位置
        map.panTo(r.point);
    }else {
        alert('failed'+this.getStatus());
    }        
},{enableHighAccuracy: true})
```

至此，您就可以在您的 vue3 项目中集成百度地图了。

完整代码示例：

```html
<template>
  <el-card style="height: calc(100vh - 80px);" shadow="hover">
    <div id="map-container" style="width: 100%; height: 640px;"></div>
  </el-card>
</template>

<script>
export default {
  mounted() {
    //开始初始地图
    // eslint-disable-next-line no-undef
    const map = new BMap.Map("map-container");
    // 设置中心点和缩放级别
    // eslint-disable-next-line no-undef
    map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);
    // 添加控件，如缩放控件
    // eslint-disable-next-line no-undef
    map.addControl(new BMap.NavigationControl());
    // 开启鼠标滚轮缩放
    map.enableScrollWheelZoom(true);

    // 定位当前位置
    // eslint-disable-next-line no-undef
    const geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function (r) {
      if (this.getStatus() == 0) {
        // eslint-disable-next-line no-undef
        const point = new BMap.Point(r.point.lng, r.point.lat);
        // eslint-disable-next-line no-undef
        const marker = new BMap.Marker(point);
        map.addOverlay(marker);
        map.panTo(point); // 显示当前位置
      }
    });
  },
};
</script>

```
