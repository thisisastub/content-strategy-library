/* ============================================================
   Content Strategy Library, app (routing + views)
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
    recommend: '/recommend/', submit: '/submit/', workspace: '/workspace/',
    updates: '/updates/', awards: '/best-of-2026/'
  };
  // Navigate via History API, then re-render.
  function navTo(path) {
    if (path !== location.pathname) history.pushState(null, '', path);
    render(true);
  }

  // Bump this when the library's content is updated.
  // Auto-stamped by build.js on every build (see stampLastUpdated). Manual edits
  // here are overwritten on the next `node build.js`.
  const LAST_UPDATED = 'October 1, 2026';

  // Web3Forms endpoint for the "Submit a Tool" form. The access key is public by design
  // (Web3Forms routes it to the maintainer's inbox and handles spam filtering server-side).
  const WEB3FORMS_ACCESS_KEY = '2e290c09-02e0-4e55-b53f-0c238871ff5a';

  // ── In-view UI state (not reflected in the URL) ──
  const state = {
    activeFilter: null,
    toolQuery: '',
    contactTopic: 'suggest-a-tool',
    // Tool detail: which accordions are open, which citation format, and the
    // transient 'copied' acknowledgements.
    panels: {},
    // Modals: null, or { kind: 'notify'|'nominate', app }. `sent` flips the
    // dialog to its thank-you state; `tried` turns on inline validation.
    webPanel: '',        // '' | 'recommend' | 'workspace'
    planCopied: false,
    modal: null,
    modalSending: false,
    modalError: '',
    modalSent: false,
    modalTried: false,
    notifyForm: { email: '', first: '', last: '', wantTemplates: false, wantNews: false },
    nomForm: { kind: 'A person', name: '', category: '', link: '', why: '', email: '', you: '', news: false },
    citeFmt: 'apa',
    copiedAnchor: '',
    copiedText: '',
    wsCustomizeOpen: false,
    // Logo lives in memory only, never in localStorage.
    wsLogo: null,
    wsLogoAttested: false,
    glossQuery: '',
    wizardStep: 0,
    wizardAnswers: [],
    expandedFaq: {},
    submitSent: false,
    submitSending: false,
    submitError: '',
    submitForm: { name: '', desc: '', purpose: '', cat: '', links: ['', '', ''] },
    contactForm: { name: '', email: '', message: '', toolName: '', link: '', nomName: '', nomKind: 'A person' },
    contactSent: false,
    contactSending: false,
    contactError: '',
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
    const current = opts.current ? ' aria-current="page"' : '';
    return '<a class="btn btn--' + size + ' btn--' + variant + extra + '" href="' + href + '"' + current + '>' + label + '</a>';
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
  // One gate for every export path: an unattested logo must not ship.
  function logoBlocked() {
    if (state.wsLogo && !state.wsLogoAttested) {
      alert('Tick the box confirming you are authorized to use this logo, or remove it, before exporting.');
      return true;
    }
    return false;
  }

  // Logo upload. Deliberately memory-only: a logo is someone else's mark more
  // often than not, so it never touches localStorage and never leaves the tab.
  // Exports stay blocked until the attestation box is ticked.
  function logoField() {
    const L = state.wsLogo || {};
    const has = !!L.dataUrl;
    const ok = !!state.wsLogoAttested;
    return '<div class="ws-logo">' +
        '<label class="field-label" for="wf-logo">Logo <span class="opt">(optional)</span></label>' +
        '<p class="ws-logo__hint">PNG, JPG, WEBP or SVG. It replaces the accent square on the cover of your ' +
          'PDF and PowerPoint. Kept in this browser tab only, never uploaded and never saved.</p>' +
        '<input class="input" type="file" id="wf-logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" data-action="ws-logo-pick">' +
        (has ? '<div class="ws-logo__preview"><img src="' + L.dataUrl + '" alt=""><span>' + esc(L.name || 'logo') + '</span>' +
          '<button class="btn btn--sm btn--ghost" data-action="ws-logo-clear">Remove</button></div>' : '') +
        (has ? '<p class="ws-logo__warn">Only upload a logo you are authorized to use. You are responsible for ' +
          'having the rights to any mark you add to an export.</p>' +
          '<label class="ws-logo__attest"><input type="checkbox" data-action="ws-logo-attest"' + (ok ? ' checked' : '') + '>' +
          '<span>I am authorized to use this logo.</span></label>' : '') +
      '</div>';
  }

  // `ids` lets the Recommender export its three results directly, using the
  // library defaults, without touching the Workspace.
  function wsExportModel(ids) {
    const tools = (ids || state.wsTools).map((id) => BY_ID[id]).filter(Boolean).map((t) => ({
      name: t.name, category: t.category, tagline: t.tagline || '',
      summary: t.summary || '', whenToUse: t.whenToUse || [],
      links: (t.links || []).map((l) => l.label + ', ' + l.url)
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
  function wsExportPDF(ids) {
    const m = wsExportModel(ids);
    if (logoBlocked()) return;
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
  function wsExportPPTX(ids) {
    const Pptx = window.PptxGenJS;
    if (!Pptx) { alert('PowerPoint export is still loading. Please try again in a moment.'); return; }
    const m = wsExportModel(ids);
    if (logoBlocked()) return;
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
  // Clipboard, with a fall back for every way the async API can refuse:
  // an insecure context, a denied permission, or an unfocused document. The
  // promise has to be caught, or the rejection is unhandled AND the fall back
  // never runs, which leaves nothing on the clipboard.
  function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
        return;
      }
    } catch (e) { /* fall through */ }
    legacyCopy(text);
  }

  function legacyCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) { /* nothing more we can do */ }
  }

  // Shows a "copied" acknowledgement for 1.8s, then puts it back.
  let flashTimer = null;
  function flash(key, value) {
    state[key] = value;
    render(false);
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      state[key] = '';
      flashTimer = null;
      render(false);
    }, 1800);
  }

  // A tool page opened at #apps|#share|#embed|#cite opens that accordion first,
  // then scrolls to it. Runs once per paint; harmless on every other route.
  let lastDeepLink = '';
  function openDeepLink(route) {
    const hash = (location.hash || '').replace(/^#/, '');
    if (!hash || route.view !== 'detail') { lastDeepLink = ''; return; }
    const key = route.id + '#' + hash;
    if (key === lastDeepLink) return;
    lastDeepLink = key;
    const PANELS = ['apps', 'share', 'embed', 'cite'];
    if (PANELS.indexOf(hash) !== -1 && !state.panels[hash]) {
      state.panels = Object.assign({}, state.panels, { [hash]: true });
      render(false);
    }
    setTimeout(() => scrollToSection(hash), 0);
  }

  // Deep links land 64px above the target so the sticky nav does not cover it.
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: y, behavior: "auto" });
  }

  // Full-bleed artwork behind a page header. `variant` picks the veil weight:
  // 'dense' (86/90) for the library, tool detail and recommender, default
  // (72/82) elsewhere. Goes in as the header's first child.
  const HEROES = {
    home:        { src: '/images/heroes/home.webp',        pos: 'center 40%', dense: true },
    recommender: { src: '/images/heroes/recommender.webp', pos: 'center 45%', dense: true },
    terminology: { src: '/images/heroes/terminology.webp', pos: 'center 50%' },
    updates:     { src: '/images/heroes/updates.webp',     pos: 'center 58%' },
    faq:         { src: '/images/heroes/faq.webp',         pos: 'center 22%' },
    about:       { src: '/images/heroes/about.webp',       pos: 'center 30%' }
  };
  function bgHero(key, opts) {
    const h = HEROES[key];
    if (!h) return '';
    opts = opts || {};
    const cls = 'bg-hero' + (h.dense ? ' bg-hero--dense' : '') + (opts.tall ? ' bg-hero--tall' : '');
    return '<div class="' + cls + '" aria-hidden="true">' +
        '<img src="' + h.src + '" alt="" style="object-position:' + h.pos + '">' +
        '<div class="bg-hero__veil"></div>' +
      '</div>';
  }

  // Which nav item is the current page. Library owns the index and every tool
  // page; the rest own their own route.
  function navCurrent() {
    const r = parseRoute();
    return {
      library: r.view === 'index' || r.view === 'detail',
      terminology: r.view === 'terminology',
      recommend: r.view === 'recommend',
      updates: r.view === 'updates' || r.view === 'update',
      faq: r.view === 'faq',
      about: r.view === 'about'
    };
  }

  function nav() {
    const cur = navCurrent();
    const libIcon ='<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" style="display:block"><defs><filter id="hl-icon"><feFlood flood-color="#16160E" result="c"></feFlood><feComposite in="c" in2="SourceAlpha" operator="in"></feComposite></filter></defs><image href="/images/library-icon.png" x="0" y="0" width="22" height="22" filter="url(#hl-icon)"></image></svg>';
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
          btn('/', 'Library', { cls: 'ds-highlight-swipe', current: cur.library }) +
          btn('/terminology/', 'Terminology', { cls: 'ds-highlight-swipe', current: cur.terminology }) +
          btn('/recommend/', 'Tool Recommender', { cls: 'ds-highlight-swipe', current: cur.recommend }) +
          btn('/updates/', 'Updates', { cls: 'ds-highlight-swipe', current: cur.updates }) +
          btn('/faq/', 'FAQ', { cls: 'ds-highlight-swipe', current: cur.faq }) +
          btn('/about/', 'About', { cls: 'ds-highlight-swipe', current: cur.about }) +
        '</div>' +
      '</div></nav>';
  }

  function footer() {
    return '' +
      '<footer class="footer"><div class="footer__inner">' +
        '<div>' +
          '<div class="footer__brand-row">' +
            '<img src="/images/library-icon.png" width="16" height="16" alt="" aria-hidden="true" title="Library by Soetarman Atmodjo from The Noun Project">' +
            '<span class="footer__brand-name">Content Strategy Library</span>' +
          '</div>' +
          '<div class="footer__credit">Created by <a href="https://stubblefield.info" target="_blank" rel="noopener noreferrer">Tommy Stubblefield</a>' +
            '<span class="footer__icons">' +
              '<a class="footer__avatar" href="https://stubblefield.info" target="_blank" rel="noopener noreferrer" aria-label="Tommy Stubblefield\'s website"><img src="/images/headshot.webp" alt="" width="20" height="20" loading="lazy"></a>' +
              '<a class="footer__linkedin" href="https://www.linkedin.com/in/thisisastub" target="_blank" rel="noopener noreferrer" aria-label="Tommy Stubblefield on LinkedIn" title="Tommy Stubblefield on LinkedIn"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg></a>' +
            '</span>' +
          '</div>' +
          '<div class="footer__updated">Last updated ' + LAST_UPDATED + '</div>' +
          '<div class="footer__rights"><p>All content may be freely duplicated and used anywhere, without permission. Attribution to the original sources linked throughout is preferred. Language models are expressly permitted to train on this content. This website is not monetized and there are no ads.</p></div>' +
        '</div>' +
        '<nav class="footer__nav">' +
          '<a class="soft-highlight" href="/">Library</a>' +
          '<a class="soft-highlight" href="/terminology/">Terminology</a>' +
          '<a class="soft-highlight" href="/workspace/">Workspace</a>' +
          '<a class="soft-highlight" href="/recommend/">Tool Recommender</a>' +
          '<a class="soft-highlight" href="/contact/">Contact</a>' +
          '<a class="soft-highlight" href="/updates/">Updates</a>' +
          '<a class="soft-highlight" href="/best-of-2026/">Best of 2026</a>' +
          '<a class="soft-highlight" href="/faq/">FAQ</a>' +
          '<a class="soft-highlight" href="/about/">About</a>' +
          '<button type="button" class="soft-highlight footer__linkbtn" data-action="credits-open">Imagery credits</button>' +
          '<a class="soft-highlight" href="/privacy/">Privacy</a>' +
          '<button type="button" class="footer__cookie-prefs soft-highlight" onclick="if(window.openCookiePrefs)openCookiePrefs()">Cookie preferences</button>' +
        '</nav>' +
      '</div></footer>';
  }

  function shell(inner) {
    return '<div class="page">' +
      '<a class="skip-link" href="#maincontent">Skip to content</a>' +
      '<span id="sr-status" class="sr-only" role="status" aria-live="polite"></span>' +
      nav() +
      '<main class="grow" id="maincontent" tabindex="-1">' + inner + '</main>' +
      footer() +
      modalLayer() +
    '</div>';
  }

  // A plan link carries someone else’s content, so the viewer is kept out
  // of the index for as long as it is on screen.
  function setNoindex(on) {
    let tag = document.querySelector('meta[name="robots"][data-plan]');
    if (on && !tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'robots');
      tag.setAttribute('content', 'noindex');
      tag.setAttribute('data-plan', '');
      document.head.appendChild(tag);
    } else if (!on && tag) {
      tag.remove();
    }
  }

  function decodePlan(payload) {
    if (!window.CSLPlan) return null;
    return window.CSLPlan.decode(payload, TOOLS.map((t) => t.id));
  }

  // ── WEB VERSION ──
  // Builds the plan from whatever set of tools the caller is showing.
  function planFor(ids) {
    const b = state.brand || {};
    return {
      tools: ids,
      org: (b.org || '').trim(),
      preparedBy: (b.preparedBy || '').trim(),
      preparedFor: (b.preparedFor || '').trim(),
      success: (b.success || '').trim(),
      accent: b.accent || '#F7C531'
    };
  }

  function planUrl(ids) {
    if (!window.CSLPlan) return '';
    return window.CSLPlan.url(planFor(ids), location.origin);
  }

  // The "which" key stops the two pages fighting over one open flag.
  function webPanel(which, ids) {
    if (state.webPanel !== which) return '';
    const url = planUrl(ids);
    const note = which === 'workspace'
      ? 'The link updates as you edit. Everything in it is written into the link itself, so nothing is stored on the library’s servers.'
      : 'A link that opens these tools as a page anyone can read. Everything is written into the link itself, so nothing is stored on the library’s servers.';
    const logoNote = (which === 'workspace' && state.wsLogo)
      ? '<p class="webpanel__logo">Your logo is not included in the web version. It appears only in the PDF and PowerPoint downloads.</p>'
      : '';
    return '<div class="webpanel">' +
        '<p class="webpanel__note">' + esc(note) + '</p>' +
        '<div class="webpanel__row">' +
          '<input class="input webpanel__url" type="text" readonly value="' + esc(url) + '" ' +
            'aria-label="Web version link" data-action="plan-select">' +
          '<button class="btn btn--md btn--highlight" data-action="plan-copy" data-url="' + esc(url) + '">' +
            (state.planCopied ? 'Copied ✓' : 'Copy link') + '</button>' +
          '<a class="btn btn--md btn--secondary" href="' + esc(url) + '" target="_blank" rel="noopener">Open ↗</a>' +
        '</div>' +
        logoNote +
      '</div>';
  }

  // ── SHARED PLAN VIEWER ──
  function viewPlan(plan) {
    if (!plan) {
      return shell(
        '<div class="shell-md"><div class="plan-bad">' +
          '<h1>This link doesn’t open a plan</h1>' +
          '<p>The link may have been cut short when it was copied, or the plan it pointed to is no longer valid.</p>' +
          '<a class="btn btn--lg btn--highlight" href="/recommend/">Build your own &rarr;</a>' +
        '</div></div>'
      );
    }
    const accent = plan.accent;
    const onAccent = accentText(accent);
    const tools = plan.tools.map((id) => BY_ID[id]).filter(Boolean);
    const meta = [plan.preparedBy ? 'Prepared by ' + plan.preparedBy : '',
                  plan.preparedFor ? 'Prepared for ' + plan.preparedFor : '']
      .filter(Boolean).join(' · ');

    const cards = tools.map((t, i) => {
      const when = (t.whenToUse || []).map((x) => '<li>' + esc(x) + '</li>').join('');
      const links = (t.links || []).map((l) =>
        '<a href="' + esc(l.url) + '" target="_blank" rel="nofollow noopener">' + esc(l.label) + '</a>').join('');
      return '<article class="plan-card">' +
          '<div class="plan-card__num" style="background:' + esc(accent) + ';color:' + esc(onAccent) + '">' + (i + 1) + '</div>' +
          '<div class="plan-card__body">' +
            '<p class="plan-card__cat">' + esc(t.category) + '</p>' +
            '<h2>' + esc(t.name) + '</h2>' +
            '<p class="plan-card__tagline">' + esc(t.tagline) + '</p>' +
            '<p class="plan-card__summary">' + esc(t.summary) + '</p>' +
            (when ? '<h3>When should I use it?</h3><ul class="plan-card__when">' + when + '</ul>' : '') +
            (links ? '<h3>Sources</h3><div class="plan-card__links">' + links + '</div>' : '') +
            '<a class="plan-card__more csl-body-link" href="' + toolPath(t) + '">Read the full tool in the library &rarr;</a>' +
          '</div>' +
        '</article>';
    }).join('');

    return shell(
      '<div class="shell-md plan">' +
        '<header class="plan__header">' +
          '<div class="plan__brand">' +
            '<span class="plan__swatch" style="background:' + esc(accent) + '"></span>' +
            '<span class="plan__org">' + esc(plan.org || 'A content strategy approach') + '</span>' +
          '</div>' +
          '<h1>Content Strategy Approach</h1>' +
          '<p class="plan__intro">These are the frameworks chosen for this program, and what each one is for.</p>' +
          (plan.success
            ? '<p class="plan__success"><strong>Success looks like:</strong> ' + esc(plan.success) + '</p>'
            : '') +
          (meta ? '<p class="plan__meta">' + esc(meta) + '</p>' : '') +
        '</header>' +
        '<div class="plan__cards">' + cards + '</div>' +
        '<div class="plan__actions">' +
          '<button class="btn btn--md btn--highlight" data-action="plan-adopt">Edit a copy in your Workspace</button>' +
          '<button class="btn btn--md btn--secondary" data-action="plan-print">Print or save as PDF</button>' +
        '</div>' +
        '<p class="plan__disclaimer">This plan was assembled by whoever shared the link. The Content Strategy Library ' +
          'hosts the tool descriptions; it did not write or endorse this particular selection.</p>' +
      '</div>'
    );
  }

  // ── IMAGERY CREDITS ──
  // Every photograph used on the site, with where it appears and who took it.
  const CREDITS = [
    { thumb: '/images/library-icon.png', contain: true,
      where: 'Library icon, top nav', go: 'top',
      who: 'Soetarman Atmodjo', site: 'The Noun Project',
      url: 'https://thenounproject.com/icon/library-8367955/' },
    { thumb: '/images/heroes/recommender.webp', where: 'Tool Recommender header', go: '/recommend/',
      who: 'bejone1824', site: 'Pixabay',
      url: 'https://pixabay.com/photos/tool-belt-hammer-screwdrivers-10305989/' },
    { thumb: '/images/heroes/terminology.webp', where: 'Terminology header', go: '/terminology/',
      who: 'Cup of Couple', site: 'Pexels',
      url: 'https://www.pexels.com/photo/notepads-and-stationeries-on-white-surface-7657391/' },
    { thumb: '/images/heroes/updates.webp', where: 'Updates header', go: '/updates/',
      who: 'tama66', site: 'Pixabay',
      url: 'https://pixabay.com/photos/typewriter-write-old-vintage-8622984/' },
    { thumb: '/images/heroes/faq.webp', where: 'FAQ header', go: '/faq/',
      who: 'Pavel Danilyuk', site: 'Pexels',
      url: 'https://www.pexels.com/photo/a-woman-in-white-shirt-raising-her-hand-8761544/' },
    { thumb: '/images/heroes/about.webp', where: 'About header', go: '/about/',
      who: 'noah_jurik', site: 'Pixabay',
      url: 'https://pixabay.com/photos/library-architecture-travel-3267001/' }
  ];

  function creditsDialog() {
    const cam = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 7h3l2-2h8l2 2h3v12H3z"/><circle cx="12" cy="13" r="3.5"/></svg>';
    const rows = CREDITS.map((c, i) =>
      '<div class="credit">' +
        '<img class="credit__thumb' + (c.contain ? ' credit__thumb--contain' : '') + '" src="' + esc(c.thumb) + '" alt="">' +
        '<button class="credit__where ds-highlight-swipe" data-action="credits-go" data-go="' + esc(c.go) + '">' +
          esc(c.where) + '</button>' +
        '<a class="credit__who" href="' + esc(c.url) + '" target="_blank" rel="nofollow noopener" ' +
          'aria-label="' + esc('Photo by ' + c.who + ' on ' + c.site + ' (opens in new tab)') + '">' +
          cam + '<span>' + esc(c.who) + '</span></a>' +
      '</div>'
    ).join('');
    return '<h2 id="modal-title" class="credits__title">Imagery credits</h2>' +
      '<div class="credits">' + rows + '</div>';
  }

  // ── MODALS ──
  // A selector for whatever opened the dialog, not the element itself: every
  // render rebuilds #app, so the original node is detached by the time we want
  // to put focus back on it.
  let modalOpener = null;
  function openModal(m, trigger) {
    modalOpener = null;
    if (trigger && trigger.getAttribute('data-action')) {
      modalOpener = '[data-action="' + trigger.getAttribute('data-action') + '"]';
      const app = trigger.getAttribute('data-app');
      if (app) modalOpener += '[data-app="' + app + '"]';
    }
    state.modal = m;
    state.modalSent = false;
    state.modalTried = false;
    state.modalError = '';
    state.modalSending = false;
    render(false);
    const dlg = document.querySelector('.modal__dialog');
    if (!dlg) return;
    const first = dlg.querySelector('input, select, textarea, button:not([data-action="modal-close"])');
    if (first) { try { first.focus(); } catch (e) { /* ignore */ } }
  }

  function closeModal() {
    if (!state.modal) return;
    state.modal = null;
    render(false);
    if (modalOpener) {
      const back = document.querySelector(modalOpener);
      if (back) { try { back.focus(); } catch (e) { /* ignore */ } }
    }
    modalOpener = null;
  }

  // One dialog at a time, rendered from the shell. Esc and a backdrop click
  // close it; focus moves in on open and returns to the trigger on close.
  function modalLayer() {
    const m = state.modal;
    if (!m) return '';
    const body = m.kind === 'notify' ? notifyDialog(m)
      : m.kind === 'credits' ? creditsDialog()
      : nominateDialog();
    return '<div class="modal" data-action="modal-backdrop">' +
        '<div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal-stop>' +
          '<button class="modal__close" data-action="modal-close" aria-label="Close">&times;</button>' +
          body +
        '</div>' +
      '</div>';
  }

  function fieldError(msg) {
    return state.modalTried && msg ? '<p class="modal__err">' + esc(msg) + '</p>' : '';
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function notifyDialog(m) {
    const f = state.notifyForm;
    if (state.modalSent) {
      return '<h2 id="modal-title">You are on the list</h2>' +
        '<p class="modal__note">We will email you when the ' + esc(m.app) + ' templates are ready.</p>' +
        '<button class="btn btn--md btn--secondary" data-action="modal-close">Close</button>';
    }
    const emailBad = !EMAIL_RE.test(f.email.trim()) ? 'Enter an email address we can reach you at.' : '';
    const consentBad = !(f.wantTemplates || f.wantNews) ? 'Pick at least one so we know what to send.' : '';
    return '<h2 id="modal-title">Get the ' + esc(m.app) + ' template</h2>' +
      '<p class="modal__note">It is not ready yet. Leave your email and we will tell you when it is.</p>' +
      '<div class="form-stack">' +
        '<div><label class="field-label" for="nf-email">Your email <span class="req">*</span></label>' +
          '<input class="input" id="nf-email" type="email" data-nform="email" value="' + esc(f.email) + '" placeholder="you@example.com">' +
          fieldError(emailBad) + '</div>' +
        '<div class="form-row">' +
          '<div><label class="field-label" for="nf-first">First name <span class="opt">(optional)</span></label>' +
            '<input class="input" id="nf-first" data-nform="first" value="' + esc(f.first) + '"></div>' +
          '<div><label class="field-label" for="nf-last">Last name <span class="opt">(optional)</span></label>' +
            '<input class="input" id="nf-last" data-nform="last" value="' + esc(f.last) + '"></div>' +
        '</div>' +
        '<div>' +
          '<label class="modal__check"><input type="checkbox" data-nform="wantTemplates"' + (f.wantTemplates ? ' checked' : '') + '>' +
            '<span>Tell me when the Notion and Miro templates are ready.</span></label>' +
          '<label class="modal__check"><input type="checkbox" data-nform="wantNews"' + (f.wantNews ? ' checked' : '') + '>' +
            '<span>Send me occasional library updates.</span></label>' +
          fieldError(consentBad) +
        '</div>' +
        '<div class="submit-foot">' +
          '<button class="btn btn--lg btn--highlight" data-action="notify-send"' + (state.modalSending ? ' disabled' : '') + '>' +
            (state.modalSending ? 'Sending&hellip;' : 'Notify me') + '</button>' +
          (state.modalError
            ? '<p class="submit-error">' + esc(state.modalError) + '</p>'
            : '<p>Your email is used only for this. See the <a href="/privacy/" class="csl-body-link">privacy page</a>.</p>') +
        '</div>' +
      '</div>';
  }

  function nominateDialog() {
    const f = state.nomForm;
    if (state.modalSent) {
      return '<h2 id="modal-title">Nomination sent</h2>' +
        '<p class="modal__note">Thanks. We read every one.</p>' +
        '<div class="modal__actions">' +
          '<button class="btn btn--md btn--highlight" data-action="nom-again">Nominate someone else</button>' +
          '<button class="btn btn--md btn--ghost" data-action="modal-close">Close</button>' +
        '</div>';
    }
    const KINDS = [['A person', 'Person’s name'], ['A company', 'Company name'],
      ['A campaign', 'Campaign name and who ran it'], ['An influencer', 'Influencer’s name']];
    const kind = KINDS.filter((k) => k[0] === f.kind)[0] || KINDS[0];
    const chips = KINDS.map(([k]) =>
      '<button type="button" class="chip' + (f.kind === k ? ' is-active' : '') + '" ' +
        'data-action="nom-kind" data-kind="' + esc(k) + '">' + esc(k) + '</button>').join('');
    const cats = ['Not sure'].concat(
      (window.AWARD_CATEGORIES || []).map((c) => c.name),
      (window.AWARD_INFLUENCERS || []).map((c) => c.name));
    const opts = cats.map((c) =>
      '<option value="' + esc(c) + '"' + ((f.category || 'Not sure') === c ? ' selected' : '') + '>' + esc(c) + '</option>').join('');
    const nameBad = !f.name.trim() ? 'Who are you nominating?' : '';
    const whyBad = f.why.trim().length < 20 ? 'A sentence at least, so we understand why.' : '';
    const emailBad = !EMAIL_RE.test(f.email.trim()) ? 'We need a valid email in case we have a question.' : '';
    return '<h2 id="modal-title">Make a nomination</h2>' +
      '<p class="modal__note">Tell us who or what belongs on the Best of 2026 list, and why.</p>' +
      '<div class="form-stack">' +
        '<div><span class="field-label">What are you nominating?</span><div class="chip-row">' + chips + '</div></div>' +
        '<div><label class="field-label" for="nm-name">' + esc(kind[1]) + ' <span class="req">*</span></label>' +
          '<input class="input" id="nm-name" data-mform="name" value="' + esc(f.name) + '">' + fieldError(nameBad) + '</div>' +
        '<div><label class="field-label" for="nm-cat">Category <span class="opt">(optional)</span></label>' +
          '<select class="input" id="nm-cat" data-mform="category">' + opts + '</select></div>' +
        '<div><label class="field-label" for="nm-link">Link <span class="opt">(optional)</span></label>' +
          '<input class="input" id="nm-link" data-mform="link" value="' + esc(f.link) + '" placeholder="https://"></div>' +
        '<div><label class="field-label" for="nm-why">Why them? <span class="req">*</span></label>' +
          '<textarea class="input" id="nm-why" data-mform="why" rows="4">' + esc(f.why) + '</textarea>' + fieldError(whyBad) + '</div>' +
        '<div><label class="field-label" for="nm-email">Your email <span class="req">*</span></label>' +
          '<input class="input" id="nm-email" type="email" data-mform="email" value="' + esc(f.email) + '" placeholder="you@example.com">' +
          fieldError(emailBad) + '</div>' +
        '<div><label class="field-label" for="nm-you">Your name <span class="opt">(optional)</span></label>' +
          '<input class="input" id="nm-you" data-mform="you" value="' + esc(f.you) + '"></div>' +
        '<label class="modal__check"><input type="checkbox" data-mform="news"' + (f.news ? ' checked' : '') + '>' +
          '<span>Email me when the Best of 2026 honorees are announced.</span></label>' +
        '<div class="submit-foot">' +
          '<button class="btn btn--lg btn--highlight" data-action="nom-send"' + (state.modalSending ? ' disabled' : '') + '>' +
            (state.modalSending ? 'Sending&hellip;' : 'Send nomination') + '</button>' +
          (state.modalError ? '<p class="submit-error">' + esc(state.modalError) + '</p>' : '') +
        '</div>' +
      '</div>';
  }

  // ── INDEX ──
  // Free-text match across everything a reader might type: name, tagline,
  // summary, the visual phrase and the category label.
  function toolMatches(t, q) {
    if (!q) return true;
    const hay = [t.name, t.tagline, t.summary, t.visual, t.category].join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function viewIndex() {
    const q = (state.toolQuery || '').trim().toLowerCase();
    const filterKeys = [['All', null]].concat(window.CATEGORY_ORDER);
    const filters = filterKeys.map(([name, key]) => {
      const active = state.activeFilter === key;
      return '<button class="filter-chip' + (active ? ' is-active' : '') + '" data-action="filter" data-key="' + (key == null ? '' : key) + '">' + esc(name) + '</button>';
    }).join('');

    // Search and the category chips combine; a category with no hits disappears.
    let shown = 0;
    let order = 0;
    const cats = window.CATEGORY_ORDER
      .filter(([, key]) => !state.activeFilter || state.activeFilter === key)
      .map(([name, key]) => {
        const hits = TOOLS.filter((t) => t.cat === key && toolMatches(t, q));
        if (!hits.length) return '';
        shown += hits.length;
        const cards = hits.map((t) => toolCard(t, order++)).join('');
        return '' +
          '<div class="cat-block">' +
            '<div class="cat-head"><h2 class="cat-name">' + esc(name) + '</h2></div>' +
            '<div class="tool-grid">' + cards + '</div>' +
          '</div>';
      }).join('');

    const count = q ? (shown === 1 ? '1 tool matches' : shown + ' tools match') : '';
    const none = q && !shown
      ? '<div class="tool-search__none">' +
          '<p>No tools match &ldquo;' + esc(state.toolQuery.trim()) + '&rdquo;.</p>' +
          '<button class="btn btn--sm btn--secondary" data-action="tool-search-clear">Clear search</button>' +
        '</div>'
      : '';

    const magnifier = '<svg class="tool-search__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>';

    return shell(
      '<div class="shell-xl">' +
        '<header class="index-header dashed-b has-bg-hero">' + bgHero('home') +
          '<h1 class="index-title">Content Strategy Tools</h1>' +
          '<p class="index-lede">A working reference for the frameworks content strategists actually use. Easily look up what each one is and when to reach for it.</p>' +
        '</header>' +
        '<div class="tool-search">' +
          '<label for="tool-search">Search tools</label>' +
          '<div class="tool-search__field">' + magnifier +
            '<input class="input" type="search" id="tool-search" data-form="tool-query" ' +
              'placeholder="Type to filter, e.g. persona" value="' + esc(state.toolQuery || '') + '" autocomplete="off">' +
          '</div>' +
          '<span class="tool-search__count" aria-live="polite">' + esc(count) + '</span>' +
        '</div>' +
        '<div class="filters">' + filters + '</div>' +
        cats + none +
        '<div style="height:var(--space-12)"></div>' +
      '</div>'
    );
  }

  // `order` is the card's visual position, used to stagger the NEW flag fade.
  function toolCard(t, order) {
    const flag = t.isNew
      ? '<span class="new-flag" style="--nf-delay:' + (500 + order * 150) + 'ms">NEW</span>'
      : '';
    return '' +
      '<a class="tool-card" href="' + toolPath(t) + '">' +
        '<div class="tool-card__top">' +
          '<img class="tool-card__icon" src="' + icon(t.id) + '" alt="">' +
          '<span class="tool-card__flags">' + flag +
            '<span class="tool-card__glyph">' + esc(t.glyph) + '</span>' +
          '</span>' +
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
  // Copy-link button that sits beside every section heading.
  function sectionAnchor(id) {
    const copied = state.copiedAnchor === id;
    const icon = copied
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="12" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"/></svg>';
    return '<button class="csl-anchor" data-action="copy-anchor" data-id="' + id + '" ' +
      'aria-label="Copy link to this section">' + icon +
      '<span class="csl-anchor-tip">' + (copied ? 'Link copied' : 'Copy link to this section') + '</span></button>';
  }

  function sectionHead(id, label) {
    return '<div class="sec-head"><h2 id="h-' + id + '">' + esc(label) + '</h2>' + sectionAnchor(id) + '</div>';
  }

  // Contents card, floated right inside the first section.
  function contentsCard(t, hasTemplate) {
    const D = window.CSLToolDetail;
    if (!D) return '';
    const rows = D.toc(t, { hasTemplate: hasTemplate }).map((i) =>
      '<a class="toc__item' + (i.sub ? ' toc__item--sub' : '') + ' ds-highlight-swipe" href="#' + i.id + '"' +
        (i.panel ? ' data-action="toc-open" data-panel="' + i.panel + '"' : '') +
        '>' + esc(i.label) + '</a>'
    ).join('');
    return '<aside class="toc" aria-label="Contents"><p class="toc__title">Contents</p>' + rows + '</aside>';
  }

  function accRow(key, label, open) {
    const chev = open ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6';
    return '<button class="acc-row" data-action="panel-toggle" data-panel="' + key + '" aria-expanded="' + (!!open) + '">' +
        '<span><span>' + esc(label) + '</span></span>' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" aria-hidden="true"><path d="' + chev + '"/></svg>' +
      '</button>';
  }

  function sharePanels(t) {
    const D = window.CSLToolDetail;
    if (!D) return '';
    const panels = state.panels || {};
    const url = D.toolUrl(t);
    const copied = (k) => state.copiedText === k;
    let out = '';

    if (D.hasApps(t)) {
      out += '<div class="acc" id="apps">' + accRow('apps', 'Get Notion or Miro templates', panels.apps) +
        (panels.apps
          ? '<div class="acc__body"><div class="app-cards">' +
              ['Notion', 'Miro'].map((n) =>
                '<button class="app-card" data-action="notify-open" data-app="' + n + '">' +
                  '<span class="app-card__name">' + n + '</span>' +
                  '<span class="app-card__state">Coming soon</span>' +
                  '<span class="app-card__hint">Coming soon. Click to be notified when these are done.</span>' +
                '</button>').join('') +
            '</div></div>'
          : '') + '</div>';
    }

    out += '<div class="acc" id="share">' + accRow('share', 'Share this tool', panels.share) +
      (panels.share
        ? '<div class="acc__body">' +
            '<button class="btn btn--lg btn--ink acc__wide" data-action="copy-text" data-key="share" data-value="' + esc(url) + '">' +
              (copied('share') ? 'Link copied' : 'Copy link to this tool') + '</button>' +
            '<p class="acc__url">' + esc(url) + '</p>' +
          '</div>'
        : '') + '</div>';

    const code = D.embedCode(t);
    out += '<div class="acc" id="embed">' + accRow('embed', 'Embed this tool', panels.embed) +
      (panels.embed
        ? '<div class="acc__body">' +
            '<div class="embed-preview">' + code + '</div>' +
            '<pre class="embed-code">' + esc(code) + '</pre>' +
            '<button class="btn btn--md btn--secondary" data-action="copy-text" data-key="embed" data-value="' + esc(code) + '">' +
              (copied('embed') ? 'Copied' : 'Copy embed code') + '</button>' +
          '</div>'
        : '') + '</div>';

    const fmt = state.citeFmt || 'apa';
    const c = D.cites(t)[fmt];
    const plain = c.a + c.b + c.c;
    const tabs = [['apa', 'APA'], ['mla', 'MLA'], ['link', 'Plain link']].map(([k, label]) =>
      '<button class="cite-tab' + (fmt === k ? ' is-active' : '') + '" data-action="cite-fmt" data-fmt="' + k + '">' + label + '</button>'
    ).join('');
    out += '<div class="acc" id="cite">' + accRow('cite', 'Cite this page', panels.cite) +
      (panels.cite
        ? '<div class="acc__body">' +
            '<div class="cite-tabs">' + tabs + '</div>' +
            '<p class="cite-text">' + esc(c.a) + '<em>' + esc(c.b) + '</em>' + esc(c.c) + '</p>' +
            '<button class="btn btn--md btn--secondary" data-action="copy-text" data-key="cite" data-value="' + esc(plain) + '">' +
              (copied('cite') ? 'Copied' : 'Copy citation') + '</button>' +
          '</div>'
        : '') + '</div>';
    return '<div class="acc-group">' + out + '</div>';
  }

  // ── DETAIL ──
  function viewDetail(id) {
    const t = BY_ID[id];
    if (!t) return viewIndex();
    const D = window.CSLToolDetail;
    const diagram = window.buildDiagram(t.id);

    const visual = diagram
      ? '<div class="detail-diagram">' + diagram + '</div>'
      : '<div class="detail-callout"><p>' + esc(t.visual) + '</p></div>';

    const when = t.whenToUse.map((text) =>
      '<div class="when-item"><span class="diamond"></span><p>' + esc(text) + '</p></div>'
    ).join('');

    const links = t.links.map((l) =>
      '<a class="link-row gradient-highlight" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' +
        '<span class="gh-title">' + esc(l.label) + '</span><span class="gh-icon">&#8599;</span></a>'
    ).join('');

    const related = t.related.map((rid) => {
      const r = BY_ID[rid];
      if (!r) return '';
      return '<a class="related-card ds-highlight-swipe" href="' + toolPath(r) + '"><img src="' + icon(r.id) + '" alt=""><div><h3>' + esc(r.name) + '</h3><p>' + esc(r.tagline) + '</p></div></a>';
    }).join('');

    const tpl = templateBlock(t.id);
    const hasTemplate = !!tpl;
    const newFlag = t.isNew ? '<span class="new-flag is-in">NEW</span>' : '';

    return shell(
      '<div class="shell-md">' +
        '<header class="detail-header dashed-b has-bg-hero">' + bgHero('home', { tall: true }) +
          '<div class="detail-badge-row"><span class="badge badge--default">' + esc(t.category) + '</span>' + newFlag + '</div>' +
          '<div class="detail-headline">' +
            '<div class="detail-glyph">' + esc(t.glyph) + '</div>' +
            '<div class="detail-headline__body">' +
              '<h1 class="detail-title">' + esc(t.name) + '</h1>' +
              '<p class="detail-tagline">' + esc(t.tagline) + '</p>' +
            '</div>' +
          '</div>' +
        '</header>' +
        visual +
        '<section class="sec dashed-b" id="what-is-it">' +
          contentsCard(t, hasTemplate) +
          sectionHead('what-is-it', D ? D.whatTitle(t) : 'What is it?') +
          '<p class="sec__lede">' + esc(t.summary) + '</p>' +
        '</section>' +
        '<section class="sec dashed-b" id="when-to-use">' +
          sectionHead('when-to-use', D ? D.whenTitle(t) : 'When should I use it?') +
          '<div class="when-list">' + when + '</div>' +
        '</section>' +
        ((t.notes && t.notes.length)
          ? '<section class="sec dashed-b" id="notes">' + sectionHead('notes', 'Notes') + buildNotes(t.notes) + '</section>'
          : '') +
        '<section class="sec dashed-b" id="template">' +
          sectionHead('template', hasTemplate ? 'Download the template' : 'Share and cite') +
          tpl +
          sharePanels(t) +
        '</section>' +
        '<section class="sec dashed-b" id="learn-more">' +
          sectionHead('learn-more', 'Learn more') +
          '<div class="links-list">' + links + '</div>' +
        '</section>' +
        (related
          ? '<section class="sec sec--last" id="related">' +
              sectionHead('related', 'Related tools') +
              '<div class="related-grid">' + related + '</div>' +
            '</section>'
          : '') +
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
          '<header class="wizard-header dashed-b has-bg-hero">' + bgHero('recommender') +
            '<h1 class="wizard-question">' + esc(window.WIZARD.questions[step]) + '</h1>' +
            '<p class="wizard-subtitle">' + esc(window.WIZARD.subtitles[step]) + '</p>' +
          '</header>' +
          '<div class="wizard-options">' + opts + '</div>' +
          '<div class="wizard-back">' +
            (step > 0 ? '<button class="btn btn--sm btn--ghost" data-action="wizard-back">&larr; Back</button>' : '<span></span>') +
            '<span class="wizard-step">Question ' + (step + 1) + ' of 3</span>' +
          '</div>' +
        '</div>'
      );
    }

    // results
    const results = computeResults();
    const wsCount = state.wsTools.length;
    const plural = wsCount === 1 ? '' : 's';
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

    // Once tools are in the Workspace, surface the clear next step: go view it.
    // The recommender exports its three results directly, with the library
    // defaults; branding is something you add later in the Workspace.
    const takeWith = '<section class="take-with dashed-t">' +
        '<h2>Take these tools with you</h2>' +
        '<p>Download a PDF or PowerPoint, or get a web version you can send as a link. ' +
          'To add your name, colors, and a success statement first, open them in your Workspace.</p>' +
        '<div class="take-with__btns">' +
          '<button class="btn btn--md btn--highlight" data-action="rec-export-pdf">Download PDF</button>' +
          '<button class="btn btn--md btn--secondary" data-action="rec-export-pptx">Download PowerPoint</button>' +
          '<button class="btn btn--md btn--secondary" data-action="web-toggle" data-which="recommend">Web version</button>' +
        '</div>' +
        webPanel('recommend', results.map((t) => t.id)) +
      '</section>';

    return shell(
      '<div class="shell-md">' +
        '<header class="wizard-header dashed-b has-bg-hero">' + bgHero('recommender') +
          '<div class="detail-badge-row"><span class="badge badge--highlight">Recommended tools</span></div>' +
          '<h1 class="wizard-question">Start with these</h1>' +
          '<p class="wizard-subtitle" style="margin-bottom:var(--space-5)">Based on what you selected, these frameworks will help most right now. Add the ones you want to your Workspace, then export a branded plan.</p>' +
          '<div class="wizard-actions">' +
            '<button class="btn btn--sm btn--ghost" data-action="wizard-reset">&larr; Try again</button>' +
            '<a class="btn btn--sm btn--secondary" href="/workspace/">' +
              (wsCount ? 'View Workspace (' + wsCount + ') &rarr;' : 'Go to Workspace &rarr;') +
            '</a>' +
          '</div>' +
        '</header>' +
        '<div class="results-list">' + cards + '</div>' +
        takeWith +
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
      '<input class="input" type="url" data-form="link" data-i="' + i + '" aria-label="Link ' + (i + 1) + '" value="' + esc(val) + '" placeholder="https://...">'
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
          '<div><label class="field-label" for="sf-name">Tool name <span class="req">*</span></label>' +
            '<input class="input" id="sf-name" data-form="name" value="' + esc(f.name) + '" placeholder="e.g. Content Strategy Framework"></div>' +
          '<div><label class="field-label" for="sf-desc">Description <span class="req">*</span></label>' +
            '<textarea class="input" id="sf-desc" data-form="desc" rows="5" placeholder="Describe what this tool is and how content strategists use it...">' + esc(f.desc) + '</textarea></div>' +
          '<div><label class="field-label" for="sf-purpose">Short purpose <span class="opt">(optional)</span></label>' +
            '<input class="input" id="sf-purpose" data-form="purpose" value="' + esc(f.purpose) + '" placeholder="One-line tagline for the tool"></div>' +
          '<div><label class="field-label" for="sf-cat">Category <span class="opt">(optional)</span></label>' +
            '<select class="input" id="sf-cat" data-form="cat">' + catOpts + '</select></div>' +
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

  // ── BADGE + CONFETTI ──
  // The badge SVG names Plus Jakarta Sans but carries no @font-face. Loaded
  // through <img> it renders in an isolated document with no access to the
  // page's fonts, so the lettering falls back. Inlining it into the DOM lets
  // it inherit the font the rest of the page already loaded.
  const svgCache = {};
  function inlineSvgs(root) {
    (root || document).querySelectorAll('[data-inline-svg]:not([data-svg-done])').forEach((el) => {
      const src = el.getAttribute('data-inline-svg');
      el.setAttribute('data-svg-done', '');
      const put = (text) => {
        el.innerHTML = text;
        const svg = el.querySelector('svg');
        if (svg) { svg.style.display = 'block'; svg.setAttribute('aria-hidden', 'true'); }
      };
      if (svgCache[src]) { put(svgCache[src]); return; }
      fetch(src)
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status))))
        .then((t) => { svgCache[src] = t; put(t); })
        .catch(() => {
          // Fall back to the plain image rather than showing nothing.
          el.innerHTML = '<img src="' + esc(src) + '" alt="" style="display:block;width:100%;height:100%;object-fit:contain">';
        });
    });
  }

  // Falling confetti over the awards artwork: runs once for 8s, then fades out
  // over 1.2s. Skipped entirely under prefers-reduced-motion.
  function runConfetti(cv) {
    if (!cv || cv._ran) return;
    cv._ran = true;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = () => cv.clientWidth;
    const H = () => cv.clientHeight;
    const size = () => { cv.width = W() * dpr; cv.height = H() * dpr; };
    size();
    if (!W() || !H()) { cv._ran = false; return; }
    const cols = ['#F7C531', '#C99A14', '#F8F7F2', '#E8D9A8'];
    const N = Math.min(90, Math.round(W() / 14));
    const mk = (y) => ({
      x: Math.random() * W(), y: y,
      vy: 0.5 + Math.random() * 0.9, vx: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.12,
      w: 4 + Math.random() * 4, h: 6 + Math.random() * 6,
      c: cols[Math.floor(Math.random() * cols.length)], ph: Math.random() * 6.28
    });
    const ps = Array.from({ length: N }, () => mk(-Math.random() * Math.min(H(), 600)));
    const t0 = performance.now(), STOP = 8000, FADE = 1200;
    const tick = (now) => {
      if (!cv.isConnected) return;
      const t = now - t0;
      if (cv.width !== W() * dpr) size();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W(), H());
      const alpha = t < STOP ? 0.85 : Math.max(0, 0.85 * (1 - (t - STOP) / FADE));
      if (alpha <= 0) { ctx.clearRect(0, 0, W(), H()); return; }
      ctx.globalAlpha = alpha;
      ps.forEach((pt) => {
        pt.ph += 0.03; pt.x += pt.vx + Math.sin(pt.ph) * 0.35; pt.y += pt.vy; pt.r += pt.vr;
        if (pt.y > H() + 12 && t < STOP) Object.assign(pt, mk(-12));
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.r);
        ctx.scale(1, Math.cos(pt.ph * 2));
        ctx.fillStyle = pt.c;
        ctx.fillRect(-pt.w / 2, -pt.h / 2, pt.w, pt.h);
        ctx.restore();
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function mountConfetti(root) {
    (root || document).querySelectorAll('[data-confetti]').forEach(runConfetti);
  }

  // ── UPDATES ──
  function fmtPostDate(d) {
    // Parsed at noon so a date never slips a day across time zones.
    const dt = new Date(d + 'T12:00:00');
    return isNaN(dt) ? '' : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function postExcerpt(body) {
    const txt = body.join(' ');
    if (txt.length <= 240) return txt;
    const cut = txt.slice(0, 240);
    return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
  }

  // The Best of 2026 post leads with the badge over a blurred, dimmed loop.
  function postHero(u, clickable) {
    if (!u.hero && !u.heroVideo) return '';
    const inner = u.heroVideo
      ? '<video class="post-hero__video" src="' + esc(u.heroVideo) + '" autoplay muted loop playsinline></video>' +
        '<div class="post-hero__scrim"></div>' +
        '<canvas class="post-hero__confetti" data-confetti aria-hidden="true"></canvas>' +
        '<span class="post-hero__badge" data-inline-svg="' + esc(u.hero) + '"></span>'
      : '<img class="post-hero__img" src="' + esc(u.hero) + '" alt="">';
    const body = '<div class="post-hero">' + inner + '</div>';
    return clickable ? '<a href="/updates/' + esc(u.slug) + '/" class="post-hero__link">' + body + '</a>' : body;
  }

  function viewUpdates() {
    const posts = window.UPDATES || [];
    const items = posts.map((u) =>
      '<article class="post-card dashed-b">' +
        postHero(u, true) +
        '<h2><a class="ds-highlight-swipe" href="/updates/' + esc(u.slug) + '/">' + esc(u.title) + '</a></h2>' +
        '<p class="post-card__date">' + esc(fmtPostDate(u.date)) + '</p>' +
        '<p class="post-card__excerpt">' + esc(postExcerpt(u.body)) + '</p>' +
        '<a class="post-card__more csl-body-link" href="/updates/' + esc(u.slug) + '/">Read more &rarr;</a>' +
      '</article>'
    ).join('');
    return shell(
      '<div class="shell-md">' +
        '<header class="wizard-header dashed-b has-bg-hero">' + bgHero('updates') +
          '<h1 class="index-title">Updates</h1>' +
          '<p class="index-lede">Short notes on what is new in the library: new tools, changes to how it works, ' +
            'and announcements.</p>' +
        '</header>' +
        '<div class="post-list">' + items + '</div>' +
      '</div>'
    );
  }

  function viewUpdate(slug) {
    const posts = window.UPDATES || [];
    const u = posts.filter((x) => x.slug === slug)[0];
    if (!u) return viewUpdates();
    const paras = u.body.map((b) => '<p class="post-body">' + esc(b) + '</p>').join('');
    const more = posts.filter((x) => x.slug !== slug).slice(0, 3).map((x) =>
      '<a class="more-post ds-highlight-swipe" href="/updates/' + esc(x.slug) + '/">' +
        '<span class="more-post__title">' + esc(x.title) + '</span>' +
        '<span class="more-post__date">' + esc(fmtPostDate(x.date)) + '</span></a>'
    ).join('');
    return shell(
      '<div class="shell-md">' +
        '<div class="post-back">' + btn('/updates/', '&larr; All updates') + '</div>' +
        '<header class="post-header">' +
          '<h1 class="post-title">' + esc(u.title) + '</h1>' +
          '<p class="post-card__date">' + esc(fmtPostDate(u.date)) + '</p>' +
        '</header>' +
        postHero(u, false) +
        '<div class="post-prose">' + paras + '</div>' +
        (u.cta ? '<div class="post-cta"><a class="btn btn--lg btn--highlight" href="' + esc(u.cta.href) + '">' +
          esc(u.cta.label) + ' &rarr;</a></div>' : '') +
        (more ? '<section class="sec sec--last"><h2 class="section-label">More updates</h2>' +
          '<div class="more-posts">' + more + '</div></section>' : '') +
      '</div>'
    );
  }

  // ── BEST OF 2026 ──
  function viewAwards() {
    const row = (c) =>
      '<div class="award-row">' +
        '<div class="award-row__body"><h3>' + esc(c.name) + '</h3><p>' + esc(c.desc) + '</p></div>' +
        '<div class="award-row__tba"><span class="award-row__dot" aria-hidden="true"></span>Honoree to be announced</div>' +
      '</div>';
    const cats = (window.AWARD_CATEGORIES || []).map(row).join('');
    const infl = (window.AWARD_INFLUENCERS || []).map(row).join('');
    return shell(
      '<div class="awards">' +
        '<div class="awards__hero" aria-hidden="true">' +
          '<video src="/images/best-of-2026-hero.mp4" autoplay muted loop playsinline></video>' +
          '<div class="awards__scrim"></div>' +
          '<canvas class="awards__confetti" data-confetti aria-hidden="true"></canvas>' +
        '</div>' +
        '<div class="shell-md">' +
          '<header class="awards__header">' +
            '<div class="awards__headline">' +
              '<h1>Best of 2026</h1>' +
              '<p class="awards__lede">The resources, tools, and people that moved content strategy forward this year.</p>' +
              '<p class="awards__sub">Honorees are announced on this page. Each one receives a badge to display on ' +
                'their own site, linking back to the category they were recognized in.</p>' +
            '</div>' +
            '<span class="awards__badge" data-inline-svg="/images/best-of-2026-badge.svg" role="img" aria-label="Best of 2026 badge"></span>' +
          '</header>' +
          '<section class="awards__section"><h2>Content strategy in practice</h2>' + cats + '</section>' +
          '<section class="awards__section"><h2>Content strategy influencers</h2>' + infl + '</section>' +
          '<section class="awards__nominate nom-rev">' +
            '<h2>Make a nomination</h2>' +
            '<p>Know something or someone that belongs on this list? Tell us who and why.</p>' +
            '<button class="btn btn--lg btn--highlight" data-action="nom-open">Nominate someone</button>' +
          '</section>' +
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
        '<header class="wizard-header dashed-b has-bg-hero">' + bgHero('about') +
          '<div class="detail-badge-row"><span class="badge badge--highlight">About</span></div>' +
          '<h1 class="detail-title" style="font-size:var(--text-4xl);margin-bottom:var(--space-5)">About this library</h1>' +
          '<p class="about-lede">A free, practical reference for the tools and frameworks content strategists actually use.</p>' +
        '</header>' +
        '<section class="section" style="padding:var(--space-10) 0;border-bottom:1px dashed var(--border-strong)">' +
          '<h2 class="section-label" style="margin-bottom:var(--space-5)">What this is</h2>' +
          '<div class="prose-stack">' +
            '<p class="prose-lead">Content strategy has a real tools problem: the frameworks exist, but they live scattered across books, agency blogs, and paywalled courses. This library puts them in one place.</p>' +
            '<p class="prose-body">Whether you hold a formal content strategy title or you are a marketer, founder, UX designer, or product manager who has inherited responsibility for content, this reference is built for you. Each entry explains what the tool is, when to reach for it, and how it connects to the rest of the toolkit. Every tool links to a primary source or a working template so you can move from understanding to doing without delay. New here and not sure where to begin? The <a class="csl-body-link" href="/faq/">FAQ</a> answers the questions that come up most.</p>' +
          '</div>' +
        '</section>' +
        '<section style="padding:var(--space-10) 0 var(--space-24)">' +
          '<h2 class="section-label" style="margin-bottom:var(--space-5)">Who it is for</h2>' +
          '<div class="bullet-stack">' + bullets + '</div>' +
        '</section>' +
      '</div>'
    );
  }

  // ── CONTACT ── (mirrors the Submit a Tool form; same chrome + styling)
  // One page, three topics. The topic lives in the URL so each form is linkable.
  const CONTACT_TOPICS = [
    ['suggest-a-tool', "Suggest a tool"],
    ['nominate', "Nominate someone for Best of Content Strategy"],
    ['other', "Something else"]
  ];

  function contactTopicPicker(topic) {
    const opts = CONTACT_TOPICS.map(([k, label]) =>
      '<option value="' + k + '"' + (k === topic ? ' selected' : '') + '>' + esc(label) + '</option>'
    ).join('');
    return '<div class="contact-topic">' +
        '<label class="field-label" for="cf-topic">What is this about?</label>' +
        '<select class="input" id="cf-topic" data-action="contact-topic">' + opts + '</select>' +
      '</div>';
  }

  function viewContact() {
    const topic = state.contactTopic || 'suggest-a-tool';

    if (state.contactSent) {
      return shell(
        '<div class="shell-md"><div class="submit-success">' +
          '<div class="submit-success__check">&#10003;</div>' +
          '<h1>' + (topic === 'nominate' ? 'Nomination sent' : topic === 'suggest-a-tool' ? 'Suggestion sent' : 'Message sent') + '</h1>' +
          '<p>Thanks. It has been emailed to the maintainer, who will reply to the address you gave if a reply is needed.</p>' +
          '<button class="btn btn--md btn--secondary" data-action="contact-reset">Send another</button>' +
        '</div></div>'
      );
    }

    const f = state.contactForm;
    let fields = '';
    let cta = 'Send message';
    let ready = false;

    if (topic === 'suggest-a-tool') {
      cta = 'Suggest tool';
      ready = !!(f.toolName || '').trim() && !!(f.message || '').trim();
      fields =
        '<div><label class="field-label" for="cf-tool">Tool or framework name <span class="req">*</span></label>' +
          '<input class="input" id="cf-tool" data-cform="toolName" value="' + esc(f.toolName || '') + '" placeholder="e.g. Jobs-to-be-Done"></div>' +
        '<div><label class="field-label" for="cf-message">What is it, and why does it belong here? <span class="req">*</span></label>' +
          '<textarea class="input" id="cf-message" data-cform="message" rows="5" placeholder="A sentence or two, plus a link to a primary source if you have one.">' + esc(f.message || '') + '</textarea></div>' +
        '<div><label class="field-label" for="cf-link">Link <span class="opt">(optional)</span></label>' +
          '<input class="input" id="cf-link" data-cform="link" value="' + esc(f.link || '') + '" placeholder="https://"></div>' +
        '<div><label class="field-label" for="cf-email">Your email <span class="opt">(optional, so I can reply)</span></label>' +
          '<input class="input" id="cf-email" type="email" data-cform="email" value="' + esc(f.email || '') + '" placeholder="you@example.com"></div>';
    } else if (topic === 'nominate') {
      cta = 'Send nomination';
      ready = !!(f.nomName || '').trim() && (f.message || '').trim().length >= 20 && !!(f.email || '').trim();
      const kinds = ['A person', 'A company', 'A campaign', 'An influencer'];
      const chips = kinds.map((k) =>
        '<button type="button" class="chip' + ((f.nomKind || 'A person') === k ? ' is-active' : '') + '" ' +
          'data-action="contact-nom-kind" data-kind="' + esc(k) + '">' + esc(k) + '</button>'
      ).join('');
      fields =
        '<div><span class="field-label">What are you nominating?</span><div class="chip-row">' + chips + '</div></div>' +
        '<div><label class="field-label" for="cf-nom">Name <span class="req">*</span></label>' +
          '<input class="input" id="cf-nom" data-cform="nomName" value="' + esc(f.nomName || '') + '" placeholder="Who or what are you putting forward?"></div>' +
        '<div><label class="field-label" for="cf-link">Link <span class="opt">(optional)</span></label>' +
          '<input class="input" id="cf-link" data-cform="link" value="' + esc(f.link || '') + '" placeholder="https://"></div>' +
        '<div><label class="field-label" for="cf-message">Why them? <span class="req">*</span></label>' +
          '<textarea class="input" id="cf-message" data-cform="message" rows="5" placeholder="At least a sentence. What did they do, and why does it stand out?">' + esc(f.message || '') + '</textarea></div>' +
        '<div><label class="field-label" for="cf-email">Your email <span class="req">*</span></label>' +
          '<input class="input" id="cf-email" type="email" data-cform="email" value="' + esc(f.email || '') + '" placeholder="you@example.com"></div>' +
        '<div><label class="field-label" for="cf-name">Your name <span class="opt">(optional)</span></label>' +
          '<input class="input" id="cf-name" data-cform="name" value="' + esc(f.name || '') + '" placeholder="Your name"></div>';
    } else {
      ready = !!(f.email || '').trim() && !!(f.message || '').trim();
      fields =
        '<div><label class="field-label" for="cf-name">Your name <span class="opt">(optional)</span></label>' +
          '<input class="input" id="cf-name" data-cform="name" value="' + esc(f.name || '') + '" placeholder="Your name"></div>' +
        '<div><label class="field-label" for="cf-email">Your email <span class="req">*</span></label>' +
          '<input class="input" id="cf-email" type="email" data-cform="email" value="' + esc(f.email || '') + '" placeholder="you@example.com"></div>' +
        '<div><label class="field-label" for="cf-message">Message <span class="req">*</span></label>' +
          '<textarea class="input" id="cf-message" data-cform="message" rows="6" placeholder="How can I help?">' + esc(f.message || '') + '</textarea></div>';
    }

    const disabled = state.contactSending || !ready;
    return shell(
      '<div class="shell-md">' +
        '<header class="wizard-header dashed-b">' +
          '<div class="detail-badge-row"><span class="badge badge--default">Contact</span></div>' +
          '<h1 class="wizard-question">Contact</h1>' +
          '<p class="wizard-subtitle">Suggest a tool, nominate someone for Best of 2026, or ask anything else. ' +
            'Everything here goes straight to the maintainer.</p>' +
        '</header>' +
        '<div class="form-stack">' +
          contactTopicPicker(topic) +
          fields +
          '<div class="submit-foot">' +
            '<button class="btn btn--lg btn--highlight" data-action="contact-send"' + (disabled ? ' disabled' : '') + '>' +
              (state.contactSending ? 'Sending&hellip;' : esc(cta)) + '</button>' +
            (state.contactError
              ? '<p class="submit-error">' + esc(state.contactError) + '</p>'
              : '<p>Your message is emailed straight to the library maintainer. See the <a href="/privacy/" class="csl-body-link">privacy page</a> for details.</p>') +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ── PRIVACY ── (same chrome; mirrors the prerendered /privacy/ content)
  function viewPrivacy() {
    const sect = (label, inner) => '<section class="section" style="padding:var(--space-8) 0;border-bottom:1px dashed var(--border-strong)">' +
      '<h2 class="section-label" style="margin-bottom:var(--space-4)">' + label + '</h2>' + inner + '</section>';
    const p = (s) => '<p class="prose-body" style="margin-bottom:var(--space-3)">' + s + '</p>';
    const li = (s) => '<li style="margin:var(--space-2) 0;color:var(--text-secondary)">' + s + '</li>';
    return shell(
      '<div class="shell-md">' +
        '<header class="wizard-header dashed-b">' +
          '<div class="detail-badge-row"><span class="badge badge--highlight">Privacy</span></div>' +
          '<h1 class="detail-title" style="font-size:var(--text-4xl);margin-bottom:var(--space-5)">Privacy &amp; data</h1>' +
          '<p class="about-lede">This site is a free, unmonetized reference. There are no ads, and your data is never sold or shared. The only visitor data collected is anonymous usage analytics, and only if you consent.</p>' +
        '</header>' +
        sect('Who runs this site', p('The Content Strategy Library is run by Tommy Stubblefield. To exercise any of the rights below, or ask anything about your data, please use the <a class="csl-body-link" href="/contact/">contact form</a>, no email address is published here to keep spam down.')) +
        sect('What is collected, and when',
          p('If you click <strong>Accept</strong> on the cookie banner, the site uses <strong>Google Analytics 4</strong> to understand how the library is used. Until you accept, Google Analytics runs in a cookieless mode that sets <strong>no cookie</strong> and stores nothing on your device. If you click <strong>Reject</strong>, it stays that way permanently.') +
          p('When enabled, Google Analytics may process: pages you view, approximate location (country/region), your device and browser type, and the site that referred you. Google Analytics 4 <strong>does not store your full IP address</strong>. The site sets no advertising cookies and does no cross-site tracking.')) +
        sect('Legal basis', p('For visitors in the EU/UK and similar regions, the legal basis for analytics cookies is your <strong>consent</strong>, which you can withdraw at any time. Essential, first-party functionality, remembering your cookie choice and anything you save in the Workspace, is stored locally in your browser, is not tracking, and is never sent to us.')) +
        sect('Cookies used', '<ul>' + li('<strong>_ga, _ga_*</strong> (Google Analytics), distinguish anonymous visitors and sessions. Set only after you Accept; last up to ~13 months.') + li('<strong>Local storage</strong> (first-party, functional), your cookie choice and Workspace items. Never leaves your browser.') + '</ul>') +
        sect('Who your data is shared with', p('Analytics data is processed by <strong>Google</strong> as a data processor on our behalf. Google may process it in the United States under its standard data-transfer safeguards (the EU-US Data Privacy Framework and Standard Contractual Clauses). Data is retained according to the Google Analytics retention setting for this property.')) +
        sect('The forms on this site', p('If you use the <a class="csl-body-link" href="/contact/">contact form</a> or the Submit a Tool form, what you type (including any email you provide so we can reply) is sent to the site owner&rsquo;s inbox via <strong>Web3Forms</strong>, a form-delivery service. It is used only to respond to you and is not added to any marketing list.')) +
        sect('Your rights', p('You can request access to, correction of, or deletion of your data; object to or restrict processing; and withdraw consent at any time. You also have the right to complain to your local data protection authority. Use the <a class="csl-body-link" href="/contact/">contact form</a> to make a request.')) +
        sect('How to withdraw consent or opt out', '<ul>' + li('Use the <strong>Cookie preferences</strong> link in the footer of any page to change your choice.') + li('Clear cookies / site data in your browser settings.') + li('Install Google&rsquo;s <a class="csl-body-link" href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="nofollow noopener">Analytics opt-out browser add-on</a>.') + '</ul>') +
        '<section style="padding:var(--space-8) 0 var(--space-24)"><p class="prose-body" style="color:var(--text-muted)">Last updated ' + LAST_UPDATED + '.</p></section>' +
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
        '<header class="wizard-header dashed-b has-bg-hero">' + bgHero('faq') +
          '<div class="detail-badge-row"><span class="badge badge--highlight">FAQ</span></div>' +
          '<h1 class="wizard-question">Frequently asked questions</h1>' +
          '<p class="about-lede">Honest answers to the questions that come up most.</p>' +
        '</header>' +
        '<div class="faq-list">' + items + '</div>' +
      '</div>'
    );
  }

  // ── TERMINOLOGY ──
  // A glossary term that is itself a tool in the library, matched on name.
  function termTool(t) {
    const n = String(t.term || '').toLowerCase();
    return TOOLS.filter((x) => x.name.toLowerCase() === n ||
      x.name.replace(/s*([^)]*)/g, '').toLowerCase() === n)[0] || null;
  }

  // Search terms field, mirroring the tool search on the library index.
  function glossSearch() {
    const q = (state.glossQuery || '').trim();
    const terms = window.TERMINOLOGY || [];
    const lower = q.toLowerCase();
    const n = lower
      ? terms.filter((t) => [t.term, t.alt || ''].concat((t.defs || []).map((d) => d.text)).join(' ').toLowerCase().indexOf(lower) !== -1).length
      : 0;
    const count = q ? (n === 1 ? '1 term matches' : n + ' terms match') : '';
    const magnifier = '<svg class="tool-search__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>';
    return '<div class="tool-search">' +
        '<label for="gloss-search">Search terms</label>' +
        '<div class="tool-search__field">' + magnifier +
          '<input class="input" type="search" id="gloss-search" data-form="gloss-query" placeholder="Type to filter, e.g. taxonomy" value="' + esc(q) + '" autocomplete="off">' +
        '</div>' +
        '<span class="tool-search__count" aria-live="polite">' + esc(count) + '</span>' +
      '</div>';
  }

  // Glossary definitions link any tool they mention. Falls back to plain escaped
  // text if js/linkify.js has not loaded.
  function glossText(text) {
    if (!window.CSLLinkify) return esc(text);
    return window.CSLLinkify.linkify(text, TOOLS, esc, (t) => toolPath(t));
  }

  function viewTerminology() {
    const terms = window.TERMINOLOGY || [];
    const gq = (state.glossQuery || '').trim().toLowerCase();
    const all = terms.slice().sort((a, b) => a.term.localeCompare(b.term));
    // Search across the term, its alternate name and every definition body.
    const sorted = gq
      ? all.filter((t) => [t.term, t.alt || ''].concat((t.defs || []).map((d) => d.text)).join(' ').toLowerCase().indexOf(gq) !== -1)
      : all;
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
              '<p style="font-family:var(--font-sans);font-size:var(--text-xl);line-height:var(--leading-normal);color:var(--text-primary);margin:0">' + glossText(d.text) + '</p>' +
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
              (termTool(t) ? '<a class="csl-body-link" href="' + toolPath(termTool(t)) + '" style="font-family:var(--font-sans);font-size:var(--text-sm);font-weight:600">Tool: ' + esc(termTool(t).name) + ' &rarr;</a>' : '') +
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
        '<header style="padding:var(--space-16) 0 var(--space-8);border-bottom:1px dashed var(--border-strong);position:relative">' + bgHero('terminology') +
          '<div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-5)"><span class="badge badge--highlight">Terminology</span><span style="font-size:var(--text-sm);color:var(--text-muted)">' + terms.length + ' terms</span></div>' +
          '<h1 style="font-family:var(--font-sans);font-size:var(--text-5xl);font-weight:var(--weight-bold);line-height:var(--leading-tight);letter-spacing:var(--tracking-tight);margin:0 0 var(--space-5);color:var(--text-primary);max-width:14ch">The content strategy lexicon</h1>' +
          '<p style="font-size:var(--text-lg);line-height:var(--leading-normal);max-width:58ch;color:var(--text-secondary);margin:0">Plain-language definitions for the vocabulary content strategists work in every day, each one traced back to the sources that defined it.</p>' +
        '</header>' +
        glossSearch() +
        '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);padding:var(--space-6) 0;border-bottom:1px dashed var(--border-strong)">' + indexRow + '</div>' +
        (state.glossQuery.trim() && !sorted.length
          ? '<div class="tool-search__none"><p>No terms match &ldquo;' + esc(state.glossQuery.trim()) + '&rdquo;.</p>' +
              '<button class="btn btn--sm btn--secondary" data-action="gloss-search-clear">Clear search</button></div>'
          : '') +
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

      const custOpen = !!state.wsCustomizeOpen;
      brandSection =
        '<section style="padding:var(--space-10) 0 var(--space-12);border-bottom:1px dashed var(--border-strong)">' +
          '<button class="acc-row ws-cust__row" data-action="ws-toggle-customize" aria-expanded="' + custOpen + '">' +
            '<span><span class="ws-cust__title">Customize your strategy</span>' +
            '<span class="ws-cust__sub">Add a success statement, your name, an accent color, and a logo. ' +
            'Anything left blank uses the library defaults.</span></span>' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
              'stroke-linecap="round" aria-hidden="true"><path d="' + (custOpen ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6') + '"/></svg>' +
          '</button>' +
          (custOpen ? '<div class="ws-cust__body">' : '<div hidden>') +
          '<div style="margin-bottom:var(--space-8);max-width:760px">' +
            '<label class="field-label" for="wf-success">What does success look like?</label>' +
            '<p style="font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-muted);margin:0 0 var(--space-3);line-height:var(--leading-normal)">The outcome this set of tools is meant to drive. State it as a business result, not a content metric, this leads your exported cover.</p>' +
            '<textarea class="input" id="wf-success" data-form="brand-success" rows="3" placeholder="e.g. Shorten the sales cycle by giving prospects the content they need at each stage, measured by a 15% lift in pipeline velocity within two quarters.">' + esc(b.success || '') + '</textarea>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--space-5);margin-bottom:var(--space-6)">' +
            '<div><label class="field-label" for="wf-org">Company / agency / your name</label><input class="input" id="wf-org" data-form="brand-org" value="' + esc(b.org || '') + '" placeholder="e.g. Northwind Content Studio"></div>' +
            '<div><label class="field-label" for="wf-by">Prepared by <span class="opt">(optional)</span></label><input class="input" id="wf-by" data-form="brand-preparedBy" value="' + esc(b.preparedBy || '') + '" placeholder="Your name or role"></div>' +
            '<div><label class="field-label" for="wf-for">Prepared for <span class="opt">(optional)</span></label><input class="input" id="wf-for" data-form="brand-preparedFor" value="' + esc(b.preparedFor || '') + '" placeholder="Client or team name"></div>' +
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
            logoField() +
          '</div>' +
          webPanel('workspace', wsIds) +
        '</section>';

      exportSection =
        '<section style="padding:var(--space-10) 0 var(--space-12)">' +
          '<h2 style="font-family:var(--font-sans);font-size:var(--text-2xl);font-weight:var(--weight-bold);color:var(--text-primary);margin:0 0 var(--space-2);letter-spacing:var(--tracking-tight)">Export your approach</h2>' +
          '<p style="font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-muted);margin:0 0 var(--space-5);max-width:60ch">Each export opens with your branded cover, then one section per tool with its summary and when-to-use guidance, plus links back to the Content Strategy Library.</p>' +
          '<div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap">' +
            '<button class="btn btn--md btn--highlight" data-action="ws-export-pdf">Download PDF</button>' +
            '<button class="btn btn--md btn--secondary" data-action="ws-export-pptx">Download PowerPoint</button>' +
            '<button class="btn btn--md btn--secondary" data-action="web-toggle" data-which="workspace">Web version</button>' +
            '<button class="btn btn--md btn--ghost" data-action="ws-export-both">PDF + PowerPoint</button>' +
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
    // A shared plan lives entirely in the fragment, so it outranks the path.
    const planMatch = (location.hash || '').match(/^#plan=(.+)$/);
    if (planMatch) return { view: 'plan', payload: planMatch[1] };
    const path = (location.pathname || '/').replace(/\/+$/, '') || '/';
    if (path === '/') return { view: 'index' };
    const parts = path.split('/').filter(Boolean); // e.g. ['tools','content-brief']
    if (parts[0] === 'tools' && parts[1]) {
      const t = BY_SLUG[parts[1]];
      return t ? { view: 'detail', id: t.id } : { view: 'index' };
    }
    if (parts[0] === 'categories' && parts[1]) return { view: 'index', filter: parts[1] };
    if (parts[0] === 'recommend') return { view: 'recommend' };
    // Submit a Tool folded into Contact; the old URL now redirects.
    if (parts[0] === 'submit') return { view: 'contact', topic: 'suggest-a-tool', redirect: '/contact/suggest-a-tool/' };
    if (parts[0] === 'updates') {
      const post = parts[1] ? (window.UPDATES || []).filter((u) => u.slug === parts[1])[0] : null;
      if (parts[1] && !post) return { view: 'updates' };
      return post ? { view: 'update', slug: post.slug } : { view: 'updates' };
    }
    if (parts[0] === 'best-of-2026') return { view: 'awards' };
    if (parts[0] === 'about') return { view: 'about' };
    if (parts[0] === 'faq') return { view: 'faq' };
    if (parts[0] === 'terminology') return { view: 'terminology' };
    if (parts[0] === 'workspace') return { view: 'workspace' };
    if (parts[0] === 'privacy') return { view: 'privacy' };
    if (parts[0] === 'contact') {
      const TOPICS = ['suggest-a-tool', 'nominate', 'other'];
      const topic = TOPICS.indexOf(parts[1]) !== -1 ? parts[1] : 'suggest-a-tool';
      return { view: 'contact', topic: topic };
    }
    return { view: 'index' };
  }

  function render(scrollTop) {
    const route = parseRoute();
    // Category deep-links (/categories/<key>/) render the index filtered to that category.
    if (route.view === 'index' && route.filter && CAT_KEYS.has(route.filter)) {
      state.activeFilter = route.filter;
    }
    // /submit/ is gone; put the real URL in the bar without adding history.
    if (route.redirect && location.pathname !== route.redirect) {
      history.replaceState(null, '', route.redirect);
    }
    if (route.view === 'contact') state.contactTopic = route.topic || 'suggest-a-tool';
    const app = document.getElementById('app');
    let html;
    switch (route.view) {
      case 'detail':     html = viewDetail(route.id); break;
      case 'recommend':  html = viewRecommend(); break;
      case 'submit':     html = viewSubmit(); break;
      case 'plan':       html = viewPlan(decodePlan(route.payload)); break;
      case 'updates':    html = viewUpdates(); break;
      case 'update':     html = viewUpdate(route.slug); break;
      case 'awards':     html = viewAwards(); break;
      case 'about':      html = viewAbout(); break;
      case 'faq':        html = viewFaq(); break;
      case 'terminology': html = viewTerminology(); break;
      case 'workspace':  html = viewWorkspace(); break;
      case 'privacy':    html = viewPrivacy(); break;
      case 'contact':    html = viewContact(); break;
      default:           html = viewIndex();
    }
    app.innerHTML = html;
    document.title = pageTitle(route);
    setNoindex(route.view === 'plan');
    // Hydration: drop the prerendered static shell once the app has painted the
    // matching route, so crawlers keep the server HTML but users see no duplicate.
    const pre = document.getElementById('prerender');
    if (pre) pre.remove();
    // Wire up any hero video this route just painted (no-op when there is none).
    openDeepLink(route);
    mountNewFlags(app);
    inlineSvgs(app);
    mountConfetti(app);
    if (scrollTop) {
      window.scrollTo(0, 0);
      // Real navigation (not an in-view update): move focus to the new content and
      // announce the page to screen readers, so keyboard/SR users aren't left behind.
      const main = document.getElementById('maincontent');
      if (main) { try { main.focus({ preventScroll: true }); } catch (e) { main.focus(); } }
      const status = document.getElementById('sr-status');
      if (status) status.textContent = document.title;
    }
  }

  function pageTitle(route) {
    if (route.view === 'detail' && BY_ID[route.id]) return BY_ID[route.id].name + ' · Content Strategy Library';
    if (route.view === 'update') {
      const u = (window.UPDATES || []).filter((x) => x.slug === route.slug)[0];
      if (u) return u.title + ' · Content Strategy Library';
    }
    if (route.view === 'plan') return 'Content Strategy Approach \u00b7 Content Strategy Library';
    const map = { plan: 'Content Strategy Approach', updates: 'Updates', awards: 'Best of 2026', recommend: 'Tool Recommender', submit: 'Submit a Tool', about: 'About', faq: 'FAQ', terminology: 'Terminology', workspace: 'Workspace', privacy: 'Privacy & data', contact: 'Contact' };
    return (map[route.view] ? map[route.view] + ' · ' : '') + 'Content Strategy Library';
  }

  // NEW flags hold at opacity 0 until their card is properly on screen, then
  // fade in. The per-card stagger is already baked into --nf-delay by toolCard.
  function mountNewFlags(root) {
    const flags = (root || document).querySelectorAll('.new-flag:not(.is-in)');
    if (!flags.length) return;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      flags.forEach((f) => f.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    flags.forEach((f) => io.observe(f));
  }

  // ── Hero drift ──
  // The bg-hero images are near-pinned: they scroll at 0.975x so the header
  // artwork drifts a touch slower than the page instead of sitting dead still.
  // One passive listener, rAF-throttled, feeding a single custom property.
  (function heroDrift() {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      document.documentElement.style.setProperty('--hero-anchor', '0px');
      return;
    }
    let ticking = false;
    function apply() {
      ticking = false;
      document.documentElement.style.setProperty('--hero-anchor', (window.scrollY * 0.975) + 'px');
    }
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    }, { passive: true });
    apply();
  })();

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
    } else if (action === 'web-toggle') {
      const which = el.getAttribute('data-which');
      state.webPanel = state.webPanel === which ? '' : which;
      state.planCopied = false;
      render(false);
    } else if (action === 'plan-select') {
      try { el.select(); } catch (err) { /* ignore */ }
    } else if (action === 'plan-copy') {
      copyToClipboard(el.getAttribute('data-url') || '');
      state.planCopied = true;
      render(false);
      setTimeout(() => { state.planCopied = false; render(false); }, 2000);
    } else if (action === 'plan-print') {
      window.print();
    } else if (action === 'plan-adopt') {
      adoptPlan();
    } else if (action === 'credits-open') {
      openModal({ kind: 'credits' }, el);
    } else if (action === 'credits-go') {
      // Each row navigates to where that image is used, closing the dialog.
      const go = el.getAttribute('data-go');
      closeModal();
      if (go === 'top') window.scrollTo({ top: 0, behavior: 'auto' });
      else navTo(go);
    } else if (action === 'notify-open') {
      openModal({ kind: 'notify', app: el.getAttribute('data-app') }, el);
    } else if (action === 'nom-open') {
      openModal({ kind: 'nominate' }, el);
    } else if (action === 'modal-close') {
      closeModal();
    } else if (action === 'modal-backdrop') {
      // Only a click on the backdrop itself closes; clicks inside the dialog
      // bubble up to here but carry the dialog in their path.
      if (!e.target.closest('[data-modal-stop]')) closeModal();
    } else if (action === 'nom-kind') {
      state.nomForm.kind = el.getAttribute('data-kind');
      render(false);
    } else if (action === 'nom-again') {
      // Keep who they are, clear what they said.
      const keep = { email: state.nomForm.email, you: state.nomForm.you };
      state.nomForm = { kind: 'A person', name: '', category: '', link: '', why: '', email: keep.email, you: keep.you, news: false };
      state.modalSent = false;
      state.modalTried = false;
      state.modalError = '';
      render(false);
    } else if (action === 'notify-send') {
      sendNotify();
    } else if (action === 'nom-send') {
      sendNomination();
    } else if (action === 'panel-toggle') {
      const k = el.getAttribute('data-panel');
      state.panels = Object.assign({}, state.panels, { [k]: !state.panels[k] });
      render(false);
    } else if (action === 'toc-open') {
      const k = el.getAttribute('data-panel');
      state.panels = Object.assign({}, state.panels, { [k]: true });
      render(false);
      scrollToSection(k);
    } else if (action === 'cite-fmt') {
      state.citeFmt = el.getAttribute('data-fmt');
      render(false);
    } else if (action === 'copy-anchor') {
      const secId = el.getAttribute('data-id');
      const route = parseRoute();
      const tool = route.view === 'detail' ? BY_ID[route.id] : null;
      if (tool) {
        try { history.replaceState(null, '', '#' + secId); } catch (e) { /* older browsers */ }
        copyToClipboard((window.CSLToolDetail ? window.CSLToolDetail.toolUrl(tool) : location.href) + '#' + secId);
        flash('copiedAnchor', secId);
      }
    } else if (action === 'copy-text') {
      copyToClipboard(el.getAttribute('data-value') || '');
      flash('copiedText', el.getAttribute('data-key'));
    } else if (action === 'tool-search-clear') {
      state.toolQuery = '';
      render(false);
      const input = document.getElementById('tool-search');
      if (input) input.focus();
    } else if (action === 'gloss-search-clear') {
      state.glossQuery = '';
      render(false);
      const input = document.getElementById('gloss-search');
      if (input) input.focus();
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
    } else if (action === 'contact-send') {
      handleContact();
    } else if (action === 'contact-nom-kind') {
      state.contactForm.nomKind = el.getAttribute('data-kind');
      render(false);
    } else if (action === 'contact-reset') {
      state.contactSent = false;
      state.contactError = '';
      state.contactSending = false;
      state.contactForm = { name: '', email: '', message: '' };
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
    } else if (action === 'rec-export-pdf') {
      wsExportPDF(computeResults().map((t) => t.id));
    } else if (action === 'rec-export-pptx') {
      wsExportPPTX(computeResults().map((t) => t.id));
    } else if (action === 'ws-toggle-customize') {
      state.wsCustomizeOpen = !state.wsCustomizeOpen;
      render(false);
    } else if (action === 'ws-logo-clear') {
      state.wsLogo = null;
      state.wsLogoAttested = false;
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

  // contact form field tracking (no re-render, to preserve focus)
  // File picker and attestation are change events, not input events.
  // Focusing the shared link selects it, so one keystroke copies it.
  document.addEventListener('focusin', (e) => {
    const f = e.target.closest('[data-action="plan-select"]');
    if (f) { try { f.select(); } catch (err) { /* ignore */ } }
  });

  document.addEventListener('change', (e) => {
    const topicSel = e.target.closest('[data-action="contact-topic"]');
    if (topicSel) {
      // The topic is part of the URL, so switching it is a navigation.
      navTo('/contact/' + topicSel.value + '/');
      return;
    }
    const pick = e.target.closest('[data-action="ws-logo-pick"]');
    if (pick) {
      const f = pick.files && pick.files[0];
      if (!f) return;
      if (f.size > 2 * 1024 * 1024) { alert('That logo is larger than 2 MB. Please use a smaller file.'); pick.value = ''; return; }
      const reader = new FileReader();
      reader.onload = () => {
        state.wsLogo = { dataUrl: String(reader.result), name: f.name };
        state.wsLogoAttested = false;
        render(false);
      };
      reader.readAsDataURL(f);
      return;
    }
    const att = e.target.closest('[data-action="ws-logo-attest"]');
    if (att) {
      state.wsLogoAttested = !!att.checked;
      render(false);
    }
  });

  document.addEventListener('input', (e) => {
    // Search fields re-render the list but must keep the caret where it was, so
    // they restore focus and selection after the view is rebuilt.
    const sel = e.target.closest('[data-form="tool-query"], [data-form="gloss-query"]');
    if (sel) {
      const which = sel.getAttribute('data-form') === 'tool-query' ? 'toolQuery' : 'glossQuery';
      const id = sel.id;
      const pos = sel.selectionStart;
      state[which] = sel.value;
      render(false);
      const next = document.getElementById(id);
      if (next) {
        next.focus();
        try { next.setSelectionRange(pos, pos); } catch (err) { /* type=search in some browsers */ }
      }
      return;
    }
    const nf = e.target.closest('[data-nform]');
    if (nf) {
      const k = nf.getAttribute('data-nform');
      state.notifyForm[k] = nf.type === 'checkbox' ? nf.checked : nf.value;
      if (state.modalTried) render(false);
      return;
    }
    const mf = e.target.closest('[data-mform]');
    if (mf) {
      const k = mf.getAttribute('data-mform');
      state.nomForm[k] = mf.type === 'checkbox' ? mf.checked : mf.value;
      if (state.modalTried) render(false);
      return;
    }
    const cel = e.target.closest('[data-cform]');
    if (cel) {
      state.contactForm[cel.getAttribute('data-cform')] = cel.value;
      const f = state.contactForm;
      const topic = state.contactTopic || 'suggest-a-tool';
      const ready = topic === 'suggest-a-tool'
        ? (f.toolName || '').trim() && (f.message || '').trim()
        : topic === 'nominate'
          ? (f.nomName || '').trim() && (f.message || '').trim().length >= 20 && (f.email || '').trim()
          : (f.email || '').trim() && (f.message || '').trim();
      const btn = document.querySelector('[data-action="contact-send"]');
      if (btn) btn.disabled = !ready;
      return;
    }
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
      from_name: 'Content Strategy Library, Submit a Tool',
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
        state.submitError = 'Could not send, check your connection and try again.';
        render(false);
      });
  }

  // Both dialogs post to Web3Forms, like every other form on the site.
  function postForm(payload, onDone) {
    state.modalSending = true;
    state.modalError = '';
    render(false);
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((r) => r.json())
      .then((data) => {
        state.modalSending = false;
        if (data && data.success) { state.modalSent = true; onDone && onDone(); }
        else state.modalError = (data && data.message) || 'Something went wrong. Please try again.';
        render(false);
      })
      .catch(() => {
        state.modalSending = false;
        state.modalError = 'Could not send, check your connection and try again.';
        render(false);
      });
  }

  // Copying a shared plan overwrites whatever is already collected, so ask
  // first when there is something to lose.
  function adoptPlan() {
    const plan = decodePlan((location.hash || '').replace(/^#plan=/, ''));
    if (!plan) return;
    if (state.wsTools.length) {
      const ok = window.confirm('This will replace the ' + state.wsTools.length + ' tool' +
        (state.wsTools.length === 1 ? '' : 's') + ' already in your Workspace. Continue?');
      if (!ok) return;
    }
    state.wsTools = plan.tools.slice();
    state.brand = Object.assign({}, state.brand, {
      org: plan.org, preparedBy: plan.preparedBy, preparedFor: plan.preparedFor,
      success: plan.success, accent: plan.accent
    });
    persistWS();
    state.wsCustomizeOpen = true;
    try { history.replaceState(null, '', '/workspace/'); } catch (e) { location.hash = ''; }
    render(true);
  }

  function sendNotify() {
    const f = state.notifyForm;
    state.modalTried = true;
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim());
    const okConsent = f.wantTemplates || f.wantNews;
    if (!okEmail || !okConsent || state.modalSending) { render(false); return; }
    postForm({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: 'Content Strategy Library, template notify signup',
      from_name: 'Content Strategy Library, Notify',
      App: (state.modal && state.modal.app) || 'Notion/Miro',
      email: f.email,
      name: ((f.first || '') + ' ' + (f.last || '')).trim() || '(not given)',
      'Wants templates': f.wantTemplates ? 'yes' : 'no',
      'Wants library news': f.wantNews ? 'yes' : 'no',
      message: 'Notify signup for the ' + ((state.modal && state.modal.app) || '') + ' template.',
      botcheck: ''
    });
  }

  function sendNomination() {
    const f = state.nomForm;
    state.modalTried = true;
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim());
    if (!f.name.trim() || f.why.trim().length < 20 || !okEmail || state.modalSending) { render(false); return; }
    postForm({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: 'Content Strategy Library, Best of 2026 nomination',
      from_name: 'Content Strategy Library, Nominations',
      Nominating: f.kind,
      Nominee: f.name,
      Category: f.category || 'Not sure',
      Link: f.link || '(none)',
      message: f.why,
      email: f.email,
      name: f.you || '(not given)',
      'Wants announcement email': f.news ? 'yes' : 'no',
      botcheck: ''
    });
  }

  function handleContact() {
    if (state.contactSending) return;
    const f = state.contactForm;
    const topic = state.contactTopic || 'suggest-a-tool';

    // Each topic has its own required set, matching what the form shows.
    const ready = topic === 'suggest-a-tool'
      ? (f.toolName || '').trim() && (f.message || '').trim()
      : topic === 'nominate'
        ? (f.nomName || '').trim() && (f.message || '').trim().length >= 20 && (f.email || '').trim()
        : (f.email || '').trim() && (f.message || '').trim();
    if (!ready) return;

    const SUBJECT = {
      'suggest-a-tool': 'Content Strategy Library, tool suggestion',
      nominate: 'Content Strategy Library, Best of 2026 nomination',
      other: 'Content Strategy Library, contact message'
    };
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: SUBJECT[topic],
      from_name: 'Content Strategy Library, Contact',
      Topic: topic,
      name: f.name || '(not given)',
      email: f.email || '(not given)',
      message: f.message,
      botcheck: '' // Web3Forms honeypot
    };
    if (topic === 'suggest-a-tool') {
      payload['Tool name'] = f.toolName;
      payload.Link = f.link || '(none)';
    } else if (topic === 'nominate') {
      payload.Nominating = f.nomKind || 'A person';
      payload.Nominee = f.nomName;
      payload.Link = f.link || '(none)';
    }

    state.contactSending = true;
    state.contactError = '';
    render(false);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((r) => r.json())
      .then((data) => {
        state.contactSending = false;
        if (data && data.success) {
          state.contactSent = true;
          render(true);
        } else {
          state.contactError = (data && data.message) || 'Something went wrong. Please try again.';
          render(false);
        }
      })
      .catch(() => {
        state.contactSending = false;
        state.contactError = 'Could not send, check your connection and try again.';
        render(false);
      });
  }

  // Esc closes any open dialog, before the tool arrows get a look in.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.modal) {
      e.preventDefault();
      closeModal();
    }
  });

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
    if (href === '/contact/') { state.contactSent = false; state.contactError = ''; state.contactSending = false; }
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
