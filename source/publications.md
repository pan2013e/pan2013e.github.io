---
title: Publications
layout: post
permalink: /publications/
---

### Timeline

{% publist pubs %}
version: 2
pub_dir: assets
show_unpublished: true
highlight_authors: ["Zhiyuan Pan"]
extra_filters:
- name: Category
  path: conf.cat
venues:
  arXiv:
    category: Preprints
    occurrences:
    - key: arXiv-all
      matches: ^arXiv:(.+)$
      name: arXiv
      url: https://arxiv.org/abs/$1
  ICSE:
    category: Conferences
    occurrences:
    - key: ICSE'24
      name: The 46th International Conference on Software Engineering
      date: 2024-04-14
      url: https://conf.researchr.org/home/icse-2024
    - key: ICSE'25
      name: The 47th International Conference on Software Engineering
      date: 2025-04-27
      url: https://conf.researchr.org/home/icse-2025
{% endpublist %}