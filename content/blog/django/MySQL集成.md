在 Django 中对接 MySQL 数据库，通常推荐使用官方维护的 **mysqlclient** 驱动（性能最好、兼容性最强）。下面给出一份从 0 到 1
的完整操作清单，按顺序执行即可。如果你已经装过某些步骤，可直接跳过。

------------------------------------------------

1. 安装依赖

------------------------------------------------
1.1 系统层（Linux 示例，CentOS/Ubuntu 通用）

```bash
# Ubuntu / Debian
sudo apt-get update
sudo apt-get install python3-dev default-libmysqlclient-dev build-essential pkg-config

# CentOS / RHEL / Rocky
sudo yum install python3-devel mysql-devel gcc pkg-config
```

1.2 Python 层

```bash
# 建议先升级 pip
python -m pip install -U pip
# 安装驱动
pip install mysqlclient
```

> 如果 `mysqlclient` 编译失败，可临时换用纯 Python 的 `pymysql`（见文末「备用方案」）。

------------------------------------------------

2. 创建数据库（字符集一次性设对）

------------------------------------------------
登录 MySQL 执行：

```sql
CREATE
DATABASE IF NOT EXISTS myproject
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
```

> 名字随意，字符集务必 `utf8mb4`，避免后续存 emoji 报错。

------------------------------------------------

3. 修改 Django 配置

------------------------------------------------
打开 `settings.py`，把原来的 `DATABASES` 整段替换：

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'myproject',  # 上面建的数据库
        'USER': 'root',  # 有权限的账号
        'PASSWORD': '你的密码',
        'HOST': '127.0.0.1',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```

> 如果 MySQL 是 8.0+，且用户认证插件为 `caching_sha2_password`，需要额外把用户改成 `mysql_native_password` 或者升级
`mysqlclient>=2.1.0`。

------------------------------------------------

4. 测试连通性

------------------------------------------------

```bash
python manage.py check --database default
```

没报错就说明连上了；再执行：

```bash
python manage.py migrate
```

能看到一堆 `OK` 即表创建成功。

------------------------------------------------

5. 常见问题速查

------------------------------------------------

| 现象                                                   | 解决                                                                                               |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| `ImproperlyConfigured: Error loading MySQLdb module` | 没装 `mysqlclient` 或虚拟环境未激活                                                                        |
| `django.db.utils.OperationalError: (2059, …)`        | MySQL 8 认证插件问题，改用户插件或升级驱动                                                                        |
| 存储 emoji 报错 `Incorrect string value`                 | 数据库/表/列字符集不是 `utf8mb4`                                                                           |
| migrate 报 `Specified key was too long`               | 在 `OPTIONS` 里加 `'init_command': "SET @@global.innodb_default_row_format=dynamic;"` 并确保 `utf8mb4` |

------------------------------------------------

6. 备用方案：用 PyMySQL（纯 Python，零编译）

------------------------------------------------
若公司机器无编译环境，可 30 秒切换：

```bash
pip install pymysql
```

在项目同名目录下的 `__init__.py` 里加两行：

```python
import pymysql

pymysql.install_as_MySQLdb()
```

其余步骤完全一样，但性能比 `mysqlclient` 低 10%~30%，高并发场景慎用。

------------------------------------------------

7. 一键验证脚本（可选）

------------------------------------------------
新建 `test_db.py`：

```python
import os, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', '你的项目.settings')
django.setup()
from django.db import connection

with connection.cursor() as c:
    c.execute("SELECT VERSION()")
    print("MySQL 版本:", c.fetchone())
```

运行：

```bash
python test_db.py
```

能打印出版本即 100% 打通。

------------------------------------------------
到此，Django 与 MySQL 已完全对接，可正常 `migrate / shell / ORM` 操作。祝开发顺利!