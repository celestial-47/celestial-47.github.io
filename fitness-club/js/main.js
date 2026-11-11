/**
 * PULSE FITNESS CLUB — MAIN INTERACTIVE SCRIPT
 * Native Vanilla JS (No dependencies, passes node --check)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();
  initSchedule();
  initTrainersSlider();
  initPricingToggle();
  initBmiCalculator();
  initPhoneMask();
  initTrialForm();
  initCompliance();
});

/* ==========================================================================
   1. MOBILE MENU
   ========================================================================== */
function initMobileMenu() {
  const burgerBtn = document.getElementById('burger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (!burgerBtn || !mobileNav) return;

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : burgerBtn.getAttribute('aria-expanded') !== 'true';
    burgerBtn.setAttribute('aria-expanded', String(isOpen));
    mobileNav.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  burgerBtn.addEventListener('click', () => toggleMenu());

  // Close on link click
  const navLinks = mobileNav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burgerBtn.getAttribute('aria-expanded') === 'true') {
      toggleMenu(false);
    }
  });
}

/* ==========================================================================
   HEADER SCROLL SHADOW
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.style.backgroundColor = 'rgba(15, 16, 18, 0.98)';
      header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.6)';
    } else {
      header.style.backgroundColor = 'rgba(15, 16, 18, 0.92)';
      header.style.boxShadow = 'none';
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ==========================================================================
   2. SCHEDULE (РАСПИСАНИЕ)
   ========================================================================== */
const SCHEDULE_DATA = [
  // Понедельник
  { day: 'mon', time: '07:30', title: 'Morning Powerlifting', cat: 'strength', catName: 'Силовые', trainer: 'Алексей Воронов', room: 'Зал тяжелой атлетики', level: 'Продвинутый' },
  { day: 'mon', time: '09:00', title: 'CrossFit WOD: Open Rush', cat: 'crossfit', catName: 'Кроссфит', trainer: 'Дарья Ковалёва', room: 'Кроссфит арена', level: 'Все уровни' },
  { day: 'mon', time: '11:00', title: 'Aqua Fitness & Endurance', cat: 'pool', catName: 'Бассейн', trainer: 'Денис Соколов', room: 'Аквазона', level: 'Начальный' },
  { day: 'mon', time: '18:00', title: 'Boxing Basics & Sparring', cat: 'boxing', catName: 'Бокс', trainer: 'Михаил Громов', room: 'Бойцовский ринг', level: 'Все уровни' },
  { day: 'mon', time: '19:30', title: 'Functional Strength & Core', cat: 'functional', catName: 'Функционал', trainer: 'Дарья Ковалёва', room: 'Функциональная зона', level: 'Средний' },
  { day: 'mon', time: '20:30', title: 'Deep Relax Hatha Yoga', cat: 'yoga', catName: 'Йога', trainer: 'Елена Селезнёва', room: 'Студия Mind & Body', level: 'Все уровни' },

  // Вторник
  { day: 'tue', time: '08:00', title: 'TRX Suspension Pro', cat: 'functional', catName: 'Функционал', trainer: 'Дарья Ковалёва', room: 'Функциональная зона', level: 'Средний' },
  { day: 'tue', time: '10:00', title: 'Deadlift & Squat Masterclass', cat: 'strength', catName: 'Силовые', trainer: 'Алексей Воронов', room: 'Силовой зал', level: 'Опытный' },
  { day: 'tue', time: '12:00', title: 'Интервальное плавание', cat: 'pool', catName: 'Бассейн', trainer: 'Денис Соколов', room: 'Аквазона', level: 'Продвинутый' },
  { day: 'tue', time: '18:30', title: 'CrossFit Team Battle', cat: 'crossfit', catName: 'Кроссфит', trainer: 'Дарья Ковалёва', room: 'Кроссфит арена', level: 'Высокий' },
  { day: 'tue', time: '19:45', title: 'Кикбоксинг & Работа на лапах', cat: 'boxing', catName: 'Бокс', trainer: 'Михаил Громов', room: 'Бойцовский зал', level: 'Все уровни' },
  { day: 'tue', time: '21:00', title: 'Power Stretching & МФР', cat: 'yoga', catName: 'Йога', trainer: 'Елена Селезнёва', room: 'Студия Mind & Body', level: 'Все уровни' },

  // Среда
  { day: 'wed', time: '07:30', title: 'Strongman Conditioning', cat: 'strength', catName: 'Силовые', trainer: 'Алексей Воронов', room: 'Силовой зал', level: 'Средний' },
  { day: 'wed', time: '09:30', title: 'Аштанга-йога: Энергия дня', cat: 'yoga', catName: 'Йога', trainer: 'Елена Селезнёва', room: 'Студия Mind & Body', level: 'Все уровни' },
  { day: 'wed', time: '11:30', title: 'Техника спортивного плавания', cat: 'pool', catName: 'Бассейн', trainer: 'Денис Соколов', room: 'Аквазона', level: 'Все уровни' },
  { day: 'wed', time: '18:00', title: 'Boxing Conditioning', cat: 'boxing', catName: 'Бокс', trainer: 'Михаил Громов', room: 'Бойцовский ринг', level: 'Средний' },
  { day: 'wed', time: '19:15', title: 'CrossFit WOD: Murph Prep', cat: 'crossfit', catName: 'Кроссфит', trainer: 'Дарья Ковалёва', room: 'Кроссфит арена', level: 'Продвинутый' },
  { day: 'wed', time: '20:30', title: 'Animal Flow & Mobility', cat: 'functional', catName: 'Функционал', trainer: 'Дарья Ковалёва', room: 'Функциональная зона', level: 'Все уровни' },

  // Четверг
  { day: 'thu', time: '08:00', title: 'CrossFit Gymnastics', cat: 'crossfit', catName: 'Кроссфит', trainer: 'Дарья Ковалёва', room: 'Кроссфит арена', level: 'Средний' },
  { day: 'thu', time: '10:00', title: 'Силовой жим & Плечи', cat: 'strength', catName: 'Силовые', trainer: 'Алексей Воронов', room: 'Силовой зал', level: 'Продвинутый' },
  { day: 'thu', time: '12:30', title: 'Aqua Circuit: Сила воды', cat: 'pool', catName: 'Бассейн', trainer: 'Денис Соколов', room: 'Аквазона', level: 'Все уровни' },
  { day: 'thu', time: '18:00', title: 'Тайский бокс / Муай-Тай', cat: 'boxing', catName: 'Бокс', trainer: 'Михаил Громов', room: 'Бойцовский зал', level: 'Все уровни' },
  { day: 'thu', time: '19:30', title: 'Functional Hiit 45', cat: 'functional', catName: 'Функционал', trainer: 'Дарья Ковалёва', room: 'Функциональная зона', level: 'Высокий' },
  { day: 'thu', time: '20:45', title: 'Здоровая спина & Пилатес', cat: 'yoga', catName: 'Йога', trainer: 'Елена Селезнёва', room: 'Студия Mind & Body', level: 'Все уровни' },

  // Пятница
  { day: 'fri', time: '07:30', title: 'Heavy Metal Friday (Пауэрлифтинг)', cat: 'strength', catName: 'Силовые', trainer: 'Алексей Воронов', room: 'Силовой зал', level: 'Опытный' },
  { day: 'fri', time: '09:00', title: 'CrossFit Hero WOD', cat: 'crossfit', catName: 'Кроссфит', trainer: 'Дарья Ковалёва', room: 'Кроссфит арена', level: 'Продвинутый' },
  { day: 'fri', time: '11:00', title: 'Вольное плавание & Тайм-триал', cat: 'pool', catName: 'Бассейн', trainer: 'Денис Соколов', room: 'Аквазона', level: 'Все уровни' },
  { day: 'fri', time: '18:00', title: 'Пятничный спарринг-клуб', cat: 'boxing', catName: 'Бокс', trainer: 'Михаил Громов', room: 'Бойцовский ринг', level: 'Средний / Pro' },
  { day: 'fri', time: '19:30', title: 'Kettlebell Sport (Гири)', cat: 'functional', catName: 'Функционал', trainer: 'Алексей Воронов', room: 'Функциональная зона', level: 'Все уровни' },
  { day: 'fri', time: '20:30', title: 'Инь-йога при свечах', cat: 'yoga', catName: 'Йога', trainer: 'Елена Селезнёва', room: 'Студия Mind & Body', level: 'Релакс' },

  // Суббота
  { day: 'sat', time: '09:00', title: 'Weekend CrossFit Battle', cat: 'crossfit', catName: 'Кроссфит', trainer: 'Дарья Ковалёва', room: 'Кроссфит арена', level: 'Все уровни' },
  { day: 'sat', time: '10:30', title: 'Силовой марафон PULSE', cat: 'strength', catName: 'Силовые', trainer: 'Алексей Воронов', room: 'Силовой зал', level: 'Все уровни' },
  { day: 'sat', time: '12:00', title: 'Мастер-класс по боксу', cat: 'boxing', catName: 'Бокс', trainer: 'Михаил Громов', room: 'Бойцовский зал', level: 'Все уровни' },
  { day: 'sat', time: '13:30', title: 'Аква-марафон & Заплыв', cat: 'pool', catName: 'Бассейн', trainer: 'Денис Соколов', room: 'Аквазона', level: 'Все уровни' },
  { day: 'sat', time: '15:00', title: 'Air Yoga & Стретчинг в гамаках', cat: 'yoga', catName: 'Йога', trainer: 'Елена Селезнёва', room: 'Студия Mind & Body', level: 'Все уровни' },

  // Воскресенье
  { day: 'sun', time: '10:00', title: 'Sunday Recovery Yoga', cat: 'yoga', catName: 'Йога', trainer: 'Елена Селезнёва', room: 'Студия Mind & Body', level: 'Все уровни' },
  { day: 'sun', time: '11:30', title: 'Full-Body Functional Camp', cat: 'functional', catName: 'Функционал', trainer: 'Дарья Ковалёва', room: 'Функциональная зона', level: 'Все уровни' },
  { day: 'sun', time: '13:00', title: 'Свободное плавание & Сауна', cat: 'pool', catName: 'Бассейн', trainer: 'Денис Соколов', room: 'Аквазона & Spa', level: 'Релакс' },
  { day: 'sun', time: '15:00', title: 'CrossFit Open Gym', cat: 'crossfit', catName: 'Кроссфит', trainer: 'Алексей Воронов', room: 'Кроссфит арена', level: 'Самостоятельно' },
  { day: 'sun', time: '17:00', title: 'Боксерская лапа: Индивидуальная техника', cat: 'boxing', catName: 'Бокс', trainer: 'Михаил Громов', room: 'Бойцовский ринг', level: 'Все уровни' }
];

function initSchedule() {
  const scheduleContainer = document.getElementById('schedule-list');
  const dayTabs = document.querySelectorAll('.day-tab');
  const filterChips = document.querySelectorAll('.filter-chip');
  if (!scheduleContainer) return;

  let activeDay = 'mon';
  let activeFilter = 'all';

  function renderSchedule() {
    const filtered = SCHEDULE_DATA.filter(item => {
      const matchDay = item.day === activeDay;
      const matchCategory = activeFilter === 'all' || item.cat === activeFilter;
      return matchDay && matchCategory;
    });

    if (filtered.length === 0) {
      scheduleContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px; text-align: center; background: var(--surface); border: 1px solid var(--line);">
          <p style="font-size: 1.1rem; color: var(--muted); margin-bottom: 12px;">В этот день тренировок по выбранному направлению нет.</p>
          <button class="btn btn-lime" onclick="document.querySelector('[data-filter=\\'all\\']').click()">Показать все занятия</button>
        </div>
      `;
      return;
    }

    scheduleContainer.innerHTML = filtered.map(item => `
      <article class="schedule-card">
        <div class="schedule-card-header">
          <time class="schedule-time">${item.time}</time>
          <span class="schedule-tag">${item.catName}</span>
        </div>
        <h3 class="schedule-title">${item.title}</h3>
        <div class="schedule-info">
          <div class="schedule-info-row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>${item.trainer}</span>
          </div>
          <div class="schedule-info-row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${item.room} • ${item.level}</span>
          </div>
        </div>
        <div class="schedule-action">
          <button type="button" class="schedule-book-btn" data-workout="${item.title}" data-category="${item.cat}">
            <span>Записаться</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </article>
    `).join('');

    // Attach listeners to "Записаться" buttons
    scheduleContainer.querySelectorAll('.schedule-book-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        const workoutName = btn.getAttribute('data-workout');
        prefillTrialForm(cat, workoutName);
      });
    });
  }

  // Day tabs handling
  dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dayTabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      activeDay = tab.getAttribute('data-day');
      renderSchedule();
    });
  });

  // Filter chips handling
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeFilter = chip.getAttribute('data-filter');
      renderSchedule();
    });
  });

  // Initial render
  renderSchedule();
}

/* ==========================================================================
   3. TRAINERS HORIZONTAL SLIDER
   ========================================================================== */
function initTrainersSlider() {
  const slider = document.getElementById('trainers-slider');
  const prevBtn = document.getElementById('trainers-prev');
  const nextBtn = document.getElementById('trainers-next');
  if (!slider || !prevBtn || !nextBtn) return;

  const scrollAmount = 340;

  prevBtn.addEventListener('click', () => {
    slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Trainer card book buttons
  const trainerBtns = document.querySelectorAll('.trainer-book-btn');
  trainerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const trainerName = btn.getAttribute('data-trainer');
      const trialSection = document.getElementById('trial');
      if (trialSection) {
        trialSection.scrollIntoView({ behavior: 'smooth' });
        const nameInput = document.getElementById('form-name');
        if (nameInput) {
          nameInput.focus();
        }
      }
    });
  });
}

/* ==========================================================================
   4. PRICING TOGGLE (МЕСЯЦ / ГОД)
   ========================================================================== */
function initPricingToggle() {
  const toggleBtn = document.getElementById('pricing-toggle');
  const labelMonth = document.getElementById('label-month');
  const labelYear = document.getElementById('label-year');
  const priceElements = document.querySelectorAll('.pricing-price[data-month]');
  const periodElements = document.querySelectorAll('.pricing-period');
  if (!toggleBtn) return;

  let isAnnual = false;

  const updatePricing = () => {
    toggleBtn.setAttribute('aria-checked', String(isAnnual));
    if (labelMonth && labelYear) {
      labelMonth.classList.toggle('is-active', !isAnnual);
      labelYear.classList.toggle('is-active', isAnnual);
    }

    priceElements.forEach(el => {
      const monthPrice = el.getAttribute('data-month');
      const yearPrice = el.getAttribute('data-year');
      el.textContent = isAnnual ? yearPrice : monthPrice;
    });

    periodElements.forEach(el => {
      el.textContent = isAnnual ? '₽ / год (скидка 20%)' : '₽ / месяц';
    });
  };

  toggleBtn.addEventListener('click', () => {
    isAnnual = !isAnnual;
    updatePricing();
  });

  if (labelMonth) {
    labelMonth.addEventListener('click', () => {
      if (isAnnual) {
        isAnnual = false;
        updatePricing();
      }
    });
  }

  if (labelYear) {
    labelYear.addEventListener('click', () => {
      if (!isAnnual) {
        isAnnual = true;
        updatePricing();
      }
    });
  }

  // Tariff CTA buttons
  const planBtns = document.querySelectorAll('.pricing-cta-btn');
  planBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const planName = btn.getAttribute('data-plan');
      const trialSection = document.getElementById('trial');
      if (trialSection) {
        trialSection.scrollIntoView({ behavior: 'smooth' });
        const nameInput = document.getElementById('form-name');
        if (nameInput) {
          nameInput.focus();
        }
      }
    });
  });
}

/* ==========================================================================
   5. BMI & CALORIE CALCULATOR
   ========================================================================== */
function initBmiCalculator() {
  const form = document.getElementById('bmi-form');
  const heightInput = document.getElementById('calc-height');
  const weightInput = document.getElementById('calc-weight');
  const ageInput = document.getElementById('calc-age');
  const activitySelect = document.getElementById('calc-activity');
  const genderBtns = document.querySelectorAll('.gender-btn');

  const bmiValEl = document.getElementById('calc-bmi-val');
  const bmiCatEl = document.getElementById('calc-bmi-cat');
  const bmiPointer = document.getElementById('calc-bmi-pointer');
  const calBmrEl = document.getElementById('calc-bmr-val');
  const calTdeeEl = document.getElementById('calc-tdee-val');
  const recEl = document.getElementById('calc-rec-text');

  if (!heightInput || !weightInput || !bmiValEl) return;

  let currentGender = 'male';

  genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      genderBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentGender = btn.getAttribute('data-gender');
      calculate();
    });
  });

  function calculate() {
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);
    const age = parseFloat(ageInput.value) || 25;
    const activity = parseFloat(activitySelect.value) || 1.375;

    if (!height || !weight || height <= 0 || weight <= 0) return;

    // 1. BMI Calculation
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const roundedBmi = bmi.toFixed(1);
    bmiValEl.textContent = roundedBmi;

    // 2. Category & Pointer position
    let category = '';
    let pointerPercent = 50;
    let recText = '';

    if (bmi < 18.5) {
      category = 'Дефицит массы';
      bmiCatEl.style.color = '#38BDF8';
      pointerPercent = Math.max(5, (bmi / 18.5) * 20);
      recText = 'Рекомендуем силовые тренировки с прогрессией нагрузки и рацион с профицитом калорий (+15-20%) под контролем тренера.';
    } else if (bmi < 25) {
      category = 'Нормальный вес';
      bmiCatEl.style.color = 'var(--accent)';
      pointerPercent = 20 + ((bmi - 18.5) / 6.5) * 35;
      recText = 'Отличная форма! Рекомендуем сочетать CrossFit и силовые нагрузки для рельефа и функциональной выносливости.';
    } else if (bmi < 30) {
      category = 'Избыточный вес';
      bmiCatEl.style.color = '#FACC15';
      pointerPercent = 55 + ((bmi - 25) / 5) * 25;
      recText = 'Рекомендуем микс функционального тренинга, интервального кардио в бассейне и разумный дефицит калорий (-15%).';
    } else {
      category = 'Ожирение';
      bmiCatEl.style.color = 'var(--accent-2)';
      pointerPercent = Math.min(95, 80 + ((bmi - 30) / 10) * 15);
      recText = 'Начните с персонального тренера, мягкого кардио и плавания. Мы поможем безопасно снизить нагрузку на суставы.';
    }

    bmiCatEl.textContent = category;
    if (bmiPointer) {
      bmiPointer.style.left = `${pointerPercent}%`;
    }

    // 3. BMR (Mifflin-St Jeor) & TDEE
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (currentGender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const tdee = Math.round(bmr * activity);
    if (calBmrEl) calBmrEl.textContent = `${Math.round(bmr)} ккал`;
    if (calTdeeEl) calTdeeEl.textContent = `${tdee} ккал`;
    if (recEl) recEl.textContent = recText;
  }

  // Bind live listeners
  [heightInput, weightInput, ageInput, activitySelect].forEach(input => {
    input.addEventListener('input', calculate);
    input.addEventListener('change', calculate);
  });

  // Initial calculation
  calculate();
}

/* ==========================================================================
   6. PHONE INPUT MASK (+7 (XXX) XXX-XX-XX)
   ========================================================================== */
function initPhoneMask() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const target = e.target;
      let value = target.value.replace(/\D/g, '');

      // Russian numbers start with 7 or 8
      if (value.startsWith('8')) {
        value = '7' + value.slice(1);
      } else if (!value.startsWith('7') && value.length > 0) {
        value = '7' + value;
      }

      let formatted = '+7';
      if (value.length > 1) {
        formatted += ' (' + value.substring(1, 4);
      }
      if (value.length >= 5) {
        formatted += ') ' + value.substring(4, 7);
      }
      if (value.length >= 8) {
        formatted += '-' + value.substring(7, 9);
      }
      if (value.length >= 10) {
        formatted += '-' + value.substring(9, 11);
      }

      target.value = formatted;
    });

    input.addEventListener('keydown', (e) => {
      // Clear on backspace if only prefix
      if (e.key === 'Backspace' && input.value === '+7') {
        input.value = '';
      }
    });
  });
}

/* ==========================================================================
   7. TRIAL WORKOUT FORM WITH VALIDATION & SUCCESS SCREEN
   ========================================================================== */
function initTrialForm() {
  const form = document.getElementById('trial-form');
  const successCard = document.getElementById('trial-success-card');
  if (!form || !successCard) return;

  const nameInput = document.getElementById('form-name');
  const phoneInput = document.getElementById('form-phone');
  const dirSelect = document.getElementById('form-direction');
  const timeSelect = document.getElementById('form-time');
  const consentCheckbox = document.getElementById('form-consent');

  const nameError = document.getElementById('error-name');
  const phoneError = document.getElementById('error-phone');
  const consentError = document.getElementById('error-consent');

  const successName = document.getElementById('success-user-name');
  const successDetails = document.getElementById('success-booking-details');

  const validate = () => {
    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      nameInput.classList.add('has-error');
      nameError.textContent = 'Введите ваше имя (минимум 2 буквы)';
      nameError.classList.add('is-visible');
      isValid = false;
    } else {
      nameInput.classList.remove('has-error');
      nameError.classList.remove('is-visible');
    }

    // Validate Phone (must be full +7 (XXX) XXX-XX-XX, 18 characters)
    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length !== 11) {
      phoneInput.classList.add('has-error');
      phoneError.textContent = 'Введите полный номер телефона';
      phoneError.classList.add('is-visible');
      isValid = false;
    } else {
      phoneInput.classList.remove('has-error');
      phoneError.classList.remove('is-visible');
    }

    // Validate Consent
    if (!consentCheckbox.checked) {
      consentError.textContent = 'Требуется согласие на обработку данных';
      consentError.classList.add('is-visible');
      isValid = false;
    } else {
      consentError.classList.remove('is-visible');
    }

    return isValid;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Populate success card
    const enteredName = nameInput.value.trim();
    const selectedDirText = dirSelect.options[dirSelect.selectedIndex].text;
    const selectedTimeText = timeSelect.options[timeSelect.selectedIndex].text;

    if (successName) successName.textContent = enteredName;
    if (successDetails) {
      successDetails.textContent = `Направление: ${selectedDirText} • Время: ${selectedTimeText} • Клуб: Новосибирск, Красный пр-т, д. 0`;
    }

    // Switch view
    form.style.display = 'none';
    successCard.classList.add('is-active');

    // Scroll to success card
    successCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Clear errors on input
  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim().length >= 2) {
      nameInput.classList.remove('has-error');
      nameError.classList.remove('is-visible');
    }
  });

  phoneInput.addEventListener('input', () => {
    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length === 11) {
      phoneInput.classList.remove('has-error');
      phoneError.classList.remove('is-visible');
    }
  });

  consentCheckbox.addEventListener('change', () => {
    if (consentCheckbox.checked) {
      consentError.classList.remove('is-visible');
    }
  });
}

/* Helper to prefill form when clicked from schedule or cards */
function prefillTrialForm(category, workoutName) {
  const trialSection = document.getElementById('trial');
  const dirSelect = document.getElementById('form-direction');
  const phoneInput = document.getElementById('form-phone');

  if (dirSelect && category) {
    // Map category to select options
    const categoryMap = {
      'strength': 'strength',
      'crossfit': 'crossfit',
      'boxing': 'boxing',
      'yoga': 'yoga',
      'functional': 'functional',
      'pool': 'pool'
    };
    if (categoryMap[category]) {
      dirSelect.value = categoryMap[category];
    }
  }

  if (trialSection) {
    trialSection.scrollIntoView({ behavior: 'smooth' });
    if (phoneInput) {
      setTimeout(() => phoneInput.focus(), 400);
    }
  }
}

/* ==========================================================================
   7. ДЕМО-ПЛАШКА И COOKIE-БАННЕР
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
