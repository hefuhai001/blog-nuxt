# Spring Boot中Excel数据导入导出的高效实现

## 1. 依赖添加

首先，我们需要在项目的`pom.xml`文件中添加EasyExcel的依赖。

```xml
<!-- 导出excel -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>3.2.1</version>
</dependency>
```

## 2. 自定义监听器（可选）

为了增强数据处理的灵活性，我们可以创建一个自定义监听器来校验Excel文件中的数据。例如，我们可以校验用户名称是否重复，或者数据格式是否正确。

```java
import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.alibaba.excel.exception.ExcelDataConvertException;
import com.xiaohe.uploadimage.entity.User;

/**
 * 自定义监听器，对下载的excel中的数据进行校验
 */

public class UserListener extends AnalysisEventListener {

    List<String> names = new ArrayList<>();

    /**
     * 每解析一行，回调该方法
     *
     * @param data
     * @param context
     */
    @Override
    public void invoke(Object data, AnalysisContext context) {
        //校验名称
        String name = ((User) data).getU_name();
//        if (StrUtil.isBlank(name)) {
//            throw new RuntimeException(String.format("第%s行名称为空，请核实", context.readRowHolder().getRowIndex() + 1));
//        }
        if (names.contains(name)) {
            throw new RuntimeException(String.format("第%s行名称已重复，请核实", context.readRowHolder().getRowIndex() + 1));
        } else {
            names.add(name);
        }
    }

    /**
     * 出现异常回调
     *
     * @param exception
     * @param context
     * @throws Exception
     */
    @Override
    public void onException(Exception exception, AnalysisContext context) throws Exception {
        if (exception instanceof ExcelDataConvertException) {
            /**从0开始计算*/
            int columnIndex = ((ExcelDataConvertException) exception).getColumnIndex() + 1;
            int rowIndex = ((ExcelDataConvertException) exception).getRowIndex() + 1;
            String message = "第" + rowIndex + "行，第" + columnIndex + "列" + "数据格式有误，请核实";
            throw new RuntimeException(message);
        } else if (exception instanceof RuntimeException) {
            throw exception;
        } else {
            super.onException(exception, context);
        }
    }

    /**
     * 解析完,全部回调
     *
     * @param context
     */
    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        //解析完,全部回调逻辑实现
        names.clear();
    }
}

```

## 3. 实体类定义

我们需要定义一个实体类来映射Excel文件中的列。使用`@ExcelProperty`注解来指定Excel列的名称。

```java
import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.format.DateTimeFormat;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// ... 其他代码 ...

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    // ... 实体类属性和注解 ...
     @ExcelProperty("账号")
    private String u_acc;
    @ExcelProperty("密码")
    private String u_pwd;
    @ExcelProperty("姓名")
    private String u_name;
    @ExcelProperty("性别")
    private String u_sex;
    @ColumnWidth(20)
    @DateTimeFormat("yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @ExcelProperty("生日")
    private Date u_birth;
    @ExcelProperty("角色")
    private String u_ide;
    @ExcelProperty("状态")
    private int u_statues;
    @ColumnWidth(20)
    @DateTimeFormat("yyyy-MM-dd HH:mm:ss")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @ExcelProperty("创建日期")
    private Date u_create_time;
}
```

## 4. 控制层实现

### 导出数据

在控制器中，我们提供一个接口来导出Excel文件。EasyExcel提供了便捷的API来生成Excel文件。

```java
import com.alibaba.excel.EasyExcel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// ... 其他代码 ...

@RestController
public class ExcelController {
    
        @Autowired
    private ExcelMapper excelMapper;

    @GetMapping("user")
    public List<User> user() {
        return excelMapper.selectUserAll();
    }
    
     /**
     * 导出数据
     */
    @GetMapping("exportExcel")
    public void exportData(HttpServletResponse response) throws IOException {
        // ... 导出数据代码 ...
         response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("用户表", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        List<User> users = excelMapper.selectUserAll();
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        EasyExcel.write(response.getOutputStream(), User.class).sheet("用户表").doWrite(users);
    }
}
```

### 导入数据

同样地，我们提供一个接口来处理Excel文件的导入。通过EasyExcel的读取功能，我们可以将Excel文件中的数据转换为Java对象。

```java
import com.alibaba.excel.EasyExcel;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

// ... 其他代码 ...

@RestController
public class ExcelController {
    /**
     * 导入数据
     */
    @PostMapping("/importExcel")
    public Integer importData(MultipartFile file) {
        try {
            //获取文件的输入流
            InputStream inputStream = file.getInputStream();
            List<User> lst = EasyExcel.read(inputStream) //调用read方法
                    //注册自定义监听器，字段校验可以在监听器内实现
                    .registerReadListener(new UserListener())
                    .head(User.class) //对应导入的实体类
                    .sheet(0) //导入数据的sheet页编号，0代表第一个sheet页，如果不填，则会导入所有sheet页的数据
                    .headRowNumber(1) //列表头行数，1代表列表头有1行，第二行开始为数据行
                    .doReadSync(); //开始读Excel，返回一个List<T>集合，继续后续入库操作
            //模拟导入数据库操作
            for (User user : lst) {
                Date date = user.getU_birth();
                String form = String.format("%tF", date);
                System.out.println(form);
            }
            return 1;
        } catch (IOException exception) {
            throw new RuntimeException(exception);
        }
    }
}
```