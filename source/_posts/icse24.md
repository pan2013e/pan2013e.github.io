---
title: "PPT4J: Patch Presence Test for Java Binaries"
layout: paper
tags:
  - paper
type: conference
venue: ICSE'24
selected: true
authors: "<b>Zhiyuan Pan</b>, Xing Hu, Xin Xia, David Lo, Xiaohu Yang"
date: 2024-04-14 00:00:00
---

### Abstract

The number of vulnerabilities reported in open source software has increased substantially in recent years. Security patches provide the necessary measures to protect software from attacks and vulnerabilities. In practice, it is difficult to identify whether patches have been integrated into software, especially if we only have binary files. Therefore, the ability to test whether a patch is applied to the target binary, a.k.a. patch presence test, is crucial for practitioners. However, it is challenging to obtain accurate semantic information from patches, which could lead to incorrect results.

In this paper, we propose a new patch presence test framework named PPT4J (**P**atch **P**resence **T**est **for** **J**ava Binaries). PPT4J is designed for open-source Java libraries. It takes Java binaries (i.e. bytecode files) as input, extracts semantic information from patches, and uses feature-based techniques to identify patch lines in the binaries. To evaluate the effectiveness of our proposed approach PPT4J, we construct a dataset with binaries that include 110 vulnerabilities. The results show that PPT4J achieves an F1 score of 98.5% with reasonable efficiency, improving the baseline by 14.2%. Furthermore, we conduct an in-the-wild evaluation of PPT4J on JetBrains IntelliJ IDEA. The results suggest that a third-party library included in the software is not patched for two CVEs, and we have reported this potential security problem to the vendor.

**Cite as**

```bibtex
@inproceedings{10.1145/3597503.3639231,
  author = {Pan, Zhiyuan and Hu, Xing and Xia, Xin and Lo, David and Yang, Xiaohu},
  title = {{PPT4J: Patch Presence Test for Java Binaries}},
  year = {2024},
  isbn = {9798400702174},
  publisher = {Association for Computing Machinery},
  address = {New York, NY, USA},
  url = {https://doi.org/10.1145/3597503.3639231},
  doi = {10.1145/3597503.3639231},
  booktitle = {Proceedings of the IEEE/ACM 46th International Conference on Software Engineering},
  articleno = {225},
  numpages = {12},
  keywords = {patch presence test, binary analysis, software security},
  location = {Lisbon, Portugal},
  series = {ICSE '24}
}
```

### Links
[Full text (PDF)](/assets/icse24.pdf)
[Talk (PDF)](/assets/icse24_talk.pdf)
[Source code (Github)](https://github.com/pan2013e/ppt4j)