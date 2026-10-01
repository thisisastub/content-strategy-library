/* ============================================================
   Content Strategy Library, tool detail helpers
   ------------------------------------------------------------
   The per-tool values the rebuilt detail page needs: question-shaped
   section headings, the Contents card entries, the embed snippet, and
   the APA / MLA / plain-link citations.

   Kept out of js/app.js because build.js also needs the section ids
   and headings so the prerendered page carries the same deep links.
   ============================================================ */

(function (root) {
  'use strict';

  var SITE = 'https://contentstrategylibrary.com';

  // Tools whose headings read better with a specific noun phrase. Anything not
  // listed falls back to "What is it?" / "When should I use it?".
  var SHORT = {
    pillars: 'content pillars',
    clusters: 'topic clusters',
    calendar: 'an editorial calendar',
    brief: 'a content brief',
    charter: 'a content charter',
    mission: 'an editorial mission statement',
    voicetone: 'a voice and tone guide',
    raci: 'a RACI chart',
    audit: 'a content audit'
  };

  // Only these have Notion/Miro templates worth advertising.
  var HAS_APPS = ['pillars', 'calendar', 'brief', 'journey', 'persona', 'charter', 'clusters'];

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  var MLA = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June',
    'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function whatTitle(tool) {
    var s = SHORT[tool.id];
    if (!s) return 'What is it?';
    return (/^(a|an) /.test(s) ? 'What is ' : 'What are ') + s + '?';
  }

  function whenTitle(tool) {
    var s = SHORT[tool.id];
    return s ? 'When should I use ' + s + '?' : 'When should I use it?';
  }

  function hasApps(tool) { return HAS_APPS.indexOf(tool.id) !== -1; }

  // Canonical page URL. Uses the slug, not the id: the id is internal.
  function toolUrl(tool) { return SITE + '/tools/' + tool.slug + '/'; }

  function embedCode(tool) {
    var url = toolUrl(tool);
    return '<a href="' + url + '" style="display:block;max-width:420px;padding:20px 22px;' +
      'border:1px solid #C6C5BB;border-radius:10px;background:#FFFFFF;font-family:system-ui,sans-serif;' +
      'text-decoration:none;color:#16160E">' +
      '<span style="display:inline-block;background:#F7C531;font-size:11px;font-weight:700;padding:2px 7px;' +
      'border-radius:3px;letter-spacing:.06em">CONTENT STRATEGY LIBRARY</span>' +
      '<strong style="display:block;font-size:18px;line-height:1.3;margin:12px 0 6px">' + esc(tool.name) + '</strong>' +
      '<span style="display:block;font-size:14px;line-height:1.5;color:#52524A">' + esc(tool.tagline) + '</span>' +
      '<span style="display:block;font-size:13px;font-weight:600;margin-top:14px">View the tool →</span></a>';
  }

  // `now` is injectable so the prerender can stamp a stable date.
  function cites(tool, now) {
    var d = now || new Date();
    var y = d.getFullYear();
    var url = toolUrl(tool);
    // APA wants sentence case, but it keeps acronyms capitalised, so lowercase
    // word by word and leave anything that is already all-caps alone. (A blanket
    // .toLowerCase() turns "RACI Matrix" into "Raci matrix".)
    var sentence = tool.name.split(' ').map(function (w, i) {
      // Test the letters only, so "(STDC)" and "Big 5," still read as acronyms.
      var core = w.replace(/[^A-Za-z0-9/+-]/g, '');
      if (core.length > 1 && core === core.toUpperCase() && /[A-Z]{2,}/.test(core)) return w;
      return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase();
    }).join(' ');
    return {
      apa: {
        a: 'Content Strategy Library. (' + y + '). ',
        b: sentence,
        c: '. Retrieved ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + y + ', from ' + url
      },
      mla: {
        a: '“' + tool.name + '.” ',
        b: 'Content Strategy Library',
        c: ', ' + y + ', ' + url.replace(/^https?:\/\//, '') + '. Accessed ' + d.getDate() + ' ' + MLA[d.getMonth()] + ' ' + y + '.'
      },
      link: { a: url, b: '', c: '' }
    };
  }

  // Section ids are public deep links; build.js prerenders them too.
  function sections(tool, opts) {
    opts = opts || {};
    var out = [{ id: 'what-is-it', label: whatTitle(tool) },
               { id: 'when-to-use', label: whenTitle(tool) }];
    if (tool.notes && tool.notes.length) out.push({ id: 'notes', label: 'Notes' });
    out.push({ id: 'template', label: opts.hasTemplate ? 'Download the template' : 'Share and cite' });
    out.push({ id: 'learn-more', label: 'Learn more' });
    if (tool.related && tool.related.length) out.push({ id: 'related', label: 'Related tools' });
    return out;
  }

  // Contents card: top-level sections plus the accordion rows nested under
  // the template section, which open that panel when clicked.
  function toc(tool, opts) {
    opts = opts || {};
    var items = sections(tool, opts).map(function (s) {
      return { id: s.id, label: s.label, sub: false };
    });
    var subs = [];
    if (hasApps(tool)) subs.push({ id: 'apps', label: 'Notion / Miro', sub: true, panel: 'apps' });
    subs.push({ id: 'share', label: 'Share', sub: true, panel: 'share' });
    subs.push({ id: 'embed', label: 'Embed', sub: true, panel: 'embed' });
    subs.push({ id: 'cite', label: 'Cite', sub: true, panel: 'cite' });
    // Slot the sub-entries straight after the template section.
    var at = items.findIndex(function (i) { return i.id === 'template'; });
    if (at < 0) return items.concat(subs);
    return items.slice(0, at + 1).concat(subs, items.slice(at + 1));
  }

  root.CSLToolDetail = {
    SHORT: SHORT,
    whatTitle: whatTitle,
    whenTitle: whenTitle,
    hasApps: hasApps,
    toolUrl: toolUrl,
    embedCode: embedCode,
    cites: cites,
    sections: sections,
    toc: toc
  };
})(typeof window !== 'undefined' ? window : this);
