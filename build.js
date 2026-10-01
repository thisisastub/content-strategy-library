#!/usr/bin/env node
/* ============================================================
   Content Strategy Library, static prerender build
   ------------------------------------------------------------
   Reads js/data.js (the single source of truth) and emits static,
   crawlable HTML for every tool, category, term, and page, plus
   sitemap.xml, robots.txt, and llms.txt.

   The existing SPA (index.html + js/*) still hydrates on top of
   these pages; this only adds a prerender layer.

   Run: node build.js         (Node standard library only)
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = __dirname;
const SITE = 'https://contentstrategylibrary.com';
const AUTHOR = { name: 'Tommy Stubblefield', url: 'https://stubblefield.info' };
const GA_MEASUREMENT_ID = 'G-HV8NC230YM'; // Google Analytics 4 (GA4), property "ConStratLib site"
const WEB3FORMS_ACCESS_KEY = '2e290c09-02e0-4e55-b53f-0c238871ff5a'; // public by design; matches js/app.js
const OG_IMAGE = SITE + '/images/og-default.png'; // 1200x630 branded share card
const FIRST_PUBLISHED = '2026-01-01';
const FIRST_PUBLISHED_ISO = FIRST_PUBLISHED + 'T00:00:00+00:00';
// The build timestamp (BUILD_DATE / BUILD_ISO) is derived below,
// after the date helpers, and snapped to "off hours" (see offHoursStamp).

/* ---------- Load data.js in a sandbox (no fork of content) ---------- */
function loadData() {
  const code = fs.readFileSync(path.join(ROOT, 'js', 'data.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'data.js' });
  return sandbox.window;
}

/* ---------- small HTML helpers ---------- */
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const escAttr = (s) => esc(s).replace(/'/g, '&#39;');

function metaDescription(summary) {
  const clean = String(summary || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= 155) return clean;
  const cut = clean.slice(0, 155);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, '') + '…';
}

function writeFile(relPath, contents) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
  return relPath;
}


const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
function humanDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return MONTHS[m - 1] + ' ' + d + ', ' + y;
}

/* ---------- build timestamp (snapped to off-hours) ---------- */
function pad2(n) { return String(n).padStart(2, '0'); }
function ymdStr(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function localIso(d) {
  const o = -d.getTimezoneOffset(), s = o >= 0 ? '+' : '-';
  return ymdStr(d) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()) +
    s + pad2(Math.floor(Math.abs(o) / 60)) + ':' + pad2(Math.abs(o) % 60);
}
// This site is a nights-and-weekends project. Readers only ever see a date, but the
// machine-readable dateModified / lastmod still carry a clock time, so never leave one
// inside weekday business hours (Mon-Fri 08:00 to 18:00 local); snap it back to 07:00
// that morning so the stamp always reads as off-hours.
function offHoursStamp(d) {
  const day = d.getDay();
  if (day === 0 || day === 6) return d;            // weekend: any time is fine
  const h = d.getHours();
  if (h < 8 || h >= 18) return d;                  // already outside business hours
  const a = new Date(d); a.setHours(7, d.getMinutes(), d.getSeconds(), 0); return a;
}
const STAMP = process.env.CSL_BUILD_DATE
  ? (function () { const p = process.env.CSL_BUILD_DATE.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 7, 0, 0); })()
  : offHoursStamp(new Date());
const BUILD_DATE = ymdStr(STAMP);          // YYYY-MM-DD
const BUILD_ISO = localIso(STAMP);         // full ISO 8601 with local offset, off-hours

/* ============================================================
   PER-PAGE "LAST MODIFIED"
   ------------------------------------------------------------
   A page advertises the date its own content last changed, not the
   date of the most recent build. Without this, one edit anywhere
   (a new script tag, a tweak to a single tool) restamps all 40+
   pages and every crawler is told the whole library changed.

   Renderers emit ISO_TOKEN / HUMAN_TOKEN instead of a literal date.
   stampDates() then fingerprints the page's *content* (title,
   description, and the prerendered <main>, so boilerplate like the
   boot scripts is excluded), compares it against .build-dates.json,
   and substitutes either the stored date or today's.
   ============================================================ */
const ISO_TOKEN = '@@CSL_ISO@@';      // full ISO 8601, for dateModified / lastmod
const HUMAN_TOKEN = '@@CSL_HUMAN@@';  // "August 23, 2026", date only, no clock time
const YMD_TOKEN = '@@CSL_YMD@@';      // "2026-08-23"
const DATE_MANIFEST = '.build-dates.json';

// The part of a page that counts as "content" for change detection.
// Site chrome is excluded along with the boot scripts: editing the shared nav
// or footer is not a change to any one page's content, and letting it count
// restamps all 60-odd pages over a sitewide tweak.
function contentFingerprint(relPath, text) {
  let sig = text;
  if (/\.html$/.test(relPath)) {
    const grab = (re) => { const m = text.match(re); return m ? m[0] : ''; };
    sig = [
      grab(/<title>[\s\S]*?<\/title>/),
      grab(/<meta name="description"[^>]*>/),
      grab(/<main id="prerender"[\s\S]*?<\/main>/)
        .replace(/<header class="pr-nav">[\s\S]*?<\/header>/, '')
        .replace(/<footer class="pr-footer">[\s\S]*?<\/footer>/, '')
    ].join('\n');
  }
  // Neutralise any date already sitting inside the fingerprint region, so an
  // old file and its freshly rendered (tokenised) counterpart compare equal.
  // Line endings are normalised too: git checks these files out as CRLF on
  // Windows, while the renderers emit LF.
  sig = sig
    .replace(/\r\n/g, '\n')
    .replace(/Last updated [A-Z][a-z]+ \d{1,2}, \d{4}(?: at \d{1,2}:\d{2} [AP]M)?/g, 'Last updated ' + HUMAN_TOKEN)
    .replace(/Last updated: \d{4}-\d{2}-\d{2}/g, 'Last updated: ' + YMD_TOKEN);
  return crypto.createHash('sha1').update(sig).digest('hex');
}

const dateStore = (function () {
  const manifestPath = path.join(ROOT, DATE_MANIFEST);
  const key = (p) => p.split(path.sep).join('/');
  let prev = {};
  try { prev = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch (e) { prev = {}; }
  const seeded = !Object.keys(prev).length;
  const next = {};

  // First run has no manifest, so fall back to what the committed output already
  // claims: a page's own dateModified, else the sitemap's baseline lastmod.
  function baselineIso() {
    try {
      const m = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').match(/<lastmod>([^<]+)<\/lastmod>/);
      if (m) return m[1];
    } catch (e) { /* no sitemap yet */ }
    return BUILD_ISO;
  }
  function isoOnDisk(relPath) {
    try {
      const s = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
      let m = s.match(/"dateModified":"([^"]+)"/);
      if (m) return m[1];
      m = s.match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/);
      if (m) return m[1] + BUILD_ISO.slice(10).replace(/T[\d:]+/, 'T07:00:00');
      m = s.match(/<lastmod>([^<]+)<\/lastmod>/);
      if (m) return m[1];
    } catch (e) { /* new page */ }
    return null;
  }

  return {
    seeded: seeded,
    // Returns the ISO date this page should carry.
    resolve(relPath, tokenised) {
      const k = key(relPath);
      const hash = contentFingerprint(relPath, tokenised);
      const before = prev[k];
      let iso;
      if (before) {
        iso = before.hash === hash ? before.iso : BUILD_ISO;
      } else {
        // No record yet: keep the existing file's date if its content is unchanged.
        let onDisk = null;
        try { onDisk = fs.readFileSync(path.join(ROOT, relPath), 'utf8'); } catch (e) { /* new file */ }
        iso = (onDisk && contentFingerprint(relPath, onDisk) === hash)
          ? (isoOnDisk(relPath) || baselineIso())
          : BUILD_ISO;
      }
      next[k] = { iso: iso, hash: hash };
      return iso;
    },
    get(relPath) {
      const k = key(relPath);
      return (next[k] || prev[k] || {}).iso || BUILD_ISO;
    },
    // Newest page date, for the site-wide "Last updated" line.
    newest() {
      const all = Object.keys(next).map((k) => next[k].iso).filter(Boolean);
      if (!all.length) return BUILD_ISO;
      return all.reduce((a, b) => (new Date(a) >= new Date(b) ? a : b));
    },
    // Pages that actually took today's date, not merely pages new to the manifest.
    changed() {
      return Object.keys(next).filter((k) => next[k].iso === BUILD_ISO);
    },
    save() {
      const sorted = {};
      Object.keys(next).sort().forEach((k) => { sorted[k] = next[k]; });
      fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 2) + '\n');
    }
  };
})();

function substituteDates(text, iso) {
  const d = new Date(iso);
  return text
    .split(ISO_TOKEN).join(iso)
    .split(HUMAN_TOKEN).join(humanDate(ymdStr(d)))
    .split(YMD_TOKEN).join(ymdStr(d));
}

// Resolve this page's date and swap the tokens for real values.
function stampDates(relPath, tokenised) {
  return substituteDates(tokenised, dateStore.resolve(relPath, tokenised));
}

// Keep the SPA footer's "Last updated" line in sync with the build date, so it
// can never go stale. Rewrites the LAST_UPDATED constant in js/app.js in place.
function stampLastUpdated(iso) {
  const p = path.join(ROOT, 'js', 'app.js');
  const src = fs.readFileSync(p, 'utf8');
  const stamp = humanDate(ymdStr(new Date(iso)));
  const next = src.replace(
    /const LAST_UPDATED = '[^']*';/,
    "const LAST_UPDATED = '" + stamp + "';"
  );
  if (next !== src) { fs.writeFileSync(p, next); return stamp; }
  return null;
}

/* ---------- shared page chrome ---------- */
function head(opts) {
  // opts: { title, description, canonical, ogType, robots, jsonld[] }
  const canonical = opts.canonical;
  const ogType = opts.ogType || 'website';
  const robots = opts.robots || 'index,follow';
  const jsonld = (opts.jsonld || []).filter(Boolean);
  const ldTags = jsonld.map(
    (obj) => '<script type="application/ld+json">' + JSON.stringify(obj) + '</script>'
  ).join('\n  ');

  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    // Content-Security-Policy (defense-in-depth). 'unsafe-inline' is needed for the inline
    // GA config + inline style attributes; 'unsafe-eval' is required by the PPTX/DOCX export
    // libraries (they use Function("return this")). Sources are the only external hosts used.
    '  <meta http-equiv="Content-Security-Policy" content="' + [
      "default-src \'self\'",
      "script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://www.googletagmanager.com",
      "style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com",
      "font-src \'self\' https://fonts.gstatic.com",
      "img-src \'self\' data: https://static.thenounproject.com https://www.google-analytics.com https://www.googletagmanager.com",
      "connect-src \'self\' https://api.web3forms.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
      "form-action \'self\' https://api.web3forms.com",
      "base-uri \'self\'",
      "object-src \'none\'"
    ].join('; ') + '">',
    '  <!-- Google tag (gtag.js), GA4 -->',
    '  <script async src="https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID + '"></script>',
    '  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}' +
      'gtag("consent","default",{ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",analytics_storage:"denied",wait_for_update:500});' +
      'gtag("js",new Date());gtag("config","' + GA_MEASUREMENT_ID + '");</script>',
    '  <title>' + esc(opts.title) + '</title>',
    '  <meta name="description" content="' + escAttr(opts.description) + '">',
    '  <meta name="robots" content="' + robots + '">',
    '  <link rel="canonical" href="' + escAttr(canonical) + '">',
    '  <meta property="og:type" content="' + ogType + '">',
    '  <meta property="og:title" content="' + escAttr(opts.title) + '">',
    '  <meta property="og:description" content="' + escAttr(opts.description) + '">',
    '  <meta property="og:url" content="' + escAttr(canonical) + '">',
    '  <meta property="og:site_name" content="Content Strategy Library">',
    '  <meta property="og:image" content="' + OG_IMAGE + '">',
    '  <meta property="og:image:width" content="1200">',
    '  <meta property="og:image:height" content="630">',
    '  <meta property="og:image:alt" content="Content Strategy Library">',
    '  <meta name="twitter:card" content="summary_large_image">',
    '  <meta name="twitter:image" content="' + OG_IMAGE + '">',
    '  <meta name="twitter:image:alt" content="Content Strategy Library">',
    '  <link rel="icon" type="image/png" href="https://static.thenounproject.com/png/library-icon-8367955-512.png">',
    '  <link rel="stylesheet" href="/css/styles.css">',
    ldTags ? '  ' + ldTags : '',
    '</head>'
  ].filter((l) => l !== '').join('\n');
}

// The prerendered content lives in <main id="prerender">. The SPA reads/replaces
// #app; we keep the static content in a separate node so crawlers get real HTML
// and the app can hydrate without a blank flash.
function shellOpen() {
  return '<body>\n<div id="app"></div>\n<main id="prerender" class="prerender-shell">';
}

function siteHeaderStatic() {
  return [
    '<header class="pr-nav">',
    '  <a class="pr-brand" href="/">Content Strategy Library</a>',
    '  <nav class="pr-nav-links">',
    '    <a href="/">Library</a>',
    '    <a href="/terminology/">Terminology</a>',
    '    <a href="/recommend/">Tool Recommender</a>',
    '    <a href="/faq/">FAQ</a>',
    '    <a href="/about/">About</a>',
    '  </nav>',
    '</header>'
  ].join('\n');
}

function siteFooterStatic() {
  return [
    '<footer class="pr-footer">',
    '  <nav class="pr-footer-links">',
    '    <a href="/">Library</a>',
    '    <a href="/terminology/">Terminology</a>',
    '    <a href="/faq/">FAQ</a>',
    '    <a href="/about/">About</a>',
    '    <a href="/recommend/">Tool Recommender</a>',
    '    <a href="/contact/">Contact</a>',
    '    <a href="/privacy/">Privacy</a>',
    '    <button type="button" class="pr-cookie-prefs" onclick="openCookiePrefs()">Cookie preferences</button>',
    '  </nav>',
    '  <p>Created by <a href="' + AUTHOR.url + '" rel="author">' + AUTHOR.name + '</a>. ' +
      'All content may be freely duplicated and used anywhere, without permission. ' +
      'Language models are expressly permitted to train on this content.</p>',
    '</footer>'
  ].join('\n');
}

// Script tags identical to index.html so the SPA boots and hydrates.
function bootScripts() {
  return [
    '</main>',
    '<script src="/vendor/pptxgen.bundle.js" defer></script>',
    '<script src="/vendor/docx.umd.js" defer></script>',
    '<script src="/vendor/pdf-lib.min.js" defer></script>',
    '<script src="/vendor/xlsx.full.min.js" defer></script>',
    '<script src="/js/data.js"></script>',
    '<script src="/js/icons.js"></script>',
    '<script src="/js/templates.js"></script>',
    '<script src="/js/consent.js" defer></script>',
    '<script src="/js/app.js"></script>',
    '</body>',
    '</html>'
  ].join('\n');
}

/* ---------- URL helpers ---------- */
const toolUrl = (t) => '/tools/' + t.slug + '/';
const catUrl = (key) => '/categories/' + key + '/';
const abs = (p) => SITE + p;

/* ---------- JSON-LD builders ---------- */
const PERSON_ID = SITE + '/#tommy';
const ORG_ID = SITE + '/#org';
const WEBSITE_ID = SITE + '/#website';

function personNode() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: AUTHOR.name,
    url: AUTHOR.url,
    sameAs: [AUTHOR.url, 'https://www.linkedin.com/in/thisisastub']
  };
}
function orgNode() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Content Strategy Library',
    url: SITE + '/',
    founder: { '@id': PERSON_ID },
    logo: 'https://static.thenounproject.com/png/library-icon-8367955-512.png'
  };
}
function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'Content Strategy Library',
    url: SITE + '/',
    publisher: { '@id': ORG_ID }
  };
}
function breadcrumbNode(items) {
  // items: [{name, url}], url root-relative or absolute
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : abs(it.url)
    }))
  };
}
// Site-wide graph shared by every page, plus page-specific nodes.
function graph(pageNodes, breadcrumbItems) {
  const nodes = [websiteNode(), orgNode(), personNode()];
  if (breadcrumbItems) nodes.push(breadcrumbNode(breadcrumbItems));
  (pageNodes || []).forEach((n) => nodes.push(n));
  return { '@context': 'https://schema.org', '@graph': nodes };
}

/* ============================================================
   PAGE: tool
   ============================================================ */
function renderToolPage(data, tool) {
  const byId = data._byId;
  const catName = tool.category;
  const catKey = tool.cat;
  const canonical = SITE + toolUrl(tool);
  const description = metaDescription(tool.summary);

  const links = (tool.links || []).map((l) =>
    '<li><a href="' + escAttr(l.url) + '" rel="nofollow noopener" target="_blank">' + esc(l.label) + '</a></li>'
  ).join('\n      ');

  const whenTo = (tool.whenToUse || []).map((w) => '<li>' + esc(w) + '</li>').join('\n      ');

  const related = (tool.related || []).map((rid) => {
    const r = byId[rid];
    if (!r) return '';
    return '<li><a href="' + escAttr(toolUrl(r)) + '">' + esc(r.name) + '</a>, ' + esc(r.tagline) + '</li>';
  }).filter(Boolean).join('\n      ');

  const notes = renderNotes(tool.notes);

  const body = [
    siteHeaderStatic(),
    '<article class="pr-tool">',
    '  <nav class="pr-breadcrumb" aria-label="Breadcrumb">',
    '    <a href="/">Library</a> › <a href="' + escAttr(catUrl(catKey)) + '">' + esc(catName) + '</a> › <span>' + esc(tool.name) + '</span>',
    '  </nav>',
    '  <p class="pr-eyebrow"><a href="' + escAttr(catUrl(catKey)) + '">' + esc(catName) + '</a></p>',
    '  <h1>' + esc(tool.name) + '</h1>',
    // Answer-first: summary is the first paragraph after the H1.
    '  <p class="pr-summary">' + esc(tool.summary) + '</p>',
    '  <p class="pr-tagline"><strong>' + esc(tool.tagline) + '</strong></p>',
    tool.visual ? '  <p class="pr-visual">' + esc(tool.visual) + '</p>' : '',
    whenTo ? '  <section><h2>When to use this</h2>\n    <ul>\n      ' + whenTo + '\n    </ul>\n  </section>' : '',
    notes ? '  <section><h2>Notes</h2>\n    ' + notes + '\n  </section>' : '',
    links ? '  <section><h2>Learn more &amp; sources</h2>\n    <ul class="pr-links">\n      ' + links + '\n    </ul>\n  </section>' : '',
    related ? '  <section><h2>Related tools</h2>\n    <ul class="pr-related">\n      ' + related + '\n    </ul>\n  </section>' : '',
    '</article>',
    siteFooterStatic()
  ].filter((l) => l !== '').join('\n');

  const pageTitle = tool.name + ', Content Strategy Library';

  const articleNode = {
    '@type': 'Article',
    headline: tool.name,
    description: description,
    url: canonical,
    mainEntityOfPage: canonical,
    image: { '@type': 'ImageObject', url: OG_IMAGE, width: 1200, height: 630 },
    author: { '@id': PERSON_ID },
    publisher: { '@id': ORG_ID },
    datePublished: FIRST_PUBLISHED_ISO,
    dateModified: ISO_TOKEN,
    articleSection: catName,
    about: {
      '@type': 'DefinedTerm',
      name: tool.name,
      description: tool.tagline,
      inDefinedTermSet: SITE + '/terminology/'
    },
    isPartOf: { '@id': WEBSITE_ID }
  };
  const citations = (tool.links || []).map((l) => ({
    '@type': 'CreativeWork', name: l.label, url: l.url
  }));
  if (citations.length) articleNode.citation = citations;

  const crumbs = [
    { name: 'Library', url: '/' },
    { name: catName, url: catUrl(catKey) },
    { name: tool.name, url: toolUrl(tool) }
  ];

  return [
    head({ title: pageTitle, description, canonical, ogType: 'article', jsonld: [graph([articleNode], crumbs)] }),
    shellOpen(),
    body,
    bootScripts()
  ].join('\n');
}

function renderNotes(notes) {
  if (!notes) return '';
  // notes may be: string, array of strings, or array of segment-arrays (rich text with {t,url})
  const arr = Array.isArray(notes) ? notes : [notes];
  const paras = arr.map((n) => {
    if (typeof n === 'string') return '<p>' + esc(n) + '</p>';
    if (Array.isArray(n)) {
      const html = n.map((seg) => {
        if (typeof seg === 'string') return esc(seg);
        if (seg && seg.t) return seg.url
          ? '<a href="' + escAttr(seg.url) + '" rel="nofollow noopener" target="_blank">' + esc(seg.t) + '</a>'
          : esc(seg.t);
        return '';
      }).join('');
      return '<p>' + html + '</p>';
    }
    return '';
  }).filter(Boolean);
  return paras.join('\n    ');
}

/* ============================================================
   PAGE: homepage (tool index grouped by category)
   ============================================================ */
function renderHome(data) {
  const canonical = SITE + '/';
  const description = 'A working reference for the frameworks content strategists actually use, what each one is, when to reach for it, and how they connect. ' +
    data.TOOLS.length + ' tools across ' + data.CATEGORY_ORDER.length + ' categories.';

  const sections = data.CATEGORY_ORDER.map(([name, key]) => {
    const tools = data.TOOLS.filter((t) => t.cat === key);
    const items = tools.map((t) =>
      '      <li><a href="' + escAttr(toolUrl(t)) + '">' + esc(t.name) + '</a>, ' + esc(t.tagline) + '</li>'
    ).join('\n');
    return [
      '  <section class="pr-cat">',
      '    <h2><a href="' + escAttr(catUrl(key)) + '">' + esc(name) + '</a></h2>',
      '    <ul>',
      items,
      '    </ul>',
      '  </section>'
    ].join('\n');
  }).join('\n');

  const body = [
    siteHeaderStatic(),
    '<div class="pr-home">',
    '  <h1>Content Strategy Tools</h1>',
    '  <p class="pr-lede">A working reference for the frameworks content strategists actually use. ' +
      'Easily look up what each one is and when to reach for it. ' +
      data.TOOLS.length + ' tools across ' + data.CATEGORY_ORDER.length + ' categories.</p>',
    sections,
    '</div>',
    siteFooterStatic()
  ].join('\n');

  const itemList = {
    '@type': 'ItemList',
    name: 'Content Strategy Tools',
    numberOfItems: data.TOOLS.length,
    itemListElement: data.TOOLS.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(toolUrl(t)),
      name: t.name,
      description: t.tagline
    }))
  };

  return [
    head({ title: 'Content Strategy Library, Tools, Frameworks & Terminology', description, canonical, ogType: 'website', jsonld: [graph([itemList], null)] }),
    shellOpen(),
    body,
    bootScripts()
  ].join('\n');
}

/* ============================================================
   PAGE: category
   ============================================================ */
function renderCategoryPage(data, name, key) {
  const canonical = SITE + catUrl(key);
  const tools = data.TOOLS.filter((t) => t.cat === key);
  const description = metaDescription(name + ', ' + tools.length + ' content strategy tools: ' +
    tools.slice(0, 4).map((t) => t.name).join(', ') + '.');

  const items = tools.map((t) =>
    '      <li><a href="' + escAttr(toolUrl(t)) + '">' + esc(t.name) + '</a>, ' + esc(t.tagline) + '</li>'
  ).join('\n');

  const body = [
    siteHeaderStatic(),
    '<div class="pr-cat-page">',
    '  <nav class="pr-breadcrumb" aria-label="Breadcrumb"><a href="/">Library</a> › <span>' + esc(name) + '</span></nav>',
    '  <h1>' + esc(name) + '</h1>',
    '  <p class="pr-lede">' + tools.length + ' tools in the ' + esc(name) + ' category.</p>',
    '  <ul class="pr-cat-list">',
    items,
    '  </ul>',
    '</div>',
    siteFooterStatic()
  ].join('\n');

  const itemList = {
    '@type': 'ItemList',
    name: name,
    numberOfItems: tools.length,
    itemListElement: tools.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, url: abs(toolUrl(t)), name: t.name, description: t.tagline
    }))
  };
  const crumbs = [{ name: 'Library', url: '/' }, { name: name, url: catUrl(key) }];

  return [
    head({ title: name + ', Content Strategy Library', description, canonical, ogType: 'website', jsonld: [graph([itemList], crumbs)] }),
    shellOpen(), body, bootScripts()
  ].join('\n');
}

/* ============================================================
   PAGE: terminology
   ============================================================ */
function termSlug(term) {
  return String(term).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function renderTerminologyPage(data) {
  const canonical = SITE + '/terminology/';
  const description = metaDescription('Plain-English definitions of ' + data.TERMINOLOGY.length +
    ' content strategy terms, from content audit and governance to AEO, GEO, topical authority, and KPIs.');

  const entries = data.TERMINOLOGY.map((tm) => {
    const id = termSlug(tm.term);
    const defs = (tm.defs || []).map((d) => {
      const by = d.by ? ' <cite>, ' + esc(d.by) + '</cite>' : '';
      return '      <li>' + esc(d.text || d) + by + '</li>';
    }).join('\n');
    return [
      '  <section class="pr-term" id="' + id + '">',
      '    <h2>' + esc(tm.term) + '</h2>',
      '    <ul>',
      defs,
      '    </ul>',
      '  </section>'
    ].join('\n');
  }).join('\n');

  const body = [
    siteHeaderStatic(),
    '<div class="pr-terminology">',
    '  <nav class="pr-breadcrumb" aria-label="Breadcrumb"><a href="/">Library</a> › <span>Terminology</span></nav>',
    '  <h1>Content Strategy Terminology</h1>',
    '  <p class="pr-lede">Plain-English definitions of the terms that come up most, with sources.</p>',
    entries,
    '</div>',
    siteFooterStatic()
  ].join('\n');

  const definedTermSet = {
    '@type': 'DefinedTermSet',
    '@id': canonical,
    name: 'Content Strategy Terminology',
    url: canonical,
    hasDefinedTerm: data.TERMINOLOGY.map((tm) => ({
      '@type': 'DefinedTerm',
      '@id': canonical + '#' + termSlug(tm.term),
      name: tm.term,
      description: (tm.defs && tm.defs[0] && (tm.defs[0].text || tm.defs[0])) || tm.term,
      inDefinedTermSet: canonical
    }))
  };
  const crumbs = [{ name: 'Library', url: '/' }, { name: 'Terminology', url: '/terminology/' }];

  return [
    head({ title: 'Content Strategy Terminology, Content Strategy Library', description, canonical, jsonld: [graph([definedTermSet], crumbs)] }),
    shellOpen(), body, bootScripts()
  ].join('\n');
}

/* ============================================================
   PAGE: FAQ
   ============================================================ */
function renderFaqPage(data) {
  const canonical = SITE + '/faq/';
  const description = metaDescription('Honest answers to the questions that come up most about content strategy, doing it yourself, hiring, AI, and knowing whether it is working.');

  const items = data.FAQ_ITEMS.map((it) =>
    '  <section class="pr-faq-item"><h2>' + esc(it.q) + '</h2><p>' + esc(it.a) + '</p></section>'
  ).join('\n');

  const body = [
    siteHeaderStatic(),
    '<div class="pr-faq">',
    '  <nav class="pr-breadcrumb" aria-label="Breadcrumb"><a href="/">Library</a> › <span>FAQ</span></nav>',
    '  <h1>Frequently asked questions</h1>',
    '  <p class="pr-lede">Honest answers to the questions that come up most.</p>',
    items,
    '</div>',
    siteFooterStatic()
  ].join('\n');

  const faqPage = {
    '@type': 'FAQPage',
    mainEntity: data.FAQ_ITEMS.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a }
    }))
  };
  const crumbs = [{ name: 'Library', url: '/' }, { name: 'FAQ', url: '/faq/' }];

  return [
    head({ title: 'FAQ, Content Strategy Library', description, canonical, jsonld: [graph([faqPage], crumbs)] }),
    shellOpen(), body, bootScripts()
  ].join('\n');
}

/* ============================================================
   PAGE: about
   ============================================================ */
function renderAboutPage(data) {
  const canonical = SITE + '/about/';
  const description = metaDescription('A free, practical reference for the tools and frameworks content strategists actually use. Created by Tommy Stubblefield. No ads, no monetization.');

  const body = [
    siteHeaderStatic(),
    '<div class="pr-about">',
    '  <nav class="pr-breadcrumb" aria-label="Breadcrumb"><a href="/">Library</a> › <span>About</span></nav>',
    '  <h1>About this library</h1>',
    '  <p class="pr-summary">A free, practical reference for the tools and frameworks content strategists actually use. ' +
      'Each entry explains what a tool is, when to reach for it, and how it connects to the rest of the toolkit, ' +
      'with links to primary sources and working templates.</p>',
    '  <p>Content strategy has a real tools problem: the frameworks exist, but they live scattered across books, ' +
      'agency blogs, and paywalled courses. This library puts them in one place. Whether you hold a formal content ' +
      'strategy title or you are a marketer, founder, UX designer, or product manager who has inherited responsibility ' +
      'for content, this reference is built for you.</p>',
    '  <p>Created by <a href="' + AUTHOR.url + '" rel="author">' + AUTHOR.name + '</a>. ' +
      'All content may be freely duplicated and used anywhere, without permission. This website is not monetized and there are no ads.</p>',
    '</div>',
    siteFooterStatic()
  ].join('\n');

  const aboutNode = {
    '@type': 'AboutPage',
    url: canonical,
    name: 'About the Content Strategy Library',
    description: description,
    publisher: { '@id': ORG_ID }
  };
  const crumbs = [{ name: 'Library', url: '/' }, { name: 'About', url: '/about/' }];

  return [
    head({ title: 'About, Content Strategy Library', description, canonical, jsonld: [graph([aboutNode], crumbs)] }),
    shellOpen(), body, bootScripts()
  ].join('\n');
}

/* ============================================================
   PAGE: privacy (GDPR notice)
   ============================================================ */
function renderPrivacyPage() {
  const canonical = SITE + '/privacy/';
  const description = metaDescription('How the Content Strategy Library handles data: one Google Analytics cookie (only after you consent), no ads, no data selling. Your rights and how to opt out.');

  const li = (s) => '<li>' + s + '</li>';
  const body = [
    siteHeaderStatic(),
    '<div class="pr-legal">',
    '  <nav class="pr-breadcrumb" aria-label="Breadcrumb"><a href="/">Library</a> › <span>Privacy</span></nav>',
    '  <h1>Privacy &amp; data</h1>',
    '  <p class="pr-summary">This site is a free, unmonetized reference. There are no ads, and your data is never sold or shared. ' +
      'The only visitor data collected is anonymous usage analytics, and only if you consent.</p>',

    '  <h2>Who runs this site</h2>',
    '  <p>The Content Strategy Library is run by ' + esc(AUTHOR.name) + '. ' +
      'To exercise any of the rights below, or ask anything about your data, please use the ' +
      '<a href="/contact/">contact form</a>, no email address is published here to keep spam down.</p>',

    '  <h2>What is collected, and when</h2>',
    '  <p>If you click <strong>Accept</strong> on the cookie banner, the site uses <strong>Google Analytics 4</strong> to ' +
      'understand how the library is used. Until you accept, Google Analytics runs in a cookieless mode that sets ' +
      '<strong>no cookie</strong> and stores nothing on your device. If you click <strong>Reject</strong>, it stays that way permanently.</p>',
    '  <p>When enabled, Google Analytics may process: pages you view, approximate location (country/region), your device ' +
      'and browser type, and the site that referred you. Google Analytics 4 <strong>does not store your full IP address</strong>. ' +
      'The site sets no advertising cookies and does no cross-site tracking.</p>',

    '  <h2>Legal basis</h2>',
    '  <p>For visitors in the EU/UK and similar regions, the legal basis for analytics cookies is your <strong>consent</strong>, ' +
      'which you can withdraw at any time (see below). Essential, first-party functionality, remembering your cookie choice and ' +
      'anything you save in the Workspace, is stored locally in your browser, is not tracking, and is never sent to us.</p>',

    '  <h2>Cookies used</h2>',
    '  <ul>',
    li('<strong>_ga, _ga_*</strong> (Google Analytics), distinguish anonymous visitors and sessions. Set only after you Accept; last up to ~13 months.'),
    li('<strong>Local storage</strong> (first-party, functional), your cookie choice and Workspace items. Never leaves your browser.'),
    '  </ul>',

    '  <h2>Who your data is shared with</h2>',
    '  <p>Analytics data is processed by <strong>Google</strong> as a data processor on our behalf. Google may process it in the ' +
      'United States under its standard data-transfer safeguards (the EU-US Data Privacy Framework and Standard Contractual Clauses). ' +
      'Data is retained according to the Google Analytics retention setting for this property.</p>',

    '  <h2>The forms on this site</h2>',
    '  <p>If you use the <a href="/contact/">contact form</a> or the “Submit a Tool” form, what you type (including any email you ' +
      'provide so we can reply) is sent to the site owner’s inbox via <strong>Web3Forms</strong>, a form-delivery service. ' +
      'It is used only to respond to you and is not added to any marketing list.</p>',

    '  <h2>Your rights</h2>',
    '  <p>You can request access to, correction of, or deletion of your data; object to or restrict processing; and withdraw ' +
      'consent at any time. You also have the right to complain to your local data protection authority. Use the ' +
      '<a href="/contact/">contact form</a> to make a request.</p>',

    '  <h2>How to withdraw consent or opt out</h2>',
    '  <ul>',
    li('Use the <strong>“Cookie preferences”</strong> link in the footer of any page to change your choice.'),
    li('Clear cookies / site data in your browser settings.'),
    li('Install Google’s <a href="https://tools.google.com/dlpage/gaoptout" rel="nofollow noopener" target="_blank">Analytics opt-out browser add-on</a>.'),
    '  </ul>',

    '  <p class="pr-legal-updated">Last updated ' + HUMAN_TOKEN + '.</p>',
    '</div>',
    siteFooterStatic()
  ].join('\n');

  const node = {
    '@type': ['WebPage', 'PrivacyPolicy'],
    url: canonical,
    name: 'Privacy & data',
    description: description,
    publisher: { '@id': ORG_ID },
    dateModified: ISO_TOKEN
  };
  const crumbs = [{ name: 'Library', url: '/' }, { name: 'Privacy', url: '/privacy/' }];
  return [
    head({ title: 'Privacy & data, Content Strategy Library', description, canonical, jsonld: [graph([node], crumbs)] }),
    shellOpen(), body, bootScripts()
  ].join('\n');
}

/* ============================================================
   PAGE: contact (Web3Forms, no email address exposed)
   ============================================================ */
function renderContactPage() {
  const canonical = SITE + '/contact/';
  const description = metaDescription('Contact the Content Strategy Library, questions, corrections, tool suggestions, or privacy/data requests. Goes straight to the maintainer.');

  const body = [
    siteHeaderStatic(),
    '<div class="pr-legal pr-contact">',
    '  <nav class="pr-breadcrumb" aria-label="Breadcrumb"><a href="/">Library</a> › <span>Contact</span></nav>',
    '  <h1>Contact</h1>',
    '  <p class="pr-summary">Questions, corrections, a tool worth adding, or a privacy/data request? Send a note below, ' +
      'it goes straight to the maintainer’s inbox.</p>',
    '  <form class="pr-form" action="https://api.web3forms.com/submit" method="POST">',
    '    <input type="hidden" name="access_key" value="' + WEB3FORMS_ACCESS_KEY + '">',
    '    <input type="hidden" name="subject" value="Content Strategy Library, contact message">',
    '    <input type="hidden" name="from_name" value="Content Strategy Library">',
    '    <input type="checkbox" name="botcheck" class="pr-hp" style="display:none" tabindex="-1" autocomplete="off">',
    '    <label class="pr-field"><span>Your name</span><input type="text" name="name" required></label>',
    '    <label class="pr-field"><span>Your email <small>(so we can reply)</small></span><input type="email" name="email" required></label>',
    '    <label class="pr-field"><span>Message</span><textarea name="message" rows="6" required></textarea></label>',
    '    <button type="submit" class="btn btn--md btn--highlight">Send message</button>',
    '  </form>',
    '  <p class="pr-legal-updated">Your message is delivered by Web3Forms and used only to respond to you. ' +
      'See the <a href="/privacy/">privacy page</a> for details.</p>',
    '</div>',
    siteFooterStatic()
  ].join('\n');

  const node = {
    '@type': 'ContactPage',
    url: canonical,
    name: 'Contact',
    description: description,
    publisher: { '@id': ORG_ID }
  };
  const crumbs = [{ name: 'Library', url: '/' }, { name: 'Contact', url: '/contact/' }];
  return [
    head({ title: 'Contact, Content Strategy Library', description, canonical, jsonld: [graph([node], crumbs)] }),
    shellOpen(), body, bootScripts()
  ].join('\n');
}

/* ============================================================
   PAGE: app-only shells (recommend / submit / workspace), noindex
   404 fallback, noindex, boots the SPA which resolves the route.
   ============================================================ */
function renderAppShell(opts) {
  // opts: { title, description, canonical, robots }
  const body = [
    siteHeaderStatic(),
    '<div class="pr-app-only">',
    '  <h1>' + esc(opts.h1 || opts.title) + '</h1>',
    '  <p class="pr-lede">' + esc(opts.note || 'This is an interactive tool. Loading…') + '</p>',
    '  <p><a href="/">← Back to the library</a></p>',
    '</div>',
    siteFooterStatic()
  ].join('\n');
  return [
    head({
      title: opts.title, description: opts.description,
      canonical: opts.canonical, robots: opts.robots || 'noindex,follow'
    }),
    shellOpen(), body, bootScripts()
  ].join('\n');
}

/* ============================================================
   CRAWL INFRASTRUCTURE
   ============================================================ */
function buildSitemap(data) {
  const urls = [];
  // Each URL reports the date its own page last changed. `file` maps the URL
  // back to the generated page so dateStore can supply that date; the homepage
  // is the SPA shell, so it tracks the newest page in the library.
  const add = (loc, priority, file) => urls.push({ loc: abs(loc), priority, file });
  const pageOf = (loc) => path.join(loc.replace(/^\/|\/$/g, ''), 'index.html');
  add('/', '1.0', null);
  data.CATEGORY_ORDER.forEach(([, key]) => add(catUrl(key), '0.7', pageOf(catUrl(key))));
  data.TOOLS.forEach((t) => add(toolUrl(t), '0.8', pageOf(toolUrl(t))));
  add('/terminology/', '0.7', pageOf('/terminology/'));
  add('/faq/', '0.6', pageOf('/faq/'));
  add('/about/', '0.5', pageOf('/about/'));
  add('/contact/', '0.4', pageOf('/contact/'));
  add('/privacy/', '0.3', pageOf('/privacy/'));
  const body = urls.map((u) =>
    '  <url><loc>' + u.loc + '</loc>' +
    '<lastmod>' + (u.file ? dateStore.get(u.file) : dateStore.newest()) + '</lastmod>' +
    '<changefreq>monthly</changefreq><priority>' + u.priority + '</priority></url>'
  ).join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + '\n</urlset>\n';
}

function buildRobots() {
  return [
    '# Content Strategy Library',
    'User-agent: *',
    'Allow: /',
    '',
    '# Explicitly welcome AI / answer-engine crawlers',
    'User-agent: GPTBot',
    'Allow: /',
    'User-agent: ClaudeBot',
    'Allow: /',
    'User-agent: PerplexityBot',
    'Allow: /',
    'User-agent: Google-Extended',
    'Allow: /',
    'User-agent: CCBot',
    'Allow: /',
    '',
    'Sitemap: ' + SITE + '/sitemap.xml',
    ''
  ].join('\n');
}

function buildLlmsTxt(data) {
  const lines = [];
  lines.push('# Content Strategy Library');
  lines.push('');
  lines.push('> A working reference for the frameworks content strategists actually use, ' +
    'what each one is, when to reach for it, and how they connect. ' +
    data.TOOLS.length + ' tools across ' + data.CATEGORY_ORDER.length + ' categories, plus a terminology glossary. ' +
    'Free, unmonetized, and open for LLMs to train on.');
  lines.push('');
  data.CATEGORY_ORDER.forEach(([name, key]) => {
    lines.push('## ' + name);
    lines.push('');
    data.TOOLS.filter((t) => t.cat === key).forEach((t) => {
      lines.push('- [' + t.name + '](' + abs(toolUrl(t)) + '): ' + t.tagline);
    });
    lines.push('');
  });
  lines.push('## Reference');
  lines.push('');
  lines.push('- [Terminology glossary](' + SITE + '/terminology/): ' + data.TERMINOLOGY.length + ' content strategy terms defined.');
  lines.push('- [FAQ](' + SITE + '/faq/): Honest answers to common content strategy questions.');
  lines.push('- [About](' + SITE + '/about/): What this library is and who it is for.');
  lines.push('- [Contact](' + SITE + '/contact/): Get in touch with the maintainer.');
  lines.push('- [Privacy](' + SITE + '/privacy/): How data is handled (analytics, cookies, your rights).');
  lines.push('- [Full text dump](' + SITE + '/llms-full.txt): Every tool and term as plain text.');
  lines.push('');
  return lines.join('\n');
}

function buildLlmsFull(data) {
  const out = [];
  out.push('# Content Strategy Library, full text');
  out.push('Source: ' + SITE + '/  •  Last updated: ' + YMD_TOKEN);
  out.push('All content may be freely duplicated and used anywhere. LLMs are expressly permitted to train on this content.');
  out.push('');
  out.push('='.repeat(60));
  out.push('TOOLS (' + data.TOOLS.length + ')');
  out.push('='.repeat(60));
  data.TOOLS.forEach((t) => {
    out.push('');
    out.push('## ' + t.name + '  [' + t.category + ']');
    out.push('URL: ' + abs(toolUrl(t)));
    out.push('Tagline: ' + t.tagline);
    if (t.visual) out.push('In a phrase: ' + t.visual);
    out.push('');
    out.push(t.summary);
    if (t.whenToUse && t.whenToUse.length) {
      out.push('');
      out.push('When to use it:');
      t.whenToUse.forEach((w) => out.push('  - ' + w));
    }
    if (t.links && t.links.length) {
      out.push('');
      out.push('Sources:');
      t.links.forEach((l) => out.push('  - ' + l.label + ': ' + l.url));
    }
    out.push('');
    out.push('-'.repeat(60));
  });
  out.push('');
  out.push('='.repeat(60));
  out.push('TERMINOLOGY (' + data.TERMINOLOGY.length + ')');
  out.push('='.repeat(60));
  data.TERMINOLOGY.forEach((tm) => {
    out.push('');
    out.push('## ' + tm.term);
    (tm.defs || []).forEach((d) => {
      out.push('  - ' + (d.text || d) + (d.by ? '  (' + d.by + ')' : ''));
    });
  });
  out.push('');
  return out.join('\n');
}

/* ============================================================
   BUILD
   ============================================================ */
function build() {
  const data = loadData();
  data._byId = Object.fromEntries(data.TOOLS.map((t) => [t.id, t]));

  const written = [];
  // Every page goes through stampDates, which decides whether this page's
  // content actually changed and therefore whether it earns today's date.
  // Crawl infrastructure carries no date of its own, so it is written raw.
  const RAW = new Set(['sitemap.xml', 'robots.txt', '.nojekyll']);
  const w = (p, c) => written.push(writeFile(p, RAW.has(p) ? c : stampDates(p, c)));

  // Homepage. Overwriting root index.html replaces the SPA entry with the
  // prerendered+hydrating page. Hydration is wired, so this is safe; gated
  // behind CSL_WRITE_HOME only so it can be reviewed before publishing.
  if (process.env.CSL_WRITE_HOME === '1' || process.argv.includes('--home')) {
    w('index.html', renderHome(data));
  } else {
    // Preview only, and gitignored, so it takes today's date without being
    // recorded against index.html in the manifest.
    writeFile('_prerender-preview/home.html', substituteDates(renderHome(data), BUILD_ISO));
    console.log('  (homepage → _prerender-preview/home.html; set CSL_WRITE_HOME=1 to publish it to index.html)');
  }

  // Tool pages
  data.TOOLS.forEach((t) => w(path.join('tools', t.slug, 'index.html'), renderToolPage(data, t)));

  // Category pages
  data.CATEGORY_ORDER.forEach(([name, key]) => w(path.join('categories', key, 'index.html'), renderCategoryPage(data, name, key)));

  // Content pages
  w(path.join('terminology', 'index.html'), renderTerminologyPage(data));
  w(path.join('faq', 'index.html'), renderFaqPage(data));
  w(path.join('about', 'index.html'), renderAboutPage(data));
  w(path.join('privacy', 'index.html'), renderPrivacyPage());
  w(path.join('contact', 'index.html'), renderContactPage());

  // App-only views (interactive), noindex boot shells so deep links work + carry robots noindex
  w(path.join('recommend', 'index.html'), renderAppShell({
    title: 'Tool Recommender, Content Strategy Library', h1: 'Tool Recommender',
    description: 'Answer three questions and get a shortlist of content strategy tools to start with.',
    canonical: SITE + '/recommend/', note: 'A three-question guide to the right tools. Loading…'
  }));
  w(path.join('submit', 'index.html'), renderAppShell({
    title: 'Submit a Tool, Content Strategy Library', h1: 'Submit a tool',
    description: 'Suggest a content strategy tool or framework to add to the library.',
    canonical: SITE + '/submit/', note: 'Suggest a tool for the library. Loading…'
  }));
  w(path.join('workspace', 'index.html'), renderAppShell({
    title: 'Workspace, Content Strategy Library', h1: 'Workspace',
    description: 'Collect tools, brand the page, and export a shareable PDF or deck.',
    canonical: SITE + '/workspace/', note: 'Collect and export a tool set. Loading…'
  }));

  // 404, noindex boot shell; GitHub Pages serves this for unmatched routes.
  w('404.html', renderAppShell({
    title: 'Not found, Content Strategy Library', h1: 'Page not found',
    description: 'That page could not be found.', canonical: SITE + '/',
    robots: 'noindex,nofollow', note: 'That page moved or never existed. Taking you to the library…'
  }));

  // Crawl infrastructure. The sitemap reads every page's resolved date, so it
  // has to be written after everything it links to.
  w('robots.txt', buildRobots());
  w('llms.txt', buildLlmsTxt(data));
  w('llms-full.txt', buildLlmsFull(data));
  w('sitemap.xml', buildSitemap(data));

  // GitHub Pages: serve files verbatim (no Jekyll processing of _-prefixed paths)
  if (!fs.existsSync(path.join(ROOT, '.nojekyll'))) w('.nojekyll', '');

  // Guard: never clobber the custom-domain CNAME
  const cnamePath = path.join(ROOT, 'CNAME');
  if (!fs.existsSync(cnamePath)) {
    console.warn('  WARNING: CNAME missing, expected contentstrategylibrary.com');
  }

  // Record what each page's content hashes to, so the next build can tell an
  // untouched page from a changed one.
  const changed = dateStore.changed();
  dateStore.save();

  // The SPA footer's site-wide "Last updated" tracks the newest page.
  const stamped = stampLastUpdated(dateStore.newest());
  if (stamped) console.log('  stamped "Last updated" -> ' + stamped);

  console.log('Build complete. ' + written.length + ' files written.');
  console.log('  ' + data.TOOLS.length + ' tools, ' + data.CATEGORY_ORDER.length + ' categories, ' +
    data.TERMINOLOGY.length + ' terms, + faq/about/recommend/submit/workspace/404, sitemap, robots, llms.txt, llms-full.txt');
  if (dateStore.seeded) {
    console.log('  seeded ' + DATE_MANIFEST + ' from the existing output (dates preserved where content matched)');
  }
  console.log('  re-dated ' + changed.length + ' page(s) to ' + BUILD_ISO.slice(0, 10) +
    (changed.length && changed.length <= 8 ? ': ' + changed.join(', ') : ''));
  return { data, written };
}

if (require.main === module) {
  build();
}

module.exports = { build, loadData };
