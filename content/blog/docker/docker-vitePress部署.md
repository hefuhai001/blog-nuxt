# Docker 部署 VitePress

## 1. 打包 VitePress
```bash
npm run docs:build
```
生成 `dist/` 静态文件。

## 2. 目录结构
```
project/
├── dist/
├── conf/
│   └── nginx.conf
├── Dockerfile
└── docker-compose.yml
```

## 3. nginx.conf
```nginx
user  nginx;
worker_processes  auto;
worker_cpu_affinity auto;
error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;
events {
    worker_connections  1024;
    use epoll;
    multi_accept on;
}
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    # 基本优化
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout  65;
    client_max_body_size 64m;
    # gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1k;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    # 默认站点
    server {
        listen       80;
        server_name  localhost;
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        # 默认页
        location / {
            try_files $uri $uri/ =404;
        }
        location ~* \.(css|js|jpe?g|png|gif|ico|svg|webp|woff2?)$ {
            root /usr/share/nginx/html;   # 与 server 里 root 保持一致
            try_files $uri =404;          # 找不到就真 404，方便排错
            access_log off;
            #expires 1y;
        }
        # 健康检查接口（可选）
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
}
```

## 4. Dockerfile
```dockerfile
FROM nginx:alpine
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY dist/ /usr/share/nginx/html/
```

## 5. 构建并运行
```bash
# 一次性
docker build -t vitepress-blog:1.0 .
docker run -d --name vitepress-blog -p 8000:80 --restart unless-stopped vitepress-blog:1.0
```

或

```bash
# 使用 docker-compose
docker compose up -d
```

访问 `curl http://localhost:8000`
