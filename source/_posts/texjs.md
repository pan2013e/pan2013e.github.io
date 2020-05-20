---
title: LaTeX在Hexo中的实现
date: 2020-5-14 19:00:00
updated: 2020-5-20 17:39:00
tags: LaTeX
---

<script type="text/javascript"src="https://i.upmath.me/latex.js "></script>

为了支持更多的LaTeX功能，我更换了Hexo自带的Mathjax组件，使用`latex.js`。
<!--more-->
## latex.js

原理和源代码可查看这个GitHub repo：[upmath.me](https://github.com/parpalak/upmath.me)

作者：Roman Parpalak

## 使用效果
The editor converts LaTeX equations in double-dollars: 

{% raw %} $$<center> ax^2+bx+c=0 $$ <center/>{% endraw %} .

 All equations are rendered as block equations. If you need inline ones, you can add the prefix `\inline`:{% raw %} $$ \inline p={1\over q} $$ {% endraw %} . But it is a good practice to place big equations on separate lines:

{% raw %} $$ x_{1,2} = {-b\pm\sqrt{b^2 - 4ac} \over 2a}. $$ {% endraw %} 

In this case the LaTeX syntax will be highlighted in the source code. You can even add equation numbers (unfortunately there is no automatic numbering and refs support):

{% raw %} $$ |\vec{A}|=\sqrt{A_x^2 + A_y^2 + A_z^2}. $$  {% endraw %} 

It is possible to write Cyrillic symbols in `\text` command: {% raw %} $$ Q_\text{плавления}>0 $$ {% endraw %} .

One can use matrices:

{% raw %} $$ T^{\mu\nu}=\begin{pmatrix}
\varepsilon&0&0&0\\
0&\varepsilon/3&0&0\\
0&0&\varepsilon/3&0\\
0&0&0&\varepsilon/3
\end{pmatrix}, $$ {% endraw %} 

integrals:

{% raw %} $$ P_\omega={n_\omega\over 2}\hbar\omega\,{1+R\over 1-v^2}\int\limits_{-1}^{1}dx\,(x-v)|x-v|, $$ {% endraw %} 

cool tikz-pictures:
{% raw %}$$ 
\usetikzlibrary{decorations.pathmorphing}
\begin{tikzpicture}[line width=0.2mm,scale=1.0545]\small
\tikzset{>=stealth}
\tikzset{snake it/.style={->,semithick,
decoration={snake,amplitude=.3mm,segment length=2.5mm,post length=0.9mm},decorate}}
\def\h{3}
\def\d{0.2}
\def\ww{1.4}
\def\w{1+\ww}
\def\p{1.5}
\def\r{0.7}
\coordinate[label=below:$A_1$] (A1) at (\ww,\p);
\coordinate[label=above:$B_1$] (B1) at (\ww,\p+\h);
\coordinate[label=below:$A_2$] (A2) at (\w,\p);
\coordinate[label=above:$B_2$] (B2) at (\w,\p+\h);
\coordinate[label=left:$C$] (C1) at (0,0);
\coordinate[label=left:$D$] (D) at (0,\h);
\draw[fill=blue!14](A2)--(B2)-- ++(\d,0)-- ++(0,-\h)--cycle;
\draw[gray,thin](C1)-- +(\w+\d,0);
\draw[dashed,gray,fill=blue!5](A1)-- (B1)-- ++(\d,0)-- ++(0,-\h)-- cycle;
\draw[dashed,line width=0.14mm](A1)--(C1)--(D)--(B1);
\draw[snake it](C1)--(A2) node[pos=0.6,below] {$c\Delta t$};
\draw[->,semithick](\ww,\p+0.44*\h)-- +(\w-\ww,0) node[pos=0.6,above] {$v\Delta t$};
\draw[snake it](D)--(B2);
\draw[thin](\r,0) arc (0:atan2(\p,\w):\r) node[midway,right,yshift=0.06cm] {$\theta$};
\draw[opacity=0](-0.40,-0.14)-- ++(0,5.06);
\end{tikzpicture}$$
{% endraw %}

plots:

{% raw %}$$
\begin{tikzpicture}[scale=1.0544]\small
\begin{axis}[axis line style=gray,
	samples=120,
	width=9.0cm,height=6.4cm,
	xmin=-1.5, xmax=1.5,
	ymin=0, ymax=1.8,
	restrict y to domain=-0.2:2,
	ytick={1},
	xtick={-1,1},
	axis equal,
	axis x line=center,
	axis y line=center,
	xlabel=$x$,ylabel=$y$]
\addplot[red,domain=-2:1,semithick]{exp(x)};
\addplot[black]{x+1};
\addplot[] coordinates {(1,1.5)} node{$y=x+1$};
\addplot[red] coordinates {(-1,0.6)} node{$y=e^x$};
\path (axis cs:0,0) node [anchor=north west,yshift=-0.07cm] {0};
\end{axis}
\end{tikzpicture}$$
{% endraw %}

and [the rest of LaTeX features](https://en.wikibooks.org/wiki/LaTeX/Mathematics).