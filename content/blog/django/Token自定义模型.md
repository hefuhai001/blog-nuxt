下面给你一份「Token 鉴权 + 自定义用户模型 + 全套增删改查/列表」的完整优化方案。  
特点：

- 不用 Django 默认 `User`，完全自定义模型
- 使用 `django-rest-framework-authtoken` 的 Token 机制（最轻量）
- 一个 `ModelViewSet` 自动生成 5 个接口
- 额外提供 **注册/登录/登出** 接口，开箱即用
- 代码量 < 200 行，直接复制即可跑通

------------------------------------------------
① 安装依赖
------------------------------------------------

```bash
pip install djangorestframework djangorestframework-authtoken
```

------------------------------------------------
② 创建子应用（放根目录，避免前面说的 app_label 坑）
------------------------------------------------

```bash
python manage.py startapp accounts
```

------------------------------------------------
③ 自定义用户模型（新增手机号、昵称）
------------------------------------------------
accounts/models.py

```python
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, username, phone, password=None, **extra):
        if not username:
            raise ValueError('必须填写用户名')
        user = self.model(username=username, phone=phone, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, phone, password=None, **extra):
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        return self.create_user(username, phone, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField('用户名', max_length=30, unique=True)
    phone = models.CharField('手机号', max_length=11, unique=True)
    nickname = models.CharField('昵称', max_length=50, blank=True)
    is_active = models.BooleanField('有效', default=True)
    is_staff = models.BooleanField('后台管理', default=False)
    date_joined = models.DateTimeField('注册时间', auto_now_add=True)

    USERNAME_FIELD = 'username'  # 登录字段
    REQUIRED_FIELDS = ['phone']  # createsuperuser 时必填

    objects = UserManager()

    def __str__(self):
        return f"{self.username}({self.phone})"
```

------------------------------------------------
④ 序列化器（含密码加密）
------------------------------------------------
accounts/serializers.py

```python
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'phone', 'nickname', 'is_active', 'date_joined', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
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
⑤ 视图集（5 大接口 + 注册/登录/登出）
------------------------------------------------
accounts/views.py

```python
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer


# ----- 增删改查+列表 -----
class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # 必须登录


# ----- 注册 -----
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    ser = UserSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    user = ser.save()
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'user': ser.data, 'token': token.key})


# ----- 登录 -----
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': '用户名或密码错误'}, status=400)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key})


# ----- 登出（删除 Token） -----
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    request.auth.delete()  # 删除当前 token
    return Response({'msg': '已退出'})
```

------------------------------------------------
⑥ 路由
------------------------------------------------
accounts/urls.py

```python
from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import UserViewSet, register, login, logout

router = DefaultRouter()
router.register(r'users', UserViewSet)  # /users/  /users/{id}/

urlpatterns = [
                  path('register/', register, name='register'),
                  path('login/', login, name='login'),
                  path('logout/', logout, name='logout'),
              ] + router.urls
```

主路由 urls.py

```python
from django.urls import path, include

urlpatterns = [
    path('api/account/', include('modules.accounts.urls')),
]
```

------------------------------------------------
⑦ 全局配置
------------------------------------------------
settings.py

```python
INSTALLED_APPS += [
    'rest_framework',
    'rest_framework.authtoken',  # Token 认证
    'accounts',
]

AUTH_USER_MODEL = 'accounts.User'  # 关键：使用自定义用户

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

------------------------------------------------
⑧ 迁移 & 启动
------------------------------------------------

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser   # 用自定义模型创建管理员
python manage.py runserver
```

------------------------------------------------
⑨ 快速测试（curl 一行版）
------------------------------------------------

```bash
# 1. 注册
curl -X POST http://localhost:8000/api/account/register/ \
     -H "Content-Type: application/json" \
     -d '{"username":"u1","phone":"13800138000","password":"123456"}'

# 返回 {"user":{...},"token":"905b7c25d6d2feefd31cd7895c8ab26acde02b87"}

# 2. 登录
curl -X POST http://localhost:8000/api/account/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"u1","password":"123456"}'

# 3. 列表（带 Token）
curl -H "Authorization: Token 905b7c25d6d2feefd31cd7895c8ab26acde02b87" \
     http://localhost:8000/api/account/users/

# 4. 修改
curl -X PATCH http://localhost:8000/api/account/users/2/ \
     -H "Authorization: Token 905b7c25d6d2feefd31cd7895c8ab26acde02b87" \
     -H "Content-Type: application/json" \
     -d '{"nickname":"超人"}'

# 5. 删除
curl -X DELETE http://localhost:8000/api/account/users/2/ \
     -H "Authorization: Token 905b7c25d6d2feefd31cd7895c8ab26acde02b87"

# 6. 登出
curl -X POST http://localhost:8000/api/account/logout/ \
     -H "Authorization: Token 905b7c25d6d2feefd31cd7895c8ab26acde02b87"
```

------------------------------------------------
⑩ 后续可扩展
------------------------------------------------

- 分页/过滤/搜索：加 `django-filter` + `SearchFilter`
- 角色权限：自定义 `RolePermission(IsAuthenticated)`
- 手机号登录：把 `USERNAME_FIELD` 改成 `phone`，再写自定义 `authenticate` backend
- 短信注册：把 `register` 视图接第三方短信验证码即可

至此，**自定义用户模型 + Token 鉴权 + 全套 CRUD/列表/注册/登录/登出** 全部就绪，直接可用！
