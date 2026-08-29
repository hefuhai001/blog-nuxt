下面给你一份「一条龙」实战示例，手把手完成：

1. 自定义用户模型（新增字段）
2. 一次性生成 增/删/改/列表/查询 5 个接口
3. 使用 **ModelViewSet + JWT 登录**
4. 路由自动注册，代码量 < 150 行

------------------------------------------------

1. 安装依赖（已装可跳过）

------------------------------------------------

```bash
pip install djangorestframework-simplejwt
```

------------------------------------------------

2. 创建子应用 & 注册

------------------------------------------------

```bash
python manage.py startapp accounts
```

settings.py

```python
INSTALLED_APPS += [
    'rest_framework',
    'rest_framework_simplejwt',
    'accounts',
]

AUTH_USER_MODEL = 'accounts.User'  # 关键：让 Django 用我们的模型
```

------------------------------------------------

3. 自定义用户模型（新增两个字段）

------------------------------------------------
accounts/models.py

```python
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """扩展用户：手机号 + 角色"""
    phone = models.CharField('手机号', max_length=11, unique=True)
    role = models.CharField('角色', max_length=20,
                            choices=(('admin', '管理员'),
                                     ('user', '普通用户')),
                            default='user')

    def __str__(self):
        return f"{self.username}({self.phone})"
```

------------------------------------------------

4. 序列化器（含创建/更新密码加密）

------------------------------------------------
accounts/serializers.py

```python
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'phone', 'role', 'is_active', 'date_joined', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},  # 仅创建/更新时提交
        }

    def create(self, validated_data):
        # 创建用户时必须单独 set_password
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        return instance
```

------------------------------------------------

5. 视图集（5 个接口一次生成）

------------------------------------------------
accounts/views.py

```python
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # 登录后才有权访问
    # 如需细分权限：IsAdminUser / 自定义权限类
```

------------------------------------------------

6. 路由（DefaultRouter 一键注册）

------------------------------------------------
accounts/urls.py

```python
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)  # 生成 /users/  /users/{id}/

urlpatterns = router.urls
```

主路由 urls.py

```python
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
  path('api/login/', TokenObtainPairView.as_view(), name='token_obtain'),
  path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
  path('api/account/', include('modules.accounts.urls')),
]
```

------------------------------------------------

7. 数据库迁移（首次必须）

------------------------------------------------

```bash
python manage.py makemigrations
python manage.py migrate
# 创建一个超级用户
python manage.py createsuperuser
```

------------------------------------------------

8. 测试清单（curl 一行版）

------------------------------------------------

```bash
# 1. 登录拿 token
curl -X POST http://localhost:8000/api/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"123456"}'

# 2. 列表
curl -H "Authorization: Bearer <access>" \
     http://localhost:8000/api/account/users/

# 3. 新增用户
curl -X POST http://localhost:8000/api/account/users/ \
     -H "Authorization: Bearer <access>" \
     -H "Content-Type: application/json" \
     -d '{"username":"user2","phone":"13800138000","role":"user","password":"123456"}'

# 4. 修改（部分更新）
curl -X PATCH http://localhost:8000/api/account/users/2/ \
     -H "Authorization: Bearer <access>" \
     -H "Content-Type: application/json" \
     -d '{"phone":"13900139000"}'

# 5. 删除
curl -X DELETE http://localhost:8000/api/account/users/2/ \
     -H "Authorization: Bearer <access>"

# 6. 单条查询
curl -H "Authorization: Bearer <access>" \
     http://localhost:8000/api/account/users/1/
```

------------------------------------------------

9. 可继续扩展

------------------------------------------------

- 分页：`REST_FRAMEWORK = {'DEFAULT_PAGINATION_CLASS':'rest_framework.pagination.PageNumberPagination','PAGE_SIZE':10}`
- 过滤：安装 `django-filter` 后加 `filterset_fields = ['role', 'is_active']`
- 手机号正则校验：在 `UserSerializer` 里写 `phone = serializers.RegexField(r'^1[3-9]\d{9}$')`
- 角色权限：自定义 `permissions.RolePermission` 继承 `BasePermission`，在 `UserViewSet` 里配
  `permission_classes = [IsAuthenticated & RolePermission]`

------------------------------------------------

10. 小结

------------------------------------------------
至此：

✅ 自定义 User 模型（新增 phone / role）  
✅ 5 个 REST 接口自动生成（增删改查+列表）  
✅ 使用 JWT 登录鉴权  
✅ 路由零手工绑定，代码极简易维护

直接 `migrate` → `runserver` → 用上面的 curl 测试即可。祝编码愉快！

