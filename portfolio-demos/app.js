import { catalogItems, sites } from './catalog.js';

const { site: slug, page } = document.body.dataset;
const site = sites[slug];
const app = document.querySelector('#app');
const statuses = ['Новая', 'Подтверждена', 'Завершена', 'Отменена'];
const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const safe = (value) => String(value).replace(/[&<>"']/g, (symbol) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[symbol]);
const prefix = 'portfolio-demo:' + slug + ':';
const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(prefix + key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(prefix + key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  clear() {
    try { for (const key of ['items', 'orders', 'preferences']) localStorage.removeItem(prefix + key); return true; }
    catch { return false; }
  },
};
let items = storage.get('items', catalogItems(site));
let orders = storage.get('orders', []);
const publicPage = page === 'store';
const isFlowers = slug === 'lepestok';
const photo = (name) => '../assets/' + name + '.webp';
const options = (values) => values.map((value) => '<option>' + safe(value) + '</option>').join('');
const brand = '<span class="mark" aria-hidden="true">' + site.mark + '</span>' + site.name;

app.innerHTML = `
  <header class="top"><div class="wrap top-inner">
    <a class="brand" href="index.html">${brand}</a>
    <nav aria-label="Основная навигация">
      ${publicPage ? '<a href="#catalog">Каталог</a><a href="#faq">Вопросы</a>' : '<a href="index.html">Витрина</a>'}
      ${publicPage && isFlowers ? '<button class="chip" id="basket-link" type="button">Корзина <span id="basket-count">0</span></button>' : ''}
    </nav>
  </div></header>
  <main id="main"></main>
  <footer class="foot"><div class="wrap foot-inner">
    <div><strong>${site.name}</strong><p>Концепт для портфолио. Цены и сценарии демонстрационные.</p></div>
    <nav aria-label="Информация о проекте">
      <a href="../">Все демо</a>
      <a href="${publicPage ? 'admin.html' : 'index.html'}">${publicPage ? 'Демо-админка' : 'Витрина'}</a>
      <a href="../privacy.html">Приватность</a>
      <button class="plain" id="privacy-link" type="button">Настройки хранения</button>
    </nav>
  </div></footer>
  <aside class="notice" id="cookie-banner" aria-labelledby="cookie-heading" hidden>
    <div><strong id="cookie-heading">Cookies и локальное хранение</strong>
      <p>Демо не устанавливает cookies. Настройки и тестовые записи можно хранить в этом браузере. <a href="../privacy.html">Подробнее</a></p></div>
    <div class="notice-actions"><button class="ghost" id="dismiss-notice" type="button">Понятно</button></div>
  </aside>
  <dialog id="privacy-dialog" aria-labelledby="privacy-heading">
    <div class="dialog-top"><h2 id="privacy-heading">Локальные данные</h2><form method="dialog"><button class="ghost" aria-label="Закрыть настройки">Закрыть</button></form></div>
    <p>В этом браузере могут храниться тестовые записи, изменения каталога и отметка о закрытии баннера.</p>
    <p><a href="../privacy.html">Как устроено хранение</a></p>
    <button id="clear-storage" type="button" class="primary">Очистить данные этого демо</button>
  </dialog>
  <div class="live" id="feedback" role="status" aria-live="polite"></div>
`;

const banner = document.querySelector('#cookie-banner');
const privacy = document.querySelector('#privacy-dialog');
banner.hidden = storage.get('preferences', false);
document.querySelector('#dismiss-notice').addEventListener('click', () => {
  storage.set('preferences', true);
  banner.hidden = true;
});
document.querySelector('#privacy-link').addEventListener('click', () => privacy.showModal());
document.querySelector('#clear-storage').addEventListener('click', () => {
  if (storage.clear()) location.reload();
  else announce('Браузер заблокировал доступ к локальному хранилищу.');
});

let feedbackTimer;
function announce(message) {
  const feedback = document.querySelector('#feedback');
  feedback.textContent = message;
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => { feedback.textContent = ''; }, 4500);
}

function save(key, value) {
  const saved = storage.set(key, value);
  if (!saved) announce('Изменения доступны до закрытия страницы. Браузер заблокировал локальное хранение.');
  return saved;
}

const main = document.querySelector('#main');

function storefront() {
  const categories = [...new Set(items.filter((item) => item.active).map((item) => item.category))];
  main.innerHTML = `
    <section class="hero">
      <div class="wrap hero-inner">
        <div class="hero-copy"><p class="eyebrow">${site.note}</p><h1>${site.title}</h1><p class="intro">${site.intro}</p>
          <a class="primary" href="#catalog">${isFlowers ? 'Выбрать букет' : 'Смотреть каталог'} <span aria-hidden="true">↗</span></a>
        </div>
        <figure class="hero-photo"><img alt="${site.heroAlt}" src="${photo(site.hero)}" fetchpriority="high"></figure>
      </div>
    </section>
    <aside class="highlights" aria-label="Условия"><div class="wrap"><dl>
      ${site.highlights.map(([title, description]) => '<div><dt>' + title + '</dt><dd>' + description + '</dd></div>').join('')}
    </dl></div></aside>
    <section id="catalog" class="wrap section">
      <div class="section-head"><h2>${site.catalog}</h2>
        <label class="filter">${site.filter}<select id="category"><option value="">Все</option>${options(categories)}</select></label>
      </div>
      <div class="card-grid" id="catalog-grid"></div>
    </section>
    <section id="faq" class="faq"><div class="wrap faq-inner"><h2>Частые вопросы</h2><div>
      ${site.faqs.map(([question, answer]) => '<details><summary>' + question + '</summary><p>' + answer + '</p></details>').join('')}
    </div></div></section>
    <dialog id="order" aria-labelledby="order-heading">
      <div class="dialog-top"><h2 id="order-heading"></h2><form method="dialog"><button class="ghost" aria-label="Закрыть форму">Закрыть</button></form></div>
      <form id="order-form">
        <div id="order-fields"></div>
        <p class="form-error" id="order-error" role="alert"></p>
        <p class="total">Итого <output id="total"></output></p>
        <p class="muted">Тестовый сценарий. Оплаты и отправки данных на сервер нет.</p>
        <button class="primary" type="submit">${site.submit}</button>
      </form>
    </dialog>
  `;
  const category = document.querySelector('#category');
  const grid = document.querySelector('#catalog-grid');
  const dialog = document.querySelector('#order');
  const form = document.querySelector('#order-form');
  const fields = document.querySelector('#order-fields');
  const error = document.querySelector('#order-error');
  const total = document.querySelector('#total');
  const basket = new Map();
  let selection;

  function showCards() {
    const visible = items.filter((item) => item.active && (!category.value || item.category === category.value));
    grid.innerHTML = visible.length ? visible.map((item) => `
      <article class="card">
        <div class="card-image"><img src="${photo(item.image)}" alt="" loading="lazy"></div>
        <div class="card-text">
          <p class="card-meta">${safe(item.meta)}</p><h3>${safe(item.name)}</h3><p>${safe(item.description)}</p>
          <div class="card-end"><div><strong>${rub.format(item.price)}</strong> <small>${site.priceHint}</small></div>
          <button class="primary" type="button" data-item="${safe(item.id)}" aria-label="${site.action} — ${safe(item.name)}">${site.action}</button></div>
        </div>
      </article>`).join('') : '<p>В этой категории пока нет доступных позиций.</p>';
  }
  category.addEventListener('change', showCards);
  showCards();

  function basketCount() {
    document.querySelector('#basket-count').textContent = [...basket.values()].reduce((total, qty) => total + qty, 0);
  }

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-item]');
    if (!button) return;
    selection = items.find((item) => item.id === button.dataset.item);
    if (isFlowers) {
      const qty = basket.get(selection.id) ?? 0;
      if (qty === 10) return announce('В корзине уже 10 таких букетов.');
      basket.set(selection.id, qty + 1);
      basketCount();
      announce('В корзине: ' + selection.name);
    } else {
      openOrder();
    }
  });
  document.querySelector('#basket-link')?.addEventListener('click', openOrder);

  function openOrder() {
    document.querySelector('#order-heading').textContent = isFlowers ? 'Корзина' : selection.name;
    error.textContent = '';
    renderFields();
    refreshTotal();
    dialog.showModal();
  }

  function renderFields(slot = '12:00–16:00') {
    if (isFlowers) {
      const products = [...basket].map(([id, qty]) => {
        const item = items.find((entry) => entry.id === id);
        return `<li><span>${safe(item.name)} × ${qty}</span><button type="button" class="ghost" data-remove="${safe(id)}" aria-label="Убрать один букет ${safe(item.name)}">Убрать один</button></li>`;
      });
      fields.innerHTML = products.length ? `<ul class="basket">${products.join('')}</ul><label>Окно доставки<select name="slot">${options(['12:00–16:00', '17:00–21:00'])}</select></label>` : '<p>Корзина пока пуста. Выберите букет в каталоге.</p>';
      if (products.length) fields.querySelector('[name=slot]').value = slot;
      form.querySelector('[type=submit]').disabled = !products.length;
      return;
    }
    const now = new Date();
    const dates = [1, 2].map((offset) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    });
    const baseWidth = selection.baseWidth ?? 140;
    const minWidth = baseWidth === 45 ? 30 : 80;
    const maxWidth = baseWidth === 45 ? 60 : 240;
    const templates = {
      sever: `<div class="field-pair"><label>Заезд<input name="from" type="date" min="${dates[0]}" value="${dates[0]}" required></label>
        <label>Выезд<input name="to" type="date" min="${dates[1]}" value="${dates[1]}" required></label></div>
        <label>Гостей<select name="guests">${options(selection.category === 'Для четверых' ? [1, 2, 3, 4] : [1, 2])}</select></label>`,
      praktika: '<label>Поток<select name="slot">' + options(['Вечерний', 'Выходного дня']) + '</select></label><p class="muted">Формат: онлайн, самостоятельные задания и итоговый проект.</p>',
      volokno: '<div class="field-pair"><label>Ширина, см<input name="width" type="number" min="' + minWidth + '" max="' + maxWidth + '" step="5" value="' + baseWidth + '" required></label><label>Материал<select name="wood">' + options(['Ясень', 'Дуб', 'Орех']) + '</select></label></div>',
      signal: '<label>Количество билетов<select name="qty">' + options([1, 2, 3, 4, 5, 6]) + '</select></label><p class="muted">' + safe(selection.meta) + '</p>',
    };
    fields.innerHTML = templates[slug];
  }

  function quote() {
    const data = new FormData(form);
    if (isFlowers) {
      const entries = [...basket].map(([id, qty]) => [items.find((item) => item.id === id), qty]);
      const subtotal = entries.reduce((cost, [item, qty]) => cost + item.price * qty, 0);
      const delivery = subtotal && subtotal < 6000 ? 350 : 0;
      return { amount: subtotal + delivery, delivery, name: entries.map(([item, qty]) => item.name + ' × ' + qty).join(', '), detail: data.get('slot') };
    }
    const name = selection.name;
    const base = selection.price;
    if (slug === 'sever') {
      const from = data.get('from');
      const to = data.get('to');
      const days = (Date.parse(to) - Date.parse(from)) / 86400000;
      if (!Number.isFinite(days) || days < 1 || days > 30) return { problem: 'Выберите от 1 до 30 ночей. Дата выезда должна быть позже заезда.' };
      return { amount: days * base, name, detail: from + ' — ' + to + ' · гостей: ' + data.get('guests') };
    }
    if (slug === 'volokno') {
      const width = Number(data.get('width'));
      const baseWidth = selection.baseWidth ?? 140;
      const minWidth = baseWidth === 45 ? 30 : 80;
      const maxWidth = baseWidth === 45 ? 60 : 240;
      if (width < minWidth || width > maxWidth || width % 5) return { problem: 'Укажите ширину от ' + minWidth + ' до ' + maxWidth + ' см с шагом 5 см.' };
      const wood = data.get('wood');
      const factor = { 'Ясень': 1, 'Дуб': 1.25, 'Орех': 1.55 }[wood];
      return { amount: Math.round(base * width / baseWidth * factor), name, detail: width + ' см · ' + wood };
    }
    if (slug === 'signal') {
      const qty = Number(data.get('qty'));
      return { amount: base * qty, name, detail: 'Билетов: ' + qty };
    }
    return { amount: base, name, detail: 'Поток: ' + data.get('slot') };
  }

  function refreshTotal() {
    const result = quote();
    error.textContent = result.problem ?? '';
    total.textContent = result.problem ? '—' : rub.format(result.amount) + (result.delivery ? ' (с доставкой)' : '');
  }
  form.addEventListener('input', refreshTotal);
  fields.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    const id = button.dataset.remove;
    const qty = basket.get(id);
    if (qty === 1) basket.delete(id);
    else basket.set(id, qty - 1);
    basketCount();
    renderFields(new FormData(form).get('slot'));
    refreshTotal();
    (fields.querySelector('[data-remove]') ?? dialog.querySelector('[method=dialog] button')).focus();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = quote();
    if (result.problem || !result.name) { refreshTotal(); return; }
    orders = storage.get('orders', orders);
    const id = globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2);
    orders.unshift({ id, ...result, status: statuses[0], created: new Date().toISOString() });
    const saved = save('orders', orders);
    if (isFlowers) { basket.clear(); basketCount(); }
    dialog.close();
    if (saved) announce('Тестовая запись добавлена. Её можно открыть в демо-админке.');
  });
}

function administration() {
  let statusFilter = '';
  main.innerHTML = `
    <div class="wrap admin">
      <header class="admin-head"><p class="eyebrow">${site.name} / Демо-панель</p><h1>Управление проектом</h1>
        <p>Изменения видны только в этом браузере. Используйте вымышленные данные.</p><a class="ghost" href="index.html">Открыть витрину ↗</a></header>
      <div class="metrics" id="metrics"></div>
      <section class="admin-panel" aria-labelledby="records-title">
        <div class="section-head"><h2 id="records-title">${site.records}</h2>
          <label class="filter">Статус<select id="status-filter"><option value="">Все</option>${options(statuses)}</select></label></div>
        <div id="records"></div>
      </section>
      <section class="admin-panel" aria-labelledby="items-title">
        <div class="section-head"><h2 id="items-title">Каталог</h2><button class="primary" id="add-item" type="button">Добавить позицию</button></div>
        <div id="items"></div>
      </section>
    </div>
    <dialog id="edit-item" aria-labelledby="edit-heading">
      <div class="dialog-top"><h2 id="edit-heading">Позиция каталога</h2><form method="dialog"><button class="ghost" aria-label="Закрыть редактор">Закрыть</button></form></div>
      <form id="edit-form">
        <label>Название<input name="name" maxlength="60" required></label>
        <div class="field-pair"><label>Категория<select name="category">${options([...new Set(site.cards.map((card) => card[1]))])}</select></label>
          <label>Цена, ₽<input name="price" type="number" min="1" max="10000000" step="1" required></label></div>
        <label>Описание<textarea name="description" rows="3" maxlength="160" required></textarea></label>
        <label class="checkbox"><input type="checkbox" name="active"> Показывать на витрине</label>
        <button class="primary" type="submit">Сохранить позицию</button>
      </form>
    </dialog>
  `;
  const records = document.querySelector('#records');
  const inventory = document.querySelector('#items');
  const editor = document.querySelector('#edit-item');
  const editForm = document.querySelector('#edit-form');
  let editing;

  function drawRecords() {
    const shown = orders.filter((order) => !statusFilter || order.status === statusFilter);
    const total = orders.filter((order) => order.status !== 'Отменена').reduce((sum, order) => sum + order.amount, 0);
    const stats = [['В каталоге', items.length], ['Тестовых записей', orders.length], ['Сумма без отменённых', rub.format(total)]];
    document.querySelector('#metrics').innerHTML = stats.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
    records.innerHTML = shown.length ? `
      <ul class="admin-list">${shown.map((order) => `
        <li><div><strong>${safe(order.name)}</strong><p>${safe(order.detail)} · ${rub.format(order.amount)}</p></div>
          <label><span class="sr-only">Статус записи ${safe(order.name)}</span><select data-order="${safe(order.id)}">
            ${statuses.map((status) => `<option${status === order.status ? ' selected' : ''}>${status}</option>`).join('')}
          </select></label></li>`).join('')}</ul>` : '<p class="empty">Здесь появятся тестовые записи с витрины.</p>';
  }

  function drawItems() {
    inventory.innerHTML = `
      <ul class="admin-list">${items.map((item) => `
        <li><div><strong>${safe(item.name)}</strong><p>${safe(item.category)} · ${rub.format(item.price)} · ${item.active ? 'На витрине' : 'Скрыта'}</p></div>
          <button class="ghost" type="button" data-edit="${safe(item.id)}">Изменить<span class="sr-only"> ${safe(item.name)}</span></button></li>
      `).join('')}</ul>`;
    drawRecords();
  }

  function edit(item) {
    editing = item;
    editForm.elements.name.value = item?.name ?? '';
    editForm.elements.category.value = item?.category ?? site.cards[0][1];
    editForm.elements.price.value = item?.price ?? '';
    editForm.elements.description.value = item?.description ?? '';
    editForm.elements.active.checked = item?.active ?? true;
    editor.showModal();
  }

  document.querySelector('#status-filter').addEventListener('change', (event) => {
    statusFilter = event.target.value;
    drawRecords();
  });
  records.addEventListener('change', (event) => {
    const control = event.target.closest('[data-order]');
    if (!control) return;
    const id = control.dataset.order;
    orders = storage.get('orders', orders).map((order) => order.id === id ? { ...order, status: control.value } : order);
    const saved = save('orders', orders);
    drawRecords();
    ([...records.querySelectorAll('[data-order]')].find((field) => field.dataset.order === id) ?? document.querySelector('#status-filter')).focus();
    if (saved) announce('Статус обновлён.');
  });
  inventory.addEventListener('click', (event) => {
    const control = event.target.closest('[data-edit]');
    if (control) edit(items.find((item) => item.id === control.dataset.edit));
  });
  document.querySelector('#add-item').addEventListener('click', () => edit());
  editForm.addEventListener('input', (event) => event.target.setCustomValidity?.(''));
  editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = new FormData(editForm);
    const name = fields.get('name').trim();
    const description = fields.get('description').trim();
    if (!name || !description) {
      const field = editForm.elements[!name ? 'name' : 'description'];
      field.setCustomValidity('Введите текст.');
      field.reportValidity();
      return;
    }
    const category = fields.get('category');
    const source = editing?.category === category ? editing : catalogItems(site).find((item) => item.category === category);
    const id = editing?.id ?? (globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36));
    const item = { id, name, description, category, price: Number(fields.get('price')), active: fields.has('active'), image: source.image, meta: source.meta, ...(source.baseWidth ? { baseWidth: source.baseWidth } : {}) };
    items = storage.get('items', items);
    items = editing ? items.map((entry) => entry.id === editing.id ? item : entry) : [...items, item];
    const saved = save('items', items);
    editor.close();
    drawItems();
    ([...inventory.querySelectorAll('[data-edit]')].find((button) => button.dataset.edit === id) ?? document.querySelector('#add-item')).focus();
    if (saved) announce('Позиция сохранена.');
  });
  window.addEventListener('storage', (event) => {
    if (event.key === prefix + 'orders') { orders = storage.get('orders', []); drawRecords(); }
    if (event.key === prefix + 'items') { items = storage.get('items', catalogItems(site)); drawItems(); }
  });
  drawItems();
}

if (publicPage) storefront();
else administration();
