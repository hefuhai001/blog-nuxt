# 如何在Ubuntu编写运行C语言

## 1.准备工作(检查网络&更新源)

``` sh
ping www.baidu.com

services.msc

VMware DHCP Service
VMware NAT Service

sudo apt update
```

## 2.ssh

```sh
sudo ps -e |grep ssh

sudo apt install openssh-server

sudo ps -e |grep ssh

service ufw stop

sudo apt install net-tools

ifconfig

```

## 3.gcc g++

```sh
sudo apt install gcc

sudo apt install build-essential

sudo apt install g++
````

## 4.vim

```sh
sudo apt install vim
````

## 5.测试

```shell
vim hello.c

gcc -Wall hello.c -o hello

gcc hello.c -o hello

./hello
```

## 6.切换用户

```shell
sudo passwd root

su root

sudo adduser he

sudo deluser he

w

```

```c
#include<stdio.h>
int main(void)
{
        printf("hello world!\n");
        return 0;
}  
```

