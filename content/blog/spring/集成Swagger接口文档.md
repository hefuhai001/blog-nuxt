# Spring Boot 3项目集成Swagger3教程

## 1. 添加依赖

首先，您需要在项目的`pom.xml`文件中添加Swagger3的依赖。同时，为了确保依赖能够正确下载，您可以添加阿里云的Maven镜像仓库。

```xml
        <!--swagger3-->
        <dependency>
            <groupId>com.github.xiaoymin</groupId>
            <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
            <version>4.1.0</version>
        </dependency>


    <repositories>
        <!--阿里云镜像-->
        <repository>
            <id>alimaven</id>
            <name>aliyun maven</name>
            <url>https://maven.aliyun.com/nexus/content/groups/public/</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </repository>
    </repositories>
```

## 2. 配置Swagger

在Spring Boot项目中创建一个配置类`SwaggerConfig`，并添加Swagger的配置信息。

```java
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI springShopOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("标题")
                        .contact(new Contact())
                        .description("我的API文档")
                        .version("v1")
                        .license(new License().name("Apache 2.0").url("http://springdoc.org")))
                .externalDocs(new ExternalDocumentation()
                        .description("外部文档")
                        .url("https://springshop.wiki.github.org/docs"));
    }
}


```

## 3. 实体类和控制层注解

在您的实体类和控制层中使用Swagger注解来描述API。

```java
// 实体类注解示例
import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@Schema(name = "Employee", description = "$!{table.comment}")
public class Emp {
    @ExcelProperty("ID")
    @Schema(description = "ID")
    private int id;
    @ExcelProperty("用户名")
    @Schema(description = "用户名")
    private String names;
    @ExcelProperty("工资")
    @Schema(description = "工资")
    private double salary;
    @ExcelProperty("生日")
    @Schema(description = "生日")
    private Date birthday;
    @ColumnWidth(20)
    @ExcelProperty("头像")
    @Schema(description = "头像")
    private String photo;
    
//    @ColumnWidth(20)
//    @DateTimeFormat("yyyy-MM-dd HH:mm:ss")
//    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
//    @ExcelProperty("创建日期")
//    private Date u_create_time;
}


// 控制层注解示例
import io.swagger.v3.oas.annotations.Operation;

@Operation(summary = "获取所有员工信息")
@GetMapping("/selectAll")
public List<Emp> selectAll() {
    // ...
}
```

## 4. 通用返回结果封装

创建一个通用的返回结果类，用于统一API的响应格式。

```java
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Builder(toBuilder = true)
@AllArgsConstructor
@Setter
@Getter
@Slf4j
public class Result<T> {
    /**
     * 提示信息
     */
    @Schema(description = "提示信息")
    private String message;
    /**
     * 是否成功
     */
    @Schema(description = "是否成功")
    private boolean success;
    /**
     * 返回状态码
     */
    @Schema(description = "返回状态码")
    private Integer code;
    /**
     * 数据
     */
    @Schema(description = "数据")
    private T data;

    public Result() {
    }

    public static Result success() {
        Result Result = new Result();
        Result.setSuccess(Boolean.TRUE);
        Result.setCode(ResultCode.SUCCESS.getCode());
        Result.setMessage(ResultCode.SUCCESS.getMsg());
        return Result;
    }

    public static Result success(String msg) {
        Result Result = new Result();
        Result.setMessage(msg);
        Result.setSuccess(Boolean.TRUE);
        Result.setCode(ResultCode.SUCCESS.getCode());
        return Result;
    }

    public static Result success(Object data) {
        Result Result = new Result();
        Result.setData(data);
        Result.setSuccess(Boolean.TRUE);
        Result.setCode(ResultCode.SUCCESS.getCode());
        Result.setMessage(ResultCode.SUCCESS.getMsg());
        return Result;
    }

    /**
     * 返回失败 消息
     *
     * @return Result
     */
    public static Result failure() {
        Result Result = new Result();
        Result.setSuccess(Boolean.FALSE);
        Result.setCode(ResultCode.FAILURE.getCode());
        Result.setMessage(ResultCode.FAILURE.getMsg());
        return Result;
    }

    /**
     * 返回失败 消息
     *
     * @param msg 失败信息
     * @return Result
     */
    public static Result failure(String msg) {
        Result Result = new Result();
        Result.setSuccess(Boolean.FALSE);
        Result.setCode(ResultCode.FAILURE.getCode());
        Result.setMessage(msg);
        return Result;
    }

    public static Result failure(Integer code, String msg) {
        Result Result = new Result();
        Result.setSuccess(Boolean.FALSE);
        Result.setCode(code);
        Result.setMessage(msg);
        return Result;
    }


    public static Result failure(String msg, ResultCode exceptionCode) {
        Result Result = new Result();
        Result.setMessage(msg);
        Result.setSuccess(Boolean.FALSE);
        Result.setCode(exceptionCode.getCode());
        Result.setData(exceptionCode.getMsg());
        return Result;
    }

    /**
     * 返回失败 消息
     *
     * @param exceptionCode 错误信息枚举
     * @return Result
     */
    public static Result failure(ResultCode exceptionCode) {
        Result Result = new Result();
        Result.setSuccess(Boolean.FALSE);
        Result.setCode(exceptionCode.getCode());
        Result.setMessage(exceptionCode.getMsg());
        return Result;
    }

    /**
     * 返回失败 消息
     *
     * @param exceptionCode 错误信息枚举
     * @param msg           自定义错误提示信息
     * @return Result
     */
    public static Result failure(ResultCode exceptionCode, String msg) {
        Result Result = new Result();
        Result.setMessage(msg);
        Result.setSuccess(Boolean.FALSE);
        Result.setCode(exceptionCode.getCode());
        return Result;
    }

}
```

## 5. 注解说明

Swagger3的注解与Swagger2有所不同，以下是一些常用注解的对照表：

| Swagger2注解       | Swagger3注解                                           | 注解位置         |
| ------------------ | ------------------------------------------------------ | ---------------- |
| @Api               | @Tag(name = "接口类描述")                              | Controller类上   |
| @ApiOperation      | @Operation(summary = "接口方法描述")                   | Controller方法上 |
| @ApiImplicitParams | @Parameters                                            | Controller方法上 |
| @ApiImplicitParam  | @Parameter(description = "参数描述")                   | Controller方法上 |
| @ApiParam          | @Parameter(description = "参数描述")                   | 方法参数上       |
| @ApiIgnore         | @Parameter(hidden = true) 或 @Operation(hidden = true) | -                |
| @ApiModel          | @Schema                                                | DTO类上          |
| @ApiModelProperty  | @Schema                                                | DTO属性上        |

## 6. 访问Swagger UI

启动您的Spring Boot应用后，您可以通过以下地址访问Swagger UI：

```
http://localhost:8080/doc.html
http://localhost:8080/swagger-ui/index.html
```
