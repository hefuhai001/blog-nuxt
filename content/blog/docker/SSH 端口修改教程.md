
# SSH 端口修改教程（两种模式）

## 📋 前置准备

```bash
# 检查端口是否被占用
sudo ss -tulnp | grep 999

# 检查当前模式
sudo systemctl status ssh.socket | grep "Active"
```

---

## 方案一：传统 Service 模式（推荐）

> 配置简单，适合绝大多数场景。

```bash
# 1. 修改配置文件（先保留22端口）
sudo sed -i 's/^#Port 22/Port 22\nPort 999/' /etc/ssh/sshd_config

# 2. 切换到传统模式
sudo systemctl unmask ssh.socket 2>/dev/null
sudo systemctl stop ssh.socket
sudo systemctl disable ssh.socket
sudo systemctl mask ssh.socket
sudo systemctl enable ssh
sudo systemctl start ssh

# 3. 开放防火墙
sudo ufw allow 999/tcp 2>/dev/null || sudo firewall-cmd --permanent --add-port=999/tcp && sudo firewall-cmd --reload

# 4. 重启服务
sudo systemctl restart ssh

# 5. 测试（另开终端）
ssh -p 999 用户名@服务器IP

# 6. 测试成功后清理22端口
sudo sed -i 's/^Port 22/#Port 22/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

---

## 方案二：Socket 激活模式（资源优化）

> SSH 按需启动，适合低频访问场景。

```bash
# 1. 切换到 Socket 模式（一步到位）
sudo systemctl unmask ssh.socket 2>/dev/null
sudo systemctl stop ssh
sudo systemctl disable ssh
sudo mkdir -p /etc/systemd/system/ssh.socket.d
sudo tee /etc/systemd/system/ssh.socket.d/port.conf << 'EOF'
[Socket]
ListenStream=
ListenStream=999
EOF
sudo systemctl daemon-reload
sudo systemctl enable ssh.socket
sudo systemctl start ssh.socket

# 2. 同步 sshd_config
sudo sed -i 's/^#Port 22/Port 999/' /etc/ssh/sshd_config

# 3. 开放防火墙
sudo ufw allow 999/tcp 2>/dev/null || sudo firewall-cmd --permanent --add-port=999/tcp && sudo firewall-cmd --reload

# 4. 验证
sudo ss -tulnp | grep 999

# 5. 测试
ssh -p 999 用户名@服务器IP
```

---

## 两种模式对比

| 特性 | 传统模式 | Socket 模式 |
|------|---------|------------|
| **启动时机** | 系统启动时启动 | 有连接时才启动 |
| **资源占用** | 始终占内存 | 空闲时不占内存 |
| **配置复杂度** | 简单 | 稍复杂 |
| **重启影响** | 断开所有连接 | 不影响已有连接 |
| **推荐场景** | 生产环境、高频访问 | 低频访问、资源敏感 |

---

## 常见问题

```bash
# 查看端口监听
sudo ss -tulnp | grep 999

# 查看日志
sudo journalctl -u ssh -f

# SELinux（CentOS/RHEL）
sudo semanage port -a -t ssh_port_t -p tcp 999

# 恢复传统模式
sudo systemctl unmask ssh.socket
sudo systemctl stop ssh.socket
sudo systemctl disable ssh.socket
sudo systemctl enable ssh
sudo systemctl start ssh
```

---

## 📋一键切换到传统模式（复制整段）

```bash
sudo systemctl stop ssh.socket && \
sudo systemctl disable ssh.socket && \
sudo systemctl mask ssh.socket && \
sudo rm -rf /etc/systemd/system/ssh.socket.d && \
sudo systemctl daemon-reload && \
sudo sed -i '/^Port/d' /etc/ssh/sshd_config && \
echo "Port 719" | sudo tee -a /etc/ssh/sshd_config && \
sudo systemctl enable ssh && \
sudo systemctl restart ssh && \
echo "=== 状态检查 ===" && \
sudo systemctl status ssh --no-pager && \
echo -e "\n=== 端口监听 ===" && \
sudo ss -tulnp | grep 719
```

