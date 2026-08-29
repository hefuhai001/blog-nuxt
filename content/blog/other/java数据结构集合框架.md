## Java 数据结构 & 集合框架 全景图

### 一、Java 数据结构分类

```
┌─────────────────────────────────────────────────────────┐
│                    Java 数据结构体系                      │
├─────────────────────────────────────────────────────────┤
│  1. 线性结构                                              │
│     ├── 数组 (Array)                                      │
│     ├── 链表 (Linked List)                                │
│     ├── 栈 (Stack)                                        │
│     └── 队列 (Queue)                                      │
│                                                          │
│  2. 非线性结构                                            │
│     ├── 树 (Tree)                                         │
│     ├── 图 (Graph)                                        │
│     └── 哈希表 (Hash Table)                               │
│                                                          │
│  3. 集合框架 (Java Collections Framework)                 │
│     ├── 单例集合 (Collection)                             │
│     │   ├── List (有序可重复)                              │
│     │   ├── Set (无序不重复)                               │
│     │   └── Queue (队列)                                  │
│     └── 双例集合 (Map)                                    │
│         └── 键值对存储                                     │
└─────────────────────────────────────────────────────────┘
```

---

### 二、Java 集合框架核心架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Collection 接口                          │
│                      (根接口)                               │
└──────────────┬──────────────────────────────┬─────────────┘
               │                              │
        ┌──────▼──────┐                ┌──────▼──────┐
        │    List     │                │     Set     │
        │   有序列表   │                │   无序集合   │
        └──────┬──────┘                └──────┬──────┘
               │                              │
    ┌─────────┼─────────┐            ┌───────┴───────┐
    │         │         │            │               │
┌───▼───┐ ┌──▼────┐ ┌──▼───┐    ┌───▼────┐     ┌────▼────┐
│ArrayList│ │LinkedList│ │Vector│    │HashSet │     │TreeSet  │
│  数组   │ │  双向链表 │ │ 数组  │    │ 哈希表  │     │红黑树    │
│ 实现    │ │         │ │(线程安全)│    │         │     │(有序)   │
└─────────┘ └─────────┘ └───────┘    └─────────┘     └─────────┘
                                             
┌─────────────────────────────────────────────────────────────┐
│                      Map 接口                               │
│                   (键值对映射)                               │
└──────────────┬──────────────────────────────┬─────────────┘
               │                              │
        ┌──────▼──────┐                ┌──────▼──────┐
        │   HashMap   │                │  SortedMap   │
        │   哈希表     │                │   排序映射    │
        └──────┬──────┘                └──────┬──────┘
               │                              │
        ┌──────▼──────┐                ┌──────▼──────┐
        │LinkedHashMap│                │   TreeMap   │
        │哈希表+链表   │                │   红黑树     │
        │(保持插入顺序)│                │  (有序)     │
        └─────────────┘                └─────────────┘
```

---

### 三、核心实现类详解

#### 1. **List 体系**

| 实现类                   | 底层结构   | 线程安全 | 特点                             | 适用场景              |
| ------------------------ | ---------- | -------- | -------------------------------- | --------------------- |
| **ArrayList**            | Object数组 | ❌        | 随机访问快(O1)，插入删除慢(O(n)) | 查询多、增删少        |
| **LinkedList**           | 双向链表   | ❌        | 插入删除快(O1)，随机访问慢(O(n)) | 频繁增删、实现栈/队列 |
| **Vector**               | Object数组 | ✅        | 古老实现，已过时                 | 不建议使用            |
| **CopyOnWriteArrayList** | 数组       | ✅        | 写时复制，读多写少               | 并发读场景            |

**ArrayList vs LinkedList 对比：**
```java
// ArrayList - 适合随机访问
List<String> arrayList = new ArrayList<>();
arrayList.get(1000);        // O(1) - 直接通过索引访问
arrayList.add(0, "item");   // O(n) - 需要移动后续元素

// LinkedList - 适合频繁增删
List<String> linkedList = new LinkedList<>();
linkedList.get(1000);       // O(n) - 需要遍历
linkedList.add(0, "item");  // O(1) - 只需修改指针
```

---

#### 2. **Set 体系**

| 实现类                  | 底层结构             | 有序性            | 去重方式                  | 特点                 |
| ----------------------- | -------------------- | ----------------- | ------------------------- | -------------------- |
| **HashSet**             | HashMap              | ❌                 | hashCode() + equals()     | 最快，无序           |
| **LinkedHashSet**       | LinkedHashMap        | ✅ (插入顺序)      | hashCode() + equals()     | 保持插入顺序         |
| **TreeSet**             | TreeMap(红黑树)      | ✅ (自然/定制排序) | compareTo() 或 Comparator | 自动排序，O(log n)   |
| **EnumSet**             | 位向量               | ✅ (枚举顺序)      | 枚举常量                  | 专为枚举设计，极高效 |
| **CopyOnWriteArraySet** | CopyOnWriteArrayList | ❌                 | equals()                  | 线程安全，读多写少   |

**去重原理：**
```java
// HashSet 去重流程
1. 计算 hashCode()
2. 找到对应桶位置
3. 桶内用 equals() 比较是否存在

// TreeSet 去重流程  
1. 使用 compareTo() 或 Comparator.compare()
2. 返回 0 即视为重复
```

---

#### 3. **Map 体系**

| 实现类                | 底层结构             | 线程安全 | 特点               | JDK版本 |
| --------------------- | -------------------- | -------- | ------------------ | ------- |
| **HashMap**           | 数组+链表+红黑树     | ❌        | 默认，高效         | 1.2+    |
| **LinkedHashMap**     | 哈希表+双向链表      | ❌        | 保持插入/访问顺序  | 1.4+    |
| **TreeMap**           | 红黑树               | ❌        | 按键排序           | 1.2+    |
| **Hashtable**         | 数组+链表            | ✅        | 古老，已过时       | 1.0+    |
| **ConcurrentHashMap** | CAS+分段锁/数组+链表 | ✅        | 高并发推荐         | 1.5+    |
| **WeakHashMap**       | 哈希表               | ❌        | 弱引用键，GC可回收 | 1.2+    |

**HashMap 核心机制 (JDK 8+)：**
```
数组 (Node<K,V>[]) 
    │
    ├── 链表 (长度<8)  → 拉链法解决冲突
    │
    └── 红黑树 (长度≥8) → 优化长链表查询为 O(log n)

关键参数：
- 默认容量：16
- 负载因子：0.75
- 树化阈值：8 (链表转红黑树)
- 反树化阈值：6 (红黑树转链表)
```

---

#### 4. **Queue/Deque 体系**

```
Queue (单向队列)                    Deque (双端队列)
    │                                   │
    ├── add/offer (入队)               ├── addFirst/addLast
    ├── remove/poll (出队)             ├── removeFirst/removeLast
    └── element/peek (查看队首)         └── getFirst/getLast

实现类：
├─ ArrayDeque   → 循环数组实现，无容量限制，最快
├─ LinkedList   → 双向链表实现，也可作List
├─ PriorityQueue → 堆实现，自然/定制排序
└─ ConcurrentLinkedQueue → 无锁并发队列
```

---

### 四、线程安全方案

```
┌─────────────────────────────────────────────────────────┐
│              线程安全策略选择                            │
├─────────────────────────────────────────────────────────┤
│  方案1：Collections 工具类 (同步包装器)                  │
│  Collections.synchronizedList(new ArrayList<>())          │
│  Collections.synchronizedMap(new HashMap<>())           │
│  ⚠️ 粗粒度锁，并发性能差                                  │
├─────────────────────────────────────────────────────────┤
│  方案2：JUC 并发集合 (推荐)                               │
│  CopyOnWriteArrayList  → 读多写少 (遍历操作多)            │
│  CopyOnWriteArraySet   → 读多写少                        │
│  ConcurrentHashMap     → 高并发Map (分段锁/CAS)          │
│  ConcurrentLinkedQueue → 高并发队列                       │
│  BlockingQueue 系列     → 生产者-消费者模式                │
├─────────────────────────────────────────────────────────┤
│  方案3：外部同步                                          │
│  synchronized 关键字 / Lock 锁                            │
└─────────────────────────────────────────────────────────┘
```

---

### 五、时间复杂度对比

| 操作 | ArrayList    | LinkedList | HashSet     | TreeSet  | HashMap     | TreeMap  |
| ---- | ------------ | ---------- | ----------- | -------- | ----------- | -------- |
| 添加 | O(1)* / O(n) | O(1)       | O(1) / O(n) | O(log n) | O(1) / O(n) | O(log n) |
| 删除 | O(n)         | O(1)       | O(1) / O(n) | O(log n) | O(1) / O(n) | O(log n) |
| 查询 | O(1)         | O(n)       | O(1) / O(n) | O(log n) | O(1) / O(n) | O(log n) |
| 遍历 | O(n)         | O(n)       | O(n)        | O(n)     | O(n)        | O(n)     |

*注：O(1)* 表示均摊时间复杂度，扩容时为 O(n)

---

### 六、选择指南

```
1. 需要有序列表？
   ├── 随机访问多 → ArrayList
   └── 频繁增删 → LinkedList

2. 需要去重？
   ├── 无需顺序 → HashSet
   ├── 保持插入顺序 → LinkedHashSet
   └── 需要排序 → TreeSet

3. 需要键值对？
   ├── 通用场景 → HashMap
   ├── 保持插入/访问顺序 → LinkedHashMap
   ├── 需要排序 → TreeMap
   └── 高并发 → ConcurrentHashMap

4. 需要队列？
   ├── 普通FIFO → ArrayDeque (比LinkedList快)
   ├── 优先级队列 → PriorityQueue
   └── 阻塞队列 → ArrayBlockingQueue / LinkedBlockingQueue
```

---

### 七、关键接口继承关系

```
Iterable<T> (可迭代)
    │
    └── Collection<E> (单例集合根接口)
            │
            ├── List<E> (有序可重复)
            ├── Set<E> (无序不重复)
            │       └── SortedSet<E> → NavigableSet<E>
            └── Queue<E> (队列)
                    └── Deque<E> (双端队列)

Map<K,V> (独立接口，双例集合)
    └── SortedMap<K,V> → NavigableMap<K,V>
```

---

### 八、快速记忆口诀

> **"List 有序可重复，Set 去重无序行，Map 键值对映射，Queue 排队先进先出"**
>
> **"查询用 Array，增删用 Linked，去重用 Hash，排序找 Tree，并发用 Concurrent"**

