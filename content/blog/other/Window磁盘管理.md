
```cmd
diskpart.exe
```
启动 Windows 的磁盘分区工具 DiskPart。

```cmd
list disk
```
列出所有磁盘。

```cmd
select disk 0
```
选择编号为 0 的磁盘（通常是系统盘）。

```cmd
list partition
```
列出该磁盘上的所有分区。

```cmd
select partition 4
```
选择第 4 个分区。

```cmd
delete partition override
```
强制删除选中的分区（即使有系统保护）。

> ⚠️ **注意**：这些命令会删除分区，数据将不可恢复。请谨慎操作，确保已备份重要数据。

---

### 🧩 Windows 分盘的方法介绍：

#### ✅ 方法一：使用图形界面「磁盘管理」
适合大多数用户，操作简单。

##### 步骤：
1. **打开磁盘管理**：
   - 按 `Win + X`，选择 **“磁盘管理”**。
   - 或者按 `Win + R`，输入 `diskmgmt.msc`，回车。

2. **压缩卷**（腾出未分配空间）：
   - 右键点击一个已有分区（如 C:），选择 **“压缩卷”**。
   - 输入要压缩的空间大小（单位是 MB），点击“压缩”。

3. **新建简单卷**：
   - 在未分配的空间上右键，选择 **“新建简单卷”**。
   - 按照向导设置大小、盘符、文件系统（NTFS 推荐），完成即可。

---

#### ✅ 方法二：使用命令行（DiskPart）
适合高级用户，功能强大但风险较高。

##### 示例：新建一个分区
```cmd
diskpart
list disk
select disk 0
create partition primary size=10240  （创建一个 10GB 的主分区）
assign letter=E
format fs=ntfs quick
```

---

#### ✅ 方法三：使用第三方工具
如：
- **AOMEI Partition Assistant**
- **MiniTool Partition Wizard**
- **EaseUS Partition Master**

这些工具提供更直观的界面和更多功能（如合并分区、迁移系统等），适合不熟悉命令行的用户。

