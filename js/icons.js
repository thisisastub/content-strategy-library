/* ============================================================
   Content Strategy Library — icons + diagrams
   ============================================================ */

(function () {
  function w(p) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  const ICONS = {
    quad: w('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>'),
    taya: w('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/><path d="M9.8 9.2a2.4 2.4 0 0 1 4.7.8c0 1.6-2.4 2.2-2.4 2.2"/><circle cx="12" cy="15.6" r=".75" fill="currentColor" stroke="none"/>'),
    rot: w('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>'),
    maturity: w('<path d="M2 21h4v-4h4v-4h4V9h4V5h4"/>'),
    stdc: w('<polyline points="3 7 7.5 12 3 17"/><polyline points="8.5 7 13 12 8.5 17"/><polyline points="14 7 18.5 12 14 17"/><circle cx="21" cy="12" r="1.2" fill="currentColor" stroke="none"/>'),
    archetypes: w('<path d="M5 3.5c2.2.8 4.5 1.2 7 1.2s4.8-.4 7-1.2V11c0 5.3-3.1 9.5-7 9.5S5 16.3 5 11z"/><circle cx="9" cy="10.5" r=".75" fill="currentColor" stroke="none"/><circle cx="15" cy="10.5" r=".75" fill="currentColor" stroke="none"/><path d="M9 14.5c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5"/>'),
    peso: w('<circle cx="7.5" cy="7.5" r="4.5"/><circle cx="16.5" cy="7.5" r="4.5"/><circle cx="7.5" cy="16.5" r="4.5"/><circle cx="16.5" cy="16.5" r="4.5"/>'),
    herohubhelp: w('<path d="M12 3 21 20H3z"/><line x1="8.2" y1="13" x2="15.8" y2="13"/><line x1="6" y1="16.5" x2="18" y2="16.5"/>'),
    coremodel: w('<circle cx="12" cy="12" r="3.5"/><line x1="2" y1="12" x2="7" y2="12"/><polyline points="5 9.5 7.5 12 5 14.5"/><line x1="15.5" y1="12" x2="20.5" y2="12"/><polyline points="19.5 9.5 22 12 19.5 14.5"/>'),
    contentdesign: w('<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>'),
    charter:      w('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>'),
    mission:      w('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'),
    pillars:      w('<rect x="3" y="5" width="4" height="14" rx="1"/><rect x="10" y="5" width="4" height="14" rx="1"/><rect x="17" y="5" width="4" height="14" rx="1"/><line x1="2" y1="21" x2="22" y2="21"/>'),
    audit:        w('<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/>'),
    gap:          w('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>'),
    swot:         w('<rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="2" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/>'),
    persona:      w('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    journey:      w('<circle cx="3" cy="14" r="2" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="2" fill="currentColor" stroke="none"/><circle cx="21" cy="14" r="2" fill="currentColor" stroke="none"/><path d="M5 14q3-8 7-6 4 2 7-6"/>'),
    jtbd:         w('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>'),
    voc:          w('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/>'),
    buyermap:     w('<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>'),
    corestatement:w('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
    voicetone:    w('<polyline points="2 12 5 12 8 5 11 19 14 12 17 12 20 8 22 10"/>'),
    matrix:       w('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
    clusters:     w('<circle cx="12" cy="12" r="3"/><circle cx="3" cy="5" r="2"/><circle cx="21" cy="5" r="2"/><circle cx="3" cy="19" r="2"/><circle cx="21" cy="19" r="2"/><line x1="14.6" y1="10.4" x2="19" y2="7"/><line x1="9.4" y1="10.4" x2="5" y2="7"/><line x1="9.4" y1="13.6" x2="5" y2="17"/><line x1="14.6" y1="13.6" x2="19" y2="17"/>'),
    keywords:     w('<circle cx="7" cy="17" r="4"/><line x1="21" y1="3" x2="10" y2="14"/><path d="M16 4h4v4"/>'),
    model:        w('<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>'),
    calendar:     w('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14" stroke-width="2"/><line x1="12" y1="14" x2="12" y2="14" stroke-width="2"/><line x1="8" y1="18" x2="8" y2="18" stroke-width="2"/>'),
    brief:        w('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>'),
    workflow:     w('<rect x="2" y="9" width="5" height="6" rx="1"/><rect x="9.5" y="9" width="5" height="6" rx="1"/><rect x="17" y="9" width="5" height="6" rx="1"/><line x1="7" y1="12" x2="9.5" y2="12"/><line x1="14.5" y1="12" x2="17" y2="12"/>'),
    raci:         w('<rect x="9" y="2" width="6" height="4" rx="1"/><line x1="12" y1="6" x2="12" y2="9"/><line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="9" x2="5" y2="12"/><line x1="12" y1="9" x2="12" y2="12"/><line x1="19" y1="9" x2="19" y2="12"/><rect x="2" y="12" width="6" height="4" rx="1"/><rect x="9" y="12" width="6" height="4" rx="1"/><rect x="16" y="12" width="6" height="4" rx="1"/>'),
    styleguide:   w('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
    contributors: w('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    backlog:      w('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/>'),
    channels:     w('<path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>'),
    repurposing:  w('<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>'),
    governance:   w('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
    kpi:          w('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'),
    lifecycle:    w('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>'),
    scorecard:    w('<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>'),
    sitemap:      w('<rect x="9" y="1" width="6" height="4" rx="1"/><rect x="1" y="11" width="6" height="4" rx="1"/><rect x="9" y="11" width="6" height="4" rx="1"/><rect x="17" y="11" width="6" height="4" rx="1"/><line x1="12" y1="5" x2="12" y2="9"/><path d="M4 11V9h16v2"/>'),
    cardsort:     w('<rect x="2" y="6" width="14" height="16" rx="2"/><path d="M6 6V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-2"/>')
  };

  function dataUri(svg) {
    return 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/currentColor/g, '#2C2C22'));
  }

  // Returns a data-URI src for a tool id (falls back to brief icon)
  window.iconSrc = function (id) {
    return dataUri(ICONS[id] || ICONS.brief);
  };

  /* ── Diagrams ───────────────────────────────────────────── */
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const wrap = (inner) => '<div class="dgm-wrap">' + inner + '</div>';

  const DIAGRAMS = {
    journey() {
      const stages = [['Awareness', 'Discover'], ['Consideration', 'Evaluate'], ['Decision', 'Choose'], ['Retention', 'Grow']];
      let cells = '';
      stages.forEach((s, i) => {
        cells += '<div class="dgm-journey__stage"><div class="dgm-journey__box">' + s[0] + '</div><div class="dgm-journey__sub">' + s[1] + '</div></div>';
        if (i < stages.length - 1) cells += '<div class="dgm-journey__arrow">&rarr;</div>';
      });
      return wrap('<div class="dgm-journey">' + cells + '</div>');
    },

    workflow() {
      const steps = ['Idea', 'Brief', 'Draft', 'Review', 'Approve', 'Publish'];
      let out = '';
      steps.forEach((s, i) => {
        const last = i === steps.length - 1;
        const cls = i === 0 ? ' is-first' : last ? ' is-last' : '';
        out += '<div class="dgm-workflow__step' + cls + '">' + s + '</div>';
        if (!last) out += '<span class="dgm-arrow">&rarr;</span>';
      });
      return wrap('<div class="dgm-workflow">' + out + '</div>');
    },

    pillars() {
      const cols = [['Authority', 'Thought leadership and expertise'], ['Empathy', 'Customer stories and real problems'], ['Action', 'How-tos and decision tools']];
      let cards = '';
      cols.forEach(([name, desc]) => {
        cards += '<div class="dgm-pillars__col"><div class="dgm-pillars__name">' + name + '</div><div class="dgm-pillars__desc">' + desc + '</div></div>';
      });
      return wrap('<div class="dgm-cap">Example pillar structure</div><div class="dgm-pillars">' + cards + '</div>');
    },

    swot() {
      const qs = [['Strengths', 'Internal advantages', 'hl'], ['Weaknesses', 'Internal limitations', 'surface'], ['Opportunities', 'External possibilities', 'surface'], ['Threats', 'External risks', 'subtle']];
      const bg = { hl: 'var(--highlight)', surface: 'var(--bg-surface)', subtle: 'var(--bg-subtle)' };
      let cells = '';
      qs.forEach(([label, hint, key]) => {
        const border = key === 'surface' ? '1px solid var(--border)' : 'none';
        cells += '<div class="dgm-swot__cell" style="background:' + bg[key] + ';border:' + border + '"><div class="dgm-swot__label">' + label + '</div><div class="dgm-swot__hint">' + hint + '</div></div>';
      });
      return wrap(
        '<div class="dgm-swot__toprow"><div class="dgm-swot__axislabel">Positive</div><div class="dgm-swot__axislabel">Negative</div></div>' +
        '<div class="dgm-swot__main">' +
          '<div class="dgm-swot__sidecol"><div class="dgm-swot__sidelabel">Internal</div><div class="dgm-swot__sidelabel">External</div></div>' +
          '<div class="dgm-swot__grid">' + cells + '</div>' +
        '</div>'
      );
    },

    matrix() {
      const cols = ['Awareness', 'Consideration', 'Decision'];
      const rows = [['New visitor', 'Blog post', 'Guide', 'Demo page'], ['Returning lead', 'Newsletter', 'Case study', 'Proposal']];
      let head = '<tr><th class="dgm-matrix__blank"></th>';
      cols.forEach((c) => { head += '<th class="hl-th">' + c + '</th>'; });
      head += '</tr>';
      let body = '';
      rows.forEach((r) => {
        const [row, ...cells] = r;
        body += '<tr><td class="dgm-matrix__rowhead">' + row + '</td>';
        cells.forEach((cell) => { body += '<td class="dgm-matrix__cell">' + cell + '</td>'; });
        body += '</tr>';
      });
      return wrap('<table class="dgm-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>');
    },

    raci() {
      const roles = [['R', 'Responsible'], ['A', 'Accountable'], ['C', 'Consulted'], ['I', 'Informed']];
      const tasks = ['Set strategy', 'Write content', 'Legal review', 'Final publish'];
      const filled = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
      let head = '<tr><th class="dgm-raci__taskhead">Task</th>';
      roles.forEach(([r, l]) => { head += '<th class="dgm-raci__th">' + r + '<small>' + l + '</small></th>'; });
      head += '</tr>';
      let body = '';
      tasks.forEach((task, ti) => {
        body += '<tr><td class="dgm-raci__task">' + task + '</td>';
        filled[ti].forEach((on) => { body += '<td class="dgm-raci__cell' + (on ? ' on' : '') + '">' + (on ? '●' : '') + '</td>'; });
        body += '</tr>';
      });
      return wrap('<table class="dgm-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>');
    },

    clusters() {
      const spokes = ['Blog post', 'Case study', 'FAQ', 'Video', 'Newsletter', 'Checklist'];
      let sp = '';
      spokes.forEach((s) => { sp += '<div class="dgm-clusters__spoke">' + s + '</div>'; });
      return wrap(
        '<div class="dgm-clusters">' +
          '<div class="dgm-clusters__cap">Pillar page at center</div>' +
          '<div class="dgm-clusters__pillar">Pillar Page</div>' +
          '<div class="dgm-clusters__stem"></div>' +
          '<div class="dgm-clusters__spokes">' + sp + '</div>' +
        '</div>'
      );
    },

    buyermap() {
      const stages = [['Awareness', 'Blog · Social · Podcast', '100%'], ['Consideration', 'Guides · Webinars · Case studies', '80%'], ['Decision', 'Demos · ROI tools · Proposals', '60%'], ['Retention', 'Onboarding · Newsletter', '40%']];
      let rows = '';
      stages.forEach(([name, fmt, width]) => {
        rows += '<div class="dgm-buyermap__row" style="width:' + width + '"><span class="dgm-buyermap__name">' + name + '</span><span class="dgm-buyermap__fmt">' + fmt + '</span></div>';
      });
      return wrap('<div class="dgm-buyermap">' + rows + '</div>');
    },

    corestatement() {
      const tiers = [['Core Promise', 'One sentence, who, what, why', '100%', 'var(--highlight)', 'none'], ['Supporting Pillars', '3–5 durable themes', '76%', 'var(--bg-surface)', '1px solid var(--border)'], ['Proof Points', 'Evidence and examples', '54%', 'var(--bg-subtle)', 'none']];
      let rows = '';
      tiers.forEach(([name, sub, width, bg, border]) => {
        rows += '<div class="dgm-core__tier" style="width:' + width + ';background:' + bg + ';border:' + border + '"><div class="dgm-core__name">' + name + '</div><div class="dgm-core__sub">' + sub + '</div></div>';
      });
      return wrap('<div class="dgm-core">' + rows + '</div>');
    },

    sitemap() {
      const tree = { n: 'Home', ch: [
        { n: 'About', ch: [{ n: 'Team' }, { n: 'Mission' }] },
        { n: 'Blog', ch: [{ n: 'Category A' }, { n: 'Category B' }] },
        { n: 'Products', ch: [{ n: 'Product 1' }, { n: 'Product 2' }] }
      ] };
      function node(item, depth) {
        let html = '<div class="dgm-sm-node"><div class="dgm-sm-box dgm-sm-box--' + Math.min(depth, 2) + '">' + esc(item.n) + '</div>';
        if (item.ch) {
          let children = '';
          item.ch.forEach((c) => { children += node(c, depth + 1); });
          html += '<div class="dgm-sm-children">' + children + '</div>';
        }
        return html + '</div>';
      }
      return wrap('<div class="dgm-sitemap">' + node(tree, 0) + '</div>');
    },

    quad() {
      const S = 'background:var(--bg-surface);border:1px solid var(--border);border-radius:6px;padding:14px 16px';
      const qcard = (n, d) => '<div style="' + S + '"><div style="font-weight:700;font-size:13px;color:var(--text-primary);font-family:var(--font-sans);margin-bottom:5px">' + n + '</div><div style="font-size:11px;color:var(--text-muted);font-family:var(--font-sans);line-height:1.5">' + d + '</div></div>';
      const hemi = (l) => '<div style="text-align:center;font-family:var(--font-sans);font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted)">' + l + '</div>';
      return wrap(
        '<div>' +
        '<div style="text-align:center;font-family:var(--font-sans);font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:14px">The Brain Traffic quad, 2018 revision</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px">' +
          hemi('Content design') +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' + qcard('Editorial strategy', 'Mission, audiences, point of view, voice and tone, standards') + qcard('Experience design', 'User needs, journeys, ecosystem, formats, design patterns') + '</div>' +
          '<div style="display:flex;justify-content:center"><div style="background:var(--highlight);color:var(--text-primary);border-radius:6px;padding:9px 22px;font-weight:700;font-size:13px;font-family:var(--font-sans)">Core strategy</div></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' + qcard('Structure', 'Content engineering: organization, tags, models, reuse') + qcard('Process design', 'Lifecycle, tools, accountability, who says no') + '</div>' +
          hemi('Systems design') +
        '</div>' +
        '<div style="display:flex;align-items:flex-start;gap:10px;margin-top:16px;padding-top:14px;border-top:1px dashed var(--border)"><span style="font-size:15px;color:var(--text-primary);line-height:1.2;flex-shrink:0">&#8595;</span><span style="font-size:12px;color:var(--text-muted);font-family:var(--font-sans);line-height:1.55">Rotated on purpose: systems design sits underneath as the foundation that content design stands on.</span></div>' +
        '</div>'
      );
    },

    archetypes() {
      const groups = [['Independence', ['Innocent', 'Explorer', 'Sage']], ['Mastery', ['Hero', 'Outlaw', 'Magician']], ['Belonging', ['Regular Guy/Gal', 'Lover', 'Jester']], ['Stability', ['Caregiver', 'Creator', 'Ruler']]];
      const col = (g) => '<div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:6px;padding:14px 12px">' +
        '<div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);font-family:var(--font-sans);text-align:center;margin-bottom:10px">' + g[0] + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px">' + g[1].map((nm) => '<div style="background:var(--bg-subtle);border-radius:6px;padding:7px 6px;text-align:center;font-weight:600;font-size:12px;color:var(--text-primary);font-family:var(--font-sans);white-space:nowrap">' + esc(nm) + '</div>').join('') + '</div></div>';
      return wrap('<div><div style="text-align:center;font-family:var(--font-sans);font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:14px">Twelve archetypes, four core motivations</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">' + groups.map(col).join('') + '</div></div>');
    },

    model() {
      const cats = [['Guides', ['Beginner', 'Advanced']], ['Products', ['Hardware', 'Software']], ['People', ['Authors', 'Customers']]];
      const chip = (txt, kind) => {
        const bg = kind === 'root' ? 'var(--highlight)' : kind === 'cat' ? 'var(--bg-surface)' : 'var(--bg-subtle)';
        const bd = kind === 'root' ? 'none' : '1px solid var(--border)';
        const pad = kind === 'root' ? '10px 22px' : '7px 14px';
        const fsz = kind === 'root' ? '14px' : '12px';
        const fw = kind === 'term' ? 500 : 700;
        return '<div style="background:' + bg + ';border:' + bd + ';border-radius:6px;padding:' + pad + ';font-size:' + fsz + ';font-weight:' + fw + ';font-family:var(--font-sans);color:var(--text-primary);white-space:nowrap">' + txt + '</div>';
      };
      return wrap('<div style="display:flex;flex-direction:column;align-items:center;gap:10px">' +
        '<div style="font-family:var(--font-sans);font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted)">A simple content taxonomy</div>' +
        chip('Content', 'root') +
        '<div style="width:2px;height:16px;background:var(--ink-200)"></div>' +
        '<div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap;justify-content:center">' +
        cats.map((c) => '<div style="display:flex;flex-direction:column;align-items:center;gap:8px">' + chip(c[0], 'cat') + '<div style="width:2px;height:12px;background:var(--border)"></div><div style="display:flex;flex-direction:column;gap:6px">' + c[1].map((t) => chip(t, 'term')).join('') + '</div></div>').join('') +
        '</div></div>');
    },

    backlog() {
      const ico = (paths) => '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + paths.map((d) => '<path d="' + d + '"/>').join('') + '</svg>';
      const cell = (label, bg, paths) => {
        const bd = (bg === 'var(--bg-surface)' || bg === 'var(--bg-subtle)') ? '1px solid var(--border)' : 'none';
        return '<div style="background:' + bg + ';border:' + bd + ';border-radius:6px;min-height:92px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;padding:10px">' + ico(paths) + '<div style="font-size:11px;font-weight:700;font-family:var(--font-sans);color:var(--text-primary)">' + label + '</div></div>';
      };
      return wrap('<div style="display:flex;gap:10px;align-items:stretch">' +
        '<div style="display:flex;align-items:center;justify-content:center"><div style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);font-family:var(--font-sans)">Impact &#8594;</div></div>' +
        '<div style="flex:1">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px">' +
            cell('Quick wins', 'var(--highlight)', ['M5 13l4 4L19 7']) +
            cell('Big bets', 'var(--bg-surface)', ['M12 2l2.9 6.3 6.8.8-5 4.6 1.3 6.8L12 22l-6.3-3.4 1.3-6.8-5-4.6 6.8-.8z']) +
            cell('Fill-ins', 'var(--bg-subtle)', ['M12 5v14', 'M5 12h14']) +
            cell('Avoid', 'var(--bg-subtle)', ['M12 7v5l3 2', 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z']) +
          '</div>' +
          '<div style="text-align:center;margin-top:8px"><span style="font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);font-family:var(--font-sans)">Effort &#8594;</span></div>' +
        '</div></div>');
    },

    repurposing() {
      const doc = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>';
      const small = [['Clip', ['M8 5v14l11-7z']], ['Post', ['M4 5h16v14H4z', 'M4 9h16']], ['Quote', ['M7 7h4v6H7z', 'M13 7h4v6h-4z']], ['Email', ['M4 6h16v12H4z', 'M4 7l8 6 8-6']], ['Thread', ['M4 6h16', 'M4 12h16', 'M4 18h10']], ['Carousel', ['M7 5h10v14H7z', 'M3 8v8', 'M21 8v8']]];
      const chip = (g) => '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;background:var(--bg-surface);border:1px solid var(--border);border-radius:6px;padding:10px 6px;min-width:66px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + g[1].map((d) => '<path d="' + d + '"/>').join('') + '</svg><div style="font-size:10px;font-weight:600;font-family:var(--font-sans);color:var(--text-muted)">' + g[0] + '</div></div>';
      return wrap('<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;justify-content:center">' +
        '<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><div style="background:var(--highlight);border-radius:6px;padding:18px 22px">' + doc + '</div><div style="font-size:11px;font-weight:700;font-family:var(--font-sans);color:var(--text-primary)">One pillar asset</div></div>' +
        '<div style="font-size:22px;color:var(--text-muted)">&#8594;</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,auto);gap:8px">' + small.map(chip).join('') + '</div></div>');
    }
  };

  // Returns diagram HTML string for a tool id, or null if none
  window.buildDiagram = function (id) {
    return DIAGRAMS[id] ? DIAGRAMS[id]() : null;
  };
})();
