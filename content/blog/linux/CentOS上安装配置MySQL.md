# CentOS如何安装mysql

## 卸载MySQL

```shell
rpm -qa|grep -i mysql
rpm -ev --nodeps mysql-community-common-5.7.44-1.el7.x86_64
rpm -ev --nodeps mysql57-community-release-el7-10.noarch
rpm -ev --nodeps mysql-community-libs-5.7.44-1.el7.x86_64
rpm -ev --nodeps mysql-community-server-5.7.44-1.el7.x86_64
rpm -ev --nodeps mysql-community-client-5.7.44-1.el7.x86_64

find / -name mysql
rm -rf /var/lib/mysql
rm -rf /var/lib/mysql/mysql
rm -rf /usr/lib64/mysql
rm -rf /usr/share/mysql

rm -rf /etc/my.cnf
rpm -qa|grep -i mysql
rpm -qa | grep mariadb
```



## 安装5.7版本

### 下载

```shell
wget -i -c http://dev.mysql.com/get/mysql57-community-release-el7-10.noarch.rpm
yum -y install mysql57-community-release-el7-10.noarch.rpm
yum -y install mysql-community-server
rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
systemctl start  mysqld.service
systemctl status mysqld.service
grep "password" /var/log/mysqld.log
mysql -uroot -p
```



### 配置远程连接

```shell
set global validate_password_policy=0;
set global validate_password_mixed_case_count=0;
set global validate_password_number_count=0;
set global validate_password_special_char_count=0;
set global validate_password_length=3;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';

grant all privileges on *.* to 'root'@'%' identified by 'password' with grant option;
flush privileges;
exit

firewall-cmd --zone=public --add-port=3306/tcp --permanent
firewall-cmd --zone=public --add-port=8080/tcp --permanent
firewall-cmd --reload

service mysqld restart

status

[client]
default-character-set=utf8
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
character-set-server=utf8
collation-server=utf8_general_ci

set character_set_client=utf8;
set character_set_connection=utf8;
set character_set_database=utf8;
set character_set_results=utf8;
set character_set_server=utf8;

systemctl enable mysqld
systemctl daemon-reload
```



## 安装8.0版本

### 下载

```shell
sudo rpm -Uvh https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm

sudo yum --enablerepo=mysql80-community install mysql-community-server

grep "A temporary password" /var/log/mysqld.log;

ALTER USER 'root'@'localhost' IDENTIFIED BY 'Password@123';
--可以使用以下命令进行修改
--密码验证策略低要求(0或LOW代表低级)
set global validate_password.policy=MEDIUM;
--密码至少要包含的小写字母个数和大写字母个数
set global validate_password.mixed_case_count=0;
--密码至少要包含的数字个数。
set global validate_password.number_count=0; 
--密码至少要包含的特殊字符数
set global validate_password.special_char_count=0; 
-- 密码长度
set global validate_password.length=8;  

show variables like 'validate%';
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
```



### 配置远程连接

```shell
use mysql;
select host, user, authentication_string, plugin from user;

CREATE USER 'root'@'%' IDENTIFIED BY 'password';
grant all privileges on *.* to 'root'@'%';
flush privileges;

```

### 检查运行状态
```shell
systemctl status mysqld
ps -ef|grep mysqld
```

