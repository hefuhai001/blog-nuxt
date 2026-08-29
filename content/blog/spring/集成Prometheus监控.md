# Spring Boot 3 秒级接入 Prometheus

> 关键词：Spring Boot、Actuator、Prometheus、可观测性、监控、指标

## 一、可观测

Prometheus + Grafana 组合已经成为云原生监控的事实标准：  
- Prometheus 负责 **拉取 & 存储** 指标  
- Grafana 负责 **可视化 & 告警**  

---

## 二、3 步完成接入

### ① 引入依赖（pom.xml）

```xml
<project …>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.5.0</version>
    </parent>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Web 依赖，非必须，但通常会有 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- 1. Actuator 暴露端点 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- 2. Prometheus 注册表 -->
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-registry-prometheus</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
</project>
```

### ② 配置文件（application.properties）

```properties
spring.application.name=springboot-actuator
server.port=8000

# 只暴露必要的端点，减少攻击面
management.endpoints.web.exposure.include=health,info,prometheus
# 健康检查详情默认不开启，按需打开
management.endpoint.health.show-details=always
# 允许 Prometheus 不限权访问（如走内网可保持默认）
management.endpoint.prometheus.access=unrestricted
# 启用 Prometheus 输出格式
management.prometheus.metrics.export.enabled=true
```

### ③ 启动类（一行代码验证）

```java
@SpringBootApplication
public class SpringbootActuatorApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringbootActuatorApplication.class, args);
        // 启动后控制台直接给出关键地址，方便调试
        System.out.println("http://localhost:8000/actuator/prometheus");
        System.out.println("http://localhost:8000/actuator/health");
    }
}
```

---

## 三、验证效果

启动应用，浏览器访问：

```
http://localhost:8000/actuator/prometheus
```

返回大量 `HELP` / `TYPE` 开头的文本，即表明 **Micrometer 已自动把 JVM、Tomcat、CPU、内存、GC、自定义业务指标** 等以 Prometheus 格式暴露出来。

再探一探其他常用端点：

| 端点                                | 作用                                   |
| ----------------------------------- | -------------------------------------- |
| `/actuator/health`                  | 应用健康度（磁盘、数据库、自定义探针） |
| `/actuator/metrics`                 | 所有指标名列表                         |
| `/actuator/metrics/jvm.memory.used` | 具体某一项指标                         |
| `/actuator/env`                     | 当前环境变量 / 配置属性                |

---

## 四、Prometheus 侧配置（30 秒拉一次）

在 `prometheus.yml` 追加：

```yaml
scrape_configs:
  - job_name: 'springboot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8000']
```

重启 Prometheus，打开 `http://localhost:9090` → Status → Targets，看到 `springboot` 状态为 **UP** 即成功。

---

## 五、Grafana 大盘（5 分钟出图）

1. 导入官方模板  
   - JVM 监控：**模板 ID 4701**  
   - Spring Boot 统计：**模板 ID 10280**  
2. 选择数据源 → Prometheus → 导入 → 立即出图

---

## 六、自定义业务指标（彩蛋）

除了 JVM 自带的，我们还可以埋点自己的 QPS、订单数、支付成功率等。

```java
@RestController
@RequestMapping("/order")
public class OrderController {

    private final Counter orderCounter = Counter.builder("order_created_total")
            .description("累计下单量")
            .register(Metrics.globalRegistry);

    @GetMapping("/create")
    public String create() {
        orderCounter.increment();          // +1
        return "ok";
    }
}
```

访问 `/order/create` 几次，再回头看 Prometheus：

```
order_created_total 5.0
```

大盘里即可绘制“今日下单速率”曲线。

---

## 七、常见坑 & 小贴士

| 现象                                     | 原因 & 解决                                                  |
| ---------------------------------------- | ------------------------------------------------------------ |
| `/actuator/prometheus` 404               | 没引入 `micrometer-registry-prometheus` 或没开启 `management.prometheus.metrics.export.enabled=true` |
| 指标太多拖慢应用                         | 通过 `management.metrics.enable.*=false` 关闭不关心的指标    |
| Prometheus 报“context deadline exceeded” | 抓取超时，调大 `scrape_timeout` 或减少单次返回数据量         |
| 本地调试端口冲突                         | 改 `server.port` 或 Prometheus 的 targets 即可               |

---

## 八、总结

1. **加依赖** → **改配置** → **验证端点**，3 步完成 Prometheus 接入。  
2. Actuator 端点按需暴露，内网可全开，公网务必加鉴权或关闭。  
3. 业务代码使用 `Counter/Gauge/Timer` 即可无缝插入自定义指标。  
4. Prometheus + Grafana 组合让你对 **“系统实时状态”** 一目了然，告警、容量规划、故障定位效率翻倍。

**“可观测”不是锦上添花，而是微服务的底线能力。**  
现在就把文章里的配置贴进项目，**重启一次，你就拥有了云原生监控的入场券。**

---

> 源码地址（GitHub）：`https://github.com/example/springboot-actuator-prometheus`  
> 欢迎 Star & PR，一起完善更多监控场景！
