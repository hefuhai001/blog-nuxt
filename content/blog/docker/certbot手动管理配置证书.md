## nginx 统一入口

一个 nginx 容器管理所有域名。

---

## 完整部署步骤

### 1. 创建目录结构

```bash
cd /opt
mkdir -p docker-nginx/{nginx-conf,www/hfh,www/blog}
```

最终结构：

```
/opt/docker-nginx/
├── docker-compose.yml
├── nginx-conf/
│   ├── hfh.conf
│   └── blog.conf
└── www/
    ├── hfh/          # 主站文件
    └── blog/         # 博客文件
```

---

### 2. 准备网站文件

```bash
# 主站示例
echo "<h1>Welcome to hfh.asia</h1>" > /opt/docker-nginx/www/hfh/index.html

# 博客示例
echo "<h1>Blog - hfh.asia</h1>" > /opt/docker-nginx/www/blog/index.html
```

---

### 3. 创建 nginx 配置文件

#### `/opt/docker-nginx/nginx-conf/hfh.conf`（主站）

```nginx
# HTTP → HTTPS 重定向
server {
    listen 80;
    server_name hfh.asia www.hfh.asia;

    location /.well-known/acme-challenge/ {
        root /var/www/html/hfh;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl;
    server_name hfh.asia www.hfh.asia;

    ssl_certificate /etc/letsencrypt/live/hfh.asia/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hfh.asia/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        root /var/www/html/hfh;
        index index.html index.htm;
    }
}
```

#### `/opt/docker-nginx/nginx-conf/blog.conf`（博客）

```nginx
# HTTP → HTTPS 重定向
server {
    listen 80;
    server_name blog.hfh.asia;

    location /.well-known/acme-challenge/ {
        root /var/www/html/blog;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl;
    server_name blog.hfh.asia;

    ssl_certificate /etc/letsencrypt/live/blog.hfh.asia/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blog.hfh.asia/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        root /var/www/html/blog;
        index index.html index.htm;
    }
}
```

---

### 4. docker-compose.yml

```yaml
version: '3'

services:
  nginx:
    image: nginx:alpine
    container_name: nginx-gateway
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-conf:/etc/nginx/conf.d
      - ./www:/var/www/html
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

启动 nginx：

```bash
cd /opt/docker-nginx
docker-compose up -d
```

**验证 HTTP 访问**：

```bash
curl -I http://hfh.asia
curl -I http://blog.hfh.asia
```

应该返回 200 OK 或 301 重定向。

---

### 5. 申请 SSL 证书

确保两个域名已解析到服务器 IP，然后：

```bash
# 安装 certbot（直接安装可能和本地pyhton包版本冲突）
apt update && apt install certbot -y

# 1. 完全卸载现有 certbot
apt remove --purge certbot python3-certbot -y
apt autoremove -y

# 2. 清理 pip 安装的冲突包
pip3 uninstall urllib3 requests requests-toolbelt -y 2>/dev/null || true

# 3. 重新安装 certbot（使用 snap，官方推荐方式）
apt update
apt install snapd -y
snap install core
snap refresh core
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot

# 4. 验证安装
certbot --version

#必须先有DNS解析记录才能申请证书成功
# 主站证书
certbot certonly --webroot \
  -w /opt/docker-nginx/www/hfh \
  -d hfh.asia -d www.hfh.asia \
  --email 2109664977@qq.com \
  --agree-tos \
  --no-eff-email

# 博客证书
certbot certonly --webroot \
  -w /opt/docker-nginx/www/blog \
  -d blog.hfh.asia \
  --email 2109664977@qq.com \
  --agree-tos \
  --no-eff-email
```

成功后证书路径：

```
/etc/letsencrypt/live/hfh.asia/
/etc/letsencrypt/live/blog.hfh.asia/
```

---

### 6. 重启 nginx 加载证书

```bash
cd /opt/docker-nginx
docker-compose restart nginx
```

---

### 7. 测试 HTTPS

```bash
# 测试主站
curl -I https://hfh.asia
curl -I https://www.hfh.asia

# 测试博客
curl -I https://blog.hfh.asia
```

浏览器访问 https://hfh.asia 和 https://blog.hfh.asia 验证。

---

### 8. 自动续期

```bash
crontab -e
```

添加：

```bash
0 3 * * * certbot renew --quiet --post-hook "cd /opt/docker-nginx && docker-compose restart nginx"
```

## 常用命令速查

```bash
# 启动所有服务
cd /opt/docker-nginx && docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f nginx

# 重载 nginx 配置（不中断服务）
docker exec nginx-gateway nginx -s reload

# 手动续期证书（测试）
certbot renew --dry-run

# 查看证书到期时间
certbot certificates
```

---

## 注意事项

1. **防火墙**：确保 80 和 443 端口开放
2. **域名解析**：`hfh.asia`、`www.hfh.asia`、`blog.hfh.asia` 都解析到同一台服务器
3. **子域名冲突**：`www.hfh.asia` 和 `blog.hfh.asia` 是不同的子域名，证书分别申请
4. **备份**：定期备份 `/etc/letsencrypt` 和 `/opt/docker-nginx/www`

部署完成后，你的两个网站就能通过 HTTPS 安全访问了。如果遇到问题，贴出错误日志我帮你排查。