# Spring Boot Actuator

基于 **Spring Boot Actuator + Vue 3** 的应用监控平台，实时展示 JVM、健康状态、业务指标等数据。

## 技术栈总览

| 层级 | 技术 | 版本 |
|------|------|------|
| 后端框架 | Spring Boot | 2.7.14 |
| JDK | Java | 17 |
| 前端框架 | Vue | 3.5 |
| 构建工具 | Vite | 8.x |
| UI 组件库 | Element Plus | 2.3 |
| 图表库 | ECharts | 5.4 |
| 指标标准 | Micrometer + Prometheus | - |

---

## 后端核心依赖

### Spring Boot Actuator — 监控骨架

生产级监控的基石，开箱即用暴露以下端点：

| 端点 | 用途 |
|------|------|
| `/actuator/health` | 应用健康状态（DB、Redis、Disk 等组件级检测） |
| `/actuator/metrics` | JVM 内存、GC、线程池、HTTP 请求等系统指标 |
| `/actuator/env` | 配置属性、环境变量、系统属性 |
| `/actuator/info` | 自定义应用信息 |
| `/actuator/prometheus` | Prometheus 格式的指标抓取接口 |

本项目的 `application.yml` 中配置了 `exposure.include: "*"`，全部端点开放，并开启了 CORS 跨域支持。

### Micrometer — 指标门面

Spring Boot 内置的度量抽象层，屏蔽了 Prometheus / Graphite / InfluxDB 等底层监控系统的差异。

项目中通过 `MeterRegistry` 注册了三类自定义业务指标：

```java
// 计数器：API 请求总量、错误总量
Counter.builder("api.requests.total").register(meterRegistry);
Counter.builder("api.errors.total").register(meterRegistry);

// 计时器：API 请求耗时分布（含 P50/P95/P99 分位数）
Timer.builder("api.request.duration").register(meterRegistry);

// 仪表盘：当前活跃会话数
meterRegistry.gauge("app.active.sessions", new AtomicInteger(0));
```

同时自定义了一个 Actuator Endpoint `@Endpoint(id = "custom-metrics")`，通过 `/actuator/custom-metrics` 聚合暴露上述指标。

### micrometer-registry-prometheus — Prometheus 适配器

将 Micrometer 收集的指标转为 Prometheus 文本格式（以 `# HELP` / `# TYPE` 开头的文本协议），供 Prometheus Server 定时拉取。

### Spring Security — Actuator 端点鉴权

保护 `/actuator/**` 路径，本项目使用 Basic Auth（admin/admin123）。前端 Vite 代理层在转发请求时自动携带 `Authorization` 头。

---

## 前端核心依赖

### ECharts 5 — 数据可视化

Dashboard 和 Metrics 页面的图表引擎。本项目中用于渲染：
- JVM 堆内存 / 非堆内存时序折线图
- GC 次数与耗时统计图
- 线程数、类加载数趋势图
- 自定义业务指标实时曲线

### Element Plus — UI 组件库

Vue 3 的 Ant Design 级别组件方案，项目中大量使用：
- `el-card` — 各监控模块的卡片容器
- `el-descriptor` — 键值对型指标展示（如 JVM 参数）
- `el-table` — 环境变量 / 系统属性表格
- `el-tag` — 健康状态颜色标识

### Axios — HTTP 客户端

封装了对后端 `/api/*` 和 `/actuator/*` 的调用，配合 Vite 开发代理解决跨域问题。

### @vueuse/core — 组合式 API 工具集

环境监控模块中使用了 VueUse 的响应式工具：
- `useWindowSize` — 响应式窗口尺寸
- `useEventListener` — 事件监听封装
- 响应式 `ref` / `computed` 增强

### Day.js — 日期处理

轻量级日期库（< 2KB），替代 Moment.js，用于格式化时间戳显示。

### Vite 8 — 前端构建工具

开发服务器配置了两个代理规则：
```
/api/*     → http://localhost:8080   （业务 API）
/actuator/* → http://localhost:8080   （Actuator 端点，自动携带 Basic Auth）
```

---

## 项目结构

```
monitor-platform/
├── monitor-server/          # Spring Boot 后端
│   └── src/main/java/
│       ├── config/          # SecurityConfig（放行静态资源和 Actuator）
│       ├── controller/      # MonitorController（模拟业务接口）
│       ├── endpoint/        # CustomMetricsEndpoint（自定义 Actuator 端点）
│       └── service/         # BusinessMetricsService（指标埋点逻辑）
├── monitor-ui/              # Vue 3 前端
│   └── src/
│       ├── components/      # 页面组件
│       │   ├── Dashboard.vue      # 总览面板（ECharts 图表）
│       │   ├── Environment.vue    # JVM / 环境 / 系统属性
│       │   ├── Health.vue         # 健康检查详情
│       │   ├── Metrics.vue        # Micrometer 指标明细
│       │   └── BusinessMonitor.vue # 自定义业务指标
│       └── assets/
│           └── environment/composables/  # useEnvironment / useJvmMetrics / useMemoryChart
└── README.md
```

## 快速启动

```bash
# 1. 启动后端（端口 8080）
cd monitor-server
mvnw spring-boot:run

# 2. 启动前端（端口 3000）
cd monitor-ui
npm install && npm run dev

# 3. 浏览器访问 http://localhost:3000
```
