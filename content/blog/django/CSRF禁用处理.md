出现 `403 CSRF verification failed` 是因为 **Django 默认对所有 POST/PUT/DELETE 等“写”请求做 CSRF 校验**，而你的 curl 没带 CSRF token。  
开发调试阶段最简单的办法：**给这个接口单独关掉 CSRF 保护**，有三种常用写法，任选其一即可。

--------------------------------------------------
方案 1：函数视图（FBV）—— 加装饰器
```python
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

@csrf_exempt
def cache_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        # 这里写你的 cache.set(...)
        return JsonResponse({'status': 'ok'})
```
路由：
```python
path('base/cache/', cache_view),
```

--------------------------------------------------
方案 2：类视图（CBV）—— 在类上豁免
```python
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class CacheView(View):
    def post(self, request):
        ...
        return JsonResponse({'status': 'ok'})
```

--------------------------------------------------
方案 3：DRF 的 APIView（推荐）
DRF 默认已豁免 CSRF，只要你不手动加 `SessionAuthentication`：
```python
from rest_framework.views import APIView
from rest_framework.response import Response

class CacheDRFView(APIView):
    authentication_classes = []   # 空列表即可
    permission_classes = []       # 允许匿名

    def post(self, request):
        ...
        return Response({'status': 'ok'})
```

--------------------------------------------------
验证
```bash
curl -X POST http://localhost:8000/api/cache/ \
     -H "Content-Type: application/json" \
     -d '{"key":"foo","value":{"bar":1},"ttl":60}'
```
不再返回 403，直接拿到 `{"status": "ok"}` 即成功。

--------------------------------------------------
注意
- **生产环境对外开放**时，不要全局关掉 CSRF，最好：  
  – 只给真正需要匿名 POST 的接口加 `@csrf_exempt`；  
  – 或者改用 **token 认证（DRF Token/JWT）**，让前端把 token 放在 `Authorization` 头里。

