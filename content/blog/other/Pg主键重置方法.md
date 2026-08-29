## 1. 重置自增主键的当前值（最常用）

使用 `setval` 函数将序列重置为下一个值。

### 语法
```sql
-- 将序列的下一个值设置为指定数字
SELECT setval('序列名', 新值);

-- 将序列的下一个值设置为当前最大值 + 1（常用）
SELECT setval('序列名', (SELECT max(id) FROM 表名));
```

### 实际示例
```sql
-- 假设表名为 users，主键 id 序列名为 users_id_seq

-- 方式1：手动指定下一个 id 为 100
SELECT setval('users_id_seq', 100);

-- 方式2：自动设置为当前最大 id + 1（推荐）
SELECT setval('users_id_seq', (SELECT max(id) FROM users));

-- 方式3：如果希望下一次取值为 max+1，使用 false 参数
SELECT setval('users_id_seq', (SELECT max(id) FROM users), false);
```

## 2. 查看当前序列值（排查问题）

```sql
-- 查看序列当前值
SELECT currval('users_id_seq');

-- 查看序列下一个值
SELECT nextval('users_id_seq');

-- 查看所有序列信息
SELECT * FROM information_schema.sequences;
```

## 3. 获取序列名的常用方法

```sql
-- 方法1：从表结构获取
SELECT pg_get_serial_sequence('表名', '主键列名');
-- 示例
SELECT pg_get_serial_sequence('users', 'id');

-- 方法2：直接查看所有序列
SELECT sequence_name 
FROM information_schema.sequences 
WHERE sequence_name LIKE 'users%';
```

## 完整重置示例

```sql
-- 1. 查找序列名
SELECT pg_get_serial_sequence('users', 'id');
-- 假设返回 users_id_seq

-- 2. 重置序列
SELECT setval('users_id_seq', COALESCE((SELECT max(id) FROM users), 0));

-- 3. 验证（插入测试数据，看 id 是否正常）
INSERT INTO users (name) VALUES ('test') RETURNING id;
```

## 注意事项

- 如果表是空的，`max(id)` 会返回 `null`，使用 `COALESCE(..., 0)` 处理
- 重置后，新插入的记录会从 `max(id)+1` 开始
- 这个操作**不会删除或修改已有数据**，只影响后续插入的自动编号
- 生产环境操作前建议先备份或确认影响范围

如果你的需求不是重置序列，而是其他操作（如更新现有主键值），请补充说明具体情况。