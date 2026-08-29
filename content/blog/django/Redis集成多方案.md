在 Django 中集成 Redis 主要分两步：  
1. 安装并启动 Redis（系统层面）。  
2. 在 Django 项目里选一个「Redis 客户端/封装库」并配置好。  
下面给出 2025 年最常用、最省事的 3 种场景与完整代码，复制即可跑。  

--------------------------------------------------
一、准备工作（所有场景通用）
1. 安装 Redis（以 Ubuntu 为例）
   sudo apt update && sudo apt install redis -y
   sudo systemctl enable --now redis

2. 确认 Redis 监听端口
   redis-cli ping        # 返回 PONG 即可

3. 安装 Python 依赖
   pip install django redis hiredis  # hiredis 为 C 加速解析器，可选但强烈推荐

--------------------------------------------------
二、场景 1：仅做「低阶」缓存 / 计数器 / 队列  
直接用官方 redis-py，不想装第三方包。

```shell

python -m pip install -U redis hiredis

python -c "import redis, django; print('redis', redis.__version__)"

```

project/settings.py
```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",  # Django≥4.0 内置
        "LOCATION": "redis://127.0.0.1:6379/0",   # 0 号库
        "KEY_PREFIX": "demo",        # 全局前缀，防止冲突
        # "OPTIONS": {
        #     "CLIENT_CLASS": "django_redis.client.DefaultClient",
        #     "CONNECTION_POOL_KWARGS": {"max_connections": 50, "retry_on_timeout": True},
        #     "SERIALIZER": "django_redis.serializers.msgpack.MSGPackSerializer",  # 比 pickle 快
        # },
        # "TIMEOUT": 300,              # 默认 5 min
    }
}

# 如想全局开启缓存中间件、模板缓存等，再按官方文档打开即可。
```

视图里即用：
```python
from django.core.cache import cache
cache.set("foo", {"bar": 1}, 60)
print(cache.get("foo"))
```

--------------------------------------------------
三、场景 2：需要「高级」缓存 + 自动序列化 + 分布式锁  
装 django-redis（最成熟，star 4k+）。

pip install django-redis

settings.py 只需把 BACKEND 换成：
```python
"BACKEND": "django_redis.cache.RedisCache",
```
其余同上。  
django-redis 额外福利：

1. 原生支持分布式锁  
```python
from django_redis import get_redis_connection
with cache.lock("payment_123", timeout=20, blocking_timeout=5):
    do_something()
```

2. 直接拿原生连接，可执行任意 Redis 命令  
```python
conn = get_redis_connection("default")
conn.zadd("rank", {"alice": 100, "bob": 90})
```

--------------------------------------------------
四、场景 3：把 Redis 当「消息队列」用（异步任务 / 定时任务）  
推荐 django-q2（轻量，纯 Redis 实现，零额外组件）。

pip install django-q2

settings.py
```python
INSTALLED_APPS += ["django_q"]

Q_CLUSTER = {
    "name": "demo",
    "workers": 4,               # 并发 worker 数
    "timeout": 60,
    "retry": 120,
    "redis": {
        "host": "127.0.0.1",
        "port": 6379,
        "db": 2,                # 单独库
    },
}
```

启动后台集群：
python manage.py qcluster

视图里异步调用：
```python
from django_q.tasks import async_task
async_task("myapp.utils.send_mail", user_id=123)   # 函数路径字符串即可
```

--------------------------------------------------
五、常见坑与排查
1. 连接失败  
   redis-cli ping 先排除网络；Django 日志打开 `LOGGING = {... 'level': 'DEBUG'}` 看 traceback。

2. 中文乱码  
   保证 `SERIALIZER` 使用 msgpack 或 json，不要用 pickle（还会带来 RCE 风险）。

3. 大 key 阻塞  
   用 `redis-cli --bigkeys` 定期巡检；或设置 `timeout=5` 秒。

4. 多虚拟主机共用  
   一定加 `KEY_PREFIX` 或分开 Redis DB，防止 key 冲突。

--------------------------------------------------
六、一键验证脚本
```python
# 任意 app 下建 management/commands/test_redis.py
from django.core.management.base import BaseCommand
from django.core.cache import cache

class Command(BaseCommand):
    def handle(self, *args, **opts):
        cache.set("ping", "pong", 10)
        assert cache.get("ping") == "pong"
        self.stdout.write(self.style.SUCCESS("Redis 集成成功！"))
```
执行：  
python manage.py test_redis  
看到绿色成功即可。

--------------------------------------------------
总结  
- 只想缓存：Django≥4 已内置，零依赖。  
- 要锁 / 管道 / 高级功能：django-redis。  
- 要异步任务：django-q2（或 Celery，但更重）。  

按场景挑一段配置粘进 settings，即可把 Redis 集成到 Django。祝开发顺利!



