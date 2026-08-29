在 Ubuntu 系统中，检查防火墙状态有几种方法，主要取决于你使用的是哪个防火墙服务。

## 📊 防火墙状态判断指南

 状态  说明  建议操作 
----------------------
 `UFW active  UFW` 防火墙已启用  `sudo ufw disable` 可临时关闭 
 `UFW inactive  UFW` 防火墙已禁用  `sudo ufw enable` 可启用 
 `iptables` 有规则  `iptables` 正在工作  检查具体规则 
 `firewalld running  firewalld` 正在运行  使用 `firewalld` 命令管理 

## 🛠️ 常见防火墙操作命令

### UFW 常用命令
```bash
# 启用防火墙
sudo ufw enable

# 禁用防火墙
sudo ufw disable

# 允许特定端口
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS

# 允许特定IP
sudo ufw allow from 192.168.1.100

# 删除规则
sudo ufw delete allow 80/tcp
sudo ufw status numbered  # 先查看编号
sudo ufw delete 3         # 删除编号为3的规则

# 重置所有规则
sudo ufw reset

# 查看默认策略
sudo ufw show raw
```

### iptables 常用命令
```bash
# 查看所有规则
sudo iptables -L

# 清空所有规则
sudo iptables -F

# 设置默认策略
sudo iptables -P INPUT DROP     # 默认拒绝所有入站
sudo iptables -P FORWARD DROP   # 默认拒绝所有转发
sudo iptables -P OUTPUT ACCEPT  # 默认允许所有出站

# 允许SSH连接
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 保存规则（Ubuntu）
sudo netfilter-persistent save
```

### `firewalld` 常用命令
```bash
# 启动服务
sudo systemctl start firewalld

# 开机自启
sudo systemctl enable firewalld

# 添加端口
sudo firewall-cmd --permanent --add-port=80tcp

# 添加服务
sudo firewall-cmd --permanent --add-service=http

# 重新加载配置
sudo firewall-cmd --reload
```

## 🔧 防火墙排查技巧

### 1. 检查哪个服务在运行
```bash
# 查看所有防火墙相关服务
sudo systemctl list-units --type=service  grep -E (ufwfirewalliptables)

# 或者使用
sudo service --status-all  grep -E (ufwfirewall)
```

### 2. 查看当前生效的规则
```bash
# 查看生效的规则（包括所有表）
sudo nft list ruleset   # 如果使用 nftables

# 或者
sudo iptables -L -n -v --line-numbers
```

### 3. 测试端口是否被阻挡
```bash
# 从外部测试（需要另一台机器）
telnet your-server-ip 22

# 或者在本地测试
sudo nc -zv localhost 22
sudo telnet localhost 22
```

## 🚨 重要注意事项

1. 不要同时运行多个防火墙：UFW、firewalld、iptables 同时运行可能导致规则冲突
2. 小心远程操作：修改防火墙规则前，确保不会把自己锁在外面
3. 备份规则：修改前先备份
   ```bash
   sudo iptables-save  ~iptables-backup-$(date +%Y%m%d).txt
   sudo ufw show raw  ~ufw-backup-$(date +%Y%m%d).txt
   ```
4. 使用 Docker 时的注意事项：Docker 会自动修改 iptables 规则

## 📝 快速参考表

 操作  UFW 命令  iptables 命令  firewalld 命令 
-----------------------------------------------
 查看状态  `sudo ufw status`  `sudo iptables -L`  `sudo firewall-cmd --state` 
 启用  `sudo ufw enable`  需手动添加规则  `sudo systemctl start firewalld` 
 禁用  `sudo ufw disable`  `sudo iptables -F`  `sudo systemctl stop firewalld` 
 允许端口  `sudo ufw allow 80`  `sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT`  `sudo firewall-cmd --add-port=80tcp` 
 保存配置  自动保存  `sudo netfilter-persistent save`  `sudo firewall-cmd --runtime-to-permanent` 

## 💡 建议

1. Ubuntu 桌面版：推荐使用 UFW，简单易用
2. Ubuntu 服务器：根据需求选择，UFW 适合简单配置，iptables 适合复杂需求
3. 生产环境：建议使用配置管理工具（如 Ansible）管理防火墙规则

最简单的检查命令：
```bash
# 最常用 - 检查UFW
sudo ufw status

# 如果UFW没启用，检查iptables
sudo iptables -L -n  head -20
```
