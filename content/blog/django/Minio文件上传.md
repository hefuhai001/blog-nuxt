在 Django 中集成 MinIO 有两种主流方案，分别对应两个第三方库：

1. django-storages（推荐，社区活跃，S3 兼容）
2. django-minio-storage（专用封装，配置简单）

下面给出两种方式的完整步骤，你按自己喜好挑一种即可。

方案 A：使用 django-storages（S3Boto3 后端）

1. 安装依赖

   ```bash
   pip install django-storages boto3
   ```

2. settings.py 配置

   ```python
   INSTALLED_APPS += ['storages']

   # 让 Django 把文件/静态文件都交给 S3Boto3Storage
   DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
   STATICFILES_STORAGE  = 'storages.backends.s3boto3.S3Boto3Storage'

   # MinIO 连接信息（与 AWS S3 字段兼容）
   AWS_S3_ENDPOINT_URL        = 'http://<minio_test-ip>:9000'   # 带端口
   AWS_ACCESS_KEY_ID          = 'minioadmin'               # MinIO AK
   AWS_SECRET_ACCESS_KEY      = 'minioadmin'               # MinIO SK
   AWS_STORAGE_BUCKET_NAME    = 'bucket'            # 需提前建好
   AWS_S3_ADDRESSING_STYLE    = 'path'                    # MinIO 要求 path-style
   AWS_S3_REGION_NAME         = 'us-east-1'                # 任意字符串即可
   AWS_S3_USE_SSL             = False                      # 本地/内网关掉 HTTPS
   AWS_QUERYSTRING_AUTH       = False                      # 公开访问可设为 False
   ```

3. 创建存储桶  
   登录 MinIO Console（`http://minio-ip:9001`）→ Create Bucket → 名称与 AWS_STORAGE_BUCKET_NAME 一致。

4. 收集静态文件

   ```bash
   python manage.py collectstatic
   ```

   成功后可在 MinIO 看到 `static/…` 目录。

5. 上传/删除文件代码示例

   ```python
   from django.core.files.storage import default_storage

   # 上传
   with default_storage.open('media/demo.txt', 'wb') as f:
       f.write(b'hello MinIO')

   # 删除
   if default_storage.exists('media/demo.txt'):
       default_storage.delete('media/demo.txt')
   ```

   文件会自动出现在 MinIO 的 `media/` 路径下 。

---

## 方案 B：使用 django-minio-storage（专用库）

1. 安装

   ```bash
   pip install django-minio_test-storage
   ```

2. settings.py 配置

   ```python
   INSTALLED_APPS += ['django_minio_storage']

   MINIO_STORAGE_ENDPOINT        = 'xx.xx.xx.xx:9000'
   MINIO_STORAGE_ACCESS_KEY      = 'minio_test'
   MINIO_STORAGE_SECRET_KEY      = 'minio123'
   MINIO_STORAGE_USE_HTTPS       = False
   MINIO_STORAGE_MEDIA_BUCKET_NAME = 'python-media'
   MINIO_STORAGE_STATIC_BUCKET_NAME= 'python-static'
   MINIO_STORAGE_AUTO_CREATE_MEDIA_BUCKET = True   # 桶不存在时自动建
   MINIO_STORAGE_AUTO_CREATE_STATIC_BUCKET = True

   DEFAULT_FILE_STORAGE = 'minio_storage.storage.MinioMediaStorage'
   STATICFILES_STORAGE  = 'minio_storage.storage.MinioStaticStorage'
   ```

3. 运行 collectstatic / 上传文件即可，逻辑与方案 A 相同 。

---

## 常见问题小贴士

- **端口占用**：MinIO API 默认 9000，Console 默认 9001，注意防火墙放行。
- **桶已存在报错**：关闭 `AUTO_CREATE_*_BUCKET` 或提前手动建桶。
- **URL 无法访问**：确认 `AWS_QUERYSTRING_AUTH=False` 且桶策略允许 public read，或使用 `get_presigned_url` 生成临时链接 。
- **HTTPS 自签名证书**：若开启 `USE_HTTPS=True`，需在客户端信任证书或关闭 SSL 校验。
