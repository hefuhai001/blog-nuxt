# CentOS上安装与配置Nginx

Nginx是一款轻量级的Web服务器/反向代理服务器及电子邮件（IMAP/POP3）代理服务器，并在一个BSD-like协议下发行。以下是在CentOS系统上安装和配置Nginx的步骤。

## 1. 准备工作

在开始之前，确保你的系统已经更新到最新版本，并且网络连接正常。

```shell
# 检查网络连接
ping www.baidu.com

# 更新系统源
sudo yum update
```

## 2. 安装编译环境

Nginx需要编译安装，因此需要先安装编译环境和一些必要的库。

```shell
# 安装编译工具
sudo yum -y install gcc

# 安装PCRE库
sudo yum -y install pcre pcre-devel

# 安装Zlib库
sudo yum -y install zlib zlib-devel

# 安装OpenSSL库
sudo yum -y install openssl openssl-devel

# 安装wget工具
sudo yum -y install wget
```

## 3. 下载与安装Nginx

从Nginx官网下载最新的稳定版本。

```shell
# 下载Nginx安装包
wget http://nginx.org/download/nginx-1.9.9.tar.gz

# 解压安装包
tar -zxvf nginx-1.9.9.tar.gz

# 进入解压后的目录
cd nginx-1.9.9

# 配置Nginx
./configure

# 编译并安装Nginx
make
sudo make install
```

## 4. 运行Nginx

安装完成后，Nginx的二进制文件将位于`/usr/local/nginx/sbin/`目录下。

```shell
# 切换到Nginx安装目录
cd /usr/local/nginx/sbin

# 启动Nginx
sudo ./nginx
```

## 5. 检查Nginx运行状态

确认Nginx是否成功运行。

```shell
# 查看Nginx进程
ps -ef | grep nginx
```

## 6. 配置Nginx

编辑Nginx的配置文件，通常位于`/usr/local/nginx/conf/nginx.conf`。

```ini
# 用户配置
user  nobody;

# 工作进程数
worker_processes  1;

# 错误日志和PID文件
error_log  logs/error.log;
pid        logs/nginx.pid;

# 事件配置
events {
    worker_connections  1024;
}

# HTTP服务器配置
http {
    include       mime.types;
    default_type  application/octet-stream;

    # 日志配置
    access_log  logs/access.log  main;

    # 性能优化
    sendfile        on;
    keepalive_timeout  65;

    # Gzip压缩
    gzip  on;

    # 虚拟主机配置
    server {
        listen       80;
        server_name  localhost;

        location / {
            root   /usr/local/nginx/html;
            index  index.html index.htm;
        }

        # 错误页面配置
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/local/nginx/html;
        }
    }
}
```

## 7. 重启Nginx

配置完成后，重启Nginx使配置生效。

```shell
# 停止Nginx
sudo /usr/local/nginx/sbin/nginx -s stop

# 启动Nginx
sudo /usr/local/nginx/sbin/nginx
```

## 8. 验证安装

在浏览器中输入服务器的IP地址，如果看到Nginx的欢迎页面，说明安装成功。
