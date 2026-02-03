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

    var start = Math.floor(Math.random() * options.length);
    var attempt = 0;

    function loadNext() {
        if (attempt >= options.length) return;
        var opt = options[(start + attempt) % options.length];
        attempt += 1;

        var src = resolveSrc(opt.getAttribute('data-src'));
        if (!src) return loadNext();
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
            avatarEl.setAttribute('aria-label', caption || 'Avatar');
        };
        img.onerror = function () {
            loadNext();
        };
        img.src = src;
    }

    loadNext();
})();