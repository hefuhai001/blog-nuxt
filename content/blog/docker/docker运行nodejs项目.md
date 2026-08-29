一行命令直接运行一个 Node.js 项目，**无需打包镜像**，并将当前目录挂载到容器中：

```bash
docker run --rm -it -v $(pwd):/app -w /app -p 3000:3000 node:alpine sh -c "npm install && npm start"
```

### ✅ 说明：
- `--rm`：容器退出后自动删除。
- `-it`：交互模式，方便查看日志。
- `-v $(pwd):/app`：将当前目录挂载到容器内的 `/app`。
- `-w /app`：设置工作目录为 `/app`。
- `-p 3000:3000`：映射端口（根据你的项目需要调整）。
- `node:alpine`：使用官方 Node.js 镜像，轻量。
- `sh -c "npm install && npm start"`：进入容器后自动安装依赖并启动项目。

> ⚠️ 注意：你的项目根目录下必须有 `package.json` 和 `npm start` 脚本。
