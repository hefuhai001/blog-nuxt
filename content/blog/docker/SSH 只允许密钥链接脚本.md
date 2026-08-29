```sh
#!/bin/bash
echo "=== 彻底禁用密码登录 ==="

# 1. 清除旧的认证配置
sudo sed -i '/^PasswordAuthentication/d' /etc/ssh/sshd_config
sudo sed -i '/^PubkeyAuthentication/d' /etc/ssh/sshd_config
sudo sed -i '/^AuthorizedKeysFile/d' /etc/ssh/sshd_config
sudo sed -i '/^PermitEmptyPasswords/d' /etc/ssh/sshd_config
sudo sed -i '/^KbdInteractiveAuthentication/d' /etc/ssh/sshd_config
sudo sed -i '/^UsePAM/d' /etc/ssh/sshd_config
sudo sed -i '/^ChallengeResponseAuthentication/d' /etc/ssh/sshd_config
sudo sed -i '/^AuthenticationMethods/d' /etc/ssh/sshd_config

# 2. 添加强制公钥认证配置
sudo tee -a /etc/ssh/sshd_config << 'EOF'

# === 强制公钥认证（彻底禁用密码） ===
PasswordAuthentication no
ChallengeResponseAuthentication no
KbdInteractiveAuthentication no
PermitEmptyPasswords no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
UsePAM no
AuthenticationMethods publickey
EOF

# 3. 确保你的公钥已添加
echo "=== 检查公钥 ==="
if [ ! -f ~/.ssh/authorized_keys ] || [ ! -s ~/.ssh/authorized_keys ]; then
    echo "⚠️ 警告：~/.ssh/authorized_keys 不存在或为空！"
    echo "请先添加公钥，否则你将无法登录！"
    echo "按 Ctrl+C 取消，或按 Enter 继续"
    read
fi

# 4. 重启 SSH
sudo systemctl restart ssh

# 5. 验证配置
echo -e "\n=== 当前认证配置 ==="
sudo grep -E "PasswordAuthentication|PubkeyAuthentication|UsePAM|AuthenticationMethods" /etc/ssh/sshd_config

# 6. 测试密码登录（应该失败）
echo -e "\n=== 测试密码登录（应该失败） ==="
ssh -p 719 -o PreferredAuthentications=password -o PubkeyAuthentication=no root@localhost 2>&1 | head -3

echo -e "\n✅ 配置完成！请用密钥登录测试："
echo "ssh -p 719 root@106.13.78.3"
```



