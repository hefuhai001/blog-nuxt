下面给出最常用、最省事的写法：  
直接在 `TokenObtainPairView` 同一个路由文件里挂一个基于 DRF **序列化器 + 通用视图** 的注册接口，无需额外装包，也无需改认证后端，注册完自动返回一对新的
JWT（access + refresh），前端拿到就能直接用。

------------------------------------------------

1. 安装依赖（如果之前没装过）

------------------------------------------------

```bash
pip install djangorestframework-simplejwt
```

------------------------------------------------

2. 序列化器：`users/serializers.py`

------------------------------------------------

```python
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken


class RegisterSerializer(serializers.ModelSerializer):
    # 额外字段：注册完直接返回 JWT
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'access', 'refresh')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
        )
        # 手动生成 JWT
        refresh = RefreshToken.for_user(user)
        validated_data['refresh'] = str(refresh)
        validated_data['access'] = str(refresh.access_token)
        return validated_data
```

------------------------------------------------

3. 视图：`users/views.py`

------------------------------------------------

```python
from rest_framework import generics
from .serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
```

------------------------------------------------

4. 路由：`urls.py`

------------------------------------------------

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import RegisterView

urlpatterns += [
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

------------------------------------------------

5. 用法示例

------------------------------------------------
下面给出 **curl** 直接可复制的三条命令，按顺序演示：

1. 注册并当场拿到 JWT
2. 用返回的 access 访问需要权限的接口
3. 用 refresh 换新的 access

------------------------------------------------
5.1. 注册（同时返回 access + refresh）
------------------------------------------------

```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
        "username": "alice",
        "password": "123456",
        "email": "alice@example.com"
      }'
```

例返回：

```json
{
  "id": 4,
  "username": "alice",
  "email": "alice@example.com",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI2NTI2MDAwLCJqdGkiOiI2YjY3YTZkYTFjNGE0NTJkOWY5YjRiNGEwZTMxYzQwYSIsInVzZXJfaWQiOjR9.d_5KFLkYnDopzJMF7M2Jp2g3M5d5Yz1VnF3xxy-7OQY",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTcyNjYxMjQwMCwianRpIjoiNGE1YzYzY2VjMzNkNDE2MzhlMzRiNGJlYWU0OGU0NjAiLCJ1c2VyX2lkIjo0fQ.3qE7rC2k9ZgF8LmH4sN3K6pM1bQ8xW5tU0vO4jI2aH1c"
}
```

------------------------------------------------
5.2. 访问需要权限的接口（带 Bearer）
------------------------------------------------
把上一步拿到的 `access` 填进去：

```bash
curl -X GET http://localhost:8000/api/some-protected-view/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI2NTI2MDAwLCJqdGkiOiI2YjY3YTZkYTFjNGE0NTJkOWY5YjRiNGEwZTMxYzQwYSIsInVzZXJfaWQiOjR9.d_5KFLkYnDopzJMF7M2Jp2g3M5d5Yz1VnF3xxy-7OQY"
```

------------------------------------------------
5.3. 用 refresh 换新的 access
------------------------------------------------

```bash
curl -X POST http://localhost:8000/api/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTcyNjYxMjQwMCwianRpIjoiNGE1YzYzY2VjMzNkNDE2MzhlMzRiNGJlYWU0OGU0NjAiLCJ1c2VyX2lkIjo0fQ.3qE7rC2k9ZgF8LmH4sN3K6pM1bQ8xW5tU0vO4jI2aH1c"}'
```

返回：

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI2NTI2NDAwLCJqdGkiOiI5ZjNiN2E5YjQ4OTQ0ZDEyOWY5YjRiNGEwZTMxYzQwYSIsInVzZXJfaWQiOjR9.w-5KFLkYnDopzJMF7M2Jp2g3M5d5Yz1VnF3xxy-7OQY"
}
```

复制新的 `access` 继续用即可。
------------------------------------------------

6. 可扩展小贴士（可选）

------------------------------------------------

- 想加校验：在 `RegisterSerializer` 里重写 `validate()` 做重复用户名、密码强度检查。
- 想用自己的用户模型：把 `User` 换成 `settings.AUTH_USER_MODEL`，其余代码不变。
- 想发激活邮件：在 `create()` 里调用 `send_mail()` 或使用 `django-allauth`。

至此，注册 + JWT 下发一步到位，祝编码愉快！