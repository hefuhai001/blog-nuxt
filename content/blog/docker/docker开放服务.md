### Docker开放服务

##### 1.纯 CLI 方式（不用 JSON 写 hosts）

```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo tee /etc/systemd/system/docker.service.d/override.conf <<'EOF'
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

确认监听：
```bash
sudo ss -lntp | grep 2375
```
应该能看到 `0.0.0.0:2375`。

------------------------------------------------
2. ##### 纯 JSON 方式（推荐，最干净）

```shell
vim /etc/docker/daemon.json
```

```json
 {
     "hosts": ["tcp://0.0.0.0:2375", "unix:///var/run/docker.sock"],
     "registry-mirrors": [
         "https://docker.1ms.run ",
         "https://docker.xuanyuan.me ",
         "https://docker.m.daocloud.io ",
         "https://ccr.ccs.tencentyun.com "
     ]
 }
```

```shell
sudo systemctl daemon-reload
sudo systemctl restart docker
```

确认监听：

```bash
sudo ss -lntp | grep 2375
```

应该能看到 `0.0.0.0:2375`。
