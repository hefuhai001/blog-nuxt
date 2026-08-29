## 完整的最小化方案

### 1. 创建 `docker-compose.traefik.yml`

```yaml
services:
    traefik:
        image: traefik:v3.0
        container_name: traefik-gateway
        restart: unless-stopped
        ports:
            - '80:80'
            - '443:443'
        volumes:
            - /var/run/docker.sock:/var/run/docker.sock:ro
            - ./acme.json:/acme.json
        command:
            - "--providers.docker=true"
            - "--providers.docker.exposedbydefault=false"
            - "--providers.docker.network=webnet"
            - "--entrypoints.web.address=:80"
            - "--entrypoints.websecure.address=:443"
            - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
            - "--certificatesresolvers.myresolver.acme.email=your-email@example.com"  # 改成你的邮箱
            - "--certificatesresolvers.myresolver.acme.storage=/acme.json"
        networks:
            - webnet

networks:
    webnet:
        external: true
```

### 2. 修改你现有的 `docker-compose.yml`（Nginx）

```yaml
services:
    nginx:
        image: nginx:1.30-alpine
        container_name: vitepress-blog
        restart: unless-stopped
        # 注释掉或删除 ports 部分（由 Traefik 代理，不需要暴露端口）
        # ports:
        #     - '8000:80'
        expose:
            - '80'
        volumes:
            - ./nginx.conf:/etc/nginx/nginx.conf:ro
            - ./logs:/var/log/nginx
            - ./dist:/usr/share/nginx/html:ro
        networks:
            - webnet
        labels:
            - "traefik.enable=true"
            - "traefik.http.routers.blog.rule=Host(`blog.hfh.asia`)"
            - "traefik.http.routers.blog.entrypoints=websecure"
            - "traefik.http.routers.blog.tls.certresolver=myresolver"
            # HTTP 自动跳转 HTTPS（可选）
            - "traefik.http.routers.blog-http.rule=Host(`blog.hfh.asia`)"
            - "traefik.http.routers.blog-http.entrypoints=web"
            - "traefik.http.routers.blog-http.middlewares=redirect-to-https"
            - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
            # 指定后端服务端口
            - "traefik.http.services.blog.loadbalancer.server.port=80"

networks:
    webnet:
        external: true
```

### 3. 准备 acme.json 文件

```bash
# 创建 acme.json 并设置正确权限
touch acme.json
chmod 600 acme.json
```

### 4. 启动服务

```bash
# 1. 确保网络存在
docker network create webnet 2>/dev/null || true

# 2. 停止旧的 Nginx 容器（如果正在运行）
docker-compose down

# 3. 重新启动 Nginx（应用新的 labels）
docker-compose up -d

# 4. 启动 Traefik
docker-compose -f docker-compose.traefik.yml up -d

# 5. 查看日志确认
docker-compose logs -f nginx
docker-compose -f docker-compose.traefik.yml logs -f traefik
```

### 5. DNS 配置

确保 `blog.hfh.asia` 的 DNS 解析指向你的服务器 IP：
```bash
# 测试 DNS
nslookup blog.hfh.asia
```

### 6. 验证

```bash
# 测试 HTTP 自动跳转
curl -I http://blog.hfh.asia
# 应该返回 301 或 308 跳转到 https

# 测试 HTTPS 访问
curl -k https://blog.hfh.asia

# 或者浏览器访问
# https://blog.hfh.asia
```

### 7. 防火墙设置

确保防火墙开放了 80 和 443 端口：
```bash
# Ubuntu/Debian with ufw
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# CentOS/RHEL with firewalld
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## 可选：添加 Traefik Dashboard（便于监控）

在 `docker-compose.traefik.yml` 中添加：

```yaml
services:
    traefik:
        # ... 其他配置保持不变
        ports:
            - '80:80'
            - '443:443'
            - '8080:8080'  # Dashboard 端口
        command:
            - "--api.dashboard=true"  # 开启 Dashboard
            - "--api.insecure=true"   # 允许 HTTP 访问（仅内网使用）
            # ... 其他命令保持不变
```

访问 `http://你的服务器IP:8080` 查看 Dashboard。

## 完整文件结构

```
your-project/
├── docker-compose.yml          # Nginx 配置
├── docker-compose.traefik.yml  # Traefik 配置
├── acme.json                   # SSL 证书存储
├── nginx.conf                  # 你的 Nginx 配置
├── logs/                       # Nginx 日志
└── dist/                       # 网站静态文件
```
