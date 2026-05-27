// ╔══════════════════════════════════════════════════╗
// ║  Работы из works.json — обновить-работы.bat      ║
// ║  Инструкция: ПРОСТО.md                           ║
// ╚══════════════════════════════════════════════════╝

const FOLDER = 'работы/';
const SHOW_ALL_THRESHOLD = 16;

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

function totalWorkCount({ singles, groups }) {
  return singles.length + groups.reduce((n, g) => n + g.items.length, 0);
}

// ═══════════════════════════════════════════════════════
// ТЕМА И ЯЗЫК
// ═══════════════════════════════════════════════════════

const themeBtn = document.getElementById('themeToggle');
const langBtn = document.getElementById('languageToggle');
const langDropdown = document.getElementById('languageDropdown');
const langCurrent = document.querySelector('.language-current');
const langOptions = document.querySelectorAll('.language-option');

const translations = {
  ru: {
    about: 'Обо мне', skills: 'Навыки', works: 'Работы', contact: 'Контакт',
    heroSub: 'Привет, я', heroName: 'Артём', red: 'D3buff' , heroDesc: 'Специализируюсь на визуале, но умею заставлять технологии работать на результат.<br/>Мой подход — это микс <span style="color: var(--red);">идей</span> и <span style="color: var(--red);">лучшего подхода </span>к задаче.',
    viewWorks: 'Смотреть работы',
    aboutTitle: 'Обо мне', aboutSub: 'Кто я, чем занимаюсь и что умею',
    aboutBio: 'Меня зовут Артём, я мультидисциплинарный дизайнер, который превращает идеи в выразительный визуальный продукт. В работе использую Photoshop, Blender и After Effects, создавая всё: от стильных постеров и PFP до графики для маркетплейсов и моушн-дизайна. Помимо визуала, я занимаюсь разработкой сайтов, где применяю нейросети для написания и оптимизации кода. Такой подход позволяет мне совмещать чистую эстетику с технической логикой, создавая качественные и современные цифровые решения.',
    aboutSubText: '14 лет · дизайнер · всегда на связи',
    soft: 'Софт', personalQualities: 'Личные качества', languages: 'Языки',
    attentionToDetail: 'Внимание к деталям', seeCompanyStyle: 'Вижу стиль компании',
    responsibility: 'Ответственность', creativeThinking: 'Креативное мышление', hardworking: 'Трудолюбивый',
    russianNative: 'Русский (родной)', englishLevel: 'Англиский A1/A2 Начальный', efsetText: 'тест от efset.org',
    aiTools: 'AI-инструменты', htmlCssNote: '(Онли c ИИ)',  html_Note: '(Онли c ИИ)',
    skillsTitle: 'Навыки', skillsSub: 'Инструменты, с которыми я работаю каждый день',
    worksTitle: 'Работы', worksSub: 'Избранные проекты — постеры, баннеры, ассеты и не только',
    contactTitle: 'Контакты', contactSub: 'Напиши мне — и я отвечу',
    telegram: 'Telegram', telegramHint: 'Написать в Telegram',
    discord: 'Discord', discordHint: 'Перейти в Discord', discordValue: 'Открыть профиль',
    clientWork: 'Работа с клиентами',
    email: 'Email', emailHint: 'Написать письмо',
    status: 'Статус', statusValue: 'Открыт к заказам', statusHint: 'Готов взяться за проект',
    allWorks: 'Все работы →',
    footer: '© 2026 D3buff. Все права защищены. <p>Отдельная благодарность <span style="color:rgba(255,255,255,0.75);font-weight:300;">Kiro AI</span> <span style="font-weight: 900; margin: 6px;"> · </span> Сайт был за 3 дня</p>',
    expert: 'Эксперт', intermediate: 'Средний', basic: 'Базовый', advanced: 'Продвинутый', low: 'Низкий',
    wbTitle: 'Инфографика для платформы <span style="color: #e02020;">Wildberries</span>',
    avatarkaTitle: '<span style="color: #e02020;">Новая</span> аватарка',
    scrollTop: 'Наверх'
  },
  en: {
    about: 'About', skills: 'Skills', works: 'Works', contact: 'Contact',
    heroSub: "Hi, I'm", heroName: 'Artem',red:'D3buff', heroDesc: "I specialize in visuals but know how to make technology work for results. My approach is a mix of <span style='color: var(--red);'>ideas</span> and <span style='color: var(--red);'>the best approach</span> to the task.",
    viewWorks: 'View Works',
    aboutTitle: 'About Me', aboutSub: 'Who I am, what I do and what I can do',
    aboutBio: "My name is Artem, I'm a multidisciplinary designer who turns ideas into expressive visual products. In my work I use Photoshop, Blender and After Effects, creating everything from stylish posters and PFPs to graphics for marketplaces and motion design. Besides visuals, I'm involved in website development where I use neural networks for writing and optimizing code. This approach allows me to combine pure aesthetics with technical logic, creating quality and modern digital solutions.",
    aboutSubText: '14 years · designer · always available',
    soft: 'Software', personalQualities: 'Personal Qualities', languages: 'Languages',
    attentionToDetail: 'Attention to detail', seeCompanyStyle: 'See company style',
    responsibility: 'Responsibility', creativeThinking: 'Creative thinking', hardworking: 'Hardworking',
    russianNative: 'Russian (native)', englishLevel: 'English A1/A2 Beginner', efsetText: 'test by efset.org',
    aiTools: 'AI Tools', htmlCssNote: '(Only with AI)', html_Note: '(Only with AI)',
    skillsTitle: 'Skills', skillsSub: 'Tools I work with every day',
    worksTitle: 'Works', worksSub: 'Selected projects — posters, banners, assets and more',
    contactTitle: 'Contact', contactSub: "Write to me — and I'll reply",
    telegram: 'Telegram', telegramHint: 'Write in Telegram',
    discord: 'Discord', discordHint: 'Go to Discord', discordValue: 'Open profile',
    clientWork: 'Client work',
    email: 'Email', emailHint: 'Write an email',
    status: 'Status', statusValue: 'Open for orders', statusHint: 'Ready to take on a project',
    allWorks: 'All Works →',
    footer: '© 2026 D3buff. All rights reserved. <p>Special thanks to <span style="color:rgba(255,255,255,0.75);font-weight:300;">Kiro AI</span> <span style="font-weight: 900; margin: 6px;"> · </span> Site was made in 3 days</p>',
    expert: 'Expert', intermediate: 'Intermediate', basic: 'Basic', advanced: 'Advanced', low: 'Low',
    wbTitle: 'Infographics for <span style="color: #e02020;">Wildberries</span> platform',
    avatarkaTitle: '<span style="color: #e02020;">New</span> pfp',
    scrollTop: 'To top'
  }
};

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

// ЯЗЫК
function translatePage(lang) {
  const t = translations[lang];
  if (!t) return;

  // Навигация
  const navLinks = document.querySelectorAll('nav a');
  if (navLinks[0]) navLinks[0].textContent = t.about;
  if (navLinks[1]) navLinks[1].textContent = t.skills;
  if (navLinks[2]) navLinks[2].textContent = t.works;
  if (navLinks[3]) navLinks[3].textContent = t.contact;

  // Hero
  const heroSub = document.querySelector('.hero__sub');
  if (heroSub) heroSub.innerHTML = t.heroSub + ' <span style="display: inline-block; transform: scaleX(2); margin: 0 11px;">—</span>';
  const heroName = document.querySelector('.hero__name');
  if (heroName && t.heroName) heroName.textContent = t.heroName;
    const red = document.querySelector('.red');
  if (red) red.innerHTML = t.red;
  const heroDesc = document.querySelector('.hero__desc');
  if (heroDesc) heroDesc.innerHTML = t.heroDesc;
  const heroBtn = document.querySelector('.hero .btn');
  if (heroBtn) heroBtn.textContent = t.viewWorks;

  // About
  const aboutTitle = document.querySelector('#about .section-title');
  const aboutSub = document.querySelector('#about .section-sub');
  if (aboutTitle) aboutTitle.textContent = t.aboutTitle;
  if (aboutSub) aboutSub.textContent = t.aboutSub;
  const aboutBio = document.querySelector('.about__bio');
  if (aboutBio) aboutBio.textContent = t.aboutBio;
  const aboutSubText = document.querySelector('.about__sub');
  if (aboutSubText) aboutSubText.textContent = t.aboutSubText;
  
  // About колонки
  const colTitles = document.querySelectorAll('.about__col-title');
  if (colTitles[0]) colTitles[0].textContent = t.soft;
  if (colTitles[1]) colTitles[1].textContent = t.personalQualities;
  if (colTitles[2]) colTitles[2].textContent = t.languages;
  
  // About тексты
  const aboutCol2 = document.querySelectorAll('.about__col:nth-child(2) p');
  if (aboutCol2[1]) aboutCol2[1].textContent = t.attentionToDetail;
  if (aboutCol2[2]) aboutCol2[2].textContent = t.seeCompanyStyle;
  if (aboutCol2[3]) aboutCol2[3].textContent = t.responsibility;
  if (aboutCol2[4]) aboutCol2[4].textContent = t.creativeThinking;
  if (aboutCol2[5]) aboutCol2[5].textContent = t.hardworking;
  
  const aboutCol3 = document.querySelectorAll('.about__col:nth-child(3) p');
  if (aboutCol3[1]) aboutCol3[1].textContent = t.russianNative;
    const efsetText = document.querySelector('.testby');
    const englishLevel = document.querySelector('.englishLevel');
    if (englishLevel) englishLevel.textContent = t.englishLevel;
    if (efsetText) efsetText.textContent = t.efsetText;

  // Skills
  const skillsTitle = document.querySelector('#skills .section-title');
  const skillsSub = document.querySelector('#skills .section-sub');
  if (skillsTitle) skillsTitle.textContent = t.skillsTitle;
  if (skillsSub) skillsSub.textContent = t.skillsSub;
  



  const html_Note = document.querySelector('.html_Note');
  if (html_Note && t.html_Note) html_Note.textContent = t.html_Note;


  // Skills - HTML/CSS note (в таблице навыков)
  const htmlCssNote = document.querySelector('.htmlCssNote');
  if (htmlCssNote && t.htmlCssNote) htmlCssNote.textContent = t.htmlCssNote;
  
  // Skills - AI Tools row (в таблице навыков)
  const aiToolsRow = document.querySelector('.skill-row:nth-child(5) .skill-row__name');
  if (aiToolsRow && t.aiTools) aiToolsRow.textContent = t.aiTools;
  
  // About - AI Tools (первая колонка)
  const aboutCol1 = document.querySelectorAll('.about__col:nth-child(1) p');
  if (aboutCol1[5]) aboutCol1[5].textContent = t.aiTools;
  
  // Skills - Client work row
  const clientWorkRow = document.querySelector('.skill-row:nth-child(8) .skill-row__name');
  if (clientWorkRow && t.clientWork) clientWorkRow.textContent = t.clientWork;
  
  // Skills labels
  const skillLabels = document.querySelectorAll('.skill-row__label');
  if (skillLabels[0]) skillLabels[0].textContent = t.expert;
  if (skillLabels[1]) skillLabels[1].textContent = t.intermediate;
  if (skillLabels[2]) skillLabels[2].textContent = t.basic;
  if (skillLabels[3]) skillLabels[3].textContent = t.intermediate;
  if (skillLabels[4]) skillLabels[4].textContent = t.advanced;
  if (skillLabels[5]) skillLabels[5].textContent = t.low;
  if (skillLabels[6]) skillLabels[6].textContent = t.basic;
  if (skillLabels[7]) skillLabels[7].textContent = t.advanced;

  // Works
  const worksTitle = document.querySelector('#works .section-title');
  const worksSub = document.querySelector('#works .section-sub');
  if (worksTitle) worksTitle.textContent = t.worksTitle;
  if (worksSub) worksSub.textContent = t.worksSub;
  const allWorksBtn = document.querySelector('.btn--outline');
  if (allWorksBtn) allWorksBtn.textContent = t.allWorks;
  const wbTitle = document.querySelector('.section-title_WB');
  if (wbTitle) wbTitle.innerHTML = t.wbTitle;
  const avatarkaTitle = document.querySelector('.section-title_avatarka');
  if (avatarkaTitle) avatarkaTitle.innerHTML = t.avatarkaTitle;

  // Contact
  const contactTitle = document.querySelector('#contact .section-title');
  const contactSub = document.querySelector('#contact .section-sub');
  if (contactTitle) contactTitle.textContent = t.contactTitle;
  if (contactSub) contactSub.textContent = t.contactSub;
  
  const contactCards = document.querySelectorAll('.contact-card');
  contactCards.forEach(card => {
    if (card.classList.contains('contact-card--tg')) {
      const label = card.querySelector('.contact-card__label');
      const hint = card.querySelector('.contact-card__hint');
      if (label) label.textContent = t.telegram;
      if (hint) hint.textContent = t.telegramHint;
    } else if (card.classList.contains('contact-card--discord')) {
      const label = card.querySelector('.contact-card__label');
      const value = card.querySelector('.contact-card__value');
      const hint = card.querySelector('.contact-card__hint');
      if (label) label.textContent = t.discord;
      if (value && t.discordValue) value.textContent = t.discordValue;
      if (hint) hint.textContent = t.discordHint;
    } else if (card.classList.contains('contact-card--email')) {
      const label = card.querySelector('.contact-card__label');
      const hint = card.querySelector('.contact-card__hint');
      if (label) label.textContent = t.email;
      if (hint) hint.textContent = t.emailHint;
    } else if (card.classList.contains('contact-card--status')) {
      const label = card.querySelector('.contact-card__label');
      const value = card.querySelector('.contact-card__value');
      const hint = card.querySelector('.contact-card__hint');
      if (label) label.textContent = t.status;
      if (value) value.textContent = t.statusValue;
      if (hint) hint.textContent = t.statusHint;
    }
  });

  // Footer
  const footer = document.querySelector('.footer__inner');
  if (footer) footer.innerHTML = t.footer;
  
  // Scroll top
  const scrollTop = document.getElementById('scrollTop');
  if (scrollTop) scrollTop.setAttribute('aria-label', t.scrollTop);

  if (langCurrent) langCurrent.textContent = lang.toUpperCase();
  localStorage.setItem('language', lang);
  document.documentElement.lang = lang;
}

function initLanguage() {
  const saved = localStorage.getItem('language') || 'ru';
  translatePage(saved);
}

if (langBtn && langDropdown) {
  langBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const isVisible = langDropdown.style.opacity === '1';
    langDropdown.style.opacity = isVisible ? '0' : '1';
    langDropdown.style.visibility = isVisible ? 'hidden' : 'visible';
    langDropdown.style.transform = isVisible ? 'translateY(-10px)' : 'translateY(0)';
  });

  langOptions.forEach(opt => {
    opt.addEventListener('click', function() {
      const lang = this.getAttribute('data-lang');
      translatePage(lang);
      langDropdown.style.opacity = '0';
      langDropdown.style.visibility = 'hidden';
      langDropdown.style.transform = 'translateY(-10px)';
    });
  });

  document.addEventListener('click', function(e) {
    if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
      langDropdown.style.opacity = '0';
      langDropdown.style.visibility = 'hidden';
      langDropdown.style.transform = 'translateY(-10px)';
    }
  });
}

initTheme();
initLanguage();

// ═══════════════════════════════════════════════════════
// ОСТАЛЬНОЙ КОД САЙТА
// ═══════════════════════════════════════════════════════

const cursorImg = document.getElementById('cursor-img');
const interactiveSelector = 'a, button, .btn, .skill-row__stars, input, [onclick], img';

document.addEventListener('mouseover', (e) => {
  if (e.target.closest(interactiveSelector)) {
    cursorImg.src = 'images/Pointer.png';
    cursor.style.transform = 'translate(-50%, -50%) scale(0.9)';
  } else {
    cursorImg.src = 'images/Cursor.png';
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  }
});

document.addEventListener('mouseleave', () => {
  cursorImg.src = 'images/Cursor.png';
});

const cursor = document.getElementById('custom-cursor');
const blurElement = document.getElementById('blurElement');

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
  const div = document.createElement('div');
  div.className = 'masonry-item' + (animated ? ' ' + workRevealClass(index) : '');
  const img = document.createElement('img');
  img.src = work.src;
  img.alt = work.title;
  img.loading = 'lazy';
  div.appendChild(img);
  div.addEventListener('click', () => openLightbox(work.src, work.title));
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
  fillMasonryGrid(grid, group.items, 0, animated);
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
  fillMasonryGrid(grid, group.items, 0, animated);
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
    cell.addEventListener('click', () => openLightbox(item.src, item.title));
    grid.appendChild(cell);
  });

  block.appendChild(grid);
  return block;
}

async function renderWorks() {
  const { singles, groups } = await loadWorks();
  const wbGroups = groups.filter(g => g.layout === 'wb');
  const projectGroups = groups.filter(g => g.layout === 'project');
  const avatarkaGroups = groups.filter(g => g.layout === 'avatarka');
  const total = totalWorkCount({ singles, groups });

  const mainGrid = document.getElementById('mainGrid');
  const wbBlock = document.getElementById('wbBlock');
  const wbGrid = document.getElementById('wbGrid');
  const worksMoreBtn = document.getElementById('worksMoreBtn');

  if (mainGrid) {
    const wbCount = wbGroups.reduce((n, g) => n + g.items.length, 0);
    let remaining = SHOW_ALL_THRESHOLD - wbCount;

    const designToShow = Math.min(singles.length, Math.max(0, remaining));
    singles.slice(0, designToShow).forEach((w, i) => mainGrid.appendChild(createItem(w, i)));
    remaining -= designToShow;

    if (wbGrid && wbBlock && wbGroups[0] && wbGroups[0].items.length <= remaining) {
      wbBlock.className = 'wb-block';
      wbBlock.style.display = '';
      fillMasonryGrid(wbGrid, wbGroups[0].items);
      observeBlockTitleLine(wbBlock);
    }

    if (worksMoreBtn && total >= SHOW_ALL_THRESHOLD) {
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
const lightboxClose = document.getElementById('lightboxClose');
const lightboxBack = document.getElementById('lightboxBackdrop');

function openLightbox(src, title) {
  lightboxImg.src = src;
  lightboxImg.alt = title;
  lightboxTitle.textContent = title;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxBack) lightboxBack.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
