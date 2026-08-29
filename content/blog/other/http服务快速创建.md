1. 先把终端切到要共享的目录  
   `cd /path/to/folder`

2. 执行下面任意一条即可：

Python 3  
```bash
python -m http.server 8080          # 默认端口 8000，可改成 8080 等
```

Python 2  
```bash
python -m SimpleHTTPServer 8080
```

3. 浏览器访问  
   `http://localhost:8080`（或把 localhost 换成本机 IP，局域网其他设备即可访问）

没有 Python 的备用方案（任选）：

Node（需装 Node.js）  
```bash
npx serve -l 8080
```

Ruby  
```bash
ruby -run -e httpd . -p 8080
```

PHP（≥ 5.4）  
```bash
php -S 0.0.0.0:8080
```

Go（1.17+ 已内置）  
```bash
go run $(go env GOROOT)/src/net/http/fileshare.go -addr :8080
```

一行命令、无需配置，Ctrl-C 即停，最适合临时传文件或做本地测试。