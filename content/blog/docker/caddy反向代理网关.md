## 架构设计

Caddy 自动管理 HTTPS 证书（无需 certbot），配置超级简单，天生适合做反向代理网关。

```
Internet → Caddy（自动申请证书）→ 分别代理到两个 Nginx 容器
                                    ├── nginx-hfh（内部端口 8080）
                                    └── nginx-blog（内部端口 8081）
```

---

## 完整部署方案

### 1. 目录结构

```bash
mkdir -p /opt/caddy-gateway/{caddy-config,caddy-data}
mkdir -p /opt/site-hfh/{nginx-conf,www}
mkdir -p /opt/site-blog/{nginx-conf,www}

# 创建测试页面
echo "<h1>hfh.asia - Main Site</h1>" > /opt/site-hfh/www/index.html
echo "<h1>blog.hfh.asia</h1>" > /opt/site-blog/www/index.html
```

---

### 2. 配置两个 Nginx 容器（内部服务）

#### hfh.asia 的 Nginx 配置

**`/opt/site-hfh/nginx-conf/default.conf`**：

```nginx
server {
    listen 80;
    server_name hfh.asia www.hfh.asia;

    location / {
        root /var/www/html;
        index index.html;
    }
}
```

**`/opt/site-hfh/docker-compose.yml`**：

```yaml
version: '3'

services:
  nginx:
    image: nginx:alpine
    container_name: nginx-hfh
    restart: unless-stopped
    # 不暴露任何宿主机端口，只内部使用
    expose:
      - "80"
    volumes:
      - ./nginx-conf:/etc/nginx/conf.d
      - ./www:/var/www/html
    networks:
      - web-network

networks:
  web-network:
    external: true
```

#### blog.hfh.asia 的 Nginx 配置

**`/opt/site-blog/nginx-conf/default.conf`**：

```nginx
server {
    listen 80;
    server_name blog.hfh.asia;

    location / {
        root /var/www/html;
        index index.html;
    }
}
```

**`/opt/site-blog/docker-compose.yml`**：

```yaml
version: '3'

services:
  nginx:
    image: nginx:alpine
    container_name: nginx-blog
    restart: unless-stopped
    expose:
      - "80"
    volumes:
      - ./nginx-conf:/etc/nginx/conf.d
      - ./www:/var/www/html
    networks:
      - web-network

networks:
  web-network:
    external: true
```

---

### 3. 创建 Docker 网络

```bash
# 创建共享网络，让 Caddy 和 Nginx 容器互通
docker network create web-network
```

---

### 4. 配置 Caddy 网关（核心）

**`/opt/caddy-gateway/Caddyfile`**：

```caddy
# 全局配置
{
    email 2109664977@qq.com
    admin off
}

# hfh.asia 主站
hfh.asia, www.hfh.asia {
    reverse_proxy nginx-hfh:80 {
        header_up Host {host}
        header_up X-Real-IP {remote}
    }
}

# blog.hfh.asia 博客
blog.hfh.asia {
    reverse_proxy nginx-blog:80 {
        header_up Host {host}
        header_up X-Real-IP {remote}
    }
}
```

**`/opt/caddy-gateway/docker-compose.yml`**：

```yaml
version: '3'

services:
  caddy:
    image: caddy:latest
    container_name: caddy-gateway
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"  # HTTP/3
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./caddy-data:/data
      - ./caddy-config:/config
    environment:
      - ACME_AGREE=true
    networks:
      - web-network

networks:
  web-network:
    external: true
```

---

### 5. 启动所有服务

```bash
# 1. 先启动两个 Nginx 容器
cd /opt/site-hfh && docker-compose up -d
cd /opt/site-blog && docker-compose up -d

# 2. 验证 Nginx 容器运行
docker ps | grep nginx

# 3. 启动 Caddy 网关
cd /opt/caddy-gateway && docker-compose up -d

# 4. 查看 Caddy 日志（自动申请证书）
docker logs -f caddy-gateway
```

---

## Caddy 自动 HTTPS 工作原理

1. Caddy 启动后自动检测 `Caddyfile` 中的域名
2. 自动向 Let's Encrypt 申请证书（无需 certbot）
3. 自动配置 HTTPS 和重定向
4. 证书自动续期（无需 cron）

---

## 验证部署

```bash
# 测试 Caddy 反向代理
curl -H "Host: hfh.asia" http://localhost
curl -H "Host: blog.hfh.asia" http://localhost

# 测试 HTTPS（需要域名解析生效）
curl -I https://hfh.asia
curl -I https://blog.hfh.asia

# 查看 Caddy 管理的证书
docker exec caddy-gateway caddy list-certs
```

---

## 高级配置示例

### 1. 负载均衡（多个后端）

```caddy
hfh.asia {
    reverse_proxy nginx-hfh-1:80 nginx-hfh-2:80 {
        lb_policy round_robin
        health_uri /health
        health_interval 30s
    }
}
```

### 2. 静态文件直接由 Caddy 提供

```caddy
hfh.asia {
    root * /var/www/hfh
    file_server
    encode gzip zstd
}
```

### 3. PHP 应用（如 WordPress）

```caddy
blog.hfh.asia {
    reverse_proxy php-fpm:9000 {
        transport fastcgi
    }
    file_server
}
```

### 4. 添加安全头

```caddy
hfh.asia {
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
    
    reverse_proxy nginx-hfh:80
}
```

---

## 管理命令

```bash
# 查看 Caddy 配置
docker exec caddy-gateway caddy config

# 重载配置（无需重启）
docker exec caddy-gateway caddy reload --config /etc/caddy/Caddyfile

# 查看证书
docker exec caddy-gateway ls -la /data/caddy/certificates/
# 查看正在监听的地址
docker exec caddy-gateway netstat -tlnp
# 查看 Caddy 日志（实时）
docker logs -f caddy-gateway
# 查看最近 100 行日志
docker logs --tail 100 caddy-gateway
# 手动续期证书
docker exec caddy-gateway caddy renew

# 停止/启动
cd /opt/caddy-gateway && docker-compose stop
cd /opt/caddy-gateway && docker-compose start
```

---

## 优点总结

| 特性       | Caddy 方案   | Nginx + Certbot |
| ---------- | ------------ | --------------- |
| HTTPS 配置 | 自动         | 手动申请/配置   |
| 证书续期   | 自动         | 需要 cron       |
| 配置文件   | 简化（5 行） | 复杂（30+ 行）  |
| 容器数量   | 1 个         | 2+ 个           |
| 多站点管理 | 极简         | 繁琐            |
| 学习成本   | 低           | 中高            |

---

## 注意事项

1. **域名解析**：确保 `hfh.asia`、`www.hfh.asia`、`blog.hfh.asia` 都解析到服务器 IP
2. **端口开放**：防火墙开放 80、443
3. **第一次启动**：Caddy 会申请证书，可能需要 10-30 秒
4. **测试环境**：可以用 `--dry-run` 或修改 `Caddyfile` 使用 `tls internal` 自签名证书

这个方案比 certbot + nginx 简单太多了，而且完全符合你的需求：**每个网站独立 Nginx 容器，Caddy 统一管理流量和证书**。需要我帮你调试吗？
