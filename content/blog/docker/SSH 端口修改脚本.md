```sh
#!/bin/bash
# ============================================================
# SSH 端口切换脚本 - Ubuntu 专用
# 功能：切换到传统模式 + 修改端口为 719
# 适用：Ubuntu 16.04 - 24.04
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 新端口
NEW_PORT=719
BACKUP_DIR="/root/ssh_backup_$(date +%Y%m%d_%H%M%S)"

# 打印函数
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ============================================================
# 1. 检查端口
# ============================================================
check_port() {
    print_info "检查端口 $NEW_PORT 是否被占用..."
    if ss -tulnp 2>/dev/null | grep -q ":$NEW_PORT "; then
        print_error "端口 $NEW_PORT 已被占用！"
        ss -tulnp | grep ":$NEW_PORT "
        print_warning "请停止占用该端口的服务或更换端口"
        exit 1
    fi
    print_success "端口 $NEW_PORT 可用"
}

# ============================================================
# 2. 备份配置
# ============================================================
backup_config() {
    print_info "备份当前 SSH 配置到 $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    cp /etc/ssh/sshd_config "$BACKUP_DIR/sshd_config.bak"
    print_success "备份完成"
}

# ============================================================
# 3. 配置 SSH
# ============================================================
configure_ssh() {
    print_info "配置 SSH 端口为 $NEW_PORT（传统模式）..."
    
    # 生成新的配置文件
    sudo cat > /etc/ssh/sshd_config << 'EOF'
# ============================================================
# SSH 服务器配置 - 传统模式
# 端口: 719
# 认证: 仅公钥
# ============================================================

# 网络配置
Port 719
AddressFamily any
ListenAddress 0.0.0.0
ListenAddress ::

# 主机密钥
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ecdsa_key
HostKey /etc/ssh/ssh_host_ed25519_key

# 认证配置（仅公钥）
PermitRootLogin yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
KbdInteractiveAuthentication no
UsePAM no

# 日志
SyslogFacility AUTH
LogLevel INFO

# 安全配置
LoginGraceTime 2m
StrictModes yes
MaxAuthTries 3
MaxSessions 10

# 其他
X11Forwarding yes
PrintMotd no
UseDNS no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server

# 禁用 .rhosts
IgnoreRhosts yes
HostbasedAuthentication no
EOF

    print_success "SSH 配置完成"
}

# ============================================================
# 4. 切换到传统模式
# ============================================================
switch_to_traditional() {
    print_info "切换到传统 SSH 模式..."
    
    # 停止并屏蔽 socket 模式
    sudo systemctl stop ssh.socket 2>/dev/null || true
    sudo systemctl disable ssh.socket 2>/dev/null || true
    sudo systemctl mask ssh.socket 2>/dev/null || true
    
    # 启用 SSH 服务
    sudo systemctl enable ssh
    sudo systemctl unmask ssh 2>/dev/null || true
    
    print_success "已切换到传统模式"
}

# ============================================================
# 5. 配置防火墙（UFW）
# ============================================================
configure_firewall() {
    print_info "配置 UFW 防火墙..."
    
    if command -v ufw &> /dev/null; then
        # 开放新端口
        sudo ufw allow $NEW_PORT/tcp comment 'SSH new port'
        
        # 如果旧端口是 22，也可以选择关闭（可选）
        # sudo ufw delete allow 22/tcp 2>/dev/null || true
        
        sudo ufw reload
        print_success "UFW 已开放端口 $NEW_PORT"
    else
        print_warning "UFW 未安装，请手动配置防火墙"
    fi
}

# ============================================================
# 6. 重启 SSH 服务
# ============================================================
restart_ssh() {
    print_info "重启 SSH 服务..."
    
    # 先检查配置语法
    if ! sudo sshd -t; then
        print_error "SSH 配置语法错误！"
        print_info "正在回滚..."
        rollback
        exit 1
    fi
    
    # 重启 SSH
    sudo systemctl restart ssh
    
    sleep 2
    
    # 验证服务状态
    if systemctl is-active ssh &>/dev/null; then
        print_success "SSH 服务运行正常"
    else
        print_error "SSH 服务启动失败！"
        sudo journalctl -u ssh -n 10 --no-pager
        print_info "正在回滚..."
        rollback
        exit 1
    fi
}

# ============================================================
# 7. 验证端口
# ============================================================
verify_port() {
    print_info "验证端口监听状态..."
    sleep 2
    
    if ss -tulnp | grep -q ":$NEW_PORT "; then
        print_success "端口 $NEW_PORT 正在监听"
        ss -tulnp | grep ":$NEW_PORT "
        return 0
    else
        print_error "端口 $NEW_PORT 未监听！"
        print_info "当前监听端口:"
        ss -tulnp | grep ssh
        rollback
        exit 1
    fi
}

# ============================================================
# 8. 本地测试
# ============================================================
test_local() {
    print_info "本地测试 SSH 连接..."
    sleep 2
    
    if ssh -p $NEW_PORT -o ConnectTimeout=5 -o BatchMode=yes localhost exit 2>/dev/null; then
        print_success "本地连接测试成功（密钥）"
        return 0
    else
        print_warning "本地密钥认证测试失败"
        print_info "尝试密码认证测试..."
        if ssh -p $NEW_PORT -o ConnectTimeout=5 -o PreferredAuthentications=password localhost exit 2>/dev/null; then
            print_success "本地连接测试成功（密码）"
            print_warning "⚠️ 密码认证仍然可用，请检查配置"
        else
            print_warning "本地连接测试失败（预期行为，密码已禁用）"
        fi
    fi
}

# ============================================================
# 9. 回滚函数
# ============================================================
rollback() {
    print_error "正在回滚配置..."
    
    if [ -f "$BACKUP_DIR/sshd_config.bak" ]; then
        sudo cp "$BACKUP_DIR/sshd_config.bak" /etc/ssh/sshd_config
        print_info "SSH 配置已恢复"
    fi
    
    sudo systemctl unmask ssh.socket 2>/dev/null || true
    sudo systemctl restart ssh 2>/dev/null || true
    
    print_warning "回滚完成，请使用原端口连接"
    exit 1
}

# ============================================================
# 10. 最终信息
# ============================================================
show_summary() {
    # 获取服务器 IP
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "你的服务器IP")
    
    echo ""
    echo "=========================================="
    print_success "SSH 端口配置完成！"
    echo "=========================================="
    echo ""
    echo "  ✅ 模式: 传统 Service 模式"
    echo "  ✅ 端口: $NEW_PORT"
    echo "  ✅ 认证: 仅公钥（密码已禁用）"
    echo ""
    echo "  连接命令:"
    echo "  ssh -p $NEW_PORT root@$SERVER_IP"
    echo ""
    echo "  本地测试:"
    echo "  ssh -p $NEW_PORT root@localhost"
    echo ""
    echo "  备份目录: $BACKUP_DIR"
    echo ""
    echo "  ⚠️  重要提醒:"
    echo "  1. 请在另一个终端测试新端口连接"
    echo "  2. 确认连接成功后再关闭当前会话"
    echo "  3. 云服务器请在安全组放行 $NEW_PORT 端口"
    echo "  4. 如需恢复: cp $BACKUP_DIR/sshd_config.bak /etc/ssh/sshd_config"
    echo ""
    echo "=========================================="
}

# ============================================================
# 11. 主流程
# ============================================================
main() {
    echo ""
    echo "=========================================="
    echo "  Ubuntu SSH 端口切换（传统模式）"
    echo "  目标端口: $NEW_PORT"
    echo "=========================================="
    echo ""
    
    # 检查 root 权限
    if [ "$EUID" -ne 0 ]; then 
        print_error "请使用 root 或 sudo 运行此脚本"
        exit 1
    fi
    
    # 执行步骤
    check_port
    backup_config
    configure_ssh
    switch_to_traditional
    configure_firewall
    restart_ssh
    verify_port
    test_local
    show_summary
}

# 运行主流程
main "$@"
```

