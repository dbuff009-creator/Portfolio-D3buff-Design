// Скрипт для оптимизации производительности сайта

// Оптимизация загрузки изображений
function optimizeImageLoading() {
  // Предзагрузка критических изображений
  const criticalImages = [
    'images/Xorek.png',
    'images/Cursor.png',
    'images/gif.gif'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
  
  // Ленивая загрузка для всех изображений
  const images = document.querySelectorAll('img[data-src]');
  
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
      rootMargin: '100px 0px',
      threshold: 0.01
    });
    
    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback для старых браузеров
    images.forEach(img => {
      img.src = img.dataset.src;
      img.classList.add('loaded');
    });
  }
}

// Оптимизация анимаций
function optimizeAnimations() {
  // Отключаем анимации при сниженном движении
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition', '0s');
  }
  
  // Оптимизация requestAnimationFrame
  let lastScrollTime = 0;
  window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastScrollTime > 16) { // ~60fps
      lastScrollTime = now;
      updateScrollEffects();
    }
  });
}

function updateScrollEffects() {
  // Обновление эффектов при скролле
  const scrollY = window.scrollY;
  const header = document.querySelector('.header');
  
  if (header) {
    header.classList.toggle('scrolled', scrollY > 20);
  }
  
  // Параллакс эффект для хорька
  const ferret = document.querySelector('.ferret-img');
  if (ferret) {
    const speed = 0.3;
    const yOffset = scrollY * speed;
    ferret.style.transform = `scale(1.1) translateY(${20 + yOffset}px)`;
  }
}

// Оптимизация памяти
function optimizeMemory() {
  // Очистка ненужных слушателей событий
  window.addEventListener('beforeunload', () => {
    // Освобождаем ресурсы перед уходом со страницы
    const observers = [];
    observers.forEach(observer => observer.disconnect());
  });
  
  // Дебаунс для resize событий
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateResponsiveElements();
    }, 150);
  });
}

function updateResponsiveElements() {
  // Обновление элементов при изменении размера окна
  const width = window.innerWidth;
  
  // Адаптация masonry grid
  const masonry = document.querySelector('.masonry');
  if (masonry) {
    if (width < 480) {
      masonry.style.columns = '1 100%';
    } else if (width < 768) {
      masonry.style.columns = '2 160px';
    } else if (width < 900) {
      masonry.style.columns = '3 200px';
    } else {
      masonry.style.columns = '4 280px';
    }
  }
}

// Инициализация всех оптимизаций
function initOptimizations() {
  optimizeImageLoading();
  optimizeAnimations();
  optimizeMemory();
  updateResponsiveElements();
  
  // Отслеживание производительности
  if ('performance' in window) {
    const perfObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`[Performance] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
      });
    });
    
    perfObserver.observe({ entryTypes: ['measure', 'paint', 'largest-contentful-paint'] });
  }
}

// Запуск при полной загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOptimizations);
} else {
  initOptimizations();
}

// Экспорт функций для использования в основном скрипте
window.optimize = {
  initOptimizations,
  optimizeImageLoading,
  optimizeAnimations,
  optimizeMemory
};