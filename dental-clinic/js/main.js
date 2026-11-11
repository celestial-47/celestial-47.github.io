/* Белая Линия — interactions */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Demo bar + cookie banner
  ------------------------------------------------------------------ */
  var demoBar = document.querySelector('[data-demo-bar]');
  var demoClose = document.querySelector('[data-demo-close]');
  var demoKey = 'belaya-liniya-demo-hidden';

  try {
    if (window.localStorage.getItem(demoKey) === '1' && demoBar) {
      demoBar.hidden = true;
    }
  } catch (err) { /* localStorage может быть недоступен */ }

  if (demoClose && demoBar) {
    demoClose.addEventListener('click', function () {
      demoBar.hidden = true;
      try { window.localStorage.setItem(demoKey, '1'); } catch (err) { /* noop */ }
    });
  }

  var cookieBanner = document.getElementById('cookieBanner');
  var cookieKey = 'belaya-liniya-cookie-ok';
  var cookieAccepted = false;

  try {
    cookieAccepted = window.localStorage.getItem(cookieKey) === '1';
  } catch (err) { /* localStorage может быть недоступен */ }

  function syncCookieSpace() {
    if (!cookieBanner || cookieBanner.hidden) {
      body.classList.remove('has-cookie-banner');
      body.style.removeProperty('--cookie-h');
      return;
    }
    body.classList.add('has-cookie-banner');
    body.style.setProperty('--cookie-h', cookieBanner.offsetHeight + 'px');
  }

  if (cookieBanner && !cookieAccepted) {
    cookieBanner.hidden = false;
    syncCookieSpace();
    window.addEventListener('resize', syncCookieSpace);
  }

  var cookieAccept = document.querySelector('[data-cookie-accept]');
  if (cookieAccept && cookieBanner) {
    cookieAccept.addEventListener('click', function () {
      try { window.localStorage.setItem(cookieKey, '1'); } catch (err) { /* noop */ }
      cookieBanner.hidden = true;
      syncCookieSpace();
    });
  }

  /* ------------------------------------------------------------------
     Header
  ------------------------------------------------------------------ */
  var header = document.querySelector('.site-header');
  if (header) {
    var updateHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  /* ------------------------------------------------------------------
     Mobile navigation
  ------------------------------------------------------------------ */
  var nav = document.getElementById('siteNav');
  var burger = document.querySelector('.burger');

  function setNav(open) {
    if (!nav || !burger) return;
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    body.classList.toggle('nav-open', open);
    if (open) {
      var first = nav.querySelector('.nav-list a');
      if (first) first.focus();
    }
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setNav(burger.getAttribute('aria-expanded') !== 'true');
    });
  }

  if (nav) {
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setNav(false);
    });
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && nav && nav.classList.contains('is-open')) {
      setNav(false);
    }
  });

  /* ------------------------------------------------------------------
     Accordions (prices + FAQ)
  ------------------------------------------------------------------ */
  document.querySelectorAll('[data-accordion]').forEach(function (accordion) {
    var items = Array.prototype.slice.call(accordion.querySelectorAll('.acc-item'));

    function setItem(item, open) {
      var trigger = item.querySelector('.acc-trigger');
      var panel = item.querySelector('.acc-panel');
      if (!trigger || !panel) return;
      trigger.setAttribute('aria-expanded', String(open));
      item.classList.toggle('is-open', open);
      if (open) {
        panel.removeAttribute('inert');
      } else {
        panel.setAttribute('inert', '');
      }
    }

    items.forEach(function (item) {
      var trigger = item.querySelector('.acc-trigger');
      if (!trigger) return;
      setItem(item, item.classList.contains('is-open'));

      trigger.addEventListener('click', function () {
        var willOpen = trigger.getAttribute('aria-expanded') !== 'true';
        items.forEach(function (other) {
          if (other !== item) setItem(other, false);
        });
        setItem(item, willOpen);
      });
    });
  });

  /* ------------------------------------------------------------------
     Scroll reveal
  ------------------------------------------------------------------ */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px' });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------
     Animated counters
  ------------------------------------------------------------------ */
  var counters = Array.prototype.slice.call(document.querySelectorAll('.stat-number[data-target]'));
  var numberFormat = new Intl.NumberFormat('ru-RU');

  function animateCounter(el) {
    var target = Number(el.getAttribute('data-target')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';

    if (reduceMotion) {
      el.textContent = numberFormat.format(target) + suffix;
      return;
    }

    var duration = 1500;
    var startTime = null;
    el.textContent = '0' + suffix;

    function frame(now) {
      if (startTime === null) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = numberFormat.format(Math.round(target * eased)) + suffix;
      if (progress < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { counterObserver.observe(el); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ------------------------------------------------------------------
     Before / after comparison
  ------------------------------------------------------------------ */
  var compare = document.querySelector('[data-compare]');
  if (compare) {
    var handle = compare.querySelector('.compare-handle');
    var position = 52;
    var dragging = false;
    var activePointer = null;

    function clamp(value) {
      return Math.max(0, Math.min(100, value));
    }

    function setPosition(value) {
      position = clamp(value);
      compare.style.setProperty('--pos', position + '%');
      if (handle) {
        var rounded = Math.round(position);
        handle.setAttribute('aria-valuenow', String(rounded));
      handle.setAttribute('aria-valuetext', 'Разделитель на ' + rounded + '%');
      }
    }

    function positionFromEvent(event) {
      var rect = compare.getBoundingClientRect();
      if (!rect.width) return position;
      return ((event.clientX - rect.left) / rect.width) * 100;
    }

    function startDrag(event) {
      if (activePointer !== null) return;
      dragging = true;
      activePointer = event.pointerId;
      if (handle) handle.focus({ preventScroll: true });
      setPosition(positionFromEvent(event));
      if (compare.setPointerCapture) {
        try { compare.setPointerCapture(event.pointerId); } catch (err) { /* noop */ }
      }
      event.preventDefault();
    }

    function moveDrag(event) {
      if (!dragging || event.pointerId !== activePointer) return;
      setPosition(positionFromEvent(event));
      event.preventDefault();
    }

    function endDrag(event) {
      if (!dragging || (event && event.pointerId !== activePointer)) return;
      dragging = false;
      activePointer = null;
    }

    if (handle) {
      handle.addEventListener('pointerdown', startDrag);
      handle.addEventListener('keydown', function (event) {
        var step = event.shiftKey ? 10 : 4;
        var next = null;

        switch (event.key) {
          case 'ArrowLeft':
          case 'ArrowDown':
            next = position - step;
            break;
          case 'ArrowRight':
          case 'ArrowUp':
            next = position + step;
            break;
          case 'PageDown':
            next = position - 10;
            break;
          case 'PageUp':
            next = position + 10;
            break;
          case 'Home':
            next = 0;
            break;
          case 'End':
            next = 100;
            break;
          default:
            return;
        }

        event.preventDefault();
        setPosition(next);
      });
    }

    compare.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.target !== handle && !event.target.closest('.compare-handle')) {
        startDrag(event);
      }
    });

    window.addEventListener('pointermove', moveDrag, { passive: false });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    setPosition(position);
  }

  /* ------------------------------------------------------------------
     Booking modal
  ------------------------------------------------------------------ */
  var overlay = document.getElementById('bookingModal');
  if (!overlay) return;

  var modal = overlay.querySelector('.modal');
  var modalHead = overlay.querySelector('.modal-head');
  var stepsBar = overlay.querySelector('.steps');
  var modalTitle = document.getElementById('bookingTitle');
  var form = document.getElementById('bookingForm');
  var successPanel = overlay.querySelector('[data-success]');
  var successSummary = overlay.querySelector('[data-success-summary]');
  var stepPanels = Array.prototype.slice.call(form.querySelectorAll('.step-panel'));
  var stepIndicators = Array.prototype.slice.call(overlay.querySelectorAll('[data-step-indicator]'));
  var closeBtn = overlay.querySelector('.modal-close');
  var lastFocused = null;
  var currentStep = 1;
  var isOpen = false;
  var closeTimer = null;

  var serviceError = document.getElementById('serviceError');
  var doctorError = document.getElementById('doctorError');
  var dateError = document.getElementById('dateError');
  var timeError = document.getElementById('timeError');
  var nameError = document.getElementById('nameError');
  var phoneError = document.getElementById('phoneError');
  var consentError = document.getElementById('consentError');

  var dateInput = document.getElementById('bookingDate');
  var nameInput = document.getElementById('bookingName');
  var phoneInput = document.getElementById('bookingPhone');
  var commentInput = document.getElementById('bookingComment');
  var consentInput = document.getElementById('bookingConsent');
  var serviceChoices = document.getElementById('serviceChoices');
  var doctorChoices = document.getElementById('doctorChoices');
  var timeChoices = document.getElementById('timeChoices');
  var selectedServiceLabel = overlay.querySelector('[data-selected-service]');
  var summaryBox = overlay.querySelector('[data-booking-summary]');
  var submitBtn = document.getElementById('bookingSubmit');
  var successTitle = document.getElementById('successTitle');

  var stepTitles = ['Выберите услугу', 'Врач и дата', 'Ваши контакты'];

  function pad(num) { return String(num).padStart(2, '0'); }

  function toISODate(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function parseDate(value) {
    if (!value) return null;
    var parts = value.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }

  function formatDate(value) {
    var date = parseDate(value);
    if (!date) return '—';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
  }

  function setDateLimits() {
    if (!dateInput) return;
    var today = new Date();
    today.setHours(12, 0, 0, 0);
    var max = new Date(today);
    max.setDate(max.getDate() + 60);
    dateInput.min = toISODate(today);
    dateInput.max = toISODate(max);
  }

  function getRadioValue(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : '';
  }

  function setRadio(name, value) {
    var radios = Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]'));
    var found = radios.filter(function (radio) { return radio.value === value; })[0];
    if (found) found.checked = true;
  }

  function setFieldError(input, errorEl, show) {
    if (errorEl) errorEl.hidden = !show;
    if (input) {
      if (show) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }

  function clearErrors() {
    setFieldError(dateInput, dateError, false);
    setFieldError(nameInput, nameError, false);
    setFieldError(phoneInput, phoneError, false);
    setFieldError(consentInput, consentError, false);
    if (serviceError) serviceError.hidden = true;
    if (doctorError) doctorError.hidden = true;
    if (timeError) timeError.hidden = true;
  }

  function updateSelectedService() {
    var value = getRadioValue('service');
    if (selectedServiceLabel) selectedServiceLabel.textContent = value || 'Услуга не выбрана';
  }

  function buildSummary(includeContact) {
    var service = getRadioValue('service') || '—';
    var doctor = getRadioValue('doctor') || '—';
    var date = formatDate(dateInput.value);
    var time = getRadioValue('time') || '—';
    var rows = [
      ['Услуга', service],
      ['Врач', doctor],
      ['Дата', date],
      ['Время', time]
    ];

    if (includeContact) {
      rows.push(['Имя', nameInput.value.trim() || '—']);
      rows.push(['Телефон', phoneInput.value.trim() || '—']);
    }

    var fragment = document.createDocumentFragment();
    rows.forEach(function (row) {
      var span = document.createElement('span');
      var label = document.createElement('span');
      var value = document.createElement('strong');
      label.textContent = row[0];
      value.textContent = row[1];
      span.appendChild(label);
      span.appendChild(value);
      fragment.appendChild(span);
    });
    return fragment;
  }

  function refreshSummary() {
    if (summaryBox) summaryBox.replaceChildren(buildSummary(false));
  }

  function focusStep(step) {
    var selector = {
      1: '#serviceChoices input:checked, #serviceChoices input',
      2: '#doctorChoices input:checked, #doctorChoices input',
      3: '#bookingName'
    }[step];
    if (!selector) return;
    var target = form.querySelector(selector);
    if (target) {
      window.setTimeout(function () { target.focus({ preventScroll: true }); }, 30);
    }
  }

  function goToStep(step, options) {
    var opts = options || {};
    currentStep = step;
    stepPanels.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute('data-step')) !== step;
    });
    stepIndicators.forEach(function (indicator) {
      var index = Number(indicator.getAttribute('data-step-indicator'));
      indicator.classList.toggle('is-active', index === step);
      indicator.classList.toggle('is-done', index < step);
      if (index === step) indicator.setAttribute('aria-current', 'step');
      else indicator.removeAttribute('aria-current');
    });
    if (modalTitle) modalTitle.textContent = stepTitles[step - 1];
    if (step === 2) updateSelectedService();
    if (step === 3) refreshSummary();
    if (opts.focus !== false) focusStep(step);
    if (modal && opts.scroll !== false) modal.scrollTop = 0;
  }

  function validateService() {
    var valid = Boolean(getRadioValue('service'));
    if (serviceError) serviceError.hidden = valid;
    if (!valid && serviceChoices) {
      var first = serviceChoices.querySelector('input');
      if (first) first.focus();
    }
    return valid;
  }

  function validateDoctorAndTime() {
    var validDoctor = Boolean(getRadioValue('doctor'));
    var validTime = Boolean(getRadioValue('time'));
    var validDate = Boolean(dateInput.value) && Boolean(parseDate(dateInput.value));

    if (validDate) {
      var chosen = parseDate(dateInput.value).getTime();
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var max = new Date(today);
      max.setDate(max.getDate() + 60);
      validDate = chosen >= today.getTime() && chosen <= max.getTime();
    }

    if (doctorError) doctorError.hidden = validDoctor;
    if (timeError) timeError.hidden = validTime;
    setFieldError(dateInput, dateError, !validDate);

    if (!validDoctor && doctorChoices) {
      var doc = doctorChoices.querySelector('input');
      if (doc) doc.focus();
    } else if (!validDate) {
      if (dateInput) dateInput.focus();
    } else if (!validTime && timeChoices) {
      var time = timeChoices.querySelector('input');
      if (time) time.focus();
    }

    return validDoctor && validTime && validDate;
  }

  function digitsOnly(value) {
    return value.replace(/\D/g, '');
  }

  function formatRuPhone(raw) {
    var digits = digitsOnly(raw);
    if (!digits) return '';
    if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    if (digits.charAt(0) !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);

    var rest = digits.slice(1);
    var result = '+7';
    if (rest.length) result += ' (' + rest.slice(0, 3);
    if (rest.length >= 3) result += ')';
    if (rest.length > 3) result += ' ' + rest.slice(3, 6);
    if (rest.length > 6) result += '-' + rest.slice(6, 8);
    if (rest.length > 8) result += '-' + rest.slice(8, 10);
    return result;
  }

  function validatePhone() {
    var digits = digitsOnly(phoneInput.value);
    var valid = digits.length === 11 && digits.charAt(0) === '7';
    setFieldError(phoneInput, phoneError, !valid);
    return valid;
  }

  function validateName() {
    var valid = nameInput.value.trim().length >= 2;
    setFieldError(nameInput, nameError, !valid);
    return valid;
  }

  function validateConsent() {
    var valid = consentInput.checked;
    setFieldError(consentInput, consentError, !valid);
    return valid;
  }

  function validateContacts() {
    var validName = validateName();
    var validPhone = validatePhone();
    var validConsent = validateConsent();

    if (!validName) nameInput.focus();
    else if (!validPhone) phoneInput.focus();
    else if (!validConsent) consentInput.focus();

    return validName && validPhone && validConsent;
  }

  function showSuccess() {
    if (successSummary) successSummary.replaceChildren(buildSummary(true));
    if (modalHead) modalHead.hidden = true;
    if (stepsBar) stepsBar.hidden = true;
    form.hidden = true;
    successPanel.hidden = false;
    if (modal) modal.scrollTop = 0;
    if (successTitle) {
      window.setTimeout(function () { successTitle.focus(); }, 40);
    }
  }

  function resetBooking(options) {
    var opts = options || {};
    form.reset();
    clearErrors();
    if (modalHead) modalHead.hidden = false;
    if (stepsBar) stepsBar.hidden = false;
    form.hidden = false;
    successPanel.hidden = true;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить заявку';
    }
    setDateLimits();
    if (phoneInput) phoneInput.value = '';
    goToStep(1, { focus: false, scroll: false });
    if (modal) modal.scrollTop = 0;
    if (opts.focus) focusStep(1);
  }

  function getFocusable() {
    return Array.prototype.slice.call(modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (el) {
      return !el.closest('[hidden]') && !el.closest('[inert]') && el.getClientRects().length > 0;
    });
  }

  function trapFocus(event) {
    var focusable = getFocusable();
    if (!focusable.length) {
      event.preventDefault();
      modal.focus();
      return;
    }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || !modal.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onModalKeydown(event) {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key === 'Tab') trapFocus(event);
  }

  function openModal(options) {
    var opts = options || {};
    if (nav && nav.classList.contains('is-open')) setNav(false);
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    lastFocused = document.activeElement;
    resetBooking();

    if (opts.service) {
      setRadio('service', opts.service);
      updateSelectedService();
    }
    if (opts.doctor) {
      if (!opts.service) setRadio('service', 'Консультация');
      setRadio('doctor', opts.doctor);
      updateSelectedService();
    }

    overlay.hidden = false;
    body.classList.add('modal-open');
    isOpen = true;
    document.addEventListener('keydown', onModalKeydown);
    window.requestAnimationFrame(function () {
      overlay.classList.add('is-open');
    });

    if (opts.doctor) {
      goToStep(2, { focus: false });
    } else if (opts.service) {
      goToStep(2, { focus: false });
    } else {
      goToStep(1, { focus: false });
    }

    window.setTimeout(function () {
      if (opts.doctor) {
        var checkedDoc = form.querySelector('input[name="doctor"]:checked');
        if (checkedDoc) checkedDoc.focus({ preventScroll: true });
        else if (dateInput) dateInput.focus({ preventScroll: true });
      } else {
        var checkedService = form.querySelector('input[name="service"]:checked');
        if (checkedService) checkedService.focus({ preventScroll: true });
        else if (closeBtn) closeBtn.focus({ preventScroll: true });
      }
    }, 60);
  }

  function closeModal() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('is-open');
    body.classList.remove('modal-open');
    document.removeEventListener('keydown', onModalKeydown);
    closeTimer = window.setTimeout(function () {
      overlay.hidden = true;
      closeTimer = null;
      resetBooking();
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus({ preventScroll: true });
      }
    }, reduceMotion ? 0 : 220);
  }

  document.querySelectorAll('[data-open-booking]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openModal();
    });
  });

  document.querySelectorAll('[data-book-service]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openModal({ service: trigger.getAttribute('data-book-service') });
    });
  });

  document.querySelectorAll('[data-book-doctor]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openModal({ doctor: trigger.getAttribute('data-book-doctor') });
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) closeModal();
  });

  var closeSuccessBtn = overlay.querySelector('[data-close-success]');
  var bookAgainBtn = overlay.querySelector('[data-book-again]');
  if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModal);
  if (bookAgainBtn) {
    bookAgainBtn.addEventListener('click', function () {
      resetBooking({ focus: true });
    });
  }

  form.querySelectorAll('[data-next]').forEach(function (button) {
    button.addEventListener('click', function () {
      var from = Number(button.getAttribute('data-next'));
      if (from === 1 && validateService()) goToStep(2);
      if (from === 2 && validateDoctorAndTime()) goToStep(3);
    });
  });

  form.querySelectorAll('[data-back]').forEach(function (button) {
    button.addEventListener('click', function () {
      var from = Number(button.getAttribute('data-back'));
      goToStep(Math.max(1, from - 1));
    });
  });

  if (serviceChoices) {
    serviceChoices.addEventListener('change', function () {
      if (serviceError) serviceError.hidden = true;
      updateSelectedService();
    });
  }

  if (doctorChoices) {
    doctorChoices.addEventListener('change', function () {
      if (doctorError) doctorError.hidden = true;
    });
  }

  if (timeChoices) {
    timeChoices.addEventListener('change', function () {
      if (timeError) timeError.hidden = true;
    });
  }

  if (dateInput) {
    dateInput.addEventListener('input', function () { setFieldError(dateInput, dateError, false); });
  }

  if (nameInput) {
    nameInput.addEventListener('input', function () { setFieldError(nameInput, nameError, false); });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      phoneInput.value = formatRuPhone(phoneInput.value);
      phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
      setFieldError(phoneInput, phoneError, false);
    });
    phoneInput.addEventListener('blur', function () {
      if (phoneInput.value && digitsOnly(phoneInput.value).length < 11) {
        setFieldError(phoneInput, phoneError, true);
      }
    });
  }

  if (consentInput) {
    consentInput.addEventListener('change', function () {
      setFieldError(consentInput, consentError, false);
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validateContacts()) return;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем…';
    }
    window.setTimeout(function () {
      showSuccess();
    }, reduceMotion ? 0 : 350);
  });

  setDateLimits();
  resetBooking();
  goToStep(1, { focus: false, scroll: false });

  /* Global Escape for mobile menu */
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav && nav.classList.contains('is-open')) {
      setNav(false);
      if (burger) burger.focus();
    }
  });

  root.classList.add('js-ready');
})();
