---
title: C程序设计专题笔记
date: 2020-6-7 12:00:00
---

<script type="text/javascript" src="/js/config.js" defer></script>
<script id="Mathjax-script" type="text/javascript" defer src="/js/mathjax/tex-svg.js"></script>

# 第一次课：Structure 结构

## 引入 

>一个C程序如何存储时间数据？ 

一个自然的想法：

`int y,m,d` && `scanf(...)`

**问题**: 如何将`y`,`m`,`d`合并到一个变量？

## 声明（“declare”）一个结构体（struct）

```c
struct Date{
    int year;
    int month;
    int day;
}; //do not miss ';' after '}'

struct Date today;//repeat 'struct' when defining a new struct variable
```

**注意:** `Date today;`在此处是不正确的，须使用`struct Date today`.

```c
//assign values to the members in 'today'
today.year=2020;
today.month=2;
today.day=24;

//output
printf("%d-%02d-%-02d\n",today.year,today.month,today.day);
```

### 多种声明方法
```c
struct point{
    /* code */
};
struct point p1,p2;`
```

```c
struct{
    /* code */
}p1,p2;
```

```c
struct point{
    /* code */
}p1,p2;
```

## 结构体变量

**Note :** declaration $\neq$ definition

**注意：** 声明与定义的区别

### 结构体变量的初始化

* `struct Date today={2020,2,24};`

* 和初始化数组的一种方法是类似的，如
`int a[]={2020,2,24};`

* 但是又更加灵活，如`struct Date today={2020,.month=2;.day=24};`

### 结构体的成员(member)

* 关注 `struct` & 数组之间的异同
* op `[]` $\leftrightarrow$ 数组
* op `.` $\leftrightarrow$ `struct`

### 赋值

**注意：** 一个结构体变量可以直接用另一个结构体变量赋值（数组不行！），或者被取地址，或者作为参数被传入一个函数。

```c
struct Date today={2020,2,24};
struct Date tmw=today;
```

也可以这样做，
```c
tmw=(struct Date){2020,2,24};
```

### 指向结构体的指针

**注意：** 与数组不同的是，一个`struct`的名字并不是它的地址！

```c
struct Date *p = &today;
```

* 如何访问其中的成员:

`(*p).year` || `p->year`(p指向的结构体中的`year`变量)

## struct 和 函数

### 将struct作为参数

```c
int numOfDays(struct date d)
```
* 一个 `struct` 变量可以作为函数的参数。
* 与数组不同的是, 一个 **新的** `struct` 会被创建在**函数内部**，然后参数值会被**复制**过去。
* 函数可以返回 `struct` 类型。


```c
void readDate(struct Date d){
    scanf("%d-%d-%d",&d.year,&d.month,&d.day);
}
void prtDate(struct Date d){
    printf("%d-%d-%d",d.year,d.month,d.day);
}
```
**问题: 上述代码中的 `readDate` 函数起作用吗？**

修正：可以让函数返回结构体

```c
struct Date readDate(){
    struct Date d;
    scanf(...);
    return d;
}

int main(){
    struct Date today;
    today = readDate();
    //...
}
```

### 将指向struct的指针作为参数
>If a large structure is to be passed to a function, it is generally more efficient to pass a pointer than to copy the whole structure.
>
> by K&R
> 
```c
struct point* inputPoint(struct point *p){
    scanf(...);
    return p; //the function receives 'struct point *p' and passes it back
}
```
如下代码段是错误的,
```c
struct Date *d;
d->year=year;
d->month=month;
d->day=day;
```
d并没有指向任何存在的`struct Date`，该错误类似于

```c
int *p;
p=123;
```

### struct作为数组元素

 ```c
 struct date dates[100];
 struct date dates[]={
     {24,2,2020},
     {25,2,2020},
 };
 ```
### struct中的struct

 ```c
 struct rect{
     struct point pt1;
     struct point pt2;
 };
 ```
### 复合："Array of struct of struct"

### 函数 struct Date tomorrow
* 实现返回当前日期的下一天的日期。
 ```c
 int isleap(struct Date d){
    int ret=0;
    //...
    return ret;
 }
 int lastDay(struct Date d){
    int ret=0;
    static int days[]={31,28,31,30,31,30,31,31,30,31,30,31};
    if(d.month==2){
        if(isleap(d)){
            ret= d.day==29;
        }else{
            ret= d.day==28;
        }
    }else{
        if(days[d.month-1]==d.day){
            ret=1;
        }
    }
    return ret;
 }

 struct Date tomorrow(struct Date d){
    if (lastDay(d)){
        d.month++;
        d.day=1;
    }else{
        d.day++;
    }
 }
 ```
## typedef

```c
typedef struct _Date{
    /* code */
} Date;

Date d;
```
* `typedef`:创建新变量名称的一种方法
* 新的名称是一种**别名**,如：我们用`Date`代替`struct _Date`

### typedef array
```c
typedef char Line[80];

Line s;//'s' is an array of `char`
```
`typedef char[80] Line` 是错误的！`[80]`要放在后面。

###  struct的大小
* 对齐（alignment）

## 课堂练习
下面代码的执行输出是：________.
```c
#include <stdio.h>
struct Date{
    int year,month,day;
};
void f(struct Date a[]){
    a[0].year++;
}
int main(){
    struct Date d[2]={{2020,2,24},{2020,2,25}};
    f(d);
    printf("%d\n",d[0].year);
    return 0;
}
```
**解答：** 2021

`struct Date d[2]`是一个数组，数组的元素是`struct Date`类型.向函数`f`传入的参数是`d`数组的首地址，也就是`struct Date d[0]`的地址，因此经过函数作用之后`d[0].year`$+1$.

# 第二次课 Linked List 链表

## Basic Idea
`node` : payload & link

```sequence
participant head
participant node2
participant ...
participant tail
note left of head: linked_list
head->node2: link
node2->...:
...->tail:
```


### Implementation

```c
typedef struct _Node {
    int val;
    struct _Node *next;
} Node;

/* The following code fragment is incorrect:
 * typedef struct {
 *     int val;
 *     Node *next;
 * } Node;
 */

int main(){
    Node *head=NULL;
}
```
## Basic Operation

### insert head

```c
Node *new=(Node *)malloc(sizeof(Node));
n->val=x;
n->next=head;
head=n;
```
```sequence
title: Insert Head Logic
participant new_head
participant prev_head
participant node2

new_head->prev_head:
prev_head->node2:
note over new_head:head=new_head
```
#### function `insert_head` ?
```c
typedef struct{
    Node *head;
}List;

// List: hide Node in function main

void insert_head(List *list, int x){
    Node *n=(Node *)malloc(sizeof(Node));
    n->val=x;
    n->next=list->head;
    list->head=n;
}
```
`List` : **Low [coupling](https://en.wikipedia.org/wiki/Coupling_(computer_programming)) degree!**

### iterate & search
```c
for(Node *p=head;p;p=p->next){
    printf("%d\n",p->val);
}
```

```c
int search(List* list,int x){
    int ret=0;
    for(Node *p=list->head;p;p=p->next){
        if(p->value==x){
            ret=1;
            break;
        }
    }
    return ret;
}
```
### append tail

**Note:** Pay attention to edge cases.
For example, `p->var`. Check if `p == NULL` in some cases.

```sequence
title: Append Logic
participant ...
participant tail
participant new_node
participant NULL

note left of ... : when the list is not empty
note over new_node: 1.new_node->val = x
...->tail:
new_node->NULL:2. new_node->next\n=NULL
tail->new_node:3. tail->next=new_node
tail->NULL: X 
```
```sequence
participant new_node
participant NULL
new_node->NULL:new_node->next=NULL;
note over new_node:head=new_node;
note left of new_node: when the list is empty

```

### remove

```sequence
title: Remove Logic
participant prev_node
participant current_node
participant next_node

prev_node -> next_node:1. prev_node->next=current_node->next
note over current_node: 2. free(current_node)
note left of prev_node: when prev_node != NULL\n i.e. current_node != head
```
```sequence
participant head
participant node2
participant ...
head->node2:
node2->...:
note left of head: when current_node == head
note over head:1. free(head)
note over node2: 2. head=node2
```

### clear all

```c
void clear_list(List *list){
    for(Node *q= NULL, *p=list->head;p;p=q){
        q=p->next;
        free(p);
    }
}
```

```sequence
title:Clear Logic
participant head
participant node1
participant ...

note right of ...: 过河拆桥
note left of head: 0. q=NULL
head->node1:
node1->...:
note over head: 1. p=list->head
note over node1: 2.q=p->next
note over head: 3. free(p),p=q & loop...
```

## Sentinel node

* A dummy head/tail (no payload) to make code smooth

## More lists

|   List   | Single | Double |
|:--------:|:------:|:------:|
|   Head   | Single | Double |
| Sentinel |    Y   |    N   |


# 第三次课

## 全局变量
### 特性
* 定义在函数外面，与函数无关
* 生存期：全局
* 作用域：全局

### 初始化

```c
...
int g; //默认初始化为0
int t = c; 
//c必须是编译时的字面量（compile-time constant),函数的返回值就不能赋值给t

void f(){
    int k;
    //k未初始化，值是不确定的
}
...
```
### 函数内与全局变量同名的变量
```C
int g = 10;
void f(){
    int g = 12;
    printf(g); //12
    g+=10;  //22
}
int main(){
    printf(g); //10
    f();
    printf(g); //10 
}
```
### `static`类型：静态本地变量
* 存储是全局的
* 访问是局部的（可以通过函数传回其指针，然后进行修改）
$\longrightarrow$作用域限制在函数内部的全局变量
```C
int g = 10;

void f(){
    int k;
    static int gg = 12;
    printf(gg,k);
    printf(&g,&gg,&k);
    //可以发现，在内存中，gg和g存储在同一区域
    gg += 10;
    k += 10;
}
```
注意： **使用全局变量和静态本地变量的函数是线程不安全的**
不要使用全局变量来在函数间传递参数和结果；尽量避免使用全局变量

## 多个`.c`文件

* `main()`代码太长-->分成几个函数
* 源代码太长-->分成几个文件

```shell
cd $SRC
# 只编译，不链接，得到a.o,b.o
gcc -c a.c b.c
# 链接*.o文件，得到可执行文件out
gcc a.o b.o -o out 
```
### 编译和链接的过程
`IDE`中的“构建”：
* 编译预处理
* 编译成汇编代码
* 汇编成目标代码
* 链接成可执行程序

```bash
cd $SRC
# 查看编译中间过程的文件
gcc --save-temps a.c
```
`a.c`-->`a.i`-->`a.s`-->`a.o`-->`a.out`

### 编译单元 Compile Unit
* 一个`.c`是一个编译单元
* 每次编译**只处理一个编译单元**，不会打开其他文件来参考/检查

## 头文件 Header Files
### 函数原型
* 如果不给函数原型：编译器猜测返回`int`（可能有warning）。即便实际函数并非如此，编译也不会报错，但执行时很可能出现问题。
* 在头文件中存放函数原型

### 一种编译预处理指令 `#include`
* 在编译之前就处理
* 将对应文件插入到原位置.(可观察`*.i`文件)
* `#include <header.h>`：编译器在指定目录中寻找
* `#include "header.h"`：编译器先在当前目录寻找，如果没有再到指定目录寻找
* 环境变量和编译器命令行参数可以指定寻找头文件的目录
* 并不是用来引入库

注意：**一个`*.h`有一个对应的`*.c`；定义函数和使用函数的地方都要`#include`，以检查类型是否冲突**

### 不对外公开的函数
* 函数前加`static`,只能在所在的编译单元中被使用

### 变量的声明
```c
int i; //变量的定义

extern int g; //变量的声明
```
#### 声明：不产生代码
* 函数原型  `... f(...);`
* 变量声明  `extern  ... ...;`
* 结构声明  `struct ... { ... };`
* 宏声明    `#define ... ...` （范围：当前编译单元）
* 枚举声明  `enum ... { ... };`
* 类型声明  `typedef ... ...;`
* `inline`函数
#### 定义：产生代码
* 函数  `... f(...){...}`
* 变量  `int ...;`

注意：**只有声明可以被放在头文件中**（规则），否则会造成一个项目中多个编译单元有重名的实体。

### 标准头文件结构
* 保证在一个在一个编译单元中只被`#include`一次
```c 
#ifndef _HEADER_H_
#define _HEADER_H_

...

#endif
```
注意：**不要在一个头文件中`#include`其他头文件**
```c
#ifndef _LIST_H
#define _LIST_H

#include "node.h"  //这样就暴露了Node的接口，修改了Node就可能要修改main，要重复编译

typedef struct _list{
    struct Node* head;
    struct Node* tail;
}List;
```

#### 前向声明
```c 
#ifndef _LIST_H
#define _LIST_H

struct Node; //这里不需要知道Node是怎样的，只需要告诉编译器Node是一个结构。main函数与Node无关

typedef struct _list{
    struct Node* head;
    struct Node* tail;
}List;

#endif
```

# 第四次课 交互图形程序
## 函数指针
* 每个函数都有一个相应的地址。
```c
int main(){
    printf("%p\n",main);
    return 0;
}
```
### 定义函数指针
```c
/* 方法1 */
void (*p_func)(int, int) = NULL;
/* 方法2 */
typedef void (*tp_func)(int, int);
tp_func p_func = NULL;
```
### 函数指针的赋值
```c
void (*p_func)(int, int) = NULL;
p_func = &func1;
p_func = func2;
```
第二种方式也是合法的，编译器会将`void ()(int,int)`类型转换成`void (*)(int,int)`类型
### 使用函数指针调用函数
```c
/* 方法1 */
int val1 = p_func(1,2);
/* 方法2 */
int val2 = (*p_func)(1,2);
```
### 将函数指针作为参数传给函数
```c
int plus(int a,int b){
    return a+b;
}
int minus(int a,int b){
    return a-b;
}
void calc(int a,int b,int (*func)(int,int)){
    printf("%d",(*func)(a,b));
}
int main(){
    calc(1,2,plus);
    calc(1,2,minus);
    return 0;
}
```
### 函数指针作为返回类型
```c
void (* func3(int, int, double ))(int, int)
{
    ...
}
```
这里的`func3`以`(int,int,double)`为参数，返回类型为`void (*)(int,int)`.

### 函数指针数组
```c
/* 方法1 */
void (*func_array_1[5])(int, int, double);

/* 方法2 */
typedef void (*p_func_array)(int, int, double);

p_func_array func_array_2[5];
```

## 回调函数
回调函数就是一个通过函数指针调用的函数，回调函数不是由该函数的实现方直接调用，而是在特定的事件或条件发生时由另外的一方调用的，用于对该事件或条件进行响应。

>Wikipedia:
In computer programming, a callback is any executable code that is passed as an argument to other code, which is expected to call back (execute) the argument at a given time. This execution may be immediate as in a synchronous callback, or it might happen at a later time as in an asynchronous callback. 
Stack Overflow:
A "callback" is any function that is called by another function which takes the first function as a parameter.


下面以四则运算为例实现一个简单的回调函数实例。
首先创建一个函数指针结构体
```c
typedef struct _OP {
    double (*p_add)(double, double); 
    double (*p_sub)(double, double); 
    double (*p_mul)(double, double); 
    double (*p_div)(double, double); 
} OP;
```
然后初始化函数指针，
```c
/* 四则运算函数略 */

void init(OP *q){
    q->p_add=ADD;
    q->p_sub=SUB;
    q->p_mul=MUL;
    q->p_div=DIV;
}
```
接着创建库函数，
```c
//需要a，b这两个参数保存回调函数的参数值
double calc(double a,double b,double (*op_func)(double,double)){
    return (*op_func)(a,b);
}
```
之后就可以利用`calc`来调用回调函数
```c
OP *op = (OP *)malloc(sizeof(OP));
init(op);
printf("...",1.0,2.0,op->p_add);
...
```
在回调中，主程序把回调函数像参数一样传入库函数。这样一来，只要我们改变传进库函数的参数，就可以实现不同的功能，而且不需要修改库函数。回调函数可以用来降低耦合度。


## MVC设计模式


<div align=center>
Zhiyuan Pan, Zhejiang University
</div>

# 第五次课 递归
## Characteristics
* Recursive: of, relating to, or constituting a procedure that can repeat itself indefinitely
* Recursion: a repeated application of a recursive procedure or definition.('recursion',from late Latin word 'recurrere' which means '**run back**')
* Tactic: divide a problem into sub-problems of the same type as the original (Divide-and-Conquer Method)

## Principles
### Recursive functions in programming:
* Base case: There must be one or more base cases in recursive functions. In base case, the function produces a result trivially.
* Make progress: The program recurs to get solutions to smaller instances of the same problem. In a well-defined function, the base case must be reached eventually.
* Always believe: Always assume the recursive call works.
* Compound interest rule: Never duplicate work by solving the same instance of a problem in separate recursive calls.

### Recursively defined functions in mathematics:
* Basis step: Specify the value of the function at zero.
* Recursive step: Give the rules for finding its value at an integer from its value at smaller integers.

## Examples
### Factorial
We can write down function definition or recurrence relationship for this:
$$n!=\prod_{k=1}^{n}k=n\times (n-1)!$$
$$
f(n)=\begin{cases}
1 & n=0, \\
n\times f(n-1) & n>0,n\in\mathbb{N}.
\end{cases}
$$

* Base case: $0!=1$
* Make Progress：$n\rightarrow n-1 \rightarrow \cdots \rightarrow 0\rightarrow$breaks the chain of recursion



```c
#include <stdio.h>
int fac(int n){
    if(n==0) return 1;
    else return n*fac(n-1);
}
int main(){
    printf("Output:%d",fac(4));
    return 0;
}
```

    Output:24

procedure:
```c
f4           = 4 * f3
             = 4 * (3 * f2)
             = 4 * (3 * (2 * f1))
             = 4 * (3 * (2 * (1 * f0)))
             = 4 * (3 * (2 * (1 * 1)))
             = 4 * (3 * (2 * 1))
             = 4 * (3 * 2)
             = 4 * 6
             = 24
```

### Fibonacci numbers
$$
fib(n)=\begin{cases}
n & n=0 \lor n=1, \\
fib(n-1)+fib(n-2) & n>0,n\in\mathbb{N}.
\end{cases}
$$

### Euclidean algorithm
$$
gcd(x,y)=\begin{cases}
 & y=0, \\
gcd(y,x\mod y)& y >0.
\end{cases}
$$



```c
#include <stdio.h>

int gcd( int x, int y );

int main(){
    int x=36, y=8;
    printf("Output: %d\n", gcd(x, y));
    return 0;
}

int gcd( int x, int y ){
    if(y==0) return x;
    if(y>x){
        int t=y;y=x;x=t;
    }
    return gcd(y,x%y);
}
```

    Output: 4


### Newton's method

Let the given number be $b$ and let $x_0$ be a rough guess of the square root of $b$. Newton's method suggests that a better guess, a new $x_{n+1}(n=0,1,\cdots)$ can be computed as follows:
$$ x_{n+1}=\dfrac{1}{2}\left(x_n+\dfrac{b}{x_n}\right)$$

One can start with a number $x_0$ as a rough guess and compute $x_{n+1}$. From $x_{n+1}$, one can generate a even better guess, until two successive guesses are very close, for instance, given $\varepsilon >0$, $|x_{n+1}-x_{n}|<\varepsilon$. Then either one could be considered as the square root of $b$.

<!-- <div align=center>
<img src="nm.jpg" width="20%" height="20%" alt="diagram"/>
</div> -->

It is actually an iterative algorithm, but it can be implemented in recursive functions.


```c
//Using Newton's method to approximate square roots.
#include <stdio.h>
#include <math.h>

double f(double x, double guess, double eps);

int main()
{
    double x=3.0, eps=1e-3;
    printf("Output:\nsqrt(x)=%.3f\n", f(x, 1.0, eps));
  return 0;
}

double f(double x, double guess, double eps){
    double t=(guess+x/guess)/2.0;
    if(fabs(guess*guess-x)<eps){
        return guess;
    }else {
        return f(x,t,eps);
    }
}
```

    Output:
    sqrt(x)=1.732


### Towers of Hanoi
#### Number of steps
$$
hanoi(n)=
\begin{cases}
1 & n=1, \\
2\times hanoi(n-1)+1 & n>1.
\end{cases}
$$
**Proof**

Let $H_n$ denote the number of moves needed to solve the puzzle with $n$ disks.

Begin with $n$ disks on peg $1$(source peg), we can transfer the top $n-1$ disks, following the rules of the puzzle, to peg $2$(auxilary peg) using $H_{n-1}$ moves.

After that, we use $1$ move to transfer the largest disk to peg $3$(target peg). Then we transfer the $n-1$ disks from peg 2 to peg 3 using $H_{n-1}$ additional moves. This cannot be done in fewer steps. Hence,
$$H_n=2H_{n-1}+1$$
The initial condition is $H_1=1$ since a single disk can be transferred from peg 1 to peg 3 in one move.

#### Explicit steps


```c
#include <stdio.h>
enum tower{
    SRC = 0,
    AUX    ,
    TAR    ,
};
void prtMove(char from,char to){
    printf("%c -> %c\n",from,to);
}
void rMove(int n,char src,char aux,char tar){
    if(n==0){
        return;
    }else{
        rMove(n-1,src,tar,aux);
        prtMove(src,tar);
        rMove(n-1,aux,src,tar);
    }
}
int main(){
    int n=3;
    char name[3];
    name[SRC]='a';name[AUX]='b';name[TAR]='c';
    printf("Output:\n");
    printf("Hanoi Tower with %d disks\n----------------------\n",n);
    rMove(n,name[SRC],name[AUX],name[TAR]);
    return 0;
}
```

```
Output:
Hanoi Tower with 3 disks
----------------------
a -> c
a -> b
c -> b
a -> c
b -> a
b -> c
a -> c
```

### Recursive data structure 
#### Linked list


```c
struct node
{
  int data;           // some integer data
  struct node *next;  // pointer to another struct node
};
```


```c
void list_print(struct node *list)
{
    if (list != NULL)               // base case
    {
       printf ("%d ", list->data);  // print integer data followed by a space
       list_print (list->next);     // recursive call on the next node
    }
}
```

## Types
### Tail recursive functions
Tail recursion is a special case of recursion where the calling function does no more computation after making a recursive call.

When we have tail recursion we know that as soon as we return from the recursive call we're going to immediately return as well, so we can skip the entire chain of recursive functions returning and return straight to the original caller.

Examples: `gcd(x,y)`

Examples for normal recursion (non-tail recursion): `fac(n),fib(n)`

### Linear recursive functions and tree recursive functions
#### Linear 
If a recursive function calling itself for one time then it's known as Linear Recursion.
<!-- <div align=center>
<img src="ln.png" width="20%" height="20%" alt="diagram"/>
</div> -->
Examples: `fib(n),gcd(x,y)`

#### Tree

Tree Recursion is a phrase to describe when you make a recursive call more than once in your recursive case. Whenever it is called, the recursive calls branch out and form an upside-down tree. 

For example, in function `fib(n)` which returns the n-th Fibonacci number, there are three parts to consider:

* There are two base cases. (`fib(0)=0,fib(1)=1`)

* Otherwise, the problem is made smaller by breaking it into two sub-problems. (`fib(n)` depends on both `fib(n-1)` and `fib(n-2)`)

* Making two recursive calls to those smaller problems gives us the answer to those smaller problems, and adding up those up gives us the answer to the original problem.

Tree recursive procedures typically take exponential time to compute, but sometimes they can be optimized.

## Other important things about recursion

### Order 

* In the simple case of a function calling itself only once, instructions placed before the recursive call are executed once per recursion before any of the instructions placed after the recursive call. The latter are executed repeatedly after the maximum recursion has been reached

### Recursion versus Iteration

* Performance Issues versus Expressiveness
* Stack space: recursive algorithms tend to require more stack space than iterative algorithms
* Linear recursion and iteration: https://mitpress.mit.edu/sites/default/files/sicp/full-text/sicp/book/node15.html

> In the iterative case, the program variables provide a complete description of the state of the process at any point. If we stopped the computation between steps, all we would need to do to resume the computation is to supply the interpreter with the values of the three program variables.
>
> Not so with the recursive process. In this case there is some additional 'hidden' information, maintained by the interpreter and not contained in the program variables, which indicates 'where the process is' in negotiating the chain of deferred operations. The longer the chain, the more information must be maintained.

* Iteration can be implemented recursively, for example, Newton's method. Note that recursive implementation $\ne$ recursive computation.

# 第六次课
## Two important operations on a list
* Searching
* Sorting

## Searching
### Linear Search
* Scope of application: any lists
* Key point: iteration


```c
//@return the index of key in a ; -1 if not found
int l_search (int key, vector<int>&a) {
    int ret = -1;
    for(auto i : a)
        if(a[i]==key){
            ret = i; break;
        }
    return ret;
}
```

### Binary Search
* Scope of application: **ordered** lists
* Key point: narrowing down the searching scope


```c
rb_search(key, a, 0, a.size()-1);

//recursive function, assuming a is in ascending order
//search range: [start,end] 
int rb_search (int key, int a[], int start, int end) {
    int ret = -1;
    int mid = (end - start >> 1) + start; //avoid overflow in large lists
    
    if(a[mid] == key) ret = mid;
    else if(a[mid] < key) ret = b_search(key,a,mid+1,end);
    else ret = b_search(key,a,start,mid-1);
    
    return ret;
}

//iterative function, assuming a is in ascending order
//search range: [start,end]
int ib_search (int key, int a[], int start, int end) {
    int ret = -1;
    while(start<=end){
        int mid = (end - start >> 1) + start; //avoid overflow in large lists
        if(a[mid]==key){
            ret = mid; break;
        }else if(a[mid]>key)
            end=mid-1;
        else
            start=mid+1;
    }
    return ret;
}
```

### Optimization
#### Refining segmentation
Instead of reducing the interval by half each time, we can divide it into more pieces.


```c
int tri_search(int a[], int start, int end, int key) {
    if (start > end)
        return -1;
    //avoid overflow
    int m1 = start + (end - start) / 3;
    int m2 = end - (end - start) / 3;
    if (a[m1]==key)
        return m1;
    else if (a[m1]>key)
        return tri_search(a,start,m1-1, key);
    else {
        if (a[m2]==key)
            return m2;
        else if (a[m2]>key)
            return tri_search(a,m1+1,m2-1,key);
        else
            return tri_search(a,m2+1,end,key);
    }
}
```

## Sorting
### Bubble Sort
Different types of bubble sort: ascending or descending order; iterating form the beginning or the end

#### Key point
* Steps: Compare adjacent elements and swap them if they're in reverse order
* Target: Move the largest/smallest element to the end/beginning once at a time


```c
//iterate from the beginning to the end of the list
for(int i=0;i<n-1;i++){
    for(int j=0;j<n-i-1;j++){
        if(a[j]>a[j+1])  swap(a[j],a[j+1]);
    }
}
```

### Selection Sort
#### Key point
* Iterate from the beginning
* Select the largest/smallest element, swap it and the current element


```c
for(int i=0;i<n-1;i++){
    int k=i;
    for(int j=i+1;j<n;j++){
        if(a[k]>a[j])   k=j; 
    }
    if(k!=i)  swap(a[k],a[i]);
}
```

### Complexity
Time(Average): $O(n^2)$

## Optimization
### Bubble Sort

#### Break earlier
Sometimes, after swapping some elements, the list is already well-ordered, but the for-loop still goes on. If we can detect the the status of the list and break the loop at proper time, the program will run faster.

If no swapping occurs in the inner loop, elements must be well-ordered.


```c
for(int i=0;i<n-1;i++){
    bool isSwap=false;
    for(int j=0;j<n-i-1;j++){
        if(a[j]>a[j+1]){
            swap(a[j],a[j+1]);
            isSwap=true;
        }
    }
    //no swapping --> well-ordered
    if(!isSwap) break;
}
```

#### Reduce iteration times
We find the last position that swapping occurs, and elements after it must be well-ordered.


```c
//iteration times of the outer loop will not be infected by variable 'new'
//we reduce iteration times of the inner loop using 'new'
for (int i=0;i<n-1;i++){
    int new=0;
    for (int j=0;j<n;j++)
        if (a[j]>a[j+1]){
            swap(a[j],a[j+1];
            new=j+1;
        }
    n=new;
    //new==0 --> no swapping --> well-ordered
    if (n==0)  break;
}
```

#### Two-way Bubble Sort
We sort the elements from two directions simultaneously.


```c
left = 0, right = n-1;
while(left<right){
    for(int i=left;i<=right-1;i++){
        if(a[i]>a[i+1]) swap(a[i], a[i+1]);
    }
    right--;
    
    for(int i=right;i<=left+1;i--){
        if(a[i-1]>a[i]) swap(a[i-1], a[i]);
    }
    left++;
}
```

### Selection Sort
#### Two-way Selection Sort
We sort the elements from two directions simultaneously by finding the maximum and minimum element in just one loop.


```c
left=0, right=n-1;
while(left<right){
    int min=left, max=right;
    for(int i=left;i<=right;i++){
        if (a[i]<a[min])  min=i;
        if (a[i]>a[max])  max=i;
    }
    swap(a[max], a[right]);
    //important special case:
    //after swapping, consider max-element at min-position
    if (min==right)  min=max;
    swap(a[min], a[left]);
    left++, right--;
}
```

# 第七次课
## Insertion Sort
### Basic Idea

* Assume there is a sorted segment, then insert unsorted elements.
* Time complexity: $\Theta (n^2)$


```c
//recursive function
//sort range:[begin,end]
void insertion_sort(int a[],int begin,int end){
    if(begin<end){
       //sort [begin,end-1]  end -> end-1 -> ... -> begin -> ... end
       insertion_sort(a,begin,end-1);
       //[begin,end-1] is sorted
       for(int i=end;i;i--){
           if(a[i]<a[i-1]) swap(a[i],a[i-1]);
           else break;
       }
    }
}

//iterative function
//sort range:[begin,end]
void _insertion_sort(int a[],int begin,int end){
    for(int i=begin;i<end;i++){
        int temp=a[i];
        int j=i-1;
        while(j>=0 && a[j]>temp){
            a[j+1]= a[j];
            j--;
        }
        a[j+1]=temp;
    }
}
```

### Optimization: Binary Insertion Sort

* Use binary search to figure out where to insert
* Still $\Theta (n^2)$, but can save time on comparing.

## Question: Merge two sorted arrays 


```c
//merge array a,b
void merge(int q[], int l, int r) {
    int k = 0, i = l, j = mid + 1;
    while (i <= mid && j <= r)
        if (q[i] <= q[j]) tmp[k ++ ] = q[i ++ ];
        else tmp[k ++ ] = q[j ++ ];
    while (i <= mid) tmp[k ++ ] = q[i ++ ];
    while (j <= r) tmp[k ++ ] = q[j ++ ];
    for (i = l, j = 0; i <= r; i ++, j ++ ) q[i] = tmp[j];
}
```

## Merge Sort

### Basic Idea

* Divide and conquer strategy
* Key point: merge two sorted arrays
* Time complexity:$\Theta (n\log n)$

## Top down

* Divide the unsorted list into sublists
* Sort these sublists
* Repeatedly merge sublists


```c
void merge_sort(int a[],int l,int r){
    if(l >= r) return;
    int mid = l + ((r - l) >> 1);
    
    merge_sort(a,l, mid);
    merge_sort(a,mid + 1, r);
    
    merge(a,l,r,mid);
}
```

### Bottom up


```c
int a[N];

void up_merge_sort(int a[],int n){
    for(int width = 1; width < n; width *= 2){
        //Merge two arrays with length 'width'
        up_merge(...);
    }
}
```

## Quick Sort

### Basic Idea

* Yet another example of divide and conquer strategy
* Key Point: Choose a pivot, then move `a[i]` to its left if `a[i] < pivot`, to its right if `a[i] > pivot`
* Time complexity: $\Theta (n\log n)$ on average

### Partition

* Lomuto partition scheme: `pivot = a[len-1]`
* Hoare partition scheme
* Other choices

### How to choice a better pivot

* Ideal pivot can partition array into even halves
* Randomly choose one is a good idea

### Model


```c
void quick_sort(int q[], int l, int r){
    if (l >= r) return;
    int i = l - 1, j = r + 1;
    int pivot = select_pivot(q,l,r); //choose the pivot as you want
    while (i < j){
        do i ++ ; while (q[i] < pivot);
        do j -- ; while (q[j] > pivot);
        if (i < j) swap(q[i], q[j]);
    }
    quick_sort(q, l, j);
    quick_sort(q, j + 1, r);
}
```

### Use `qsort` in `stdlib.h`
`void qsort(void *base, size_t nel, size_t width, int (*compar)(const void *, const void *));`


*After class...*

## 比较排序算法的速度

* `run.sh`编译运行C程序
* 程序1生成随机数
* 程序2读取随机数进行排序，并计算排序时间
* 程序3验证排序是否有效
* 得到结果`result.txt

`run.sh`:

```bash
#! /bin/bash
rm -f *.txt
rm -f *.out

echo "Test:" >> result.txt
echo "Mode 1-bubble 2-selection 3-insertion 4-merge 5-quicksort 6-library-quicksort" >> result.txt
i=10
while(($i<1000));
do 
    gcc data.c -o create.out -DDATA_NUM=$((i*1000)) -w
    ./create.out
    for((j=1;j<=6;j++));
    do
    gcc sort.c -o  run.out -DDATA_NUM=$((i*1000)) -DMODE=${j} -w
    echo -e "$((i*1000)) ${j} \c" >> result.txt
    ./run.out >> result.txt
    # gcc verify.c  -o verify.out -w
    # ./verify.out >> result.txt
    done
    i=`expr $i + 10`
done
```

# 第八次课
## 算法分析

* 程序执行速度可能与不同的测试数据有关
* 当数据规模增大时，有些算法性能会大幅下降

### 复杂度

* $N$表示输入数据的规模
* 研究程序运行时间与$N$的关系

**以选择排序为例:**

排好第$1$个位置的元素需要$N$次循环，第$2$个位置的元素需要$N-1$次循环，以此类推。算法运行时间大约与$\displaystyle \sum^N_{k=0}k=\dfrac{n^2+n}{2}$成正比。
除了循环次数之外，循环内部的代码也会影响运行时间，影响基本上是线性的，即$T(n)=tf(n)$,很多时候降低$f(n)$的复杂度级别能更好地优化算法。

### Big-O Notation

$\exists M,x_0>0,\forall x>x_0, |f(x)|\le M|g(x)|$,即$f(x)=O(g(x))$.常用大O表示法表示时间复杂度。

常见：$O(\log n),O(n),O(n\log n),O(n^k)$

## 测量程序运行时间

* `time( )`
* `gettimeofday( )`
* `time + command` in `Unix` OS
* Not accurate

## 早期程序

* 程序：就是一连串机器指令
* 控制结构：跳转 --> 流程图可以很好地表达早期程序，但不适合表示现在的程序

## 结构化程序设计

* 以控制结构为单位，单一出入口（慎用`goto`!),能顺序阅读程序文本
* 程序的静态描述与控制流程建立对应

### 表达式和语句的区别

* 表达式会产生一个值，而语句不会。
* 表达式可以嵌套在别的表达式中，但语句不行。语句只能独立出现。


## 内存分配方式

* 全局数据区：内存中位于较低位置;global,static global/local
* 堆：大约中间位置;allocated;dynamic
* 栈：较高位置;local;auto-dynamic

**`static`:**

* `static` in static global: access control
* `static` in static local: storage; 存储是全局的，访问是局部的