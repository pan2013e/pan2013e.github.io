function calcPageHeight(doc) {
    var cHeight = Math.max(doc.body.clientHeight, doc.documentElement.clientHeight)
    var sHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight)
    var height = Math.max(cHeight, sHeight)
    return height
}
var ifr = document.getElementById('main')
ifr.onload = function () {
    ifr.style.height = '0px';
    var iDoc = ifr.contentDocument || ifr.document
    var height = calcPageHeight(iDoc)
    if (height < 850) {
        height = 850;
    }
    ifr.style.height = height + 'px'
}
