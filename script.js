// ╔══════════════════════════════════════════════════╗
// ║  Работы из works.json — обновить-работы.bat      ║
// ║  Инструкция: ПРОСТО.md                           ║
// ╚══════════════════════════════════════════════════╝

const FOLDER = 'работы/';
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
      const res = await fetch('works.json?' + Date.now());
      if (!res.ok) throw new Error('works.json not found');
      raw = await res.json();
    } catch (e) {
      console.warn('Работы не загрузились. Запусти обновить-работы.bat', e);
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
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function updateThemeIcon(theme) {
  const icon = themeBtn.querySelector('.theme-icon');
  if (theme === 'dark') {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  } else {
    icon.innerHTML = '<path d="M12 3V4M12 20V21M4 12H3M6.31412 6.31412L5.5 5.5M17.6859 6.31412L18.5 5.5M6.31412 17.69L5.5 18.5M17.6859 17.69L18.5 18.5M21 12H20M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

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

const roles = ['Дизайнер', 'AI & Web', 'Photoshop', 'Blender', 'After Effects', 'Blockbench', 'Davinchi Resolve', 'AI & Vibe code'];
const roleBadge = document.querySelector('.role-badge');

if (roleBadge) {
  let idx = 0;
  const DELAY = 40;
  const ruler = document.createElement('span');
  ruler.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-size:1rem;font-weight:600;';
  document.body.appendChild(ruler);
  function getW(t) { ruler.textContent = t; return ruler.offsetWidth; }

  function renderChars(word) {
    roleBadge.innerHTML = '';
    return [...word].map(ch => {
      const s = document.createElement('span');
      s.className = 'role-char';
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      roleBadge.appendChild(s);
      return s;
    });
  }

  function switchTo(word) {
    const oldChars = [...roleBadge.querySelectorAll('.role-char')];
    oldChars.forEach((ch, i) => {
      setTimeout(() => {
        ch.style.opacity = '0';
        ch.style.transform = 'translateY(-16px)';
      }, i * DELAY);
    });
    const outDuration = oldChars.length * DELAY + 180;
    setTimeout(() => {
      roleBadge.style.width = (getW(word) + 35) + 'px';
      const newChars = renderChars(word);
      newChars.forEach(ch => {
        ch.style.opacity = '0';
        ch.style.transform = 'translateY(16px)';
      });
      requestAnimationFrame(() => {
        newChars.forEach((ch, i) => {
          setTimeout(() => {
            ch.style.opacity = '1';
            ch.style.transform = 'translateY(0)';
          }, i * DELAY);
        });
      });
    }, outDuration);
  }

  roleBadge.style.width = (getW(roles[0]) + 37) + 'px';
  renderChars(roles[0]);
  setInterval(() => {
    idx = (idx + 1) % roles.length;
    switchTo(roles[idx]);
  }, 2800);
}

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
});
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const logoLink = document.querySelector('.logo');
if (logoLink) {
  logoLink.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const ferretImg = document.querySelector('.ferret-img');
if (ferretImg) {
  let baseY = 80, isPanic = false, isLocked = false;
  ferretImg.addEventListener('click', function() {
    if (isLocked) return;
    isPanic = true;
    isLocked = true;
    ferretImg.src = 'images/Xorek_panic.png';
    ferretImg.style.cursor = 'default';
    setTimeout(() => {
      ferretImg.src = 'images/Xorek.png';
      isPanic = false;
      setTimeout(() => {
        isLocked = false;
        ferretImg.style.cursor = 'default';
      }, 2000);
    }, 1000);
  });

  function wiggle() {
    const intensity = isPanic ? 20 : 8;
    const x = (Math.random() - 0.5) * intensity;
    const y = baseY + (Math.random() - 0.5) * intensity;
    ferretImg.style.transform = `scale(1.35) translate(${x}px, ${y}px)`;
    const speed = isPanic ? 60 : (150 + Math.random() * 250);
    setTimeout(wiggle, speed);
  }
  wiggle();
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

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
  if (header) header.classList.add('header--enter');

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

function parseSkillStars(starsEl) {
  if (starsEl.dataset.starsParsed) return;
  starsEl.dataset.starsParsed = '1';

  const items = [];
  function walk(node, state) {
    if (node.nodeType === Node.TEXT_NODE) {
      for (const ch of node.textContent) {
        if (ch === '★') items.push(state);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      let next = state;
      if (node.classList.contains('skill-star-off')) next = 'off';
      if (node.classList.contains('skill-star-half')) next = 'half';
      node.childNodes.forEach(child => walk(child, next));
    }
  }
  starsEl.childNodes.forEach(child => walk(child, 'on'));

  starsEl.innerHTML = '';
  items.forEach((type, i) => {
    const span = document.createElement('span');
    span.className = `skill-star skill-star--${type}`;
    span.textContent = '★';
    span.style.setProperty('--star-i', String(i));
    starsEl.appendChild(span);
  });
}

function initSkillStarsAnimation() {
  const table = document.querySelector('.skill-table');
  const section = document.getElementById('skills');
  if (!table || !section) return;

  document.querySelectorAll('.skill-row__stars').forEach(parseSkillStars);

  const starsObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      requestAnimationFrame(() => table.classList.add('skills-stars-play'));
      starsObserver.disconnect();
    }
  }, { threshold: 0.15 });

  starsObserver.observe(table);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initPageEntrance();
    initSkillStarsAnimation();
  });
} else {
  initPageEntrance();
  initSkillStarsAnimation();
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
    '<span class="section-title_WB">Инфографика для платформы <span style="color: #e02020;">Wildberries</span></span>';
  block.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'masonry masonry--wb';
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
  grid.className = 'masonry';
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
    // Главная: только файлы в корне «работы/», не больше 13 (новые первые — см. index-works.mjs)
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
