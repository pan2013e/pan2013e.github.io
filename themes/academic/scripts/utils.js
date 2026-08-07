const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

hexo.extend.helper.register('get_tags', function (item) {
    const tags = [];
    for (const tag of item.tags.data) {
        tags.push(tag.name);
    }
    return tags;
});

hexo.extend.helper.register('has_common_tags', function (tagListA, tagListB) {
    for (const tag of tagListA) {
        if (tagListB.includes(tag)) return true;
    }
    return false;
});

/*
 * Cache-busting token, derived from the assets themselves.
 *
 * This used to be `assets_version` in the theme config — a date someone had to
 * remember to bump. Nobody did, so every stylesheet shipped as ?v=20260203 no
 * matter how much the CSS changed, and returning visitors kept rendering the
 * site with whatever they had cached.
 *
 * Hashing the files removes the manual step: the query changes when, and only
 * when, the bytes change. Computed once at load rather than per page render.
 *
 * theme.assets_version still wins if it is set, for pinning during debugging.
 */
function assetFingerprint() {
    const hash = crypto.createHash('sha1');
    const themeSource = path.join(__dirname, '..', 'source');

    for (const dir of ['styles', 'js']) {
        const abs = path.join(themeSource, dir);
        if (!fs.existsSync(abs)) continue;
        for (const name of fs.readdirSync(abs).sort()) {
            hash.update(name);
            hash.update(fs.readFileSync(path.join(abs, name)));
        }
    }

    const favicon = path.join(themeSource, 'favicon.svg');
    if (fs.existsSync(favicon)) hash.update(fs.readFileSync(favicon));

    return hash.digest('hex').slice(0, 8);
}

const FINGERPRINT = assetFingerprint();

hexo.extend.helper.register('asset_version', function () {
    return this.theme.assets_version || FINGERPRINT;
});

/*
 * Script tags, with two things hexo's built-in js() helper does not give us:
 *
 *   defer  — the parser keeps going instead of stopping on each <script>, and
 *            everything runs in order once the DOM is complete. All of this
 *            theme's scripts read the finished document, so none of them need
 *            to block parsing.
 *   ?v=    — the same cache-busting query the stylesheets carry.
 */
hexo.extend.helper.register('theme_js', function (paths) {
    const root = this.config.root;
    const version = `?v=${this.theme.assets_version || FINGERPRINT}`;
    return [].concat(paths)
        .map((p) => `<script defer src="${root}${p}${version}"></script>`)
        .join('\n');
});
