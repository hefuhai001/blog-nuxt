# 实现实时数据推送：SpringBoot中SSE接口的两种方法

## 二、项目环境准备
### 1. 基础依赖
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- 若使用WebFlux方式 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

---

## 三、两种实现方式对比
| 特性       | 传统Servlet方式  | WebFlux响应式方式    |
| ---------- | ---------------- | -------------------- |
| 线程模型   | 阻塞IO（线程池） | 非阻塞IO（事件循环） |
| 资源消耗   | 较高             | 较低                 |
| 代码复杂度 | 需手动管理线程   | 声明式编程           |
| 适用场景   | 简单低频场景     | 高并发实时场景       |

---

## 四、传统Servlet实现（基于SseEmitter）
### 1. 控制器实现
```java
@RestController
public class SseController {

    @GetMapping("/sse")
    public SseEmitter handleSse() {
        SseEmitter emitter = new SseEmitter();
        ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();

        Runnable task = () -> {
            try {
                String data = "Time: " + LocalDateTime.now();
                emitter.send(
                    SseEmitter.event()
                        .data(data)
                        .id(String.valueOf(System.currentTimeMillis()))
                );
            } catch (IOException e) {
                emitter.completeWithError(e);
                executor.shutdown();
            }
        };

        // 定时发送（立即执行，每秒一次）
        executor.scheduleAtFixedRate(task, 0, 1, TimeUnit.SECONDS);

        // 客户端断开处理
        emitter.onCompletion(executor::shutdown);
        emitter.onTimeout(executor::shutdown);

        return emitter;
    }
}
```

### 2. 关键点解析
- **SseEmitter**：核心类，保持长连接
- **ScheduledExecutorService**：定时任务线程池
- **事件结构**：支持设置id/event/data等字段
- **资源释放**：通过onCompletion/onTimeout确保线程池关闭

---

## 五、响应式实现（基于WebFlux）
### 1. 控制器实现
```java
@RestController
public class SseWebFluxController {

    @GetMapping(value = "/sse-stream", 
               produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamEvents() {
        return Flux.interval(Duration.ofSeconds(1))
            .map(sequence -> ServerSentEvent.<String>builder()
                .id(String.valueOf(sequence))
                .event("time-update")
                .data("SSE from WebFlux - " + LocalDateTime.now())
                .build());
    }
}
```

### 2. 核心优势
- **非阻塞IO**：基于Reactor库实现响应式流
- **自动背压**：处理客户端消费速度差异
- **简洁API**：使用Flux流式编程

---

## 六、接口测试方法
### 1. 使用curl测试
```bash
curl http://localhost:8080/sse
curl http://localhost:8080/sse-stream
```

### 2. 前端示例
```html
<script>
const eventSource = new EventSource('/sse');

eventSource.onmessage = (e) => {
    console.log('Received:', e.data);
};

eventSource.addEventListener('time-update', (e) => {
    console.log('Custom event:', e.data);
});
</script>
```

---

## 七、生产环境注意事项
1. **连接管理**：设置合理的超时时间（默认30秒）
2. **错误处理**：添加onError回调记录异常
3. **跨域配置**：需要配置CORS
   ```java
   @Configuration
   public class WebConfig implements WebMvcConfigurer {
       @Override
       public void addCorsMappings(CorsRegistry registry) {
           registry.addMapping("/sse*")
                   .allowedOrigins("*");
       }
   }
   ```
4. **性能监控**：跟踪活跃连接数
