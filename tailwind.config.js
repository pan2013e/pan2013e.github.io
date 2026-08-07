/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind is used only by the floating-window chrome. Everything else on
  // the site is hand-written CSS.
  content: ['./themes/academic/layout/_partial/smart-window.ejs'],
  // The window chrome uses dark: variants. Key them off the same attribute the
  // rest of the site uses, which head.ejs resolves before first paint, rather
  // than off prefers-color-scheme — otherwise an explicit theme choice would
  // move the page but not the window chrome.
  darkMode: ['selector', '[data-theme="dark"]'],
  corePlugins: {
    // normalize.css already handles the reset, and preflight's own base rules
    // (notably `img { display: block }` and heading font-size resets) fight
    // the hand-written styles in main.css.
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
