/* Portrait rotator.
 *
 * Responsibilities are deliberately small: fetch an image, publish its aspect
 * ratio as a custom property, and swap the background. All geometry lives in
 * avatar.css — the photo is absolutely positioned inside a fixed-height slot,
 * so changing pictures cannot reflow the page.
 *
 * An earlier version measured the neighbouring text and wrote explicit pixel
 * width/height onto the element on every load. That is what made the layout
 * jump on each click, and what made the portrait balloon at some viewport
 * widths.
 */
(function () {
    var avatarEl = document.getElementById('avatar-rotator');
    if (!avatarEl) return;

    var slotEl = avatarEl.parentElement;
    var captionEl = avatarEl.querySelector('.avatar-caption');
    var options = avatarEl.querySelectorAll('.avatar-option[data-src]');
    if (!options || options.length === 0) return;

    var root = avatarEl.getAttribute('data-root') || '/';

    function resolveSrc(src) {
        if (typeof src !== 'string') return '';
        if (src.charAt(0) === '/' && root && root !== '/') {
            return root.replace(/\/$/, '') + src;
        }
        return src;
    }

    // Index 0 is the headshot from avatar_rotator.headshot; the rest are the
    // gallery, in config order. The page opens on the headshot, and the cycle
    // is circular — clicking past the last travel photo wraps back round to
    // the headshot, so it stays reachable without being listed twice.
    //
    // `current` is set when a load is *requested*, not when it completes:
    // tracking it in the onload handler meant a click during the first image's
    // load still saw -1 and re-showed the headshot instead of advancing.
    var current = 0;

    function wrap(idx) {
        return ((idx % options.length) + options.length) % options.length;
    }

    // Gallery photos are fetched only when they are asked for, so a click can
    // sit on the network for a moment. The spinner is delayed so an image that
    // is already cached swaps instantly instead of flashing a spinner.
    var SPINNER_DELAY = 150;
    var spinnerTimer = 0;

    function startLoading() {
        clearTimeout(spinnerTimer);
        spinnerTimer = setTimeout(function () {
            avatarEl.classList.add('is-loading');
        }, SPINNER_DELAY);
    }

    function stopLoading() {
        clearTimeout(spinnerTimer);
        avatarEl.classList.remove('is-loading');
    }

    function show(index, direction) {
        var attempts = 0;
        current = wrap(index);
        startLoading();

        function attempt(idx) {
            if (attempts >= options.length) return stopLoading();
            attempts += 1;

            var opt = options[wrap(idx)];
            var src = resolveSrc(opt.getAttribute('data-src'));
            if (!src) return attempt(idx + direction);
            var caption = opt.getAttribute('data-caption') || '';

            var img = new Image();

            img.onload = function () {
                stopLoading();
                if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                    // The only geometry this script sets. CSS turns it into a
                    // width via aspect-ratio against the slot's fixed height.
                    slotEl.style.setProperty('--avatar-ar', img.naturalWidth + ' / ' + img.naturalHeight);
                }
                avatarEl.style.backgroundImage = 'url("' + src + '")';
                if (captionEl) captionEl.textContent = caption;
                avatarEl.setAttribute('aria-label', caption ? 'Photo: ' + caption : 'Portrait');
                current = wrap(idx);
            };

            img.onerror = function () {
                // Skip a missing file rather than stalling the cycle on it.
                current = wrap(idx + direction);
                attempt(idx + direction);
            };

            img.src = src;
        }

        attempt(index);
    }

    show(0, 1);

    // Suppress the context menu and drag-to-save gestures on the portrait.
    // CSS covers selection and the iOS long-press sheet; these cover the two
    // gestures CSS cannot. A deterrent only — the images remain plain URLs.
    avatarEl.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    avatarEl.addEventListener('dragstart', function (e) {
        e.preventDefault();
    });

    if (options.length > 1) {
        avatarEl.classList.add('is-interactive');
        avatarEl.setAttribute('tabindex', '0');
        avatarEl.setAttribute('role', 'button');
        avatarEl.setAttribute('title', 'Click to browse photos');

        avatarEl.addEventListener('click', function () {
            show(current + 1, 1);
        });

        avatarEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                show(current + 1, 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                show(current + 1, 1);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                show(current - 1, -1);
            }
        });
    }
})();
