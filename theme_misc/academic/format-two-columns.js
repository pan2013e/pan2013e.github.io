let breaks = ['H1', 'H2', 'H3', 'H4'];
let toLeft = ['H3'];
let toRight = ['H1', 'H2', 'H4'];
let footnotes = document.querySelectorAll('.footnote-item');
let elements = document.querySelector('.rendered').childNodes;
let page = document.querySelector('.page');
let segments = [];
let segment = [];
let lastElement = '';
for (let element of elements) {
    if (breaks.includes(element.tagName) && segment.length > 0 && !breaks.includes(lastElement)) {
        segments.push(segment);
        segment = [element];
    } else {
        segment.push(element);
    }
    if (element.tagName) lastElement = element.tagName;
}
segments.push(segment);
for (let segment of segments) {
    let left = document.createElement('div');
    let right = document.createElement('div');
    let sideFootnotes = document.createElement('div');
    let bottomFootnotes = document.createElement('div');
    left.classList.add('left');
    right.classList.add('right');
    sideFootnotes.classList.add('footnotes-side');
    bottomFootnotes.classList.add('footnotes-bottom');
    let addedFootnotes = [];
    for (let element of segment) {
        if (breaks.includes(element.tagName)) {
            if (toLeft.includes(element.tagName)) {
                left.appendChild(element);
            } else {
                right.appendChild(element);
                let h3 = document.createElement(element.tagName);
                h3.innerHTML = '&nbsp';
                left.appendChild(h3);
            }
        } else {
            right.appendChild(element);
            if (element.querySelectorAll) {
                let fnLinks = element.querySelectorAll('.footnote-ref');
                for (let link of fnLinks) {
                    let targetId = link.childNodes[0].getAttribute("href");
                    let refNumber = link.childNodes[0].innerHTML + ' ';
                    let subnum = link.childNodes[0].innerHTML.match(/:[0-9]+/g);
                    if (subnum && subnum.length > 0) {
                        link.childNodes[0].innerHTML = link.childNodes[0].innerHTML.replace(subnum[0], '');
                    }
                    if (!addedFootnotes.includes(targetId)) {
                        addedFootnotes.push(targetId);
                        let footnote = document.querySelector(targetId).childNodes[0].cloneNode(true);
                        footnote.classList.add('footnote')
                        footnote.id = targetId.replace('#', '');
                        footnote.prepend(refNumber);
                        sideFootnotes.appendChild(footnote);
                        bottomFootnotes.appendChild(footnote.cloneNode(true));
                    }
                }
            }
        }
        left.appendChild(sideFootnotes);
        right.appendChild(bottomFootnotes);
        page.appendChild(left);
        page.appendChild(right);
    }
}
document.querySelector('.rendered').remove();