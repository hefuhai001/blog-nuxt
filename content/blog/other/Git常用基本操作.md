1. 把想提交的文件放进暂存区  
   ```bash
   git add .                 # 当前目录所有改动
   # 或者只挑几个文件
   git add src/a.js src/b.js
   ```

2. 正式提交，并一次性写好备注  
   ```bash
   git commit -m "feat: 新增下单接口 / fix: 修复登录空指针"
   ```
   备注格式建议：  
   - `feat:` 新功能  
   - `fix:` 修 bug  
   - `docs:` 文档  
   - `style:` 格式  
   - `refactor:` 重构  
   用英文冒号，50 字以内，语义清晰。

3. 推到远程仓库  
   ```bash
   git push origin 分支名
   # 最常见就是
   git push origin main
   # 或者
   git push origin master
   ```

一条流完成（适合懒人脚本）：
```bash
git add . && git commit -m "你的备注" && git push origin main
```

这样本地“未提交”的代码就带备注地推到服务器了。