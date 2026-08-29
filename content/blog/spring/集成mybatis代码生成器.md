### pom

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-generator</artifactId>
    <version>3.5.12</version>
</dependency>
```



### mysql

```java

public class GenMysql {
    public static void main(String[] args) {

        FastAutoGenerator.create("jdbc:mysql://localhost:3306/db_sa_token", "root", "root@XH2001!")
                .globalConfig(builder -> {
                    builder.outputDir(Paths.get(System.getProperty("user.dir")) + "/code") // 设置输出目录
                            .author("xiaoHe") // 设置作者名
                            //.enableKotlin() // 开启 Kotlin 模式
                            //.enableSwagger() // 开启 Swagger 模式
                            .enableSpringdoc() // 开启 Springdoc 模式
                            .dateType(DateType.ONLY_DATE) // 设置时间类型策略
                            .commentDate("yyyy-MM-dd") // 设置注释日期格式
                            .disableOpenDir()// 生成后禁止打开所生成的系统目录
                            .build();
                })
                .injectionConfig(builder -> {
                    builder.beforeOutputFile((tableInfo, objectMap) -> {
                        // 可以在这里添加自定义逻辑，如修改 objectMap 中的配置
                        System.out.println("准备生成文件: " + tableInfo.getEntityName());
                    });
                    //.customMap(Collections.singletonMap("projectName", "MyBatis-Plus Generator"))
                    //.customFile(Collections.singletonMap("custom.txt", "/templates/custom.vm"));
                })
                .packageConfig(builder -> {
                    builder.parent("com.example.demo") // 设置父包名
                            .moduleName("") // 设置父包模块名
                            .controller("controller") // controller包名
                            .entity("entity") // 设置实体类包名
                            .mapper("mapper") // 设置 Mapper 接口包名
                            .service("service") // 设置 Service 接口包名
                            .serviceImpl("service.impl") // 设置 Service 实现类包名
                            .xml("mapper") // 设置 Mapper XML 文件包名
                            .pathInfo(Collections.singletonMap(OutputFile.xml, Paths.get(System.getProperty("user.dir")) + "/code")); // 设置mapperXml生成路径
                })
                .strategyConfig(builder -> {
                    builder.addInclude(
                                    "t_user"
                            ) // 设置需要生成的表名
                            .enableCapitalMode() // 开启大写命名
                            .enableSkipView() // 开启跳过视图
                            .disableSqlFilter() // 禁用 SQL 过滤
                            //.likeTable(new LikeTable("USER")) // 模糊匹配表名
                            .addTablePrefix("t_") // 增加过滤表前缀
                            //.addTableSuffix("_db") // 增加过滤表后缀
                            //.addFieldPrefix("use_") // 增加过滤字段前缀
                            //.addFieldSuffix("_field") // 增加过滤字段后缀

                            // Entity 策略配置
                            .entityBuilder()
                            .enableLombok() // 开启lombok
                            .enableChainModel() // 链式
                            .enableTableFieldAnnotation() //开启生成实体时生成的字段注解
                            .enableRemoveIsPrefix() //开启 Boolean 类型字段移除 is 前缀
                            .disableSerialVersionUID()  //禁用生成 serialVersionUID
                            .idType(IdType.AUTO)// 主键生成策略 此处为 自增（可选）
                            .naming(NamingStrategy.underline_to_camel) // 表名 下划线 -》 驼峰命名
                            .columnNaming(NamingStrategy.underline_to_camel) // 字段名 下划线 -》 驼峰命名
                            .formatFileName("%sEntity") // Entity 文件名称
                            .enableFileOverride()   //替换文件
                            .enableColumnConstant()
                            .enableActiveRecord()

                            // Controller 策略配置
                            .controllerBuilder()
                            .enableRestStyle() // 开启@RestController
                            .formatFileName("%sController") // Controller 文件名称

                            // Service 策略配置
                            .serviceBuilder()
                            .formatServiceFileName("%sService") // Service 文件名称
                            .formatServiceImplFileName("%sServiceImpl") // ServiceImpl 文件名称

                            // Mapper 策略配置
                            .mapperBuilder()
                            .enableMapperAnnotation() // 开启@Mapper
                            .enableBaseColumnList() // 启用 columnList (通用查询结果列)
                            .enableBaseResultMap() // 启动resultMap
                            .formatMapperFileName("%sMapper") // Mapper 文件名称
                            .formatXmlFileName("%sMapper"); // Xml 文件名称
                })
                .dataSourceConfig(builder -> {
                    builder.databaseQueryClass(SQLQuery.class)
                            .typeConvert(new MySqlTypeConvert())
                            .dbQuery(new MariadbQuery());
                })
                .templateEngine(new FreemarkerTemplateEngine()) // 使用Freemarker引擎模板，默认的是Velocity引擎模板
                .execute();
    }
}

```

### postgres

```java

public class GenPostgres {
    public static void main(String[] args) {

        FastAutoGenerator.create("jdbc:postgresql://127.0.0.1:5432/db_perfect", "postgres", "root@XH2001!")
                .globalConfig(builder -> {
                    builder.outputDir(Paths.get(System.getProperty("user.dir")) + "/code") // 设置输出目录
                            .author("xiaoHe") // 设置作者名
                            //.enableKotlin() // 开启 Kotlin 模式
                            //.enableSwagger() // 开启 Swagger 模式
                            .enableSpringdoc() // 开启 Springdoc 模式
                            .dateType(DateType.ONLY_DATE) // 设置时间类型策略
                            .commentDate("yyyy-MM-dd") // 设置注释日期格式
                            .disableOpenDir()// 生成后禁止打开所生成的系统目录
                            .build();
                })
                .injectionConfig(builder -> {
                    builder.beforeOutputFile((tableInfo, objectMap) -> {
                        // 可以在这里添加自定义逻辑，如修改 objectMap 中的配置
                        System.out.println("准备生成文件: " + tableInfo.getEntityName());
                    });
                    //.customMap(Collections.singletonMap("projectName", "MyBatis-Plus Generator"))
                    //.customFile(Collections.singletonMap("custom.txt", "/templates/custom.vm"));
                })
                .packageConfig(builder -> {
                    builder.parent("com.example.cms") // 设置父包名
                            .moduleName("") // 设置父包模块名
                            .controller("controller") // controller包名
                            .entity("entity") // 设置实体类包名
                            .mapper("mapper") // 设置 Mapper 接口包名
                            .service("service") // 设置 Service 接口包名
                            .serviceImpl("service.impl") // 设置 Service 实现类包名
                            .xml("mapper") // 设置 Mapper XML 文件包名
                            .pathInfo(Collections.singletonMap(OutputFile.xml, Paths.get(System.getProperty("user.dir")) + "/code")); // 设置mapperXml生成路径
                })
                .strategyConfig(builder -> {
                    builder.addInclude(
                                    "ay_content"
                            ) // 设置需要生成的表名
                            .enableCapitalMode() // 开启大写命名
                            .enableSkipView() // 开启跳过视图
                            .disableSqlFilter() // 禁用 SQL 过滤
                            //.likeTable(new LikeTable("USER")) // 模糊匹配表名
                            //.addTablePrefix("coll_") // 增加过滤表前缀
                            //.addTableSuffix("_db") // 增加过滤表后缀
                            //.addFieldPrefix("use_") // 增加过滤字段前缀
                            //.addFieldSuffix("_field") // 增加过滤字段后缀

                            // Entity 策略配置
                            .entityBuilder()
                            .enableLombok() // 开启lombok
                            .enableChainModel() // 链式
                            .enableTableFieldAnnotation() //开启生成实体时生成的字段注解
                            .enableRemoveIsPrefix() //开启 Boolean 类型字段移除 is 前缀
                            .disableSerialVersionUID()  //禁用生成 serialVersionUID
                            .idType(IdType.AUTO)// 主键生成策略 此处为 自增（可选）
                            .naming(NamingStrategy.underline_to_camel) // 表名 下划线 -》 驼峰命名
                            .columnNaming(NamingStrategy.underline_to_camel) // 字段名 下划线 -》 驼峰命名
                            .formatFileName("%sEntity") // Entity 文件名称
                            .enableFileOverride()   //替换文件
                            .enableColumnConstant()
                            .enableActiveRecord()

                            // Controller 策略配置
                            .controllerBuilder()
                            .enableRestStyle() // 开启@RestController
                            .formatFileName("%sController") // Controller 文件名称

                            // Service 策略配置
                            .serviceBuilder()
                            .formatServiceFileName("%sService") // Service 文件名称
                            .formatServiceImplFileName("%sServiceImpl") // ServiceImpl 文件名称

                            // Mapper 策略配置
                            .mapperBuilder()
                            .enableMapperAnnotation() // 开启@Mapper
                            .enableBaseColumnList() // 启用 columnList (通用查询结果列)
                            .enableBaseResultMap() // 启动resultMap
                            .formatMapperFileName("%sMapper") // Mapper 文件名称
                            .formatXmlFileName("%sMapper"); // Xml 文件名称
                })
                .dataSourceConfig(builder -> {
                    builder.databaseQueryClass(SQLQuery.class)
                            .typeConvert(new PostgreSqlTypeConvert())
                            .dbQuery(new PostgreSqlQuery());
                })
                .templateEngine(new FreemarkerTemplateEngine()) // 使用Freemarker引擎模板，默认的是Velocity引擎模板
                .execute();
    }
}

```

