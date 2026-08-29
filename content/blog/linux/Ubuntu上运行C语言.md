# Ubuntu上运行c语言教程

## 0.序言

Ubuntu是一个以桌面应用为主的Linux操作系统，其名称来自非洲南部祖鲁语或豪萨语的“ubuntu"一词，意思是“人性”“我的存在是因为大家的存在"，是非洲传统的一种价值观。Ubuntu基于Debian发行版和Gnome桌面环境，而从11.04版起，Ubuntu发行版放弃了Gnome桌面环境，改为Unity。从前人们认为Linux难以安装、难以使用，在Ubuntu出现后这些都成为了历史。Ubuntu也拥有庞大的社区力量，用户可以方便地从社区获得帮助。

## 1.准备工作(检查网络&更新源)

```bat
ping www.baidu.com
-- 检查网络

services.msc
-- ？？？

VMware DHCP Service
VMware NAT Service
-- 若网络未连接，win+shift+esc打开控制台，在任意一项右键转到服务，找到上述两项重启，再重启虚拟机即可连接到网络。

sudo apt update
-- 更新源
```

## 2.安装ssh

```shell
sudo ps -e |grep ssh
-- 检查是否安装ssh服务

sudo apt install openssh-server
-- 安装ssh服务

sudo ps -e |grep ssh
-- 再次检查

service ufw stop
-- 暂停防火墙

sudo apt install net-tools
-- 下载网络检查工具

ifconfig
-- 查看IP和网络配置

```

## 3.安装gcc g++

```bat
sudo apt install gcc
-- 安装gcc

sudo apt install build-essential
-- 下载打包构建工具

sudo apt install g++
-- 下载g++
````

## 4.安装vim

```bat
sudo apt install vim
-- 下载vim
````

## 5.测试

```bat
vim hello.c
-- 创建hello.c文件

gcc -Wall hello.c -o hello
gcc hello.c -o hello
-- 将hello.c文件编译为hello

./hello
-- 运行hello可执行文件
```

## 6.切换用户

```bat
sudo passwd root
-- 为root用户设置密码

su root
-- 切换到root用户

sudo adduser he
-- 增加he用户

sudo deluser he
删除he用户

w
-- 查看所有用户

```

```c
// 测试代码
#include<stdio.h>
int main(void)
{
        printf("hello world!\n");
        return 0;
}  
```
