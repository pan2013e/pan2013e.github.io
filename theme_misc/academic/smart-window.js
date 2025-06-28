class SmartWindow {
    constructor(contentUrl) {
        this.contentUrl = contentUrl;
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
        this.windowTitle.textContent = this.getFriendlyTitle();
        this.minimizedTitle.textContent = this.getFriendlyTitle();
        this.setupOSStyles();
        this.attachEventListeners();
        this.open();
    }
    getFriendlyTitle() {
        try {
            const url = new URL(this.contentUrl, window.location.href);
            if (url.pathname.toLowerCase().endsWith('.pdf')) {
                return url.pathname.split('/').pop();
            }
            if (url.pathname.toLowerCase().endsWith('.html')) {
                return url.pathname.split('/').pop();
            }
            return url.hostname.replace('www.', '');
        } catch (e) {
            return this.contentUrl;
        }
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
                    iframeDoc.querySelector('.page').style.paddingTop = '2rem';
                    const navbar = iframeDoc.querySelector('#nav-back');
                    if (navbar) {
                        navbar.style.visibility = 'hidden';
                    }
                    iframeDoc.querySelectorAll('a').forEach(link => {
                        link.addEventListener('click', (e) => {
                            const href = link.getAttribute('href');
                            if (href && href.startsWith('/')) {
                                e.preventDefault();
                                e.stopPropagation();
                                const urlToOpen = href.substring(1);
                                handleLinkClick(urlToOpen);
                            }
                        });
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
function createViewer(url) {
    if (!url) return;
    const viewer = new SmartWindow(url);
    viewers[viewer.id] = viewer;
    viewer.modal.addEventListener('mousedown', () => setActiveViewer(viewer), true);
}
function handleLinkClick(url) {
    const absoluteUrl = new URL(url, window.location.href).href;
    const existingViewer = Object.values(viewers).find(v => v.contentUrl === absoluteUrl);
    if (existingViewer) {
        existingViewer.open();
    } else {
        createViewer(absoluteUrl);
    }
}
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
        if (link && !link.closest('.smart-window-modal')) {
            const href = link.getAttribute('href');
            if (href && href.startsWith('/')) {
                e.preventDefault();
                const url = href.substring(1);
                handleLinkClick(url);
            }
        }
    });
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
if (window.location.hash) {
    const urlFromHash = window.location.hash.substring(1);
    if (urlFromHash) {
        handleLinkClick(urlFromHash);
    }
}
if (Object.keys(viewers).length > 0) {
    setActiveViewer(Object.values(viewers)[0]);
}
