用官方镜像一次性把  
1) 多站点反向代理／负载均衡  
2) Let’s Encrypt 证书自动申请＋续期  
全部跑起来，步骤最少、可复用、不污染宿主机。  

---

### 一、目录结构（一次性建好）
```
~/nginx-gateway/
├── docker-compose.yml          # 唯一需要手动写的文件
├── data/                       # NPM 持久化数据（会自动生成）
└── letsencrypt/                # 证书目录（会自动生成）
```

---

### 二、docker-compose.yml
```yaml
version: "3.8"
services:
  npm:                           # Nginx Proxy Manager
    image: 'docker.io/jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - "80:80"                  # 必须映射，Let’s Encrypt 要用
      - "443:443"
      - "81:81"                  # Web 管理口
    volumes:
      - ./data:/data             # 存放代理配置、用户、日志
      - ./letsencrypt:/etc/letsencrypt  # 证书持久化
    environment:                 # 首次登录用，之后可改
      TZ: "Asia/Shanghai"
```

---

### 三、启动
```bash
cd ~/nginx-gateway
docker compose up -d            # 自动拉镜像并启动
```
容器跑起来后访问 `http://<服务器IP>:81`  
默认账号：`admin@example.com` / `changeme`  
第一次登录会强制改密码。

---

### 四、图形化界面里一次性完成“反向代理 + SSL”
1. **添加“Proxy Host”**  
   点击 “Proxy Hosts → Add Proxy Host”  
   - Domain Names: 填你的第一个站点，例如 `app1.example.com`  
   - Forward Hostname/IP: 填后端真实地址，可以是容器名、内网 IP 或上游负载均衡地址，如 `http://wordpress:8080`  
   - Forward Port: 对应端口  
   保存后即完成七层反向代理。

2. **一键申请 SSL**  
   在同一条目的 “SSL” 标签页：  
   - 选 “Request a new SSL Certificate”  
   - 勾选 “Force SSL” + “HTTP/2 Support”  
   - 填一个邮箱（Let’s Encrypt 需要）  
   保存后 NPM 会自动跑 `certbot`，申请成功就启用 443，并且以后每 60 天自动续期 。

3. **重复以上步骤**  
   把 `app2.example.com`、`app3.example.com` … 都加进来，各自独立证书，互不影响；  
   如果多个域名指向同一组后端，可在 “Upstream” 里加多个 IP/端口，NPM 会自动轮询负载均衡 。

---

### 五、进阶（可选）
- **Access List**：限制只允许公司 IP 或加 HTTP Basic 认证。  
- **自定义 Nginx 配置**：在 “Advanced” 标签页直接写额外指令，NPM 会合并生成最终配置。  
- **用户与审计**：可给运维、开发分别开子账号，所有操作有日志。  
- **WebSocket / GRPC**：开关直接勾选即可，无需手写指令 。

---

### 六、日常维护
- **证书续期**：完全自动，无需手动 `certbot renew`。  
- **日志查看**：Web 界面实时 tail，或 `./data/logs/` 目录下拿文件。  
- **升级**：`docker compose pull && docker compose up -d` 即可，数据都在本地目录，不会丢。

---

### 七、如果想“纯命令行”而不装 NPM
可以用 `nginx:alpine` + `certbot/certbot` 两个容器，自己写 `nginx.conf` 和 renewal-hook，但要多写几十行脚本；对多站点、多证书场景 NPM 图形界面明显更快 。
