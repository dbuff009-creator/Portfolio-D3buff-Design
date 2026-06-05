(function () {
  var LANG_KEY = 'd3buff-gt-lang';
  var DEFAULT_LANG = 'ru';
  var LANGUAGES = [
    { code: 'ru', flag: '%F0%9F%87%B7%F0%9F%87%BA' },
    { code: 'en', flag: '%F0%9F%87%AC%F0%9F%87%A7' },
    { code: 'uk', flag: '%F0%9F%87%BA%F0%9F%87%A6' },
    { code: 'de', flag: '%F0%9F%87%A9%F0%9F%87%AA' },
    { code: 'fr', flag: '%F0%9F%87%AB%F0%9F%87%B7' },
    { code: 'es', flag: '%F0%9F%87%AA%F0%9F%87%B8' },
    { code: 'pl', flag: '%F0%9F%87%B5%F0%9F%87%B1' },
    { code: 'tr', flag: '%F0%9F%87%B9%F0%9F%87%B7' },
    { code: 'zh-CN', flag: '%F0%9F%87%A8%F0%9F%87%B3' },
    { code: 'ja', flag: '%F0%9F%87%AF%F0%9F%87%B5' }
  ];

  var root = document.documentElement;
  var langWrap = document.getElementById('langWrap');
  var langTrigger = document.getElementById('langTrigger');
  var langTriggerFlag = document.getElementById('langTriggerFlag');
  var langTriggerText = document.getElementById('langTriggerText');
  var langMenu = document.getElementById('langMenu');
  var menuOpen = false;

  function flagUrl(code) {
    var lang = LANGUAGES.find(function (l) { return l.code === code; });
    if (!lang) return '';
    return 'https://emojicdn.elk.sh/' + lang.flag + '?style=apple';
  }

  function intlLocale(code) {
    if (code === 'zh-CN') return 'zh-Hans';
    return code;
  }

  function langLabel(code, uiLocale) {
    try {
      var uiName = new Intl.DisplayNames([intlLocale(uiLocale)], { type: 'language' }).of(code);
      var nativeName = new Intl.DisplayNames([intlLocale(code)], { type: 'language' }).of(code);
      if (uiName) uiName = uiName.charAt(0).toUpperCase() + uiName.slice(1);
      if (nativeName) nativeName = nativeName.toLowerCase();
      return (uiName || code) + ' (' + (nativeName || code) + ')';
    } catch (e) {
      return code;
    }
  }

  function isPageTranslated() {
    return document.body.classList.contains('translated-ltr')
      || document.body.classList.contains('translated-rtl')
      || root.classList.contains('translated-ltr');
  }

  function langFromCookie() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
    if (!m || !m[1]) return null;
    var parts = decodeURIComponent(m[1]).split('/');
    var lang = parts[2];
    if (lang && LANGUAGES.some(function (l) { return l.code === lang; })) return lang;
    return null;
  }

  function getPageLang() {
    if (!isPageTranslated()) return DEFAULT_LANG;
    var combo = document.querySelector('.goog-te-combo');
    if (combo && combo.value && LANGUAGES.some(function (l) { return l.code === combo.value; })) {
      return combo.value;
    }
    return langFromCookie() || DEFAULT_LANG;
  }

  function rememberLang(lang) {
    try { sessionStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  function clearGtCookie() {
    var exp = 'Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'googtrans=;expires=' + exp + ';path=/';
    var host = location.hostname;
    if (host) {
      document.cookie = 'googtrans=;expires=' + exp + ';path=/;domain=' + host;
      document.cookie = 'googtrans=;expires=' + exp + ';path=/;domain=.' + host;
    }
  }

  function setGtCookie(lang) {
    var val = '/ru/' + lang;
    document.cookie = 'googtrans=' + val + ';path=/';
    var host = location.hostname;
    if (host) {
      document.cookie = 'googtrans=' + val + ';path=/;domain=' + host;
    }
  }

  function setLoading(on) {
    if (langWrap) langWrap.classList.toggle('is-loading', on);
  }

  function buildMenu(uiLocale, selected) {
    if (!langMenu) return;
    langMenu.innerHTML = '';
    LANGUAGES.forEach(function (lang, i) {
      var li = document.createElement('li');
      li.className = 'lang-item' + (lang.code === selected ? ' active' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('data-lang', lang.code);
      li.style.animationDelay = (i * 0.035) + 's';

      var img = document.createElement('img');
      img.className = 'lang-flag';
      img.src = flagUrl(lang.code);
      img.alt = '';
      img.width = 18;
      img.height = 18;
      img.draggable = false;

      var span = document.createElement('span');
      span.textContent = langLabel(lang.code, uiLocale);

      li.appendChild(img);
      li.appendChild(span);
      li.addEventListener('click', function (e) {
        e.stopPropagation();
        closeMenu();
        switchLang(lang.code);
      });
      langMenu.appendChild(li);
    });
  }

  function updateUI(lang) {
    var ui = lang === DEFAULT_LANG ? DEFAULT_LANG : lang;
    if (langTriggerFlag) {
      langTriggerFlag.src = flagUrl(lang);
      langTriggerFlag.classList.remove('flag-pop');
      void langTriggerFlag.offsetWidth;
      langTriggerFlag.classList.add('flag-pop');
    }
    if (langTriggerText) langTriggerText.textContent = langLabel(lang, ui);
    buildMenu(ui, lang);
    root.lang = lang === 'zh-CN' ? 'zh' : lang;
  }

  function openMenu() {
    if (!langMenu || !langTrigger || menuOpen) return;
    menuOpen = true;
    var pageLang = getPageLang();
    buildMenu(pageLang === DEFAULT_LANG ? DEFAULT_LANG : pageLang, pageLang);
    langMenu.classList.add('visible');
    langTrigger.setAttribute('aria-expanded', 'true');
    langWrap.classList.add('open');
  }

  function closeMenu() {
    if (!langMenu || !langTrigger || !menuOpen) return;
    menuOpen = false;
    langMenu.classList.remove('visible');
    langTrigger.setAttribute('aria-expanded', 'false');
    langWrap.classList.remove('open');
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

  function resetToRussian() {
    clearGtCookie();
    rememberLang(DEFAULT_LANG);
    setLoading(true);
    closeMenu();

    var combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = '';
      fireEvent(combo, 'change');
      fireEvent(combo, 'change');
    }

    setTimeout(function () {
      if (isPageTranslated()) {
        location.reload();
        return;
      }
      setLoading(false);
      updateUI(DEFAULT_LANG);
    }, 500);
  }

  function applyViaCombo(lang) {
    setLoading(true);
    var attempts = 0;

    function tick() {
      var combo = document.querySelector('.goog-te-combo');
      if (combo && combo.options.length > 1) {
        combo.value = lang;
        fireEvent(combo, 'change');
        fireEvent(combo, 'change');
        setTimeout(function () {
          setLoading(false);
          updateUI(lang);
        }, 450);
        return;
      }
      if (++attempts < 50) {
        setTimeout(tick, 120);
        return;
      }
      location.reload();
    }

    tick();
  }

  function switchLang(lang) {
    if (!lang) return;
    var pageLang = getPageLang();

    if (lang === DEFAULT_LANG) {
      if (!isPageTranslated() && pageLang === DEFAULT_LANG) {
        updateUI(DEFAULT_LANG);
        rememberLang(DEFAULT_LANG);
        return;
      }
      resetToRussian();
      return;
    }

    if (lang === pageLang) return;

    setGtCookie(lang);
    rememberLang(lang);
    applyViaCombo(lang);
  }

  if (langTrigger) {
    langTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (menuOpen) closeMenu();
      else openMenu();
    });
  }

  document.addEventListener('click', closeMenu);
  if (langWrap) {
    langWrap.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  document.querySelectorAll('.logo, .contact-card__value, .notranslate').forEach(function (el) {
    el.classList.add('notranslate');
  });

  updateUI(getPageLang());

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
