我来为您介绍如何使用 Docker 在本地运行 Ollama。这是一个非常实用的部署方式，可以让您快速搭建本地大语言模型服务。

## 使用 Docker 本地运行 Ollama

### 1. 基础运行命令

**最简单的方式（CPU 运行）：**
```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

**带 GPU 支持（NVIDIA）：**
```bash
docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

### 2. 参数说明

| 参数                      | 说明                                 |
| ------------------------- | ------------------------------------ |
| `-d`                      | 后台运行                             |
| `-v ollama:/root/.ollama` | 持久化模型数据（使用 Docker Volume） |
| `-p 11434:11434`          | 映射端口，Ollama 默认端口            |
| `--gpus=all`              | 启用 NVIDIA GPU 支持                 |
| `--name ollama`           | 容器名称                             |

### 3. 常用操作命令

**进入容器交互：**
```bash
docker exec -it ollama ollama run llama3.2
```

**在容器外执行命令：**
```bash
# 拉取模型
docker exec -it ollama ollama pull llama3.2

# 查看已下载模型
docker exec -it ollama ollama list

# 运行模型进行对话
docker exec -it ollama ollama run llama3.2
```

**查看日志：**
```bash
docker logs -f ollama
```

### 4. 使用 Docker Compose（推荐）

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    # 如需 GPU，取消下面注释
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: all
    #           capabilities: [gpu]

volumes:
  ollama_data:
```

然后运行：
```bash
docker-compose up -d
```

### 5. 验证安装

```bash
# 检查容器状态
docker ps | grep ollama

# 测试 API 是否可用
curl http://localhost:11434/api/tags
```

### 6. 推荐模型下载

| 模型        | 命令                      | 适用场景         |
| ----------- | ------------------------- | ---------------- |
| Llama 3.2   | `ollama pull llama3.2`    | 通用对话，轻量级 |
| DeepSeek-R1 | `ollama pull deepseek-r1` | 推理能力强       |
| Qwen 2.5    | `ollama pull qwen2.5`     | 中文支持好       |
| CodeGemma   | `ollama pull codegemma`   | 代码生成         |

### 7. 注意事项

1. **GPU 支持**：需要提前安装 [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)
2. **存储空间**：模型文件较大（几GB到几十GB），确保有足够的磁盘空间
3. **内存要求**：运行大模型需要足够的内存/显存

### 8. 与外部应用集成

Ollama 运行后，可以通过以下方式调用：

```bash
# REST API 调用示例
curl -X POST http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "你好，请介绍一下自己"
}'
```

---



看起来是 Docker Hub 连接超时的问题，这在国内网络环境下很常见。以下是几种解决方案：

## 解决方案

### 方案一：配置国内 Docker 镜像源（推荐）

编辑或创建 Docker 配置文件：

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://docker.m.daocloud.io"
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

然后重新运行：
```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

### 方案二：使用代理（如果你有代理工具）

临时设置环境变量：
```bash
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port

docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

或在 Docker Desktop 设置中配置代理（Windows/Mac）。

### 方案三：手动下载镜像后导入

如果镜像源也不稳定，可以先在其他能访问 Docker Hub 的机器上下载，然后导出导入：

**在有网络的机器上：**
```bash
docker pull ollama/ollama
docker save ollama/ollama > ollama.tar
```

**拷贝到你的机器后导入：**
```bash
docker load < ollama.tar
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

### 方案四：使用阿里云镜像（如果可用）

有些阿里云镜像源可能还有效：
```bash
docker pull registry.cn-hangzhou.aliyuncs.com/ollama/ollama:latest
docker tag registry.cn-hangzhou.aliyuncs.com/ollama/ollama:latest ollama/ollama:latest
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

---

**推荐先尝试方案一**，配置国内镜像源后重启 Docker 服务，应该就能正常拉取镜像了。配置完成后可以用以下命令验证：

```bash
docker info | grep -A 10 "Registry Mirrors"
```

如果显示配置的镜像源地址，说明配置成功，再尝试运行 Ollama 容器。