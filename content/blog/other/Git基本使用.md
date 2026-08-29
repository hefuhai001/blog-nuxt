# Git 创建仓库

```shell
git init
git init newrepo 初始化后，会在 newrepo 目录下会出现一个名为 .git 的目录，所有 Git 需要的数据和资源都存放在这个目录中。
git add \*.p
git add README
git commit -m '初始化项目版本'
如果当前目录下有几个文件想要纳入版本控制，需要先用 git add 命令告诉 Git 开始对这些文件进行跟踪，然后提交：
```

# git clone

```shell
repo:Git 仓库。
git clone <repo> <directory>
directory:本地目录。
git clone git://github.com/schacon/grit.git
执行该命令后，会在当前目录下创建一个名为 grit 的目录，其中包含一个 .git 的目录，用于保存下载下来的所有版本记录。
git clone git://github.com/schacon/grit.git mygrit
如果要自己定义要新建的项目目录名称，可以在上面的命令末尾指定新的名字
```

# 配置

```shell
git config -e  
针对当前仓库
git config -e --global  
针对系统上所有仓库
git config --global user.name "runoob"
git config --global user.email test@runoob.com
设置提交代码时的用户信息，如果去掉 --global 参数只对当前仓库有效。
```

# 一个简单的操作步骤：

```shell
git init
初始化仓库。
git add .
添加文件到暂存区。
git commit
将暂存区内容添加到仓库中。
```

# 创建仓库命令

git init 初始化仓库
git clone 拷贝一份远程仓库，也就是下载一个项目。

# 提交与修改

```shell
git add 添加文件到暂存区
git status 查看仓库当前的状态，显示有变更的文件。
git diff 比较文件的不同，即暂存区和工作区的差异。
git commit 提交暂存区到本地仓库。
git reset 回退版本。
git rm 将文件从暂存区和工作区中删除。
git mv 移动或重命名工作区文件。
```

# 提交日志

```shell
git log 查看历史提交记录
git blame <file> 以列表形式查看指定文件的历史修改记录
```

# 远程操作

```shell
git remote 查看当前的远程库
git fetch 从远程获取代码库
git pull 下载远程代码并合并
git push 上传远程代码并合并
```

# Git 分支管理

```shell
git branch
没有参数时，git branch 会列出你在本地的分支。
git branch (branchname) 创建分支
git branch -d (branchname) 删除分支
git checkout (branchname) 切换分支
git merge 合并分支
```

# Git 查看提交历史

```shell
git log 查看历史提交记录。
git log --oneline 查看历史记录的简洁的版本
git log --reverse --oneline 逆向显示所有日志
git log --author=Linus --oneline -5 Git 源码中 Linus 提交的部分。
git log --oneline --before={3.weeks.ago} --after={2010-04-18} --no-merges 指定日期、隐藏合并提交
git blame <file> 查看指定文件的历史修改记录。
```

# Git 标签

```shell
git tag -a v1.0 创建带注解的标签
git tag 查看所有标签
git tag -a <tagname> -m "com 标签" 指定标签信息
```


# Git 远程仓库

```shell
git remote add [shortname] [url] 添加一个新的远程仓库
ssh-keygen -t rsa -C "youremail@example.com" 生成 SSH Key
ssh -T git@github.com 验证是否成功
```

# 推送到 GitHub 仓库

```shell
mkdir runoob-git-test # 创建测试目录
cd runoob-git-test/ # 进入测试目录
echo "# 菜鸟教程 Git 测试" >> README.md # 创建 README.md 文件并写入内容
ls #查看目录下的文件
git init # 初始化
git add README.md # 添加文件
git commit -m "添加 README.md 文件" # 提交并备注信息

git remote add origin git@github.com:tianqixin/runoob-git-test.git  
git push -u origin master # 提交到 Github
```

# 查看当前的远程库

```shell
git remote 查看当前配置有哪些远程仓库
git remote -v 别名的实际链接地址
```

# 提取远程仓库

```shell
git fetch 从远程仓库下载新分支与数据
git merge 从远端仓库提取数据并尝试合并到当前分支
```

# 常用

## 登录

```shell
git config --global user.name "xiaohe"
git config --global user.email "2109664977@qq.com"
```

## 连接

```shell
ssh-keygen -t rsa -C "2109664977@qq.com"
ssh-keygen -t ed25519 -C "2109664977@qq.com"
ssh -T git@gitee.com
```

## 添加远程仓库

```shell
git remote add [shortname] [url]
git remote add test https://gitee.com/bestwishes0203/login.git
ssh-keygen -t rsa -C "2109664977@qq.com"
```

## 提交

```shell
git init - 初始化仓库。
git add . - 添加文件到暂存区。
git commit - 将暂存区内容添加到仓库中。
git commit -m "提交说明"
git commit -m "第一次提交"
git pull
git push -u https://gitee.com/bestwishes0203/login.git master
git log
git checkout 版本号
git checkout master
```

## 分支

```shell
git branch
git branch dev
git checkout dev
```

## 合并分支

```shell
git add .
git commit -m "fenzhi"
git checkout master
git pull
git merge dev
git push
```

