// ╔══════════════════════════════════════════════════╗
// ║           СПИСОК РАБОТ — редактируй здесь        ║
// ║  src:   имя файла (или подпапка/файл.jpg)        ║
// ║  group: "design" или "wb"                        ║
// ║  title берётся автоматически из имени файла      ║
// ╚══════════════════════════════════════════════════╝

const FOLDER = 'работы/';

const WORKS = [
  { src: 'poster_with_man.jpg',                         group: 'design' },
  { src: 'meme.lua_banner.jpg', group: 'design' },
  { src: 'meme.lua_poster.jpg', group: 'design' },
  { src: 'Wb_rem.jpg', group: 'design' },
  { src: 'SakaynoS PFP.jpg', group: 'design' },
  { src: 'QRposter.jpg', group: 'design' },
  { src: 'dog_poster.jpg',           group: 'design' },
  { src: 'wb работа_1/Обложка.jpg',                  group: 'wb' },
  { src: 'wb работа_1/2 слайд.png',                  group: 'wb' },
  { src: 'wb работа_1/3 слайд.png',                  group: 'wb' },
].map(w => ({ src: FOLDER + w.src, title: w.src.split('/').pop(), group: w.group }));

const SHOW_ALL_THRESHOLD = 16;

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

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

function initReveal() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}
initReveal();

function createItem(work, index) {
  const delays = ['', ' delay-1', ' delay-2', ' delay-3', ' delay-4', ' delay-5'];
  const div = document.createElement('div');
  div.className = 'masonry-item reveal' + delays[index % 6];
  div.dataset.src = work.src;
  div.dataset.title = work.title;
  const img = document.createElement('img');
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f0f0f0"/%3E%3C/svg%3E';
  img.dataset.src = work.src;
  img.alt = work.title;
  img.loading = 'lazy';
  img.className = 'lazy-image';
  div.appendChild(img);
  div.addEventListener('click', () => openLightbox(work.src, work.title));
  return div;
}

const designWorks = WORKS.filter(w => w.group === 'design');
const wbWorks = WORKS.filter(w => w.group === 'wb');

const mainGrid = document.getElementById('mainGrid');
const wbGrid = document.getElementById('wbGrid');
const wbBlock = document.getElementById('wbBlock');
const worksMoreBtn = document.getElementById('worksMoreBtn');

if (mainGrid) {
  designWorks.slice(0, SHOW_ALL_THRESHOLD - 1).forEach((w, i) => mainGrid.appendChild(createItem(w, i)));
  if (wbWorks.length > 0 && wbGrid && wbBlock) {
    wbWorks.forEach((w, i) => wbGrid.appendChild(createItem(w, i)));
    wbBlock.style.display = '';
    wbBlock.classList.add('reveal');
  }
  if (worksMoreBtn && designWorks.length >= SHOW_ALL_THRESHOLD) {
    worksMoreBtn.style.display = '';
    worksMoreBtn.classList.add('reveal');
  }
  initReveal();
}

const jobsMainGrid = document.getElementById('jobsMainGrid');
const jobsWbGrid = document.getElementById('jobsWbGrid');
const jobsWbGroup = document.getElementById('jobsWbGroup');

if (jobsMainGrid) {
  designWorks.forEach((w, i) => jobsMainGrid.appendChild(createItem(w, i)));
  if (wbWorks.length > 0 && jobsWbGrid && jobsWbGroup) {
    wbWorks.forEach((w, i) => jobsWbGrid.appendChild(createItem(w, i)));
    jobsWbGroup.style.display = '';
  }
  initReveal();
}

// Ленивая загрузка изображений
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img.lazy-image');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback для старых браузеров
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.classList.add('loaded');
    });
  }
}

// Предзагрузка критических изображений
function preloadCriticalImages() {
  const criticalImages = [
    'images/Xorek.png',
    'images/Xorek_panic.png',
    'images/Cursor.png',
    'images/Pointer.png',
    'images/gif.gif'
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

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
  
  // Добавляем анимацию появления
  setTimeout(() => {
    lightboxImg.style.transform = 'scale(1)';
    lightboxImg.style.opacity = '1';
  }, 10);
}

function closeLightbox() {
  lightboxImg.style.transform = 'scale(0.95)';
  lightboxImg.style.opacity = '0';
  
  setTimeout(() => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    lightboxImg.style.transform = '';
    lightboxImg.style.opacity = '';
  }, 300);
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxBack) lightboxBack.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { 
  if (e.key === 'Escape') closeLightbox(); 
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') navigateLightbox(e.key);
});

// Навигация по изображениям в лайтбоксе
function navigateLightbox(key) {
  if (!lightbox.classList.contains('open')) return;
  
  const currentSrc = lightboxImg.src;
  const allWorks = [...designWorks, ...wbWorks];
  const currentIndex = allWorks.findIndex(w => currentSrc.includes(w.src));
  
  if (currentIndex === -1) return;
  
  let nextIndex;
  if (key === 'ArrowLeft') {
    nextIndex = currentIndex > 0 ? currentIndex - 1 : allWorks.length - 1;
  } else if (key === 'ArrowRight') {
    nextIndex = currentIndex < allWorks.length - 1 ? currentIndex + 1 : 0;
  }
  
  const nextWork = allWorks[nextIndex];
  openLightbox(nextWork.src, nextWork.title);
}

// Мобильное меню
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.querySelectorAll('.nav a');
  
  if (!mobileMenuToggle) return;
  
  // Создаем мобильное меню
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu';
  mobileMenu.id = 'mobileMenu';
  
  // Копируем ссылки из основной навигации
  navLinks.forEach(link => {
    const mobileLink = document.createElement('a');
    mobileLink.href = link.href;
    mobileLink.textContent = link.textContent;
    mobileLink.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top, behavior: 'smooth' });
        closeMobileMenu();
      }
    });
    mobileMenu.appendChild(mobileLink);
  });
  
  document.body.appendChild(mobileMenu);
  
  // Функции открытия/закрытия меню
  function openMobileMenu() {
    mobileMenu.classList.add('active');
    mobileMenuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileMenuToggle.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Обработчики событий
  mobileMenuToggle.addEventListener('click', () => {
    if (mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
  
  // Закрытие меню при клике вне его
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      closeMobileMenu();
    }
  });
  
  // Закрытие меню при нажатии Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });
  
  // Закрытие меню при изменении размера окна
  window.addEventListener('resize', () => {
    if (window.innerWidth > 480 && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });
}

// Регистрация Service Worker для PWA
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker зарегистрирован:', registration.scope);
        
        // Проверка обновлений
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Обнаружено обновление Service Worker');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Новый Service Worker установлен, показать уведомление
              showUpdateNotification();
            }
          });
        });
      })
      .catch(error => {
        console.log('Ошибка регистрации Service Worker:', error);
      });
  }
}

// Показать уведомление об обновлении
function showUpdateNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Доступно обновление!', {
      body: 'Нажмите, чтобы обновить страницу',
      icon: 'images/logo.png'
    });
  }
}

// Запрос разрешения на уведомления
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('Разрешение на уведомления:', permission);
    });
  }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  initLazyLoading();
  preloadCriticalImages();
  initReveal();
  initMobileMenu();
  
  // Загрузка оптимизаций
  if (typeof optimize !== 'undefined') {
    optimize.initOptimizations();
  }
  
  // Регистрация Service Worker
  registerServiceWorker();
  
  // Запрос разрешения на уведомления
  requestNotificationPermission();
});