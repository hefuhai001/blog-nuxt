# Spring Boot 中使用 Redis：从入门到实战

## 一、添加 Redis 依赖

在 Spring Boot 项目中，集成 Redis 非常简单。首先，你需要在项目的 `pom.xml` 文件中添加以下依赖：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```
这个依赖会自动引入 Spring Data Redis 的相关功能，并配置默认的 Redis 客户端连接。

如果你需要使用 Lettuce 作为 Redis 客户端（默认客户端），可以显式添加 Lettuce 依赖：
```xml
<dependency>
    <groupId>io.lettuce.core</groupId>
    <artifactId>lettuce-core</artifactId>
</dependency>
```

## 二、配置 Redis 连接

在 `application.properties` 或 `application.yml` 文件中配置 Redis 的连接信息。

### application.properties 示例
```properties
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.password=  # 如果设置了密码
spring.redis.database=0  # 数据库索引，默认为 0
```

### application.yml 示例
```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password:  # 如果设置了密码
    database: 0  # 数据库索引，默认为 0
```

## 三、自定义 Redis 配置（可选）

如果你需要自定义 `RedisTemplate` 的序列化方式，可以创建一个配置类。默认情况下，Spring Data Redis 使用 `JdkSerializationRedisSerializer` 对象序列化器，这可能导致一些问题，例如存储的键值对是二进制格式，难以直接查看。因此，推荐使用 `StringRedisSerializer`。

### Redis 配置类
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }
}
```

## 四、使用 `RedisTemplate` 进行基本操作

通过注入 `RedisTemplate` 或 `StringRedisTemplate`，你可以轻松地操作 Redis。以下是一些常见的操作示例。

### 1\. 增删改查操作

#### RedisService.java
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisService {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // 存储数据
    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    // 存储数据并设置过期时间
    public void setWithExpire(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }

    // 获取数据
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    // 删除数据
    public void delete(String key) {
        redisTemplate.delete(key);
    }
}
```

### 2\. 创建临时数据并自动删除

通过设置过期时间，可以创建临时数据。当数据过期时，Redis 会自动删除它们。

#### RedisService.java（临时数据）
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisService {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // 创建临时数据并设置过期时间
    public void createTemporaryData(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }
}
```

### 3\. 测试 Redis 功能

创建一个控制器来测试 Redis 功能。

#### RedisController.java
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/redis")
public class RedisController {
    @Autowired
    private RedisService redisService;

    @PostMapping("/set")
    public String set(@RequestParam String key, @RequestParam String value) {
        redisService.set(key, value);
        return "Set successfully";
    }

    @GetMapping("/get")
    public Object get(@RequestParam String key) {
        return redisService.get(key);
    }

    @DeleteMapping("/delete")
    public String delete(@RequestParam String key) {
        redisService.delete(key);
        return "Deleted successfully";
    }

    @PostMapping("/setWithExpire")
    public String setWithExpire(@RequestParam String key, @RequestParam String value, @RequestParam long timeout) {
        redisService.setWithExpire(key, value, timeout, TimeUnit.SECONDS);
        return "Set with expire successfully";
    }
}
```

## 五、运行应用

确保 Redis 服务器正在运行，然后启动 Spring Boot 应用。你可以通过以下方式测试：
- 存储数据：`POST http://localhost:8080/api/redis/set?key=myKey&value=myValue`
- 获取数据：`GET http://localhost:8080/api/redis/get?key=myKey`
- 删除数据：`DELETE http://localhost:8080/api/redis/delete?key=myKey`
- 存储带过期时间的数据：`POST http://localhost:8080/api/redis/setWithExpire?key=myKey&value=myValue&timeout=10`

## 六、高级功能

### 1\. 设置数据过期时间

在 Redis 中，可以通过设置过期时间（TTL）来让数据在指定时间后自动删除。这在实现缓存、会话管理等场景中非常有用。

#### 示例代码
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisService {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // 设置数据过期时间
    public void setWithExpire(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }
}
```

### 2\. 使用 Redis 的其他数据结构

Redis 不仅支持简单的键值对存储，还支持多种数据结构，如列表、集合、有序集合等。这些数据结构可以用于实现更复杂的业务逻辑。

#### 示例代码（使用列表）
```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RedisService {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // 向列表中添加元素
    public void addToList(String key, Object value) {
        redisTemplate.opsForList().rightPush(key, value);
    }

    // 从列表中获取所有元素
    public List<Object> getAllFromList(String key) {
        return redisTemplate.opsForList().range(key, 0, -1);
    }
}
```

## 参考资料
- [Spring Boot 官方文档](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Data Redis 官方文档](https://docs.spring.io/spring-data/redis/docs/current/reference/html/)
- [Redis 官方文档](https://redis.io/documentation)
