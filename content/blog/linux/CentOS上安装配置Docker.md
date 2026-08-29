# Docker基本使用

### 安装

```bat
更新源
yum update

yum install -y yum-utils device-mapper-persistent-data lvm2

yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

yum install -y docker-ce

docker -v

配置docker加速
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://zpthq4nu.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker

cat /etc/docker/daemon.json

```

### 常用命令

```bat
开启
systemctl start docker

查看状态
systemctl status docker

关闭
systemctl stop docker

重启
restart docker

开机自启
systemctl enable docker

```


### 镜像

```bat
查看镜像
docker images

搜索镜像
docker search redis

下载最后版本的镜像
docker pull redis

查找就像版本网址
--hub.docker.com

下载指定版本镜像
docker pull redis:5.0

删除指定镜像
docker rmi id

删除指定版本镜像
docker rmi redis:5.0

查看所有id
docker images -q

删除所有镜像
docker rmi `docker images -q`

```

### 容器

```bat
创建容器 前台运行
docker run -it --name=c1 centos:7 /bin/bash

退出
exit

查看正在运行的容器
docker ps

查看容器
docker ps -a

创建容器 后台运行
docker run -id --name=c2 centos:7

进入容器
docker exec -it c2 /bin/bash

删除容器
docker rm c1

查看所有容器
docker ps -aq

删除所有容器
docker rm `docker ps -aq`

查看容器信息
docker inspect c1

```

### 数据卷

```bat
将 /root/data 绑定到容器 /root/data_container
docker run -it --name=c3 -v /root/data:/root/data_container centos:7 /bin/bash

```

