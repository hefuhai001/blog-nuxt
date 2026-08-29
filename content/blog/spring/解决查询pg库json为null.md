## MyBatis-Plus 分页查询 PostgreSQL json 字段为 null

---

### 一、现象  
数据库里 `args` 字段明明有值：  
```
["9",["2","7","11","15"]]
```
可无论是 `selectById` 还是 `selectPage`，返回的 `args` 始终为 `null`，日志也确认数据已取出，就是进不了实体。

---

### 二、根因  
MyBatis-Plus 的**内置分页方法**（`selectPage`、`selectList`）默认走 **自动结果映射**（下划线 → 驼峰），**不会**用到你在 XML 里写好的 `<resultMap>`。  
于是 PostgreSQL 的 `json`/`jsonb` 列被当成普通 `VARCHAR` 塞回实体，反序列化失败 → 字段保持默认值 `null`。

---

### 三、解决思路  
要让 `args` 列被 **自定义 TypeHandler** 处理，只有两条路：  
1. 自己写分页 SQL，并显式指定 `resultMap`；  
2. 关闭自动结果映射，强制 MP 走带 `typeHandler` 的 `resultMap`。  

下面给出**最通用也最稳妥**的方案——**手写分页**。

---

### 四、实战步骤（复制即可用）

#### 1. 自定义 TypeHandler
```java
@MappedTypes(JsonNode.class)
@MappedJdbcTypes(JdbcType.OTHER)
public class JsonNodeTypeHandler extends BaseTypeHandler<JsonNode> {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, JsonNode param, JdbcType jdbcType) throws SQLException {
        PGobject pg = new PGobject();
        pg.setType("json");   // jsonb 就写 "jsonb"
        pg.setValue(param.toString());
        ps.setObject(i, pg);
    }

    @Override
    public JsonNode getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String json = rs.getString(columnName);
        return json == null ? null : MAPPER.readTree(json);
    }
    // 其余重载同样返回 JsonNode
}
```

#### 2. 实体 & 结果映射
```java
@TableName("gcc_task")
public class TaskEntity {
    private Long id;
    private String exeName;
    private String code;

    @TableField(value = "args", typeHandler = JsonNodeTypeHandler.class)
    private JsonNode args;   // 与处理器泛型保持一致

    private String status;
    private String result;
    private Long problemId;
    private Long userId;
}
```

```xml
<resultMap id="BaseResultMap" type="TaskEntity">
    <id column="id" property="id"/>
    <result column="exe_name" property="exeName"/>
    <result column="code" property="code"/>
    <!-- 关键：指定 typeHandler -->
    <result column="args" property="args"
            typeHandler="JsonNodeTypeHandler"/>
    <result column="status" property="status"/>
    <result column="result" property="result"/>
    <result column="problem_id" property="problemId"/>
    <result column="user_id" property="userId"/>
</resultMap>
```

#### 3. 手写分页 SQL
```java
public interface TaskMapper {
    List<TaskEntity> selectTaskPage(@Param("offset") long offset,
                                    @Param("size") int size);
    long countTask();
}
```

```xml
<select id="selectTaskPage" resultMap="BaseResultMap">
    SELECT id, exe_name, code, args, status, result,
           problem_id, user_id, created_at, updated_at
    FROM   gcc_task
    ORDER  BY created_at DESC
    LIMIT  #{size} OFFSET #{offset}
</select>

<select id="countTask" resultType="long">
    SELECT COUNT(*) FROM gcc_task
</select>
```

#### 4. Service 组装 Page
```java
public Page<TaskEntity> getTaskPage(int pageNum, int pageSize) {
    long total = taskMapper.countTask();
    long offset = (pageNum - 1L) * pageSize;
    List<TaskEntity> records = taskMapper.selectTaskPage(offset, pageSize);

    Page<TaskEntity> p = new Page<>(pageNum, pageSize);
    p.setRecords(records);
    p.setTotal(total);
    return p;
}
```

#### 5. 控制器
```java
@GetMapping("/task/page")
public SaResult taskPage(@RequestParam(defaultValue = "1")  Integer pageNum,
                         @RequestParam(defaultValue = "10") Integer pageSize) {
    return SaResult.data(taskService.getTaskPage(pageNum, pageSize));
}
```

---

### 五、验证
重新调用接口，返回体里终于出现期待已久的：
```json
"args": {
  "target": 9,
  "nums": [2,7,11,15]
}
```

---

### 六、一句话总结
**MyBatis-Plus 自带分页不会用你写的 `resultMap`；**  
**想读写 PostgreSQL 的 `json`/`jsonb`，就手写分页 SQL 并显式指定 `resultMap`，**  
**或者全局关闭 `auto-result-map` 并强制 `autoResultMap = true`。**  
照做，json 字段再也不会“失踪”。
