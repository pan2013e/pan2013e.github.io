/*
 * Production minification for HTML, CSS and JS.
 *
 * Runs entirely inside the generate pipeline: it rewrites the in-memory routes
 * on their way to public/, so nothing under source/ or themes/ is touched. The
 * repo keeps readable, commented CSS and JS; only what ships is compressed.
 *
 * This replaces an older workflow where minified copies were committed
 * alongside their sources and kept in sync by hand — which is how avatar.css
 * ended up existing only as a .min file with no source at all.
 *
 * Deliberately not hexo-minify: it depends on the imagemin native binaries
 * (pngquant, jpegtran, gifsicle), which are a common source of install
 * failures on Windows and in CI. The avatars are already sized for display,
 * so image compression buys nothing here.
 *
 * Disable with `minify.enable: false` in _config.yml. Skipped automatically
 * under `hexo server`, so local previews serve readable sources.
 */

// The minifiers are devDependencies. If someone installs with --omit=dev the
// site should still build — just uncompressed — rather than crash on startup.
let minifyHtml, CleanCSS, minifyJs;
try {
    ({ minify: minifyHtml } = require('html-minifier-terser'));
    CleanCSS = require('clean-css');
    ({ minify: minifyJs } = require('terser'));
} catch (err) {
    hexo.log.warn('minify: minifiers not installed, shipping uncompressed assets');
}

const HTML_OPTIONS = {
    collapseWhitespace: true,
    conservativeCollapse: false,
    removeComments: true,
    removeRedundantAttributes: false, // keeps type="image/svg+xml" on the icon
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    sortAttributes: true,
    sortClassName: true,
};

const cleanCss = CleanCSS ? new CleanCSS({ level: 2, returnPromise: false }) : null;

function shouldSkip(path) {
    // Vendor bundles ship minified already; re-processing them only costs time.
    return path.includes('.min.');
}

hexo.extend.filter.register('after_generate', async function () {
    const config = this.config.minify || {};
    if (config.enable === false) return;
    if (!minifyHtml || !cleanCss || !minifyJs) return;

    // `hexo server` should serve what the author is editing.
    if (this.env.cmd === 'server' || this.env.cmd === 's') return;

    const routes = this.route;
    const paths = routes.list().filter((p) => /\.(html|css|js)$/.test(p) && !shouldSkip(p));

    let before = 0;
    let after = 0;
    let failures = 0;

    const read = (path) =>
        new Promise((resolve, reject) => {
            const stream = routes.get(path);
            let data = '';
            stream.on('data', (chunk) => (data += chunk));
            stream.on('end', () => resolve(data));
            stream.on('error', reject);
        });

    for (const path of paths) {
        let source;
        try {
            source = await read(path);
        } catch (err) {
            continue;
        }
        if (!source) continue;

        let output = null;
        try {
            if (path.endsWith('.html')) {
                output = await minifyHtml(source, HTML_OPTIONS);
            } else if (path.endsWith('.css')) {
                const result = cleanCss.minify(source);
                if (result.errors.length === 0) output = result.styles;
            } else {
                const result = await minifyJs(source, {
                    compress: true,
                    // Class and function names appear in no public API here, but
                    // keeping them makes a stack trace from a visitor legible.
                    mangle: { keep_classnames: true, keep_fnames: true },
                });
                if (result.code) output = result.code;
            }
        } catch (err) {
            // A file that will not minify is a bug worth seeing, not a reason
            // to fail the build — ship the original and say so.
            hexo.log.warn(`minify: skipped ${path} (${err.message})`);
            failures += 1;
            continue;
        }

        if (!output || output.length >= source.length) continue;

        before += source.length;
        after += output.length;
        routes.set(path, output);
    }

    if (before > 0) {
        const saved = Math.round((1 - after / before) * 100);
        hexo.log.info(
            `minify: ${paths.length} files, ${Math.round(before / 1024)}KB -> ` +
            `${Math.round(after / 1024)}KB (${saved}% smaller)` +
            (failures ? `, ${failures} skipped` : '')
        );
    }
});
