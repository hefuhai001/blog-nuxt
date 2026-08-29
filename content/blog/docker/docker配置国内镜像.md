### 配置国内镜像加速器

这是最稳定、最根本的解决方法。你需要修改 Docker 的配置文件，添加国内主流云厂商提供的镜像加速地址。

**步骤：**

1.  创建或编辑 Docker 配置文件：`/etc/docker/daemon.json`

    ```bash
    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json <<-'EOF'
    {
      "registry-mirrors": [
        "https://docker.1ms.run",
        "https://docker.xuanyuan.me"
      ]
    }
    EOF
    ```

    *以上两个地址是社区提供的稳定公共镜像站。你也可以使用云厂商的加速器（需登录获取专属地址）：*

    - **阿里云**：登录 `cr.console.aliyun.com` -> 镜像工具 -> 镜像加速器，获取 `https://xxx.mirror.aliyuncs.com`
    - **腾讯云**：`https://mirror.ccs.tencentyun.com`
    - **中科大**：`https://docker.mirrors.ustc.edu.cn`

2.  重新加载配置并重启 Docker 服务：

    ```bash
    sudo systemctl daemon-reload
    sudo systemctl restart docker
    ```

3.  验证配置是否生效：

    ```bash
    docker info | grep -A 1 "Registry Mirrors"
    ```

    如果输出了你配置的地址，说明成功。

### 常见问题排查

- **配置加速器后还是很慢？**
  - 运行 `docker info` 检查配置是否生效。
  - 更换其他镜像加速地址（上面方案一中的社区地址通常较稳定，阿里云需要注册）。
  - 测试服务器到加速器的网络延迟：`ping 你的加速器域名`
  - **注意**：配置多个加速器时，Docker 会依次尝试，某个失效不会影响其他。

- **拉取大镜像（1GB+）时中断？**
  - 使用 `docker pull --platform` 指定平台（如 `linux/amd64`）可能减少兼容层导致的额外下载。
  - 还是建议优先使用方案一或方案二。

**总结**：首选方案一配置镜像加速器，只需几分钟配置，之后所有镜像拉取都能享受速度提升。如果公有镜像站不稳定，注册一个阿里云账号（免费）获取专属加速器地址是最稳妥的选择。