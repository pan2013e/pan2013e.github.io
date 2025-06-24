---
title: "Reasoning Runtime Behavior of a Program with LLM: How Far Are We?"
layout: paper
tags:
  - paper
type: conference
venue: ICSE'25
authors: "Junkai Chen*, <b>Zhiyuan Pan</b>*, Xing Hu, Zhenhao Li, Ge Li, Xin Xia<br><small>* Equal Contribution</small>"
date: 2025-06-24 21:08:39
---

### Abstract

Large language models for code (i.e., code LLMs) have shown strong code understanding and generation capabilities. To evaluate the capabilities of code LLMs in various aspects, many benchmarks have been proposed (e.g., HumanEval and ClassEval). Code reasoning is one of the most essential abilities of code LLMs, but existing benchmarks for code reasoning are not sufficient. Typically, they focus on predicting the input and output of a program, ignoring the evaluation of the intermediate behavior during program execution, as well as the logical consistency (e.g., the model should not give the correct output if the prediction of execution path is wrong) when performing the reasoning. To address these problems, in this paper, we propose a framework, namely REval, for evaluating code reasoning abilities and consistency of code LLMs with program execution. We utilize existing code benchmarks and adapt them to new benchmarks within our framework. A large-scale empirical study is conducted and most LLMs show unsatisfactory performance on both Runtime Behavior Reasoning (i.e., an average accuracy of 44.4%) and Incremental Consistency Evaluation (i.e., an average IC score of 10.3). Evaluation results of current code LLMs reflect the urgent need for the community to strengthen the code reasoning capability of code LLMs. Our code, data, and REval leaderboard are available at [this https URL](https://r-eval.github.io/).

**Cite as**
*Reference to paper*

### Links
[Full text (PDF)](/files/link_to_file.pdf) [(Arxiv)](https://arxiv.org/abs/arxiv_doi)
[Supplimentary materials (ZIP)](/files/link_to_file.zip)
[Source code (Github)](https://github.com/)