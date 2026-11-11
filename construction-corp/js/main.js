/**
 * СтройВектор — Скрипты взаимодействия
 * Чистый ES6+, без сторонних библиотек, совместим с node --check
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeroSlider();
  initStatsCounters();
  initProjectsFilterAndModal();
  initServicesScrollSpy();
  initVacanciesAccordion();
  initFormsAndValidation();
  initCompliance();
});

/* ==========================================================================
   1. Мобильная навигация
   ========================================================================== */
function initMobileNav() {
  const burgerBtn = document.querySelector('.burger-btn');
  const closeBtn = document.querySelector('.mobile-nav__close');
  const mobileNav = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.mobile-nav__overlay');

  if (!burgerBtn || !mobileNav || !overlay) return;

  function openMenu() {
    mobileNav.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    burgerBtn.setAttribute('aria-expanded', 'true');
    if (closeBtn) closeBtn.focus();
  }

  function closeMenu() {
    mobileNav.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    burgerBtn.setAttribute('aria-expanded', 'false');
    burgerBtn.focus();
  }

  burgerBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

/* ==========================================================================
   2. Hero Слайдер (Главная)
   ========================================================================== */
function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const prevBtn = document.querySelector('.hero-arrow-btn--prev');
  const nextBtn = document.querySelector('.hero-arrow-btn--next');
  const currentCounter = document.querySelector('.hero-counter__current');
  const totalCounter = document.querySelector('.hero-counter__total');

  if (!slides.length) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const autoplayInterval = 6000;

  if (totalCounter) {
    totalCounter.textContent = String(slides.length).padStart(2, '0');
  }

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
      slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });

    if (currentCounter) {
      currentCounter.textContent = String(index + 1).padStart(2, '0');
    }

    currentIndex = index;
  }

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  function prevSlide() {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });
  }

  function startAutoplay() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, autoplayInterval);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);
  slider.addEventListener('focusin', stopAutoplay);
  slider.addEventListener('focusout', startAutoplay);

  // Клавиатура (влево / вправо)
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
      resetAutoplay();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      resetAutoplay();
    }
  });

  showSlide(0);
  startAutoplay();
}

/* ==========================================================================
   3. Анимированные счетчики цифр компании
   ========================================================================== */
function initStatsCounters() {
  const statItems = document.querySelectorAll('.stat-item__number[data-target]');
  if (!statItems.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

        if (reducedMotion) {
          el.innerHTML = `${prefix}${formatNumber(target, decimals)}<span>${suffix}</span>`;
          obs.unobserve(el);
          return;
        }

        animateCount(el, target, 1800, prefix, suffix, decimals);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  statItems.forEach((el) => observer.observe(el));

  function animateCount(el, target, duration, prefix, suffix, decimals) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Плавная функция easeOutQuad
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const currentVal = target * easedProgress;

      el.innerHTML = `${prefix}${formatNumber(currentVal, decimals)}<span>${suffix}</span>`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.innerHTML = `${prefix}${formatNumber(target, decimals)}<span>${suffix}</span>`;
      }
    };
    window.requestAnimationFrame(step);
  }

  function formatNumber(num, decimals) {
    if (decimals > 0) {
      return num.toFixed(decimals).replace('.', ',');
    }
    return Math.floor(num).toLocaleString('ru-RU');
  }
}

/* ==========================================================================
   4. Проекты: Фильтры и Модальное окно (Projects)
   ========================================================================== */
const PROJECTS_DATA = [
  {
    id: 'proj-1',
    title: 'МФК «Норд-Плаза»',
    category: 'commercial',
    categoryName: 'Коммерческая недвижимость',
    year: '2024',
    location: 'г. Москва, СВАО, ул. Полярная',
    area: '142 000 м²',
    timeline: '28 месяцев',
    floors: '32 этажа',
    contractType: 'Генеральный подряд (EPC-контракт)',
    volume: '54 000 м³ монолита, 6 200 т металлоконструкций',
    description: 'Строительство современного многофункционального делового комплекса класса А+ с подземным трехуровневым паркингом на 850 машиномест, вертолетной площадкой, панорамным остеклением и энергоэффективными инженерными системами стандарта LEED Gold.',
    scope: [
      'Полный цикл генерального подряда от нулевого цикла до сдачи госкомиссии',
      'Возведение монолитного железобетонного каркаса башни высотой 138 метров',
      'Монтаж модульного светопрозрачного фасада Schuco (28 000 м²)',
      'Устройство централизованной системы вентиляции, кондиционирования и BMS',
      'Благоустройство общественной территории и пешеходного сквера'
    ],
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'proj-2',
    title: 'ЖК «Серебряный Бор»',
    category: 'residential',
    categoryName: 'Жилое строительство',
    year: '2024',
    location: 'г. Москва, СЗАО, наб. Новикова-Прибоя',
    area: '210 000 м²',
    timeline: '34 месяца',
    floors: '4 корпуса по 24 этажа',
    contractType: 'Генеральный подряд под ключ',
    volume: '82 000 м³ монолита, 1 450 квартир',
    description: 'Жилой квартал бизнес-класса на берегу Москвы-реки. Комплекс включает четыре жилых корпуса с двухуровневым стилобатом, встроенно-пристроенный детский сад на 180 мест, фитнес-центр с бассейном и благоустроенную набережную.',
    scope: [
      'Земляные работы, шпунтовое ограждение котлована и водопонижение',
      'Монолитные работы по фундаментам и надземной части 4 корпусов',
      'Облицовка вентилируемого фасада клинкерным кирпичом и терракотой',
      'Прокладка 18 км внешних инженерных коммуникаций (теплосеть, водопровод, ЭС)',
      'Чистовая отделка МОП и авторский ландшафтный дизайн закрытого двора'
    ],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=800&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'proj-3',
    title: 'Логистический хаб «Внуково-Карго»',
    category: 'industrial',
    categoryName: 'Промышленное / Логистика',
    year: '2023',
    location: 'Новая Москва, пос. Марушкинское',
    area: '85 000 м²',
    timeline: '14 месяцев',
    floors: '1 этаж (рабочая высота 14,5 м)',
    contractType: 'Генеральный подряд (Design & Build)',
    volume: '3 800 т металлоконструкций, 72 дока',
    description: 'Высокотехнологичный распределительный комплекс класса А+ с мультитемпературными зонами от -24°C до +18°C, автоматизированными мезонинными системами и кросс-докингом.',
    scope: [
      'Проектирование и согласование ПСД в органах экспертизы',
      'Монтаж металлических несущих ферм пролетом 24 метра с огнезащитой R90',
      'Устройство сверхплоских промышленных полов с полимерным топингом (нагрузка 9 т/м²)',
      'Монтаж сэндвич-панелей с PIR-утеплителем повышенной огнестойкости',
      'Пусконаладка холодильных агрегатов и резервной дизельной электростанции'
    ],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'proj-4',
    title: 'Бизнес-парк «Орион Техно»',
    category: 'commercial',
    categoryName: 'Коммерческая недвижимость',
    year: '2023',
    location: 'г. Москва, ЮАО, Варшавское шоссе',
    area: '64 000 м²',
    timeline: '18 месяцев',
    floors: '12 этажей',
    contractType: 'Генеральный подряд',
    volume: '24 000 м³ бетона, подземный паркинг 400 м/м',
    description: 'Технопарк и офисный центр для IT-компаний с коворкингами, конференц-залами и лабораторными блоками с чистыми помещениями класса чистоты ISO 7.',
    scope: [
      'Монолитный каркас с усиленными перекрытиями для тяжелого оборудования',
      'Двойной фасад с автоматизированными солнцезащитными ламелями',
      'Монтаж дата-центра уровня Tier III с гарантированным электроснабжением 4 МВт',
      'Интеллектуальная система управления освещением DALI и климатом VRF'
    ],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'proj-5',
    title: 'Квартал таунхаусов «Речной Берег»',
    category: 'residential',
    categoryName: 'Жилое строительство',
    year: '2023',
    location: 'Московская область, г.о. Красногорск',
    area: '115 000 м²',
    timeline: '26 месяцев',
    floors: '3 корпуса по 19 этажей + 24 таунхауса',
    contractType: 'Генеральный подряд',
    volume: '46 000 м³ монолита, 820 квартир',
    description: 'Малоэтажно-среднеэтажный жилой квартал с развитой социальной инфраструктурой: общеобразовательная школа на 550 учащихся, благоустроенная парковая зона с водоемом.',
    scope: [
      'Комплексное освоение территории площадью 14 га',
      'Строительство монолитных домов с вентилируемыми керамогранитными фасадами',
      'Возведение здания муниципальной школы с 2 спортзалами и футбольным полем',
      'Строительство очистных сооружений ливневого стока и локальной котельной'
    ],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'proj-6',
    title: 'Фармацевтический комплекс «БиоГен»',
    category: 'industrial',
    categoryName: 'Промышленное / Логистика',
    year: '2022',
    location: 'Московская область, ОЭЗ «Дубна»',
    area: '38 000 м²',
    timeline: '20 месяцев',
    floors: '4 этажа + блок чистых комнат',
    contractType: 'Генеральный подряд по стандарту GMP',
    volume: 'Специальные антистатические полы, чистые зоны класса А/B',
    description: 'Современный высокотехнологичный производственно-исследовательский комплекс по выпуску лекарственных препаратов. Реализован по жестким международным стандартам надлежащей производственной практики (GMP).',
    scope: [
      'Устройство герметичного ограждающего контура чистых помещений',
      'Монтаж прецизионной системы подготовки и фильтрации воздуха HEPA H14',
      'Технологические трубопроводы для инъекционной воды и чистых газов',
      'Инженерное сопровождение валидации чистых помещений и оборудования'
    ],
    images: [
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'proj-7',
    title: 'ТРК «Гранд Молл»',
    category: 'commercial',
    categoryName: 'Коммерческая недвижимость',
    year: '2022',
    location: 'г. Москва, ЗАО, Мичуринский проспект',
    area: '92 000 м²',
    timeline: '22 месяца',
    floors: '4 этажа + 2 подземных',
    contractType: 'Генеральный подряд',
    volume: 'Стеклянный атриум 3 200 м², паркинг 1 100 м/м',
    description: 'Региональный торгово-развлекательный центр с многозальным кинотеатром, фуд-холлом, ледовым катком и эксплуатируемой зеленой кровлей.',
    scope: [
      'Монтаж пространственных металлоконструкций купольного светового фонаря',
      'Монтаж 18 эскалаторов, 12 панорамных и грузовых лифтов Otis',
      'Системы водяного пожаротушения, дымоудаления и автоматической сигнализации',
      'Индивидуальный дизайн и отделка общих зон галерей и входных групп'
    ],
    images: [
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'proj-8',
    title: 'ЖК «Парк Резиденс»',
    category: 'residential',
    categoryName: 'Жилое строительство',
    year: '2021',
    location: 'г. Москва, САО, Ленинградский проспект',
    area: '78 000 м²',
    timeline: '24 месяца',
    floors: '2 башни по 25 этажей',
    contractType: 'Генеральный подряд',
    volume: '29 000 м³ монолитного железобетона',
    description: 'Премиальный жилой комплекс с авторской архитектурой, закрытой охраняемой территорией, подземным паркингом и фитнес-клубом для жильцов.',
    scope: [
      'Возведение башен в стесненных условиях плотной городской застройки',
      'Облицовка натуральным камнем (доломит) и ювелирной латунью',
      'Бесшумные скоростные лифты с индивидуальным доступом на этажи',
      'Сдача объекта инспекции государственного строительного надзора с первого предъявления'
    ],
    images: [
      'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536895058696-a69b1c7ba34f?w=800&q=80&auto=format&fit=crop'
    ]
  },
  {
    id: 'proj-9',
    title: 'РЦ «Евразия Логистик»',
    category: 'industrial',
    categoryName: 'Промышленное / Логистика',
    year: '2021',
    location: 'Московская область, г. Подольск',
    area: '120 000 м²',
    timeline: '16 месяцев',
    floors: '1 этаж (рабочая высота 12,8 м)',
    contractType: 'Генеральный подряд под ключ',
    volume: '110 перегрузочных рамп, железнодорожный тупик',
    description: 'Один из крупнейших мультимодальных складских комплексов в Южном секторе Подмосковья с прямым примыканием к железнодорожной ветке.',
    scope: [
      'Реконструкция и укладка 2,4 км железнодорожных путей необщего пользования',
      'Возведение каркаса из сборных железобетонных колонн и стальных ферм',
      'Монтаж промышленного освещения LED с датчиками присутствия и учетом DALI',
      'Строительство административно-бытового корпуса на 350 рабочих мест'
    ],
    images: [
      'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541971875076-8f970d573be6?w=800&q=80&auto=format&fit=crop'
    ]
  }
];

function initProjectsFilterAndModal() {
  const filterBtns = document.querySelectorAll('.filter-btn[data-category]');
  const yearSelect = document.querySelector('#project-year-filter');
  const projectCards = document.querySelectorAll('.project-card[data-id]');
  const emptyMsg = document.querySelector('.projects-empty-msg');
  const modalBackdrop = document.querySelector('.modal-backdrop');

  let activeCategory = 'all';
  let activeYear = 'all';

  function applyFilters() {
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const cardCat = card.getAttribute('data-category');
      const cardYear = card.getAttribute('data-year');

      const matchesCat = activeCategory === 'all' || cardCat === activeCategory;
      const matchesYear = activeYear === 'all' || cardYear === activeYear;

      if (matchesCat && matchesYear) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyMsg) {
      emptyMsg.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeCategory = btn.getAttribute('data-category');
      applyFilters();
    });
  });

  if (yearSelect) {
    yearSelect.addEventListener('change', () => {
      activeYear = yearSelect.value;
      applyFilters();
    });
  }

  // Модальное окно
  if (!modalBackdrop) return;

  const modalBox = modalBackdrop.querySelector('.modal-box');
  const closeBtn = modalBackdrop.querySelector('.modal-close-btn');
  let lastActiveElement = null;

  function openProjectModal(projectId) {
    const data = PROJECTS_DATA.find((p) => p.id === projectId);
    if (!data) return;

    lastActiveElement = document.activeElement;

    // Заполнение полей модального окна
    const mainImg = modalBackdrop.querySelector('.modal-gallery__img');
    const thumbsContainer = modalBackdrop.querySelector('.modal-gallery__thumbs');
    const titleEl = modalBackdrop.querySelector('.modal-title');
    const badgeCategory = modalBackdrop.querySelector('.modal-badge-category');
    const badgeYear = modalBackdrop.querySelector('.modal-badge-year');
    const locationEl = modalBackdrop.querySelector('.modal-location-text');
    const specArea = modalBackdrop.querySelector('.modal-spec-area');
    const specTimeline = modalBackdrop.querySelector('.modal-spec-timeline');
    const specFloors = modalBackdrop.querySelector('.modal-spec-floors');
    const specContract = modalBackdrop.querySelector('.modal-spec-contract');
    const specVolume = modalBackdrop.querySelector('.modal-spec-volume');
    const descText = modalBackdrop.querySelector('.modal-desc-text');
    const scopeList = modalBackdrop.querySelector('.modal-scope-list');

    if (mainImg) {
      mainImg.src = data.images[0];
      mainImg.alt = data.title;
    }

    if (thumbsContainer) {
      thumbsContainer.innerHTML = '';
      data.images.forEach((imgUrl, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.className = `modal-thumb ${idx === 0 ? 'is-active' : ''}`;
        thumbBtn.setAttribute('type', 'button');
        thumbBtn.setAttribute('aria-label', `Фото ${idx + 1}`);
        thumbBtn.innerHTML = `<img src="${imgUrl}" alt="${data.title} фото ${idx + 1}" loading="lazy">`;
        thumbBtn.addEventListener('click', () => {
          thumbsContainer.querySelectorAll('.modal-thumb').forEach((t) => t.classList.remove('is-active'));
          thumbBtn.classList.add('is-active');
          if (mainImg) mainImg.src = imgUrl;
        });
        thumbsContainer.appendChild(thumbBtn);
      });
    }

    if (titleEl) titleEl.textContent = data.title;
    if (badgeCategory) badgeCategory.textContent = data.categoryName;
    if (badgeYear) badgeYear.textContent = data.year;
    if (locationEl) locationEl.textContent = data.location;
    if (specArea) specArea.textContent = data.area;
    if (specTimeline) specTimeline.textContent = data.timeline;
    if (specFloors) specFloors.textContent = data.floors;
    if (specContract) specContract.textContent = data.contractType;
    if (specVolume) specVolume.textContent = data.volume;
    if (descText) descText.textContent = data.description;

    if (scopeList) {
      scopeList.innerHTML = '';
      data.scope.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        scopeList.appendChild(li);
      });
    }

    modalBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeProjectModal() {
    modalBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastActiveElement) lastActiveElement.focus();
  }

  // Слушатели открытия
  projectCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // Игнорируем клик, если нажата внешняя ссылка внутри
      if (e.target.closest('a')) return;
      const id = card.getAttribute('data-id');
      if (id) openProjectModal(id);
    });

    const openBtn = card.querySelector('.project-card__btn');
    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = card.getAttribute('data-id');
        if (id) openProjectModal(id);
      });
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeProjectModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeProjectModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
      closeProjectModal();
    }
  });
}

/* ==========================================================================
   5. Страница Услуги: ScrollSpy для бокового меню
   ========================================================================== */
function initServicesScrollSpy() {
  const sidebarLinks = document.querySelectorAll('.services-nav__link');
  const serviceSections = document.querySelectorAll('.service-item[id]');

  if (!sidebarLinks.length || !serviceSections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        sidebarLinks.forEach((link) => {
          const href = link.getAttribute('href');
          const isActive = href === `#${id}`;
          link.classList.toggle('is-active', isActive);
          if (isActive) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px'
  });

  serviceSections.forEach((sec) => observer.observe(sec));
}

/* ==========================================================================
   6. Страница О компании: Аккордеон вакансий
   ========================================================================== */
function initVacanciesAccordion() {
  const vacancyItems = document.querySelectorAll('.vacancy-item');
  if (!vacancyItems.length) return;

  vacancyItems.forEach((item) => {
    const header = item.querySelector('.vacancy-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Закрываем остальные для чистоты интерфейса
      vacancyItems.forEach((other) => {
        other.classList.remove('is-open');
        const otherHeader = other.querySelector('.vacancy-header');
        if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   7. Формы, маска телефона, валидация и загрузка файлов
   ========================================================================== */
function initFormsAndValidation() {
  // Маска ввода телефона
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach((input) => {
    input.addEventListener('input', (e) => onPhoneInput(e, input));
    input.addEventListener('keydown', (e) => onPhoneKeyDown(e, input));
    input.addEventListener('paste', (e) => onPhonePaste(e, input));
  });

  // Загрузка файлов
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach((input) => {
    const box = input.closest('.file-upload-box');
    if (!box) return;
    const nameDisplay = box.querySelector('.file-name-display');

    input.addEventListener('change', () => {
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        if (nameDisplay) {
          nameDisplay.textContent = `${file.name} (${sizeMb} МБ)`;
          nameDisplay.style.color = 'var(--accent)';
        }
      } else {
        if (nameDisplay) {
          nameDisplay.textContent = 'Файл не выбран';
          nameDisplay.style.color = '';
        }
      }
    });
  });

  // Обработка отправки форм
  const forms = document.querySelectorAll('form.js-validate-form');
  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm(form)) {
        showSuccessState(form);
      }
    });

    // Очистка ошибок при вводе
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('input', () => clearFieldError(field));
      field.addEventListener('change', () => clearFieldError(field));
    });
  });

  function validateForm(form) {
    let isValid = true;

    // Имя
    const nameField = form.querySelector('[name="client_name"]');
    if (nameField) {
      if (!nameField.value.trim() || nameField.value.trim().length < 2) {
        showFieldError(nameField, 'Пожалуйста, введите ваше имя (не менее 2 символов)');
        isValid = false;
      }
    }

    // Телефон
    const phoneField = form.querySelector('input[type="tel"]');
    if (phoneField) {
      const digits = phoneField.value.replace(/\D/g, '');
      if (digits.length < 11) {
        showFieldError(phoneField, 'Введите корректный номер телефона (11 цифр)');
        isValid = false;
      }
    }

    // Email (если указан)
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.hasAttribute('required')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value.trim())) {
        showFieldError(emailField, 'Введите корректный e-mail адрес');
        isValid = false;
      }
    }

    // Тип объекта (если есть селект)
    const objectTypeField = form.querySelector('[name="object_type"]');
    if (objectTypeField && objectTypeField.hasAttribute('required')) {
      if (!objectTypeField.value) {
        showFieldError(objectTypeField, 'Выберите тип строительного объекта');
        isValid = false;
      }
    }

    // Согласие с политикой
    const consentCheck = form.querySelector('input[type="checkbox"][name="consent"]');
    if (consentCheck) {
      if (!consentCheck.checked) {
        const group = consentCheck.closest('.form-group') || consentCheck.parentElement;
        group.classList.add('has-error');
        isValid = false;
      }
    }

    return isValid;
  }

  function showFieldError(field, message) {
    const group = field.closest('.form-group');
    if (!group) return;
    field.classList.add('is-error');
    group.classList.add('has-error');
    const errEl = group.querySelector('.form-error');
    if (errEl) {
      errEl.textContent = message;
    }
  }

  function clearFieldError(field) {
    field.classList.remove('is-error');
    const group = field.closest('.form-group') || field.parentElement;
    if (group) {
      group.classList.remove('has-error');
    }
  }

  function showSuccessState(form) {
    const banner = form.querySelector('.form-success-banner');
    const formFields = form.querySelector('.form-fields-wrapper');

    if (banner) {
      if (formFields) formFields.style.display = 'none';
      banner.classList.add('is-visible');
    } else {
      // Если баннера внутри формы нет, очищаем и показываем сообщение
      form.reset();
      alert('Заявка успешно отправлена! Наш инженер свяжется с вами в течение 24 часов.');
    }
  }
}

/* Вспомогательные функции маски телефона */
function getPhoneNumbersValue(input) {
  return input.value.replace(/\D/g, '');
}

function onPhoneInput(e, input) {
  let inputNumbersValue = getPhoneNumbersValue(input);
  const selectionStart = input.selectionStart;
  let formattedInputValue = '';

  if (!inputNumbersValue) {
    return (input.value = '');
  }

  if (input.value.length !== selectionStart) {
    if (e.data && /\D/g.test(e.data)) {
      input.value = inputNumbersValue;
    }
    return;
  }

  if (['7', '8', '9'].indexOf(inputNumbersValue[0]) > -1) {
    if (inputNumbersValue[0] === '9') inputNumbersValue = '7' + inputNumbersValue;
    const firstSymbols = inputNumbersValue[0] === '8' ? '8' : '+7';
    formattedInputValue = firstSymbols + ' ';

    if (inputNumbersValue.length > 1) {
      formattedInputValue += '(' + inputNumbersValue.substring(1, 4);
    }
    if (inputNumbersValue.length >= 5) {
      formattedInputValue += ') ' + inputNumbersValue.substring(4, 7);
    }
    if (inputNumbersValue.length >= 8) {
      formattedInputValue += '-' + inputNumbersValue.substring(7, 9);
    }
    if (inputNumbersValue.length >= 10) {
      formattedInputValue += '-' + inputNumbersValue.substring(9, 11);
    }
  } else {
    formattedInputValue = '+' + inputNumbersValue.substring(0, 16);
  }

  input.value = formattedInputValue;
}

function onPhoneKeyDown(e, input) {
  const inputValue = input.value.replace(/\D/g, '');
  if (e.keyCode === 8 && inputValue.length === 1) {
    input.value = '';
  }
}

function onPhonePaste(e, input) {
  const pasted = e.clipboardData || window.clipboardData;
  const inputNumbersValue = getPhoneNumbersValue(input);
  if (pasted) {
    const pastedText = pasted.getData('Text');
    if (/\D/g.test(pastedText)) {
      input.value = inputNumbersValue;
    }
  }
}

/* ==========================================================================
   Плашка «Демо-проект» и Cookie-баннер
   ========================================================================== */
function initCompliance() {
  const demoBadge = document.getElementById('demo-badge');
  const demoCloseBtn = document.getElementById('demo-badge-close');
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAcceptBtn = document.getElementById('cookie-accept-btn');

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
}

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
