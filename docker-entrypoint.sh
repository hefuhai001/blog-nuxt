#!/bin/sh
# 入口脚本：确保 /app/data 可写（兼容 bind 挂载 / named volume / 历史遗留卷），
# 再以 root 修正属主后降权到 node 用户运行 CMD。
set -e

DATA_DIR="${DATA_DIR:-/app/data}"

# 仅在以 root 启动时才需要修正属主并降权（镜像不设置 USER node，须 root 启动才能 chown）
if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR"
  chown -R node:node "$DATA_DIR" 2>/dev/null || true

  # 降权到 node 用户执行实际命令（gosu = Debian 下 su-exec 的等价物）
  exec gosu node "$@"
fi

# 非 root 直接执行
exec "$@"
