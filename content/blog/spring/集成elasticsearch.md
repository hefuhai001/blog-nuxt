# Spring Boot 整合 Elasticsearch 实战教程

本文将带你从零开始，使用 Spring Boot 整合 Elasticsearch，实现一个完整的图书管理搜索功能。

## 一、准备工作

### 1.1 版本说明

Spring Boot 与 Elasticsearch 之间存在版本兼容性问题，务必确认版本对应关系。以下是常见兼容组合：

| Spring Boot 版本 | Spring Data Elasticsearch | Elasticsearch 版本 |
| ---------------- | ------------------------- | ------------------ |
| 2.5.x            | 4.2.x                     | 7.10.x             |
| 2.6.x            | 4.3.x                     | 7.15.x             |
| 2.7.x            | 4.4.x                     | 7.17.x             |
| 3.0.x            | 5.0.x                     | 8.x                |

**本教程使用**：Spring Boot 2.5.5 + Elasticsearch 7.10.2

### 1.2 启动 Elasticsearch

使用 Docker 快速启动：

```bash
# 拉取镜像
docker pull elasticsearch:7.10.2

# 运行容器
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  elasticsearch:7.10.2
```

访问 `http://localhost:9200`，看到如下信息表示启动成功：

```json
{
  "name" : "node-1",
  "cluster_name" : "docker-cluster",
  "version" : { "number" : "7.10.2" }
}
```

## 二、创建 Spring Boot 项目

### 2.1 添加依赖

在 `pom.xml` 中添加以下依赖：

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.5.5</version>
</parent>

<dependencies>
    <!-- Spring Boot Web 依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Data Elasticsearch 依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
    </dependency>
    
    <!-- Elasticsearch 高级客户端 -->
    <dependency>
        <groupId>org.elasticsearch.client</groupId>
        <artifactId>elasticsearch-rest-high-level-client</artifactId>
        <version>7.10.2</version>
    </dependency>
    
    <!-- Lombok 简化代码 -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

### 2.2 配置文件

在 `application.yml` 中配置 Elasticsearch 连接：

```yaml
spring:
  elasticsearch:
    rest:
      uris: http://localhost:9200
  data:
    elasticsearch:
      repositories:
        enabled: true

logging:
  level:
    org.springframework.data.elasticsearch: DEBUG
```

## 三、核心代码实现

### 3.1 实体类

创建 `Book.java`，使用注解映射 Elasticsearch 文档：

```java
package com.example.es.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Document(indexName = "books", shards = 3, replicas = 1)
public class Book {
    
    @Id
    private String id;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word", searchAnalyzer = "ik_smart")
    private String title;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String author;
    
    @Field(type = FieldType.Keyword)
    private String category;
    
    @Field(type = FieldType.Double)
    private BigDecimal price;
    
    @Field(type = FieldType.Integer)
    private Integer stock;
    
    @Field(type = FieldType.Date, format = {}, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date publishDate;
    
    @Field(type = FieldType.Text, analyzer = "ik_max_word")
    private String description;
}
```

**注解说明**：
- `@Document`：指定索引名称、分片数（shards）和副本数（replicas）
- `@Id`：文档唯一标识，对应 ES 中的 `_id`
- `@Field`：字段映射配置，`type` 指定数据类型，`analyzer` 指定分词器

### 3.2 Repository 层

创建 `BookRepository.java`，继承 `ElasticsearchRepository`：

```java
package com.example.es.repository;

import com.example.es.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends ElasticsearchRepository<Book, String> {
    
    // 根据作者精确查询
    List<Book> findByAuthor(String author);
    
    // 根据价格范围查询
    List<Book> findByPriceBetween(BigDecimal min, BigDecimal max);
    
    // 标题模糊匹配（全文检索）
    Page<Book> findByTitleContaining(String keyword, Pageable pageable);
    
    // 多字段组合查询
    Page<Book> findByTitleContainingOrAuthorContaining(String titleKeyword, String authorKeyword, Pageable pageable);
    
    // 使用自定义 DSL 查询（价格大于某值且标题匹配）
    @Query("{\"bool\": {\"must\": [{\"match\": {\"title\": \"?0\"}}, {\"range\": {\"price\": {\"gt\": \"?1\"}}}]}}")
    Page<Book> searchByTitleAndPriceGt(String title, BigDecimal minPrice, Pageable pageable);
}
```

**方法命名规则**：Spring Data Elasticsearch 支持根据方法名自动生成查询
- `findBy` + 字段名 + `Containing`：模糊匹配
- `findBy` + 字段名 + `Between`：范围查询
- `findBy` + 字段名1 + `Or` + 字段名2 + `Containing`：多字段或查询

### 3.3 Service 层

创建 `BookService.java` 实现业务逻辑：

```java
package com.example.es.service;

import com.example.es.entity.Book;
import com.example.es.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {
    
    private final BookRepository bookRepository;
    private final ElasticsearchRestTemplate elasticsearchRestTemplate;
    
    /**
     * 保存单本书籍
     */
    public Book save(Book book) {
        return bookRepository.save(book);
    }
    
    /**
     * 批量保存
     */
    public Iterable<Book> saveAll(List<Book> books) {
        return bookRepository.saveAll(books);
    }
    
    /**
     * 根据 ID 查询
     */
    public Optional<Book> findById(String id) {
        return bookRepository.findById(id);
    }
    
    /**
     * 查询所有（分页）
     */
    public Page<Book> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishDate").descending());
        return bookRepository.findAll(pageable);
    }
    
    /**
     * 根据 ID 删除
     */
    public void deleteById(String id) {
        bookRepository.deleteById(id);
    }
    
    /**
     * 全文检索（标题或作者）
     */
    public Page<Book> search(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return bookRepository.findByTitleContainingOrAuthorContaining(keyword, keyword, pageable);
    }
    
    /**
     * 复杂条件查询（使用 NativeSearchQueryBuilder）
     */
    public List<Book> complexSearch(String keyword, String category, BigDecimal minPrice, BigDecimal maxPrice) {
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
        
        // 标题匹配
        if (keyword != null && !keyword.isEmpty()) {
            boolQuery.must(QueryBuilders.matchQuery("title", keyword));
        }
        
        // 分类精确匹配
        if (category != null && !category.isEmpty()) {
            boolQuery.must(QueryBuilders.termQuery("category", category));
        }
        
        // 价格范围
        if (minPrice != null) {
            boolQuery.must(QueryBuilders.rangeQuery("price").gte(minPrice));
        }
        if (maxPrice != null) {
            boolQuery.must(QueryBuilders.rangeQuery("price").lte(maxPrice));
        }
        
        NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder()
                .withQuery(boolQuery)
                .withSort(Sort.by("publishDate").descending());
        
        SearchHits<Book> searchHits = elasticsearchRestTemplate.search(queryBuilder.build(), Book.class);
        
        return searchHits.getSearchHits().stream()
                .map(SearchHit::getContent)
                .collect(Collectors.toList());
    }
}
```

### 3.4 Controller 层

创建 `BookController.java` 暴露 REST API：

```java
package com.example.es.controller;

import com.example.es.entity.Book;
import com.example.es.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {
    
    private final BookService bookService;
    
    @PostMapping
    public ResponseEntity<Book> create(@RequestBody Book book) {
        return ResponseEntity.ok(bookService.save(book));
    }
    
    @PostMapping("/batch")
    public ResponseEntity<Iterable<Book>> createBatch(@RequestBody List<Book> books) {
        return ResponseEntity.ok(bookService.saveAll(books));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Book> getById(@PathVariable String id) {
        Optional<Book> book = bookService.findById(id);
        return book.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public ResponseEntity<Page<Book>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(bookService.findAll(page, size));
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<Book>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(bookService.search(keyword, page, size));
    }
    
    @GetMapping("/complex-search")
    public ResponseEntity<List<Book>> complexSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        return ResponseEntity.ok(bookService.complexSearch(keyword, category, minPrice, maxPrice));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        bookService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
```

### 3.5 配置类（可选）

如果需要自定义客户端配置，创建 `ElasticsearchConfig.java`：

```java
package com.example.es.config;

import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.RestClients;
import org.springframework.data.elasticsearch.config.AbstractElasticsearchConfiguration;

@Configuration
public class ElasticsearchConfig extends AbstractElasticsearchConfiguration {
    
    @Value("${spring.elasticsearch.rest.uris}")
    private String elasticsearchUrl;
    
    @Override
    @Bean
    public RestHighLevelClient elasticsearchClient() {
        ClientConfiguration clientConfiguration = ClientConfiguration.builder()
                .connectedTo(elasticsearchUrl.replace("http://", ""))
                .build();
        return RestClients.create(clientConfiguration).rest();
    }
}
```

## 四、测试验证

### 4.1 测试数据

创建一个测试类或在 Controller 中添加初始化方法：

```java
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final BookService bookService;
    
    @Override
    public void run(String... args) {
        // 批量插入测试数据
        List<Book> books = Arrays.asList(
            createBook("1", "Spring Boot 实战", "Craig Walls", "编程", new BigDecimal("79.00"), 100, "Spring Boot 入门到精通"),
            createBook("2", "深入理解 Java 虚拟机", "周志明", "编程", new BigDecimal("89.00"), 50, "JVM 底层原理详解"),
            createBook("3", "Elasticsearch 权威指南", "Clinton Gormley", "大数据", new BigDecimal("99.00"), 30, "ES 搜索引擎"),
            createBook("4", "Java 编程思想", "Bruce Eckel", "编程", new BigDecimal("108.00"), 20, "Java 经典著作")
        );
        bookService.saveAll(books);
        System.out.println("初始化数据完成！");
    }
    
    private Book createBook(String id, String title, String author, String category, 
                            BigDecimal price, Integer stock, String description) {
        Book book = new Book();
        book.setId(id);
        book.setTitle(title);
        book.setAuthor(author);
        book.setCategory(category);
        book.setPrice(price);
        book.setStock(stock);
        book.setDescription(description);
        book.setPublishDate(new Date());
        return book;
    }
}
```

### 4.2 API 测试

```bash
# 1. 添加书籍
curl -X POST http://localhost:8080/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Spring Cloud 微服务实战","author":"翟永超","category":"编程","price":69.00,"stock":80}'

# 2. 全文搜索
curl "http://localhost:8080/api/books/search?keyword=Spring&page=0&size=10"

# 3. 复杂查询
curl "http://localhost:8080/api/books/complex-search?keyword=Java&category=编程&minPrice=80&maxPrice=110"

# 4. 分页查询所有
curl "http://localhost:8080/api/books?page=0&size=10"
```

## 五、进阶功能

### 5.1 聚合查询

在 Service 中添加聚合统计方法：

```java
/**
 * 按分类统计书籍数量
 */
public Map<String, Long> aggregateByCategory() {
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder()
            .addAggregation(AggregationBuilders.terms("category_count").field("category.keyword"));
    
    SearchHits<Book> searchHits = elasticsearchRestTemplate.search(queryBuilder.build(), Book.class);
    
    Map<String, Long> result = new HashMap<>();
    ParsedTerms terms = searchHits.getAggregations().get("category_count");
    for (Terms.Bucket bucket : terms.getBuckets()) {
        result.put(bucket.getKeyAsString(), bucket.getDocCount());
    }
    return result;
}
```

### 5.2 高亮显示

```java
/**
 * 带高亮的搜索
 */
public List<SearchHit<Book>> searchWithHighlight(String keyword) {
    NativeSearchQueryBuilder queryBuilder = new NativeSearchQueryBuilder()
            .withQuery(QueryBuilders.matchQuery("title", keyword))
            .withHighlightFields(new HighlightField("title"))
            .withHighlightBuilder(new HighlightBuilder().preTags("<em>").postTags("</em>"));
    
    return elasticsearchRestTemplate.search(queryBuilder.build(), Book.class)
            .getSearchHits();
}
```

## 六、常见问题

### 6.1 版本兼容性问题

如果启动时出现 `NoSuchMethodError` 或类找不到的错误，通常是版本不兼容。解决方案：
1. 查阅 [Spring Data Elasticsearch 官方兼容性列表](https://github.com/spring-projects/spring-data-elasticsearch)
2. 确保 `elasticsearch-rest-high-level-client` 版本与 ES 服务端版本一致

### 6.2 连接超时

在 `application.yml` 中添加超时配置：

```yaml
spring:
  elasticsearch:
    rest:
      uris: http://localhost:9200
      connection-timeout: 5s
      read-timeout: 30s
```

## 总结

本文通过一个完整的图书管理示例，涵盖了 Spring Boot 整合 Elasticsearch 的核心知识点：

1. **依赖配置**：`spring-boot-starter-data-elasticsearch`
2. **实体映射**：`@Document`、`@Field` 注解
3. **数据访问**：继承 `ElasticsearchRepository` 获得 CRUD 能力
4. **方法命名查询**：根据方法名自动生成查询
5. **自定义查询**：`@Query` 注解和 `ElasticsearchRestTemplate`
6. **复杂搜索**：`BoolQueryBuilder` 构建多条件查询

完整的示例代码已包含上述所有内容，你可以直接复制使用。如有问题，欢迎交流讨论！
