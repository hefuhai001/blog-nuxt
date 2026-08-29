# MySQL基本使用

1.安装类型：

```
	developer default（开发者默认）：安装mysql开发所需的所有产品
​	server only（服务器）：只安装mysql服务器产品
​	client only（客户端）：只安装没有服务器的mysql客户端产品
​	full（完全）：安装所有包含的mysql产品和功能
```

```sh
cd D:\Program\mysql-8.0.30-winx64\bin
```

查看用户信息

```sh
mysqld --initialize --comsole
```

下载

```sh
mysqld --install
```

开启服务

```sh
net start mysql
```

关闭服务

```sh
net stop mysql
```

修改密码

```sh
ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
```

登录

```sh
mysql -uroot -p
```

登录

```sh
mysql -h localhost -u root -p
```

查看版本信息

```sh
status
```

--DDL 数据定义语言 定义数据对象

--数据库操作；

```sql
show databases;
create database  casedb;
create database [if not exists] casedb;
use casedb;
select database();
drop database casedb;
alter database casedb character set utf-8;

```

--表操作；

```sql
show tables;
create table stu;
drop table stu;
drop table if exists emp;
truncate table emp;
desc stu;
show create table stu;
```

--关键字
	--add 
	--modify change
	--drop 
	--rename ...

```sql
alter table stu add nickname varchar(20) comment '昵称';
alter table stu change nickname username varchar(10) comment '用户名';
alter table stu drop username;
alter table emop rename to employee;
```



--*******************************************************************************************
--DML 数据操作语言

--关键字
    --insert 增
    --delete 删
    --update 改 

```sql
insert into stu(title,auther,data) values ("t","a","d");
insert into stu values ("t","a","d"...);
insert into stu values ("t","a","d"),("t1","a1","d1");

delete from emp ;
delete from emp where gender = '1';
delete from tableName where tableId=3;
delete from tableName [where clause];

update tableName set title='studrc' where tableId=3;
update emp set name='itheima' where id = 1;
update emp set name='hfh', gender ='2' where id = 1;
update emp set worktime='2008-01-01';
```


--*******************************************************************************************
--DQL 数据查询语言

-- 编写顺序
    --select 字段列表
    --from 表名列表
    --where 条件列表
    --group by 分组字段查询
    --having 分组后条件列表
    --order by 排序字段列表
    --limit 分页参数

```sql
select 字段列表 from 表名;
select * from emp;
select workadddress from emp;
select distinct workadddress from emp;
select id,name,workno,score,gender,age from emp;

```

--聚合函数
    --count 统计数量 
    --max 最大值
    --min 最小值
    --avg 平均数
    --sum 求和

```sql
select count(*) from emp;
select count(idcard) from emp;
select max(age) from emp;
select min(age) from emp;
select avg(age) from emp;
select sum(age) from emp where workaddress = '西安';

```



--条件查询 where
    --> >= < <= = <> !=
    --between and
    --in()
    --like '_ _'
    --is null
    --and && or || not !

```sql
select 字段列表 from 表名 where 条件;
select * from emp where age = 80;
select * from emp where age < 80;
select * from emp where idcard is null;
select * from emp where idcard is not null;
select * from emp where age != 80;
select * from emp where age <> 80;
select * from emp where age <= 80 && age >= 18;
select * from emp where between 15 and 80;
select * from emp where gender='女'  and age = 18;
select * from emp where age = 15 or age = 18 or age = 20;
select * from emp where age in(15,18,20);
select * from emp where name like '_ _';
select * from emp where idcard like '%x';
select * from emp where idcard like '_________________x';
select 字段列表 from 表名 where 条件;

```

--分组查询 group by
    --执行顺序：where>聚合函数> having

```sql
select 字段列表 from 表名 where 条件 group by 分组字段 having 分组后过滤条件;
select gender, count(*) from emp group by gender;
select gender, avg(*) from emp group by gender;
select workaddress, count(*) from emp where age<30 group by workaddress having count(*) >= 3;
select workaddress, count(*) address_count from emp where age<30 group by workaddress having address_count >= 3;

```

--排序查询 order by
    --asc 升序
    --desc 降序

```sql
select 字段列表 from 表名 order by 字段1 排序方式1,字段2 排序方式2;
select * from emp order by age asc;
select * from emp order by age desc;
select * from emp order by enterdate desc;
select * from emp order by age asc, enterdate desc ;

```

--分页查询 limit
    --起始索引=（查询页码-1）* 每页的记录数

```sql
select 字段列表 from 表名 limit 起始索引, 查询记录数;
select * from emp limit 0,10;
select * from emp limit 10;
select * from emp limit 10,10;
```

--案例

```sql
select * from emp where gender = '女' and age in (18,19,20);
select * from emp where gender = '女' and (age between 10 and 20) and name like '_ _ _';
select gender, count(*) from emp where age<20 group by gender;
select name, age from emp where age<=20 group by age asc, entrydate desc;
select * from emp where gender = '男' and age between 20 and 40 order by age asc , entrydate asc limit 5;


```


```sql
--执行顺序验证
    --form
    --where
    --group by
    --select
    --order by && having
    --limit
select name, age from emp where age >15 order by age asc;
select name, age from emp e where e.age >15 order by age asc;
select e.name, age from emp e where e.age >15 order by age asc;
select e.name ename , age from emp e where e.age >15 order by age asc;
select e.name ename , age from emp e where e.age >15 order by eage asc; (X)
select e.name ename , age eage from emp e where e.age >15 order by eage asc;

--*******************************************************************************************
--DCL 数据控制语言：管理用户&&权限控制

--管理用户
    --	查询用户
    --	创建用户
    --	修改用户密码
    --	删除用户
use mysql;
select * from user;

-- 创建用户 itcast , 只能够在当前主机localhost访问, 密码123456;
create user 'itcast'@'localhost' identified by '123456';

-- 创建用户 heima , 可以在任意主机访问该数据库, 密码123456 ;
create user 'heima'@'%' identified by '123456';
create user '用户名' @ '主机名' identified by '密码'；
create user 'itcast' @ 'localhost' identified by '123456'；
create user 'itcast' @ '%' identified by '123456'；


-- 修改用户 heima 的访问密码为 1234 ;
alter user 'heima'@'%' identified with mysql_native_password by '1234';
alter user '用户名' @ '主机名' identified with mysql_native_password by '新密码'；
alter user 'itcast' @ '%' identified with mysql_native_password by '1234'；


-- 删除itcast@localhost用户
drop user 'itcast'@'localhost';
drop user '用户名' @ '主机名'；
drop user 'itcast' @ 'localhost'；


--权限控制
    --all,all peivileges 所有权限
    --select 查询数据
    --insert 插入数据
    --update 修改数据
    --delete 删除数据
    --alter 修改表
    --drop 删除数据库/表/视图
    --create 创建数据库/表

    --查询权限show
    --授予权限grant
    --撤销权限revoke

-- 查询权限
show grants for 'heima'@'%';
-- 授予权限
grant all on itcast.* to 'heima'@'%';
-- 撤销权限

revoke all on itcast.* from 'heima'@'%';
show grants for '用户名'@'主机名';
grant 权限列表 on 数据库名.表名 to '用户名'@‘主机名’;
grant 权限列表 on *.* to 'itcast'@‘localhost’;
revoke 权限列表 on 数据库名.表名 from '用户名'@‘主机名’;



--****************************
--函数
    --字符串函数
    --数值函数
    --日期函数
    --流程函数

--字符串函数
    --CONCAT(s1,s2,s3...) 字符串拼接
    --LOWER(str) 字符串全部转为小写
    --UPPER(str) 字符串全部转为大写
    --LPAD(str,n,pad) 左填充 用字符串PAD对str左边进行填充 达到n个字符串长度
    --RPAD(str,n,pad) 右填充 
    --TRIM(str) 去掉字符串头部和尾部的空格
    --SUBSTRING(str,start,len) 返回从字符串str从start位置起的len个长度的字符串

select concat ('hello' ,'mysql');
select lower ('HELLP' ,'MYSQL');
select upper ('hello' ,'mysql');
select lpad ('01' ,5，'-');
select rpad ('01' ,5,'-');
select trim ('     hello mysql      ');
select substring ('hello mysql' ,1 , 5 );

update emp set workno = lpad (workno ,5 , '0');

--数值函数
    --CELT(x)  向上取整
    --FLOOR(x)  向下取整
    --MOD(x,y)  返回x/y的模
    --RANG()  返回0~1内的随机数
    --ROUND(x,y)  求参数x的四舍五入的值，保留y的小数位

select ceil(1.1);
select floor(1.1);
select mod(3,4);
select rand();
select round(2.34555,2);

--生成随机六位验证码
select round(rand()*1000000 , 0);
select lpad(round(rand()*1000000 , 0) ,6 , '0');

--日期函数
    --curdate()  返回当前日期
    --curtime()  返回当前时间
    --now()  返回当前日期和时间
    --year(date)  获取指定date的年份
    --month(date)  获取指定date的月份
    --day(date)  获取指定date的日期
    --date_add(date, interval expr type)  返回一个日期/时间值加上一个时间间隔expr后的时间值
    --datediff(date1, date2)  返回起始时间date1和结束时间date2之间的天数

select curdate();
select curtime();
select now();

select year(now());
select month(now());
select day(now());

select date_add(now(), interval 70 days);
select date_add(now(), interval 70 month);
select date_add(now(), interval 70 year);

select datediff('2021-12-01', '2021-10-01');

select * from emp;
select name,datediff(curdate(), entryfate ) from emp ;
select name,datediff(curdate(), entryfate )as 'entrydays' from emp order by entrydays desc;

--流程控制
if(value, t, f );  如果value为true，则返回t，否则返回f；
ifnull(value1, value2);  如果value不为空，返回value1，否则返回value2；
case when[val1] then [res1] ...else [default] end;  如果value为true，...否则返回default默认值；
case [expr] when [val1] then [res1] ...else [default] end;  如果expr的值等于val1，返回res1，...否则返回default默认值；

select if (false ,'ok', 'err');
select ifnull('ok', 'default');
select ifnull(' ', 'default');
select ifnull (null, 'default');

--case when then else end
select name,(case workadress when '北京' then '上海' then '一线城市' else '二线城市' end) as '工作地址' from emp;

create table score(
	id int comment 'ID',
	name varchar(20) comment 'NAME'，
	math int comment 'MATH',
	english int comment 'ENGLISH',
	chinese int comment 'CHINESE'
) comment 'SCORE';
insert into score (id, name, math, english, chinses) values (1,'Tom' ,79,88,99), (2,'ROSE' ,79,88,99), (3,'JACK' ,79,88,99);

select id,name,
       (case when math>=85 then 'great' when math>=60 then 'good' else 'bad' end )'math',
       (case when math>=85 then 'great' when math>=60 then 'good' else 'bad' end )'math',
       (case when math>=85 then 'great' when math>=60 then 'good' else 'bad' end )'math' 
from score;


--*************************************



--约束
	--not null        非空约束 限制该字段的数据不能为null
	--unique          唯一约束 保证该字段的所有数据都是唯一的
	--primary key   主键约束 主键是一行数据的唯一的标识符要求非空且唯一
	--default          默认约 束 保存数据时如果未指定该字段则采用默认值
	--check            检查约束 保存字段值满足某一要求
	--foreign key    外键约束 用来让两张表之间建立链接保证数据的一致性和完整性

create table user(
    id int primary key auto_increment comment '主键',
    name varchar(10) not null unique comment '姓名',
    age int check (age>0&&user.age<=120 ) comment '年龄',
    status char(1) default '1' comment '状态',
    gender char(1) comment '性别'
)comment '用户表';
insert into user (name, age, status, gender) vakues ('jack', 18, '1', '男')，('tom', 20, '0', '男');

--外键约束 foreign key
create tables user(
	字段名  数据类型，
	...
	constraint 外键名称 foreign key(外键字段名) references 主表(主表列名)
);
alter table 表名 add constraint 外键名称 foreign key(外键字段名)  references 主表(主表列名)；
alter table emp add constraint fk_emp_dept_id foreign key(dept_id)  references dept(id)；

alter table emp drop foreign key fk_emp_dept_id;

--外键约束    删除更新行为
no action     当在父表中删除/更新对应记录时，首先检查该记录是否有对应外键，如果有则不允许删除/更新。（与 RESTRICT 一致)
restrict      当在父表中删除/更新对应记录时，首先检查该记录是否有对应外键，如果有则不允许删除/更新。(与 NOACTION 一致)
cascade       当在父表中删除/更新对应记录时，首先检查该记录是否有对应外键，如果有，则也删除/更新外键在子表中的记录。
set null      当在父表中删除对应记录时，首先检查该记录是否有对应外键，如果有则设置子表中该外键值为null(这就要求该外键允许取null)。
set default   父表有变更时，子表将外键列设置成一个默认的值(Innodb不支持)
			  
cascade
alter table emp add constraint fk_emp_dept_id foreign key(dept_id)  references dept(id) on update cascade on delete cascade;
set null
alter table emp add constraint fk_emp_dept_id foreign key(dept_id)  references dept(id) on update set null on delete set null;

 
 
 
 

--******************************************
--多表查询
·多表关系
·多表查询概述
·内连接
·外连接
·自连接
·子查询
·多表查询案例


多表关系
概述
项目开发中，在进行数据库表结构设计时，会根据业务需求及业务模块之间的关系，分析并设计表结构，由于业务之间相互关联，所
以各个表结构之间也存在着各种联系，基本上分为三种：
>1.—对多(多对一)
>2.多对多
>3. 一对一

1.一对多（多对一）
	>案例:部门 与员工的关系
	>关系：一个部门对应多个员工，一个员工对应一个部门
	>实现：在多的一方建立外键，指向一的一方的主键
	
2.多对多
	案例：学生 与 课程的关系
	>关系：一个学生可以选修多门课程，一门课程也可以供多个学生选择
	>实现：建立第三张中间表，中间表至少包含两个外键，分别关联两方主键
	
3.一对一
	>案例：用户 与 用户详情的关系
	> 关系：一对一关系，多用于单表拆分，将一张表的基础字段放在一张表中，其他详情字段放在另一张表中，以提升操作效率
	> 实现: 在任意一方加入外键，关联另外一方的主键，并且设置外键为唯一的(UNIQUE)
	
select * from emp,dept;
select * from emp,dept where emp.dept_id = dept.id;



--多表查询的分类
1.连接查询：
        内连接：相当于查询A、B交集部分数据
        外连接：
        	左外连接：查询左表所有数据，以及两张表交集部分数据
        	右外连接：查询右表所有数据，以及两张表交集部分数据
        自连接：当前表与自身的连接查询，自连接必须使用表别名
2.子查询；


--内连接
    隐式内连接
    select 字段列表 from 表1,表2 where 条件...(emp.dept_id = dept.id);
    select * from emp,dept where emp.dept_id = dept.id;
    select emp.name , dept.name from emp,dept where emp.dept_id = dept.id;
    select e.name , d.name from emp e,dept d where e.dept_id = d.id;
    
    显式内连接
    select 字段列表 from 表1 inner join 表2 on 连接条件...;
    select * from emp e inner join  dept d on e.dept_id = d.id;
    select emp.name , dept.name from emp e inner join  dept d on e.dept_id = d.id;
--外连接
	左外连接  相当于查询左表的全部数据，包括表1和表2交集的数据
	select 字段列表 from 表1 left outer join 表2 on 连接条件...;
	select e.* from emp left outer join dept d on e.dept_id=d.id;
	select e.* from emp left join dept d on e.dept_id=d.id;
	右外连接  相当于查询右表的全部数据，包括表1和表2交集的数据
	select 字段列表 from 表1 right outer join 表2 on 连接条件...;
	select d.*,e.* from emp e right outer join dept d on e.dept_id=d.id;
	select d.*,e.* from emp e right join dept d on e.dept_id=d.id;
	=
	select d.*,e.* from dept d left outer join emp e on e.dept_id=d.id;

--自连接
	不要看成一张表看成两张表
	select 字段列表 from 表1 别名1 join 表1 别名2 on 条件...;
	select a.name , b.name from emp a, emp b where a, managerid = b.id;
	select a.name '员工' ， b.name '领导' from emp a lef outer join emp b on a.managerid =b.id;

联合查询： union union all  查询字段需一致(列数）
	select 字段列表 from 表1...
	union all
	select 字段列表 from 表2...;
	
	查询结果合并
	select * from emp where salary < 5000
	union all
	select * from emp age > 50;
	
	查询结果合并去重
	select * from emp where salary < 5000
	union
	select * from emp age > 50;
	

--子查询 嵌套查询
概念：SQL语句中嵌套SELECT语句，称为嵌套查询，又称子查询。
SELECT * FROM t1 WHERE column1=(SELECT column1 FROM t2);

子查询外部的语句可以是INSERT/UPDATE/ DELETE/ SELECT的任何一个。
根据子查询结果不同，分为：
>标量子查询（子查询结果为单个值）
>列子查询（子查询结果为一列
>行子查询（子查询结果为一行)
表子查询（子查询结果为多行多列)
根据子查询位置，分为：WHERE之后、FROM之后、SELECT之后。

>标量子查询（子查询结果为单个值）
子查询结果为单个值，数字，字符串，日期，最简单的形式
常用操作符: = <> > >= < <=
select id from dept where name ='销售部';
select * from emp where dept_id =4;
select * from emp where dept_id =(select id from dept where name ='销售部');

select entrydate from emp where  name = 'Aminn';
select * from  emp entrydate >'2009-02-10';
select * from  emp entrydate >(select entrydate from emp where name = 'Aminn');


>列子查询（子查询结果为一列
常用操作符:IN NOT IN AND SOME ALL

IN		在指定的集合范围之内，多选一
NOT IN	不在指定的集合范围之内
ANY		子查询返回列表中，有任意一个满足即可
SOME	与ANY等同，使用SOME的地方都可以使用ANY
ALL		子查询返回列表的所有值都必须满足

select id from dept where name ='销售部' or name ='市场部';
select * from emp where dept_id in (2,4);
select * from emp where dept_id in (select id from dept where name ='销售部' or name ='市场部');

select id from dept where name ='销售部';
select salary from emp where dept_id = 3;
select salary from emp where dept_id = (select id from dept where name ='销售部');
select * from emp where salary > all(select salary from emp where dept_id = (select id from dept where name ='销售部'));

select id from dept where name ='销售部';
select salary from emp where dept_id = 3;
select salary from emp where dept_id = (select id from dept where name ='销售部');
select * from emp where salary > any(select salary from emp where dept_id = (select id from dept where name ='销售部'));

>行子查询（子查询结果为一行)
















事务:
事务简介
事务操作
事务四大特性
并发事务问题
事务隔离级别



事务简介
事务 是一组操作的集合，它是一个不可分割的工作单位，事务会把所有的操作作为一个整体一起向系统提交或撤销操作
请求，即这些操作要么同时成功，要么同时失败。

默认MySQL的事务是自动提交的，也就是说，当执行一条DML语句，MySQL会立即隐式的提交事务。

select * from account where name ='zs';
update account set money = money - 1000 where name ='zs';
update account set money = money + 1000 where name ='ls';

事务操作
	查看/设置事务提交方式 
	SELECT@@autocommit；
	0：手动提交
	1：自动提交
	SET@@autocommit=0;
	提交事务
	COMMIT;
	回滚事务
	ROLLBACK；
select * from account where name ='zs';
update account set money = money - 1000 where name ='zs';
update account set money = money + 1000 where name ='ls';
commit;

开启事务
	START TRANSACTION 或BEGIN}
	提交事务
	COMMIT;
	回滚事务
	ROLLBACK；

start transaction;
select * from account where name ='zs';
update account set money = money - 1000 where name ='zs';
update account set money = money + 1000 where name ='ls';
commit;
rollback;

事务四大特性 ACID
原子性（Atomicity)：	事务是不可分割的最小操作单元，要么全部成功，要么全部失败。
一致性（&onsistency）：	事务完成时，必须使所有的数据都保持一致状态。
隔离性（Isolation）：	数据库系统提供的隔离机制，保证事务在不受外部并发操作影响的独立环境下运行。
持久性（Durability)：	事务一旦提交或回滚，它对数据库中的数据的改变就是永久的。

并发事务问题

事务隔离级别

```
