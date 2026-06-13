// ==================== SIMBA LANGUAGE DROPDOWN ====================
// Auto-converts .lang-grp, .nav-lang, .lang-bar, .lang-toggle into a dropdown.
// Works with or without i18n.js — falls back to page reload if i18n unavailable.

(function () {
  var LANGS = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'fr', label: 'FR', full: 'Français' },
    { code: 'rw', label: 'RW', full: 'Kinyarwanda' },
  ];

  function getCur() {
    return localStorage.getItem('simba_lang') || 'en';
  }

  function doSetLang(code) {
    localStorage.setItem('simba_lang', code);
    if (window.i18n && typeof window.i18n.set === 'function') {
      window.i18n.set(code);
      document.querySelectorAll('.ld-opt').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.ldCode === code);
      });
      document.querySelectorAll('.ld-btn-label').forEach(function (el) {
        var lang = LANGS.find(function (l) { return l.code === code; }) || LANGS[0];
        el.textContent = lang.label;
      });
    } else {
      window.location.reload();
    }
  }

  function injectStyles() {
    if (document.getElementById('ld-css')) return;
    var s = document.createElement('style');
    s.id = 'ld-css';
    s.textContent =
      '.ld-wrap{position:relative;display:inline-flex;align-items:center;}' +
      '.ld-btn{display:flex;align-items:center;gap:5px;background:none;' +
        'border:1.5px solid rgba(0,0,0,0.13);border-radius:20px;' +
        'padding:5px 11px;font-family:"DM Sans",sans-serif;' +
        'font-size:12px;font-weight:600;color:var(--gray,#6b6560);' +
        'cursor:pointer;transition:all 0.2s;white-space:nowrap;line-height:1;}' +
      '.ld-btn:hover{border-color:var(--orange,#E8620A);color:var(--orange,#E8620A);}' +
      '.ld-chev{transition:transform 0.22s;flex-shrink:0;opacity:0.55;}' +
      '.ld-chev.rotated{transform:rotate(180deg);}' +
      '.ld-menu{display:none;position:absolute;top:calc(100% + 7px);right:0;' +
        'background:var(--white,#fffcf8);border:1px solid rgba(0,0,0,0.09);' +
        'border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,0.13);' +
        'min-width:140px;overflow:hidden;z-index:9999;}' +
      '.ld-menu.open{display:block;}' +
      '.ld-opt{display:flex;align-items:center;gap:9px;width:100%;' +
        'padding:9px 14px;background:none;border:none;' +
        'font-family:"DM Sans",sans-serif;font-size:13px;font-weight:500;' +
        'color:var(--black,#0e0c0a);cursor:pointer;text-align:left;' +
        'transition:background 0.15s;}' +
      '.ld-opt:hover{background:rgba(232,98,10,0.07);}' +
      '.ld-opt.active{color:var(--orange,#E8620A);font-weight:700;background:rgba(232,98,10,0.05);}' +
      '.ld-code{font-size:11px;font-weight:700;color:inherit;opacity:0.6;min-width:22px;}';
    document.head.appendChild(s);
  }

  var _uid = 0;
  function buildDropdown(container) {
    var cur = getCur();
    var curLang = LANGS.find(function (l) { return l.code === cur; }) || LANGS[0];
    var id = 'ld' + (++_uid);
    var menuId = id + 'M';
    var chevId = id + 'C';

    var optionsHtml = LANGS.map(function (l) {
      return '<button class="ld-opt' + (l.code === cur ? ' active' : '') + '" ' +
        'data-ld-code="' + l.code + '" ' +
        'onclick="(function(){' +
          'document.querySelectorAll(\'.ld-menu.open\').forEach(function(x){x.classList.remove(\'open\');});' +
          'document.querySelectorAll(\'.ld-chev.rotated\').forEach(function(x){x.classList.remove(\'rotated\');});' +
          'window._ldSet(\'' + l.code + '\');' +
        '})()">' +
        '<span class="ld-code">' + l.label + '</span>' + l.full +
        '</button>';
    }).join('');

    container.innerHTML =
      '<div class="ld-wrap">' +
        '<button class="ld-btn" onclick="(function(e){' +
          'e.stopPropagation();' +
          'var m=document.getElementById(\'' + menuId + '\');' +
          'var c=document.getElementById(\'' + chevId + '\');' +
          'var was=m.classList.contains(\'open\');' +
          'document.querySelectorAll(\'.ld-menu.open\').forEach(function(x){x.classList.remove(\'open\');});' +
          'document.querySelectorAll(\'.ld-chev.rotated\').forEach(function(x){x.classList.remove(\'rotated\');});' +
          'if(!was){m.classList.add(\'open\');c.classList.add(\'rotated\');}' +
        '})(event)">' +
          '<span class="ld-btn-label">' + curLang.label + '</span>' +
          '<svg id="' + chevId + '" class="ld-chev" width="10" height="7" viewBox="0 0 10 7" fill="none">' +
            '<path d="M1 1.5l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>' +
        '</button>' +
        '<div class="ld-menu" id="' + menuId + '">' + optionsHtml + '</div>' +
      '</div>';
  }

  function init() {
    injectStyles();
    var sel = '.lang-grp, .nav-lang, .lang-bar, .lang-toggle, [data-lang-switcher]';
    document.querySelectorAll(sel).forEach(buildDropdown);

    document.addEventListener('click', function () {
      document.querySelectorAll('.ld-menu.open').forEach(function (m) { m.classList.remove('open'); });
      document.querySelectorAll('.ld-chev.rotated').forEach(function (c) { c.classList.remove('rotated'); });
    });
  }

  // Expose globals
  window._ldSet = doSetLang;
  window.langSwitchTo = doSetLang;
  window.setLang = window.setLang || doSetLang;
  window.langSwitcher = function (containerId) {
    var el = document.getElementById(containerId);
    if (el) buildDropdown(el);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
