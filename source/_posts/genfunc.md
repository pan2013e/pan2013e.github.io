---
title: 生成函数解组合数学题
date: 2020-6-4 20:40:00
category: 数学
tags: discrete
---

<script type="text/javascript" src="/js/config.js" defer></script>
<script id="Mathjax-script" type="text/javascript" defer src="/js/mathjax/tex-svg.js"></script>
<!--more-->

## 生成函数（母函数）

对于数列 ${a_n}$，生成函数为$\displaystyle G(x)=\sum^\infty_{k=0} a_k x^k.$

## 生成函数的性质

在离散数学的研究中不考虑幂级数的收敛问题。生成函数是幂级数的和函数，自然满足幂级数的相关性质。

一些重要的性质有:

$ \displaystyle\sum^\infty_{k=0}ka_kx^k=x\sum^\infty_{k=0}a_k(x^k)'=x(\sum^\infty_{k=0}a_kx^k)':=xf'(x) $

柯西乘积:$ \displaystyle (\sum^\infty_{k=0}b_kx^k(\sum^\infty_{k=0}a_kx^k):=f(x)g(x)=\sum^\infty_{k=0}(\sum^k_{j=0}a_jb_{k-j})x^k $

## 计数问题
### Ex.1 不定方程解的个数

**$e_1,e_2,e_3\in \mathbb{N}, 2\le e_1\le 5,3\le e_2\le 6,4\le e_3\le 7.$求不定方程$e_1+e_2+e_3=17$的解的的个数.**

可以利用隔板法求解，也可以利用生成函数.$G(x)=(x^2+\cdot +x^5)(x^3+\cdot +x^6)(x^4+\cdot +x^7).$其中第$i$个括号表示$e_i$的可选情况，求上述方程解的个数，就相当于寻找展开式中$x^{17}$的系数。

### Ex.2 排列组合问题

**寻找从$n$个元素中选出$r$个元素（允许重复）的种类个数。**

这个问题相当于从$n$类**充分供应**的对象中选出$r$个。由于允许重复，即每一个元素可被选择任意次，那么生成函数可写为
\[G(x)=(1+x+x^2+\cdots)^n=\dfrac{1}{(1-x)^n}=\sum^\infty_{k=0}\binom{k}{n+k-1}x^k.\]
答案应为$x^r$前系数$\displaystyle\binom{r}{n+r-1}.$

如果不允许重复，那么每个元素只有被选和不被选之分，生成函数为$G(x)=(1+x)^n.$

**在红球，蓝球，白球各$2r$个的集合中，选择$3r$个球的种类个数**

生成函数: $G(x)=(1+x+x^2+\cdots+x^{2r})^3$

类似地，还有**给定一些面值的硬币，凑到指定数目的种类个数**，不过要注意的是,在这样的问题中，$x$的指数不一定按$1$递增。

### Ex.3 解递推方程

\[a_n=2a_{n-1}+3a_{n-2}+4^n+6,a_0=20,a_1=60.\]

首先两边同乘$x^n$,然后作和，注意求和时变量的起始值不能让数列的下标越界，有

\[\sum^\infty_{n=2}a_nx^n=2\sum^\infty_{n=2}a_{n-1}x^n+3\sum^\infty_{n=2}a_{n-2}x^n+\sum^\infty_{n=2}4^nx^n+6\sum^\infty_{n=2}x^n\]

然后对各项求和，凑出包含$G(x)$的式子。根据$\displaystyle G(x)=\sum^\infty_{n=0}a_nx^n$倒推出$a_n$就完成了解答。