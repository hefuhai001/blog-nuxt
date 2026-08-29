# 在Ubuntu 24.04上安装Docker和Docker Compose（解决国内网络问题）

## 📦 安装步骤

```bash
# 1. 更新软件包索引
sudo apt update

# 2. 安装依赖包
sudo apt install -y ca-certificates curl

# 3. 创建密钥目录
sudo install -m 0755 -d /etc/apt/keyrings

# 4. 使用阿里云镜像下载GPG密钥（解决国内网络问题）
sudo curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc

# 5. 为密钥文件添加读取权限
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 6. 添加Docker软件源（使用阿里云镜像）
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://mirrors.aliyun.com/docker-ce/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  
# 7. 更新软件包索引
sudo apt update

# 8. 安装Docker和Compose插件
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 验证Docker引擎
sudo docker run hello-world

# 验证Docker Compose
docker compose version

# 1. 将当前用户添加到docker组
sudo usermod -aG docker $USER

# 2. 使权限生效（二选一）
# 方式A：重新登录（关闭终端再打开）
# 方式B：立即生效
newgrp docker

# 3. 验证（现在不需要sudo了）
docker ps
docker run hello-world

