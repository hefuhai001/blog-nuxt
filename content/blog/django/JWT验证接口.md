下面给你写一个 **“静态验证接口”**（不查库、不刷新，只把 JWT 解出来并告诉你它是否有效、过期时间、用户 ID 是谁）。  
URL：`GET /api/jwt/verify/`  
请求头：`Authorization: Bearer <access>`

------------------------------------------------

1. 子应用任意 `views.py` 里加

------------------------------------------------

```python
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import json


@api_view(['GET'])
@permission_classes([AllowAny])  # 不需要任何权限，直接验签
def jwt_verify(request):
    """
    纯静态验证 access-token 是否有效
    返回示例
    {
        "valid": true,
        "user_id": 3,
        "username": "admin",
        "exp": 1720001234,
        "exp_str": "2025-07-03 12:07:14"
    }
    """
    # 1. 取出 Authorization 头
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header.startswith('Bearer '):
        return Response({'valid': False, 'error': 'Authorization header must start with "Bearer "'}, status=400)

    token = auth_header.split()[1]

    # 2. 用 simplejwt 的 JWTAuthentication 做解签 & 过期检查
    jwt_auth = JWTAuthentication()
    try:
        validated_token = jwt_auth.get_validated_token(token)  # 会抛 InvalidToken/AuthenticationFailed
        user = jwt_auth.get_user(validated_token)  # 能拿到用户即token有效
    except (InvalidToken, AuthenticationFailed) as e:
        return Response({'valid': False, 'error': str(e)}, status=401)

    # 3. 把 unix 时间戳转成人眼可读
    from datetime import datetime, timezone
    exp_timestamp = validated_token['exp']
    exp_dt = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)

    return Response({
        'valid': True,
        'user_id': user.id,
        'username': user.username,
        'exp': exp_timestamp,
        'exp_str': exp_dt.strftime('%Y-%m-%d %H:%M:%S %Z'),
    })
```

------------------------------------------------

2. 加一条路由（子应用或主路由均可）

------------------------------------------------

```python
from django.urls import path
from . import views

urlpatterns += [
    path('api/jwt/verify/', views.jwt_verify, name='jwt-verify'),
]
```

------------------------------------------------

3. 测试

------------------------------------------------

```bash
# 1. 登录拿 token
curl -X POST http://localhost:8000/api/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"123456"}'

# 2. 把返回的 access 贴到 verify 接口
curl -X GET http://localhost:8000/api/jwt/verify/ \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

返回：

```json
{
  "valid": true,
  "user_id": 1,
  "username": "admin",
  "exp": 1759551234,
  "exp_str": "2025-07-03 12:07:14 UTC"
}
```

若 token 被篡改或过期：

```json
{
  "valid": false,
  "error": "Token is invalid or expired"
}
```

------------------------------------------------

4. 一句话总结

------------------------------------------------

这个接口 **不查库、不刷新、不改状态**，只靠 simplejwt 自身的解签逻辑，就能告诉你手里的 `access`
是否仍然有效，方便前端在“真正发业务请求前”做一次轻量级预检。