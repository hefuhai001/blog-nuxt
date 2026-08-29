### 一、Celery 是什么？

Celery 是一个基于 Python 的**分布式异步任务队列/作业队列**，专注于**实时处理**，同时也支持**任务调度（类似 crontab）**。

它通常用于：

- 异步发送邮件 / 短信 / 通知
- 图片 / 文件异步处理（压缩、转码、上传 OSS）
- 耗时的数据计算、报表生成
- 定时任务（周期任务）

核心概念：

| 名词      | 作用                                              |
|---------|-------------------------------------------------|
| Task    | 业务里“要异步执行的函数”                                   |
| Broker  | 消息中间件，Celery 把任务序列化后发到 Broker；常用 Redis、RabbitMQ |
| Worker  | 常驻进程，监听 Broker，拿到任务后执行                          |
| Backend | 可选，保存任务结果，方便业务端查询；常用 Redis、数据库                  |
| Beat    | 可选，定时把周期任务发送到 Broker，再由 Worker 执行               |

一句话：  
**“把耗时的函数交给 Celery，Django 立即返回响应，Celery Worker 在后台慢慢跑。”**

---

### 二、在 Django 上集成 Celery（以 Redis 为例）

下面给出**最小可运行**的完整步骤，基于：

- Django ≥ 3.2
- Celery ≥ 5.3
- Redis ≥ 5.0（本地 `redis-server` 已启动，端口 6379）

#### 1. 安装依赖

```bash
pip install celery[redis] django-celery-beat django-celery-results
```

#### 2. 项目结构（假设项目名叫 django_celery）

```
django_celery/
├── manage.py
├── django_celery/
│   ├── __init__.py
│   ├── settings.py
│   ├── celery.py      ← 新增
│   └── urls.py
└── demo/
    ├── __init__.py
    ├── tasks.py       ← 放异步任务
    └── views.py
```

#### 3. 创建 `django_celery/celery.py`

```python
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_celery.settings')

app = Celery('django_celery')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()  # 自动发现所有 app 下的 tasks.py
```

#### 4. 修改 `django_celery/__init__.py`

```python
from .celery import app as celery_app

__all__ = ('celery_app',)
```

保证 Django 启动时加载 Celery 实例。

#### 5. 配置 `settings.py`

```python
# Broker & Backend 都用 Redis
CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'
CELERY_RESULT_BACKEND = 'django-db'  # 使用 django-celery-results 存结果
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Shanghai'

INSTALLED_APPS = [
    ...,
    'django_celery_results',
    'django_celery_beat',
]
```

然后迁移数据库：

```bash
python manage.py migrate django_celery_results
python manage.py migrate django_celery_beat
```

#### 6. 写任务 `demo/tasks.py`

```python
from celery import shared_task
import time


@shared_task
def add(x, y):
    time.sleep(5)  # 模拟耗时
    return x + y
```

#### 7. 在视图里触发任务 `demo/views.py`

```python
from django.http import JsonResponse
from .tasks import add
from celery.result import AsyncResult
from django_celery.celery import app

def index(request):
    task = add.delay(3, 7)  # 立即返回，不阻塞
    return JsonResponse({'task_id': task.id})

def result(request, task_id):
    res = AsyncResult(task_id, app=app)
    return JsonResponse({'status': res.status, 'result': res.result})
```

#### 8. 在视图里触发任务 `demo/urls.py`

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('demo/', include('demo.urls')),   # ← 只加这一行
]
```

```python
from django.urls import path
from . import views

app_name = 'demo'

urlpatterns = [
    path('', views.index, name='index'),          # 触发任务
    path('result/<str:task_id>/', views.result, name='result'),  # 查结果
]
```

#### 9. 启动 Worker（另开终端）

```bash
celery -A django_celery worker -l info -P solo   # Windows 用 solo
```

看到 `ready.` 说明 Worker 已监听。

#### 10. 测试

```bash
curl http://localhost:8000/demo/

curl http://localhost:8000/demo/result/<task_id>/

```

返回：

```json
{
  "task_id": "e3f5..."
}
```

Worker 终端会打印：

```
Task demo.tasks.add[e3f5...] succeeded in 5.03s: 10
```

---

### 三、周期任务（beat）

1. 在 Django Admin 里新增 Periodic Task  
   或者写代码：

```python
from celery.schedules import crontab

app.conf.beat_schedule = {
    'add-every-30s': {
        'task': 'demo.tasks.add',
        'schedule': 30.0,
        'args': (1, 2)
    },
}
```

2. 启动 Beat（再开终端）

```bash
celery -A django_celery beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

---

### 四、常见坑

| 现象                                       | 解决                                                                      |
|------------------------------------------|-------------------------------------------------------------------------|
| Worker 启动报 `ModuleNotFoundError: django_celery` | 把项目根目录加入 PYTHONPATH：<br>`export PYTHONPATH=$PYTHONPATH:/path/to/django_celery` |
| Windows 下 Worker 卡死                      | 加 `-P solo` 或安装 `gevent` 后 `-P gevent`                                  |
| 任务延迟高                                    | Redis 尽量本机、同网段；检查网络、Broker 性能                                           |
| 任务结果过大                                   | 不要把大对象直接 return，可存文件/数据库，结果只返回 id                                       |

---

### 五、一句话总结

1. `pip install celery[redis]`
2. 新建 `celery.py` 并 `autodiscover_tasks()`
3. 把耗时函数加上 `@shared_task`
4. 用 `.delay()` 触发
5. 另启 `celery -A proj worker` 和 `beat` 就能跑。

祝你编码愉快，异步起飞！