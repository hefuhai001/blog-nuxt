 我将为你创建一个基于 Django + Redis + 微信开放平台扫码登录的最小化实例。这是一个完整的 RESTful API 风格实现。

## 项目结构

```
django_login_wxredis/
├── django_login_wxredis/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── api_redis/
│   ├── __init__.py
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   └── utils.py
├── manage.py
└── requirements.txt
```

## 1. 配置文件

### requirements.txt
```txt
Django>=4.2,<5.0
djangorestframework>=3.14
redis>=4.5
requests>=2.28
python-dotenv>=1.0
```

### django_login_wxredis/settings.py
```python
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'your-secret-key-change-in-production'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'api_redis',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'django_login_wxredis.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'django_login_wxredis.wsgi.application'

# SQLite for user data
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'zh-hans'
TIME_ZONE = 'Asia/Shanghai'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Redis Configuration
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = int(os.getenv('REDIS_DB', 0))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)

# WeChat Open Platform Config
WECHAT_APPID = os.getenv('WECHAT_APPID', 'your-appid')
WECHAT_SECRET = os.getenv('WECHAT_SECRET', 'your-secret')

# JWT / Token settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'api_redis.authentication.BearerTokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}
```

### django_login_wxredis/urls.py
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api_redis.urls')),
]
```

## 2. 数据模型与序列化器

### api_redis/models.py
```python
from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class User(AbstractUser):
    """自定义用户模型，支持微信登录"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    openid = models.CharField(max_length=128, unique=True, null=True, blank=True, verbose_name='微信OpenID')
    unionid = models.CharField(max_length=128, unique=True, null=True, blank=True, verbose_name='微信UnionID')
    nickname = models.CharField(max_length=64, blank=True, verbose_name='昵称')
    avatar_url = models.URLField(blank=True, verbose_name='头像URL')
    phone = models.CharField(max_length=20, blank=True, verbose_name='手机号')
    is_wechat_bound = models.BooleanField(default=False, verbose_name='是否绑定微信')
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = '用户'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.nickname or self.username or str(self.id)
```

### api_redis/serializers.py
```python
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'nickname', 'avatar_url', 'phone', 'is_wechat_bound', 'created_at']
        read_only_fields = ['id', 'created_at']


class QRCodeStatusSerializer(serializers.Serializer):
    scene_id = serializers.CharField()
    status = serializers.ChoiceField(choices=['pending', 'scanned', 'confirmed', 'expired', 'cancelled'])
    user_info = UserSerializer(required=False)
    token = serializers.CharField(required=False)
    message = serializers.CharField(required=False)
```

## 3. Redis 工具类

### api_redis/utils.py
```python
import json
import redis
import uuid
from datetime import datetime
from django.conf import settings


class RedisQRCodeManager:
    """Redis 二维码状态管理器"""
    
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
        self.key_prefix = "wx:qrcode:"
        self.expire_time = 300  # 5分钟过期
    
    def _get_key(self, scene_id: str) -> str:
        return f"{self.key_prefix}{scene_id}"
    
    def create_qrcode(self) -> dict:
        """创建新的二维码场景"""
        scene_id = str(uuid.uuid4())[:8]  # 短ID便于扫码
        data = {
            'scene_id': scene_id,
            'status': 'pending',  # pending, scanned, confirmed, expired, cancelled
            'created_at': datetime.now().isoformat(),
            'openid': None,
            'user_info': None,
            'token': None
        }
        
        key = self._get_key(scene_id)
        self.redis_client.setex(key, self.expire_time, json.dumps(data))
        
        return {
            'scene_id': scene_id,
            'expire_seconds': self.expire_time,
            'qrcode_url': f"weixin://dl/business/?t={scene_id}"  # 模拟微信扫码URL
        }
    
    def get_status(self, scene_id: str) -> dict:
        """获取二维码状态"""
        key = self._get_key(scene_id)
        data = self.redis_client.get(key)
        
        if not data:
            return {'status': 'expired', 'message': '二维码已过期'}
        
        return json.loads(data)
    
    def update_status(self, scene_id: str, status: str, **kwargs) -> bool:
        """更新二维码状态"""
        key = self._get_key(scene_id)
        data = self.redis_client.get(key)
        
        if not data:
            return False
        
        data = json.loads(data)
        data['status'] = status
        data.update(kwargs)
        
        # 确认或取消后，延长短暂时间供前端获取结果，然后销毁
        if status in ['confirmed', 'cancelled']:
            self.redis_client.setex(key, 10, json.dumps(data))  # 10秒后销毁
        else:
            self.redis_client.setex(key, self.expire_time, json.dumps(data))
        
        return True
    
    def mark_scanned(self, scene_id: str, openid: str) -> bool:
        """标记为已扫描"""
        return self.update_status(scene_id, 'scanned', openid=openid)
    
    def confirm_login(self, scene_id: str, user_info: dict, token: str) -> bool:
        """确认登录，返回用户信息"""
        return self.update_status(
            scene_id, 
            'confirmed', 
            user_info=user_info,
            token=token
        )
    
    def cancel_login(self, scene_id: str) -> bool:
        """取消登录"""
        return self.update_status(scene_id, 'cancelled')
    
    def delete_qrcode(self, scene_id: str):
        """立即删除二维码"""
        key = self._get_key(scene_id)
        self.redis_client.delete(key)


# 全局实例
redis_qr = RedisQRCodeManager()
```

## 4. 自定义认证

### api_redis/authentication.py
```python
from rest_framework import authentication, exceptions
from rest_framework.authtokens.models import Token
from .models import User


class BearerTokenAuthentication(authentication.BaseAuthentication):
    """Bearer Token 认证"""
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        token_key = auth_header.split(' ')[1]
        
        try:
            token = Token.objects.get(key=token_key)
            return (token.user, token)
        except Token.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token')
```

## 5. 核心视图

### api_redis/views.py
```python
import requests
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtokens.models import Token
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from .utils import redis_qr
from .serializers import UserSerializer, QRCodeStatusSerializer

User = get_user_model()


class QRCodeGenerateView(APIView):
    """生成登录二维码"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """创建新的二维码"""
        qr_data = redis_qr.create_qrcode()
        return Response({
            'code': 200,
            'message': 'success',
            'data': {
                'scene_id': qr_data['scene_id'],
                'qrcode_url': qr_data['qrcode_url'],
                'expire_seconds': qr_data['expire_seconds']
            }
        })


class QRCodeStatusView(APIView):
    """轮询查询二维码状态"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, scene_id):
        """查询状态"""
        status_data = redis_qr.get_status(scene_id)
        
        response_data = {
            'code': 200,
            'data': {
                'scene_id': scene_id,
                'status': status_data.get('status'),
            }
        }
        
        # 如果已确认登录，返回token
        if status_data.get('status') == 'confirmed':
            response_data['data']['token'] = status_data.get('token')
            response_data['data']['user_info'] = status_data.get('user_info')
        
        if status_data.get('message'):
            response_data['message'] = status_data['message']
            
        return Response(response_data)


class WeChatScanCallbackView(APIView):
    """微信扫码回调（模拟微信服务器回调）"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        微信扫码后回调此接口
        实际应由微信服务器调用，这里模拟处理
        """
        scene_id = request.data.get('scene_id')
        openid = request.data.get('openid')
        
        if not scene_id or not openid:
            return Response(
                {'code': 400, 'message': 'Missing parameters'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 更新为已扫描状态
        success = redis_qr.mark_scanned(scene_id, openid)
        
        if not success:
            return Response(
                {'code': 404, 'message': 'QR code expired or not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'code': 200,
            'message': 'Scanned successfully, waiting for confirm'
        })


class WeChatConfirmLoginView(APIView):
    """用户确认登录（手机端操作）"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        用户在手机端点击确认登录
        1. 获取或创建用户
        2. 生成Token
        3. 更新Redis状态
        """
        scene_id = request.data.get('scene_id')
        openid = request.data.get('openid')
        user_info = request.data.get('user_info', {})
        
        if not scene_id or not openid:
            return Response(
                {'code': 400, 'message': 'Missing parameters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 获取或创建用户
        try:
            user, created = User.objects.get_or_create(
                openid=openid,
                defaults={
                    'username': f"wx_{openid[-8:]}",
                    'nickname': user_info.get('nickname', f"微信用户{openid[-6:]}"),
                    'avatar_url': user_info.get('headimgurl', ''),
                    'is_wechat_bound': True
                }
            )
            
            if not created:
                # 更新用户信息
                user.nickname = user_info.get('nickname', user.nickname)
                user.avatar_url = user_info.get('headimgurl', user.avatar_url)
                user.save()
        
        except IntegrityError:
            return Response(
                {'code': 500, 'message': 'User creation failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # 生成或获取Token
        token, _ = Token.objects.get_or_create(user=user)
        
        # 序列化用户信息
        user_serializer = UserSerializer(user)
        
        # 更新Redis状态为已确认
        success = redis_qr.confirm_login(
            scene_id,
            user_info=user_serializer.data,
            token=token.key
        )
        
        if not success:
            return Response(
                {'code': 404, 'message': 'QR code expired'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'code': 200,
            'message': 'Login confirmed',
            'data': {
                'token': token.key,
                'user': user_serializer.data
            }
        })


class WeChatCancelLoginView(APIView):
    """用户取消登录"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        scene_id = request.data.get('scene_id')
        
        if not scene_id:
            return Response(
                {'code': 400, 'message': 'Missing scene_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success = redis_qr.cancel_login(scene_id)
        
        if not success:
            return Response(
                {'code': 404, 'message': 'QR code not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'code': 200,
            'message': 'Login cancelled'
        })


class UserProfileView(APIView):
    """获取当前用户信息"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({
            'code': 200,
            'data': serializer.data
        })


class LogoutView(APIView):
    """退出登录"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # 删除Token
        Token.objects.filter(user=request.user).delete()
        return Response({
            'code': 200,
            'message': 'Logged out successfully'
        })
```

## 6. URL 路由

### api_redis/urls.py
```python
from django.urls import path
from . import views

urlpatterns = [
    # 二维码相关
    path('auth/qrcode/generate/', views.QRCodeGenerateView.as_view(), name='qrcode-generate'),
    path('auth/qrcode/status/<str:scene_id>/', views.QRCodeStatusView.as_view(), name='qrcode-status'),
    
    # 微信回调（模拟）
    path('auth/wechat/callback/', views.WeChatScanCallbackView.as_view(), name='wechat-callback'),
    path('auth/wechat/confirm/', views.WeChatConfirmLoginView.as_view(), name='wechat-confirm'),
    path('auth/wechat/cancel/', views.WeChatCancelLoginView.as_view(), name='wechat-cancel'),
    
    # 用户相关
    path('user/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
]
```

## 7. 管理配置

### api_redis/admin.py
```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['id', 'username', 'nickname', 'openid', 'is_wechat_bound', 'created_at']
    list_filter = ['is_wechat_bound', 'is_staff', 'created_at']
    search_fields = ['username', 'nickname', 'openid', 'phone']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {'fields': ('id', 'username', 'password')}),
        ('微信信息', {'fields': ('openid', 'unionid', 'is_wechat_bound')}),
        ('个人信息', {'fields': ('nickname', 'avatar_url', 'phone')}),
        ('权限', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('重要日期', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )
```

### api_redis/__init__.py
```python
default_app_config = 'api_redis.apps.ApiRedisConfig'
```

### api_redis/apps.py
```python
from django.apps import AppConfig


class ApiRedisConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api_redis'
    verbose_name = '微信登录API'
```

## 8. 启动脚本

### manage.py
```python
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_login_wxredis.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
```

## 9. 初始化命令

创建 `init_project.sh`：

```bash
#!/bin/bash

# 创建项目目录结构
mkdir -p django_login_wxredis/django_login_wxredis
mkdir -p django_login_wxredis/api_redis

# 进入项目目录
cd django_login_wxredis

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 执行迁移
python manage.py makemigrations
python manage.py migrate

# 创建超级用户（可选）
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin123') if not User.objects.filter(username='admin').exists() else print('Admin exists')" | python manage.py shell

echo "项目初始化完成！"
echo "运行: python manage.py runserver"
```

## API 端点说明

| 方法 | 端点                                  | 描述                 | 认证         |
| ---- | ------------------------------------- | -------------------- | ------------ |
| POST | `/api/auth/qrcode/generate/`          | 生成登录二维码       | 否           |
| GET  | `/api/auth/qrcode/status/{scene_id}/` | 轮询二维码状态       | 否           |
| POST | `/api/auth/wechat/callback/`          | 微信扫码回调（模拟） | 否           |
| POST | `/api/auth/wechat/confirm/`           | 确认登录（手机端）   | 否           |
| POST | `/api/auth/wechat/cancel/`            | 取消登录             | 否           |
| GET  | `/api/user/profile/`                  | 获取用户信息         | Bearer Token |
| POST | `/api/auth/logout/`                   | 退出登录             | Bearer Token |

## 登录流程时序

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│  Web端  │                    │  Redis  │                    │ 手机端  │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │  1. POST /qrcode/generate    │                              │
     │─────────────────────────────>│                              │
     │                              │  创建scene_id, status=pending │
     │                              │  (TTL 5分钟)                   │
     │  返回 scene_id + QR码        │                              │
     │<─────────────────────────────│                              │
     │                              │                              │
     │  2. 轮询 GET /status/{id}    │                              │
     │─────────────────────────────>│                              │
     │  返回 pending                │                              │
     │<─────────────────────────────│                              │
     │                              │                              │
     │                              │  3. 扫码 POST /callback        │
     │                              │<─────────────────────────────│
     │                              │  更新 status=scanned          │
     │                              │                              │
     │  4. 轮询返回 scanned         │                              │
     │<─────────────────────────────│                              │
     │                              │                              │
     │                              │  5. 确认 POST /confirm         │
     │                              │<─────────────────────────────│
     │                              │  更新 status=confirmed        │
     │                              │  存储 token + user_info       │
     │                              │  (TTL 10秒后销毁)              │
     │                              │                              │
     │  6. 轮询返回 confirmed + token│                              │
     │<─────────────────────────────│                              │
     │                              │                              │
     │  7. 使用 Bearer Token 访问API │                              │
     │────────────────────────────────────────────────────────────>│
```

## 快速启动

```bash
# 1. 确保 Redis 运行中
redis-server

# 2. 初始化项目
chmod +x init_project.sh
./init_project.sh

# 3. 启动服务
python manage.py runserver 0.0.0.0:8000
```

这个最小化实例实现了：
- ✅ 二维码生成与 Redis 存储（5分钟过期）
- ✅ 扫码状态管理（pending → scanned → confirmed/cancelled）
- ✅ 登录完成后立即销毁二维码（10秒缓冲）
- ✅ RESTful API 风格
- ✅ Bearer Token 认证
- ✅ 前后端分离架构
- ✅ 自定义 User 模型支持微信信息