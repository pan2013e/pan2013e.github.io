---
title: Re-Evaluating Code LLM Benchmarks Under Semantic Mutation
layout: paper
tags:
  - paper
type: preprint
venue: arXiv:2506.17369
authors: "<b>Zhiyuan Pan</b>, Xing Hu, Xin Xia, Xiaohu Yang"
date: 2025-06-24 23:05:22
---

### Abstract

In the era of large language models (LLMs), code benchmarks have become an important research area in software engineering and are widely used by practitioners. These benchmarks evaluate the performance of LLMs on specific code-related tasks, such as code understanding and generation. A critical step in constructing code benchmarks is the design of prompts. However, as existing code benchmarks typically rely on a single prompt template per task, they are prone to the issue of prompt sensitivity, where minor prompt variations could result in substantial performance variations, leading to unreliable evaluations of model capabilities.

While previous studies have explored prompt sensitivity, their experimental designs and findings are limited to traditional natural language processing (NLP) tasks. In this paper, we present an empirical study to investigate prompt sensitivity in code benchmarks. We first propose a general framework that modifies prompt templates in a manner that preserves both their semantics and their structure as much as possible. Based on the framework, we conduct extensive experiments across eight code benchmark tasks on 10 representative open-source LLMs, with each task featuring 100 semantically similar prompt templates. We then analyze the evaluation results using various statistical metrics, focusing on both absolute and relative model performance. Our findings suggest that even slight prompt variations can lead to significant shifts in performance. Additionally, we observe that such variations can introduce inconsistencies in the performance rankings across different models. These insights highlight the need for considering prompt sensitivity when designing future code benchmarks, to ensure more reliable and accurate evaluation of LLM capabilities.

**Cite as**

```bibtex
@misc{pan2025reevaluatingcodellmbenchmarks,
  title={{Re-Evaluating Code LLM Benchmarks Under Semantic Mutation}}, 
  author={Zhiyuan Pan and Xing Hu and Xin Xia and Xiaohu Yang},
  year={2025},
  eprint={2506.17369},
  archivePrefix={arXiv},
  primaryClass={cs.SE},
  url={https://arxiv.org/abs/2506.17369}, 
}
```

### Links
[Full text (arXiv)](https://arxiv.org/abs/2506.17369)
