# CentOS上安装JDK的详细教程

在CentOS系统上安装Java开发工具包（JDK）是一个常见的任务，特别是对于需要运行Java应用程序的服务器。本教程将指导您如何在CentOS上安装JDK 8和JDK 17。

## 1. 卸载已有的Java版本（如果需要）

在安装新版本的JDK之前，您可能需要卸载系统上已安装的Java版本。

```shell
rpm -qa | grep java
```

上述命令将列出所有已安装的Java相关包。如果需要卸载，请使用以下命令：

```shell
rpm -e --nodeps <已安装的JDK包名>
```

## 2. 安装JDK 8

### 2.1 下载JDK 8

首先，下载JDK 8的安装包。这里我们使用华为云提供的JDK 8镜像。

```shell
wget https://repo.huaweicloud.com/java/jdk/8u202-b08/jdk-8u202-linux-x64.tar.gz
```

### 2.2 创建安装目录

创建一个目录用于存放JDK。

```shell
mkdir -p /usr/local/java
```

### 2.3 解压JDK到安装目录

将下载的JDK包解压到`/usr/local/java`目录。

```shell
tar -zxvf jdk-8u202-linux-x64.tar.gz -C /usr/local/java
```

### 2.4 配置环境变量

编辑`/etc/profile`文件，添加JDK的环境变量。

```shell
vim /etc/profile
```

在文件末尾添加以下内容：

```shell
export JAVA_HOME=/usr/local/java/jdk1.8.0_202
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
export PATH=${JAVA_HOME}/bin:$PATH
```

保存并退出编辑器。

### 2.5 使环境变量生效

使环境变量立即生效。

```shell
source /etc/profile
```

### 2.6 验证安装

检查JDK版本。

```shell
java -version
```

## 3. 安装JDK 17

### 3.1 下载JDK 17

下载JDK 17的安装包。这里我们使用Oracle官方提供的JDK 17镜像。

```shell
wget https://download.oracle.com/java/17/latest/jdk-17_linux-x64_bin.tar.gz
```

### 3.2 解压JDK到安装目录

解压JDK 17到`/usr/local/java`目录。

```shell
tar -zxvf jdk-17_linux-x64_bin.tar.gz -C /usr/local/java
```

### 3.3 配置环境变量

编辑`/etc/profile`文件，添加JDK 17的环境变量。

```shell
vim /etc/profile
```

在文件末尾添加以下内容（请确保替换为正确的解压后的目录名）：

```shell
export JAVA_HOME=/usr/local/java/jdk-17
export PATH=$PATH:$JAVA_HOME/bin
export PATH
```

保存并退出编辑器。

### 3.4 使环境变量生效

使环境变量立即生效。

```shell
source /etc/profile
```

### 3.5 验证安装

检查JDK版本。

```shell
java -version
```

## 4. Java后台运行命令

如果您需要在后台运行Java应用程序，可以使用以下命令：

```shell
nohup java -jar your-application.jar > output.log 2>&1 &
```

这将使Java应用程序在后台运行，并将输出重定向到`output.log`文件。

