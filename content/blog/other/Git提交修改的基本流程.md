## Git 提交修改的基本流程

### 1. 检查当前状态
```bash
git status
```

### 2. 添加修改的文件到暂存区
```bash
# 添加所有修改的文件
git add .

# 或者添加指定文件
git add README.md
```

### 3. 提交修改
```bash
git commit -m "完善 README 文档，添加项目介绍和详细使用说明"
```

### 4. 推送到远程仓库（如果需要）
```bash
git push origin main
# 或者 git push origin master
```

## 完整的提交示例

```bash
# 1. 查看当前状态
git status

# 2. 添加修改的文件
git add README.md

# 3. 提交修改
git commit -m "docs: 完善 README 文档，添加项目介绍、使用指南和开发文档"

# 4. 推送到远程仓库
git push origin main
```

## 常用 Git 命令说明

- `git status` - 查看工作区和暂存区的状态
- `git add <文件>` - 将文件添加到暂存区
- `git commit -m "提交信息"` - 提交暂存区的修改
- `git log` - 查看提交历史
- `git diff` - 查看具体的修改内容

## 提交信息规范建议

使用有意义的提交信息格式：
- `feat:` - 新功能
- `fix:` - 修复bug  
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `refactor:` - 代码重构
