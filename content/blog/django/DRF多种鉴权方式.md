下面给出“最快可用”的 3 种常见鉴权方式，按复杂度由低到高排好，复制即可跑。  
你只需要选一种即可上线，后面两种可无缝升级。

------------------------------------------------
一、Token 鉴权（最适合前后端分离、APP、小程序）
------------------------------------------------

0. 安装与注册

```bash
pip install djangorestframework
```

`settings.py`

```python
INSTALLED_APPS += ['rest_framework.authtoken']  # 新增
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',  # 关键行
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # 全局必须登录
    ],
}
```

`urls.py`（项目级）

```python
from rest_framework.authtoken import views as auth_views

urlpatterns += [path('api/login/', auth_views.obtain_auth_token)]
```

1. 迁移 & 创建令牌

```bash
python manage.py migrate
python manage.py shell
>>> from django.contrib.auth.models import User
>>> from rest_framework.authtoken.models import Token
>>> u = User.objects.create_user(username='admin', password='123')
>>> Token.objects.create(user=u)
<Token: 3de4f0d0d1c509ce09993d4a811141eb39338847>
```

2. 使用  
   客户端在请求头里带：

```
Authorization: Token 3de4f0d0d1c509ce09993d4a811141eb39338847
```

即可访问所有接口；没带或带错返回 401。

3. 局部放开口子（可选）

```python
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes


@permission_classes([AllowAny])
class PublicViewSet(viewsets.ModelViewSet):
    ...
```

------------------------------------------------
二、JWT 鉴权（无状态、分布式友好）
------------------------------------------------

```bash
pip install djangorestframework-simplejwt
```

`settings.py`

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```

`urls.py`

```python
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns += [
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

登录后拿到：

```json
{
  "refresh": "...",
  "access": "..."
}
```

访问时带：

```
Authorization: Bearer <access>
```

access 过期后拿 refresh 换新的，无需查库。

------------------------------------------------
三、Django 自带 Session 鉴权（适合浏览器端、B/S 一体）
------------------------------------------------
`settings.py`

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
}
```

只要先登录 Django 管理后台（或自己写 login 页面），后续同域下的 AJAX 会自动带 `sessionid` cookie，DRF 就认得。

------------------------------------------------
一句话总结
------------------------------------------------
想最快：

1. 装 `rest_framework.authtoken`
2. 配 `TokenAuthentication`
3. 访问 `/api/login/` 拿 token
4. 请求头 `Authorization: Token <key>`

后面两种随时可换，代码不动只改配置即可。