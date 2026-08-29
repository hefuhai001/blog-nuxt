我将为你整理一篇完整的 GitHub 授权登录实现博客文章。

---

# Django + Vue GitHub 授权登录完整实现指南

## 前言

GitHub 授权登录是开发者常用的第三方登录方式，特别适合技术类网站。相比微信登录，GitHub OAuth 完全免费，且个人开发者即可申请使用。本文将详细介绍如何基于
Django REST Framework 和 Vue 3 实现完整的前后端分离 GitHub 授权登录方案。

## 一、准备工作

### 1.1 创建 GitHub OAuth App

1. 登录 GitHub，点击右上角头像 → **Settings**
2. 左侧最下方 → **Developer settings** → **OAuth Apps** → **New OAuth App**
3. 填写应用信息：
    - **Application name**: 你的应用名称
    - **Homepage URL**: `http://localhost:8080`（前端地址）
    - **Authorization callback URL**: `http://localhost:8000/api/github/callback/`（必须与后端配置一致）
4. 点击 **Register application**
5. 记录 **Client ID** 和 **Client Secret**

### 1.2 安装依赖

```bash
pip install django djangorestframework django-cors-headers requests PyJWT
```

## 二、后端实现（Django）

### 2.1 项目配置

```python
# django_login_github/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

# 自定义用户模型
AUTH_USER_MODEL = 'api.User'

# CORS 配置
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

# GitHub OAuth 配置
GITHUB_CLIENT_ID = 'your-github-client-id'
GITHUB_CLIENT_SECRET = 'your-github-client-secret'
GITHUB_REDIRECT_URI = 'http://localhost:8000/api/github/callback/'

# JWT 配置
JWT_SECRET_KEY = SECRET_KEY
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
JWT_REFRESH_TOKEN_EXPIRE_DAYS = 7

# 缓存配置
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
```

### 2.2 自定义用户模型

```python
# api/models.py
import uuid
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models


class User(AbstractUser):
    """支持 GitHub 登录的自定义用户模型"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # GitHub 相关信息
    github_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    github_username = models.CharField(max_length=100, blank=True)
    github_avatar = models.URLField(blank=True)
    github_email = models.EmailField(blank=True)
    github_access_token = models.CharField(max_length=255, blank=True)

    # 普通用户信息
    nickname = models.CharField(max_length=100, blank=True)
    avatar_url = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    # 登录方式标记
    is_github_bound = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 解决权限冲突
    groups = models.ManyToManyField(
        Group,
        related_name='github_user_groups',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='github_user_permissions',
        blank=True,
    )

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username or self.github_username or str(self.id)
```

### 2.3 JWT 认证工具

```python
# api/authentication.py
import jwt
import uuid
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

User = get_user_model()


def generate_tokens(user):
    """生成 JWT access token 和 refresh token"""
    now = datetime.utcnow()

    # Access token - 24小时有效
    access_payload = {
        'token_type': 'access',
        'user_id': str(user.id),
        'username': user.username,
        'github_id': user.github_id,
        'exp': now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
        'iat': now,
        'jti': str(uuid.uuid4())
    }

    # Refresh token - 7天有效
    refresh_payload = {
        'token_type': 'refresh',
        'user_id': str(user.id),
        'exp': now + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        'iat': now,
        'jti': str(uuid.uuid4())
    }

    access_token = jwt.encode(access_payload, settings.JWT_SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.JWT_SECRET_KEY, algorithm='HS256')

    return {
        'access': access_token,
        'refresh': refresh_token
    }


def decode_token(token):
    """解码并验证 token"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


class JWTAuthentication(authentication.BaseAuthentication):
    """DRF JWT 认证类"""

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        try:
            prefix, token = auth_header.split(' ')
            if prefix.lower() != 'bearer':
                return None
        except ValueError:
            return None

        payload = decode_token(token)
        if not payload:
            raise exceptions.AuthenticationFailed('Invalid or expired token')

        user_id = payload.get('user_id')
        if not user_id:
            raise exceptions.AuthenticationFailed('Invalid token payload')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found')

        if not user.is_active:
            raise exceptions.AuthenticationFailed('User is inactive')

        return (user, payload)
```

### 2.4 序列化器

```python
# api/serializers.py
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """用户序列化器"""

    class Meta:
        model = User
        fields = [
            'id', 'username', 'nickname', 'email', 'phone',
            'github_id', 'github_username', 'github_avatar',
            'avatar_url', 'is_github_bound',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'github_id', 'is_github_bound', 'created_at', 'updated_at']
```

### 2.5 核心视图实现

```python
# api/views.py
import requests
import uuid
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status

from .models import User
from .serializers import UserSerializer
from .authentication import generate_tokens, decode_token

User = get_user_model()


class GitHubLoginURLView(APIView):
    """获取 GitHub 授权 URL"""
    permission_classes = [AllowAny]

    def get(self, request):
        # 生成 state 防止 CSRF
        state = str(uuid.uuid4())

        github_auth_url = (
            f"https://github.com/login/oauth/authorize?"
            f"client_id={settings.GITHUB_CLIENT_ID}"
            f"&redirect_uri={settings.GITHUB_REDIRECT_URI}"
            f"&scope=user:email"
            f"&state={state}"
        )

        return Response({
            'auth_url': github_auth_url,
            'state': state
        })


class GitHubCallbackView(APIView):
    """GitHub 回调处理"""
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        state = request.query_params.get('state')

        if not code:
            return Response({'error': 'Authorization code not provided'}, status=400)

        try:
            # 1. 用 code 换取 access_token
            token_response = requests.post(
                'https://github.com/login/oauth/access_token',
                headers={'Accept': 'application/json'},
                data={
                    'client_id': settings.GITHUB_CLIENT_ID,
                    'client_secret': settings.GITHUB_CLIENT_SECRET,
                    'code': code,
                    'redirect_uri': settings.GITHUB_REDIRECT_URI,
                },
                timeout=10
            )
            token_data = token_response.json()

            if 'error' in token_data:
                return Response({
                    'error': 'GitHub token exchange failed',
                    'details': token_data.get('error_description', token_data['error'])
                }, status=400)

            github_access_token = token_data.get('access_token')
            if not github_access_token:
                return Response({'error': 'Failed to get access token'}, status=400)

            # 2. 获取 GitHub 用户信息
            user_response = requests.get(
                'https://api.github.com/user',
                headers={
                    'Authorization': f'token {github_access_token}',
                    'Accept': 'application/vnd.github.v3+json'
                },
                timeout=10
            )

            if user_response.status_code != 200:
                return Response({'error': 'Failed to get user info from GitHub'}, status=400)

            github_user = user_response.json()
            github_id = str(github_user.get('id'))
            github_username = github_user.get('login')
            github_avatar = github_user.get('avatar_url', '')

            # 3. 获取用户邮箱
            email = github_user.get('email', '')
            if not email:
                emails_response = requests.get(
                    'https://api.github.com/user/emails',
                    headers={
                        'Authorization': f'token {github_access_token}',
                        'Accept': 'application/vnd.github.v3+json'
                    },
                    timeout=10
                )
                if emails_response.status_code == 200:
                    emails = emails_response.json()
                    primary_email = next(
                        (e['email'] for e in emails if e.get('primary') and e.get('verified')),
                        None
                    )
                    email = primary_email or (emails[0]['email'] if emails else '')

            # 4. 查找或创建本地用户
            try:
                user = User.objects.get(github_id=github_id)
                is_new = False
            except User.DoesNotExist:
                # 创建新用户，确保用户名唯一
                username = f"github_{github_username}_{github_id[:6]}"
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}_{counter}"
                    counter += 1

                user = User.objects.create(
                    username=username,
                    github_id=github_id,
                    github_username=github_username,
                    github_avatar=github_avatar,
                    github_email=email,
                    github_access_token=github_access_token,
                    nickname=github_username,
                    avatar_url=github_avatar,
                    email=email,
                    is_github_bound=True
                )
                is_new = True

            # 5. 更新现有用户信息
            if not is_new:
                user.github_username = github_username
                user.github_avatar = github_avatar
                user.github_email = email
                user.github_access_token = github_access_token
                user.avatar_url = github_avatar or user.avatar_url
                user.nickname = user.nickname or github_username
                user.is_github_bound = True
                user.save()

            # 6. 生成 JWT token
            tokens = generate_tokens(user)

            return Response({
                'success': True,
                'is_new_user': is_new,
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'user': UserSerializer(user).data
            })

        except requests.RequestException as e:
            return Response({
                'error': 'Network error when connecting to GitHub',
                'details': str(e)
            }, status=503)
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=500)


class UserInfoView(APIView):
    """获取当前用户信息"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class RefreshTokenView(APIView):
    """刷新 access token"""
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=400)

        payload = decode_token(refresh_token)
        if not payload or payload.get('token_type') != 'refresh':
            return Response({'error': 'Invalid refresh token'}, status=401)

        user_id = payload.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        tokens = generate_tokens(user)

        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh']
        })


class LogoutView(APIView):
    """退出登录"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 可选：将 token 加入黑名单
        return Response({'message': 'Logged out successfully'})


class UnbindGitHubView(APIView):
    """解绑 GitHub"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.is_github_bound:
            return Response({'error': 'GitHub not bound'}, status=400)

        user.github_id = None
        user.github_username = ''
        user.github_access_token = ''
        user.is_github_bound = False
        user.save()

        return Response({'message': 'GitHub account unbound'})
```

### 2.6 URL 配置

```python
# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # GitHub 登录
    path('github/login/', views.GitHubLoginURLView.as_view(), name='github_login'),
    path('github/callback/', views.GitHubCallbackView.as_view(), name='github_callback'),

    # 用户相关
    path('user/info/', views.UserInfoView.as_view(), name='user_info'),
    path('user/unbind-github/', views.UnbindGitHubView.as_view(), name='unbind_github'),

    # Token 相关
    path('auth/refresh/', views.RefreshTokenView.as_view(), name='token_refresh'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
]
```

## 三、前端实现（Vue 3）

### 3.1 Axios 封装

```javascript
// utils/request.js
import axios from 'axios'

const request = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refresh_token')
                const response = await axios.post('/api/auth/refresh/', {
                    refresh: refreshToken
                })

                const {access} = response.data
                localStorage.setItem('access_token', access)
                request.defaults.headers.common['Authorization'] = `Bearer ${access}`

                originalRequest.headers.Authorization = `Bearer ${access}`
                return request(originalRequest)
            } catch (refreshError) {
                localStorage.clear()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default request
```

### 3.2 登录组件

```vue
<!-- GitHubLogin.vue -->
<template>
  <div class="github-login">
    <h2>GitHub 登录</h2>

    <div v-if="!isLoggedIn">
      <button @click="loginWithGitHub" class="github-btn">
        <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
          <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        使用 GitHub 登录
      </button>
    </div>

    <div v-else class="user-info">
      <img :src="user.avatar_url || user.github_avatar" class="avatar"/>
      <h3>欢迎，{{ user.nickname || user.github_username }}</h3>
      <p>GitHub: {{ user.github_username }}</p>
      <button @click="logout" class="logout-btn">退出登录</button>
    </div>
  </div>
</template>

<script setup>
  import {ref, onMounted} from 'vue'
  import {useRoute, useRouter} from 'vue-router'
  import request from "./utils/request.js";

  const isLoggedIn = ref(false)
  const user = ref(null)

  const route = useRoute()
  const router = useRouter()

  onMounted(() => {
    const code = route.query.code
    if (code) {
      handleGitHubCallback(code)
    } else {
      checkLoginStatus()
    }
  })

  async function loginWithGitHub() {
    try {
      const {data} = await request.get(`/github/login/`)
      localStorage.setItem('github_oauth_state', data.state)
      window.location.href = data.auth_url
    } catch (error) {
      console.error('获取授权 URL 失败:', error)
      alert('登录失败，请重试')
    }
  }

  async function handleGitHubCallback(code) {
    try {
      const {data} = await request.get(`/github/callback/`, {
        params: {
          code: code,
          state: route.query.state || ''
        }
      })

      if (data.error) {
        throw new Error(data.error)
      }

      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      request.defaults.headers.common['Authorization'] = `Bearer ${data.access}`

      user.value = data.user
      isLoggedIn.value = true

      router.replace('/')
      alert(data.is_new_user ? '注册成功！' : '登录成功！')

    } catch (error) {
      console.error('GitHub 回调处理失败:', error)
      alert('登录失败: ' + (error.response?.data?.error || error.message))
    }
  }

  async function checkLoginStatus() {
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      request.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const {data} = await request.get(`/user/info/`)
      user.value = data
      isLoggedIn.value = true
    } catch (error) {
      console.error('检查登录状态失败:', error)
      if (error.response?.status === 401) {
        await refreshToken()
      } else {
        logout()
      }
    }
  }

  async function refreshToken() {
    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) {
      logout()
      return
    }

    try {
      const {data} = await request.post(`/auth/refresh/`, {
        refresh: refresh
      })

      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      request.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
      await checkLoginStatus()
    } catch (error) {
      logout()
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('github_oauth_state')
    delete request.defaults.headers.common['Authorization']
    isLoggedIn.value = false
    user.value = null
  }
</script>

<style scoped>
  .github-login {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
  }

  .github-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background: #24292e;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .github-btn:hover {
    background: #1a1e22;
  }

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: 15px;
  }

  .user-info {
    text-align: center;
  }

  .logout-btn {
    margin-top: 20px;
    padding: 10px 30px;
    background: #ff4d4f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
```

### 3.3 Vite 代理配置

```javascript
// vite.config.js
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
        port: 8080,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            }
        }
    }
})
```

## 四、常见问题

### 4.1 "The redirect_uri is not associated with this application"

**原因**：GitHub OAuth App 设置中的回调地址与代码中的 `redirect_uri` 不匹配。

**解决**：确保两者完全一致，包括协议、域名、端口和路径：

```
GitHub 设置: http://localhost:8000/api/github/callback/
代码配置:    http://localhost:8000/api/github/callback/
```

### 4.2 如何获取用户邮箱

GitHub 默认可能不返回邮箱，需要额外请求 `/user/emails` 接口获取。

### 4.3 用户名冲突处理

由于 GitHub 用户名可能重复，创建本地用户时添加随机后缀确保唯一性。

## 五、与微信登录对比

| 特性   | GitHub 登录 | 微信登录      |
|------|-----------|-----------|
| 申请门槛 | 个人/企业均可   | 必须企业资质    |
| 费用   | 免费        | 300元/年认证费 |
| 适用场景 | 开发者/技术网站  | 大众用户应用    |
| 获取信息 | 用户名、邮箱、头像 | 手机号、头像、昵称 |
| 审核周期 | 即时        | 1-3个工作日   |

## 六、安全建议

1. **使用 HTTPS**：生产环境必须使用 HTTPS
2. **验证 State**：防止 CSRF 攻击
3. **Token 过期**：设置合理的 JWT 过期时间
4. **敏感信息**：Client Secret 不要暴露到前端

## 七、总结

本文介绍了完整的 GitHub 授权登录实现，包括：

- Django 后端 OAuth 流程处理
- JWT 认证集成
- Vue 前端登录状态管理
- 自动 Token 刷新机制

GitHub 登录是个人开发者实现第三方登录的最佳选择，完全免费且易于集成。

---

*本文代码基于 Django 4.2 和 Vue 3，可根据实际需求调整。*