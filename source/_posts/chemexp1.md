---
title: 茶叶中氟含量的测定
date: 2020-6-12 19:26:00
category: 化学
tags: 实验课
---

<script type="text/javascript" src="/js/config.js" defer></script>
<script id="Mathjax-script" type="text/javascript" defer src="/js/mathjax/tex-svg.js?config=TeX-MML-AM_CHTML"></script>

<!--more-->

## 实验目的
1. 掌握电位法测定物质浓度的原理
2. 了解$\ce{F-}$选择性电极的工作原理
3. 学习标准曲线法、标准加入法测定物质浓度
4. 掌握酸度计（电位计）、磁力搅拌器、$\ce{F-}$选择电极的使用方法等

## 实验原理


实验装置： （-） $\ce{Hg2Cl2}$(甘汞)电极 || 试样 | $\ce{F-}选择电极(+)

![img/20200612201007_304ba6dc44ae65cabe8d6921f7bc5a9a.png](http://api.zypan.ltd/img/20200612201007_304ba6dc44ae65cabe8d6921f7bc5a9a.png)

由Nernst方程，有 $$ E_x=E_0 - 0.059 \lg \alpha (F^-) \approx E_0 - k \lg c(F^-) $$
其中，$\alpha = \gamma\cdot c$, $\alpha$为活度，可以理解为有效浓度，$\gamma$为活度系数，稀溶液中用浓度近似表示活度。

可见电池电动势$E_x$与$pF (c(F^-)=10^{-pF})$成线性关系，因此测得电动势即可求得氟离子的浓度。

作图时由于横坐标为$pF$，溶液浓度的跨度很大，为了保证测量的时候实验条件相对一致（特别是要保持活度系数基本不变），需要向溶液中加入总离子强度调节缓冲液（Total Ion Strength Adjustment Buffer, TISAB）。

TISAB: 包含$\ce{NaCl}$（较多），$\ce{HAc-NaAc}$（防止$\ce{F-}$在强酸性条件下与$\ce{H+}$结合成分子或在强碱性条件下发生水解，保证$\ce{F-}$以简单离子的形式存在）和柠檬酸钠（掩蔽其他离子）。

## 主要仪器和药品

1. 仪器

酸度计（pH计）、磁力搅拌器、电炉、复合氟离子选择电极

2. 药品

$0.1 \mathrm{mol/L} \ce{NaF}$,TISAB溶液，市售茶叶

## 实验内容

1. 茶叶处理

称取 $2.00\mathrm{g}$茶叶+$40 \mathrm{mL}$去离子水煮沸，冷却后，用棉花或卫生纸过滤（不用滤纸的原因：茶叶中的胶质会堵住滤纸），定容至$50\mathrm{mL}$。移取$25\mathrm{mL}$茶水+$5\mathrm{mL}$TISAB，定容至$50\mathrm{mL}$

2. 配置系列标准溶液（定容至$50\mathrm{mL}$，逐级稀释）

| Series | $\ce{NaF}$ Solution |    TISAB    |             $c(F^-)$             |
| ------ | :-----------------: | :---------: | :------------------------------: |
| 1#     |   5mL $0.1\mathrm{mol/L} \  \ce{F-}$   |  5mL TISAB  | $10^{-2} \mathrm{mol/L} \ \ce{F-}$ |
| 2#     |       5mL 1#        | 4.5mL TISAB | $10^{-3} \mathrm{mol/L} \ \ce{F-}$ |
| 3#     |       5mL 2#        | 4.5mL TISAB | $10^{-4} \mathrm{mol/L} \ \ce{F-}$ |
| 4#     |       5mL 3#        | 4.5mL TISAB | $10^{-5} \mathrm{mol/L} \ \ce{F-}$ |
| 5#     |       5mL 4#        | 4.5mL TISAB | $10^{-6} \mathrm{mol/L} \ \ce{F-}$   |
| 另：   |     45mL Water      |  5mL TISAB  |                \                 |

