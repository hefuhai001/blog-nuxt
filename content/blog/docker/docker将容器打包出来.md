将 Docker 容器打包出来主要有两种情况：

---

### 场景 1：有一个**正在运行或已停止的容器**，想把它打包成一个新的镜像（image）

#### 步骤如下：

```bash
docker commit <容器ID或名称> 新镜像名:标签
```

**示例：**

```bash
docker commit my_container my_new_image:v1
```

然后你可以：

```bash
docker save -o my_new_image.tar my_new_image:v1
```

这会生成一个 `.tar` 文件，里面包含了镜像，可以拷贝到其他机器上：

```bash
docker load -i my_new_image.tar
```

---

### 场景 2：你有一个**Dockerfile**，想构建一个镜像并打包出来

#### 步骤如下：

```bash
docker build -t my_image:v1 .
docker save -o my_image.tar my_image:v1
```

---

### ⚠️ 注意：

- `docker commit` 会保存容器当前状态（包括文件系统变更），但不会保存挂载卷（volumes）中的数据。
- 如果你希望**持久化数据**，请手动备份 volume 内容，例如：

```bash
docker run --rm -v my_volume:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .
```
