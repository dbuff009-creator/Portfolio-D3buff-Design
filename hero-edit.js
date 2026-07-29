/**
 * Режим расстановки hero: index.html?edit=1
 * Таск / стрелки — позиция (Shift = крупнее шаг)
 * Колёсико — размер, [ ] — слой
 * Чипы в панели — выбрать элемент, если перекрыт
 */
(function () {
  var params = new URLSearchParams(location.search);
  if (params.get('edit') !== '1') return;

  var hero = document.getElementById('hero');
  if (!hero) return;

  document.body.classList.add('hero-edit-on');
  hero.classList.add('hero-edit');

  var ITEMS = [
    { key: 'sky', sel: '.hero__sky-wrap', label: 'небо', resize: 'width', z: 1 },
    { key: 'year', sel: '.hero__year', label: '2026.', resize: 'font', z: 2 },
    { key: 'folio', sel: '.hero__folio-label', label: '.ПОРТФОЛИО', resize: 'font', z: 2 },
    { key: 'ferret', sel: '.hero__ferret', label: 'хорёк', resize: 'width', z: 6 },
    { key: 'name', sel: '.hero__name-wrap', label: 'Артём', resize: 'font', z: 7 },
    { key: 'tri', sel: '.hero__tri-wrap', label: 'треугольник', resize: 'width', z: 3 },
    { key: 'handle', sel: '.hero__handle', label: 'D3BUFF', resize: 'font', z: 1 },
    { key: 'cta', sel: '.hero__cta', label: 'смотреть работы', resize: 'cta-font', z: 1 },
    { key: 'role', sel: '.hero__role', label: 'Graphic Designer', resize: 'font', z: 6 },
    { key: 'marquee', sel: '.hero__marquee', label: 'бегущая строка', resize: 'marquee-h', sizeOnly: true, layerable: true, z: 5 },
    { key: 'marqueeText', sel: '.hero__marquee-track', label: 'текст строки', resize: 'marquee-font', sizeOnly: true }
  ];

  var STORAGE = 'd3buff-hero-edit-v10';
  var PANEL_KEY = 'd3buff-hero-edit-panel';
  var selected = null;
  var NUDGE = 0.1;
  var NUDGE_SHIFT = 1;

  try {
    [
      'd3buff-hero-edit',
      'd3buff-hero-edit-v2',
      'd3buff-hero-edit-v3',
      'd3buff-hero-edit-v4',
      'd3buff-hero-edit-v5',
      'd3buff-hero-edit-v6',
      'd3buff-hero-edit-v7',
      'd3buff-hero-edit-v8',
      'd3buff-hero-edit-v9'
    ].forEach(function (k) { localStorage.removeItem(k); });
  } catch (e) {}

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function snap(n) {
    return round1(n);
  }

  function findEl(item) {
    var marked = hero.querySelector('[data-edit-key="' + item.key + '"]');
    if (marked) return marked;
    return hero.querySelector(item.sel);
  }

  function getBox() {
    return hero.getBoundingClientRect();
  }

  function applyPos(el, xPct, yPct) {
    el.style.position = 'absolute';
    el.style.left = snap(xPct) + '%';
    el.style.top = snap(yPct) + '%';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    el.style.margin = '0';
    el.style.transform = 'none';
  }

  function applyZ(el, z) {
    el.style.zIndex = String(z);
    el.dataset.hz = String(z);
  }

  function applyCtaFont(el, sizePx) {
    var arrow = el.querySelector('.hero__cta-arrow');
    var label = el.querySelector('.hero__cta-label');
    if (label) label.style.fontSize = sizePx + 'px';
    if (arrow) arrow.style.fontSize = round1(sizePx * 1.35) + 'px';
  }

  function readCtaSize(el) {
    var label = el.querySelector('.hero__cta-label');
    if (label) return round1(parseFloat(getComputedStyle(label).fontSize) || 16);
    return round1(parseFloat(getComputedStyle(el).fontSize) || 16);
  }

  function readPos(el, item) {
    var cs = getComputedStyle(el);
    if (item && item.sizeOnly) {
      return {
        hPx: round1(el.getBoundingClientRect().height),
        size: round1(parseFloat(cs.fontSize) || 16),
        z: parseInt(el.style.zIndex || cs.zIndex, 10) || 1
      };
    }
    var box = getBox();
    var r = el.getBoundingClientRect();
    var size = item && item.resize === 'cta-font'
      ? readCtaSize(el)
      : round1(parseFloat(cs.fontSize) || 16);
    return {
      x: snap(((r.left - box.left) / box.width) * 100),
      y: snap(((r.top - box.top) / box.height) * 100),
      w: snap((r.width / box.width) * 100),
      h: snap((r.height / box.height) * 100),
      size: size,
      z: parseInt(el.style.zIndex || cs.zIndex, 10) || 1
    };
  }

  function getItem(el) {
    var key = el && el.getAttribute('data-edit-key');
    return ITEMS.find(function (i) { return i.key === key; }) || null;
  }

  function layerTarget(el, item) {
    if (item && item.key === 'marqueeText') {
      return findEl(ITEMS.find(function (i) { return i.key === 'marquee'; }));
    }
    return el;
  }

  function snapshot() {
    var data = {};
    ITEMS.forEach(function (item) {
      var el = findEl(item);
      if (!el) return;
      data[item.key] = readPos(el, item);
    });
    try { localStorage.setItem(STORAGE, JSON.stringify(data)); } catch (e) {}
    renderPanel(data);
    return data;
  }

  function restore() {
    var raw;
    try { raw = localStorage.getItem(STORAGE); } catch (e) { return; }
    if (!raw) return;
    var data;
    try { data = JSON.parse(raw); } catch (e) { return; }
    ITEMS.forEach(function (item) {
      var el = findEl(item);
      var p = data[item.key];
      if (!el || !p) return;

      if (item.sizeOnly) {
        if (item.resize === 'marquee-h' && p.hPx) el.style.height = p.hPx + 'px';
        if (item.resize === 'marquee-font' && p.size) el.style.fontSize = p.size + 'px';
        if (item.layerable && typeof p.z === 'number') applyZ(el, p.z);
        return;
      }

      applyPos(el, p.x, p.y);
      if (typeof p.z === 'number') applyZ(el, p.z);
      if (item.resize === 'width' && p.w) el.style.width = p.w + '%';
      if (item.resize === 'font' && p.size) el.style.fontSize = p.size + 'px';
      if (item.resize === 'cta-font' && p.size) applyCtaFont(el, p.size);
    });
  }

  function formatExport(data) {
    var lines = ['HERO COORDS (desktop):'];
    ITEMS.forEach(function (item) {
      var p = data[item.key];
      if (!p) return;
      var line = item.label + ':';
      if (item.sizeOnly) {
        if (item.resize === 'marquee-h') line += ' h=' + p.hPx + 'px';
        if (item.resize === 'marquee-font') line += ' size=' + p.size + 'px';
        if (item.layerable) line += ' z=' + p.z;
      } else {
        line += ' x=' + p.x + '% y=' + p.y + '% z=' + p.z;
        if (item.resize === 'width') line += ' w=' + p.w + '%';
        if (item.resize === 'font' || item.resize === 'cta-font') line += ' size=' + p.size + 'px';
      }
      lines.push(line);
    });
    return lines.join('\n');
  }

  function clearSelected() {
    document.querySelectorAll('.hero-edit__item.is-selected').forEach(function (n) {
      n.classList.remove('is-selected');
    });
    document.querySelectorAll('.hero-edit-panel__pick.is-active').forEach(function (n) {
      n.classList.remove('is-active');
    });
  }

  function setSelected(el) {
    clearSelected();
    selected = el || null;
    if (!selected) {
      updateLayerHint();
      return;
    }
    selected.classList.add('is-selected');
    var item = getItem(selected);
    if (item) {
      var chip = panel.querySelector('.hero-edit-panel__pick[data-key="' + item.key + '"]');
      if (chip) chip.classList.add('is-active');
    }
    updateLayerHint();
  }

  function selectByKey(key) {
    var item = ITEMS.find(function (i) { return i.key === key; });
    if (!item) return;
    var el = findEl(item);
    if (!el) return;
    setSelected(el);
  }

  function bumpLayer(dir) {
    if (!selected) return;
    var item = getItem(selected);
    var target = layerTarget(selected, item);
    if (!target) return;
    var tItem = getItem(target) || item;
    if (tItem && tItem.sizeOnly && !tItem.layerable) return;
    var z = parseInt(target.style.zIndex || getComputedStyle(target).zIndex, 10);
    if (isNaN(z)) z = 1;
    z = Math.max(0, Math.min(50, z + dir));
    applyZ(target, z);
    if (target !== selected) setSelected(target);
    snapshot();
  }

  function nudgeSelected(dx, dy) {
    if (!selected) return;
    var item = getItem(selected);
    if (!item || item.sizeOnly) return;
    var p = readPos(selected, item);
    applyPos(selected, p.x + dx, p.y + dy);
    snapshot();
  }

  var panel = document.createElement('div');
  panel.className = 'hero-edit-panel notranslate';
  panel.innerHTML =
    '<div class="hero-edit-panel__head">' +
    '<div class="hero-edit-panel__title">Режим расстановки</div>' +
    '<button type="button" class="hero-edit-panel__toggle" id="heroEditToggle" aria-label="Свернуть">−</button>' +
    '</div>' +
    '<div class="hero-edit-panel__body" id="heroEditBody">' +
    '<p class="hero-edit-panel__hint">' +
    'Таскай / <b>←↑↓→</b> = позиция (Shift = 1%) · Колёсико = размер · <b>[</b>/<b>]</b> = слой<br>' +
    'Чипы ниже — выбрать элемент, если перекрыт. Бегущая строка: h + слой.' +
    '</p>' +
    '<div class="hero-edit-panel__picks" id="heroEditPicks"></div>' +
    '<div class="hero-edit-layer" id="heroEditLayer">Кликни элемент → слой: —</div>' +
    '<pre class="hero-edit-panel__out" id="heroEditOut"></pre>' +
    '<div class="hero-edit-panel__btns">' +
    '<button type="button" id="heroEditCopy">Скопировать</button>' +
    '<button type="button" id="heroEditZDown" class="is-ghost">Слой −</button>' +
    '<button type="button" id="heroEditZUp" class="is-ghost">Слой +</button>' +
    '<button type="button" id="heroEditReset" class="is-ghost">Сброс</button>' +
    '<a href="index.html" class="hero-edit-exit">Выйти</a>' +
    '</div>' +
    '</div>';
  document.body.appendChild(panel);

  var picksEl = document.getElementById('heroEditPicks');
  ITEMS.forEach(function (item) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'hero-edit-panel__pick';
    b.dataset.key = item.key;
    b.textContent = item.label;
    b.addEventListener('click', function () {
      selectByKey(item.key);
    });
    picksEl.appendChild(b);
  });

  var outEl = document.getElementById('heroEditOut');
  var layerEl = document.getElementById('heroEditLayer');
  var toggleBtn = document.getElementById('heroEditToggle');

  function setPanelCollapsed(collapsed) {
    panel.classList.toggle('is-collapsed', collapsed);
    toggleBtn.textContent = collapsed ? '+' : '−';
    toggleBtn.setAttribute('aria-label', collapsed ? 'Развернуть' : 'Свернуть');
    try { localStorage.setItem(PANEL_KEY, collapsed ? '1' : '0'); } catch (e) {}
  }

  try {
    if (localStorage.getItem(PANEL_KEY) === '1') setPanelCollapsed(true);
  } catch (e) {}

  toggleBtn.addEventListener('click', function () {
    setPanelCollapsed(!panel.classList.contains('is-collapsed'));
  });

  function updateLayerHint() {
    if (!selected) {
      layerEl.textContent = 'Кликни элемент / чип → слой: —';
      return;
    }
    var item = getItem(selected);
    if (item && item.sizeOnly) {
      var p = readPos(selected, item);
      if (item.resize === 'marquee-h' || item.layerable) {
        layerEl.textContent = item.label + ' → h=' + p.hPx + 'px · z=' + p.z + ' (колёсико / [ ])';
      } else {
        layerEl.textContent = item.label + ' → size ' + p.size + 'px (колёсико)';
      }
      return;
    }
    var z = parseInt(selected.style.zIndex || getComputedStyle(selected).zIndex, 10) || 1;
    var p2 = item ? readPos(selected, item) : null;
    layerEl.textContent = (item ? item.label : '?') +
      ' → x=' + (p2 ? p2.x : '?') + '% y=' + (p2 ? p2.y : '?') +
      '% · z=' + z + '  (стрелки / [ ])';
  }

  function renderPanel(data) {
    outEl.textContent = formatExport(data || snapshot());
    updateLayerHint();
  }

  document.getElementById('heroEditCopy').addEventListener('click', function () {
    var text = formatExport(snapshot());
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        var btn = document.getElementById('heroEditCopy');
        btn.textContent = 'Скопировано ✓';
        setTimeout(function () { btn.textContent = 'Скопировать'; }, 1200);
      });
    } else {
      alert(text);
    }
  });

  document.getElementById('heroEditZDown').addEventListener('click', function () { bumpLayer(-1); });
  document.getElementById('heroEditZUp').addEventListener('click', function () { bumpLayer(1); });

  document.getElementById('heroEditReset').addEventListener('click', function () {
    try { localStorage.removeItem(STORAGE); } catch (e) {}
    location.href = 'index.html?edit=1&_=' + Date.now();
  });

  document.addEventListener('keydown', function (e) {
    if (e.target && /input|textarea/i.test(e.target.tagName)) return;
    if (!selected) return;

    if (e.key === '[') { e.preventDefault(); bumpLayer(-1); return; }
    if (e.key === ']') { e.preventDefault(); bumpLayer(1); return; }

    var step = e.shiftKey ? NUDGE_SHIFT : NUDGE;
    if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSelected(-step, 0); }
    if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSelected(step, 0); }
    if (e.key === 'ArrowUp') { e.preventDefault(); nudgeSelected(0, -step); }
    if (e.key === 'ArrowDown') { e.preventDefault(); nudgeSelected(0, step); }
  });

  hero.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.hero__cta');
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
  }, true);

  requestAnimationFrame(function () {
    var track = hero.querySelector('.hero__marquee-track');
    if (track) track.style.animation = 'none';

    var initial = {};
    ITEMS.forEach(function (item) {
      var el = findEl(item);
      if (!el) return;
      initial[item.key] = readPos(el, item);
    });

    ITEMS.forEach(function (item) {
      var el = findEl(item);
      if (!el) return;
      var p = initial[item.key];

      // запасной wrap только если в разметке ещё сырой <img>
      if (!item.sizeOnly && el.tagName === 'IMG') {
        var wrap = document.createElement('div');
        wrap.className = 'hero-edit__img-wrap';
        wrap.style.width = p.w + '%';
        wrap.style.lineHeight = '0';
        hero.appendChild(wrap);
        wrap.appendChild(el);
        el.style.width = '100%';
        el.style.height = 'auto';
        el.style.display = 'block';
        el.style.pointerEvents = 'none';
        el = wrap;
      }

      el.classList.add('hero-edit__item');
      if (item.sizeOnly) el.classList.add('hero-edit__item--size-only');
      el.style.pointerEvents = 'auto';
      el.setAttribute('data-edit-key', item.key);

      if (!item.sizeOnly) {
        if (el.parentNode !== hero) hero.appendChild(el);
        applyPos(el, p.x, p.y);
        applyZ(el, typeof p.z === 'number' ? p.z : item.z);
        if (item.resize === 'font') el.style.fontSize = p.size + 'px';
        if (item.resize === 'cta-font') applyCtaFont(el, p.size);
        if (item.resize === 'width') el.style.width = p.w + '%';
        if (item.key === 'cta') {
          el.setAttribute('href', '#');
          el.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
          });
        }
      } else if (item.resize === 'marquee-h') {
        el.style.height = round1(el.getBoundingClientRect().height) + 'px';
        applyZ(el, typeof p.z === 'number' ? p.z : (item.z || 5));
        // чтобы кликалась поверх Graphic Designer
        el.style.pointerEvents = 'auto';
      } else if (item.resize === 'marquee-font') {
        el.style.fontSize = round1(parseFloat(getComputedStyle(el).fontSize) || 16) + 'px';
        el.style.pointerEvents = 'none';
      }

      var tag = document.createElement('span');
      tag.className = 'hero-edit__tag';
      tag.textContent = item.label + (item.sizeOnly && !item.layerable ? ' (размер)' : item.sizeOnly ? ' (h / z)' : '');
      el.appendChild(tag);

      var drag = null;

      el.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        setSelected(el);
        if (item.sizeOnly) return;
        var box = getBox();
        var r = el.getBoundingClientRect();
        drag = {
          ox: e.clientX - r.left,
          oy: e.clientY - r.top,
          box: box
        };
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
      });

      el.addEventListener('pointermove', function (e) {
        if (!drag || item.sizeOnly) return;
        var x = ((e.clientX - drag.ox - drag.box.left) / drag.box.width) * 100;
        var y = ((e.clientY - drag.oy - drag.box.top) / drag.box.height) * 100;
        x = Math.max(-20, Math.min(110, x));
        y = Math.max(-20, Math.min(110, y));
        applyPos(el, snap(x), snap(y));
        snapshot();
      });

      el.addEventListener('pointerup', function () {
        drag = null;
        el.classList.remove('is-dragging');
        snapshot();
      });

      el.addEventListener('wheel', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setSelected(el);
        var step = e.deltaY > 0 ? -1 : 1;
        var mult = e.shiftKey ? 4 : 1;
        var box = getBox();

        if (item.resize === 'marquee-h') {
          var hPx = el.getBoundingClientRect().height + step * 2 * mult;
          hPx = Math.max(24, Math.min(200, hPx));
          el.style.height = round1(hPx) + 'px';
        } else if (item.resize === 'marquee-font') {
          var fs = parseFloat(getComputedStyle(el).fontSize) || 16;
          fs += step * 1 * mult;
          fs = Math.max(10, Math.min(80, fs));
          el.style.fontSize = round1(fs) + 'px';
        } else if (item.resize === 'width') {
          var r = el.getBoundingClientRect();
          var w = (r.width / box.width) * 100;
          w += step * 2 * mult;
          w = Math.max(5, Math.min(120, w));
          el.style.width = snap(w) + '%';
        } else if (item.resize === 'cta-font') {
          var curCta = readCtaSize(el);
          var nextCta = curCta + step * 2 * mult;
          nextCta = Math.max(8, Math.min(120, nextCta));
          applyCtaFont(el, round1(nextCta));
        } else {
          var cur = parseFloat(getComputedStyle(el).fontSize) || 16;
          var next = cur + step * (item.key === 'year' || item.key === 'folio' ? 1 : 3) * mult;
          next = Math.max(8, Math.min(400, next));
          el.style.fontSize = round1(next) + 'px';
        }
        snapshot();
      }, { passive: false });
    });

    restore();
    snapshot();
  });
})();
