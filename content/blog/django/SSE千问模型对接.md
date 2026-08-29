下面给出「零第三方依赖」最小可运行示例 **django_qwen**，完全采用 **OpenAI 兼容格式** 调用阿里云百炼 `qwen-plus`（官方 base_url 与 key 规范），并满足：

1. SSE 流式输出（`text/event-stream`）  
2. 聊天记录落库（默认 SQLite）  
3. 用户 & 会话两级隔离  
4. 多轮上下文记忆  
5. 纯 OpenAI 规范（`openai` 官方 SDK）

复制即可跑，仅依赖：  
`pip install django openai`

--------------------------------------------------
1. 建项目
```bash
python -m venv venv
source venv/bin/activate          # Windows 用 venv\Scripts\activate
pip install "django>=3.0" openai
django-admin startproject django_qwen
cd django_qwen
python manage.py startapp chat
```

2. 目录结构
django_qwen/
├── django_qwen/
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── chat/
│   ├── migrations/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── ...
└── templates/
    └── chat.html

3. 模型（用户 + 会话 + 时序）
chat/models.py
```python
from django.db import models
from django.contrib.auth.models import User

class ChatMessage(models.Model):
    user    = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    session = models.CharField(max_length=64, db_index=True)   # 前端生成
    role    = models.CharField(max_length=10)                  # user / assistant / system
    content = models.TextField()
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created"]   # 天然时序

    def __str__(self):
        return f"{self.user.username}-{self.session}-{self.role}"
```

4. OpenAI 兼容客户端（流式）
chat/ai_client.py
```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),                       # 仅读环境变量
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1", # 北京地域
    # base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1", # 新加坡
)

def stream_qwen(messages):
    """
    messages: List[Dict[str,str]]  含 system/user/assistant
    yield:    str                  每次 delta
    """
    response = client.chat.completions.create(
        model="qwen-plus",
        messages=messages,
        stream=True,
    )
    for chunk in response:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
```

5. SSE 视图（带上下文拼接）
chat/views.py
```python
import json, uuid
from django.http import StreamingHttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import ChatMessage
from .ai_client import stream_qwen

@login_required
def index(request):
    return render(request, "chat.html")

@login_required
def chat_sse(request):
    session = request.GET.get("session") or uuid.uuid4().hex
    prompt  = request.GET.get("prompt", "").strip()
    user    = request.user

    # 1. 保存用户问题
    ChatMessage.objects.create(user=user, session=session, role="user", content=prompt)

    # 2. 构造上下文（系统提示 + 最近 20 条）
    history = ChatMessage.objects.filter(user=user, session=session)[:20]
    messages = [{"role": "system", "content": "You are a helpful assistant."}]
    messages.extend([{"role": m.role, "content": m.content} for m in history])

    def event_stream():
        full_resp = ""
        for delta in stream_qwen(messages):
            full_resp += delta
            yield f"data: {json.dumps({'delta': delta})}\n\n"
        # 3. 保存助手回复
        ChatMessage.objects.create(user=user, session=session, role="assistant", content=full_resp)
        yield "data: [DONE]\n\n"

    return StreamingHttpResponse(
        event_stream(),
        content_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
```

6. 路由
chat/urls.py
```python
from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="chat"),
    path("sse/", views.chat_sse, name="chat_sse"),
]
```

django_qwen/urls.py
```python
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.views import LoginView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/login/", LoginView.as_view(), name="login"),
    path("", include("chat.urls")),
]
```

7. 模板 templates/chat.html
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Django + qwen-plus (OpenAI 兼容)</title>
  <style>
    body { font-family: Arial; margin: 2rem; }
    #box { border: 1px solid #ccc; height: 350px; overflow-y: scroll; padding: .5rem; }
    .user { text-align: right; color: blue; }
    .assistant { text-align: left; color: green; }
  </style>
</head>
<body>
  <h2>qwen-plus 多轮对话（SSE）</h2>
  <div id="box"></div>
  <input id="inp" size="70" placeholder="输入消息回车"/>
  <button id="btn">发送</button>

  <script>
    const box  = document.getElementById("box");
    const inp  = document.getElementById("inp");
    const btn  = document.getElementById("btn");
    const session = localStorage.getItem("session") || Date.now().toString(36);
    localStorage.setItem("session", session);

    function append(role, txt) {
      const div = document.createElement("div");
      div.className = role;
      div.textContent = `${role}: ${txt}`;
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    }

    btn.onclick = () => {
      const prompt = inp.value.trim();
      if (!prompt) return;
      append("user", prompt);
      inp.value = "";
      const source = new EventSource(`/sse/?session=${session}&prompt=${encodeURIComponent(prompt)}`);
      let assistantTxt = "";
      const assistantDiv = document.createElement("div");
      assistantDiv.className = "assistant";
      box.appendChild(assistantDiv);
      source.onmessage = function (e) {
        if (e.data === "[DONE]") {
          source.close();
          return;
        }
        const delta = JSON.parse(e.data).delta;
        assistantTxt += delta;
        assistantDiv.textContent = "assistant: " + assistantTxt;
        box.scrollTop = box.scrollHeight;
      };
      source.onerror = () => source.close();
    };
  </script>
</body>
</html>
```

8. settings.py 必改项
django_qwen/settings.py
```python
INSTALLED_APPS = [
    ...
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "chat",               # 新增
]

LOGIN_URL = "/accounts/login/"

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

9. 初始化数据库 & 超级用户
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

10. 运行
```bash
# 先配 key（仅当前会话生效）
export DASHSCOPE_API_KEY="你的百炼API-Key"   # Windows 用 set DASHSCOPE_API_KEY=xxx
python manage.py runserver
```

11. 体验
浏览器打开 http://127.0.0.1:8000/  
→ 登录 → 输入消息 → 实时 SSE 流式返回，多轮对话可保持上下文。  
多开浏览器/无痕窗口可验证「用户隔离 + 会话隔离」。

--------------------------------------------------


下面给你写一个**独立的 `login.html` 页面**及其配套视图、URL，**不依赖 `django.contrib.admin`**，**纯 HTML + 少量 JS** 即可用，**与前面的 SSE 业务完全解耦**。

--------------------------------------------------
1. 新建模板 `templates/login.html`
```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8"/>
  <title>登录 - django_qwen</title>
  <style>
    body { font-family: Arial; margin: 5rem auto; max-width: 320px; }
    input { width: 100%; padding: .5rem; margin: .5rem 0; box-sizing: border-box; }
    button { width: 100%; padding: .6rem; }
    .error { color: crimson; font-size: .9rem; }
  </style>
</head>
<body>
  <h2>用户登录</h2>
  <form id="loginForm">
    <input type="text" name="username" placeholder="用户名" required>
    <input type="password" name="password" placeholder="密码" required>
    <button type="submit">登录</button>
    <p id="err" class="error"></p>
  </form>

  <script>
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const res = await fetch("/api/auth/login/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          username: form.username.value.trim(),
          password: form.password.value.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        // 登录成功，跳转到之前被拦截的页面，或首页
        location.href = new URLSearchParams(location.search).get("next") || "/";
      } else {
        document.getElementById("err").textContent = data.error;
      }
    });
  </script>
</body>
</html>
```

--------------------------------------------------
2. 新增视图函数（渲染上面模板）
在 `chat/auth_views.py` 里再加一个**普通视图**（不需要 csrf_exempt，因为是 GET 渲染）：

```python
from django.shortcuts import render

def login_page(request):
    """渲染 login.html"""
    return render(request, "login.html")
```

--------------------------------------------------
3. 加一条路由
`chat/auth_urls.py` 改为：

```python
from django.urls import path
from . import auth_views

app_name = "auth"

urlpatterns = [
    path("login/",  auth_views.login_page, name="login_page"),  # 新增
    path("login/api/", auth_views.login_view, name="login_api"),  # 原来的 JSON 接口改个路径
    path("logout/", auth_views.logout_view, name="logout"),
]
```

--------------------------------------------------
4. 把 `LOGIN_URL` 指到新地址
`django_qwen/settings.py`：

```python
LOGIN_URL = "/api/auth/login/"   # 与路由保持一致
```

--------------------------------------------------
5. 运行 & 验证
```bash
python manage.py runserver
```

浏览器访问  
httpx://localhost:8000/  
→ 未登录 → 302 到  
httpx://localhost:8000/api/auth/login/?next=/  
→ 出现自制登录页 → 输入账号密码 → 登录成功 → 自动跳回原页面 
