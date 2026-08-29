在 Windows 上启动 Celery 只要记住 3 件事：

1. 必须装 eventlet（或 gevent）并指定 `-P eventlet`；
2. 项目路径下要有 `celery.py` 并且 `__init__.py` 里做 `app.autodiscover_tasks()`；
3. 启动命令用 PowerShell / CMD 都可以，但建议 PowerShell。

下面给出最小可复制的完整流程（假定项目名叫 myproject，与 manage.py 同级）。

--------------------------------------------------
一、装包

```powershell
# 在虚拟环境里执行
pip install celery eventlet
# 如用 Redis 做 Broker
pip install redis
```

--------------------------------------------------
二、确认目录结构（无则补齐）

```
myproject/
├── manage.py
├── myproject/
│   ├── __init__.py   ← 这里要导 app
│   ├── settings.py
│   ├── celery.py     ← 创建
│   └── urls.py
└── tasks.py          ← 业务任务，可放任意 app
```

celery.py（示范）

```python
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

app = Celery('myproject')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

__init__.py（导 app，保证 Django 能识别）

```python
from .celery import app as celery_app

__all__ = ('celery_app',)
```

--------------------------------------------------
三、配置 broker（settings.py 末尾加两行即可）

```python
CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'
CELERY_RESULT_BACKEND = 'redis://127.0.0.1:6379/0'
```

本地没 Redis 可先用 `CELERY_BROKER_URL = 'memory://'` 做测试，但重启就丢任务。

--------------------------------------------------
四、启动 worker（PowerShell 示例）

```powershell
# 切到项目根目录（manage.py 所在）
cd D:\...\django_celery

# 启动 worker
celery -A django_celery worker -l INFO -P eventlet
```

看到  
`[tasks]  
. tasks.add  
. tasks.send_mail_code`  
且最后一行出现  
`Worker ready!`  
即成功。

--------------------------------------------------
五、常见报错速查

1. 报错 `ValueError: not enough values to unpack`  
   → 你忘了加 `-P eventlet`（Windows 默认的 prefork 不能用）。

2. 报错 `ModuleNotFoundError: No module named 'myproject'`  
   → 没在项目根目录启动，或 `__init__.py` 没导 `celery_app`。

3. 日志提示 `Consumer: Connection refused`  
   → Redis 没启动；先运行 `redis-server`（或把 broker 换成 RabbitMQ）。

--------------------------------------------------
六、开发调试常用命令

```powershell
# 只跑一个并发线程，调试更清爽
celery -A myproject worker -l DEBUG -P eventlet -c 1

# 启动定时任务调度器（如用 celery beat）
celery -A myproject beat -l INFO
```

复制即可用，祝 Windows 下 celery 一路绿灯!