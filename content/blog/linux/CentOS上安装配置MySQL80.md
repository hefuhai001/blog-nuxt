# CentOS 7 上安装 MySQL 8.0 教程

## 一、安装前准备

在开始安装之前，我们需要确保系统环境已经准备好。

### 1. 卸载 MariaDB

由于 MySQL 和 MariaDB 可能会有文件冲突，建议先卸载 MariaDB。

```bash
rpm -qa|grep mariadb
rpm -e --nodeps 文件名
rpm -qa|grep mariadb
```

### 2. 检查依赖

确保系统已安装 `libaio` 和 `numactl`。

```bash
rpm -qa|grep libaio
yum -y install libaio

rpm -qa|grep numactl
yum -y install numactl
```

## 二、安装 MySQL

### 1. 下载资源包

你可以选择从官网下载或者使用 `wget` 在服务器上直接下载。

```bash
# 官网下载
MySQL官网下载地址: https://dev.mysql.com/downloads/mysql/

# 使用wget下载
wget https://downloads.mysql.com/archives/get/p/23/file/mysql-8.0.30-el7-x86_64.tar
```

### 2. 解压

将下载的安装包上传到 `/usr/local/` 目录下，并解压。

```bash
cd /usr/local/
tar -xvf mysql-8.0.30-el7-x86_64.tar
tar -zxvf mysql-8.0.30-el7-x86_64.tar.gz
```

### 3. 重命名和创建存储数据文件夹

```bash
mv mysql-8.0.30-el7-x86_64/ mysql
mkdir mysql/data
```

### 4. 设置用户组并赋权

```bash
groupadd mysql
useradd -r -g mysql mysql
chown -R mysql:mysql /usr/local/mysql/
chmod -R 755 /usr/local/mysql/
```

### 5. 初始化 MySQL

```bash
cd /usr/local/mysql/bin/
./mysqld --initialize --user=mysql --datadir=/usr/local/mysql/data --basedir=/usr/local/mysql
```

记下初始化过程中生成的临时密码。

### 6. 配置参数文件

编辑 `/etc/my.cnf` 文件，配置数据库字符集和其他参数。

```bash
vi /etc/my.cnf
```

添加或修改以下内容：

```ini
[client]
port = 3306
socket = /usr/local/mysql/data/mysql.sock
default-character-set = utf8mb4

[mysql]  
default-character-set = utf8mb4

[mysqld]  
character-set-server = utf8mb4
collation-server = utf8mb4_general_ci
init_connect = 'SET NAMES utf8mb4'
port = 3306
socket = /usr/local/mysql/data/mysql.sock
skip-external-locking
```

### 7. 启动 MySQL

```bash
/usr/local/mysql/support-files/mysql.server start
```

### 8. 设置软连接，并重启 MySQL

```bash
ln -s /usr/local/mysql/support-files/mysql.server /etc/init.d/mysql
ln -s /usr/local/mysql/bin/mysql /usr/bin/mysql
ln -s /usr/local/mysql/mysql.sock /var/mysql.sock
service mysql restart
```

### 9. 登录并更改密码

使用初始化时生成的临时密码登录 MySQL，并更改密码。

```bash
mysql -uroot -p
```

更改密码的命令：

```sql
alter user 'root'@'localhost' identified by '新密码';
```

### 10. 开放远程连接

如果需要远程连接 MySQL，更新用户权限并刷新。

```sql
use mysql;
update user set host = '%' where user = 'root';
flush privileges;
```

### 11. 连接工具测试连接 MySQL

确保 MySQL 服务运行正常，使用连接工具测试远程连接。

## 三、设置开机自启动（可选）

将 MySQL 服务设置为开机自启动。

```bash
cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld
chmod +x /etc/init.d/mysqld
chkconfig --add mysqld
chkconfig --level 345 mysqld on
```

重启系统以确认 MySQL 是否自启动。

```bash
reboot
ps -ef|grep mysql
```
