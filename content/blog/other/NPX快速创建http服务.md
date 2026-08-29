## 1. 使用 http-server（最常用基于 `http-server` 或 `serve`）
```bash
npx http-server
```

**常用参数：**

```bash
# 指定端口
npx http-server -p 8080

# 允许跨域
npx http-server --cors

# 静默模式（不输出日志）
npx http-server -s

# 开启 gzip 压缩
npx http-server -g
```

## 2. 使用 serve（功能更强大）
```bash
npx serve
```

**常用参数：**
```bash
# 指定端口
npx serve -l 5000

# 单页应用模式（所有路由都返回 index.html）
npx serve -s

# 禁用压缩
npx serve --no-compression
```

## 3. 最简单的方式（无需安装）
```bash
# 在当前目录启动服务，默认端口 8080
npx http-server . -p 8080
```

执行后，访问 `http://localhost:8080` 即可看到当前目录的文件列表或 index.html 页面。

**注意：** 这些命令会自动下载对应的 npm 包（如果本地没有），然后启动一个静态文件服务器。