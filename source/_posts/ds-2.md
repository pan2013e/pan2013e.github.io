---
title: 数据结构-2
date: 2020-6-17 1:31:00
category: CS
tags: DS
---

持续更新中

<!--more-->

<script type="text/javascript" src="/js/config.js" defer></script>
<script id="Mathjax-script" type="text/javascript" defer src="/js/mathjax/tex-svg.js?config=TeX-MML-AM_CHTML"></script>

# DS-2
## Trie树（字典树）

![img/20200617005539_7687d9838b30f5a458179b62e4373654.png](http://api.zypan.ltd/img/20200617005539_7687d9838b30f5a458179b62e4373654.png)

* 高效存储和查找字符串集合的数据结构

### 例题

维护一个字符串集合，支持两种操作：

1. `I x`向集合中插入一个字符串x；
2. `Q x`询问一个字符串在集合中出现了多少次。
共有N个操作，输入的字符串总长度不超过$10^5$，字符串仅包含小写英文字母。

**输入格式**

第一行包含整数$N$，表示操作数。

接下来$N$行，每行包含一个操作指令，指令为`I x`或`Q x`中的一种。

**输出格式**

对于每个询问指令`Q x`，都要输出一个整数作为结果，表示`x`在集合中出现的次数。

每个结果占一行。

**数据范围**

$1\le N\le 2\times 10^4$

**输入样例：**

```
5
I abc
Q abc
Q ab
I ab
Q ab
```

**输出样例：**

```
1
0
1
```

```cpp
#include <iostream>
using namespace std;
const int N = 100010;
int son[N][26],cnt[N],idx;//下标为0的点，既是根结点，又是空结点
char str[N];

void insert(char str[]){
    int p=0; //标记单词的末尾字母
    for(int i=0;str[i];i++){
        int u = str[i] - 'a'; //a-z映射为0-25
        if(!son[p][u]) son[p][u] = ++idx;
        p=son[p][u];
    }
    cnt[p]++;
}

int query(char str[]){
    int p=0;
    for(int i=0;str[i];i++){
        int u=str[i]-'a';
        if(!son[p][u]) return 0;
        p=son[p][u];
    }
    return cnt[p];
}

int main(){
    int n;
    cin>>n;
    while(n--){
        char op[2];
        scanf("%s%s",op,str);
        if(op[0]=='I') insert(str);
        else cout << query(str) << endl;
    }
    return 0;
}
```