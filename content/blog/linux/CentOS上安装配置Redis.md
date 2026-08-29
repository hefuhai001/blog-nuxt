# CentOS系统上安装Redis操作教程

Redis（Remote Dictionary Server）是一个开源的，基于内存的高性能键值对（NoSQL）数据库。它支持多种类型的数据结构，如字符串（strings）、列表（lists）、集合（sets）、有序集合（sorted sets）、哈希（hashes）、位图（bitmaps）、超日志（hyperloglogs）和地理空间（geospatial）索引半径查询。Redis因其出色的性能、可扩展性和广泛的功能集而广受欢迎。

## 前期准备

在开始安装Redis之前，确保你的CentOS系统已经安装了必要的依赖项，并且系统是最新的。这有助于避免在安装过程中遇到不必要的问题。

1. **更新系统**：

   ```shell
   sudo yum update
   ```

2. **安装编译工具**：
   除了`gcc`，你可能还需要安装`make`和`tcl`，因为它们是编译Redis的依赖项。

   ```shell
   sudo yum install -y gcc make tcl
   ```

## 下载Redis

3. **下载Redis**：
   选择一个稳定的Redis版本进行下载。这里我们以6.2.6版本为例。

   ```shell
   wget https://download.redis.io/releases/redis-6.2.6.tar.gz
   ```

4. **解压下载的压缩包**：

   ```shell
   tar -zxvf redis-6.2.6.tar.gz
   ```

5. **进入Redis目录**：

   ```shell
   cd redis-6.2.6/
   ```

## 编译安装Redis

6. **编译Redis**：
   在Redis目录中，执行编译命令。这将自动检测系统环境并编译Redis。

   ```shell
   make
   ```

7. **安装Redis**：
   使用`make install`命令将Redis安装到指定目录。这里我们选择`/usr/local/redis`作为安装目录。

   ```shell
   sudo make install PREFIX=/usr/local/redis
   ```

## 配置Redis

8. **创建Redis配置文件目录**：

   ```shell
   sudo mkdir /etc/redis
   ```

9. **复制配置文件**：
   将默认的配置文件复制到`/etc/redis`目录。

   ```shell
   sudo cp redis.conf /etc/redis/
   ```

10. **编辑配置文件**：
    使用文本编辑器（如`vi`或`nano`）编辑配置文件，根据需要调整设置。

    ```shell
    sudo vi /etc/redis/redis.conf
    ```

    例如，你可以设置`bind`指令来限制Redis服务的访问，或者调整内存使用策略等。

## 启动Redis服务

11. **启动Redis**：
    使用以下命令启动Redis服务。

    ```shell
    /usr/local/redis/bin/redis-server /etc/redis/redis.conf
    ```

    ```shell
    # 查看进程来确定redis是否启动成功，非必须
    ps -ef |grep redis
    ```

    

12. **设置Redis开机自启**：
    创建一个systemd服务文件来管理Redis服务。

    ```shell
    sudo vim /etc/systemd/system/redis.service
    ```

    在文件中添加以下内容（请根据实际情况修改`ExecStart`路径）：

    ```ini
    [Unit]
    Description=Redis In-Memory Data Store
    After=network.target
    
    [Service]
    User=redis
    Group=redis
    ExecStart=/usr/local/redis/bin/redis-server /etc/redis/redis.conf
    ExecStop=/usr/local/redis/bin/redis-cli shutdown
    PrivateTmp=true
    
    [Install]
    WantedBy=multi-user.target
    ```

    保存并退出编辑器。

13. **启用Redis服务**：

    ```shell
    sudo systemctl enable redis.service
    ```

14. **启动Redis服务**：

    ```shell
    sudo systemctl start redis.service
    ```

## 验证Redis安装

15. **检查Redis服务状态**：

    ```shell
    sudo systemctl status redis.service
    ```

16. **测试Redis**：
    使用Redis命令行客户端测试服务。

    ```shell
    /usr/local/redis/bin/redis-cli
    ```

    在客户端中，尝试执行一些基本命令，如`set`和`get`，来验证Redis是否正常工作。

## 停止和重启Redis服务

17. **停止Redis服务**：

    ```shell
    sudo systemctl stop redis.service
    ```

18. **重启Redis服务**：

    ```shell
    sudo systemctl restart redis.service
    ```

## 卸载Redis服务

19. **停止并禁用Redis服务**：

    ```shell
    sudo systemctl stop redis.service
    sudo systemctl disable redis.service
    ```

20. **删除Redis服务文件**：

    ```shell
    sudo rm /etc/systemd/system/redis.service
    ```

21. **删除Redis安装目录**：

    ```shell
    sudo rm -rf /usr/local/redis
    ```

22. **清理Redis配置文件**：

    ```shell
    sudo rm /etc/redis/redis.conf
    ```

在执行上述步骤时，请确保你有足够的权限来执行系统命令。如果你不是root用户，你可能需要在命令前加上`sudo`来获取必要的权限。
