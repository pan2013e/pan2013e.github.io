---
title: PTA--插入排序还是归并排序
date: 2020-5-23 0:48:00
tags: C
category: CS
---

<script type="text/javascript"src="https://i.upmath.me/latex.js "></script>

## 引入

根据维基百科的定义：

**插入排序**是迭代算法，逐一获得输入数据，逐步产生有序的输出序列。每步迭代中，算法从输入序列中取出一元素，将之插入有序序列中正确的位置。如此迭代直到全部元素有序。

**归并排序**进行如下迭代操作：首先将原始序列看成 N 个只包含 1 个元素的有序子序列，然后每次迭代归并两个相邻的有序子序列，直到最后只剩下 1 个有序的序列。

现给定原始序列和由某排序算法产生的中间序列，请你判断该算法究竟是哪种排序算法？

<!--more-->

## 输入格式

输入在第一行给出正整数 {% raw %} $$ N(N\le 100) $$ {% endraw %} ；随后一行给出原始序列的 {% raw %} $$ N $$ {% endraw %} 个整数；最后一行给出由某排序算法产生的中间序列。这里假设排序的目标序列是升序。数字间以空格分隔。

## 输出格式

首先在第 1 行中输出`Insertion Sort`表示插入排序、或`Merge Sort`表示归并排序；然后在第 2 行中输出用该排序算法再迭代一轮的结果序列。题目保证每组测试的结果是唯一的。数字间以空格分隔，且行首尾不得有多余空格。

## 输入样例 1

```
10
3 1 2 8 7 5 9 4 6 0
1 2 3 7 8 5 9 4 6 0
```

## 输出样例 1

```
Insertion Sort
1 2 3 5 7 8 9 4 6 0
```

## 输入样例 2

```
10
3 1 2 8 7 5 9 4 0 6
1 3 2 8 5 7 4 9 0 6
```

## 输出样例 2

```
Merge Sort
1 2 3 8 4 5 7 9 0 6
```

## 参考代码(C)

```c
#include <stdio.h>
#include <stdlib.h>

int t[110],a[110],b[110];
int N;

//归并排序中的merge操作，双指针算法
//合并两个上升子序列 [l...mid] 和 [mid+1...r]
void merge(int m_arr[],int l,int r,int mid){
    int tmp[110]={0};
    int k = 0, i = l, j = mid + 1;
    while (i <= mid && j <= r)
        if (m_arr[i] <= m_arr[j]) tmp[k ++ ] = m_arr[i ++ ];
        else tmp[k ++ ] = m_arr[j ++ ];
    while (i <= mid) tmp[k ++ ] = m_arr[i ++ ];
    while (j <= r) tmp[k ++ ] = m_arr[j ++ ];
    for (i = l, j = 0; i <= r; i ++, j ++ ) m_arr[i] = tmp[j];
}

//判断当前结果是否与模板序列匹配
int isMatch(int mode){
    switch(mode){
        case 1: 
            for(int i=0;i<N;i++){
                if(a[i]!=t[i]) return 0;
            }
            return 1;break;
        case 2:
            for(int i=0;i<N;i++){
                if(b[i]!=t[i]) return 0;
            }
            return 1;break;
    }
    return 0;
}
int main(){
    int flag=0;
    scanf("%d",&N);
    for(int i=0;i<N;i++){
        scanf("%d",&a[i]);
        b[i]=a[i];
    }
    for(int i=0;i<N;i++){
        scanf("%d",&t[i]);  //模板序列
    }
    // 常规插入排序，注意i从1开始，否则与题意不符
    for(int i=1;i<N;i++){
        int temp=a[i];
        int j=i-1;
        while(j>=0 && a[j]>temp){
            a[j+1] = a[j];
            j--;
        }
        a[j+1]=temp;
        if(flag) break;
        //完成一次遍历之后进行比较
        //匹配成功则进行标记，然后再进行一轮排序，之后跳出循环
        if(isMatch(1)){
            flag=1;
            printf("Insertion Sort\n");
        }
    }
    if(flag){
        for(int i=0;i<N;i++) {
            printf("%d",a[i]);
            if(i!=N-1) printf(" ");        
        }
        printf("\n");
        return 0;
    }  
    // 自底向上的归并排序
    // k代表当前子序列个数，len代表前面等长子序列的长度
    // sup代表当前合并范围的最右端
    int k=N,len=1,sup=0; 
    // 合并为一个序列时完成排序
    while(k>1){
        // 每两个子区间进行合并
        for(int i=0;i<=k/2;i++){
            sup=2*len*(i+1)-1; 
            // 需要考虑的特殊情况：
            // 计算出的区间右端点如果越界，说明这是此前的奇数位子序列
            // 将合并右端点修正为整个数组右端点
            if(2*len*(i+1)-1 > N-1 ) sup=N-1;
            // 注意到l和mid的计算与sup是否越界无关，因此不需要分类讨论
            merge(b,2*i*len,sup,((4*i+2)*len-1)/2); 
        }
        // 考虑到奇数个子序列的情况，注意k/2之后向上取整
        // 子序列个数折半之后，被合并的等长子序列长度加倍
        k=(k+1)/2;len=len*2;

        if(flag) break;
        if(isMatch(2)){
            printf("Merge Sort\n");
            flag=1;
        }
    }
    if(flag){
        for(int i=0;i<N;i++) {
            printf("%d",b[i]);
            if(i!=N-1) printf(" ");
        }
        printf("\n");
        return 0;
    }  
}
```