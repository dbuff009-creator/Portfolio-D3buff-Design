(function () {
  var LANG_KEY = 'd3buff-gt-lang';
  var DEFAULT_LANG = 'ru';
  var TOGGLE_LANGS = ['ru', 'en'];

  var root = document.documentElement;
  var langWrap = document.getElementById('langWrap');
  var switching = false;

  function isPageTranslated() {
    return document.body.classList.contains('translated-ltr')
      || document.body.classList.contains('translated-rtl')
      || root.classList.contains('translated-ltr')
      || root.classList.contains('translated-rtl');
  }

  function langFromCookie() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
    if (!m || !m[1]) return null;
    var parts = decodeURIComponent(m[1]).split('/');
    var lang = parts[2];
    if (!lang || lang === DEFAULT_LANG) return null;
    if (TOGGLE_LANGS.indexOf(lang) !== -1) return lang;
    return null;
  }

  function getPageLang() {
    var fromCookie = langFromCookie();
    if (fromCookie) return fromCookie;

    if (isPageTranslated()) {
      var combo = document.querySelector('.goog-te-combo');
      if (combo && combo.value && TOGGLE_LANGS.indexOf(combo.value) !== -1) {
        return combo.value;
      }
      return 'en';
    }

    try {
      var saved = sessionStorage.getItem(LANG_KEY);
      if (saved && saved !== DEFAULT_LANG && TOGGLE_LANGS.indexOf(saved) !== -1) {
        return saved;
      }
    } catch (e) {}

    return DEFAULT_LANG;
  }

  function rememberLang(lang) {
    try {
      if (lang === DEFAULT_LANG) sessionStorage.removeItem(LANG_KEY);
      else sessionStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
  }

  function clearGtCookie() {
    var exp = 'Thu, 01 Jan 1970 00:00:01 GMT';
    var paths = ['/', location.pathname, location.pathname.replace(/\/[^/]*$/, '/') || '/'];
    var hosts = [''];
    if (location.hostname) {
      hosts.push(location.hostname, '.' + location.hostname);
    }

    paths.forEach(function (p) {
      hosts.forEach(function (h) {
        var base = 'googtrans=;expires=' + exp + ';path=' + p;
        document.cookie = base;
        if (h) document.cookie = base + ';domain=' + h;
      });
    });
  }

  function setGtCookie(lang) {
    clearGtCookie();
    if (lang === DEFAULT_LANG) return;
    var val = '/ru/' + lang;
    document.cookie = 'googtrans=' + val + ';path=/';
    if (location.hostname) {
      document.cookie = 'googtrans=' + val + ';path=/;domain=' + location.hostname;
    }
  }

  function setLoading(on) {
    if (langWrap) langWrap.classList.toggle('is-loading', on);
  }

  function syncLangThumb(instant) {
    if (!langWrap) return;
    var thumb = langWrap.querySelector('.lang-toggle__thumb');
    var active = langWrap.querySelector('.lang-toggle__opt.is-active');
    if (!thumb || !active) return;

    var parentRect = langWrap.getBoundingClientRect();
    var btnRect = active.getBoundingClientRect();
    var left = Math.round(btnRect.left - parentRect.left);
    var width = Math.round(btnRect.width);

    if (instant) {
      thumb.style.transition = 'none';
    }
    thumb.style.width = width + 'px';
    thumb.style.transform = 'translateX(' + left + 'px)';
    if (instant) {
      void thumb.offsetWidth;
      thumb.style.transition = '';
    }
  }

  function updateUI(lang, instant) {
    var active = lang === DEFAULT_LANG ? DEFAULT_LANG : 'en';
    if (!langWrap) return;
    langWrap.querySelectorAll('.lang-toggle__opt').forEach(function (btn) {
      var on = btn.getAttribute('data-lang') === active;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    root.lang = active;
    requestAnimationFrame(function () {
      syncLangThumb(!!instant);
    });
  }

  function fireEvent(el, name) {
    try {
      el.dispatchEvent(new Event(name, { bubbles: true }));
    } catch (e) {
      var evt = document.createEvent('HTMLEvents');
      evt.initEvent(name, true, true);
      el.dispatchEvent(evt);
    }
  }

  function resetComboToOriginal() {
    var combo = document.querySelector('.goog-te-combo');
    if (!combo || !combo.options.length) return false;
    try {
      var i;
      for (i = 0; i < combo.options.length; i++) {
        if (combo.options[i].value === '') {
          combo.selectedIndex = i;
          break;
        }
      }
      if (combo.value !== '') {
        combo.selectedIndex = 0;
        combo.value = '';
      }
      fireEvent(combo, 'change');
      fireEvent(combo, 'change');
      return true;
    } catch (e) {
      return false;
    }
  }

  function clickShowOriginal() {
    var frames = document.querySelectorAll('.goog-te-banner-frame, iframe.skiptranslate');
    for (var i = 0; i < frames.length; i++) {
      try {
        var doc = frames[i].contentDocument || frames[i].contentWindow.document;
        if (!doc) continue;
        var restore = doc.getElementById(':1.restore')
          || doc.querySelector('[id$=".restore"]');
        if (restore) {
          restore.click();
          return true;
        }
      } catch (e) { /* cross-origin */ }
    }
    return false;
  }

  function resetToRussian() {
    if (switching) return;
    switching = true;
    updateUI(DEFAULT_LANG, false);
    setLoading(true);

    clearGtCookie();
    rememberLang(DEFAULT_LANG);

    if (location.hash && /googtrans/i.test(location.hash)) {
      history.replaceState(null, '', location.pathname + location.search);
    }

    try {
      clickShowOriginal();
      resetComboToOriginal();
    } catch (e) {}

    setTimeout(function () {
      clearGtCookie();
      rememberLang(DEFAULT_LANG);
      location.reload();
    }, 340);
  }

  function applyViaCombo(lang) {
    if (switching) return;
    switching = true;
    updateUI(lang, false);
    setLoading(true);
    var attempts = 0;

    function tick() {
      var combo = document.querySelector('.goog-te-combo');
      if (combo && combo.options.length > 1) {
        combo.value = lang;
        fireEvent(combo, 'change');
        fireEvent(combo, 'change');
        setTimeout(function () {
          switching = false;
          setLoading(false);
          updateUI(lang, true);
        }, 450);
        return;
      }
      if (++attempts < 50) {
        setTimeout(tick, 120);
        return;
      }
      switching = false;
      setLoading(false);
      updateUI(lang, true);
    }

    tick();
  }

  function switchLang(lang) {
    if (!lang || switching) return;
    if (TOGGLE_LANGS.indexOf(lang) === -1) return;
    var pageLang = getPageLang();

    if (lang === pageLang || (lang === 'en' && pageLang === 'en' && isPageTranslated())) {
      updateUI(lang, false);
      return;
    }

    if (lang === DEFAULT_LANG) {
      if (!isPageTranslated() && !langFromCookie() && pageLang === DEFAULT_LANG) {
        updateUI(DEFAULT_LANG, false);
        rememberLang(DEFAULT_LANG);
        return;
      }
      resetToRussian();
      return;
    }

    setGtCookie(lang);
    rememberLang(lang);
    applyViaCombo(lang);
  }

  if (langWrap) {
    langWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.lang-toggle__opt');
      if (!btn || !langWrap.contains(btn)) return;
      e.preventDefault();
      if (btn.classList.contains('is-active') || switching) return;
      switchLang(btn.getAttribute('data-lang'));
    });
  }

  document.querySelectorAll('.logo, .contact-card__value, .notranslate').forEach(function (el) {
    el.classList.add('notranslate');
  });

  updateUI(getPageLang(), true);
  window.addEventListener('resize', function () { syncLangThumb(true); });

  setTimeout(function () {
    try {
      var saved = sessionStorage.getItem(LANG_KEY);
      if (saved && saved !== DEFAULT_LANG && !isPageTranslated()) {
        setGtCookie(saved);
        applyViaCombo(saved);
      }
    } catch (e) {}
  }, 900);
})();
