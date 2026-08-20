/* ============================================================
   Content Strategy Library — app (routing + views)
   ============================================================ */

(function () {
  const TOOLS = window.TOOLS;
  const BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t]));
  const BY_SLUG = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));
  const CAT_KEYS = new Set((window.CATEGORY_ORDER || []).map((c) => c[1]));

  // ── Real-URL paths (History API). Build script and router agree on these. ──
  function toolPath(t) {
    const tool = typeof t === 'string' ? BY_ID[t] : t;
    return tool ? '/tools/' + tool.slug + '/' : '/';
  }
  const catPath = (key) => '/categories/' + key + '/';
  const VIEW_PATH = {
    index: '/', terminology: '/terminology/', faq: '/faq/', about: '/about/',
    recommend: '/recommend/', submit: '/submit/', workspace: '/workspace/'
  };
  // Navigate via History API, then re-render.
  function navTo(path) {
    if (path !== location.pathname) history.pushState(null, '', path);
    render(true);
  }

  // Bump this when the library's content is updated.
  // Auto-stamped by build.js on every build (see stampLastUpdated). Manual edits
  // here are overwritten on the next `node build.js`.
  const LAST_UPDATED = 'August 20, 2026';

  // Web3Forms endpoint for the "Submit a Tool" form. The access key is public by design
  // (Web3Forms routes it to the maintainer's inbox and handles spam filtering server-side).
  const WEB3FORMS_ACCESS_KEY = '2e290c09-02e0-4e55-b53f-0c238871ff5a';

  // ── In-view UI state (not reflected in the URL) ──
  const state = {
    activeFilter: null,
    wizardStep: 0,
    wizardAnswers: [],
    expandedFaq: {},
    submitSent: false,
    submitSending: false,
    submitError: '',
    submitForm: { name: '', desc: '', purpose: '', cat: '', links: ['', '', ''] },
    // Workspace (persisted to localStorage)
    wsTools: [],
    brand: { org: '', preparedBy: '', preparedFor: '', success: '', accent: '#F7C531' },
    wsPaletteOpen: false,
    wsToast: ''
  };

  // Hydrate the workspace from localStorage (collected tools + branding survive reloads).
  (function loadWS() {
    try {
      const raw = localStorage.getItem('csl-workspace-v1');
      if (!raw) return;
      const o = JSON.parse(raw);
      if (Array.isArray(o.wsTools)) state.wsTools = o.wsTools;
      state.brand = Object.assign(state.brand, o.brand || {});
    } catch (e) { /* ignore corrupt storage */ }
  })();

  function persistWS() {
    try {
      localStorage.setItem('csl-workspace-v1', JSON.stringify({ wsTools: state.wsTools, brand: state.brand }));
    } catch (e) { /* storage may be unavailable */ }
  }

  let toastTimer = null;
  function wsToast(msg) {
    state.wsToast = msg;
    render(false);
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { state.wsToast = ''; render(false); }, 2200);
  }

  // ── helpers ──
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const icon = (id) => window.iconSrc(id);

  function btn(href, label, opts) {
    opts = opts || {};
    const size = opts.size || 'sm';
    const variant = opts.variant || 'ghost';
    const extra = opts.cls ? ' ' + opts.cls : '';
    return '<a class="btn btn--' + size + ' btn--' + variant + extra + '" href="' + href + '">' + label + '</a>';
  }

  // ── Workspace helpers ──
  // Pick readable ink/white text for a given accent background.
  function accentText(hex) {
    const c = String(hex || '#F7C531').replace('#', '');
    if (c.length < 6) return '#16160E';
    const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#16160E' : '#FFFFFF';
  }

  // Friendly label for a source URL (terminology pills + nothing else).
  function sourceLabel(url) {
    const NAMES = window.SOURCE_NAMES || {};
    let host;
    try { host = new URL(url).hostname; } catch (e) { host = url; }
    host = host.replace(/^www\./, '');
    if (NAMES[host]) return NAMES[host];
    const parts = host.split('.');
    const base = parts.length > 2 ? parts.slice(-2).join('.') : host;
    if (NAMES[base]) return NAMES[base];
    const word = (parts.length > 2 ? parts[parts.length - 2] : parts[0]) || host;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  function wsAdd(id) {
    const t = BY_ID[id];
    const name = (t && t.name) || 'Tool';
    if (state.wsTools.includes(id)) { wsToast(name + ' is already in your Workspace'); return; }
    state.wsTools = state.wsTools.concat(id);
    persistWS();
    wsToast(name + ' added to your Workspace');
  }
  function wsRemove(id) {
    state.wsTools = state.wsTools.filter((x) => x !== id);
    persistWS();
    render(false);
  }
  function wsClear() {
    state.wsTools = [];
    persistWS();
    render(false);
  }
  function setBrand(key, val) {
    state.brand = Object.assign({}, state.brand, { [key]: val });
    persistWS();
  }

  // Shared export model: the workspace tools + branding, normalized for PDF/PPTX.
  function wsExportModel() {
    const tools = state.wsTools.map((id) => BY_ID[id]).filter(Boolean).map((t) => ({
      name: t.name, category: t.category, tagline: t.tagline || '',
      summary: t.summary || '', whenToUse: t.whenToUse || [],
      links: (t.links || []).map((l) => l.label + ' — ' + l.url)
    }));
    const b = state.brand || {};
    const accent = b.accent || '#F7C531';
    return {
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      org: (b.org || '').trim(),
      preparedBy: (b.preparedBy || '').trim(),
      preparedFor: (b.preparedFor || '').trim(),
      success: (b.success || '').trim(),
      accent: accent,
      accentHex: accent.replace('#', ''),
      accentText: accentText(accent),
      tools: tools,
      libraryUrl: location.origin && location.origin !== 'null' ? (location.origin + location.pathname) : 'https://content-strategy-library.example'
    };
  }

  // Branded, print-to-PDF export: opens a styled document and triggers the print dialog.
  function wsExportPDF() {
    const m = wsExportModel();
    if (!m.tools.length) { alert('Add at least one tool to your Workspace first.'); return; }
    const e = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const ACC = m.accent, ACCTX = m.accentText, INK = '#16160E', GRAY = '#52524A', LINE = '#C6C5BB';
    const toolHtml = m.tools.map((t, i) => {
      const when = (t.whenToUse || []).map((w) => '<li>' + e(w) + '</li>').join('');
      const links = (t.links || []).length ? '<div class="lk"><span class="lkh">Sources &amp; templates</span>' + t.links.map((l) => '<div>' + e(l) + '</div>').join('') + '</div>' : '';
      return '<div class="tool"><div class="th"><div class="num">' + (i + 1) + '</div><div><div class="cat">' + e(t.category) + '</div><div class="nm">' + e(t.name) + '</div></div></div>'
        + (t.tagline ? '<div class="tg">' + e(t.tagline) + '</div>' : '')
        + (t.summary ? '<p>' + e(t.summary) + '</p>' : '')
        + (when ? '<div class="wh">When to use</div><ul>' + when + '</ul>' : '')
        + links + '</div>';
    }).join('');
    const cover = '<div class="cover">'
      + '<div class="mk"><span class="sq"></span><span>' + e(m.org || 'Content Strategy Library') + '</span></div>'
      + '<h1>Content Strategy Approach</h1>'
      + '<div class="cs">A curated set of ' + m.tools.length + ' framework' + (m.tools.length > 1 ? 's' : '') + ' selected for this program.</div>'
      + (m.success ? '<div class="suc"><span class="suck">What success looks like</span>' + e(m.success) + '</div>' : '')
      + '<div class="bar"></div>'
      + '<div class="cm">'
      + (m.preparedFor ? '<div><span class="k">Prepared for</span>' + e(m.preparedFor) + '</div>' : '')
      + (m.preparedBy ? '<div><span class="k">Prepared by</span>' + e(m.preparedBy) + '</div>' : '')
      + '<div><span class="k">Date</span>' + e(m.date) + '</div>'
      + '</div></div>';
    const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Content Strategy Approach</title><style>'
      + '@page{margin:84px 54px 64px;}*{box-sizing:border-box;}'
      + 'body{font-family:"Plus Jakarta Sans",system-ui,-apple-system,sans-serif;color:' + INK + ';margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;}'
      + '.hd{position:fixed;top:-64px;left:0;right:0;height:40px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ' + LINE + ';font-size:11px;color:' + GRAY + ';}'
      + '.hd .mk{display:flex;align-items:center;gap:8px;font-weight:700;color:' + INK + ';}.hd .sq{width:14px;height:14px;background:' + ACC + ';border-radius:3px;}'
      + '.ft{position:fixed;bottom:-48px;left:0;right:0;height:32px;border-top:1px solid ' + LINE + ';font-size:10px;color:' + GRAY + ';display:flex;align-items:center;justify-content:space-between;}'
      + '.cover{padding:30px 0 26px;margin-bottom:26px;}'
      + '.cover .mk{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:700;margin-bottom:38px;}.cover .sq{width:20px;height:20px;background:' + ACC + ';border-radius:4px;}'
      + '.cover h1{font-size:38px;letter-spacing:-0.02em;margin:0 0 8px;}'
      + '.cover .cs{font-size:14px;color:' + GRAY + ';margin:0 0 18px;max-width:60ch;line-height:1.5;}'
      + '.cover .suc{border-left:3px solid ' + ACC + ';padding:2px 0 2px 14px;margin:0 0 20px;max-width:62ch;font-size:15px;line-height:1.5;color:' + INK + ';font-weight:600;}.cover .suc .suck{display:block;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:' + GRAY + ';margin-bottom:4px;}'
      + '.cover .bar{height:3px;width:84px;background:' + ACC + ';margin:0 0 20px;}'
      + '.cover .cm{display:flex;gap:40px;flex-wrap:wrap;font-size:12px;}.cover .cm .k{display:block;font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:' + GRAY + ';margin-bottom:3px;}'
      + '.tool{page-break-inside:avoid;border:1px solid ' + LINE + ';border-radius:9px;padding:16px 18px;margin-bottom:14px;}'
      + '.tool .th{display:flex;gap:12px;align-items:center;}'
      + '.tool .num{width:26px;height:26px;flex:none;background:' + ACC + ';color:' + ACCTX + ';font-weight:700;font-size:12px;border-radius:6px;display:flex;align-items:center;justify-content:center;}'
      + '.tool .cat{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:' + GRAY + ';}'
      + '.tool .nm{font-size:17px;font-weight:700;letter-spacing:-0.01em;}'
      + '.tool .tg{font-size:12.5px;color:' + GRAY + ';margin:9px 0 0;line-height:1.5;font-style:italic;}'
      + '.tool p{font-size:12px;line-height:1.6;margin:9px 0 0;color:#2C2C22;}'
      + '.tool .wh{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:' + GRAY + ';margin:12px 0 5px;}'
      + '.tool ul{margin:0;padding-left:16px;}.tool li{font-size:11.5px;line-height:1.5;margin-bottom:3px;color:#2C2C22;}'
      + '.tool .lk{margin-top:11px;border-top:1px dashed ' + LINE + ';padding-top:8px;font-size:10.5px;color:' + GRAY + ';}.tool .lkh{display:block;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;font-size:9px;margin-bottom:3px;}'
      + '</style></head><body>'
      + '<div class="hd"><span class="mk"><span class="sq"></span> ' + e(m.org || 'Content Strategy Library') + '</span><span>Content Strategy Approach &#183; ' + e(m.date) + '</span></div>'
      + '<div class="ft"><span>Built with the Content Strategy Library</span><span>' + e(m.libraryUrl) + '</span></div>'
      + cover + toolHtml
      + '<p style="font-size:11px;color:' + GRAY + ';margin-top:18px">Explore every tool and its primary sources at the Content Strategy Library &#183; ' + e(m.libraryUrl) + '</p>'
      + '</body></html>';
    const w = window.open('', '_blank');
    if (!w) { alert('Please allow pop-ups to export the PDF.'); return; }
    w.document.open(); w.document.write(html); w.document.close(); w.focus();
    setTimeout(() => { try { w.print(); } catch (e2) { /* user can print manually */ } }, 450);
  }

  // Branded PowerPoint export via PptxGenJS (loaded from CDN in index.html).
  function wsExportPPTX() {
    const Pptx = window.PptxGenJS;
    if (!Pptx) { alert('PowerPoint export is still loading. Please try again in a moment.'); return; }
    const m = wsExportModel();
    if (!m.tools.length) { alert('Add at least one tool to your Workspace first.'); return; }
    const INK = '16160E', ACC = m.accentHex, ACCTX = (m.accentText === '#FFFFFF' ? 'FFFFFF' : '16160E'), GRAY = '52524A', FACE = 'Plus Jakarta Sans';
    const p = new Pptx();
    p.defineLayout({ name: 'CSL', width: 13.333, height: 7.5 });
    p.layout = 'CSL';
    const foot = (s) => {
      s.addShape(p.ShapeType.line, { x: 0.6, y: 7.02, w: 12.13, h: 0, line: { color: 'C6C5BB', width: 0.75 } });
      s.addText((m.org || 'Content Strategy Library'), { x: 0.6, y: 7.08, w: 8, h: 0.3, fontSize: 9, bold: true, color: GRAY, fontFace: FACE });
      s.addText(m.libraryUrl, { x: 8.6, y: 7.08, w: 4.13, h: 0.3, fontSize: 9, color: GRAY, align: 'right', fontFace: FACE });
    };
    let s = p.addSlide(); s.background = { color: 'FFFFFF' };
    s.addShape(p.ShapeType.rect, { x: 0.6, y: 0.6, w: 0.5, h: 0.5, fill: { color: ACC } });
    s.addText((m.org || 'Content Strategy Library'), { x: 1.25, y: 0.6, w: 10, h: 0.5, fontSize: 13, bold: true, color: INK, fontFace: FACE, valign: 'middle' });
    s.addText('Content Strategy Approach', { x: 0.6, y: 2.4, w: 12.1, h: 1.3, fontSize: 44, bold: true, color: INK, fontFace: FACE });
    s.addText('A curated set of ' + m.tools.length + ' framework' + (m.tools.length > 1 ? 's' : '') + ' selected for this program.', { x: 0.6, y: 3.8, w: 11, h: 0.8, fontSize: 16, color: GRAY, fontFace: FACE });
    s.addShape(p.ShapeType.rect, { x: 0.6, y: 4.75, w: 3.2, h: 0.07, fill: { color: ACC } });
    if (m.success) {
      s.addText('WHAT SUCCESS LOOKS LIKE', { x: 0.6, y: 5.0, w: 12, h: 0.3, fontSize: 10, bold: true, color: GRAY, fontFace: FACE, charSpacing: 1 });
      s.addText(m.success, { x: 0.6, y: 5.3, w: 11.8, h: 0.85, fontSize: 14, bold: true, color: INK, fontFace: FACE, valign: 'top' });
    }
    const cm = [];
    if (m.preparedFor) cm.push('Prepared for: ' + m.preparedFor);
    if (m.preparedBy) cm.push('Prepared by: ' + m.preparedBy);
    cm.push(m.date);
    s.addText(cm.join('      ·      '), { x: 0.6, y: 6.2, w: 12, h: 0.4, fontSize: 12, color: GRAY, fontFace: FACE });
    foot(s);
    s = p.addSlide(); s.background = { color: 'FFFFFF' };
    s.addText('The toolkit', { x: 0.6, y: 0.55, w: 12, h: 0.6, fontSize: 26, bold: true, color: INK, fontFace: FACE });
    const ovr = [];
    m.tools.forEach((t, i) => {
      ovr.push({ text: (i + 1) + '.  ' + t.name, options: { bold: true, fontSize: 15, color: INK, breakLine: true, paraSpaceBefore: i ? 8 : 0 } });
      ovr.push({ text: t.category, options: { fontSize: 11, color: GRAY, breakLine: true } });
    });
    s.addText(ovr, { x: 0.6, y: 1.5, w: 12.1, h: 5.3, fontFace: FACE, valign: 'top' });
    foot(s);
    m.tools.forEach((t, i) => {
      s = p.addSlide(); s.background = { color: 'FFFFFF' };
      s.addShape(p.ShapeType.roundRect, { x: 0.6, y: 0.55, w: 0.5, h: 0.5, rectRadius: 0.07, fill: { color: ACC } });
      s.addText(String(i + 1), { x: 0.6, y: 0.55, w: 0.5, h: 0.5, align: 'center', valign: 'middle', bold: true, fontSize: 14, color: ACCTX, fontFace: FACE });
      s.addText(t.category.toUpperCase(), { x: 1.25, y: 0.5, w: 11, h: 0.3, fontSize: 11, bold: true, color: GRAY, fontFace: FACE, charSpacing: 1 });
      s.addText(t.name, { x: 1.25, y: 0.78, w: 11.5, h: 0.7, fontSize: 28, bold: true, color: INK, fontFace: FACE });
      let y = 1.75;
      if (t.tagline) { s.addText(t.tagline, { x: 0.6, y: y, w: 12.1, h: 0.6, fontSize: 15, italic: true, color: GRAY, fontFace: FACE }); y += 0.7; }
      if (t.summary) { s.addText(t.summary, { x: 0.6, y: y, w: 12.1, h: 2.1, fontSize: 13, color: '2C2C22', fontFace: FACE, valign: 'top' }); y += 2.2; }
      const when = (t.whenToUse || []).slice(0, 4);
      if (when.length) {
        s.addText('WHEN TO USE', { x: 0.6, y: Math.min(y, 5.0), w: 12, h: 0.3, fontSize: 10, bold: true, color: GRAY, fontFace: FACE, charSpacing: 1 });
        s.addText(when.map((w) => ({ text: w, options: { bullet: { code: '2022' }, fontSize: 12, color: '2C2C22', paraSpaceAfter: 5 } })), { x: 0.6, y: Math.min(y + 0.32, 5.3), w: 12.1, h: 1.6, fontFace: FACE, valign: 'top' });
      }
      foot(s);
    });
    s = p.addSlide(); s.background = { color: INK };
    s.addText('Start here.', { x: 0.6, y: 2.6, w: 12, h: 1, fontSize: 40, bold: true, color: 'FFFFFF', fontFace: FACE });
    s.addText('Every tool, explained, with primary sources.', { x: 0.6, y: 3.8, w: 12, h: 0.6, fontSize: 16, color: 'F0EFE8', fontFace: FACE });
    s.addText(m.libraryUrl, { x: 0.6, y: 4.5, w: 12, h: 0.5, fontSize: 14, color: ACC, fontFace: FACE });
    p.writeFile({ fileName: 'content-strategy-approach.pptx' });
  }

  // ── Shared chrome ──
  function nav() {
    const libIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" style="display:block"><defs><filter id="hl-icon"><feFlood flood-color="#F7C531" result="c"></feFlood><feComposite in="c" in2="SourceAlpha" operator="in"></feComposite></filter></defs><image href="https://static.thenounproject.com/png/library-icon-8367955-512.png" x="0" y="0" width="22" height="22" filter="url(#hl-icon)"></image></svg>';
    const burger = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="nav__icon-bars" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="nav__icon-close" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
    return '' +
      '<nav class="nav"><div class="nav__inner">' +
        '<a class="nav__brand" href="/" title="Library by Soetarman Atmodjo from The Noun Project">' +
          '<span class="nav__brand-mark">' + libIcon + '</span>' +
          '<span class="nav__brand-name">Content Strategy Library</span>' +
        '</a>' +
        '<button class="nav__toggle" data-action="nav-toggle" aria-label="Toggle menu">' + burger + '</button>' +
        '<div class="nav__links">' +
          btn('/', 'Library', { cls: 'ds-highlight-swipe' }) +
          btn('/terminology/', 'Terminology', { cls: 'ds-highlight-swipe' }) +
          btn('/recommend/', 'Tool Recommender', { cls: 'ds-highlight-swipe' }) +
          btn('/faq/', 'FAQ', { cls: 'ds-highlight-swipe' }) +
          btn('/about/', 'About', { cls: 'ds-highlight-swipe' }) +
        '</div>' +
      '</div></nav>';
  }

  function footer() {
    return '' +
      '<footer class="footer"><div class="footer__inner">' +
        '<div>' +
          '<div class="footer__brand-row">' +
            '<img src="https://static.thenounproject.com/png/library-icon-8367955-512.png" width="16" height="16" alt="" aria-hidden="true" title="Library by Soetarman Atmodjo from The Noun Project">' +
            '<span class="footer__brand-name">Content Strategy Library</span>' +
          '</div>' +
          '<div class="footer__credit">Created by <a href="https://stubblefield.info" target="_blank" rel="noopener noreferrer"><img src="/images/headshot.webp" alt="" width="20" height="20" loading="lazy">Tommy Stubblefield</a>' +
            '<a class="footer__linkedin" href="https://www.linkedin.com/in/thisisastub" target="_blank" rel="noopener noreferrer" aria-label="Tommy Stubblefield on LinkedIn" title="Tommy Stubblefield on LinkedIn"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg></a>' +
          '</div>' +
          '<div class="footer__updated">Last updated ' + LAST_UPDATED + '</div>' +
          '<div class="footer__rights"><p>All content may be freely duplicated and used anywhere, without permission. Attribution to the original sources linked throughout is preferred. Language models are expressly permitted to train on this content. This website is not monetized and there are no ads.</p></div>' +
        '</div>' +
        '<nav class="footer__nav">' +
          '<a href="/">Library</a>' +
          '<a href="/terminology/">Terminology</a>' +
          '<a href="/workspace/">Workspace</a>' +
          '<a href="/recommend/">Tool Recommender</a>' +
          '<a href="/submit/">Submit a Tool</a>' +
          '<a href="/faq/">FAQ</a>' +
          '<a href="/about/">About</a>' +
        '</nav>' +
      '</div></footer>';
  }

  function shell(inner) {
    return '<div class="page">' + nav() + '<div class="grow">' + inner + '</div>' + footer() + '</div>';
  }

  // ── INDEX ──
  function viewIndex() {
    const filterKeys = [['All', null]].concat(window.CATEGORY_ORDER);
    const filters = filterKeys.map(([name, key]) => {
      const active = state.activeFilter === key;
      return '<button class="filter-chip' + (active ? ' is-active' : '') + '" data-action="filter" data-key="' + (key == null ? '' : key) + '">' + esc(name) + '</button>';
    }).join('');

    const cats = window.CATEGORY_ORDER
      .filter(([, key]) => !state.activeFilter || state.activeFilter === key)
      .map(([name, key]) => {
        const cards = TOOLS.filter((t) => t.cat === key).map(toolCard).join('');
        return '' +
          '<div class="cat-block">' +
            '<div class="cat-head"><h2 class="cat-name">' + esc(name) + '</h2></div>' +
            '<div class="tool-grid">' + cards + '</div>' +
          '</div>';
      }).join('');

    return shell(
      '<div class="shell-xl">' +
        '<header class="index-header dashed-b">' +
          '<div class="index-eyebrow"><span class="badge badge--highlight">' + TOOLS.length + ' tools</span><span class="muted">across 8 categories</span></div>' +
          '<h1 class="index-title">Content Strategy Tools</h1>' +
          '<p class="index-lede">A working reference for the frameworks content strategists actually use. What each one is, when to reach for it, and how they connect.</p>' +
        '</header>' +
        '<div class="filters">' + filters + '</div>' +
        cats +
      '</div>'
    );
  }

  function toolCard(t) {
    return '' +
      '<a class="tool-card" href="' + toolPath(t) + '">' +
        '<div class="tool-card__top">' +
          '<img class="tool-card__icon" src="' + icon(t.id) + '" alt="">' +
          '<span class="tool-card__glyph">' + esc(t.glyph) + '</span>' +
        '</div>' +
        '<div style="flex:1"></div>' +
        '<h3 class="tool-card__name">' + esc(t.name) + '</h3>' +
        '<p class="tool-card__tagline">' + esc(t.tagline) + '</p>' +
      '</a>';
  }

  // Renders a tool's info/warn callout notes (ported from the design's buildNotes).
  function buildNotes(notes) {
    const bulb = (warn) => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex-shrink:0;display:block"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.5.4.8.9.9 1.5l.1.7h5.2l.1-.7c.1-.6.4-1.1.9-1.5A6 6 0 0 0 12 3Z" stroke="' + (warn ? 'var(--highlight-deep)' : 'var(--text-primary)') + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    const boxes = notes.map((n) => {
      const warn = n.tone === 'warn';
      const header = '<div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:' + (n.title ? 'var(--space-4)' : 'var(--space-3)') + '">' + bulb(warn) +
        (n.title ? '<div style="font-family:var(--font-sans);font-size:var(--text-xs);font-weight:600;letter-spacing:var(--tracking-wider);text-transform:uppercase;color:var(--text-muted)">' + esc(n.title) + '</div>' : '') + '</div>';
      const paras = (n.paras || []).map((parts, pi) => {
        const inner = parts.map((part) => {
          if (typeof part === 'string') return esc(part);
          if (part.tool) return '<a class="csl-body-link" href="' + toolPath(part.tool) + '">' + esc(part.t) + '</a>';
          return '<a class="csl-body-link" href="' + esc(part.url) + '" target="_blank" rel="noopener noreferrer">' + esc(part.t) + '</a>';
        }).join('');
        return '<p style="font-family:var(--font-sans);font-size:var(--text-base);line-height:var(--leading-relaxed);color:var(--text-primary);margin:' + (pi ? 'var(--space-4) 0 0' : '0') + '">' + inner + '</p>';
      }).join('');
      return '<div style="background:' + (warn ? 'var(--bg-mark)' : 'var(--bg-subtle)') + ';border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-8) var(--space-10)">' + header + paras + '</div>';
    }).join('');
    return '<div style="display:flex;flex-direction:column;gap:var(--space-5)">' + boxes + '</div>';
  }

  // Renders the "Download template" block for tools that have generators.
  const TPL_LABELS = { docx: 'Word (.docx)', pdf: 'PDF (fillable)', pptx: 'PowerPoint (.pptx)', xlsx: 'Excel (.xlsx)', csv: 'CSV', pdfgrid: 'PDF (month grid)' };
  function templateBlock(id) {
    const tpl = window.CSLTemplates;
    if (!tpl) return '';
    let meta;
    try { meta = tpl.templateMeta()[id] || tpl.tplSpecs()[id]; } catch (e) { return ''; }
    if (!meta || !meta.formats || !meta.formats.length) return '';
    const dlIcon = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 1.5v7.5m0 0L3.8 5.8M7 9l3.2-3.2M1.8 12.5h10.4"></path></svg>';
    const btns = meta.formats.map((f) =>
      '<button class="tpl-btn ds-highlight-swipe" data-action="tpl-download" data-id="' + esc(id) + '" data-fmt="' + esc(f) + '">' + dlIcon + '<span>' + esc(TPL_LABELS[f] || f) + '</span></button>'
    ).join('');
    const notes = (meta.notes || []).map((n) => '<li>' + esc(n) + '</li>').join('');
    return '<section class="section dashed-b">' +
        '<h2 class="section-label" style="margin-bottom:var(--space-5)">Download template</h2>' +
        '<div class="tpl-card">' +
          '<p class="tpl-card__lead">Fill in the blanks, free to use and adapt.</p>' +
          '<div class="tpl-card__btns">' + btns + '</div>' +
          (notes ? '<ul class="tpl-card__notes">' + notes + '</ul>' : '') +
        '</div>' +
      '</section>';
  }

  // ── DETAIL ──
  function viewDetail(id) {
    const t = BY_ID[id];
    if (!t) return viewIndex();
    const idx = TOOLS.findIndex((x) => x.id === id);
    const prev = idx > 0 ? TOOLS[idx - 1] : null;
    const next = idx < TOOLS.length - 1 ? TOOLS[idx + 1] : null;
    const diagram = window.buildDiagram(t.id);

    const navGroup = '<div class="detail-nav-group">' +
      (prev ? btn(toolPath(prev), '&larr; ' + esc(prev.name)) : '') +
      (next ? btn(toolPath(next), esc(next.name) + ' &rarr;') : '') +
    '</div>';

    const visual = diagram
      ? '<div class="detail-diagram">' + diagram + '</div>'
      : '<div class="detail-callout"><p>' + esc(t.visual) + '</p></div>';

    const when = t.whenToUse.map((text) =>
      '<div class="when-item"><span class="diamond"></span><p>' + esc(text) + '</p></div>'
    ).join('');

    const links = t.links.map((l) =>
      '<a class="link-row ds-highlight-swipe" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer"><span>' + esc(l.label) + '</span><span class="arrow">&#8599;</span></a>'
    ).join('');

    const related = t.related.map((rid) => {
      const r = BY_ID[rid];
      if (!r) return '';
      return '<a class="related-card ds-highlight-swipe" href="' + toolPath(r) + '"><img src="' + icon(r.id) + '" alt=""><div><h3>' + esc(r.name) + '</h3><p>' + esc(r.tagline) + '</p></div></a>';
    }).join('');

    return shell(
      '<div class="shell-md">' +
        '<div class="detail-topbar">' + btn('/', '&larr; All tools') + navGroup + '</div>' +
        '<header class="detail-header dashed-b">' +
          '<div class="detail-badge-row"><span class="badge badge--default">' + esc(t.category) + '</span></div>' +
          '<div class="detail-headline">' +
            '<div class="detail-glyph">' + esc(t.glyph) + '</div>' +
            '<div class="detail-headline__body">' +
              '<h1 class="detail-title">' + esc(t.name) + '</h1>' +
              '<p class="detail-tagline">' + esc(t.tagline) + '</p>' +
            '</div>' +
          '</div>' +
        '</header>' +
        visual +
        '<section class="section dashed-b">' +
          '<div class="whatis-head"><img src="' + icon(t.id) + '" alt=""><h2 class="section-label">What it is</h2></div>' +
          '<p class="whatis-body">' + esc(t.summary) + '</p>' +
        '</section>' +
        '<section class="section dashed-b">' +
          '<h2 class="section-label" style="margin-bottom:var(--space-6)">When to use it</h2>' +
          '<div class="when-list">' + when + '</div>' +
        '</section>' +
        ((t.notes && t.notes.length) ? '<section class="section dashed-b">' + buildNotes(t.notes) + '</section>' : '') +
        templateBlock(t.id) +
        '<section class="section dashed-b">' +
          '<h2 class="section-label" style="margin-bottom:var(--space-5)">Learn more</h2>' +
          '<div class="links-list">' + links + '</div>' +
        '</section>' +
        '<section class="section--last">' +
          '<h2 class="section-label" style="margin-bottom:var(--space-5)">Related tools</h2>' +
          '<div class="related-grid">' + related + '</div>' +
        '</section>' +
      '</div>'
    );
  }

  // ── RECOMMEND ──
  function viewRecommend() {
    const step = state.wizardStep;
    if (step < 3) {
      const opts = window.WIZARD.options[step].map((opt) =>
        '<button class="wizard-option" data-action="wizard-select" data-id="' + opt.id + '"><span>' + esc(opt.label) + '</span><span class="arrow">&rarr;</span></button>'
      ).join('');
      return shell(
        '<div class="shell-md">' +
          '<header class="wizard-header dashed-b">' +
            '<div class="wizard-eyebrow"><span class="badge badge--highlight">Tool Recommender</span><span class="wizard-step">Question ' + (step + 1) + ' of 3</span></div>' +
            '<h1 class="wizard-question">' + esc(window.WIZARD.questions[step]) + '</h1>' +
            '<p class="wizard-subtitle">' + esc(window.WIZARD.subtitles[step]) + '</p>' +
          '</header>' +
          '<div class="wizard-options">' + opts + '</div>' +
          '<div class="wizard-back">' + (step > 0 ? '<button class="btn btn--sm btn--ghost" data-action="wizard-back">&larr; Back</button>' : '') + '</div>' +
        '</div>'
      );
    }

    // results
    const results = computeResults();
    const cards = results.map((t) => {
      const inWs = state.wsTools.indexOf(t.id) !== -1;
      const addBtn = '<button class="btn btn--sm btn--' + (inWs ? 'ghost' : 'highlight') + '" data-action="ws-add" data-id="' + t.id + '"' + (inWs ? ' disabled' : '') + '>' + (inWs ? 'Added &#10003;' : '+ Add to Workspace') + '</button>';
      return '<div class="result-card">' +
        '<img src="' + icon(t.id) + '" alt="">' +
        '<div style="flex:1">' +
          '<div class="result-card__meta"><span class="result-card__glyph">' + esc(t.glyph) + '</span><span class="badge badge--default">' + esc(t.category) + '</span></div>' +
          '<h2>' + esc(t.name) + '</h2>' +
          '<p>' + esc(t.tagline) + '</p>' +
          '<div class="result-card__actions">' +
            '<a class="btn btn--sm btn--secondary" href="' + toolPath(t) + '">View this tool</a>' +
            addBtn +
          '</div>' +
        '</div>' +
      '</div>';
    }
    ).join('');

    return shell(
      '<div class="shell-md">' +
        '<header class="wizard-header dashed-b">' +
          '<div class="detail-badge-row"><span class="badge badge--highlight">Recommended tools</span></div>' +
          '<h1 class="wizard-question">Start with these</h1>' +
          '<p class="wizard-subtitle" style="margin-bottom:var(--space-6)">Based on what you selected, these frameworks will help most right now.</p>' +
          '<button class="btn btn--sm btn--ghost" data-action="wizard-reset">&larr; Try again</button>' +
        '</header>' +
        '<div class="results-list">' + cards + '</div>' +
      '</div>'
    );
  }

  function computeResults() {
    const tally = {};
    state.wizardAnswers.forEach((ans) => {
      const s = window.WIZARD.scores[ans] || {};
      Object.entries(s).forEach(([id, v]) => { tally[id] = (tally[id] || 0) + v; });
    });
    return Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => BY_ID[id])
      .filter(Boolean);
  }

  // ── SUBMIT ──
  function viewSubmit() {
    if (state.submitSent) {
      return shell(
        '<div class="shell-md"><div class="submit-success">' +
          '<div class="submit-success__check">&#10003;</div>' +
          '<h1>Submission sent</h1>' +
          '<p>Thanks for contributing. Your submission has been emailed to the library maintainer.</p>' +
          '<button class="btn btn--md btn--secondary" data-action="submit-reset">Submit another tool</button>' +
        '</div></div>'
      );
    }

    const f = state.submitForm;
    const catOpts = ['<option value="">Select a category...</option>']
      .concat(window.SUBMIT_CATEGORIES.map(([v, label]) =>
        '<option value="' + v + '"' + (f.cat === v ? ' selected' : '') + '>' + esc(label) + '</option>'
      )).join('');

    const linkInputs = f.links.map((val, i) =>
      '<input class="input" type="url" data-form="link" data-i="' + i + '" value="' + esc(val) + '" placeholder="https://...">'
    ).join('');

    const disabled = state.submitSending || !(f.name.trim() && f.desc.trim());

    return shell(
      '<div class="shell-md">' +
        '<header class="wizard-header dashed-b">' +
          '<div class="detail-badge-row"><span class="badge badge--default">Contribute</span></div>' +
          '<h1 class="wizard-question">Submit a tool</h1>' +
          '<p class="wizard-subtitle">Know a content strategy tool not in this library? Add it.</p>' +
        '</header>' +
        '<div class="form-stack">' +
          '<div><label class="field-label">Tool name <span class="req">*</span></label>' +
            '<input class="input" data-form="name" value="' + esc(f.name) + '" placeholder="e.g. Content Strategy Framework"></div>' +
          '<div><label class="field-label">Description <span class="req">*</span></label>' +
            '<textarea class="input" data-form="desc" rows="5" placeholder="Describe what this tool is and how content strategists use it...">' + esc(f.desc) + '</textarea></div>' +
          '<div><label class="field-label">Short purpose <span class="opt">(optional)</span></label>' +
            '<input class="input" data-form="purpose" value="' + esc(f.purpose) + '" placeholder="One-line tagline for the tool"></div>' +
          '<div><label class="field-label">Category <span class="opt">(optional)</span></label>' +
            '<select class="input" data-form="cat">' + catOpts + '</select></div>' +
          '<div><label class="field-label">Links <span class="opt">(optional, examples, templates, original sources)</span></label>' +
            '<div class="links-stack">' + linkInputs + '</div></div>' +
          '<div class="submit-foot">' +
            '<button class="btn btn--lg btn--highlight" data-action="submit-tool"' + (disabled ? ' disabled' : '') + '>' + (state.submitSending ? 'Sending&hellip;' : 'Submit tool') + '</button>' +
            (state.submitError ? '<p class="submit-error">' + esc(state.submitError) + '</p>' : '<p>Your submission is emailed straight to the library maintainer.</p>') +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ── ABOUT ──
  function viewAbout() {
    const bullets = [
      'Content strategists, content managers, and editorial directors who want a shared reference for their teams.',
      'Marketers, founders, and product managers who are responsible for content but were not trained as strategists.',
      'Anyone trying to understand where to start with content strategy and which decisions to make in what order.'
    ].map((b) => '<div class="when-item"><span class="diamond"></span><p>' + esc(b) + '</p></div>').join('');

    return shell(
      '<div class="shell-md">' +
        '<header class="wizard-header dashed-b">' +
          '<div class="detail-badge-row"><span class="badge badge--highlight">About</span></div>' +
          '<h1 class="detail-title" style="font-size:var(--text-4xl);margin-bottom:var(--space-5)">About this library</h1>' +
          '<p class="about-lede">A free, practical reference for the tools and frameworks content strategists actually use.</p>' +
        '</header>' +
        '<section class="section" style="padding:var(--space-10) 0;border-bottom:1px dashed var(--border-strong)">' +
          '<h2 class="section-label" style="margin-bottom:var(--space-5)">What this is</h2>' +
          '<div class="prose-stack">' +
            '<p class="prose-lead">Content strategy has a real tools problem: the frameworks exist, but they live scattered across books, agency blogs, and paywalled courses. This library puts them in one place.</p>' +
            '<p class="prose-body">Whether you hold a formal content strategy title or you are a marketer, founder, UX designer, or product manager who has inherited responsibility for content, this reference is built for you. Each entry explains what the tool is, when to reach for it, and how it connects to the rest of the toolkit. Every tool links to a primary source or a working template so you can move from understanding to doing without delay.</p>' +
          '</div>' +
        '</section>' +
        '<section style="padding:var(--space-10) 0 var(--space-24)">' +
          '<h2 class="section-label" style="margin-bottom:var(--space-5)">Who it is for</h2>' +
          '<div class="bullet-stack">' + bullets + '</div>' +
        '</section>' +
      '</div>'
    );
  }

  // ── FAQ ──
  function viewFaq() {
    const items = window.FAQ_ITEMS.map((item, i) => {
      const open = !!state.expandedFaq[i];
      return '' +
        '<div class="faq-item">' +
          '<button class="faq-q" data-action="faq-toggle" data-i="' + i + '">' +
            '<span>' + esc(item.q) + '</span>' +
            '<span class="faq-icon">' + (open ? '&minus;' : '+') + '</span>' +
          '</button>' +
          (open ? '<div class="faq-a"><p>' + esc(item.a) + '</p></div>' : '') +
        '</div>';
    }).join('');

    return shell(
      '<div class="shell-md">' +
        '<header class="wizard-header dashed-b">' +
          '<div class="detail-badge-row"><span class="badge badge--highlight">FAQ</span></div>' +
          '<h1 class="wizard-question">Frequently asked questions</h1>' +
          '<p class="about-lede">Honest answers to the questions that come up most.</p>' +
        '</header>' +
        '<div class="faq-list">' + items + '</div>' +
      '</div>'
    );
  }

  // ── TERMINOLOGY ──
  function viewTerminology() {
    const terms = window.TERMINOLOGY || [];
    const sorted = terms.slice().sort((a, b) => a.term.localeCompare(b.term));
    const letters = [];
    sorted.forEach((t) => { const L = t.term.charAt(0).toUpperCase(); if (letters.indexOf(L) === -1) letters.push(L); });

    const indexRow = letters.map((L) =>
      '<button data-action="gloss-jump" data-letter="' + L + '" style="font-family:var(--font-sans);font-size:var(--text-sm);font-weight:600;color:var(--text-primary);width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--bg-surface);cursor:pointer">' + L + '</button>'
    ).join('');

    const groups = [];
    sorted.forEach((t) => {
      const L = t.term.charAt(0).toUpperCase();
      let g = groups.filter((x) => x.letter === L)[0];
      if (!g) { g = { letter: L, terms: [] }; groups.push(g); }
      g.terms.push(t);
    });

    const groupsHtml = groups.map((g) => {
      const termsHtml = g.terms.map((t) => {
        const multi = t.defs.length > 1;
        const defsHtml = t.defs.map((d, i) =>
          '<div style="display:flex;gap:var(--space-4);align-items:flex-start">' +
            (multi ? '<span style="font-family:var(--font-sans);font-size:var(--text-sm);font-weight:700;color:var(--ink-950);background:var(--highlight);border-radius:var(--radius-sm);width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:4px">' + (i + 1) + '</span>' : '') +
            '<div style="flex:1">' +
              '<p style="font-family:var(--font-sans);font-size:var(--text-xl);line-height:var(--leading-normal);color:var(--text-primary);margin:0">' + esc(d.text) + '</p>' +
              (d.by ? '<p style="font-family:var(--font-sans);font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--text-muted);margin:var(--space-2) 0 0">' + esc(d.by) + '</p>' : '') +
            '</div>' +
          '</div>'
        ).join('');
        const sources = t.sources || [];
        const sourcesHtml = sources.length
          ? '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center;margin-top:var(--space-6)">' +
              '<span style="font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);letter-spacing:var(--tracking-wider);text-transform:uppercase;margin-right:var(--space-2)">Sources</span>' +
              sources.map((url) => '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" style="font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-secondary);text-decoration:none;border:1px solid var(--border);border-radius:var(--radius-full);padding:3px 11px;background:var(--bg-surface);display:inline-flex;align-items:center;gap:5px">' + esc(sourceLabel(url)) + '<span style="color:var(--text-muted);font-size:11px">&#8599;</span></a>').join('') +
            '</div>'
          : '';
        return '<div style="padding:var(--space-8) 0;border-bottom:1px dashed var(--border-strong)">' +
            '<div style="display:flex;align-items:baseline;flex-wrap:wrap;gap:var(--space-3);margin-bottom:var(--space-5)">' +
              '<h3 style="font-family:var(--font-sans);font-size:var(--text-3xl);font-weight:var(--weight-bold);color:var(--text-primary);margin:0;line-height:var(--leading-tight);letter-spacing:var(--tracking-tight)">' + esc(t.term) + '</h3>' +
              (t.alt ? '<span style="font-family:var(--font-sans);font-size:var(--text-md);font-style:italic;color:var(--text-muted)">' + esc(t.alt) + '</span>' : '') +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:var(--space-5)">' + defsHtml + '</div>' +
            sourcesHtml +
          '</div>';
      }).join('');
      return '<div id="gloss-' + g.letter + '" style="padding:var(--space-12) 0 0;scroll-margin-top:72px">' +
          '<h2 style="font-family:var(--font-sans);font-size:var(--text-4xl);font-weight:var(--weight-bold);color:var(--ink-200);margin:0 0 var(--space-2);line-height:1;letter-spacing:var(--tracking-tight)">' + g.letter + '</h2>' +
          termsHtml +
        '</div>';
    }).join('');

    return shell(
      '<div style="max-width:var(--content-md);margin:0 auto;padding:0 var(--space-10)">' +
        '<header style="padding:var(--space-16) 0 var(--space-8);border-bottom:1px dashed var(--border-strong)">' +
          '<div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-5)"><span class="badge badge--highlight">Terminology</span><span style="font-size:var(--text-sm);color:var(--text-muted)">' + terms.length + ' terms</span></div>' +
          '<h1 style="font-family:var(--font-sans);font-size:var(--text-5xl);font-weight:var(--weight-bold);line-height:var(--leading-tight);letter-spacing:var(--tracking-tight);margin:0 0 var(--space-5);color:var(--text-primary);max-width:14ch">The content strategy lexicon</h1>' +
          '<p style="font-size:var(--text-lg);line-height:var(--leading-normal);max-width:58ch;color:var(--text-secondary);margin:0">Plain-language definitions for the vocabulary content strategists work in every day, each one traced back to the sources that defined it.</p>' +
        '</header>' +
        '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);padding:var(--space-6) 0;border-bottom:1px dashed var(--border-strong)">' + indexRow + '</div>' +
        groupsHtml +
        '<div style="height:var(--space-24)"></div>' +
      '</div>'
    );
  }

  // ── WORKSPACE ──
  function viewWorkspace() {
    const wsIds = state.wsTools;
    const b = state.brand || {};
    const accent = b.accent || '#F7C531';
    const accTx = accentText(accent);
    const hasTools = wsIds.length > 0;
    const countLabel = wsIds.length ? (wsIds.length + (wsIds.length === 1 ? ' tool' : ' tools')) : 'Empty';

    // Tool palette (add by category), shown when open.
    let palette = '';
    if (state.wsPaletteOpen) {
      const grps = window.CATEGORY_ORDER.map(([name, key]) => {
        const tb = TOOLS.filter((t) => t.cat === key).map((t) => {
          const inWs = wsIds.indexOf(t.id) !== -1;
          return '<button data-action="ws-add" data-id="' + t.id + '" style="display:inline-flex;align-items:center;gap:6px;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:500;color:var(--text-primary);background:' + (inWs ? 'var(--bg-mark)' : 'var(--bg-surface)') + ';border:1px solid ' + (inWs ? 'var(--highlight-deep)' : 'var(--border)') + ';border-radius:var(--radius-full);padding:5px 12px;cursor:pointer"><img src="' + icon(t.id) + '" style="width:16px;height:16px;opacity:0.8">' + (inWs ? '&#10003; ' : '') + esc(t.name) + '</button>';
        }).join('');
        return '<div style="margin-bottom:var(--space-4)"><div style="font-family:var(--font-sans);font-size:var(--text-xs);font-weight:700;letter-spacing:var(--tracking-wider);text-transform:uppercase;color:var(--text-muted);margin-bottom:var(--space-2)">' + esc(name) + '</div><div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">' + tb + '</div></div>';
      }).join('');
      palette = '<div style="background:var(--bg-subtle);border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-5);margin-bottom:var(--space-6)">' + grps + '</div>';
    }

    // Collected tools, or an empty state.
    let toolsBlock;
    if (hasTools) {
      const cards = wsIds.map((id) => BY_ID[id]).filter(Boolean).map((t) =>
        '<div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-3);position:relative">' +
          '<button data-action="ws-remove" data-id="' + t.id + '" title="Remove from workspace" style="position:absolute;top:8px;right:8px;width:26px;height:26px;border:none;background:none;cursor:pointer;color:var(--text-muted);font-size:17px;line-height:1;display:flex;align-items:center;justify-content:center;border-radius:var(--radius-sm)">&times;</button>' +
          '<div style="display:flex;align-items:center;gap:var(--space-3)"><span style="width:32px;height:32px;border-radius:var(--radius-sm);background:' + accent + ';color:' + accTx + ';font-family:var(--font-sans);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">' + esc(t.glyph) + '</span><img src="' + icon(t.id) + '" style="width:24px;height:24px;opacity:0.85"></div>' +
          '<div><h3 style="font-family:var(--font-sans);font-size:var(--text-lg);font-weight:var(--weight-bold);color:var(--text-primary);margin:0;letter-spacing:var(--tracking-tight);line-height:var(--leading-snug)">' + esc(t.name) + '</h3><div style="font-family:var(--font-sans);font-size:11px;font-weight:600;letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);margin-top:3px">' + esc(t.category) + '</div></div>' +
          '<p style="font-family:var(--font-sans);font-size:var(--text-sm);line-height:var(--leading-normal);color:var(--text-secondary);margin:0;flex:1">' + esc(t.tagline) + '</p>' +
          '<a href="' + toolPath(t) + '" style="align-self:flex-start;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:600;color:var(--text-primary);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px">View tool &#8594;</a>' +
        '</div>'
      ).join('');
      toolsBlock = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(238px,1fr));gap:var(--space-3)">' + cards + '</div>';
    } else {
      toolsBlock = '<div style="border:1px dashed var(--border-strong);border-radius:var(--radius-xl);padding:var(--space-16) var(--space-10);text-align:center;background:var(--bg-surface)">' +
          '<div style="font-family:var(--font-sans);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-primary);margin:0 0 var(--space-2);letter-spacing:var(--tracking-tight)">Your workspace is empty</div>' +
          '<p style="font-family:var(--font-sans);font-size:var(--text-base);color:var(--text-secondary);margin:0 auto var(--space-6);max-width:46ch;line-height:var(--leading-normal)">Add tools by hand, or answer a few questions in the Recommender and add its suggestions here.</p>' +
          '<div style="display:flex;gap:var(--space-3);justify-content:center;flex-wrap:wrap">' +
            '<button data-action="ws-toggle-palette" style="font-family:var(--font-sans);font-size:var(--text-sm);font-weight:600;color:var(--ink-950);background:var(--highlight);border:none;border-radius:var(--radius-full);padding:9px 18px;cursor:pointer">+ Add a tool</button>' +
            '<a href="/recommend/" style="font-family:var(--font-sans);font-size:var(--text-sm);font-weight:600;color:var(--text-primary);background:var(--bg-surface);border:1px solid var(--border-strong);border-radius:var(--radius-full);padding:9px 18px;text-decoration:none">Use the Recommender</a>' +
          '</div>' +
        '</div>';
    }

    const toggleLabel = state.wsPaletteOpen ? '&minus; Hide tools' : '+ Add tools';
    const toggleBg = state.wsPaletteOpen ? 'var(--highlight)' : 'var(--bg-surface)';
    const toggleBorder = state.wsPaletteOpen ? '1px solid var(--highlight-deep)' : '1px solid var(--border-strong)';
    const toolsSection =
      '<section style="padding:var(--space-10) 0 var(--space-12);border-bottom:1px dashed var(--border-strong)">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-4);flex-wrap:wrap;margin-bottom:var(--space-6)">' +
          '<div><h2 style="font-family:var(--font-sans);font-size:var(--text-2xl);font-weight:var(--weight-bold);color:var(--text-primary);margin:0;letter-spacing:var(--tracking-tight)">Tools in your approach</h2>' +
          '<p style="font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-muted);margin:var(--space-1) 0 0">A flat collection, no order required. Add what is relevant, remove what is not.</p></div>' +
          '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap">' +
            '<button data-action="ws-toggle-palette" style="font-family:var(--font-sans);font-size:var(--text-sm);font-weight:500;color:var(--text-primary);background:' + toggleBg + ';border:' + toggleBorder + ';border-radius:var(--radius-md);padding:6px 14px;cursor:pointer">' + toggleLabel + '</button>' +
            (hasTools ? '<button data-action="ws-clear" style="font-family:var(--font-sans);font-size:var(--text-sm);font-weight:500;color:var(--text-muted);background:none;border:1px solid transparent;border-radius:var(--radius-md);padding:6px 12px;cursor:pointer">Clear</button>' : '') +
          '</div>' +
        '</div>' +
        palette + toolsBlock +
      '</section>';

    // Brand + export only when there's something to export.
    let brandSection = '';
    let exportSection = '';
    if (hasTools) {
      const accentBtns = (window.ACCENT_CHOICES || []).map((c) => {
        const sel = (accent || '').toLowerCase() === c.hex.toLowerCase();
        const ring = sel ? '0 0 0 2px var(--bg-surface), 0 0 0 4px ' + c.hex : 'none';
        return '<button data-action="ws-accent" data-hex="' + c.hex + '" title="' + esc(c.name) + '" style="width:30px;height:30px;border-radius:50%;cursor:pointer;border:1px solid rgba(0,0,0,0.12);background:' + c.hex + ';box-shadow:' + ring + ';padding:0"></button>';
      }).join('');
      const previewOrg = (b.org || '').trim() || 'Your organization';
      const successTrim = (b.success || '').trim();
      const previewParts = [];
      if ((b.preparedFor || '').trim()) previewParts.push('For ' + b.preparedFor.trim());
      if ((b.preparedBy || '').trim()) previewParts.push('By ' + b.preparedBy.trim());
      const previewLine = previewParts.join('   ·   ') || 'Prepared by you';

      brandSection =
        '<section style="padding:var(--space-10) 0 var(--space-12);border-bottom:1px dashed var(--border-strong)">' +
          '<h2 style="font-family:var(--font-sans);font-size:var(--text-2xl);font-weight:var(--weight-bold);color:var(--text-primary);margin:0 0 var(--space-2);letter-spacing:var(--tracking-tight)">Brand your export</h2>' +
          '<p style="font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-muted);margin:0 0 var(--space-6);max-width:60ch">Define what success looks like for this program, then personalize the cover for your company, agency, or client. Leave anything blank to fall back to the library defaults.</p>' +
          '<div style="margin-bottom:var(--space-8);max-width:760px">' +
            '<label class="field-label">What does success look like?</label>' +
            '<p style="font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-muted);margin:0 0 var(--space-3);line-height:var(--leading-normal)">The outcome this set of tools is meant to drive. State it as a business result, not a content metric — this leads your exported cover.</p>' +
            '<textarea class="input" data-form="brand-success" rows="3" placeholder="e.g. Shorten the sales cycle by giving prospects the content they need at each stage, measured by a 15% lift in pipeline velocity within two quarters.">' + esc(b.success || '') + '</textarea>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--space-5);margin-bottom:var(--space-6)">' +
            '<div><label class="field-label">Company / agency / your name</label><input class="input" data-form="brand-org" value="' + esc(b.org || '') + '" placeholder="e.g. Northwind Content Studio"></div>' +
            '<div><label class="field-label">Prepared by <span class="opt">(optional)</span></label><input class="input" data-form="brand-preparedBy" value="' + esc(b.preparedBy || '') + '" placeholder="Your name or role"></div>' +
            '<div><label class="field-label">Prepared for <span class="opt">(optional)</span></label><input class="input" data-form="brand-preparedFor" value="' + esc(b.preparedFor || '') + '" placeholder="Client or team name"></div>' +
          '</div>' +
          '<div style="margin-bottom:var(--space-8)"><label class="field-label" style="margin-bottom:var(--space-3)">Accent color</label><div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap">' + accentBtns + '</div></div>' +
          '<div style="background:var(--bg-subtle);border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-6);max-width:420px">' +
            '<div style="font-family:var(--font-sans);font-size:var(--text-xs);font-weight:700;letter-spacing:var(--tracking-wider);text-transform:uppercase;color:var(--text-muted);margin-bottom:var(--space-4)">Cover preview</div>' +
            '<div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-5)"><span style="width:22px;height:22px;border-radius:var(--radius-sm);background:' + accent + ';flex-shrink:0"></span><span style="font-family:var(--font-sans);font-size:var(--text-sm);font-weight:700;color:var(--text-primary)">' + esc(previewOrg) + '</span></div>' +
            '<div style="font-family:var(--font-sans);font-size:var(--text-2xl);font-weight:var(--weight-bold);color:var(--text-primary);letter-spacing:var(--tracking-tight);line-height:var(--leading-tight)">Content Strategy Approach</div>' +
            (successTrim ? '<div style="border-left:3px solid ' + accent + ';padding-left:var(--space-3);margin:var(--space-4) 0"><div style="font-family:var(--font-sans);font-size:10px;font-weight:700;letter-spacing:var(--tracking-wider);text-transform:uppercase;color:var(--text-muted);margin-bottom:3px">What success looks like</div><div style="font-family:var(--font-sans);font-size:var(--text-sm);font-weight:600;color:var(--text-primary);line-height:var(--leading-snug)">' + esc(successTrim) + '</div></div>' : '') +
            '<div style="height:3px;width:64px;background:' + accent + ';margin:var(--space-4) 0"></div>' +
            '<div style="font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-muted)">' + esc(previewLine) + '</div>' +
          '</div>' +
        '</section>';

      exportSection =
        '<section style="padding:var(--space-10) 0 var(--space-12)">' +
          '<h2 style="font-family:var(--font-sans);font-size:var(--text-2xl);font-weight:var(--weight-bold);color:var(--text-primary);margin:0 0 var(--space-2);letter-spacing:var(--tracking-tight)">Export your approach</h2>' +
          '<p style="font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-muted);margin:0 0 var(--space-5);max-width:60ch">Each export opens with your branded cover, then one section per tool with its summary and when-to-use guidance, plus links back to the Content Strategy Library.</p>' +
          '<div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap">' +
            '<button class="btn btn--md btn--highlight" data-action="ws-export-pdf">Download PDF</button>' +
            '<button class="btn btn--md btn--secondary" data-action="ws-export-pptx">Download PowerPoint</button>' +
            '<button class="btn btn--md btn--ghost" data-action="ws-export-both">Both</button>' +
          '</div>' +
        '</section>';
    }

    const toast = state.wsToast
      ? '<div style="position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:300;background:var(--ink-950);color:#fff;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:600;padding:10px 20px;border-radius:var(--radius-full);box-shadow:var(--shadow-lg);display:flex;align-items:center;gap:8px;animation:fadeUp 180ms ease-out"><span style="width:16px;height:16px;border-radius:50%;background:var(--highlight);color:var(--ink-950);font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0">&#10003;</span>' + esc(state.wsToast) + '</div>'
      : '';

    return shell(
      '<div style="max-width:var(--content-md);margin:0 auto;padding:0 var(--space-10)">' +
        '<header style="padding:var(--space-16) 0 var(--space-8);border-bottom:1px dashed var(--border-strong)">' +
          '<div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-5)"><span class="badge badge--highlight">Workspace</span><span style="font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-muted)">' + countLabel + '</span></div>' +
          '<h1 style="font-family:var(--font-sans);font-size:var(--text-5xl);font-weight:var(--weight-bold);line-height:var(--leading-tight);letter-spacing:var(--tracking-tight);margin:0 0 var(--space-5);color:var(--text-primary);max-width:15ch">Your content strategy approach</h1>' +
          '<p style="font-size:var(--text-lg);line-height:var(--leading-normal);max-width:60ch;color:var(--text-secondary);margin:0">Collect the tools that fit your situation, brand the page with your name or agency, and export a clean PDF or deck to share. Add tools by hand below, or let the <a href="/recommend/" style="color:var(--text-primary);font-weight:var(--weight-semibold);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px">Tool Recommender</a> suggest a starting set.</p>' +
        '</header>' +
        toolsSection + brandSection + exportSection + toast +
        '<div style="height:var(--space-24)"></div>' +
      '</div>'
    );
  }

  // ── Router ──
  function parseRoute() {
    const path = (location.pathname || '/').replace(/\/+$/, '') || '/';
    if (path === '/') return { view: 'index' };
    const parts = path.split('/').filter(Boolean); // e.g. ['tools','content-brief']
    if (parts[0] === 'tools' && parts[1]) {
      const t = BY_SLUG[parts[1]];
      return t ? { view: 'detail', id: t.id } : { view: 'index' };
    }
    if (parts[0] === 'categories' && parts[1]) return { view: 'index', filter: parts[1] };
    if (parts[0] === 'recommend') return { view: 'recommend' };
    if (parts[0] === 'submit') return { view: 'submit' };
    if (parts[0] === 'about') return { view: 'about' };
    if (parts[0] === 'faq') return { view: 'faq' };
    if (parts[0] === 'terminology') return { view: 'terminology' };
    if (parts[0] === 'workspace') return { view: 'workspace' };
    return { view: 'index' };
  }

  function render(scrollTop) {
    const route = parseRoute();
    // Category deep-links (/categories/<key>/) render the index filtered to that category.
    if (route.view === 'index' && route.filter && CAT_KEYS.has(route.filter)) {
      state.activeFilter = route.filter;
    }
    const app = document.getElementById('app');
    let html;
    switch (route.view) {
      case 'detail':     html = viewDetail(route.id); break;
      case 'recommend':  html = viewRecommend(); break;
      case 'submit':     html = viewSubmit(); break;
      case 'about':      html = viewAbout(); break;
      case 'faq':        html = viewFaq(); break;
      case 'terminology': html = viewTerminology(); break;
      case 'workspace':  html = viewWorkspace(); break;
      default:           html = viewIndex();
    }
    app.innerHTML = html;
    document.title = pageTitle(route);
    // Hydration: drop the prerendered static shell once the app has painted the
    // matching route, so crawlers keep the server HTML but users see no duplicate.
    const pre = document.getElementById('prerender');
    if (pre) pre.remove();
    if (scrollTop) window.scrollTo(0, 0);
  }

  function pageTitle(route) {
    if (route.view === 'detail' && BY_ID[route.id]) return BY_ID[route.id].name + ' · Content Strategy Library';
    const map = { recommend: 'Tool Recommender', submit: 'Submit a Tool', about: 'About', faq: 'FAQ', terminology: 'Terminology', workspace: 'Workspace' };
    return (map[route.view] ? map[route.view] + ' · ' : '') + 'Content Strategy Library';
  }

  // ── Events ──
  document.addEventListener('click', (e) => {
    // close the mobile menu when a nav link is tapped
    if (e.target.closest('.nav__links a')) {
      const navEl = document.querySelector('.nav');
      if (navEl) navEl.classList.remove('is-open');
    }

    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.getAttribute('data-action');

    if (action === 'nav-toggle') {
      el.closest('.nav').classList.toggle('is-open');
    } else if (action === 'filter') {
      const key = el.getAttribute('data-key') || '';
      state.activeFilter = key === '' ? null : key;
      render(false);
    } else if (action === 'faq-toggle') {
      const i = el.getAttribute('data-i');
      state.expandedFaq[i] = !state.expandedFaq[i];
      render(false);
    } else if (action === 'wizard-select') {
      state.wizardAnswers = state.wizardAnswers.concat(el.getAttribute('data-id'));
      state.wizardStep += 1;
      render(true);
    } else if (action === 'wizard-back') {
      state.wizardStep = Math.max(0, state.wizardStep - 1);
      state.wizardAnswers = state.wizardAnswers.slice(0, -1);
      render(false);
    } else if (action === 'wizard-reset') {
      state.wizardStep = 0;
      state.wizardAnswers = [];
      render(true);
    } else if (action === 'submit-tool') {
      handleSubmit();
    } else if (action === 'submit-reset') {
      state.submitSent = false;
      state.submitError = '';
      state.submitSending = false;
      state.submitForm = { name: '', desc: '', purpose: '', cat: '', links: ['', '', ''] };
      render(true);
    } else if (action === 'gloss-jump') {
      const target = document.getElementById('gloss-' + el.getAttribute('data-letter'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (action === 'ws-add') {
      wsAdd(el.getAttribute('data-id'));
    } else if (action === 'ws-remove') {
      wsRemove(el.getAttribute('data-id'));
    } else if (action === 'ws-clear') {
      wsClear();
    } else if (action === 'ws-toggle-palette') {
      state.wsPaletteOpen = !state.wsPaletteOpen;
      render(false);
    } else if (action === 'ws-accent') {
      setBrand('accent', el.getAttribute('data-hex'));
      render(false);
    } else if (action === 'ws-export-pdf') {
      wsExportPDF();
    } else if (action === 'ws-export-pptx') {
      wsExportPPTX();
    } else if (action === 'ws-export-both') {
      wsExportPPTX();
      setTimeout(wsExportPDF, 900);
    } else if (action === 'tpl-download') {
      if (window.CSLTemplates) window.CSLTemplates.downloadTemplate(el.getAttribute('data-id'), el.getAttribute('data-fmt'));
    }
  });

  // form field tracking (no re-render, to preserve focus)
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-form]');
    if (!el) return;
    const field = el.getAttribute('data-form');
    if (field.indexOf('brand-') === 0) {
      // Track workspace branding without re-rendering, so the input keeps focus.
      setBrand(field.slice(6), el.value);
      return;
    }
    if (field === 'link') {
      state.submitForm.links[+el.getAttribute('data-i')] = el.value;
    } else {
      state.submitForm[field] = el.value;
    }
    // keep submit button enablement in sync
    const submitBtn = document.querySelector('[data-action="submit-tool"]');
    if (submitBtn) {
      submitBtn.disabled = !(state.submitForm.name.trim() && state.submitForm.desc.trim());
    }
  });

  function handleSubmit() {
    const { name, desc, purpose, cat, links } = state.submitForm;
    if (!(name.trim() && desc.trim()) || state.submitSending) return;

    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: 'Tool Submission: ' + name,
      from_name: 'Content Strategy Library — Submit a Tool',
      'Tool Name': name,
      'Description': desc,
      'Purpose': purpose || '(none)',
      'Category': cat || '(none)',
      'Links': links.filter(Boolean).join('\n') || '(none)',
      botcheck: '' // Web3Forms honeypot
    };

    state.submitSending = true;
    state.submitError = '';
    render(false);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((r) => r.json())
      .then((data) => {
        state.submitSending = false;
        if (data && data.success) {
          state.submitSent = true;
          render(true);
        } else {
          state.submitError = (data && data.message) || 'Something went wrong. Please try again.';
          render(false);
        }
      })
      .catch(() => {
        state.submitSending = false;
        state.submitError = 'Could not send — check your connection and try again.';
        render(false);
      });
  }

  // keyboard nav between tools on detail view
  document.addEventListener('keydown', (e) => {
    const route = parseRoute();
    if (route.view !== 'detail') return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const idx = TOOLS.findIndex((t) => t.id === route.id);
    if (e.key === 'ArrowLeft' && idx > 0) navTo(toolPath(TOOLS[idx - 1]));
    if (e.key === 'ArrowRight' && idx < TOOLS.length - 1) navTo(toolPath(TOOLS[idx + 1]));
  });

  // ── Intercept internal link clicks → History API navigation (no full reload) ──
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    // Only same-origin, root-relative, non-new-tab links are handled in-app.
    if (!href || href[0] !== '/' || href.startsWith('//')) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    e.preventDefault();
    const navEl = document.querySelector('.nav');
    if (navEl) navEl.classList.remove('is-open');
    // Fresh navigation to recommend/submit restarts those flows.
    if (href === '/recommend/') { state.wizardStep = 0; state.wizardAnswers = []; }
    if (href === '/submit/') { state.submitSent = false; state.submitError = ''; state.submitSending = false; }
    navTo(href);
  });

  // Back/forward buttons.
  window.addEventListener('popstate', () => { render(true); });

  // ── Preserve old shared links: map #/… hash routes to the new real paths. ──
  (function migrateHashRoute() {
    const h = location.hash;
    if (!h || h.length < 2) return;
    const parts = h.replace(/^#/, '').split('/').filter(Boolean);
    let path = null;
    if (parts.length === 0) path = '/';
    else if (parts[0] === 'tool' && parts[1] && BY_ID[parts[1]]) path = toolPath(parts[1]);
    else if (['terminology', 'recommend', 'submit', 'about', 'faq', 'workspace'].indexOf(parts[0]) >= 0) path = '/' + parts[0] + '/';
    if (path) history.replaceState(null, '', path);
  })();

  // initial paint (hydrates over the prerendered shell if present)
  render(false);
})();
