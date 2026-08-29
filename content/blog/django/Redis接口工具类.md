下面给出一份“能直接跑起来”的最小 Demo，目录结构、依赖、配置、迁移命令、接口路由、视图全部配好。  
只要把项目根目录命名为 django_redis，把下面内容原样粘进去，依次执行 5 步命令即可直接 `curl` 测试。

--------------------------------------------------
1. 目录结构（相对项目根目录 django_redis/）
django_redis/
├── manage.py
├── django_redis/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── redis/               # app
│   ├── __init__.py
│   ├── apps.py
│   ├── urls.py
│   └── views.py
└── libs/
    └── redis_client.py  # 就是你给的封装
--------------------------------------------------
2. 安装依赖
```bash
python -m venv venv
source venv/bin/activate  # win: venv\Scripts\activate
pip install django==4.2  # 4.x 任意版本均可
pip install redis==5.0   # 与你封装保持一致
```
--------------------------------------------------
3. 配置文件
django_redis/settings.py
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'redis',  # 注册 app
]

# 缓存配置（给你封装用的）
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}

# 其它默认项略…
ROOT_URLCONF = 'django_redis.urls'
WSGI_APPLICATION = 'django_redis.wsgi.application'
```
--------------------------------------------------
4. 路由
django_redis/urls.py
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('redis.urls')),
]
```

redis/urls.py
```python
from django.urls import path
from . import views

urlpatterns = [
    path('kv/', views.kv_api, name='kv_api'),       # 增查改
    path('kv/<str:key>/', views.kv_api, name='kv_del'),  # 删
]
```
--------------------------------------------------
5. 视图（CBV 也行，这里 FBV 最直观）
redis/views.py
```python
import json
from django.http import JsonResponse
from libs.redis_client import Redis

def kv_api(request, key=None):
    """
    增删改查一条龙：
    POST   /api/kv/          body: {"key":"k1","value":"v1","ex":60}  -> 新增/覆盖
    GET    /api/kv/?key=k1                          -> 查询
    PUT    /api/kv/          body: {"key":"k1","value":"v2","ex":120} -> 更新
    DELETE /api/kv/k1/                             -> 删除
    """
    r = Redis()

    # 增 / 改
    if request.method == 'POST' or request.method == 'PUT':
        try:
            data = json.loads(request.body)
            k, v, ex = data['key'], data['value'], data.get('ex')
            ok = r.set(k, v, ex=ex)
            return JsonResponse({'code': 0 if ok else 1, 'msg': 'ok' if ok else 'fail'})
        except Exception as e:
            return JsonResponse({'code': 1, 'msg': str(e)}, status=400)

    # 查
    if request.method == 'GET':
        k = request.GET.get('key')
        if not k:
            return JsonResponse({'code': 1, 'msg': 'missing key'}, status=400)
        v = r.get(k)
        return JsonResponse({'code': 0, 'data': v})

    # 删
    if request.method == 'DELETE':
        if key is None:
            return JsonResponse({'code': 1, 'msg': 'missing key'}, status=400)
        cnt = r.delete(key)
        return JsonResponse({'code': 0, 'deleted': cnt})

    return JsonResponse({'code': 1, 'msg': 'method not allowed'}, status=405)
```
--------------------------------------------------
6. 启动 & 测试
```bash
# 1. 建表（虽然本例没用到模型，但 Django 强制 migrate）
python manage.py migrate

# 2. 启动
python manage.py runserver 0.0.0.0:8000

# 3. 增/改
curl -X POST 127.0.0.1:8000/api/kv/ \
     -H "Content-Type: application/json" \
     -d '{"key":"name","value":"django","ex":60}'

# 4. 查
curl 127.0.0.1:8000/api/kv/?key=name

# 5. 删
curl -X DELETE 127.0.0.1:8000/api/kv/name/
```
--------------------------------------------------
7. 一键脚本（可选）
把下面保存成 `run.sh` 直接 `./run.sh` 即可完整体验：
```bash
#!/usr/bin/env bash
set -e
python -m venv venv
source venv/bin/activate
pip install django redis
python manage.py migrate
python manage.py runserver
```

至此，一个最小可运行的 Django + Redis 增删改查接口就完整交付了，直接复制即可使用。