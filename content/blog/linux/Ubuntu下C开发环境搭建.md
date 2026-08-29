# Ubuntu系统下C语言开发环境搭建与使用教程

本指南为您提供了在Ubuntu操作系统上搭建C语言开发环境的详尽步骤。从网络配置到SSH服务安装，再到GCC编译器和Vim编辑器的配置，每一步都配有详细的命令和说明。此外，还包括了用户管理的实用技巧和C语言程序的测试示例。无论是Linux新手还是经验丰富的开发者，本教程都将助您快速上手C语言在Ubuntu上的应用开发。

## 教程内容

### 0. 序言

Ubuntu是一个用户友好的Linux发行版，以其易用性和强大的社区支持而闻名。本指南将带您了解如何在Ubuntu上安装和配置C语言开发工具，让您能够轻松编写和编译C程序。

### 1. 准备工作

在开始之前，确保您的Ubuntu系统已经连接到互联网。使用以下命令检查网络连接：

```bash
ping www.baidu.com
```

如果网络未连接，您可能需要重启DHCP和NAT服务。在Windows主机上，可以通过服务管理界面重启这些服务。对于虚拟机，可以使用以下快捷键重启服务：

```bash
# 重启VMware DHCP Service 和 VMware NAT Service
```

更新Ubuntu的软件源，以确保您可以访问最新的软件包：

```bash
sudo apt update
```

### 2. 安装SSH

SSH服务允许您远程管理Ubuntu系统。检查SSH服务是否已安装：

```bash
sudo ps -e | grep ssh
```

如果未安装，使用以下命令安装：

```bash
sudo apt install openssh-server
```

安装完成后，再次检查SSH服务是否正在运行：

```bash
sudo ps -e | grep ssh
```

### 3. 安装GCC和G++

GCC是GNU编译器集合，支持C语言和其他编程语言的编译。安装GCC：

```bash
sudo apt install gcc
```

为了编译C++程序，您还需要安装G++：

```bash
sudo apt install g++
```

### 4. 安装Vim

Vim是一个强大的文本编辑器，适合编写代码。安装Vim：

```bash
sudo apt install vim
```

### 5. 测试C语言程序

创建一个简单的C语言程序`hello.c`文件：

- 使用`vim hello.c`命令
- 键盘输入 `i` 键，切入到输入模式
- 粘贴以下代码
- 键盘输入 `Esc` 键，退出输入模式
- 键盘输入 `:wq` 保存并退出

```c
// hello.c - 一个简单的C语言程序，打印"hello world!"
#include <stdio.h>

int main(void) {
    printf("hello world!\n");
    return 0;
}
```

- 使用GCC编译`hello.c`：

```bash
gcc -Wall hello.c -o hello
```

- 运行编译后的程序：

```bash
./hello
```

### 6. 用户管理

Ubuntu默认不允许root用户登录，但您可以设置root密码以进行管理操作：

```bash
sudo passwd root
```

切换到root用户：

```bash
su root
```

您可以添加新用户：

```bash
sudo adduser lkkb
```

或删除用户：

```bash
sudo deluser lkkb
```

查看当前系统的所有用户：

```bash
w
```
