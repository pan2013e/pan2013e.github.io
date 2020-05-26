---
title: 化竞笔记（部分）分享
date: 2020-5-26 23:15:00
---

今天翻出来的陈年笔记。可能是之前某个培训机构提供的，然后经过我的轻度整合而成的文档。

<!--more-->
<script>
  // 计算页面的实际高度，iframe自适应会用到
  function calcPageHeight(doc) {
      var cHeight = Math.max(doc.body.clientHeight, doc.documentElement.clientHeight)
      var sHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight)
      var height  = Math.max(cHeight, sHeight)
      return height
  }
  //根据ID获取iframe对象
  var ifr = document.getElementById('main')
  ifr.onload = function() {
  	  //解决打开高度太高的页面后再打开高度较小页面滚动条不收缩
  	  ifr.style.height='0px';
      var iDoc = ifr.contentDocument || ifr.document
      var height = calcPageHeight(iDoc)
      if(height < 850){
      	height = 850;
      }
      ifr.style.height = height + 'px'
  }
</script>

{% raw %}
<div class="main_page">
	 <iframe scrolling="no" id="main" name="main" frameborder="0"  src="https://onedrive.live.com/embed?cid=10F462EA2A75DD72&resid=10F462EA2A75DD72%213264&authkey=AE5qRN-fbSJwoIQ&em=2" style="min-height:600px;width:100%;height:100%;"></iframe>
</div>
{% endraw %}