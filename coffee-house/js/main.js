/**
 * Кофейня «Зерно и Пар» — Основной интерактивный скрипт
 * Включает:
 * - Уплотнение шапки при скролле
 * - Мобильное меню (бургер, a11y, trap focus)
 * - Динамический статус работы кофейни
 * - WAI-ARIA табы меню с клавиатурной навигацией
 * - Полноэкранный лайтбокс галереи (Esc, стрелки, свайпы)
 * - Слайдер отзывов с touch-свайпами и точками
 * - Плавную маску телефона и валидацию формы бронирования
 * - IntersectionObserver анимацию появления секций
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. Шапка: уплотнение при скролле
     ========================================================================== */
  const header = document.getElementById('header');
  
  const handleScrollHeader = () => {
    if (!header) return;
    if (window.scrollY > 30) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScrollHeader, { passive: true });
  handleScrollHeader();

  /* ==========================================================================
     2. Мобильное выезжающее меню
     ========================================================================== */
  const burgerBtn = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav__link, .mobile-menu__cta');

  const openMobileMenu = () => {
    if (!mobileMenu || !burgerBtn) return;
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    mobileMenuClose?.focus();
  };

  const closeMobileMenu = () => {
    if (!mobileMenu || !burgerBtn) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    burgerBtn.focus();
  };

  burgerBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu?.classList.contains('is-open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileMenuClose?.addEventListener('click', closeMobileMenu);
  mobileMenuBackdrop?.addEventListener('click', closeMobileMenu);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  /* ==========================================================================
     3. Динамический статус работы кофейни (Hero)
     ========================================================================== */
  const updateOpeningStatus = () => {
    const statusTextEl = document.getElementById('status-text');
    const statusIndicator = document.getElementById('status-indicator');
    if (!statusTextEl || !statusIndicator) return;

    const now = new Date();
    const day = now.getDay(); // 0 - Вс, 6 - Сб, 1-5 - Пн-Пт
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;

    // График работы:
    // Пн-Пт: 08:00 - 22:00
    // Сб-Вс: 09:00 - 23:00
    const isWeekend = day === 0 || day === 6;
    const openMinutes = isWeekend ? 9 * 60 : 8 * 60;
    const closeMinutes = isWeekend ? 23 * 60 : 22 * 60;
    const closeHourStr = isWeekend ? '23:00' : '22:00';
    const openHourStr = isWeekend ? '09:00' : '08:00';

    if (currentTimeInMinutes >= openMinutes && currentTimeInMinutes < closeMinutes) {
      statusIndicator.classList.remove('is-closed');
      statusTextEl.textContent = `Открыты сегодня до ${closeHourStr}`;
    } else if (currentTimeInMinutes < openMinutes) {
      statusIndicator.classList.remove('is-closed');
      statusTextEl.textContent = `Откроемся сегодня в ${openHourStr}`;
    } else {
      statusIndicator.classList.add('is-closed');
      // Завтрашний день:
      const nextDayIsWeekend = (day === 5 || day === 6);
      const nextOpenHour = nextDayIsWeekend ? '09:00' : '08:00';
      statusTextEl.textContent = `Сейчас закрыты · Откроемся завтра в ${nextOpenHour}`;
    }
  };

  updateOpeningStatus();
  // Обновляем статус каждые 5 минут
  setInterval(updateOpeningStatus, 300000);

  /* ==========================================================================
     4. Меню: Доступные табы (WAI-ARIA + стрелки клавиатуры)
     ========================================================================== */
  const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
  const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));

  const activateTab = (selectedTab) => {
    const targetPanelId = selectedTab.getAttribute('aria-controls');

    tabButtons.forEach(btn => {
      const isSelected = btn === selectedTab;
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      btn.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    tabPanels.forEach(panel => {
      if (panel.id === targetPanelId) {
        panel.hidden = false;
        panel.classList.add('is-active');
      } else {
        panel.hidden = true;
        panel.classList.remove('is-active');
      }
    });
  };

  tabButtons.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));

    tab.addEventListener('keydown', (e) => {
      let targetIndex = null;

      if (e.key === 'ArrowRight') {
        targetIndex = (index + 1) % tabButtons.length;
      } else if (e.key === 'ArrowLeft') {
        targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (e.key === 'Home') {
        targetIndex = 0;
      } else if (e.key === 'End') {
        targetIndex = tabButtons.length - 1;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        const newTab = tabButtons[targetIndex];
        newTab.focus();
        activateTab(newTab);
      }
    });
  });

  /* ==========================================================================
     5. Галерея: Полноэкранный Лайтбокс
     ========================================================================== */
  const galleryItems = [
    {
      src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=85&auto=format&fit=crop',
      alt: 'Уголок кофейни со свежезаваренными напитками в керамике',
      caption: 'Утренняя атмосфера кофейни на Муштари'
    },
    {
      src: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1400&q=85&auto=format&fit=crop',
      alt: 'Приготовление фильтр-кофе через воронку V60 в стеклянный сервер',
      caption: 'Ручной пролив моносорта через воронку V60'
    },
    {
      src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1400&q=85&auto=format&fit=crop',
      alt: 'Уютный столик у окна с тёплым дневным светом',
      caption: 'Столики у окон с мягким дневным светом'
    },
    {
      src: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=1400&q=85&auto=format&fit=crop',
      alt: 'Вливание шелковистого молока в эспрессо с рисунком латте-арт',
      caption: 'Авторский латте-арт и шелковистая молочная пена'
    },
    {
      src: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=1400&q=85&auto=format&fit=crop',
      alt: 'Свежеиспечённые золотистые круассаны и чашка кофе',
      caption: 'Свежевыпеченные миндальные круассаны каждое утро'
    },
    {
      src: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1400&q=85&auto=format&fit=crop',
      alt: 'Россыпь ароматных обжаренных зёрен спешелти арабики',
      caption: 'Зёрна спешелти арабики свежей обжарки'
    }
  ];

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const galleryBtns = document.querySelectorAll('.gallery__btn');

  let currentGalleryIndex = 0;
  let lastActiveGalleryBtn = null;

  const showLightboxImage = (index) => {
    currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentGalleryIndex];
    if (lightboxImg && lightboxCaption) {
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
      lightboxCaption.textContent = item.caption;
    }
  };

  const openLightbox = (index, triggerElement) => {
    if (!lightbox) return;
    lastActiveGalleryBtn = triggerElement;
    showLightboxImage(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastActiveGalleryBtn) {
      lastActiveGalleryBtn.focus();
    }
  };

  galleryBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      openLightbox(index, btn);
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxBackdrop?.addEventListener('click', closeLightbox);

  lightboxPrev?.addEventListener('click', () => {
    showLightboxImage(currentGalleryIndex - 1);
  });

  lightboxNext?.addEventListener('click', () => {
    showLightboxImage(currentGalleryIndex + 1);
  });

  /* ==========================================================================
     6. Отзывы: Слайдер с поддержкой touch-свайпа
     ========================================================================== */
  const track = document.getElementById('reviews-track');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const dotsContainer = document.getElementById('slider-dots');
  const reviewCards = Array.from(document.querySelectorAll('.review-card'));

  let currentSlide = 0;
  const totalSlides = reviewCards.length;

  // Создаем точки-индикаторы
  if (dotsContainer && totalSlides > 0) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `slider-dot ${i === 0 ? 'is-active' : ''}`;
      dot.setAttribute('aria-label', `Перейти к отзыву ${i + 1}`);
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  const updateDots = (index) => {
    const dots = dotsContainer?.querySelectorAll('.slider-dot');
    dots?.forEach((dot, i) => {
      const isActive = i === index;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  };

  const goToSlide = (index) => {
    if (!track) return;
    currentSlide = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateDots(currentSlide);
  };

  prevBtn?.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn?.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Touch-свайпы для мобильных устройств
  let touchStartX = 0;
  let touchEndX = 0;
  const swipeThreshold = 40;

  track?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        goToSlide(currentSlide + 1);
      } else {
        goToSlide(currentSlide - 1);
      }
    }
  }, { passive: true });

  /* ==========================================================================
     7. Карта: Заглушка до загрузки iframe
     ========================================================================== */
  const mapIframe = document.getElementById('map-iframe');
  const mapPlaceholder = document.getElementById('map-placeholder');

  if (mapIframe && mapPlaceholder) {
    mapIframe.addEventListener('load', () => {
      mapPlaceholder.classList.add('is-hidden');
    });

    // Страховочный таймаут, если событие load уже сработало из кэша
    setTimeout(() => {
      mapPlaceholder.classList.add('is-hidden');
    }, 2500);
  }

  /* ==========================================================================
     8. Форма бронирования: Маска телефона и валидация
     ========================================================================== */
  const bookingForm = document.getElementById('booking-form');
  const phoneInput = document.getElementById('book-phone');
  const dateInput = document.getElementById('book-date');
  const nameInput = document.getElementById('book-name');
  const timeInput = document.getElementById('book-time');
  const guestsInput = document.getElementById('book-guests');
  const commentInput = document.getElementById('book-comment');
  const consentCheckbox = document.getElementById('book-consent');
  const consentError = document.getElementById('err-book-consent');
  const bookingSuccess = document.getElementById('booking-success');
  const bookingSummaryCard = document.getElementById('booking-summary-card');
  const resetBookingBtn = document.getElementById('reset-booking-btn');

  consentCheckbox?.addEventListener('change', () => {
    if (consentCheckbox.checked && consentError) {
      consentError.textContent = '';
    }
  });

  // Установка минимальной даты (сегодня)
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  // Маска телефона РФ: +7 (___) ___-__-__
  if (phoneInput) {
    const formatPhoneNumber = (value) => {
      // Оставляем только цифры
      let digits = value.replace(/\D/g, '');
      
      // Если начинается с 8 или 7 — нормализуем
      if (digits.startsWith('8') || digits.startsWith('7')) {
        digits = digits.slice(1);
      }

      // Ограничиваем 10 цифрами (без кода страны)
      digits = digits.substring(0, 10);

      let formatted = '+7 (';
      if (digits.length > 0) {
        formatted += digits.substring(0, 3);
      }
      if (digits.length >= 3) {
        formatted += ') ' + digits.substring(3, 6);
      }
      if (digits.length >= 6) {
        formatted += '-' + digits.substring(6, 8);
      }
      if (digits.length >= 8) {
        formatted += '-' + digits.substring(8, 10);
      }

      return formatted;
    };

    phoneInput.addEventListener('input', (e) => {
      const input = e.target;
      const rawValue = input.value;
      const digitsOnly = rawValue.replace(/\D/g, '');
      
      if (digitsOnly.length === 0) {
        input.value = '';
        return;
      }

      input.value = formatPhoneNumber(rawValue);
      clearFieldError(input);
    });

    phoneInput.addEventListener('focus', (e) => {
      if (!e.target.value) {
        e.target.value = '+7 (';
      }
    });

    phoneInput.addEventListener('blur', (e) => {
      if (e.target.value === '+7 (' || e.target.value === '+7') {
        e.target.value = '';
      }
    });
  }

  const setFieldError = (input, message) => {
    input.classList.add('has-error');
    const errorEl = document.getElementById(`err-${input.id}`);
    if (errorEl) {
      errorEl.textContent = message;
    }
  };

  const clearFieldError = (input) => {
    input.classList.remove('has-error');
    const errorEl = document.getElementById(`err-${input.id}`);
    if (errorEl) {
      errorEl.textContent = '';
    }
  };

  [nameInput, dateInput, timeInput, guestsInput].forEach(field => {
    field?.addEventListener('input', () => clearFieldError(field));
    field?.addEventListener('change', () => clearFieldError(field));
  });

  const validateBookingForm = () => {
    let isValid = true;

    // Имя
    if (nameInput) {
      const nameVal = nameInput.value.trim();
      if (!nameVal || nameVal.length < 2) {
        setFieldError(nameInput, 'Пожалуйста, введите ваше имя (не менее 2 символов)');
        isValid = false;
      } else {
        clearFieldError(nameInput);
      }
    }

    // Телефон
    if (phoneInput) {
      const digits = phoneInput.value.replace(/\D/g, '');
      if (digits.length < 11) {
        setFieldError(phoneInput, 'Введите полный номер телефона: +7 (900) 000-00-00');
        isValid = false;
      } else {
        clearFieldError(phoneInput);
      }
    }

    // Дата
    if (dateInput) {
      if (!dateInput.value) {
        setFieldError(dateInput, 'Выберите дату посещения');
        isValid = false;
      } else {
        clearFieldError(dateInput);
      }
    }

    // Время
    if (timeInput) {
      if (!timeInput.value) {
        setFieldError(timeInput, 'Выберите удобное время');
        isValid = false;
      } else {
        clearFieldError(timeInput);
      }
    }

    // Гости
    if (guestsInput) {
      if (!guestsInput.value) {
        setFieldError(guestsInput, 'Укажите количество гостей');
        isValid = false;
      } else {
        clearFieldError(guestsInput);
      }
    }

    // Согласие на обработку персональных данных (152-ФЗ)
    if (consentCheckbox) {
      if (!consentCheckbox.checked) {
        if (consentError) {
          consentError.textContent = 'Требуется согласие на обработку персональных данных';
        }
        isValid = false;
      } else {
        if (consentError) {
          consentError.textContent = '';
        }
      }
    }

    return isValid;
  };

  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateBookingForm()) {
      return;
    }

    // Формируем красивую карточку брони
    const guestWord = (num) => {
      const n = parseInt(num, 10);
      if (n === 1) return 'гость';
      if (n >= 2 && n <= 4) return 'гостя';
      return 'гостей';
    };

    const formattedDate = dateInput?.value
      ? new Date(dateInput.value).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : '';

    if (bookingSummaryCard) {
      bookingSummaryCard.innerHTML = `
        <div class="booking-summary-row">
          <span class="booking-summary-label">Гость:</span>
          <span class="booking-summary-val">${nameInput?.value.trim()}</span>
        </div>
        <div class="booking-summary-row">
          <span class="booking-summary-label">Телефон:</span>
          <span class="booking-summary-val">${phoneInput?.value}</span>
        </div>
        <div class="booking-summary-row">
          <span class="booking-summary-label">Дата и время:</span>
          <span class="booking-summary-val">${formattedDate}, в ${timeInput?.value}</span>
        </div>
        <div class="booking-summary-row">
          <span class="booking-summary-label">Количество персон:</span>
          <span class="booking-summary-val">${guestsInput?.value} ${guestWord(guestsInput?.value)}</span>
        </div>
        ${commentInput?.value.trim() ? `
        <div class="booking-summary-row">
          <span class="booking-summary-label">Пожелания:</span>
          <span class="booking-summary-val">${commentInput.value.trim()}</span>
        </div>` : ''}
      `;
    }

    // Показываем экран успеха
    bookingForm.hidden = true;
    if (bookingSuccess) {
      bookingSuccess.hidden = false;
      bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  resetBookingBtn?.addEventListener('click', () => {
    bookingForm?.reset();
    if (bookingSuccess) bookingSuccess.hidden = true;
    if (bookingForm) bookingForm.hidden = false;

    // Снова проставляем сегодняшнюю дату
    if (dateInput) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
  });

  /* ==========================================================================
     9. Глобальные события клавиатуры (Esc, стрелки для лайтбокса)
     ========================================================================== */
  document.addEventListener('keydown', (e) => {
    // Закрытие мобильного меню по Esc
    if (e.key === 'Escape') {
      if (mobileMenu?.classList.contains('is-open')) {
        closeMobileMenu();
      }
      if (lightbox && !lightbox.hidden) {
        closeLightbox();
      }
    }

    // Листание лайтбокса стрелками
    if (lightbox && !lightbox.hidden) {
      if (e.key === 'ArrowLeft') {
        showLightboxImage(currentGalleryIndex - 1);
      } else if (e.key === 'ArrowRight') {
        showLightboxImage(currentGalleryIndex + 1);
      }
    }
  });

  /* ==========================================================================
     10. Анимация появления секций при скролле (IntersectionObserver)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Фолбек для старых браузеров
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  /* ==========================================================================
     11. Динамический текущий год в футере
     ========================================================================== */
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     12. Плашка «Демо-проект» и Cookie-баннер
     ========================================================================== */
  const initCompliance = () => {
    const demoBadge = document.getElementById('demo-badge');
    const demoCloseBtn = document.getElementById('demo-badge-close');
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAcceptBtn = document.getElementById('cookie-accept-btn');

    // Проверяем сохранённое состояние демо-плашки
    let demoHidden = false;
    try {
      demoHidden = localStorage.getItem('demo_banner_dismissed') === 'true';
    } catch (e) {}
    if (demoHidden && demoBadge) {
      demoBadge.classList.add('is-hidden');
    }

    demoCloseBtn?.addEventListener('click', () => {
      if (demoBadge) demoBadge.classList.add('is-hidden');
      try {
        localStorage.setItem('demo_banner_dismissed', 'true');
      } catch (e) {}
    });

    // Проверяем согласие с cookie
    let cookieAccepted = false;
    try {
      cookieAccepted = localStorage.getItem('cookie_accepted') === 'true';
    } catch (e) {}

    if (!cookieAccepted && cookieBanner) {
      cookieBanner.hidden = false;
      document.body.classList.add('has-cookie');
    }

    cookieAcceptBtn?.addEventListener('click', () => {
      if (cookieBanner) cookieBanner.hidden = true;
      document.body.classList.remove('has-cookie');
      try {
        localStorage.setItem('cookie_accepted', 'true');
      } catch (e) {}
    });
  };

  initCompliance();
});

// Высота cookie-баннера в CSS-переменную --cookie-h, чтобы плашка «Демо» не пряталась под ним
(function () {
  var banner = document.querySelector('.cookie-banner');
  if (!banner) return;
  var sync = function () {
    document.documentElement.style.setProperty('--cookie-h', banner.offsetHeight + 'px');
  };
  sync();
  if ('ResizeObserver' in window) new ResizeObserver(sync).observe(banner);
  window.addEventListener('resize', sync);
})();
