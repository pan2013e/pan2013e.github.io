# Zhiyuan Pan — personal page

![Hexo Auto-Deploy](https://github.com/pan2013e/pan2013e.github.io/workflows/Hexo%20Auto-Deploy/badge.svg)

Hexo site with a custom `academic` theme. Source lives on `blog-source`;
GitHub Actions builds it and force-pushes the result to `master`, which is what
GitHub Pages serves.

## Local development

```bash
npm ci
npm run server
```

`npm run build` runs the consistency check and then generates into `public/`.

## Adding a paper

A paper needs **two** files, and `npm run check` fails the build if either is
missing or if they disagree:

1. `source/_posts/<key>.md` — renders the paper page. Use `hexo new paper "<title>"`
   to get the scaffold, which lists every field.
2. `source/_data/pubs.bib` — feeds `/publications`. The entry must carry
   `publist_confkey` matching the post's `venue`, and
   `publist_link = {paper || /posts/<key>}`.

If the venue is new, also declare it under `venues:` in `source/publications.md`.

```bash
npm run check
```

## Theme layout

| Path | Purpose |
|---|---|
| `themes/academic/layout/` | EJS templates |
| `themes/academic/source/styles/` | CSS — edited directly, no build step |
| `themes/academic/source/js/` | Browser JS — edited directly, no build step |
| `themes/academic/_config.yml` | CV data: education, awards, links, avatar |
| `tools/check-publications.js` | Post ↔ BibTeX consistency check |

Stylesheets are served unminified; they total a few KB and gzip handles the
rest. Bump `assets_version` in `themes/academic/_config.yml` after editing CSS
or JS to bust caches for returning visitors.

Tailwind is used **only** by the floating-window chrome
(`layout/_partial/smart-window.ejs`); everything else is hand-written CSS.

## License

[GNU General Public License](LICENSE)

[CC BY-NC-SA 3.0 CN](https://creativecommons.org/licenses/by-nc-sa/3.0/cn/deed.zh)
