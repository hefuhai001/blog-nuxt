关于 Docker 网络的管理，核心操作如下：

## 1. 查看网络
```bash
# 列出所有网络
docker network ls

# 查看某个网络的详细信息
docker network inspect <网络名>
```

## 2. 创建网络
```bash
# 创建桥接网络（最常用）
docker network create my-net

# 指定子网和网关
docker network create --subnet=172.20.0.0/16 --gateway=172.20.0.1 my-net

# 创建自定义网桥（推荐，容器间可通过名字通信）
docker network create --driver bridge my-bridge
```

## 3. 容器连接网络
```bash
# 运行时指定网络
docker run -d --name my-app --network my-net nginx

# 运行后连接网络
docker network connect my-net my-container

# 断开网络
docker network disconnect my-net my-container

# 启动时连接到多个网络
docker run -d --network net1 --network-alias app1 ubuntu
docker network connect net2 my-container
```

## 4. 删除网络
```bash
# 删除前需断开所有容器
docker network disconnect my-net my-container

# 删除网络
docker network rm my-net

# 清理未使用的网络
docker network prune
```

## 5. 常用网络驱动
| 驱动      | 用途                    |
| --------- | ----------------------- |
| `bridge`  | 单机容器通信（默认）    |
| `host`    | 共享宿主机网络          |
| `overlay` | 跨主机通信（Swarm/K8s） |
| `none`    | 禁用网络                |

## 快速示例
```bash
# 创建网络并运行两个容器
docker network create app-net
docker run -d --name redis --network app-net redis
docker run -d --name app --network app-net my-app

# 现在 app 容器内可直接 ping redis（DNS自动解析）
docker exec app ping redis
```

**注意**：默认的 `bridge` 网络不支持容器名解析，自定义桥接网络才支持。