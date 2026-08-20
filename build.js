#!/usr/bin/env node
/* ============================================================
   Content Strategy Library — static prerender build
   ------------------------------------------------------------
   Reads js/data.js (the single source of truth) and emits static,
   crawlable HTML for every tool, category, term, and page — plus
   sitemap.xml, robots.txt, and llms.txt.

   The existing SPA (index.html + js/*) still hydrates on top of
   these pages; this only adds a prerender layer.

   Run: node build.js         (Node standard library only)
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const SITE = 'https://contentstrategylibrary.com';
const AUTHOR = { name: 'Tommy Stubblefield', url: 'https://stubblefield.info' };
const BUILD_DATE = process.env.CSL_BUILD_DATE || new Date().toISOString().slice(0, 10); // YYYY-MM-DD (sitemap lastmod)
const FIRST_PUBLISHED = '2026-01-01';
// Full ISO 8601 with timezone offset for schema.org datePublished/dateModified.
// (Bare YYYY-MM-DD is flagged by Google's Rich Results Test as missing a timezone.)
const isoDateTime = (ymd) => ymd + 'T00:00:00+00:00';
const FIRST_PUBLISHED_ISO = isoDateTime(FIRST_PUBLISHED);
const BUILD_ISO = isoDateTime(BUILD_DATE);

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
    '  <title>' + esc(opts.title) + '</title>',
    '  <meta name="description" content="' + escAttr(opts.description) + '">',
    '  <meta name="robots" content="' + robots + '">',
    '  <link rel="canonical" href="' + escAttr(canonical) + '">',
    '  <meta property="og:type" content="' + ogType + '">',
    '  <meta property="og:title" content="' + escAttr(opts.title) + '">',
    '  <meta property="og:description" content="' + escAttr(opts.description) + '">',
    '  <meta property="og:url" content="' + escAttr(canonical) + '">',
    '  <meta property="og:site_name" content="Content Strategy Library">',
    '  <meta name="twitter:card" content="summary">',
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
    '<script src="https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js" defer></script>',
    '<script src="https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js" defer></script>',
    '<script src="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js" defer></script>',
    '<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js" defer></script>',
    '<script src="/js/data.js"></script>',
    '<script src="/js/icons.js"></script>',
    '<script src="/js/templates.js"></script>',
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
    sameAs: [AUTHOR.url, 'https://www.linkedin.com/in/tommystubblefield/']
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
  // items: [{name, url}] — url root-relative or absolute
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
    return '<li><a href="' + escAttr(toolUrl(r)) + '">' + esc(r.name) + '</a> — ' + esc(r.tagline) + '</li>';
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

  const pageTitle = tool.name + ' — Content Strategy Library';

  const articleNode = {
    '@type': 'Article',
    headline: tool.name,
    description: description,
    url: canonical,
    mainEntityOfPage: canonical,
    author: { '@id': PERSON_ID },
    publisher: { '@id': ORG_ID },
    datePublished: FIRST_PUBLISHED_ISO,
    dateModified: BUILD_ISO,
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
  const description = 'A working reference for the frameworks content strategists actually use — what each one is, when to reach for it, and how they connect. ' +
    data.TOOLS.length + ' tools across ' + data.CATEGORY_ORDER.length + ' categories.';

  const sections = data.CATEGORY_ORDER.map(([name, key]) => {
    const tools = data.TOOLS.filter((t) => t.cat === key);
    const items = tools.map((t) =>
      '      <li><a href="' + escAttr(toolUrl(t)) + '">' + esc(t.name) + '</a> — ' + esc(t.tagline) + '</li>'
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
    head({ title: 'Content Strategy Library — Tools, Frameworks & Terminology', description, canonical, ogType: 'website', jsonld: [graph([itemList], null)] }),
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
  const description = metaDescription(name + ' — ' + tools.length + ' content strategy tools: ' +
    tools.slice(0, 4).map((t) => t.name).join(', ') + '.');

  const items = tools.map((t) =>
    '      <li><a href="' + escAttr(toolUrl(t)) + '">' + esc(t.name) + '</a> — ' + esc(t.tagline) + '</li>'
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
    head({ title: name + ' — Content Strategy Library', description, canonical, ogType: 'website', jsonld: [graph([itemList], crumbs)] }),
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
    ' content strategy terms — from content audit and governance to AEO, GEO, topical authority, and KPIs.');

  const entries = data.TERMINOLOGY.map((tm) => {
    const id = termSlug(tm.term);
    const defs = (tm.defs || []).map((d) => {
      const by = d.by ? ' <cite>— ' + esc(d.by) + '</cite>' : '';
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
    head({ title: 'Content Strategy Terminology — Content Strategy Library', description, canonical, jsonld: [graph([definedTermSet], crumbs)] }),
    shellOpen(), body, bootScripts()
  ].join('\n');
}

/* ============================================================
   PAGE: FAQ
   ============================================================ */
function renderFaqPage(data) {
  const canonical = SITE + '/faq/';
  const description = metaDescription('Honest answers to the questions that come up most about content strategy — doing it yourself, hiring, AI, and knowing whether it is working.');

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
    head({ title: 'FAQ — Content Strategy Library', description, canonical, jsonld: [graph([faqPage], crumbs)] }),
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
    head({ title: 'About — Content Strategy Library', description, canonical, jsonld: [graph([aboutNode], crumbs)] }),
    shellOpen(), body, bootScripts()
  ].join('\n');
}

/* ============================================================
   PAGE: app-only shells (recommend / submit / workspace) — noindex
   404 fallback — noindex, boots the SPA which resolves the route.
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
  const add = (loc, priority) => urls.push({ loc: abs(loc), priority });
  add('/', '1.0');
  data.CATEGORY_ORDER.forEach(([, key]) => add(catUrl(key), '0.7'));
  data.TOOLS.forEach((t) => add(toolUrl(t), '0.8'));
  add('/terminology/', '0.7');
  add('/faq/', '0.6');
  add('/about/', '0.5');
  const body = urls.map((u) =>
    '  <url><loc>' + u.loc + '</loc><lastmod>' + BUILD_DATE + '</lastmod>' +
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
  lines.push('> A working reference for the frameworks content strategists actually use — ' +
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
  lines.push('- [Full text dump](' + SITE + '/llms-full.txt): Every tool and term as plain text.');
  lines.push('');
  return lines.join('\n');
}

function buildLlmsFull(data) {
  const out = [];
  out.push('# Content Strategy Library — full text');
  out.push('Source: ' + SITE + '/  •  Last updated: ' + BUILD_DATE);
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
  const w = (p, c) => written.push(writeFile(p, c));

  // Homepage. Overwriting root index.html replaces the SPA entry with the
  // prerendered+hydrating page. Hydration is wired, so this is safe; gated
  // behind CSL_WRITE_HOME only so it can be reviewed before publishing.
  if (process.env.CSL_WRITE_HOME === '1' || process.argv.includes('--home')) {
    w('index.html', renderHome(data));
  } else {
    writeFile('_prerender-preview/home.html', renderHome(data));
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

  // App-only views (interactive) — noindex boot shells so deep links work + carry robots noindex
  w(path.join('recommend', 'index.html'), renderAppShell({
    title: 'Tool Recommender — Content Strategy Library', h1: 'Tool Recommender',
    description: 'Answer three questions and get a shortlist of content strategy tools to start with.',
    canonical: SITE + '/recommend/', note: 'A three-question guide to the right tools. Loading…'
  }));
  w(path.join('submit', 'index.html'), renderAppShell({
    title: 'Submit a Tool — Content Strategy Library', h1: 'Submit a tool',
    description: 'Suggest a content strategy tool or framework to add to the library.',
    canonical: SITE + '/submit/', note: 'Suggest a tool for the library. Loading…'
  }));
  w(path.join('workspace', 'index.html'), renderAppShell({
    title: 'Workspace — Content Strategy Library', h1: 'Workspace',
    description: 'Collect tools, brand the page, and export a shareable PDF or deck.',
    canonical: SITE + '/workspace/', note: 'Collect and export a tool set. Loading…'
  }));

  // 404 — noindex boot shell; GitHub Pages serves this for unmatched routes.
  w('404.html', renderAppShell({
    title: 'Not found — Content Strategy Library', h1: 'Page not found',
    description: 'That page could not be found.', canonical: SITE + '/',
    robots: 'noindex,nofollow', note: 'That page moved or never existed. Taking you to the library…'
  }));

  // Crawl infrastructure
  w('sitemap.xml', buildSitemap(data));
  w('robots.txt', buildRobots());
  w('llms.txt', buildLlmsTxt(data));
  w('llms-full.txt', buildLlmsFull(data));

  // GitHub Pages: serve files verbatim (no Jekyll processing of _-prefixed paths)
  if (!fs.existsSync(path.join(ROOT, '.nojekyll'))) w('.nojekyll', '');

  // Guard: never clobber the custom-domain CNAME
  const cnamePath = path.join(ROOT, 'CNAME');
  if (!fs.existsSync(cnamePath)) {
    console.warn('  WARNING: CNAME missing — expected contentstrategylibrary.com');
  }

  console.log('Build complete. ' + written.length + ' files written.');
  console.log('  ' + data.TOOLS.length + ' tools, ' + data.CATEGORY_ORDER.length + ' categories, ' +
    data.TERMINOLOGY.length + ' terms, + faq/about/recommend/submit/workspace/404, sitemap, robots, llms.txt, llms-full.txt');
  return { data, written };
}

if (require.main === module) {
  build();
}

module.exports = { build, loadData };
