/* Re-parents rendered markdown into the page's two-column margin layout.

   The source document is a flat run of nodes inside .rendered. This splits it
   at headings into segments, and for each segment emits a `.left` / `.right`
   pair: `.left` holds the section heading (in the margin) plus any footnotes
   referenced by that segment, `.right` holds the body.

   `h2` goes to the margin; everything else stays in the body column with a
   blank spacer heading opposite it so the baselines line up. */

const BREAKS = ['H1', 'H2', 'H3', 'H4'];
const TO_MARGIN = ['H2'];

const container = document.querySelector('.rendered');
const page = document.querySelector('.page');
// Generated columns go before the footer, not at the end of .page. This script
// is loaded after the footer partial so the anchor exists by the time it runs.
const anchor = page ? page.querySelector('.site-footer') : null;
const place = (el) => (anchor ? page.insertBefore(el, anchor) : page.appendChild(el));

if (container && page) {
    // childNodes is live, so snapshot before moving anything.
    const nodes = Array.from(container.childNodes);

    const segments = [];
    let segment = [];
    let lastTag = '';

    for (const node of nodes) {
        if (BREAKS.includes(node.tagName) && segment.length > 0 && !BREAKS.includes(lastTag)) {
            segments.push(segment);
            segment = [node];
        } else {
            segment.push(node);
        }
        if (node.tagName) lastTag = node.tagName;
    }
    segments.push(segment);

    for (const nodesInSegment of segments) {
        const left = document.createElement('div');
        const right = document.createElement('div');
        const sideFootnotes = document.createElement('div');
        const bottomFootnotes = document.createElement('div');

        left.classList.add('left');
        right.classList.add('right');
        sideFootnotes.classList.add('footnotes-side');
        bottomFootnotes.classList.add('footnotes-bottom');

        const seen = [];

        for (const node of nodesInSegment) {
            if (BREAKS.includes(node.tagName)) {
                if (TO_MARGIN.includes(node.tagName)) {
                    left.appendChild(node);
                } else {
                    right.appendChild(node);
                    // Keep the margin column vertically aligned with the body.
                    const spacer = document.createElement(node.tagName);
                    spacer.innerHTML = '&nbsp;';
                    spacer.setAttribute('aria-hidden', 'true');
                    left.appendChild(spacer);
                }
                continue;
            }

            right.appendChild(node);

            if (!node.querySelectorAll) continue;

            for (const ref of node.querySelectorAll('.footnote-ref')) {
                const anchor = ref.childNodes[0];
                if (!anchor || !anchor.getAttribute) continue;

                const targetId = anchor.getAttribute('href');
                const refNumber = anchor.innerHTML + ' ';
                const subnum = anchor.innerHTML.match(/:[0-9]+/g);
                if (subnum && subnum.length > 0) {
                    anchor.innerHTML = anchor.innerHTML.replace(subnum[0], '');
                }
                if (seen.includes(targetId)) continue;

                const target = document.querySelector(targetId);
                if (!target || !target.childNodes[0]) continue;

                seen.push(targetId);
                const footnote = target.childNodes[0].cloneNode(true);
                footnote.classList.add('footnote');
                footnote.id = targetId.replace('#', '');
                footnote.prepend(refNumber);
                sideFootnotes.appendChild(footnote);
                bottomFootnotes.appendChild(footnote.cloneNode(true));
            }
        }

        // Once per segment. The previous version ran these four appends inside
        // the node loop, which produced the right result only because
        // appendChild moves nodes rather than copying them.
        left.appendChild(sideFootnotes);
        right.appendChild(bottomFootnotes);
        place(left);
        place(right);
    }

    container.remove();
}
