# 数据结构之操作顺序表实战——C语言

## 序言
顺序表是在计算机内存中以数组的形式保存的线性表，线性表的顺序存储是指用一组地址连续的存储单元依次存储线性表中的各个元素、使得线性表中在逻辑结构上相邻的数据元素存储在相邻的物理存储单元中，即通过数据元素物理存储的相邻关系来反映数据元素之间逻辑上的相邻关系，采用顺序存储结构的线性表通常称为顺序表。顺序表是将表中的结点依次存放在计算机内存中一组地址连续的存储单元中。
## 一.数据结构概述
![在这里插入图片描述](https://img-blog.csdnimg.cn/68f6211a9f2e450c9df4f13b961341f2.png#pic_center)
## 二.要求
本实训是对课本中关于顺序表的所有知识的综合实训，其内容包括了顺序表的各种基本操作。通过实训让读者掌握顺序表各种操作的算法编写，并理解各种操作之间的联系。

用户运行程序时，屏幕中显示选项菜单：

****************************
		--线性顺序表--
	   1--------顺序表初始化     
	   2--------插入             
	   3--------删除             
	   4--------求表长           
	   5--------按值查找         
	   6--------读取元素值       
	   7--------显示线性表       
	   0--------退出             
****************************
根据给出的问题，选择算法；正确画出流程图；正确输入、编译、链间、运行程序；运行结果用截图方式插入本报告；原程序有必要的注释；验证程序要全面。

代码包含顺序表的基本操作，包括顺序表的初始化、元素的插人、元素的删除、计算顺序表长度、在顺序表中查找某个关键字、读取指定位置的元素值和输出顺序表的元素信息等。
## 三.作答
### 1.代码：
```c
#include <stdio.h>
#include <malloc.h>

#define ElemType int //在此例中数据类型采用数字类型
#define MaxSize 100  //顺序表的最大长度

typedef struct
{
    ElemType *data; //存储空间基址
    int length;     //线性表当前的长度
} SqList;

//初始化顺序表，创建一个空表
int InitList(SqList *L)
{
    L->data = (ElemType *)malloc(MaxSize * sizeof(ElemType));
    if (!L->data)
    {
        printf("存储空间分配失败!");
    }
    L->length = 0;
}

//创建指定大小的顺序表
int CreateSqList(SqList *L, int n) // n为需要创建顺序表的长度
{
    int i = 0;
    if (n > MaxSize || n < 1)
    {
        printf("顺序表的长度非法");
    }
    else
    {
        printf("请输入%d个数据:", n);
        for (i = 0; i < n; i++)
        {
            scanf("%d", &L->data[i]);
            L->length++;
        }
    }
}

//在指定位置插入数据
int InsertSqList(SqList *L, int n, ElemType e) // n为插入位置，e为要插入的数据
{
    int i = 0;
    if (n > L->length || n < 1)
    {
        printf("插入位置非法!");
    }
    else
    {
        for (i = L->length - 1; i >= n - 1; i--)
        {
            L->data[i + 1] = L->data[i];
        }
        L->data[n - 1] = e;
        L->length++;
    }
}

//删除指定位置的数据
int DeleteSqList(SqList *L, int n) // n为要删除的数据位置
{
    int i = 0;
    if (n > L->length || n < 1)
    {
        printf("删除位置非法!");
    }
    else
    {
        for (i = n; i < L->length; i++)
        {
            L->data[i - 1] = L->data[i];
        }
        L->length--;
    }
}

//查看顺序表长度
int len_seqList(SqList *L) /*返回顺序表L的长度*/
{
    return L->length;
    // return L->last;
}

//按值查找
int location_seqlist(SqList *L, ElemType e) /*在线性表中查找值为e的数据元素*/
{
    int i = 0;
    while (i < L->length && L->data[i] != e)
        i++;
    if (i == L->length)
        return 0; /*查找不成功*/
    else
        return i; /*返回的是存储位置*/
}

//读取元素值
int get_from_seqlist(SqList *L, int i) /*返回线性表中的第i个元素的值*/
{
    if (i < 1 || i > L->length)
    {
        printf("输入的序号有误，请重新输入!\n");
        // return L->data[i] = -1;
        // return NULL;
    }
    else
        return L->data[--i];
}

//显示顺序表
void PrintSqList(SqList *L)
{
    int i;
    printf("打印出的顺序表为:\n");
    printf("*************************\n");
    for (i = 0; i < L->length; i++)
    {
        printf("   %d", L->data[i]);
    }
    printf("\n*************************\n");
}

int main()
{
    int choice;
    SqList L;
    int j = 1;

    while (j)
    {
        printf("\n\n\n");
        printf("\t\t\t        --线性顺序表--       \n");
        printf("\n\t\t\t********************************");
        printf("\n\t\t\t*	1--------顺序表初始化(创建)*");
        printf("\n\t\t\t*	2--------插入          *");
        printf("\n\t\t\t*	3--------删除          *");
        printf("\n\t\t\t*	4--------求表长        *");
        printf("\n\t\t\t*	5--------按值查找      *");
        printf("\n\t\t\t*	6--------读取元素值    *");
        printf("\n\t\t\t*	7--------显示线性表    *");
        printf("\n\t\t\t*	0--------退出          *");
        printf("\n\t\t\t********************************\n");
        printf("\t\t\t请选择菜单号 (0--7): ");
        scanf("%d", &choice);
        if (choice == 1)
        {
            //顺序表初始化
            InitList(&L);

            int n;
            printf("请输入需要创建顺序表的长度：");
            scanf("%d", &n);

            CreateSqList(&L, n);
        }
        else if (choice == 2)
        {
            //插入
            // printf("现默认在1号位置前插入数据0! \n");
            // int n, ElemType e
            // InsertSqList(&L, 1, 0);
            int n;
            printf("请输入需要插入顺序表的位置：");
            scanf("%d", &n);
            ElemType e;
            printf("请输入需要插入顺序表的元素：");
            scanf("%d", &e);

            InsertSqList(&L, n, e);
        }
        else if (choice == 3)
        {
            //删除
            // printf("现默认删除1号位置数据! \n");
            // int n
            int n;
            printf("请输入需要删除顺序表的位置：");
            scanf("%d", &n);

            DeleteSqList(&L, n);
        }
        else if (choice == 4)
        {
            // printf("求表长\n");
            printf("当前顺序表的表长为： %d\n", len_seqList(&L));
        }
        else if (choice == 5)
        {
            // printf("按值查找\n");
            int i;
            ElemType e;
            printf("请输入要查找的值：");
            scanf("%d", &e);

            i = location_seqlist(&L, e);
            if (i >= 0)
                printf("要查找的元素下标为：%d\n", ++i);
            else
                printf("元素未找到");
        }

        else if (choice == 6)
        {
            // printf("读取元素值\n");
            int i;
            ElemType e;
            printf("请输入要读取的结点的序号：");
            scanf("%d", &i);
            //读取节点的序号
            e = get_from_seqlist(&L, i);

            printf("要查找的下标为%d的元素值为：%d\n", i, e);
        }
        else if (choice == 7)
        {
            //显示线性表
            PrintSqList(&L);
        }
        else if (choice == 0)
        {
            j = 0;
            printf(" \t \t \t 程序结束！ \n");
        }
        else
        {
            printf("\n\t\t\t输入错误!请重新输入！ \n");
        }
        printf("操作成功！\n");
    }
    //测试
    // InitList(&L);                   // 1--------顺序表初始化
    // CreateSqList(&L, 5);            // 1--------创建
    // InsertSqList(&L, 1, 0);         // 2--------插入
    // DeleteSqList(&L, 1);            // 3--------删除
    // len_seqList(&L);                // 4--------求表长
    // location_seqlist(&L, 1);        // 5--------按值查找
    // get_from_seqlist(&L, 1);        // 6--------读取元素值
    // PrintSqList(&L);                // 7--------显示线性表
    return 0;
}
```
