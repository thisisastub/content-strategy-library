/* ============================================================
   Content Strategy Library, glossary tool-linking
   ------------------------------------------------------------
   Turns tool names mentioned inside glossary definitions into links
   to those tools' pages. Shared on purpose: js/app.js uses it for the
   hydrated view and build.js runs it in a sandbox so the prerendered
   /terminology/ page carries the same links for crawlers.

   Longest alias wins, matching is case-insensitive, and every
   occurrence links. Aliases come from each tool's name plus the
   phrasings people actually write (see EXTRA).
   ============================================================ */

(function (root) {
  'use strict';

  // Phrasings that do not fall out of a tool's name on their own.
  var EXTRA = {
    persona: ['persona', 'audience persona'],
    audit: ['content audit', 'content inventory'],
    governance: ['content governance', 'governance plan', 'governance'],
    model: ['taxonomy'],
    clusters: ['topic cluster', 'pillar page', 'pillar map'],
    pillars: ['content pillar'],
    journey: ['journey map', 'customer journey'],
    cardsort: ['card sort'],
    raci: ['RACI'],
    rot: ['ROT'],
    peso: ['PESO'],
    swot: ['SWOT'],
    styleguide: ['style guide'],
    voicetone: ['voice and tone guide', 'tone guide', 'brand voice'],
    jtbd: ['jobs to be done', 'JTBD'],
    voc: ['voice of customer', 'message mining'],
    kpi: ['measurement framework'],
    sitemap: ['sitemap'],
    backlog: ['idea backlog'],
    coremodel: ['core model'],
    calendar: ['content calendar'],
    brief: ['creative brief'],
    matrix: ['content matrix'],
    lifecycle: ['content lifecycle', 'refresh plan'],
    mission: ['mission statement'],
    archetypes: ['brand archetype'],
    contentdesign: ['content design']
  };

  function buildIndex(tools) {
    var map = {};
    tools.forEach(function (t) {
      // Acronyms inside parentheses, e.g. "See-Think-Do-Care (STDC)".
      var parens = (t.name.match(/\(([^)]+)\)/g) || [])
        .map(function (p) { return p.slice(1, -1); })
        .filter(function (p) { return /^[A-Z]{2,}$/.test(p); });
      // Each half of a slashed or plussed name, minus a leading "The".
      var base = t.name
        .replace(/\([^)]*\)/g, '')
        .split(/\s+[\/+]\s+/)
        .map(function (s) { return s.trim().replace(/^The\s+/i, ''); })
        .filter(function (s) { return s.indexOf(' ') !== -1 || s.indexOf('-') !== -1; });
      [t.name].concat(base, parens, EXTRA[t.id] || []).forEach(function (a) {
        var k = String(a).toLowerCase();
        if (k && !map[k]) map[k] = t;
      });
    });
    var escRe = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
    // Longest first, so "content audit" beats "audit".
    var aliases = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
    return {
      map: map,
      re: new RegExp('\\b(' + aliases.map(escRe).join('|') + ')(s|es)?\\b', 'gi')
    };
  }

  var cache = null;

  // Returns [{ text, tool }] segments; `tool` is null for plain runs.
  function segments(text, tools) {
    if (!cache) cache = buildIndex(tools);
    var out = [];
    var last = 0;
    var m;
    cache.re.lastIndex = 0;
    while ((m = cache.re.exec(text))) {
      var tool = cache.map[m[1].toLowerCase()];
      if (!tool) continue;
      if (m.index > last) out.push({ text: text.slice(last, m.index), tool: null });
      out.push({ text: m[0], tool: tool });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ text: text.slice(last), tool: null });
    return out;
  }

  // `esc` and `href` are supplied by the caller so this file stays free of
  // any assumption about escaping or routing.
  function linkify(text, tools, esc, href) {
    return segments(text, tools).map(function (seg) {
      var safe = esc(seg.text);
      if (!seg.tool) return safe;
      return '<a class="csl-body-link" href="' + href(seg.tool) + '" title="' +
        esc('Open the ' + seg.tool.name + ' tool page') + '">' + safe + '</a>';
    }).join('');
  }

  root.CSLLinkify = { linkify: linkify, segments: segments, EXTRA: EXTRA };
})(typeof window !== 'undefined' ? window : this);
