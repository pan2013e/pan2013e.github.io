---
title: "CATCODER: Repository-Level Code Generation with Relevant Code and Type Context"
layout: paper
tags:
  - paper
type: journal
venue: TOSEM
selected: true
authors: "<b>Zhiyuan Pan</b>, Xing Hu, Xin Xia, Xiaohu Yang"
date: 2025-11-14 00:00:00
---

### Abstract

Large language models (LLMs) have demonstrated remarkable capabilities in code generation tasks. However, repository-level code generation presents unique challenges, particularly due to the need to utilize information spread across multiple files within a repository. Specifically, successful generation depends on a solid grasp of both general, context-agnostic knowledge and specific, context-dependent knowledge. While LLMs are widely used for the context-agnostic aspect, existing retrieval-based approaches sometimes fall short as they are limited in obtaining a broader and deeper repository context. In this paper, we present CatCoder, a novel code generation framework designed for statically typed programming languages. CatCoder enhances repository-level code generation by integrating relevant code and type context. Specifically, it leverages static analyzers to extract type dependencies and merges this information with retrieved code to create comprehensive prompts for LLMs. To evaluate the effectiveness of CatCoder, we adapt and construct benchmarks that include 199 Java tasks and 90 Rust tasks. The results show that CatCoder outperforms the RepoCoder baseline by up to 14.44% and 17.35%, in terms of compile@𝑘 and pass@𝑘 scores. In addition, the generalizability of CatCoder is assessed using various LLMs, including both code-specialized models and general-purpose models. Our findings indicate consistent performance improvements across all models, which underlines the practicality of CatCoder. Furthermore, we evaluate the time consumption of CatCoder in a large open source repository, and the results demonstrate the scalability of CatCoder.


**Cite as**

```bibtex
TO BE ADDED AFTER PUBLICATION
```

### Links

TO BE ADDED AFTER PUBLICATION
