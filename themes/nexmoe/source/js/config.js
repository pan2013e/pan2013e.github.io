window.MathJax = {
  loader: {
    load: ['[tex]/mhchem']
  },
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    packages: { '[+]': ['mhchem'] }
  },
  svg: {
    fontCache: 'global'
  },
  options: {
    renderActions: {
      addMenu: [0, '', '']
    }
  }
};