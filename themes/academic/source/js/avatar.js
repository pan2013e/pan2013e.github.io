(function () {
    var avatarEl = document.getElementById('avatar-rotator');
    if (!avatarEl) return;
    var captionEl = avatarEl.querySelector('.avatar-caption');
    var options = avatarEl.querySelectorAll('.avatar-option[data-src]');
    if (!options || options.length === 0) return;
    var root = avatarEl.getAttribute('data-root') || '/';
    var pageEl = avatarEl.closest('.page') || avatarEl.parentElement;
    var rightHeaderEl = pageEl ? pageEl.querySelector('.header.right') : null;
    var imgNaturalWidth = 0;
    var imgNaturalHeight = 0;
    var sizingRaf = 0;
    var sizingAttached = false;
    var lastWidth = 0;
    var lastHeight = 0;

    function resolveSrc(src) {
        if (typeof src !== 'string') return '';
        if (src.charAt(0) === '/' && root && root !== '/') {
            return root.replace(/\/$/, '') + src;
        }
        return src;
    }

    function setAvatarSize(width, height) {
        width = Math.round(width);
        height = Math.round(height);
        if (Math.abs(width - lastWidth) < 1 && Math.abs(height - lastHeight) < 1) return;
        lastWidth = width;
        lastHeight = height;
        avatarEl.style.width = width + 'px';
        avatarEl.style.height = height + 'px';
    }

    function applySizing() {
        if (!(imgNaturalWidth > 0 && imgNaturalHeight > 0)) return;
        var aspect = imgNaturalWidth / imgNaturalHeight;

        var isDesktop = window.matchMedia && window.matchMedia('(min-width:800px)').matches;
        var pageWidth = pageEl ? pageEl.getBoundingClientRect().width : window.innerWidth;

        if (isDesktop && rightHeaderEl) {
            var rightHeight = rightHeaderEl.getBoundingClientRect().height;
            var targetHeight = rightHeight * 0.95;
            var minHeight = 180;
            var maxHeight = Math.min(400, window.innerHeight * 0.65);
            targetHeight = Math.max(minHeight, Math.min(targetHeight, maxHeight));

            var maxWidth = Math.min(520, pageWidth * 0.55);
            var width = targetHeight * aspect;
            var height = targetHeight;

            if (width > maxWidth) {
                width = maxWidth;
                height = width / aspect;
            }

            setAvatarSize(width, height);
            return;
        }

        var maxWidth = Math.min(pageWidth, 300);
        var width = maxWidth;
        var height = width / aspect;
        var maxMobileHeight = Math.min(300, window.innerHeight * 0.6);

        if (height > maxMobileHeight) {
            height = maxMobileHeight;
            width = height * aspect;
        }

        setAvatarSize(width, height);
    }

    function scheduleSizing() {
        if (sizingRaf) cancelAnimationFrame(sizingRaf);
        sizingRaf = requestAnimationFrame(function () {
            sizingRaf = 0;
            applySizing();
        });
    }

    function attachSizing() {
        if (sizingAttached) return;
        sizingAttached = true;

        window.addEventListener('resize', scheduleSizing);

        if (typeof ResizeObserver !== 'undefined' && rightHeaderEl) {
            var ro = new ResizeObserver(scheduleSizing);
            ro.observe(rightHeaderEl);
        }
    }

    // Index 0 is the headshot from avatar_rotator.headshot; the rest are the
    // gallery. The page always opens on the headshot — the travel photos are
    // only reachable by clicking. Ordering is fixed in the template.
    var current = -1;

    function show(index, direction) {
        var attempts = 0;

        function attempt(idx) {
            if (attempts >= options.length) return;
            attempts += 1;

            var opt = options[((idx % options.length) + options.length) % options.length];
            var src = resolveSrc(opt.getAttribute('data-src'));
            if (!src) return attempt(idx + direction);
            var caption = opt.getAttribute('data-caption') || '';

            var img = new Image();
            img.onload = function () {
                if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                    imgNaturalWidth = img.naturalWidth;
                    imgNaturalHeight = img.naturalHeight;
                    avatarEl.style.setProperty('--avatar-ar', img.naturalWidth + ' / ' + img.naturalHeight);
                }
                attachSizing();
                scheduleSizing();
                avatarEl.style.backgroundImage = 'url(' + src + ')';
                if (captionEl) captionEl.textContent = caption;
                avatarEl.setAttribute('aria-label', caption
                    ? 'Photo: ' + caption
                    : 'Portrait');
                current = ((idx % options.length) + options.length) % options.length;
            };
            img.onerror = function () {
                attempt(idx + direction);
            };
            img.src = src;
        }

        attempt(index);
    }

    show(0, 1);

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