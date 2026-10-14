#!/bin/sh
# 入口脚本：以 root 启动时降权到 node 用户运行 CMD。
# 内容与网址导航数据均存于外部 MySQL，容器内不再需要可写数据目录。
set -e

if [ "$(id -u)" = "0" ]; then
  # 降权到 node 用户执行实际命令（gosu = Debian 下 su-exec 的等价物）
  exec gosu node "$@"
fi

# 非 root 直接执行
exec "$@"
