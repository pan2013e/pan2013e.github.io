#!/usr/bin/env node
/*
 * Guards the one place this site can silently lose data.
 *
 * A paper lives in two files: source/_posts/<key>.md renders the paper page,
 * and source/_data/pubs.bib feeds the full publication list. Nothing links
 * them, so adding a post without a matching bib entry drops the paper from
 * /publications with no error — which is exactly what happened to ASE'26 in
 * commit 5f9636c.
 *
 * Checks, in both directions:
 *   1. every `layout: paper` post is referenced by some entry's publist_link
 *   2. every publist_link points at a post that exists
 *   3. the post's `venue` matches the entry's publist_confkey
 *   4. every publist_confkey is declared in source/publications.md
 *
 * Exits non-zero on any mismatch. Wired into `npm test` and CI.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'source', '_posts');
const BIB_FILE = path.join(ROOT, 'source', '_data', 'pubs.bib');
const PUBS_PAGE = path.join(ROOT, 'source', 'publications.md');

const problems = [];

function frontMatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    fields[kv[1]] = kv[2].trim().replace(/^["'](.*)["']$/, '$1');
  }
  return fields;
}

// --- collect papers -------------------------------------------------------

const papers = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ slug: path.basename(f, '.md'), fm: frontMatter(fs.readFileSync(path.join(POSTS_DIR, f), 'utf8')) }))
  .filter((p) => p.fm.layout === 'paper');

if (papers.length === 0) {
  console.error('check-publications: found no `layout: paper` posts — is source/_posts/ populated?');
  process.exit(1);
}

// --- collect bib entries --------------------------------------------------

const bib = fs.readFileSync(BIB_FILE, 'utf8');
const entries = [];
const entryRe = /@\w+\s*\{\s*([^,\s]+)\s*,([\s\S]*?)\n\}/g;
let m;
while ((m = entryRe.exec(bib)) !== null) {
  const body = m[2];
  const field = (name) => {
    const f = new RegExp(`${name}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*,`).exec(body);
    return f ? f[1].trim() : null;
  };
  const link = field('publist_link');
  entries.push({
    key: m[1],
    confkey: field('publist_confkey'),
    // publist_link is `name || /path`
    postPath: link ? link.split('||').pop().trim().replace(/^\/+|\/+$/g, '') : null,
  });
}

// --- 1 & 3: every paper post is in the bib, with a matching venue ----------

for (const paper of papers) {
  const expected = `posts/${paper.slug}`;
  const entry = entries.find((e) => e.postPath === expected);

  if (!entry) {
    problems.push(
      `source/_posts/${paper.slug}.md ("${paper.fm.title}") has no entry in source/_data/pubs.bib.\n` +
        `    It will render at /${expected} but will be missing from /publications.\n` +
        `    Add an entry with: publist_link = {paper || /${expected}}`
    );
    continue;
  }

  if (paper.fm.venue && entry.confkey && paper.fm.venue !== entry.confkey) {
    problems.push(
      `Venue mismatch for ${paper.slug}: front matter says venue "${paper.fm.venue}", ` +
        `pubs.bib entry @${entry.key} says publist_confkey "${entry.confkey}".`
    );
  }
}

// --- 2: every bib link points at a real post ------------------------------

for (const entry of entries) {
  if (!entry.postPath) continue;
  const slug = entry.postPath.replace(/^posts\//, '');
  if (!fs.existsSync(path.join(POSTS_DIR, `${slug}.md`))) {
    problems.push(
      `pubs.bib entry @${entry.key} links to /${entry.postPath}, but ` +
        `source/_posts/${slug}.md does not exist.`
    );
  }
}

// --- 4: every venue key is declared on the publications page --------------

const pubsPage = fs.readFileSync(PUBS_PAGE, 'utf8');
const declaredKeys = new Set(
  Array.from(pubsPage.matchAll(/^\s*-\s*key:\s*(.+?)\s*$/gm), (x) => x[1].replace(/^["'](.*)["']$/, '$1'))
);

for (const entry of entries) {
  if (!entry.confkey) continue;
  // arXiv keys are matched by regex (arXiv-all), not declared literally.
  const declared =
    declaredKeys.has(entry.confkey) ||
    (entry.confkey.startsWith('arXiv:') && declaredKeys.has('arXiv-all'));
  if (!declared) {
    problems.push(
      `pubs.bib entry @${entry.key} uses publist_confkey "${entry.confkey}", ` +
        `which is not declared under \`venues:\` in source/publications.md.`
    );
  }
}

// --- report ---------------------------------------------------------------

if (problems.length > 0) {
  console.error(`\ncheck-publications: ${problems.length} problem(s) found\n`);
  problems.forEach((p, i) => console.error(`  ${i + 1}. ${p}\n`));
  process.exit(1);
}

console.log(`check-publications: ok — ${papers.length} paper(s), ${entries.length} bib entr(ies) consistent`);
