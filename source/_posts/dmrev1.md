---
title: 组合数学（离散数学及其应用）
date: 2020-5-28 10:37:00
category: 数学
tags: discrete
---

<script type="text/javascript" src="/js/config.js" defer></script>
<script id="Mathjax-script" type="text/javascript" defer src="/js/mathjax/tex-svg.js"></script>

<!--more-->

## 基本计数原理
* 加法原理
* 乘法原理
* 减法原理(容斥原理)
  
  $$ |A_1 \cup A_2| = |A_1|+|A_2|-|A_1\cap A_2|$$

  $$ |\overline{A}\cap\overline{B}|=|U|-|A\cup B|=|U|-(|A|+|B|-|A\cap B|)$$

* 除法原理
* 树图

## 鸽巢原理（抽屉原理）

**Theorem 1. Pigeon Hole Principle(a.k.a. Dirichlet Drawer Principle)**

$k>0,k\in \mathbb{N}$. $k+1$ or more objects are placed into $k$ boxes, then there is at least one box containing two or more of the objects.

* Key point: figure out the pigeons and the pigeonholes in a particular problem.
  
**Theorem 2. Generalized Pigeon Hole Principle**

If $N$ objects are placed into $k$ boxes, then there is at least one box containing at least $\lceil N/k \rceil$ objects.

**Corollary.** 

The minimum number of objects such that at least $r$ of these objects must be in one of $k$ boxes when these objects are distributed among the boxes: 
$$ N = k(r-1)+1$$

## 排列
$r-$permutation： $P(n,r)=\dfrac{n!}{(n-r)!}$, a.k.a. $A^r_n$

* $P(n,0)=1$
* $P(n,n)=n!$

## 组合
$r-$combination： $C(n,r)=\displaystyle\binom{n}{r}=\dfrac{n!}{r!(n-r)!}$, a.k.a. $C^r_n$

**Corollary.**

$n,r>0. n,r\in \mathbb{N}, r\le n.$ Then $C(n,r)=C(n,n-r)$

## 组合证明
* Bijective Proof
* Double Counting Proof

## 二项式定理

**Theorem 1. The Binomial Theorem**

$n>0, n\in \mathbb{N}. $ Then $(x+y)^n=\displaystyle\sum^n_{j=0}\binom{n}{j}x^{n-j}y^j.$

**Corollaries.**
In $(x+y)^n$ , assign different values to $x$ and $y$,

$$\sum^n_{k=0}\binom{n}{k}=2^n\\
\sum^n_{k=0}(-1)^k\binom{n}{k}=0\\
\sum^n_{k=0}2^k\binom{n}{k}=3^n
$$

**Theorem 2. Pascal's Identity**

$n,k>0. n,k\in \mathbb{N}, k\le n.$ Then, $\displaystyle\binom{n+1}{k}=\binom{n}{k-1}+\binom{n}{k}.$

**Theorem 3. Vandermonde's Identity**

$m,n,r>0,m,n,r\in \mathbb{N}. r\le m,r\le n.$ Then 
$$\binom{m+n}{r}=\sum^r_{k=0}\binom{m}{r-k}\binom{n}{k}.$$

**Corollary.**

$n>0,n\in \mathbb{N}.$ Then $\displaystyle\binom{2n}{n}=\sum^n_{k=0}\binom{n}{k}^2.$

$Theorem 4.$

$n,r>0,n,r\in \mathbb{N}.r\le n.$ Then $\displaystyle\binom{n+1}{r+1}=\sum^n_{j=r}\binom{j}{r}.$

## 广义排列组合
