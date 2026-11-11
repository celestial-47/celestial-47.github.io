/* ГаражПро — скрипты страницы: меню, калькулятор, форма записи. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var nf = new Intl.NumberFormat('ru-RU');
  var NBSP = ' ';
  var rub = function (n) { return nf.format(n) + NBSP + '₽'; };

  /* ---------- Год в подвале ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Демо-плашка и cookie ---------- */
  var demoBar = $('[data-demo-bar]');
  var demoKey = 'garagepro-demo-hidden';
  try {
    if (demoBar && window.localStorage.getItem(demoKey) === '1') demoBar.hidden = true;
  } catch (err) { /* localStorage может быть недоступен */ }

  var demoClose = $('[data-demo-close]');
  if (demoClose && demoBar) {
    demoClose.addEventListener('click', function () {
      demoBar.hidden = true;
      try { window.localStorage.setItem(demoKey, '1'); } catch (err) { /* noop */ }
    });
  }

  var cookieBanner = $('#cookieBanner');
  var cookieKey = 'garagepro-cookie-ok';
  var cookieAccepted = false;
  try {
    cookieAccepted = window.localStorage.getItem(cookieKey) === '1';
  } catch (err) { /* localStorage может быть недоступен */ }

  function syncCookieSpace() {
    if (!cookieBanner || cookieBanner.hidden) {
      document.body.classList.remove('has-cookie-banner');
      document.body.style.removeProperty('--cookie-h');
      return;
    }
    document.body.classList.add('has-cookie-banner');
    document.body.style.setProperty('--cookie-h', cookieBanner.offsetHeight + 'px');
  }

  if (cookieBanner && !cookieAccepted) {
    cookieBanner.hidden = false;
    syncCookieSpace();
    window.addEventListener('resize', syncCookieSpace);
  }

  var cookieAccept = $('[data-cookie-accept]');
  if (cookieAccept && cookieBanner) {
    cookieAccept.addEventListener('click', function () {
      try { window.localStorage.setItem(cookieKey, '1'); } catch (err) { /* noop */ }
      cookieBanner.hidden = true;
      syncCookieSpace();
    });
  }

  /* На странице политики нет калькулятора и формы — дальше инициализировать нечего. */
  if (!document.getElementById('booking-form')) return;

  /* ---------- Мобильное меню ---------- */
  var nav = $('#site-nav');
  var toggle = $('#nav-toggle');
  var toggleIcon = $('#nav-toggle-icon');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    toggleIcon.setAttribute('href', open ? '#i-x' : '#i-menu');
  }
  if (nav && toggle) {
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !e.target.closest('.header')) setMenu(false);
    });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function () { setMenu(false); });
  }

  /* ---------- Подсветка пункта меню по скроллу ---------- */
  if ('IntersectionObserver' in window) {
    var links = {};
    $$('.nav ul a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          $$('.nav ul a[aria-current]').forEach(function (x) { x.removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        } else if (a.getAttribute('aria-current')) {
          a.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* =========================================================
     Калькулятор
     ========================================================= */
  var classInputs = $$('input[name="class"]');
  var svcInputs = $$('input[name="svc"]');
  var sumList = $('#sum-list');
  var sumTotal = $('#sum-total');
  var sumClass = $('#sum-class');
  var sumEmpty = $('#sum-empty');
  var sumHint = $('#sum-hint');
  var goBtn = $('#calc-go');
  var transferred = false; // расчёт уже перенесён в форму и дальше синхронизируется

  var roundPrice = function (base, k) { return Math.round(base * k / 10) * 10; };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function getCalc() {
    var cls = classInputs.filter(function (i) { return i.checked; })[0] || classInputs[0];
    var k = parseFloat(cls.dataset.k);
    var picked = svcInputs.filter(function (i) { return i.checked; });
    var hasRepair = picked.some(function (i) { return i.value !== 'diag'; });
    var items = picked.map(function (i) {
      var full = roundPrice(parseFloat(i.dataset.price), k);
      var free = i.value === 'diag' && hasRepair;
      return { id: i.value, name: i.dataset.name, full: full, price: free ? 0 : full, free: free };
    });
    var total = items.reduce(function (s, it) { return s + it.price; }, 0);
    return { cls: cls.dataset.label, k: k, items: items, total: total, hasRepair: hasRepair };
  }

  var lastTotal = null;

  function renderCalc() {
    var c = getCalc();
    var k = c.k;

    // цены в списке
    svcInputs.forEach(function (i) {
      var priceEl = i.closest('.svc').querySelector('.svc-price');
      var full = roundPrice(parseFloat(i.dataset.price), k);
      priceEl.textContent = '';
      if (i.value === 'diag' && c.hasRepair) {
        priceEl.appendChild(el('s', null, rub(full)));
        priceEl.appendChild(el('span', 'free', rub(0)));
      } else {
        priceEl.textContent = rub(full);
      }
    });

    // итог
    sumClass.textContent = c.cls + (k !== 1 ? ' · коэффициент ×' + String(k).replace('.', ',') : '');
    sumList.textContent = '';
    c.items.forEach(function (it) {
      var li = el('li', it.free ? 'is-free' : '');
      li.appendChild(el('span', null, it.name + (it.free ? ' (бесплатно при ремонте)' : '')));
      li.appendChild(el('span', null, rub(it.price)));
      sumList.appendChild(li);
    });
    sumEmpty.hidden = c.items.length > 0;
    sumTotal.textContent = rub(c.total);
    if (lastTotal !== null && lastTotal !== c.total && !reduced.matches) {
      sumTotal.classList.remove('bump');
      void sumTotal.offsetWidth; // перезапуск анимации
      sumTotal.classList.add('bump');
    }
    lastTotal = c.total;

    var ready = c.items.length > 0;
    goBtn.disabled = !ready;
    sumHint.hidden = ready;

    // подписи на карточках услуг
    $$('.svc-add').forEach(function (a) {
      var inp = svcInputs.filter(function (i) { return i.value === a.dataset.add; })[0];
      var on = inp && inp.checked;
      a.classList.toggle('is-added', !!on);
      a.querySelector('.svc-add-text').textContent = on ? 'В расчёте' : 'В расчёт';
      a.querySelector('use').setAttribute('href', on ? '#i-check' : '#i-arrow');
    });

    if (transferred) {
      if (!ready) { transferred = false; }
      renderBookingCalc();
    }
  }

  classInputs.concat(svcInputs).forEach(function (i) { i.addEventListener('change', renderCalc); });

  // «В расчёт» с карточки услуги
  $$('.svc-add').forEach(function (a) {
    a.addEventListener('click', function () {
      var inp = svcInputs.filter(function (i) { return i.value === a.dataset.add; })[0];
      if (inp && !inp.checked) { inp.checked = true; renderCalc(); }
    });
  });

  /* ---------- Перенос расчёта в форму ---------- */
  var bookCalc = $('#booking-calc');
  var bookForm = $('#booking-form');
  var calcField = $('#f-calc');

  function renderBookingCalc() {
    if (!transferred) {
      bookCalc.hidden = true;
      calcField.value = '';
      return;
    }
    var c = getCalc();
    if (!c.items.length) { transferred = false; bookCalc.hidden = true; calcField.value = ''; return; }
    $('#booking-calc-class').textContent = 'Класс авто: ' + c.cls;
    var list = $('#booking-calc-list');
    list.textContent = '';
    c.items.forEach(function (it) {
      var li = el('li');
      li.appendChild(el('span', null, it.name + (it.free ? ' (бесплатно)' : '')));
      li.appendChild(el('span', null, rub(it.price)));
      list.appendChild(li);
    });
    $('#booking-calc-total').textContent = rub(c.total);
    calcField.value = JSON.stringify({
      class: c.cls,
      items: c.items.map(function (i) { return { name: i.name, price: i.price }; }),
      total: c.total
    });
    bookCalc.hidden = false;
  }

  goBtn.addEventListener('click', function () {
    if (goBtn.disabled) return;
    transferred = true;
    showForm();
    renderBookingCalc();
    var target = $('#booking');
    target.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(function () { var f = $('#f-name'); if (f) f.focus({ preventScroll: true }); }, reduced.matches ? 0 : 600);
  });

  $('#booking-calc-clear').addEventListener('click', function () {
    transferred = false;
    renderBookingCalc();
    $('#f-name').focus();
  });

  /* =========================================================
     Форма записи
     ========================================================= */
  var fName = $('#f-name'), fPhone = $('#f-phone'), fCar = $('#f-car'),
      fPlate = $('#f-plate'), fDate = $('#f-date'), fComment = $('#f-comment'),
      fConsent = $('#f-consent');
  var success = $('#book-success');
  var submitBtn = $('#book-submit');

  // минимальная дата — сегодня (по местному времени)
  function isoToday() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  fDate.min = isoToday();

  /* Маска телефона +7 (900) 000-00-02 */
  function digitsOf(s) { return s.replace(/\D/g, ''); }
  function formatPhone(raw, prev, deleting) {
    var d = digitsOf(raw);
    if (deleting && d === digitsOf(prev)) d = d.slice(0, -1); // стёрли символ маски — убираем цифру
    if (d.charAt(0) === '7' || d.charAt(0) === '8') d = d.slice(1);
    d = d.slice(0, 10);
    if (!d) return '';
    var out = '+7 (' + d.slice(0, 3);
    if (d.length >= 3) out += ')';
    if (d.length > 3) out += ' ' + d.slice(3, 6);
    if (d.length > 6) out += '-' + d.slice(6, 8);
    if (d.length > 8) out += '-' + d.slice(8, 10);
    return out;
  }
  var prevPhone = '';
  fPhone.addEventListener('input', function (e) {
    var raw = fPhone.value;
    var atEnd = fPhone.selectionStart === raw.length;
    var deleting = !!(e.inputType && e.inputType.indexOf('delete') === 0);
    var v = formatPhone(raw, prevPhone, deleting);
    fPhone.value = v;
    prevPhone = v;
    if (atEnd) fPhone.setSelectionRange(v.length, v.length);
    clearError(fPhone);
  });

  /* Госномер: заглавные буквы */
  fPlate.addEventListener('input', function () { fPlate.value = fPlate.value.toUpperCase(); clearError(fPlate); });

  /* Ошибки рядом с полем */
  function errEl(input) { return document.getElementById(input.id + '-err'); }
  function setError(input, msg) {
    var e = errEl(input);
    input.setAttribute('aria-invalid', 'true');
    e.textContent = msg;
    e.classList.add('show');
  }
  function clearError(input) {
    var e = errEl(input);
    input.removeAttribute('aria-invalid');
    e.textContent = '';
    e.classList.remove('show');
  }

  var PLATE_RE = /^[АВЕКМНОРСТУХABEKMHOPCTYX]\d{3}[АВЕКМНОРСТУХABEKMHOPCTYX]{2}\d{2,3}$/;

  var validators = [
    [fName, function () { return fName.value.trim().length >= 2 ? '' : 'Введите имя — не короче двух букв'; }],
    [fPhone, function () { return digitsOf(fPhone.value).length === 11 ? '' : 'Введите номер полностью: +7 (900) 000-00-02'; }],
    [fCar, function () { return fCar.value.trim().length >= 2 ? '' : 'Укажите марку и модель, например Kia Rio'; }],
    [fPlate, function () {
      var v = fPlate.value.replace(/\s+/g, '');
      return !v || PLATE_RE.test(v) ? '' : 'Формат номера: А123ВС 193';
    }],
    [fDate, function () {
      if (!fDate.value) return 'Выберите желаемую дату';
      return fDate.value >= isoToday() ? '' : 'Выберите сегодняшнюю или более позднюю дату';
    }],
    [fConsent, function () { return fConsent.checked ? '' : 'Нужно согласие на обработку данных'; }]
  ];

  validators.forEach(function (pair) {
    var input = pair[0], fn = pair[1];
    // на blur проверяем только заполненные поля — на пустые ругаемся при отправке
    input.addEventListener('blur', function () {
      if (input.value) { var m = fn(); m ? setError(input, m) : clearError(input); }
    });
    input.addEventListener('change', function () { var m = fn(); m ? setError(input, m) : clearError(input); });
    if (input !== fPhone && input !== fPlate) input.addEventListener('input', function () { if (input.getAttribute('aria-invalid')) { var m = fn(); m ? setError(input, m) : clearError(input); } });
  });

  function validateAll() {
    var first = null;
    validators.forEach(function (pair) {
      var m = pair[1]();
      if (m) { setError(pair[0], m); if (!first) first = pair[0]; } else { clearError(pair[0]); }
    });
    return first;
  }

  /* Отправка (без бэкенда — показываем экран успеха) */
  function showForm() {
    success.hidden = true;
    bookForm.hidden = false;
  }

  function addRow(dl, label, value, cls) {
    var row = el('div', cls || '');
    row.appendChild(el('dt', null, label));
    row.appendChild(el('dd', null, value));
    dl.appendChild(row);
  }

  function showSuccess() {
    var dl = $('#success-data');
    dl.textContent = '';
    var firstName = fName.value.trim().split(/\s+/)[0];
    $('#success-lead').textContent = firstName + ', мы перезвоним на ' + fPhone.value + ' в течение 15 минут в рабочее время и подтвердим запись.';
    addRow(dl, 'Авто', fCar.value.trim() + (fPlate.value.trim() ? ', ' + fPlate.value.trim() : ''));
    var d = new Date(fDate.value + 'T00:00:00');
    addRow(dl, 'Дата', d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }));
    if (transferred) {
      var c = getCalc();
      addRow(dl, 'Работы', c.items.map(function (i) { return i.name; }).join(', '));
      addRow(dl, 'Расчёт', rub(c.total), 'is-total');
    }
    bookForm.hidden = true;
    success.hidden = false;
    success.focus();
    if (!reduced.matches) success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  bookForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = validateAll();
    if (bad) { bad.focus(); return; }
    submitBtn.classList.add('is-loading');
    submitBtn.setAttribute('aria-busy', 'true');
    window.setTimeout(function () {
      submitBtn.classList.remove('is-loading');
      submitBtn.removeAttribute('aria-busy');
      showSuccess();
    }, 700);
  });

  $('#book-again').addEventListener('click', function () {
    bookForm.reset();
    prevPhone = '';
    validators.forEach(function (p) { clearError(p[0]); });
    transferred = false;
    renderBookingCalc();
    showForm();
    fName.focus();
  });

  renderCalc();
})();
