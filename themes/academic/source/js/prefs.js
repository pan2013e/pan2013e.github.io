/* Footer preference controls.
 *
 * Two independent segmented controls share this file because they share a
 * pattern: a radiogroup whose buttons carry the value, with the choice kept in
 * localStorage.
 *
 *   Theme            auto | light | dark   -> <html data-theme>
 *   Site links open  tab  | window         -> read by smart-window.js
 *
 * The theme is also applied by an inline script in <head> so it lands before
 * first paint; this file only handles the switching afterwards.
 */
(function () {
    var THEME_KEY = 'theme';
    var WINDOW_KEY = 'smart-window-enabled';
    var root = document.documentElement;
    var prefs = document.getElementById('site-prefs');
    if (!prefs) return;

    function read(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function write(key, value) {
        try {
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key, value);
        } catch (e) {
            /* Preference will not persist, but the page still responds. */
        }
    }

    function mark(buttons, activeValue, attr) {
        for (var i = 0; i < buttons.length; i++) {
            var on = buttons[i].getAttribute(attr) === activeValue;
            buttons[i].setAttribute('aria-checked', String(on));
            buttons[i].tabIndex = on ? 0 : -1;
        }
    }

    // Arrow keys move between options, as expected of a radiogroup.
    function wireRoving(group) {
        group.addEventListener('keydown', function (e) {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            var buttons = Array.prototype.slice.call(group.querySelectorAll('button'));
            var i = buttons.indexOf(document.activeElement);
            if (i === -1) return;
            e.preventDefault();
            var next = buttons[(i + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length];
            next.focus();
            next.click();
        });
    }

    // --- theme ------------------------------------------------------------

    var themeButtons = prefs.querySelectorAll('[data-theme-choice]');
    if (themeButtons.length) {
        var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

        // `auto` is resolved to a concrete value, matching the inline script in
        // <head>, so the whole site keys off one [data-theme] selector.
        var resolve = function (choice) {
            if (choice === 'dark' || choice === 'light') return choice;
            return systemDark && systemDark.matches ? 'dark' : 'light';
        };

        var applyTheme = function (choice) {
            var resolved = resolve(choice);
            root.setAttribute('data-theme', resolved);
            mark(themeButtons, choice, 'data-theme-choice');
            // Open floating windows hold their own document; smart-window.js
            // listens for this to keep them in step.
            window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: resolved } }));
        };

        var storedTheme = read(THEME_KEY);
        var currentChoice = (storedTheme === 'dark' || storedTheme === 'light') ? storedTheme : 'auto';
        applyTheme(currentChoice);

        for (var i = 0; i < themeButtons.length; i++) {
            themeButtons[i].addEventListener('click', function () {
                currentChoice = this.getAttribute('data-theme-choice');
                write(THEME_KEY, currentChoice === 'auto' ? null : currentChoice);
                applyTheme(currentChoice);
            });
        }

        // On `auto`, follow the OS if it changes while the page is open.
        if (systemDark && systemDark.addEventListener) {
            systemDark.addEventListener('change', function () {
                if (currentChoice === 'auto') applyTheme('auto');
            });
        }

        wireRoving(themeButtons[0].parentNode);
    }

    // --- floating windows -------------------------------------------------

    var windowButtons = prefs.querySelectorAll('[data-window-choice]');
    if (windowButtons.length) {
        var defaultOn = document.body.getAttribute('data-smart-window-default') !== 'false';
        var storedWindows = read(WINDOW_KEY);
        var enabled = storedWindows === null ? defaultOn : storedWindows === 'true';

        mark(windowButtons, enabled ? 'window' : 'tab', 'data-window-choice');

        for (var j = 0; j < windowButtons.length; j++) {
            windowButtons[j].addEventListener('click', function () {
                var on = this.getAttribute('data-window-choice') === 'window';
                write(WINDOW_KEY, on ? 'true' : 'false');
                mark(windowButtons, on ? 'window' : 'tab', 'data-window-choice');
                // Closing on switch-off avoids leaving orphaned windows behind.
                if (!on && window.closeAllSmartWindows) window.closeAllSmartWindows();
            });
        }
        wireRoving(windowButtons[0].parentNode);
    }

    prefs.classList.add('is-ready');
})();
