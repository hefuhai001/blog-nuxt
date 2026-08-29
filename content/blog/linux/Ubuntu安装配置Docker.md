# Ubuntu 上安装 Docker

## 🥇 **方法一：使用官方脚本安装（最简单快捷）**

### 1. 一键安装命令
```bash
# 下载并执行 Docker 官方安装脚本
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. 启动 Docker 服务
```bash
# 启动 Docker 服务
sudo systemctl start docker

# 设置开机自启
sudo systemctl enable docker

# 查看服务状态
sudo systemctl status docker
```

### 3. 将当前用户加入 docker 组（避免每次使用 sudo）
```bash
# 将用户加入 docker 组
sudo usermod -aG docker $USER

# 重新登录或执行以下命令使分组生效
newgrp docker

# 验证是否生效
groups
```

---

## 🥈 **方法二：使用官方仓库安装（推荐用于生产环境）**

### 1. 卸载旧版本（如有）
```bash
sudo apt remove docker docker-engine docker.io containerd runc
```

### 2. 更新系统并安装依赖
```bash
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
```

### 3. 添加 Docker 官方 GPG 密钥
```bash
# 创建 keyrings 目录
sudo mkdir -p /etc/apt/keyrings

# 下载并添加 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置正确的权限
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

### 4. 添加 Docker 软件仓库
```bash
# 添加仓库（自动检测系统版本）
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 5. 安装 Docker Engine
```bash
# 更新软件包索引
sudo apt update

# 安装 Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

---

## 🔧 **安装后的配置和验证**

### 1. 验证安装
```bash
# 检查 Docker 版本
docker --version

# 运行测试容器
docker run hello-world

# 查看详细信息
docker version
docker info
```

### 2. 配置 Docker 镜像加速（国内用户推荐）
```bash
# 创建配置目录
sudo mkdir -p /etc/docker

# 配置镜像加速器（使用阿里云、腾讯云等）
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://registry.docker-cn.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
EOF

# 重启 Docker 服务
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 3. 安装 Docker Compose（如果方法二未自动安装）
```bash
# 下载最新版本（替换为最新版本号）
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 创建符号链接
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# 验证安装
docker-compose --version
```

---

## 🛠️ **常用 Docker 命令**

### 基础命令
```bash
# 查看所有容器
docker ps -a

# 查看运行中的容器
docker ps

# 查看镜像
docker images

# 拉取镜像
docker pull ubuntu:20.04

# 运行容器
docker run -it ubuntu:20.04 /bin/bash

# 停止容器
docker stop <container_id>

# 删除容器
docker rm <container_id>

# 删除镜像
docker rmi <image_id>
```

### 服务管理命令
```bash
# 启动 Docker 服务
sudo systemctl start docker

# 停止 Docker 服务
sudo systemctl stop docker

# 重启 Docker 服务
sudo systemctl restart docker

# 查看 Docker 服务状态
sudo systemctl status docker

# 设置开机自启
sudo systemctl enable docker
```

---

## ⚠️ **故障排除**

### 1. 如果遇到权限问题
```bash
# 确保用户已在 docker 组中
sudo usermod -aG docker $USER

# 重新登录服务器
# 或者执行
newgrp docker
```

### 2. 如果端口冲突
```bash
# 检查端口占用
sudo netstat -tulpn | grep :2375
```

### 3. 如果存储空间不足
```bash
# 查看 Docker 磁盘使用
docker system df

# 清理无用资源
docker system prune
```

---

## 📝 **完整的一键安装脚本**

如果你想要一个完整的自动化安装脚本，可以保存以下内容为 `install_docker.sh`：

```bash
#!/bin/bash

# Ubuntu Docker 一键安装脚本
echo "开始安装 Docker..."

# 更新系统
sudo apt update

# 安装依赖
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 下载官方安装脚本并执行
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 将当前用户加入 docker 组
sudo usermod -aG docker $USER

# 启动并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker

# 输出安装信息
echo "Docker 安装完成！"
docker --version

echo "请重新登录或执行 'newgrp docker' 使权限生效"
```

给脚本执行权限并运行：
```bash
chmod +x install_docker.sh
./install_docker.sh
```

---

## 🎯 **推荐选择**

- **新手/开发环境**：使用方法一（官方脚本）
- **生产环境**：使用方法二（官方仓库）
- **国内服务器**：记得配置镜像加速器

安装完成后，你就可以开始使用 Docker 来部署你的博客系统了！
