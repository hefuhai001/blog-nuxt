# Spring Boot 应用结合 Knife4j 进行 API 分组授权管理配置

## 环境准备

首先，确保你的项目中已经添加了 Knife4j 的依赖：

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
    <version>4.5.0</version>
</dependency>
```

## 配置 Swagger

在 `application.yml` 文件中，你可以配置 Swagger 的相关属性，包括 API 文档的路径、分组配置以及Knife4j的特定设置：

```yaml
springdoc:
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: order
  api-docs:
    path: /v3/api-docs
  group-configs:
    - group: '通用模块'
      paths-to-match: '/**'
      packages-to-scan: com.example.springboot.common.controller
    - group: '系统模块'
      paths-to-match: '/**'
      packages-to-scan: com.example.springboot.system.controller
    - group: '用户模块'
      paths-to-match: '/**'
      packages-to-scan: com.example.springboot.user.controller

knife4j:
  enable: true
  setting:
    language: zh_cn
    enable-footer-custom: true
    footer-custom-content: "Apache License 2.0 | Copyright xiao he like sleep"
  basic:
    enable: true
    username: username
    password: password
```

## 配置 Swagger OpenAPI

在 Spring Boot 应用中，你需要定义一个配置类来配置 OpenAPI 的信息：

```java
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI springShopOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("API管理系统")
                        .contact(new Contact().name("xiaohelikesleep").email("2109664977@qq.com"))
                        .description("API管理系统文档")
                        .version("v1.0")
                        .license(new License().name("Apache 2.0").url("http://springdoc.org")))
                .externalDocs(new ExternalDocumentation()
                        .description("外部文档")
                        .url("https://springshop.wiki.github.org/docs"))
                .addSecurityItem(new SecurityRequirement().addList(HttpHeaders.AUTHORIZATION))
                .components(new Components().addSecuritySchemes(
                        HttpHeaders.AUTHORIZATION,
                        new SecurityScheme()
                                .name(HttpHeaders.AUTHORIZATION)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("Bearer")
                                .in(SecurityScheme.In.HEADER)
                                .bearerFormat("JWT")
                ));
    }
}
```

## 自定义 Swagger UI 底部版权信息

通过 `knife4j.setting.enable-footer-custom` 属性，你可以自定义 Swagger UI 底部的版权信息：

```yaml
knife4j:
  enable: true
  setting:
    language: zh_cn
    enable-footer-custom: true
    footer-custom-content: "Apache License 2.0 | Copyright xiao he like sleep"
  basic:
    enable: true
    username: 1
    password: 1
```

## 启动应用

在 `main` 方法中，你可以记录应用启动的信息，包括应用名称、本地 URL 和文档 URL：

```java
public static void main(String[] args) {
    ConfigurableEnvironment env = SpringApplication.run(ApiApplication.class, args).getEnvironment();
    String applicationName = env.getProperty("spring.application.name");
    String serverPort = env.getProperty("server.port");
    String serverIp = env.getProperty("ip");

    log.info(
            "----------------------------------------------------------%n" +
            "Application: '%s' is running Success!%n" +
            "Local URL:    http://{}:{}%n" +
            "Document:     http://{}:{}/doc.html%n" +
            "----------------------------------------------------------",
            applicationName, serverIp, serverPort, serverIp, serverPort);
}
```
