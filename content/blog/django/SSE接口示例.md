下面给出一份「能直接跑」的 Django-SSE 最小示例，项目名就叫 **django_sse**。  
复制粘贴即可运行，无需额外依赖（仅 Django≥3.0，Python≥3.7）。

--------------------------------------------------
1. 创建并激活虚拟环境（可选但推荐）
```bash
python -m venv venv
source venv/bin/activate          # Windows 用 venv\Scripts\activate
```

2. 安装 Django
```bash
pip install "django>=3.0"
```

3. 建立项目
```bash
django-admin startproject django_sse
cd django_sse
python manage.py startapp app     # 应用名随意
```

4. 目录结构（最终）
django_sse/
├── django_sse/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── app/
│   ├── __init__.py
│   ├── views.py
│   └── urls.py
└── manage.py

--------------------------------------------------
5. 代码清单

app/views.py
```python
import json
import time
from django.http import StreamingHttpResponse

def sse_generator():
    """无限产生 SSE 格式的数据"""
    event_id = 0
    while True:
        payload = {
            "id": event_id,
            "timestamp": time.time(),
            "msg": "hello from django-sse",
        }
        # SSE 格式：id: <id>\ndata: <json>\n\n
        yield f"id: {event_id}\ndata: {json.dumps(payload)}\n\n"
        event_id += 1
        time.sleep(2)          # 每 2 秒推送一次

def sse_view(request):
    """SSE 接口：/sse/"""
    response = StreamingHttpResponse(
        streaming_content=sse_generator(),
        content_type="text/event-stream",
    )
    # 禁用 Django 的默认缓存与分块，确保实时性
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"   # 关闭 Nginx 代理缓冲（如用 Nginx）
    return response
```

app/urls.py
```python
from django.urls import path
from .views import sse_view

urlpatterns = [
    path("sse/", sse_view, name="sse"),
]
```

django_sse/urls.py
```python
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("app.urls")),
]
```

django_sse/settings.py
只需把 `app` 注册到 `INSTALLED_APPS` 即可，其余默认：
```python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "app",                # 新增
]
```

--------------------------------------------------
6. 运行
```bash
python manage.py migrate   # 可选，创建默认表
python manage.py runserver
```

7. 测试
浏览器打开  
http://127.0.0.1:8000/sse/  
即可看到每 2 秒推送一条 JSON 的 SSE 流。  
也可以用 `curl`：

```bash
curl -N http://127.0.0.1:8000/sse/
```

--------------------------------------------------
8. 前端演示（可选）
把下面文件保存成 `test.html` 直接双击打开即可：

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Django SSE 测试</title>
</head>
<body>
  <ul id="log"></ul>
  <script>
    const ul = document.getElementById('log');
    const evtSource = new EventSource('/sse/');
    evtSource.onmessage = function (e) {
      const li = document.createElement('li');
      li.textContent = e.data;
      ul.appendChild(li);
    };
  </script>
</body>
</html>
```

--------------------------------------------------
至此，一个最小可运行的 Django-SSE 示例「django_sse」就完成了， Enjoy!





下面给出「一步到位」的补全方案：  
1. 在 `app/views.py` 里再写一个接口，负责把 `test.html` 吐出去；  
2. 把刚才的 `test.html` 做成模板，放在 `templates/` 下；  
3. 让前端通过 `/` 访问页面，页面里用 `EventSource` 实时接收 `/sse/` 的流。

依旧「零第三方依赖」，复制即可跑。

--------------------------------------------------
1. 目录结构（最终）
django_sse/
├── django_sse/
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── app/
│   ├── views.py
│   ├── urls.py
│   └── ...
└── templates/
    └── test.html

2. 代码补全

app/views.py（新增一个视图）
```python
from django.shortcuts import render

def index(request):
    """渲染 test.html 模板"""
    return render(request, "test.html")
```

app/urls.py（补一条路由）
```python
from django.urls import path
from .views import index, sse_view

urlpatterns = [
    path("", index, name="index"),   # 新增
    path("sse/", sse_view, name="sse"),
]
```

templates/test.html（新建）
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Django SSE 实时流</title>
  <style>
    body { font-family: monospace; margin: 2rem; }
    #log { list-style: none; padding: 0; }
    #log li { margin: .2rem 0; }
  </style>
</head>
<body>
  <h1>SSE 实时推送（Django 版）</h1>
  <ul id="log"></ul>

  <script>
    const ul = document.getElementById('log');
    const evtSource = new EventSource('/sse/');

    evtSource.onmessage = function (e) {
      const data = JSON.parse(e.data);
      const li = document.createElement('li');
      li.textContent = `[${new Date(data.timestamp * 1000).toLocaleTimeString()}] ${data.msg}`;
      ul.prepend(li);   // 最新在上
    };

    evtSource.onerror = () => {
      const li = document.createElement('li');
      li.textContent = '[系统] 连接断开，正在重连…';
      li.style.color = 'red';
      ul.prepend(li);
    };
  </script>
</body>
</html>
```

django_sse/settings.py（告诉 Django 模板在哪）
```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],   # 新增
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
```

3. 运行
```bash
python manage.py runserver
```

4. 打开浏览器
访问 http://127.0.0.1:8000/  
即可看到页面实时滚动输出 SSE 内容，每 2 秒一条。  
刷新、多开窗口都会各自建立独立长连接，互不干扰。

Enjoy your streaming!





