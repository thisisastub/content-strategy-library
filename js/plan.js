/* ============================================================
   Content Strategy Library, shareable plan links
   ------------------------------------------------------------
   A plan is encoded into the URL fragment, never a query string, so
   it is never sent to the server. Logos are deliberately excluded:
   they can be someone else's mark and they are never persisted.

   Shape: { t:[toolIds], o:org, by:preparedBy, fr:preparedFor,
            s:success, a:accentHex } -> JSON -> UTF-8 -> base64url
   ============================================================ */

(function (root) {
  'use strict';

  var HEX = /^#[0-9a-fA-F]{6}$/;

  // btoa only handles Latin-1, so UTF-8 encode first. encodeURIComponent +
  // unescape is the portable way to do that without TextEncoder.
  function toBase64Url(str) {
    var b64 = root.btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function fromBase64Url(s) {
    var b64 = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return decodeURIComponent(escape(root.atob(b64)));
  }

  function encode(plan) {
    var payload = {
      t: (plan.tools || []).slice(),
      o: plan.org || '',
      by: plan.preparedBy || '',
      fr: plan.preparedFor || '',
      s: plan.success || '',
      a: HEX.test(plan.accent || '') ? plan.accent : '#F7C531'
    };
    return toBase64Url(JSON.stringify(payload));
  }

  // Returns null for anything we cannot trust. `knownIds` filters out tools
  // that have since been renamed or removed, rather than rendering blanks.
  function decode(payload, knownIds) {
    if (!payload) return null;
    var obj;
    try { obj = JSON.parse(fromBase64Url(payload)); } catch (e) { return null; }
    if (!obj || typeof obj !== 'object' || !Array.isArray(obj.t)) return null;
    var ids = obj.t.filter(function (id) {
      return typeof id === 'string' && (!knownIds || knownIds.indexOf(id) !== -1);
    });
    if (!ids.length) return null;
    var str = function (v) { return typeof v === 'string' ? v : ''; };
    return {
      tools: ids,
      org: str(obj.o),
      preparedBy: str(obj.by),
      preparedFor: str(obj.fr),
      success: str(obj.s),
      accent: HEX.test(str(obj.a)) ? obj.a : '#F7C531'
    };
  }

  function url(plan, origin) {
    return (origin || 'https://contentstrategylibrary.com') + '/#plan=' + encode(plan);
  }

  root.CSLPlan = { encode: encode, decode: decode, url: url };
})(typeof window !== 'undefined' ? window : this);
