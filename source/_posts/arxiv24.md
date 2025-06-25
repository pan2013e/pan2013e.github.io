---
title: Enhancing Repository-Level Code Generation with Integrated Contextual Information
layout: paper
tags:
  - paper
type: preprint
venue: arXiv:2406.03283
authors: "<b>Zhiyuan Pan</b>, Xing Hu, Xin Xia, Xiaohu Yang"
date: 2024-06-05 00:00:00
---

### Abstract

Large language models (LLMs) have demonstrated remarkable capabilities in code generation tasks. However, repository-level code generation presents unique challenges, particularly due to the need to utilize information spread across multiple files within a repository. Existing retrieval-based approaches sometimes fall short as they are limited in obtaining a broader and deeper repository context. In this paper, we present CatCoder, a novel code generation framework designed for statically typed programming languages. CatCoder enhances repository-level code generation by integrating relevant code and type context. Specifically, it leverages static analyzers to extract type dependencies and merges this information with retrieved code to create comprehensive prompts for LLMs. To evaluate the effectiveness of CatCoder, we adapt and construct benchmarks that include 199 Java tasks and 90 Rust tasks. The results show that CatCoder outperforms the RepoCoder baseline by up to 17.35%, in terms of pass@k score. Furthermore, the generalizability of CatCoder is assessed using various LLMs, including both code-specialized models and general-purpose models. Our findings indicate consistent performance improvements across all models, which underlines the practicality of CatCoder.


**Cite as**

```bibtex
@misc{pan2024enhancingrepositorylevelcodegeneration,
  title={{Enhancing Repository-Level Code Generation with Integrated Contextual Information}}, 
  author={Zhiyuan Pan and Xing Hu and Xin Xia and Xiaohu Yang},
  year={2024},
  eprint={2406.03283},
  archivePrefix={arXiv},
  primaryClass={cs.SE},
  url={https://arxiv.org/abs/2406.03283}, 
}
```

### Links
[Full text (arXiv)](https://arxiv.org/abs/2406.03283)
