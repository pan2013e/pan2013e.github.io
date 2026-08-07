class SmartWindow {
    constructor(contentUrl, hintTitle) {
        this.contentUrl = contentUrl;
        // Label to show until the real document <title> is available.
        this.hintTitle = hintTitle || null;
        this.id = `smart-window-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.minWidth = 300;
        this.minHeight = 300;
        this.isMobile = null;
        this.windowState = 'restored';
        this.isDragging = false;
        this.isResizing = false;
        this.isMinimized = false;
        this.awaitingDragFromSpecialState = false;
        this.lastPosition = { x: 0, y: 0 };
        const targetWidth = Math.min(1000, window.innerWidth * 0.7);
        const targetHeight = Math.min(window.innerHeight * 0.9, targetWidth * 1.414);
        const left = (window.innerWidth - targetWidth) / 2;
        const top = (window.innerHeight - targetHeight) / 2;
        this.initialRect = { left: left, top: top, width: targetWidth, height: targetHeight };
        this.resizeDirection = '';
        this.snapTarget = null;
        this.init();
    }
    init() {
        const template = document.getElementById('smart-window-template');
        const clone = template.content.cloneNode(true);
        this.modal = clone.querySelector('.smart-window-modal');
        this.minimizedBar = clone.querySelector('.minimized-bar');
        document.body.appendChild(this.modal);
        this.modal.id = `modal-${this.id}`;
        this.minimizedBar.id = `minimized-${this.id}`;
        this.header = this.modal.querySelector('.modal-header');
        this.contentEmbedContainer = this.modal.querySelector('.content-embed-container');
        this.windowTitle = this.modal.querySelector('.window-title');
        this.minimizedTitle = this.minimizedBar.querySelector('.minimized-title');
        this.openInNewTabBtn = this.modal.querySelector('.open-new-tab-btn');
        this.inactiveOverlay = this.modal.querySelector('.inactive-overlay');
        this.setTitle(this.getFriendlyTitle());
        this.setupOSStyles();
        this.attachEventListeners();
        this.open();
    }
    /* Pretty URLs have no extension, so the old fallback here returned
       url.hostname — every window was titled "pan2013e.github.io". This uses
       the clicked link's own text when there is one, and otherwise derives a
       label from the path. For same-origin pages setTitleFromDocument()
       replaces it with the real <title> as soon as the iframe loads. */
    getFriendlyTitle() {
        try {
            const url = new URL(this.contentUrl, window.location.href);
            const file = url.pathname.split('/').filter(Boolean).pop() || '';

            if (/\.(pdf|html?)$/i.test(file)) return decodeURIComponent(file);
            if (this.hintTitle) return this.hintTitle;
            if (!file) return document.title;

            return decodeURIComponent(file)
                .replace(/[-_]+/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());
        } catch (e) {
            return this.contentUrl;
        }
    }

    setTitle(text) {
        if (!text) return;
        this.windowTitle.textContent = text;
        this.minimizedTitle.textContent = text;
        this.modal.setAttribute('aria-label', text);
    }

    /* The iframe is same-origin, so its <title> is readable. Strip the shared
       site prefix ("Zhiyuan Pan | Publications" -> "Publications") to avoid
       repeating the site name in every title bar. */
    setTitleFromDocument(doc) {
        if (!doc || !doc.title) return;
        const parts = doc.title.split('|').map((s) => s.trim()).filter(Boolean);
        this.setTitle(parts.length > 1 ? parts.slice(1).join(' | ') : doc.title.trim());
    }
    setupOSStyles() {
        const platform = navigator.platform.toUpperCase();
        if (platform.indexOf('MAC') >= 0) {
            this.modal.classList.add('os-mac');
            const controls = this.modal.querySelector('.window-controls');
            controls.append(controls.querySelector('.close-btn'), controls.querySelector('.minimize-btn'), controls.querySelector('.maximize-container'));
        } else {
            this.modal.classList.add('os-win');
            const controls = this.modal.querySelector('.window-controls');
            controls.append(controls.querySelector('.minimize-btn'), controls.querySelector('.maximize-container'), controls.querySelector('.close-btn'));
            controls.querySelectorAll('.control-btn').forEach(btn => btn.classList.add('win-btn'));
            controls.querySelector('.close-btn').classList.add('win-close-btn');
        }
    }
    loadContent() {
        if (this.contentEmbedContainer.hasChildNodes()) {
            return;
        }
        this.contentEmbedContainer.innerHTML = "";
        const isPdf = this.contentUrl.toLowerCase().split('?')[0].endsWith('.pdf');
        if (isPdf) {
            const options = {
                pdfOpenParams: { view: 'FitV' },
                callback: () => { }
            };
            PDFObject.embed(this.contentUrl, this.contentEmbedContainer, options);
        } else {
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.src = this.contentUrl;
            iframe.onload = () => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                    // Now that the document exists, use its real title.
                    this.setTitleFromDocument(iframeDoc);

                    // Carry the reader's theme into the frame; it has its own
                    // <html>, so the inline head script there only sees its
                    // own storage — which is the same origin, but the frame may
                    // have loaded before a theme switch.
                    const theme = document.documentElement.getAttribute('data-theme');
                    if (theme) iframeDoc.documentElement.setAttribute('data-theme', theme);
                    else iframeDoc.documentElement.removeAttribute('data-theme');

                    const pageEl = iframeDoc.querySelector('.page');
                    if (pageEl) pageEl.style.paddingTop = '2rem';

                    // Chrome that only makes sense in a full tab.
                    iframeDoc.querySelectorAll('.post.header.left, .site-prefs').forEach(el => {
                        el.style.visibility = 'hidden';
                    });

                    iframeDoc.addEventListener('click', (e) => {
                        const link = e.target.closest && e.target.closest('a');
                        if (!link) return;
                        if (wantsExternalNavigation(e)) return;
                        if (link.hasAttribute('download') || link.hasAttribute('data-no-window')) return;
                        if (link.target === '_blank') return;

                        const href = link.getAttribute('href');
                        if (!href || !href.startsWith('/')) return;

                        e.preventDefault();
                        e.stopPropagation();
                        handleLinkClick(href.substring(1), link.textContent.trim());
                    });
                } catch (error) {
                    console.warn('Cannot add link listeners to cross-origin iframe:', this.contentUrl, error);
                }
            };
            this.contentEmbedContainer.appendChild(iframe);
        }
    }
    open() {
        if (this.isMinimized) {
            document.getElementById('minimized-bar-container').removeChild(this.minimizedBar);
            this.isMinimized = false;
        }
        this.modal.classList.remove('minimizing', 'hidden');
        this.modal.classList.add('opening');
        setActiveViewer(this);
        this.handleUIMode(true);
        if (this.windowState === 'maximized') {
            this.maximizeWindow(false);
        } else {
            this.restoreWindow();
        }
        if (!this.contentEmbedContainer.hasChildNodes()) {
            setTimeout(() => this.loadContent(), 250);
        }
        this.modal.addEventListener('animationend', () => this.modal.classList.remove('opening'), { once: true });
        checkAndManageSnapDivider();
    }
    close() {
        this.modal.remove();
        this.minimizedBar.remove();
        delete viewers[this.id];
        checkAndManageSnapDivider();
        const remainingViewers = Object.values(viewers).filter(v => !v.isMinimized);
        if (remainingViewers.length > 0) {
            setActiveViewer(remainingViewers[remainingViewers.length - 1]);
        }
    }
    openInNewTab() {
        window.open(this.contentUrl, '_blank');
    }
    setActive(state) {
        if (state) {
            this.modal.classList.remove('inactive-window');
            this.modal.style.zIndex = 51;
            this.inactiveOverlay.classList.add('hidden');
        } else {
            this.modal.classList.add('inactive-window');
            this.modal.style.zIndex = 50;
            this.inactiveOverlay.classList.remove('hidden');
        }
    }
    toggleWindowState() {
        if (this.isMobile) return;
        this.modal.classList.add('window-transition');
        if (this.windowState !== 'restored') this.restoreWindow();
        else this.maximizeWindow(true);
        setTimeout(() => this.loadContent(), 250);
        setTimeout(() => this.modal.classList.remove('window-transition'), 200);
    }
    maximizeWindow(store = true) {
        if (store && this.windowState !== 'maximized') {
            this.initialRect = { left: this.modal.offsetLeft, top: this.modal.offsetTop, width: this.modal.offsetWidth, height: this.modal.offsetHeight };
        }
        this.modal.style.top = '0px';
        this.modal.style.left = '0px';
        this.modal.style.width = '100vw';
        this.modal.style.height = '100vh';
        this.windowState = 'maximized';
        if (!this.isMobile) {
            this.modal.querySelector('.maximize-icon').classList.add('hidden');
            this.modal.querySelector('.restore-icon').classList.remove('hidden');
        }
        checkAndManageSnapDivider();
    }
    restoreWindow() {
        this.modal.style.top = `${this.initialRect.top}px`;
        this.modal.style.left = `${this.initialRect.left}px`;
        this.modal.style.width = `${Math.max(this.initialRect.width, this.minWidth)}px`;
        this.modal.style.height = `${Math.max(this.initialRect.height, this.minHeight)}px`;
        this.windowState = 'restored';
        this.modal.querySelector('.maximize-icon').classList.remove('hidden');
        this.modal.querySelector('.restore-icon').classList.add('hidden');
        checkAndManageSnapDivider();
    }
    minimizeWindow() {
        if (this.isMobile) return;
        if (this.windowState !== 'maximized') {
            this.initialRect = { left: this.modal.offsetLeft, top: this.modal.offsetTop, width: this.modal.offsetWidth, height: this.modal.offsetHeight };
        }
        this.modal.classList.add('minimizing');
        this.modal.addEventListener('animationend', () => {
            this.modal.classList.add('hidden');
            this.modal.classList.remove('minimizing');
            document.getElementById('minimized-bar-container').appendChild(this.minimizedBar);
            this.isMinimized = true;
            checkAndManageSnapDivider();
            const remainingViewers = Object.values(viewers).filter(v => !v.isMinimized);
            if (remainingViewers.length > 0) {
                setActiveViewer(remainingViewers[remainingViewers.length - 1]);
            } else {
                activeViewer = null;
            }
        }, { once: true });
    }
    snapLeft(store = true) {
        if (store && this.windowState === 'restored') {
            this.initialRect = { left: this.modal.offsetLeft, top: this.modal.offsetTop, width: this.modal.offsetWidth, height: this.modal.offsetHeight };
        }
        this.modal.style.top = '0px';
        this.modal.style.left = '0px';
        let width = window.innerWidth * 0.5;
        if (rightSnappedViewer && rightSnappedViewer !== this) {
            width = window.innerWidth - rightSnappedViewer.modal.offsetWidth;
        }
        this.modal.style.width = `${width}px`;
        this.modal.style.height = '100vh';
        this.windowState = 'snapped-left';
        this.modal.querySelector('.maximize-icon').classList.remove('hidden');
        this.modal.querySelector('.restore-icon').classList.add('hidden');
        checkAndManageSnapDivider();
    }
    snapRight(store = true) {
        if (store && this.windowState === 'restored') {
            this.initialRect = { left: this.modal.offsetLeft, top: this.modal.offsetTop, width: this.modal.offsetWidth, height: this.modal.offsetHeight };
        }
        this.modal.style.top = '0px';
        let width = window.innerWidth * 0.5;
        let left = window.innerWidth * 0.5;
        if (leftSnappedViewer && leftSnappedViewer !== this) {
            const leftWidth = leftSnappedViewer.modal.offsetWidth;
            width = window.innerWidth - leftWidth;
            left = leftWidth;
        }
        this.modal.style.left = `${left}px`;
        this.modal.style.width = `${width}px`;
        this.modal.style.height = '100vh';
        this.windowState = 'snapped-right';
        this.modal.querySelector('.maximize-icon').classList.remove('hidden');
        this.modal.querySelector('.restore-icon').classList.add('hidden');
        checkAndManageSnapDivider();
    }
    handleUIMode(force = false) {
        const newIsMobile = window.innerWidth < 768;
        if (newIsMobile === this.isMobile && !force) return;
        this.isMobile = newIsMobile;
        const controls = this.modal.querySelector('.window-controls');
        const spacer = this.modal.querySelector('.header-spacer');
        this.minWidth = Math.max(300, window.innerWidth * 0.3);
        this.minHeight = Math.max(300, window.innerHeight * 0.5);
        if (this.isMobile) {
            this.header.style.cursor = 'default';
            controls.querySelector('.maximize-container').style.display = 'none';
            controls.querySelector('.minimize-btn').style.display = 'none';
            this.modal.querySelectorAll('.resize-handle').forEach(h => h.style.display = 'none');
            spacer.style.width = '0px';
            if (this.windowState !== 'maximized') {
                this.maximizeWindow(true);
                setTimeout(() => this.loadContent(), 250);
            }
        } else {
            this.header.style.cursor = 'move';
            controls.querySelector('.maximize-container').style.display = 'block';
            controls.querySelector('.minimize-btn').style.display = 'flex';
            this.modal.querySelectorAll('.resize-handle').forEach(h => h.style.display = 'block');
            setTimeout(() => {
                spacer.style.width = `${controls.offsetWidth}px`;
            }, 1);
        }
    }
    attachEventListeners() {
        this.modal.querySelector('.close-btn').addEventListener('click', () => this.close());
        this.modal.querySelector('.maximize-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleWindowState();
        });
        this.modal.querySelector('.minimize-btn').addEventListener('click', () => this.minimizeWindow());
        this.minimizedBar.addEventListener('click', () => this.open());
        this.openInNewTabBtn.addEventListener('click', () => this.openInNewTab());
        this.header.addEventListener('mousedown', e => {
            setActiveViewer(this);
            if (e.target.closest('button') || this.isMobile) return;
            if (this.windowState !== 'restored') {
                this.awaitingDragFromSpecialState = true;
            } else {
                this.isDragging = true;
            }
            if (this.contentEmbedContainer) this.contentEmbedContainer.style.pointerEvents = 'none';
            this.lastPosition = { x: e.clientX - this.modal.offsetLeft, y: e.clientY - this.modal.offsetTop };
        });
        this.modal.querySelectorAll('.resize-handle').forEach(h => {
            h.addEventListener('mousedown', e => {
                setActiveViewer(this);
                e.stopPropagation();
                const direction = h.className.match(/resize-handle-([a-z-]+)/)[1];
                let allowResize = false;
                if (this.windowState === 'restored') allowResize = true;
                else if (this.windowState === 'snapped-left' && direction === 'right') allowResize = true;
                else if (this.windowState === 'snapped-right' && direction === 'left') allowResize = true;
                if (leftSnappedViewer && rightSnappedViewer) allowResize = false;
                if (this.isMobile || !allowResize) return;
                this.isResizing = true;
                this.isDragging = false;
                if (this.contentEmbedContainer) this.contentEmbedContainer.style.pointerEvents = 'none';
                this.resizeDirection = direction;
                const rect = this.modal.getBoundingClientRect();
                this.initialRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
                this.lastPosition = { x: e.clientX, y: e.clientY };
                document.body.style.userSelect = 'none';
            });
        });
        this.header.addEventListener('dblclick', e => {
            if (this.isMobile || e.target.closest('button')) return;
            this.toggleWindowState();
        });
        this.inactiveOverlay.addEventListener('wheel', () => setActiveViewer(this), { passive: true });
        const maximizeContainer = this.modal.querySelector('.maximize-container');
        const snapPopup = this.modal.querySelector('.snap-popup');
        let showTimeout, hideTimeout;
        maximizeContainer.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            showTimeout = setTimeout(() => {
                if (this.windowState === 'maximized') return;
                snapPopup.classList.remove('hidden');
            }, 400);
        });
        maximizeContainer.addEventListener('mouseleave', () => {
            clearTimeout(showTimeout);
            hideTimeout = setTimeout(() => snapPopup.classList.add('hidden'), 200);
        });
        this.modal.querySelectorAll('.snap-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.modal.classList.add('window-transition');
                switch (action) {
                    case 'maximize': this.maximizeWindow(true); break;
                    case 'snap-left': this.snapLeft(true); break;
                    case 'snap-right': this.snapRight(true); break;
                }
                snapPopup.classList.add('hidden');
                setTimeout(() => this.loadContent(), 250);
                setTimeout(() => this.modal.classList.remove('window-transition'), 200);
            });
        });
    }
}
const snapPreview = document.getElementById('snap-preview');
let viewers = {};
let activeViewer = null;
let leftSnappedViewer = null;
let rightSnappedViewer = null;
let isSnapResizing = false;
const snapDivider = document.getElementById('snap-divider');
function checkAndManageSnapDivider() {
    leftSnappedViewer = null;
    rightSnappedViewer = null;
    for (const viewer of Object.values(viewers)) {
        if (viewer.isMinimized) continue;
        if (viewer.windowState === 'snapped-left') leftSnappedViewer = viewer;
        else if (viewer.windowState === 'snapped-right') rightSnappedViewer = viewer;
    }
    if (leftSnappedViewer && rightSnappedViewer) {
        snapDivider.classList.remove('hidden');
        snapDivider.style.left = `${leftSnappedViewer.modal.offsetWidth}px`;
    } else {
        snapDivider.classList.add('hidden');
    }
}
snapDivider.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isSnapResizing = true;
    document.body.style.cursor = 'ew-resize';
    Object.values(viewers).forEach(v => {
        if (v.contentEmbedContainer) v.contentEmbedContainer.style.pointerEvents = 'none';
    });
});
function setActiveViewer(viewerToActivate) {
    if (!viewerToActivate || viewerToActivate === activeViewer) return;
    Object.values(viewers).forEach(v => v.setActive(v === viewerToActivate));
    activeViewer = viewerToActivate;
}
window.addEventListener('mousemove', e => {
    if (isSnapResizing) {
        const minWidth = leftSnappedViewer.minWidth;
        const newLeftWidth = Math.max(minWidth, Math.min(e.clientX, window.innerWidth - rightSnappedViewer.minWidth));
        leftSnappedViewer.modal.style.width = `${newLeftWidth}px`;
        rightSnappedViewer.modal.style.left = `${newLeftWidth}px`;
        rightSnappedViewer.modal.style.width = `${window.innerWidth - newLeftWidth}px`;
        snapDivider.style.left = `${newLeftWidth}px`;
        return;
    }
    if (!activeViewer || activeViewer.isMinimized) return;
    if (activeViewer.awaitingDragFromSpecialState) {
        const dragThreshold = 5;
        const movedX = Math.abs(e.clientX - (activeViewer.lastPosition.x + activeViewer.modal.offsetLeft));
        const movedY = Math.abs(e.clientY - (activeViewer.lastPosition.y + activeViewer.modal.offsetTop));
        if (movedX > dragThreshold || movedY > dragThreshold) {
            activeViewer.awaitingDragFromSpecialState = false;
            activeViewer.isDragging = true;
            const proportionalX = (activeViewer.lastPosition.x / activeViewer.modal.offsetWidth);
            activeViewer.modal.classList.remove('window-transition');
            activeViewer.restoreWindow();
            const newOffsetX = activeViewer.modal.offsetWidth * proportionalX;
            activeViewer.lastPosition.x = newOffsetX;
            activeViewer.lastPosition.y = activeViewer.header.offsetHeight / 2;
            const newLeft = e.clientX - activeViewer.lastPosition.x;
            const newTop = e.clientY - activeViewer.lastPosition.y;
            activeViewer.modal.style.left = `${newLeft}px`;
            activeViewer.modal.style.top = `${Math.max(0, newTop)}px`;
            return;
        }
    }
    if (activeViewer.isDragging && activeViewer.windowState === 'restored') {
        const newX = e.clientX - activeViewer.lastPosition.x;
        const newY = e.clientY - activeViewer.lastPosition.y;
        activeViewer.modal.style.left = `${newX}px`;
        const clampedY = Math.max(0, Math.min(newY, window.innerHeight - activeViewer.header.offsetHeight));
        activeViewer.modal.style.top = `${clampedY}px`;
        const snapThreshold = 15;
        if (e.clientY < snapThreshold || e.clientY > window.innerHeight - snapThreshold) {
            activeViewer.snapTarget = 'maximize';
            snapPreview.style.cssText = 'top:0;left:0;width:100vw;height:100vh;';
            snapPreview.classList.remove('hidden');
        } else if (e.clientX < snapThreshold) {
            activeViewer.snapTarget = 'left';
            let width = '50vw';
            if (rightSnappedViewer && rightSnappedViewer !== activeViewer) width = `${window.innerWidth - rightSnappedViewer.modal.offsetWidth}px`;
            snapPreview.style.cssText = `top:0;left:0;width:${width};height:100vh;`;
            snapPreview.classList.remove('hidden');
        } else if (e.clientX > window.innerWidth - snapThreshold) {
            activeViewer.snapTarget = 'right';
            let width = '50vw', left = '50vw';
            if (leftSnappedViewer && leftSnappedViewer !== activeViewer) {
                const leftWidth = leftSnappedViewer.modal.offsetWidth;
                width = `${window.innerWidth - leftWidth}px`;
                left = `${leftWidth}px`;
            }
            snapPreview.style.cssText = `top:0;left:${left};width:${width};height:100vh;`;
            snapPreview.classList.remove('hidden');
        } else {
            activeViewer.snapTarget = null;
            snapPreview.classList.add('hidden');
        }
    } else if (activeViewer.isResizing) {
        const dx = e.clientX - activeViewer.lastPosition.x;
        const dy = e.clientY - activeViewer.lastPosition.y;
        let { width, height, left, top } = activeViewer.initialRect;
        if (activeViewer.resizeDirection.includes('right')) width = Math.max(activeViewer.minWidth, activeViewer.initialRect.width + dx);
        if (activeViewer.resizeDirection.includes('bottom')) height = Math.max(activeViewer.minHeight, activeViewer.initialRect.height + dy);
        if (activeViewer.resizeDirection.includes('left')) { const pW = activeViewer.initialRect.width - dx; if (pW > activeViewer.minWidth) { width = pW; left = activeViewer.initialRect.left + dx; } }
        if (activeViewer.resizeDirection.includes('top')) { const pH = activeViewer.initialRect.height - dy; if (pH > activeViewer.minHeight) { height = pH; top = activeViewer.initialRect.top + dy; } }
        if (activeViewer.windowState.includes('snapped')) {
            height = activeViewer.initialRect.height; top = activeViewer.initialRect.top;
        }
        activeViewer.modal.style.width = `${width}px`;
        activeViewer.modal.style.height = `${height}px`;
        activeViewer.modal.style.left = `${left}px`;
        activeViewer.modal.style.top = `${top}px`;
    }
});
window.addEventListener('mouseup', () => {
    if (isSnapResizing) {
        isSnapResizing = false;
        document.body.style.cursor = 'default';
        if (leftSnappedViewer) {
            if (leftSnappedViewer.contentEmbedContainer) leftSnappedViewer.contentEmbedContainer.style.pointerEvents = 'auto';
            leftSnappedViewer.loadContent();
        }
        if (rightSnappedViewer) {
            if (rightSnappedViewer.contentEmbedContainer) rightSnappedViewer.contentEmbedContainer.style.pointerEvents = 'auto';
            rightSnappedViewer.loadContent();
        }
    }
    if (!activeViewer) return;
    if (activeViewer.contentEmbedContainer) activeViewer.contentEmbedContainer.style.pointerEvents = 'auto';
    activeViewer.awaitingDragFromSpecialState = false;
    if (activeViewer.isDragging && activeViewer.snapTarget) {
        activeViewer.modal.classList.add('window-transition');
        switch (activeViewer.snapTarget) {
            case 'maximize': activeViewer.maximizeWindow(true); break;
            case 'left': activeViewer.snapLeft(true); break;
            case 'right': activeViewer.snapRight(true); break;
        }
        setTimeout(() => activeViewer.loadContent(), 250);
        setTimeout(() => activeViewer.modal.classList.remove('window-transition'), 200);
    }
    snapPreview.classList.add('hidden');
    activeViewer.snapTarget = null;
    if (activeViewer.isResizing) {
        setTimeout(() => activeViewer.loadContent(), 50);
    }
    activeViewer.isDragging = false;
    activeViewer.isResizing = false;
    document.body.style.userSelect = '';
});
function createViewer(url, hintTitle) {
    if (!url) return;
    const viewer = new SmartWindow(url, hintTitle);
    viewers[viewer.id] = viewer;
    viewer.modal.addEventListener('mousedown', () => setActiveViewer(viewer), true);
}

function handleLinkClick(url, hintTitle) {
    const absoluteUrl = new URL(url, window.location.href).href;
    const existingViewer = Object.values(viewers).find(v => v.contentUrl === absoluteUrl);
    if (existingViewer) {
        existingViewer.open();
    } else {
        createViewer(absoluteUrl, hintTitle);
    }
}

/* ---------------------------------------------------------------------------
   Link interception.

   Floating windows are a reading convenience, not a navigation replacement, so
   several things gate them:

   1. The reader's preference, set by the segmented control in the footer and
      stored under `smart-window-enabled`. Its first-visit default comes from
      theme.smart_window.default_enabled via a data attribute on <body>.
   2. Modifier keys. Ctrl/Cmd/Shift/Alt-click and middle-click mean "open this
      somewhere else" — intercepting those breaks open-in-new-tab, which is the
      main thing a visitor wants to do with a CV or a paper PDF.
   3. An explicit `data-no-window` opt-out, for links whose target makes no
      sense in an iframe (the RSS feed, for one).
   --------------------------------------------------------------------------- */

const PREF_KEY = 'smart-window-enabled';

function defaultEnabled() {
    return document.body.getAttribute('data-smart-window-default') !== 'false';
}

function windowsEnabled() {
    try {
        const stored = localStorage.getItem(PREF_KEY);
        if (stored !== null) return stored === 'true';
    } catch (err) {
        /* Storage blocked (private mode, cookie policy) — fall back to default. */
    }
    return defaultEnabled();
}

function wantsExternalNavigation(e) {
    return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button !== undefined && e.button !== 0);
}

// prefs.js owns the footer control; this is the hook it calls on switch-off.
window.closeAllSmartWindows = function () {
    Object.values(viewers).forEach(v => v.close());
};

document.addEventListener('click', e => {
    const link = e.target.closest && e.target.closest('a');
    if (!link || link.closest('.smart-window-modal')) return;
    if (wantsExternalNavigation(e)) return;
    if (link.hasAttribute('download') || link.hasAttribute('data-no-window')) return;
    if (link.target === '_blank') return;
    if (!windowsEnabled()) return;

    const href = link.getAttribute('href');
    if (!href || !href.startsWith('/')) return;

    e.preventDefault();
    handleLinkClick(href.substring(1), link.textContent.trim());
});

window.addEventListener('resize', () => {
    Object.values(viewers).forEach(viewer => {
        if (viewer.windowState === 'maximized') viewer.maximizeWindow(false);
        else if (viewer.windowState === 'snapped-left') viewer.snapLeft(false);
        else if (viewer.windowState === 'snapped-right') viewer.snapRight(false);
        viewer.handleUIMode();
    });
    checkAndManageSnapDivider();
});

// Keep any open window in step with a theme change made while it is open.
window.addEventListener('themechange', e => {
    Object.values(viewers).forEach(viewer => {
        const frame = viewer.contentEmbedContainer.querySelector('iframe');
        if (!frame) return;
        try {
            const el = frame.contentDocument.documentElement;
            if (e.detail && e.detail.theme) el.setAttribute('data-theme', e.detail.theme);
            else el.removeAttribute('data-theme');
        } catch (err) { /* cross-origin frame */ }
    });
});

// A shared #/path/to.pdf link is an explicit request for a window, but honour
// the preference: if windows are off, navigate to the target instead.
if (window.location.hash) {
    const urlFromHash = window.location.hash.substring(1);
    if (urlFromHash) {
        if (windowsEnabled()) handleLinkClick(urlFromHash);
        else window.location.replace(urlFromHash);
    }
}

if (Object.keys(viewers).length > 0) {
    setActiveViewer(Object.values(viewers)[0]);
}
