// ╔══════════════════════════════════════════════════╗
// ║  Работы из data/works.json — update-works.bat ║
// ╚══════════════════════════════════════════════════╝

const FOLDER = 'images/works/';
/** Сколько отдельных картинок (не из папок) показывать на главной */
const MAIN_SINGLES_LIMIT = 11;

function withFolder(path) {
  return path.startsWith(FOLDER) ? path : FOLDER + path;
}

function normalizeWorksData(data) {
  if (data.singles && data.groups) {
    return {
      singles: data.singles.map(s => ({
        src: withFolder(s.src),
        title: s.title || s.src.split('/').pop(),
      })),
      groups: data.groups.map(g => ({
        ...g,
        items: g.items.map(i => ({
          src: withFolder(i.src),
          title: i.title || i.src.split('/').pop(),
          description: g.description || '',
        })),
      })),
    };
  }

  const singles = [];
  const groupMap = new Map();
  for (const w of data.works || []) {
    const src = w.src;
    const parts = src.split('/');
    if (parts.length === 1) {
      singles.push({ src: withFolder(src), title: w.title || parts[0] });
    } else {
      const folder = parts[0];
      if (!groupMap.has(folder)) {
        const lower = folder.toLowerCase();
        groupMap.set(folder, {
          folder,
          title: lower === 'avatarka' ? 'Аватарка' : folder,
          layout: lower === 'avatarka' ? 'avatarka' : /wb/i.test(folder) ? 'wb' : 'project',
          tag: /wb/i.test(folder) ? 'wb' : undefined,
          items: [],
        });
      }
      groupMap.get(folder).items.push({
        src: withFolder(src),
        title: w.title || parts[parts.length - 1],
      });
    }
  }
  return { singles, groups: [...groupMap.values()] };
}

async function loadWorks() {
  let raw = window.WORKS_DATA;
  if (!raw) {
    try {
      const res = await fetch('data/works.json?' + Date.now());
      if (!res.ok) throw new Error('data/works.json not found');
      raw = await res.json();
    } catch (e) {
      console.warn('Работы не загрузились. Запусти update-works.bat', e);
      return { singles: [], groups: [] };
    }
  }
  return normalizeWorksData(raw);
}

function hasArchivePage({ singles, groups }) {
  return singles.length > MAIN_SINGLES_LIMIT || groups.length > 0;
}

// ═══════════════════════════════════════════════════════
// ТЕМА
// ═══════════════════════════════════════════════════════

const themeBtn = document.getElementById('themeToggle');

// ТЕМА
function updateThemeIcon(theme, animate) {
  if (!themeBtn) return;
  const icon = themeBtn.querySelector('.theme-icon');
  if (!icon) return;

  const next = theme === 'dark'
    ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    : '<path d="M12 3V4M12 20V21M4 12H3M6.31412 6.31412L5.5 5.5M17.6859 6.31412L18.5 5.5M6.31412 17.69L5.5 18.5M17.6859 17.69L18.5 18.5M21 12H20M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

  if (!animate) {
    icon.innerHTML = next;
    icon.classList.remove('is-swapping');
    return;
  }

  icon.classList.add('is-swapping');
  window.setTimeout(function () {
    icon.innerHTML = next;
    icon.classList.remove('is-swapping');
  }, 150);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme, true);
}

if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved, false);
}

initTheme();

// ═══════════════════════════════════════════════════════
// ОСТАЛЬНОЙ КОД САЙТА
// ═══════════════════════════════════════════════════════

const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

const cursorImg = document.getElementById('cursor-img');
const interactiveSelector = 'a, button, .btn, .skill-row__stars, input, [onclick], img';

if (!isTouchDevice && cursorImg) document.addEventListener('mouseover', (e) => {
  if (e.target.closest(interactiveSelector)) {
    cursorImg.src = 'images/Pointer.png';
    cursor.style.transform = 'translate(-50%, -50%) scale(0.9)';
  } else {
    cursorImg.src = 'images/Cursor.png';
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  }
});

if (!isTouchDevice && cursorImg) {
  document.addEventListener('mouseleave', () => {
    cursorImg.src = 'images/Cursor.png';
  });
}

const cursor = document.getElementById('custom-cursor');
const blurElement = document.getElementById('blurElement');

if (!isTouchDevice && cursor && blurElement) {
  let lastX = 0, lastY = 0, speedX = 0, speedY = 0;

  window.addEventListener('mousemove', (e) => {
    speedX = Math.abs(e.clientX - lastX);
    speedY = Math.abs(e.clientY - lastY);
    cursor.style.left = e.clientX + 5 + 'px';
    cursor.style.top = e.clientY + 15 + 'px';
    const blurValue = `${speedX * 0.3} ${speedY * 0.3}`;
    blurElement.setAttribute('stdDeviation', blurValue);
    lastX = e.clientX;
    lastY = e.clientY;
  });

  function relax() {
    speedX *= 0.9;
    speedY *= 0.9;
    const blurValue = `${speedX * 0.1} ${speedY * 0.1}`;
    blurElement.setAttribute('stdDeviation', blurValue);
    requestAnimationFrame(relax);
  }
  relax();
}

function initMobileNav() {
  const burger = document.getElementById('navBurger');
  const nav = document.getElementById('siteNav');
  const backdrop = document.getElementById('navBackdrop');
  if (!burger || !nav) return;

  const close = () => {
    document.body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.setAttribute('aria-hidden', 'true');
  };

  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (backdrop) backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
  });

  if (backdrop) backdrop.addEventListener('click', close);
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) close(); });
}

initMobileNav();

const header = document.querySelector('.header');
const landingHero = document.querySelector('.hero__marquee')
  ? document.getElementById('hero')
  : null;

if (landingHero) {
  document.body.classList.add('has-landing-hero');
}

var headerHoverTop = false;
var headerPinned = false;

function syncLandingHeader() {
  if (!header) return;

  const scrolled = window.scrollY > 20;

  if (!landingHero) {
    header.classList.add('header--visible');
    header.classList.toggle('scrolled', scrolled);
    return;
  }

  const pastMarquee = landingHero.getBoundingClientRect().bottom <= 8;
  header.classList.toggle('header--visible', pastMarquee || headerHoverTop || headerPinned);
  header.classList.toggle('scrolled', scrolled && (pastMarquee || header.classList.contains('header--visible')));
}

if (landingHero) {
  document.addEventListener('mousemove', function (e) {
    if (landingHero.getBoundingClientRect().bottom <= 8) return;
    /* только над полосой хедера по X, не весь верх экрана */
    var hdrW = Math.min(window.innerWidth - 32, 1120);
    var hdrL = (window.innerWidth - hdrW) / 2;
    var overX = e.clientX >= hdrL && e.clientX <= hdrL + hdrW;
    var next = overX && e.clientY < 72;
    if (next === headerHoverTop) return;
    headerHoverTop = next;
    syncLandingHeader();
  });

  header.addEventListener('mouseenter', function () {
    headerPinned = true;
    syncLandingHeader();
  });
  header.addEventListener('mouseleave', function () {
    headerPinned = false;
    syncLandingHeader();
  });
}

window.addEventListener('scroll', syncLandingHeader, { passive: true });
window.addEventListener('resize', syncLandingHeader);
syncLandingHeader();

/* Active nav: scroll probe (skills nested in about) */
(function initNavSpy() {
  var nav = document.getElementById('siteNav');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav > a[href*="#"]'));
  if (!nav || !links.length) return;

  var indicator = nav.querySelector('.nav__indicator');
  var linkById = {};
  links.forEach(function (a) {
    var href = a.getAttribute('href') || '';
    var id = href.split('#')[1];
    if (!id) return;
    linkById[id] = a;
  });

  function moveIndicator(el, instant) {
    if (!indicator || !el || window.innerWidth <= 900) {
      if (indicator) indicator.classList.remove('is-ready');
      return;
    }
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    if (instant) indicator.style.transition = 'none';
    indicator.style.width = width + 'px';
    indicator.style.transform = 'translate(' + left + 'px, -50%)';
    if (instant) {
      void indicator.offsetWidth;
      indicator.style.transition = '';
    }
    indicator.classList.add('is-ready');
  }

  function setActive(id) {
    links.forEach(function (a) { a.classList.remove('is-active'); });
    var active = id && linkById[id] ? linkById[id] : null;
    if (active) {
      active.classList.add('is-active');
      moveIndicator(active, false);
    }
  }

  function headerProbeY() {
    var header = document.querySelector('.header');
    if (!header || !header.classList.contains('header--visible')) return 96;
    return header.getBoundingClientRect().bottom + 12;
  }

  function updateActive() {
    var probe = headerProbeY();
    var about = document.getElementById('about');
    var skills = document.getElementById('skills');
    var works = document.getElementById('works');
    var contact = document.getElementById('contact');
    var aboutHeading = about ? about.querySelector('.about-heading') : null;

    var current = null;
    if (contact && contact.getBoundingClientRect().top <= probe) current = 'contact';
    else if (works && works.getBoundingClientRect().top <= probe) current = 'works';
    else if (
      skills &&
      skills.getBoundingClientRect().top <= probe &&
      aboutHeading &&
      aboutHeading.getBoundingClientRect().bottom < probe - 8
    ) {
      current = 'skills';
    } else if (about && about.getBoundingClientRect().top <= probe) current = 'about';

    if (current) setActive(current);
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', function () {
    updateActive();
    var active = nav.querySelector('a.is-active');
    if (active) moveIndicator(active, true);
  });
  updateActive();
  requestAnimationFrame(function () {
    var active = nav.querySelector('a.is-active');
    if (active) moveIndicator(active, true);
  });
})();

/* ─── Current year + age from 30.06.2011 ─── */
(function initDynamicDates() {
  var now = new Date();
  var year = now.getFullYear();

  var heroYear = document.getElementById('heroYear');
  if (heroYear) heroYear.textContent = year + '.';

  var footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = String(year);

  var aboutAge = document.getElementById('aboutAge');
  if (aboutAge) {
    var birth = new Date(2011, 5, 30); // 30.06.2011
    var age = year - birth.getFullYear();
    var m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
    aboutAge.textContent = String(Math.max(0, age));
  }
})();

/* ─── Footer ferret slideshow ─── */
(function initFooterSlideshow() {
  var root = document.getElementById('footerSlideshow');
  if (!root) return;

  var files = [
    'images/ferret/0d2288ffeb085ffbbd64a919d8e2e87b.jpg',
    'images/ferret/1c2dc9e48835113df420bcbdc9201154.jpg',
    'images/ferret/1d923432bb8d2cafc52ae9c6d0b3b915.jpg',
    'images/ferret/300f1e78408735df506f23ce21e8a3ee.jpg',
    'images/ferret/38f2f15fc69ca404bfec52bfc8f4eeaf.jpg',
    'images/ferret/3b4da048cdc34f080f56ddd85a65cfd5.jpg',
    'images/ferret/3ea5e8c9bf06e42ea3e2ca8a92224246.jpg',
    'images/ferret/4c3e18931b68ae443a6469e11cf07985.jpg',
    'images/ferret/5ed9e09558a540d92a3e7ed76877861e.jpg',
    'images/ferret/62107c8d4def00476a1582a45b0a9b21.jpg',
    'images/ferret/7b293bbfeec19ddccbdc1ef7bbe1c0a7.jpg',
    'images/ferret/84e2f8568cf9de90c407ecdf458c3936.jpg',
    'images/ferret/88625809015061a451fd681f5066acc1.jpg',
    'images/ferret/92831d600188cdd35b901d9d11e018fb.jpg',
    'images/ferret/a08eec58f907a0a575ee92aea4db2cde.jpg',
    'images/ferret/b6414c231bf9ba852c9f23d4677d2440.jpg',
    'images/ferret/b723ae2cf031be97b66b8c97827fff73.jpg',
    'images/ferret/b83e254922db17fcd4bde8fe1723b00a.jpg',
    'images/ferret/cc46313ae361f06841b82a41bdfd9e60.jpg',
    'images/ferret/d7dee2321a241275fd89f0a1118e72bd.jpg',
    'images/ferret/e9e906dd4803da4c3970efd8cc9a246a.jpg',
    'images/ferret/fabula-ai%20(4).png',
    'images/ferret/fabula-ai%20(5).png'
  ];

  var imgs = files.map(function (src, i) {
    var img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.decoding = 'async';
    root.appendChild(img);
    return img;
  });

  if (!imgs.length) return;

  function pickRandom(exclude) {
    if (imgs.length === 1) return 0;
    var next = exclude;
    while (next === exclude) {
      next = Math.floor(Math.random() * imgs.length);
    }
    return next;
  }

  var idx = Math.floor(Math.random() * imgs.length);
  imgs[idx].classList.add('is-active');

  if (imgs.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  setInterval(function () {
    imgs[idx].classList.remove('is-active');
    idx = pickRandom(idx);
    imgs[idx].classList.add('is-active');
  }, 2800);
})();

const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
});
scrollTopBtn.addEventListener('click', () => {
  smoothScrollToY(0, 1000);
});

const logoLink = document.querySelector('.logo');
if (logoLink) {
  logoLink.addEventListener('click', e => {
    const href = logoLink.getAttribute('href') || '';
    if (href && href !== 'javascript:void(0)' && href !== '#' && !href.startsWith('#')) return;
    e.preventDefault();
    smoothScrollToY(0, 1000);
  });
}

/* Секция стыкуется с верхом viewport — без хвоста предыдущего блока под header */
var SECTION_TOP_GAP = 0;

function getHeaderOffset(sectionId) {
  if (!sectionId || sectionId === 'hero') return 0;
  return SECTION_TOP_GAP;
}

function smoothScrollToY(targetY, duration) {
  duration = duration || 900;
  var startY = window.scrollY || window.pageYOffset;
  var diff = targetY - startY;
  if (Math.abs(diff) < 1) return;
  var t0 = performance.now();
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    window.scrollTo(0, targetY);
    return;
  }

  /* плавнее, чем cubic — мягкий разгон и торможение */
  function easeInOutQuint(t) {
    return t < 0.5
      ? 16 * t * t * t * t * t
      : 1 - Math.pow(-2 * t + 2, 5) / 2;
  }

  function frame(now) {
    var t = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, startY + diff * easeInOutQuint(t));
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function getScrollAim(id, target) {
  /* Целимся в верх секции — иначе в зазор под header вылезает хвост предыдущего блока */
  if (id === 'skills') {
    return target.querySelector('.about-card__label') || target;
  }
  return target;
}

function sectionSnapY(id) {
  var el = document.getElementById(id);
  if (!el) return null;
  var aim = getScrollAim(id, el);
  return Math.max(0, aim.getBoundingClientRect().top + window.scrollY - getHeaderOffset(id));
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();

    const top = sectionSnapY(id);
    if (top == null) return;
    softSnap.lockUntil = performance.now() + 1000;
    smoothScrollToY(top, 920);
  });
});

/* Мягкий snap после инерции — без mandatory CSS-вертежа */
var softSnap = { lockUntil: 0, timer: null, busy: false };
(function initSoftSectionSnap() {
  /* hero не авто-подцепляем — иначе уносит к бегущей строке */
  var ids = ['about', 'works', 'order', 'contact'];
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var IDLE_MS = 1500;
  var SNAP_NEAR = function () {
    return Math.min(220, window.innerHeight * 0.22);
  };

  function pickTarget() {
    var y = window.scrollY || window.pageYOffset;
    var near = SNAP_NEAR();
    var bestId = null;
    var bestDist = Infinity;
    ids.forEach(function (id) {
      var snapY = sectionSnapY(id);
      if (snapY == null) return;
      var dist = Math.abs(y - snapY);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = id;
      }
    });
    if (!bestId || bestDist > near) return null;
    return sectionSnapY(bestId);
  }

  function onIdle() {
    if (softSnap.busy || performance.now() < softSnap.lockUntil) return;
    if (reduced.matches) return;
    var target = pickTarget();
    if (target == null) return;
    if (Math.abs((window.scrollY || 0) - target) < 3) return;
    softSnap.busy = true;
    softSnap.lockUntil = performance.now() + 800;
    smoothScrollToY(target, 640);
    setTimeout(function () { softSnap.busy = false; }, 680);
  }

  window.addEventListener('scroll', function () {
    clearTimeout(softSnap.timer);
    softSnap.timer = setTimeout(onIdle, IDLE_MS);
  }, { passive: true });
})();

function drawTitleAccentLines(el) {
  if (!el) return;
  el.querySelectorAll?.('.section-title_WB, .section-title_avatarka, .section-title_project')
    .forEach(t => t.classList.add('title-line--drawn'));
  if (el.matches?.('.section-title_WB, .section-title_avatarka, .section-title_project, .section-title')) {
    el.classList.add('title-line--drawn');
  }
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      drawTitleAccentLines(entry.target);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

function initReveal() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    if (el.closest('.hero--enter')) return;
    revealObserver.observe(el);
  });
}

function initPageEntrance() {
  const header = document.querySelector('.header');
  if (header && !document.body.classList.contains('has-landing-hero')) {
    header.classList.add('header--enter');
  }

  const hero = document.getElementById('hero');
  if (hero) {
    hero.classList.add('hero--enter');
    hero.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  document.querySelectorAll('.section-title.reveal').forEach(el => {
    if (el.classList.contains('visible')) drawTitleAccentLines(el);
  });

  const jobsHero = document.querySelector('.jobs-hero');
  if (jobsHero) {
    jobsHero.classList.add('hero--enter');
    jobsHero.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 60 + i * 100);
    });
  }
}

function initSkillBarsAnimation() {
  const table = document.querySelector('.about-card--skills .skill-table');
  if (!table) return;

  table.querySelectorAll('.skill-row__bar-fill').forEach((fill, i) => {
    fill.style.setProperty('--bar-i', String(i));
  });

  const barsObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      requestAnimationFrame(() => table.classList.add('skills-bars-play'));
      barsObserver.disconnect();
    }
  }, { threshold: 0.15 });

  barsObserver.observe(table);
}

function initAboutScribble() {
  const about = document.getElementById('about');
  if (!about) return;
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      about.classList.add('is-scribble-in');
      obs.disconnect();
    }
  }, { threshold: 0.2 });
  obs.observe(about);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initPageEntrance();
    initSkillBarsAnimation();
    initAboutScribble();
  });
} else {
  initPageEntrance();
  initSkillBarsAnimation();
  initAboutScribble();
}
initReveal();

function delayClass(index) {
  const n = Math.min((index % 5) + 1, 5);
  return ` delay-${n}`;
}

function workRevealClass(index) {
  return 'reveal reveal--up' + delayClass(index);
}

const lineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      drawTitleAccentLines(entry.target);
      lineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

function observeBlockTitleLine(block) {
  if (block) lineObserver.observe(block);
}

function createItem(work, index, animated = true) {
  const galleryIndex = addToLightboxGallery(work);
  const div = document.createElement('div');
  div.className = 'masonry-item' + (animated ? ' ' + workRevealClass(index) : '');
  const img = document.createElement('img');
  img.src = work.src;
  img.alt = work.title;
  img.loading = 'lazy';
  div.appendChild(img);
  div.addEventListener('click', () => openLightboxAt(galleryIndex));
  return div;
}

function fillMasonryGrid(grid, items, startIndex = 0, animated = true) {
  items.forEach((item, i) => grid.appendChild(createItem(item, startIndex + i, animated)));
}

function createWbBlock(group, animated = true) {
  const block = document.createElement('div');
  block.className = 'wb-block';

  const header = document.createElement('div');
  header.className = 'wb-block__header';
  header.innerHTML =
    '<span class="section-title_WB">Инфографика для платформы <span style="color: #3868f5;">Wildberries</span></span>';
  block.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'masonry masonry--wb masonry--folder';
  fillMasonryGrid(grid, group.items.map(i => ({ ...i, description: group.description || '' })), 0, animated);
  block.appendChild(grid);
  return block;
}

function createProjectBlock(group, animated = true) {
  const block = document.createElement('div');
  block.className = 'project-block';

  const header = document.createElement('div');
  header.className = 'project-block__header';
  const title = document.createElement('span');
  title.className = 'section-title_project';
  title.textContent = group.title || group.folder;
  header.appendChild(title);
  block.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'masonry masonry--folder';
  fillMasonryGrid(grid, group.items.map(i => ({ ...i, description: group.description || '' })), 0, animated);
  block.appendChild(grid);
  return block;
}

function avatarkaSort(items) {
  const order = (name) => {
    const n = name.toLowerCase();
    if (n.includes('obzor')) return 3;
    if (n.includes('old')) return 1;
    if (n.includes('new')) return 2;
    return 4;
  };
  return [...items].sort((a, b) => order(a.title) - order(b.title) || a.title.localeCompare(b.title, 'ru'));
}

function createAvatarkaBlock(group) {
  const block = document.createElement('div');
  block.className = 'avatarka-block';

  const header = document.createElement('div');
  header.className = 'avatarka-block__header';
  header.innerHTML = '<span class="section-title_avatarka">Новая <span>Аватарка</span></span>';
  block.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'avatarka-grid';

  avatarkaSort(group.items).forEach(item => {
    const isObzor = /obzor/i.test(item.title);
    const cell = document.createElement('div');
    cell.className = 'avatarka-item' + (isObzor ? ' avatarka-item-obzor' : '');

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.title;
    img.className = isObzor ? 'avatarka-img-obzor' : 'avatarka-img';

    cell.appendChild(img);
    if (!isObzor) {
      const label = document.createElement('span');
      label.className = 'avatarka-label';
      label.textContent = item.title.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
      cell.appendChild(label);
    }
    const galleryIndex = addToLightboxGallery({ ...item, description: group.description || '' });
    cell.addEventListener('click', () => openLightboxAt(galleryIndex));
    grid.appendChild(cell);
  });

  block.appendChild(grid);
  return block;
}

let lightboxGallery = [];
let lightboxIndex = 0;

function resetLightboxGallery() {
  lightboxGallery = [];
}

function addToLightboxGallery(work) {
  lightboxGallery.push({
    src: work.src,
    title: work.title,
    description: work.description || '',
  });
  return lightboxGallery.length - 1;
}

async function renderWorks() {
  resetLightboxGallery();
  const { singles, groups } = await loadWorks();
  const wbGroups = groups.filter(g => g.layout === 'wb');
  const projectGroups = groups.filter(g => g.layout === 'project');
  const avatarkaGroups = groups.filter(g => g.layout === 'avatarka');

  const mainGrid = document.getElementById('mainGrid');
  const worksMoreBtn = document.getElementById('worksMoreBtn');

  if (mainGrid) {
    // Главная: только файлы в корне images/works/, не больше MAIN_SINGLES_LIMIT
    singles.slice(0, MAIN_SINGLES_LIMIT).forEach((w, i) => mainGrid.appendChild(createItem(w, i)));

    if (worksMoreBtn && hasArchivePage({ singles, groups })) {
      worksMoreBtn.style.display = '';
    }
    initReveal();
  }

  const jobsMasonry = document.getElementById('jobsMasonry');
  const jobsExtra = document.getElementById('jobsExtra');

  if (jobsMasonry) {
    singles.forEach((w, i) => jobsMasonry.appendChild(createItem(w, i, false)));
  }

  if (jobsExtra) {
    wbGroups.forEach(g => {
      const block = createWbBlock(g, false);
      jobsExtra.appendChild(block);
      observeBlockTitleLine(block);
    });
    projectGroups.forEach(g => {
      const block = createProjectBlock(g, false);
      jobsExtra.appendChild(block);
      observeBlockTitleLine(block);
    });
    avatarkaGroups.forEach(g => {
      const block = createAvatarkaBlock(g);
      jobsExtra.appendChild(block);
      observeBlockTitleLine(block);
    });
  }
}

renderWorks();

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxDesc = document.getElementById('lightboxDesc');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxBack = document.getElementById('lightboxBackdrop');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

function updateLightboxNav() {
  const hasMany = lightboxGallery.length > 1;
  if (lightboxPrev) lightboxPrev.style.display = hasMany ? '' : 'none';
  if (lightboxNext) lightboxNext.style.display = hasMany ? '' : 'none';
}

function showLightboxEntry(entry) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = entry.src;
  lightboxImg.alt = entry.title;
  if (lightboxTitle) lightboxTitle.textContent = entry.title;
  if (lightboxDesc) {
    if (entry.description) {
      lightboxDesc.textContent = entry.description;
      lightboxDesc.hidden = false;
    } else {
      lightboxDesc.textContent = '';
      lightboxDesc.hidden = true;
    }
  }
  updateLightboxNav();
}

function openLightboxAt(index) {
  if (!lightboxGallery.length) return;
  lightboxIndex = (index + lightboxGallery.length) % lightboxGallery.length;
  showLightboxEntry(lightboxGallery[lightboxIndex]);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function stepLightbox(delta) {
  if (!lightbox?.classList.contains('open') || lightboxGallery.length < 2) return;
  openLightboxAt(lightboxIndex + delta);
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { if (lightboxImg) lightboxImg.src = ''; }, 300);
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxBack) lightboxBack.addEventListener('click', closeLightbox);
if (lightboxPrev) lightboxPrev.addEventListener('click', e => { e.stopPropagation(); stepLightbox(-1); });
if (lightboxNext) lightboxNext.addEventListener('click', e => { e.stopPropagation(); stepLightbox(1); });

document.addEventListener('keydown', e => {
  if (!lightbox?.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') stepLightbox(-1);
  if (e.key === 'ArrowRight') stepLightbox(1);
});

let lightboxTouchX = null;
if (lightbox) {
  lightbox.addEventListener('touchstart', e => {
    lightboxTouchX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    if (lightboxTouchX === null) return;
    const dx = e.changedTouches[0].clientX - lightboxTouchX;
    if (Math.abs(dx) > 50) stepLightbox(dx > 0 ? -1 : 1);
    lightboxTouchX = null;
  }, { passive: true });
}
