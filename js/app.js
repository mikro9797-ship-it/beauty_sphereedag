/* ===== BEAUTY SPHERE — приложение ===== */
(function () {
  'use strict';

  // ---------- helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  const LS = {
    get(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  // ---------- state ----------
  const state = {
    cart: LS.get('bs_cart', []),         // [{id, qty}]
    favorites: LS.get('bs_fav', []),     // [id, ...]
    history: LS.get('bs_history', []),   // [id, ...] most-recent first
    user: LS.get('bs_user', null),       // {name, email, phone}
    accessUnlocked: LS.get('bs_unlocked', false), // boolean
    accessCodeUsed: LS.get('bs_unlocked_code', '')
  };

  function persist() {
    LS.set('bs_cart', state.cart);
    LS.set('bs_fav', state.favorites);
    LS.set('bs_history', state.history);
    LS.set('bs_user', state.user);
    LS.set('bs_unlocked', state.accessUnlocked);
    LS.set('bs_unlocked_code', state.accessCodeUsed);
  }

  // ---------- toast ----------
  let toastTimer;
  function toast(text) {
    const t = $('#toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ---------- access ----------
  function isUnlocked() { return !!state.accessUnlocked; }
  async function sha256Hex(text) {
    const buf = new TextEncoder().encode(text);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }
  async function tryCode(code) {
    const c = (code || '').trim().toUpperCase();
    if (!c) return false;
    const hash = await sha256Hex(c);
    const validHashes = (window.SITE.accessCodeHashes || []);
    const ok = validHashes.includes(hash);
    if (ok) {
      state.accessUnlocked = true;
      state.accessCodeUsed = ''; // не сохраняем сам код, только факт активации
      persist();
    }
    return ok;
  }
  function lockAccess() {
    state.accessUnlocked = false;
    state.accessCodeUsed = '';
    persist();
  }

  // ---------- cart / fav / history ----------
  function findProduct(id) { return window.PRODUCTS.find(p => p.id === id); }

  function addToCart(id, qty = 1) {
    const line = state.cart.find(l => l.id === id);
    if (line) line.qty += qty;
    else state.cart.push({ id, qty });
    persist(); updateBadges(); renderCart();
    toast('Добавлено в корзину');
  }
  function setQty(id, qty) {
    const line = state.cart.find(l => l.id === id);
    if (!line) return;
    line.qty = Math.max(1, qty);
    persist(); updateBadges(); renderCart();
  }
  function removeFromCart(id) {
    state.cart = state.cart.filter(l => l.id !== id);
    persist(); updateBadges(); renderCart();
  }
  function clearCart() { state.cart = []; persist(); updateBadges(); renderCart(); }

  function toggleFav(id) {
    const idx = state.favorites.indexOf(id);
    if (idx === -1) { state.favorites.push(id); toast('Добавлено в избранное'); }
    else { state.favorites.splice(idx, 1); toast('Удалено из избранного'); }
    persist(); updateBadges();
    // Re-render product cards' fav state
    document.querySelectorAll(`[data-fav-id="${id}"]`).forEach(el => {
      el.classList.toggle('is-fav', state.favorites.includes(id));
    });
    if (location.hash.startsWith('#/favorites')) render();
  }
  function isFav(id) { return state.favorites.includes(id); }

  function pushHistory(id) {
    state.history = [id, ...state.history.filter(x => x !== id)].slice(0, 30);
    persist();
  }

  function updateBadges() {
    const cartCount = state.cart.reduce((s, l) => s + l.qty, 0);
    const cartBadge = $('#cartBadge');
    if (cartCount > 0) { cartBadge.textContent = cartCount; cartBadge.hidden = false; }
    else { cartBadge.hidden = true; }
    const favBadge = $('#favBadge');
    if (state.favorites.length > 0) { favBadge.textContent = state.favorites.length; favBadge.hidden = false; }
    else { favBadge.hidden = true; }
  }

  // ---------- shared component renderers ----------
  function priceTag(p, big = false) {
    if (isUnlocked()) {
      const old = p.oldPrice ? `<span style="color:var(--muted-fg);text-decoration:line-through;font-size:.85em;margin-right:8px;font-weight:400;">${fmt(p.oldPrice)}</span>` : '';
      return `<span class="${big ? 'pm-price' : 'price'}">${old}${fmt(p.price)}</span>`;
    }
    return `<span class="${big ? 'pm-price' : 'price'} locked">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="11" width="16" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
      Цена по запросу
    </span>`;
  }

  function productCardHTML(p) {
    const inStock = p.inStock !== false;  // default true
    return `
    <article class="prod-card${inStock ? '' : ' is-out'}" data-id="${p.id}">
      <div class="img-wrap">
        ${p.sale ? '<span class="badge-sale">Sale</span>' : ''}
        ${inStock ? '' : '<span class="badge-order">Под заказ</span>'}
        <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" />
        <div class="actions">
          <button data-fav-id="${p.id}" class="${isFav(p.id) ? 'is-fav' : ''}" title="В избранное" data-action="fav">
            <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6Z"/></svg>
          </button>
          <button title="Быстрый просмотр" data-action="view">
            <svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button title="В корзину" data-action="cart">
            <svg viewBox="0 0 24 24"><path d="M3 4h2l2.7 12.3a2 2 0 0 0 2 1.7h7.6a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="9" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/></svg>
          </button>
        </div>
      </div>
      <div class="meta">
        <span>${escapeHtml(getCatName(p.category))}</span>
        <span>${escapeHtml(p.brand)}</span>
      </div>
      <h3>${escapeHtml(p.name)}</h3>
      <div class="price-row">${priceTag(p)}</div>
      <span class="underline"></span>
    </article>`;
  }

  function getCatName(id) {
    const c = window.CATEGORIES.find(x => x.id === id);
    return c ? c.name : id;
  }

  // ---------- routing ----------
  function parseHash() {
    const raw = (location.hash || '#/').slice(1);
    const [path, query = ''] = raw.split('?');
    const params = new URLSearchParams(query);
    return { path: path || '/', params };
  }

  function navigate(href) { location.hash = href; }

  function render() {
    const { path, params } = parseHash();
    const view = $('#view');

    // close drawers/modal on nav
    closeCart(); closeModal();

    // active nav item
    $$('.nav a').forEach(a => {
      const r = a.getAttribute('data-route');
      a.classList.toggle('active', path.startsWith('/' + r));
    });

    if (path === '/' || path === '') return renderHome(view);
    if (path.startsWith('/catalog')) return renderCatalog(view, params);
    if (path.startsWith('/brands')) return renderBrands(view, params);
    if (path.startsWith('/seminars')) return renderSeminars(view);
    if (path.startsWith('/about')) return renderAbout(view);
    if (path.startsWith('/contacts')) return renderContacts(view);
    if (path.startsWith('/account')) return renderAccount(view, params);
    if (path.startsWith('/favorites')) return renderFavorites(view);
    if (path.startsWith('/history')) return renderHistory(view);
    if (path.startsWith('/product/')) {
      const id = path.split('/')[2];
      return renderProductPage(view, id);
    }
    return renderHome(view);
  }

  // ---------- pages ----------
  function renderHome(view) {
    const featured = window.PRODUCTS.slice(0, 4);
    const cats = window.CATEGORIES.slice(0, 6);
    view.innerHTML = `
      <section class="hero">
        <div class="container hero-grid">
          <div>
            <span class="hero-eyebrow">Since 2011</span>
            <h1>Professional<span class="serif">Cosmetics</span></h1>
            <p>Эксклюзивный дистрибьютор премиальных брендов космецевтики для специалистов индустрии красоты.</p>
            <div class="hero-actions">
              <a class="btn btn-arrow" href="#/catalog">
                Каталог
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
              <a class="btn-link" href="#/brands">Наши бренды
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
          <div class="hero-visual">
            <div class="img"><img alt="BEAUTY SPHERE — Professional Cosmetics" src="https://res.cloudinary.com/dzxnhu5r4/image/upload/q_auto,f_auto,w_1400/v1778620935/IMG_0860_bduvnm.jpg"/></div>
            <div class="hero-stat">
              <span class="num">15+</span>
              <span class="lbl">Brands</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="feat-strip">
            <div class="feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 2 4 6v6c0 5 3.4 9.5 8 10 4.6-.5 8-5 8-10V6l-8-4Z"/></svg>
              <h4>Гарантия подлинности</h4>
              <p>Прямые контракты с производителями</p>
            </div>
            <div class="feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7h18M3 12h18M3 17h12"/></svg>
              <h4>15+ мировых брендов</h4>
              <p>MonaLisa, Arkana, Dr. Nona, Linerase…</p>
            </div>
            <div class="feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 1v6M12 17v6M1 12h6M17 12h6"/></svg>
              <h4>Семинары и обучение</h4>
              <p>От ведущих экспертов индустрии</p>
            </div>
            <div class="feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19 19 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2L8 9.8a16 16 0 0 0 6.2 6.2l1.2-1.2a2 2 0 0 1 2-.5c.9.3 1.9.5 2.9.6A2 2 0 0 1 22 16.9Z"/></svg>
              <h4>Личный менеджер</h4>
              <p>WhatsApp ${escapeHtml(window.SITE.phone)}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <span class="section-eyebrow">Каталог</span>
              <h2 class="section-title">Категории</h2>
            </div>
            <a class="btn-link" href="#/catalog">Весь каталог
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div class="cat-grid">
            ${cats.map(c => `
              <a class="cat-card" href="#/catalog?cat=${c.id}">
                <img src="${c.image}" alt="${escapeHtml(c.name)}" loading="lazy" />
                <div class="veil"></div>
                <div class="info">
                  <span class="num">${c.count}</span><span class="lbl">Products</span>
                  <h3>${escapeHtml(c.name)}</h3>
                  <span class="underline"></span>
                </div>
              </a>`).join('')}
          </div>
        </div>
      </section>

      <section class="section" style="background: var(--muted-bg);">
        <div class="container">
          <div class="section-head" style="text-align:center; flex-direction:column; align-items:center;">
            <div>
              <span class="section-eyebrow">Partners</span>
              <h2 class="section-title">Наши <span class="accent">бренды</span></h2>
              <p class="section-lead" style="margin: 0 auto;">Официальное представительство ведущих мировых производителей</p>
            </div>
          </div>
          <div class="brand-grid">
            ${window.BRANDS.map(b => `<a class="brand-cell" href="#/catalog?brand=${encodeURIComponent(b)}">${escapeHtml(b)}</a>`).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <span class="section-eyebrow">Featured</span>
              <h2 class="section-title">Популярные <span class="accent">продукты</span></h2>
              <p class="section-lead">Тщательно отобранные препараты от ведущих мировых производителей.</p>
            </div>
            <a class="btn-link" href="#/catalog">Весь каталог
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div class="prod-grid">${featured.map(productCardHTML).join('')}</div>
        </div>
      </section>

      <section class="section" style="background: var(--muted-bg);">
        <div class="container">
          <div class="section-head">
            <div>
              <span class="section-eyebrow">Education</span>
              <h2 class="section-title">Ближайшие <span class="accent">семинары</span></h2>
              <p class="section-lead">Авторские курсы и практикумы от Dr. Gulnara Rash и команды экспертов BEAUTY SPHERE.</p>
            </div>
            <a class="btn-link" href="#/seminars">Расписание
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div class="seminar-grid">${window.SEMINARS.slice(0, 3).map(seminarCardHTML).join('')}</div>
        </div>
      </section>

      <section class="section">
        <div class="container" style="text-align:center;">
          <span class="section-eyebrow">Contact us</span>
          <h2 class="section-title">Готовы <span class="accent">сделать заказ</span>?</h2>
          <p class="section-lead" style="margin: 0 auto 32px;">Напишите менеджеру в WhatsApp — мы подберём препараты под вашу задачу и расскажем про актуальные акции.</p>
          <a class="btn btn-wa" href="${window.SITE.whatsapp}" target="_blank" rel="noopener">
            <svg viewBox="0 0 32 32"><path d="M16 3C9 3 3.5 8.5 3.5 15.4c0 2.5.7 4.8 2 6.9L3 29l6.9-2.4c2 1.1 4.3 1.7 6.6 1.7 7 0 12.5-5.5 12.5-12.4 0-3.3-1.3-6.4-3.7-8.8C22.4 4.3 19.3 3 16 3Z"/></svg>
            Написать в WhatsApp
          </a>
        </div>
      </section>
    `;
    bindProductCards(view);
  }

  function renderCatalog(view, params) {
    const cat = params.get('cat') || 'all';
    const brand = params.get('brand') || 'all';
    const sort = params.get('sort') || 'default';
    const stock = params.get('stock') || 'instock'; // 'instock' | 'all'

    let items = window.PRODUCTS.slice();
    if (cat !== 'all') items = items.filter(p => p.category === cat);
    if (brand !== 'all') items = items.filter(p => p.brand === brand);
    if (stock === 'instock') items = items.filter(p => p.inStock !== false);

    // Приоритеты брендов для сортировки «По популярности» — флагманы выше
    const POP_BRANDS = ["MonaLisa","Reborn PLA","TrueSelf PLA","PLA Rich","Linerase","Karisma Collagen",
      "Akradex","Vital Essential Cosmetics","Harmony Castle","Skin Synergy","Factology","Arkana",
      "Dr. Nona","Gemmis","product by Dr. Slava","Infini Premium Filler"];
    const popRank = (b) => {
      const i = POP_BRANDS.indexOf(b);
      return i === -1 ? 99 : i;
    };

    if (sort === 'price-asc') {
      // Цена ↑: товары без цены — в конец
      items.sort((a, b) => (a.price || 999999) - (b.price || 999999));
    } else if (sort === 'price-desc') {
      items.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'name') {
      items.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    } else {
      // «По популярности»: чередуем бренды (round-robin), чтобы один бренд не шёл подряд.
      // Внутри каждого бренда сначала идут товары в наличии с ценой, потом остальные.
      const buckets = new Map(); // brand → [products in priority]
      for (const p of items) {
        if (!buckets.has(p.brand)) buckets.set(p.brand, []);
        buckets.get(p.brand).push(p);
      }
      // Сортировка внутри каждого бренда: в наличии → есть цена → имя
      for (const arr of buckets.values()) {
        arr.sort((a, b) => {
          const aIn = a.inStock !== false ? 0 : 1;
          const bIn = b.inStock !== false ? 0 : 1;
          if (aIn !== bIn) return aIn - bIn;
          const aP = a.price > 0 ? 0 : 1;
          const bP = b.price > 0 ? 0 : 1;
          if (aP !== bP) return aP - bP;
          return a.name.localeCompare(b.name, 'ru');
        });
      }
      // Порядок брендов в первом «круге»: priority-бренды раньше, остальные дальше
      const brandOrder = Array.from(buckets.keys()).sort((a, b) => {
        const ra = popRank(a), rb = popRank(b);
        if (ra !== rb) return ra - rb;
        return a.localeCompare(b, 'ru');
      });
      // Round-robin: берём по одному из каждого бренда, пока есть что брать
      const out = [];
      let added = true;
      while (added) {
        added = false;
        for (const b of brandOrder) {
          const arr = buckets.get(b);
          if (arr && arr.length) {
            out.push(arr.shift());
            added = true;
          }
        }
      }
      items = out;
    }

    view.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="crumbs">
            <a href="#/">Главная</a><span class="sep">/</span>
            <span>Каталог${cat !== 'all' ? ' / ' + escapeHtml(getCatName(cat)) : ''}${brand !== 'all' ? ' / ' + escapeHtml(brand) : ''}</span>
          </div>
          <span class="section-eyebrow">Catalog</span>
          <h1 class="section-title" style="margin-bottom:24px;">${cat !== 'all' ? escapeHtml(getCatName(cat)) : 'Каталог'}</h1>

          <div class="cat-toolbar">
            <button class="chip ${cat === 'all' ? 'active' : ''}" data-cat="all">Все</button>
            ${window.CATEGORIES.map(c => `
              <button class="chip ${cat === c.id ? 'active' : ''}" data-cat="${c.id}">${escapeHtml(c.name)}</button>
            `).join('')}
            <span class="grow"></span>
            <select id="brandSelect">
              <option value="all" ${brand === 'all' ? 'selected' : ''}>Все бренды</option>
              ${window.BRANDS.map(b => `<option value="${escapeHtml(b)}" ${brand === b ? 'selected' : ''}>${escapeHtml(b)}</option>`).join('')}
            </select>
            <select id="sortSelect">
              <option value="default" ${sort === 'default' ? 'selected' : ''}>По популярности</option>
              <option value="price-asc" ${sort === 'price-asc' ? 'selected' : ''}>Цена ↑</option>
              <option value="price-desc" ${sort === 'price-desc' ? 'selected' : ''}>Цена ↓</option>
              <option value="name" ${sort === 'name' ? 'selected' : ''}>По названию</option>
            </select>
            <select id="stockSelect">
              <option value="instock" ${stock === 'instock' ? 'selected' : ''}>Только в наличии</option>
              <option value="all" ${stock === 'all' ? 'selected' : ''}>Все товары (вкл. под заказ)</option>
            </select>
          </div>

          ${!isUnlocked() ? `
            <div class="unlocked-banner" style="background: rgba(212,165,165,0.10); border-color: var(--primary); color: var(--fg);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="11" width="16" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
              <div style="flex:1">
                Цены доступны после активации профиля специалиста.
                <a href="#/account?tab=access" style="color:var(--primary-dark); text-decoration: underline; margin-left:6px;">Ввести код доступа</a>
              </div>
            </div>` : ''}

          <div class="prod-grid">${items.length ? items.map(productCardHTML).join('') : '<p style="grid-column: 1/-1; padding:40px 0;color:var(--muted-fg);">Ничего не найдено по выбранным фильтрам.</p>'}</div>
        </div>
      </section>
    `;
    bindProductCards(view);

    // toolbar handlers (defined buildUrl below)
    $$('.cat-toolbar .chip', view).forEach(b => b.addEventListener('click', () => {
      navigate(buildUrl({ cat: b.getAttribute('data-cat') }));
    }));
    function buildUrl(overrides) {
      const p = { cat, brand, sort, stock, ...overrides };
      const parts = [];
      if (p.cat && p.cat !== 'all') parts.push('cat=' + p.cat);
      if (p.brand && p.brand !== 'all') parts.push('brand=' + encodeURIComponent(p.brand));
      if (p.sort && p.sort !== 'default') parts.push('sort=' + p.sort);
      if (p.stock && p.stock !== 'instock') parts.push('stock=' + p.stock);
      return '#/catalog' + (parts.length ? '?' + parts.join('&') : '');
    }
    $('#brandSelect', view).addEventListener('change', (e) => navigate(buildUrl({ brand: e.target.value })));
    $('#sortSelect', view).addEventListener('change', (e) => navigate(buildUrl({ sort: e.target.value })));
    $('#stockSelect', view).addEventListener('change', (e) => navigate(buildUrl({ stock: e.target.value })));
  }

  function renderBrands(view) {
    view.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="crumbs"><a href="#/">Главная</a><span class="sep">/</span><span>Бренды</span></div>
          <span class="section-eyebrow">Partners</span>
          <h1 class="section-title">Наши <span class="accent">бренды</span></h1>
          <p class="section-lead" style="margin-bottom:48px;">Официальное представительство ведущих мировых производителей. Гарантия подлинности и прямых поставок.</p>
          <div class="brand-grid">
            ${window.BRANDS.map(b => `<a class="brand-cell" href="#/catalog?brand=${encodeURIComponent(b)}">${escapeHtml(b)}</a>`).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function seminarCardHTML(s) {
    return `
      <article class="seminar-card" data-sem="${s.id}">
        <div class="img-wrap"><img src="${s.image}" alt="${escapeHtml(s.title)}" loading="lazy" /></div>
        <div class="body">
          <div class="tags">
            <span class="tag tag-pill">${escapeHtml(s.format)}</span>
            <span class="tag">${escapeHtml(s.date)}</span>
            <span class="tag">${escapeHtml(s.city)}</span>
          </div>
          <h3>${escapeHtml(s.title)}</h3>
          <p class="lecturer">Лектор: ${escapeHtml(s.lecturer)} · ${escapeHtml(s.duration)}</p>
          <p style="margin:0;color:var(--muted-fg);font-size:14px;line-height:1.6;">${escapeHtml(s.description)}</p>
          <div class="meta">
            <span class="price">${fmt(s.price)}</span>
            <a class="btn btn-wa" href="${seminarWaLink(s)}" target="_blank" rel="noopener">
              <svg viewBox="0 0 32 32"><path d="M16 3C9 3 3.5 8.5 3.5 15.4c0 2.5.7 4.8 2 6.9L3 29l6.9-2.4c2 1.1 4.3 1.7 6.6 1.7 7 0 12.5-5.5 12.5-12.4 0-3.3-1.3-6.4-3.7-8.8C22.4 4.3 19.3 3 16 3Z"/></svg>
              Записаться
            </a>
          </div>
        </div>
      </article>
    `;
  }

  function seminarWaLink(s) {
    const text = `Здравствуйте! Хочу записаться на семинар «${s.title}» (${s.date}, ${s.city}). Стоимость ${fmt(s.price)}.`;
    return `https://wa.me/${window.SITE.phoneRaw}?text=${encodeURIComponent(text)}`;
  }

  function renderSeminars(view) {
    view.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="crumbs"><a href="#/">Главная</a><span class="sep">/</span><span>Семинары</span></div>
          <span class="section-eyebrow">Education</span>
          <h1 class="section-title">Семинары и <span class="accent">обучение</span></h1>
          <p class="section-lead" style="margin-bottom:48px;">Авторские курсы и практикумы от Dr. Gulnara Rash и команды экспертов BEAUTY SPHERE. Сертификация специалистов.</p>
          <div class="seminar-grid">${window.SEMINARS.map(seminarCardHTML).join('')}</div>
        </div>
      </section>

      <section class="section" style="background: var(--muted-bg);">
        <div class="container info-grid">
          <div class="info-tile">
            <div class="num">01</div>
            <h3>Подайте заявку</h3>
            <p>Выберите семинар и нажмите «Записаться». Менеджер свяжется в WhatsApp.</p>
          </div>
          <div class="info-tile">
            <div class="num">02</div>
            <h3>Подтверждение и оплата</h3>
            <p>Менеджер подтверждает место в группе, отправляет реквизиты для оплаты.</p>
          </div>
          <div class="info-tile">
            <div class="num">03</div>
            <h3>Сертификат</h3>
            <p>По итогу — сертификат BEAUTY SPHERE и доступ к материалам семинара.</p>
          </div>
        </div>
      </section>
    `;
  }

  function renderAbout(view) {
    view.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="crumbs"><a href="#/">Главная</a><span class="sep">/</span><span>О нас</span></div>
          <span class="section-eyebrow">About</span>
          <h1 class="section-title">BEAUTY SPHERE <span class="accent">DAG</span></h1>
          <p class="section-lead">Официальный дистрибьютор премиальных брендов космецевтики для специалистов индустрии красоты с 2011 года. Махачкала · Северный Кавказ · вся Россия.</p>
        </div>
      </section>

      <section class="section" style="padding-top: 0;">
        <div class="container info-grid">
          <div class="info-tile">
            <div class="num">15+</div>
            <h3>Мировых брендов</h3>
            <p>MonaLisa, Arkana, Dr. Nona, Linerase, Karisma Collagen, PLA Rich, Reborn, Infini Lutronic и другие.</p>
          </div>
          <div class="info-tile">
            <div class="num">2011</div>
            <h3>На рынке с 2011</h3>
            <p>15 лет опыта работы с врачами-косметологами, клиниками и салонами красоты по всей стране.</p>
          </div>
          <div class="info-tile">
            <div class="num">5K+</div>
            <h3>Специалистов</h3>
            <p>Прошли обучение на наших семинарах и работают с продукцией BEAUTY SPHERE.</p>
          </div>
        </div>
      </section>

      <section class="section" style="background: var(--muted-bg);">
        <div class="container" style="display:grid; gap:48px; grid-template-columns: 1fr;">
          <div>
            <span class="section-eyebrow">Expert</span>
            <h2 class="section-title">Dr. Gulnara <span class="accent">Rash</span></h2>
            <p class="section-lead">Врач-косметолог, эксперт индустрии, автор методик. Лектор международных конгрессов, ведущий преподаватель образовательных программ BEAUTY SPHERE.</p>
            <p style="margin-top:24px;"><a class="btn-link" href="${window.SITE.instagram}" target="_blank" rel="noopener">@beauty_spheree_dag в Instagram
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a></p>
          </div>
        </div>
      </section>
    `;
  }

  function renderContacts(view) {
    view.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="crumbs"><a href="#/">Главная</a><span class="sep">/</span><span>Контакты</span></div>
          <span class="section-eyebrow">Contacts</span>
          <h1 class="section-title">Свяжитесь <span class="accent">с нами</span></h1>
        </div>
      </section>

      <section class="section" style="padding-top: 0;">
        <div class="container info-grid">
          <div class="info-tile">
            <h3>Телефон / WhatsApp</h3>
            <p style="margin-bottom: 16px;"><a href="tel:${window.SITE.phoneRaw}" style="color:var(--fg);">${escapeHtml(window.SITE.phone)}</a></p>
            <a class="btn btn-wa" href="${window.SITE.whatsapp}" target="_blank" rel="noopener">
              <svg viewBox="0 0 32 32"><path d="M16 3C9 3 3.5 8.5 3.5 15.4c0 2.5.7 4.8 2 6.9L3 29l6.9-2.4c2 1.1 4.3 1.7 6.6 1.7 7 0 12.5-5.5 12.5-12.4 0-3.3-1.3-6.4-3.7-8.8C22.4 4.3 19.3 3 16 3Z"/></svg>
              Написать в WhatsApp
            </a>
          </div>
          <div class="info-tile">
            <h3>Адрес</h3>
            <p>${escapeHtml(window.SITE.address)}</p>
            <p style="margin-top:12px;font-size:13px;">Ежедневно 9:00–18:00<br/>Без выходных</p>
          </div>
          <div class="info-tile">
            <h3>Почта и соцсети</h3>
            <p><a href="mailto:${window.SITE.email}" style="color:var(--fg);">${escapeHtml(window.SITE.email)}</a></p>
            <p style="margin-top:8px;"><a href="${window.SITE.instagram}" target="_blank" rel="noopener" style="color:var(--fg);">@beauty_spheree_dag</a></p>
          </div>
        </div>
      </section>
    `;
  }

  // ---------- Account ----------
  function renderAccount(view, params) {
    const tab = params.get('tab') || (state.user ? 'profile' : 'login');
    view.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="crumbs"><a href="#/">Главная</a><span class="sep">/</span><span>Личный кабинет</span></div>
          <span class="section-eyebrow">Account</span>
          <h1 class="section-title">Личный <span class="accent">кабинет</span></h1>

          <div class="account-grid">
            <aside class="account-side">
              ${state.user ? `
                <div class="me">
                  <strong>${escapeHtml(state.user.name)}</strong>
                  <span>${escapeHtml(state.user.email || '')}</span>
                </div>
              ` : ''}
              <button class="${tab === 'profile' ? 'active' : ''}" data-tab="profile">Профиль</button>
              <button class="${tab === 'access' ? 'active' : ''}" data-tab="access">Код доступа</button>
              <button class="${tab === 'orders' ? 'active' : ''}" data-tab="orders">Мои заказы</button>
              <button class="${tab === 'favorites' ? 'active' : ''}" data-tab="favorites">Избранное</button>
              <button class="${tab === 'history' ? 'active' : ''}" data-tab="history">История просмотров</button>
              ${state.user ? `<button data-tab="logout">Выйти</button>` : `<button data-tab="login" class="${tab === 'login' ? 'active' : ''}">Войти</button>`}
            </aside>
            <div class="account-main" id="accountPane"></div>
          </div>
        </div>
      </section>
    `;
    $$('.account-side button', view).forEach(b => b.addEventListener('click', () => {
      const t = b.getAttribute('data-tab');
      if (t === 'logout') {
        state.user = null;
        // При выходе сбрасываем доступ к ценам — следующий пользователь должен заново ввести код
        lockAccess();
        navigate('#/account?tab=login');
        return;
      }
      if (t === 'favorites') return navigate('#/favorites');
      if (t === 'history') return navigate('#/history');
      navigate('#/account?tab=' + t);
    }));
    renderAccountPane(tab);
  }

  function renderAccountPane(tab) {
    const pane = $('#accountPane');
    if (!pane) return;
    if (tab === 'login') return paneLogin(pane);
    if (tab === 'access') return paneAccess(pane);
    if (tab === 'orders') return paneOrders(pane);
    if (tab === 'profile') return state.user ? paneProfile(pane) : paneLogin(pane);
    pane.innerHTML = '';
  }

  function paneLogin(pane) {
    pane.innerHTML = `
      <h2>Войти / зарегистрироваться</h2>
      <p class="lead">Регистрация без пароля — вход по имени и контактам. Все данные хранятся локально в браузере.</p>
      <form id="loginForm">
        <div class="field"><label>Имя</label><input name="name" required placeholder="Анна Иванова"/></div>
        <div class="field"><label>Email</label><input name="email" type="email" placeholder="anna@example.com"/></div>
        <div class="field"><label>Телефон</label><input name="phone" type="tel" placeholder="+7 ___ ___-__-__"/></div>
        <div class="field"><label>Специализация</label>
          <select name="role">
            <option value="cosmetologist">Косметолог</option>
            <option value="clinic">Клиника / салон</option>
            <option value="student">Студент курсов</option>
            <option value="guest">Просто интересуюсь</option>
          </select>
        </div>
        <button class="btn" type="submit">Войти в кабинет</button>
      </form>
    `;
    $('#loginForm', pane).addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      state.user = { name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), role: fd.get('role') };
      // При новой регистрации — состояние доступа к ценам сбрасываем (новый пользователь должен заново ввести код)
      lockAccess();
      toast('Добро пожаловать, ' + state.user.name + '!');
      navigate('#/account?tab=profile');
    });
  }

  function paneProfile(pane) {
    pane.innerHTML = `
      <h2>Профиль</h2>
      <p class="lead">Ваши данные. Их видите только вы — они хранятся в браузере.</p>
      ${isUnlocked()
        ? `<div class="unlocked-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 6 9 17l-5-5"/></svg>
            <div>Доступ к ценам активирован.</div>
          </div>`
        : `<div class="unlocked-banner" style="background: rgba(212,165,165,0.10); border-color: var(--primary); color: var(--fg);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="11" width="16" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            <div>Цены скрыты. <a href="#/account?tab=access" style="color: var(--primary-dark); text-decoration: underline;">Ввести код доступа</a> от менеджера.</div>
          </div>`}
      <form id="profForm">
        <div class="field"><label>Имя</label><input name="name" value="${escapeHtml(state.user.name || '')}"/></div>
        <div class="field"><label>Email</label><input name="email" type="email" value="${escapeHtml(state.user.email || '')}"/></div>
        <div class="field"><label>Телефон</label><input name="phone" type="tel" value="${escapeHtml(state.user.phone || '')}"/></div>
        <button class="btn" type="submit">Сохранить</button>
      </form>
    `;
    $('#profForm', pane).addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      state.user = Object.assign({}, state.user, { name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone') });
      persist();
      toast('Сохранено');
    });
  }

  function paneAccess(pane) {
    pane.innerHTML = `
      <h2>Код доступа к ценам</h2>
      <p class="lead">Цены доступны только верифицированным специалистам. Запросите код у менеджера в WhatsApp и введите его ниже.</p>

      ${isUnlocked() ? `
        <div class="unlocked-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 6 9 17l-5-5"/></svg>
          <div>Доступ к ценам активирован.</div>
        </div>
        <button class="btn btn-ghost" id="lockBtn">Сбросить доступ</button>
      ` : `
        <div class="code-card">
          <h3>Введите ваш код</h3>
          <p>Код выдаёт менеджер BEAUTY SPHERE индивидуально каждому верифицированному специалисту через WhatsApp. Если у вас ещё нет кода — нажмите кнопку ниже.</p>
          <form class="code-form" id="codeForm">
            <input id="codeInput" placeholder="ВАШ КОД" autocomplete="off"/>
            <button class="btn" type="submit">Активировать</button>
          </form>
          <div id="codeStatus"></div>
        </div>
        <p style="margin-top: 24px;">Ещё нет кода?
          <a class="btn btn-wa" href="${requestCodeWaLink()}" target="_blank" rel="noopener" style="margin-left: 8px;">
            <svg viewBox="0 0 32 32"><path d="M16 3C9 3 3.5 8.5 3.5 15.4c0 2.5.7 4.8 2 6.9L3 29l6.9-2.4c2 1.1 4.3 1.7 6.6 1.7 7 0 12.5-5.5 12.5-12.4 0-3.3-1.3-6.4-3.7-8.8C22.4 4.3 19.3 3 16 3Z"/></svg>
            Запросить код в WhatsApp
          </a>
        </p>
      `}
    `;
    if (isUnlocked()) {
      $('#lockBtn').addEventListener('click', () => {
        lockAccess();
        toast('Доступ к ценам сброшен');
        renderAccountPane('access');
      });
    } else {
      $('#codeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = $('#codeInput').value;
        const status = $('#codeStatus');
        status.className = '';
        status.textContent = 'Проверяю код…';
        const ok = await tryCode(code);
        if (ok) {
          status.className = 'code-status ok';
          status.textContent = 'Готово! Код принят. Цены теперь видны во всём каталоге.';
          toast('Доступ активирован');
          setTimeout(() => renderAccountPane('access'), 800);
        } else {
          status.className = 'code-status err';
          status.textContent = 'Код не распознан. Проверьте написание или запросите новый код у менеджера.';
        }
      });
    }
  }

  function paneOrders(pane) {
    // Demo: orders aren't stored on backend; show only the "history" of WA-checkouts.
    const orders = LS.get('bs_orders', []);
    if (!orders.length) {
      pane.innerHTML = `
        <h2>Мои заказы</h2>
        <p class="lead">Здесь появятся ваши заказы, оформленные через WhatsApp.</p>
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 4h2l2.7 12.3a2 2 0 0 0 2 1.7h7.6a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="9" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/></svg>
          <h3>Пока нет заказов</h3>
          <p>Перейдите в каталог, добавьте товары в корзину и оформите заказ через WhatsApp.</p>
          <a class="btn" href="#/catalog">В каталог</a>
        </div>`;
      return;
    }
    pane.innerHTML = `
      <h2>Мои заказы</h2>
      <p class="lead">История ваших заявок через WhatsApp.</p>
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${orders.slice().reverse().map(o => `
          <div style="border:1px solid var(--border); padding:20px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted-fg);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">
              <span>Заказ #${escapeHtml(o.num)}</span>
              <span>${escapeHtml(o.date)}</span>
            </div>
            <div style="font-size:14px;color:var(--muted-fg);">${o.items.length} позиций · ${isUnlocked() ? fmt(o.total) : 'цена по запросу'}</div>
          </div>`).join('')}
      </div>
    `;
  }

  function requestCodeWaLink() {
    const text = `Здравствуйте! Я ${state.user ? state.user.name : ''} — хочу получить код доступа к ценам в BEAUTY SPHERE.`;
    return `https://wa.me/${window.SITE.phoneRaw}?text=${encodeURIComponent(text)}`;
  }

  function renderFavorites(view) {
    const items = state.favorites.map(findProduct).filter(Boolean);
    view.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="crumbs"><a href="#/">Главная</a><span class="sep">/</span><span>Избранное</span></div>
          <span class="section-eyebrow">Wishlist</span>
          <h1 class="section-title">Избранное</h1>
          ${items.length ? `<div class="prod-grid" style="margin-top: 32px;">${items.map(productCardHTML).join('')}</div>` : `
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6Z"/></svg>
              <h3>Список избранного пуст</h3>
              <p>Нажимайте сердечко на карточках товаров, чтобы добавить их сюда.</p>
              <a class="btn" href="#/catalog">В каталог</a>
            </div>
          `}
        </div>
      </section>
    `;
    bindProductCards(view);
  }

  function renderHistory(view) {
    const items = state.history.map(findProduct).filter(Boolean);
    view.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="crumbs"><a href="#/">Главная</a><span class="sep">/</span><span>История просмотров</span></div>
          <span class="section-eyebrow">Recently viewed</span>
          <h1 class="section-title">История <span class="accent">просмотров</span></h1>
          ${items.length ? `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
              <p style="color:var(--muted-fg);margin:0;">Последние ${items.length} просмотренных товара.</p>
              <button class="btn-link" id="clearHist">Очистить историю</button>
            </div>
            <div class="prod-grid" style="margin-top: 24px;">${items.map(productCardHTML).join('')}</div>
          ` : `
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg>
              <h3>История пуста</h3>
              <p>Просмотренные товары будут появляться здесь.</p>
              <a class="btn" href="#/catalog">В каталог</a>
            </div>
          `}
        </div>
      </section>
    `;
    bindProductCards(view);
    const clr = $('#clearHist');
    if (clr) clr.addEventListener('click', () => { state.history = []; persist(); render(); });
  }

  function renderProductPage(view, id) {
    const p = findProduct(id);
    if (!p) {
      view.innerHTML = `<section class="section"><div class="container"><h1 class="section-title">Не найдено</h1><a class="btn" href="#/catalog">В каталог</a></div></section>`;
      return;
    }
    pushHistory(p.id);
    const related = window.PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);

    view.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="crumbs">
            <a href="#/">Главная</a><span class="sep">/</span>
            <a href="#/catalog?cat=${p.category}">${escapeHtml(getCatName(p.category))}</a><span class="sep">/</span>
            <span>${escapeHtml(p.name)}</span>
          </div>
          <div class="product-modal" style="background:var(--white); border:1px solid var(--border);">
            <div class="pm-img"><img src="${p.image}" alt="${escapeHtml(p.name)}"/></div>
            <div class="pm-body">
              <div class="meta"><span>${escapeHtml(getCatName(p.category))}</span><span>${escapeHtml(p.brand)}</span></div>
              <h2>${escapeHtml(p.name)}</h2>
              <p class="desc">${escapeHtml(p.description)}</p>
              <dl class="pm-attrs">
                <dt>Бренд</dt><dd>${escapeHtml(p.brand)}</dd>
                <dt>Объём</dt><dd>${escapeHtml(p.volume || '—')}</dd>
                <dt>Категория</dt><dd>${escapeHtml(getCatName(p.category))}</dd>
                <dt>Артикул</dt><dd>${escapeHtml(p.id.toUpperCase())}</dd>
              </dl>
              <div class="pm-price-row">${priceTag(p, true)}</div>
              <div class="pm-actions">
                <button class="btn" data-add="${p.id}">В корзину</button>
                <button class="btn btn-ghost" data-fav-toggle="${p.id}">${isFav(p.id) ? '❤︎ В избранном' : 'В избранное'}</button>
                <a class="btn btn-wa" href="${productWaLink(p)}" target="_blank" rel="noopener">
                  <svg viewBox="0 0 32 32"><path d="M16 3C9 3 3.5 8.5 3.5 15.4c0 2.5.7 4.8 2 6.9L3 29l6.9-2.4c2 1.1 4.3 1.7 6.6 1.7 7 0 12.5-5.5 12.5-12.4 0-3.3-1.3-6.4-3.7-8.8C22.4 4.3 19.3 3 16 3Z"/></svg>
                  Заказать в WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      ${related.length ? `
        <section class="section" style="padding-top:0;">
          <div class="container">
            <span class="section-eyebrow">Related</span>
            <h2 class="section-title">Похожие <span class="accent">препараты</span></h2>
            <div class="prod-grid" style="margin-top:32px;">${related.map(productCardHTML).join('')}</div>
          </div>
        </section>
      ` : ''}
    `;
    $(`[data-add="${p.id}"]`, view).addEventListener('click', () => addToCart(p.id));
    $(`[data-fav-toggle="${p.id}"]`, view).addEventListener('click', () => { toggleFav(p.id); render(); });
    bindProductCards(view);
  }

  function productWaLink(p) {
    const text = `Здравствуйте! Хочу заказать «${p.name}» (${p.brand}). Артикул ${p.id.toUpperCase()}.`;
    return `https://wa.me/${window.SITE.phoneRaw}?text=${encodeURIComponent(text)}`;
  }

  // ---------- Cart drawer ----------
  function openCart() { $('#cartDrawer').classList.add('open'); $('#cartDrawer').setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; renderCart(); }
  function closeCart() { $('#cartDrawer').classList.remove('open'); $('#cartDrawer').setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }

  function renderCart() {
    const body = $('#cartBody'); const foot = $('#cartFoot');
    if (!body || !foot) return;
    if (!state.cart.length) {
      body.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.4" style="opacity:.4"><path d="M3 4h2l2.7 12.3a2 2 0 0 0 2 1.7h7.6a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="9" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/></svg>
          <p>Корзина пуста</p>
          <a class="btn" href="#/catalog" data-close>В каталог</a>
        </div>`;
      foot.innerHTML = '';
      return;
    }
    const lines = state.cart.map(l => {
      const p = findProduct(l.id); if (!p) return '';
      return `
        <div class="cart-line">
          <div class="img"><img src="${p.image}" alt=""/></div>
          <div class="info">
            <div class="brand">${escapeHtml(p.brand)}</div>
            <h4>${escapeHtml(p.name)}</h4>
            <div class="qty" data-id="${p.id}">
              <button data-q="-1">−</button>
              <span>${l.qty}</span>
              <button data-q="+1">+</button>
            </div>
          </div>
          <div class="right">
            ${isUnlocked() ? `<span class="price">${fmt(p.price * l.qty)}</span>` : `<span class="price" style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted-fg);">по запросу</span>`}
            <button class="rm" data-rm="${p.id}">удалить</button>
          </div>
        </div>`;
    }).join('');
    body.innerHTML = lines;

    const total = state.cart.reduce((s, l) => {
      const p = findProduct(l.id); return p ? s + p.price * l.qty : s;
    }, 0);
    const itemCount = state.cart.reduce((s, l) => s + l.qty, 0);

    foot.innerHTML = `
      <div class="cart-totals">
        <span class="lbl">Итого, ${itemCount} шт.</span>
        <span class="sum">${isUnlocked() ? fmt(total) : 'по запросу'}</span>
      </div>
      <p class="cart-foot-note">Оформление заказа происходит через WhatsApp с менеджером ${escapeHtml(window.SITE.phone)}. Менеджер уточнит наличие и условия доставки.</p>
      <a class="btn btn-wa" id="checkoutBtn" href="#" style="width:100%; justify-content:center;">
        <svg viewBox="0 0 32 32"><path d="M16 3C9 3 3.5 8.5 3.5 15.4c0 2.5.7 4.8 2 6.9L3 29l6.9-2.4c2 1.1 4.3 1.7 6.6 1.7 7 0 12.5-5.5 12.5-12.4 0-3.3-1.3-6.4-3.7-8.8C22.4 4.3 19.3 3 16 3Z"/></svg>
        Оформить через WhatsApp
      </a>
      <button class="btn-link" id="clearCartBtn" style="margin-top:14px;">Очистить корзину</button>
    `;

    body.querySelectorAll('.qty').forEach(q => {
      const id = q.dataset.id;
      q.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
        const delta = parseInt(btn.dataset.q, 10);
        const line = state.cart.find(l => l.id === id);
        setQty(id, line.qty + delta);
      }));
    });
    body.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => removeFromCart(b.dataset.rm)));

    $('#checkoutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      checkoutWA();
    });
    $('#clearCartBtn').addEventListener('click', clearCart);
  }

  function checkoutWA() {
    if (!state.cart.length) return;
    const lines = state.cart.map(l => {
      const p = findProduct(l.id);
      const priceStr = isUnlocked() ? ` — ${fmt(p.price * l.qty)}` : '';
      return `• ${p.name} (${p.brand}) × ${l.qty}${priceStr}`;
    }).join('\n');
    const total = state.cart.reduce((s, l) => { const p = findProduct(l.id); return p ? s + p.price * l.qty : s; }, 0);
    const totalStr = isUnlocked() ? `\n\nИтого: ${fmt(total)}` : '\n\nЦены — по запросу.';
    const userInfo = state.user ? `\n\nЯ: ${state.user.name}${state.user.phone ? ', ' + state.user.phone : ''}${state.user.email ? ', ' + state.user.email : ''}` : '';
    const text = `Здравствуйте! Хочу оформить заказ:\n\n${lines}${totalStr}${userInfo}`;
    const url = `https://wa.me/${window.SITE.phoneRaw}?text=${encodeURIComponent(text)}`;

    // save in local "orders"
    const orders = LS.get('bs_orders', []);
    orders.push({
      num: String(Date.now()).slice(-6),
      date: new Date().toLocaleDateString('ru-RU'),
      items: state.cart.slice(),
      total
    });
    LS.set('bs_orders', orders);

    window.open(url, '_blank', 'noopener');
    toast('Открываем WhatsApp…');
  }

  // ---------- Product modal ----------
  function openModal(id) {
    const p = findProduct(id); if (!p) return;
    pushHistory(p.id);
    $('#modalBody').innerHTML = `
      <div class="product-modal">
        <div class="pm-img"><img src="${p.image}" alt="${escapeHtml(p.name)}"/></div>
        <div class="pm-body">
          <div class="meta"><span>${escapeHtml(getCatName(p.category))}</span><span>${escapeHtml(p.brand)}</span></div>
          <h2>${escapeHtml(p.name)}</h2>
          <p class="desc">${escapeHtml(p.description)}</p>
          <dl class="pm-attrs">
            <dt>Бренд</dt><dd>${escapeHtml(p.brand)}</dd>
            <dt>Объём</dt><dd>${escapeHtml(p.volume || '—')}</dd>
            <dt>Артикул</dt><dd>${escapeHtml(p.id.toUpperCase())}</dd>
          </dl>
          <div class="pm-price-row">${priceTag(p, true)}</div>
          <div class="pm-actions">
            <button class="btn" data-add="${p.id}">В корзину</button>
            <button class="btn btn-ghost" data-fav-toggle="${p.id}">${isFav(p.id) ? '❤︎ В избранном' : 'В избранное'}</button>
            <a class="btn-link" href="#/product/${p.id}">Открыть страницу
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    `;
    $('#productModal').classList.add('open');
    $('#productModal').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    $('#modalBody [data-add]').addEventListener('click', () => addToCart(p.id));
    $('#modalBody [data-fav-toggle]').addEventListener('click', (e) => {
      toggleFav(p.id);
      e.target.textContent = isFav(p.id) ? '❤︎ В избранном' : 'В избранное';
    });
  }
  function closeModal() {
    $('#productModal').classList.remove('open');
    $('#productModal').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ---------- product card binding ----------
  function bindProductCards(root) {
    $$('.prod-card', root).forEach(card => {
      const id = card.dataset.id;
      card.addEventListener('click', (e) => {
        const t = e.target.closest('button[data-action]');
        if (t) {
          e.stopPropagation();
          const a = t.dataset.action;
          if (a === 'fav') return toggleFav(id);
          if (a === 'cart') return addToCart(id);
          if (a === 'view') return openModal(id);
        }
        // default: navigate to product page
        navigate('#/product/' + id);
      });
    });
  }

  // ---------- search ----------
  function bindSearch() {
    const btn = $('#searchBtn'); const bar = $('#searchBar'); const input = $('#searchInput');
    btn.addEventListener('click', () => {
      bar.hidden = !bar.hidden;
      if (!bar.hidden) input.focus();
    });
    let t;
    input.addEventListener('input', () => {
      clearTimeout(t);
      const q = input.value.trim().toLowerCase();
      t = setTimeout(() => {
        if (!q) return;
        // Simple in-place: navigate to catalog and filter by name (we'll do client-side filter via URL hack)
        const matched = window.PRODUCTS.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          getCatName(p.category).toLowerCase().includes(q));
        renderSearchResults(matched, q);
      }, 250);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { bar.hidden = true; input.value = ''; }
    });
  }
  function renderSearchResults(items, q) {
    const view = $('#view');
    view.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="crumbs"><a href="#/">Главная</a><span class="sep">/</span><span>Поиск</span></div>
          <h1 class="section-title">Результаты поиска: <span class="accent">«${escapeHtml(q)}»</span></h1>
          <p style="color:var(--muted-fg); margin-bottom: 32px;">Найдено: ${items.length}</p>
          ${items.length ? `<div class="prod-grid">${items.map(productCardHTML).join('')}</div>` : '<p style="color:var(--muted-fg);">Ничего не найдено. Попробуйте другое слово.</p>'}
        </div>
      </section>
    `;
    bindProductCards(view);
  }

  // ---------- mobile menu ----------
  function bindMobileMenu() {
    let mn = $('.mobile-nav');
    if (!mn) {
      mn = document.createElement('div');
      mn.className = 'mobile-nav';
      mn.innerHTML = `
        <input id="mobileSearch" type="search" placeholder="Поиск…" style="padding:14px 16px;border:1px solid var(--border-strong);background:var(--bg);font-size:14px;outline:none;margin-bottom:12px;"/>
        <a href="#/catalog">Каталог</a>
        <a href="#/brands">Бренды</a>
        <a href="#/seminars">Семинары</a>
        <a href="#/favorites">Избранное</a>
        <a href="#/history">История просмотров</a>
        <a href="#/account">Личный кабинет</a>
        <a href="#/about">О нас</a>
        <a href="#/contacts">Контакты</a>
        <div style="margin-top:auto;padding-top:24px;border-top:1px solid var(--border);">
          <a href="https://wa.me/79882933999" target="_blank" rel="noopener" style="color:#25D366;border:0;padding:8px 0;letter-spacing:0.08em;">WhatsApp ${escapeHtml(window.SITE.phone)}</a>
        </div>
      `;
      document.body.appendChild(mn);
    }
    $('#menuBtn').addEventListener('click', () => mn.classList.toggle('open'));
    mn.addEventListener('click', (e) => { if (e.target.tagName === 'A') mn.classList.remove('open'); });

    // mobile search input — рендерим результаты как обычный поиск
    const mSearch = mn.querySelector('#mobileSearch');
    if (mSearch) {
      let mt;
      mSearch.addEventListener('input', () => {
        clearTimeout(mt);
        const q = mSearch.value.trim().toLowerCase();
        mt = setTimeout(() => {
          if (!q) return;
          const matched = window.PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            getCatName(p.category).toLowerCase().includes(q));
          renderSearchResults(matched, q);
          mn.classList.remove('open');
        }, 250);
      });
    }
  }

  // ---------- bind global ----------
  function bindGlobal() {
    // Cart open
    $('#cartBtn').addEventListener('click', openCart);
    // Drawer/Modal close on backdrop or [data-close]
    document.body.addEventListener('click', (e) => {
      const closeT = e.target.closest('[data-close]');
      if (!closeT) return;
      if (closeT.closest('.drawer')) closeCart();
      if (closeT.closest('.modal')) closeModal();
    });
    // Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeCart(); closeModal(); }
    });

    bindSearch();
    bindMobileMenu();

    window.addEventListener('hashchange', render);
    window.addEventListener('storage', () => { /* re-sync if multi-tab */ });
  }

  // ---------- init ----------
  function init() {
    bindGlobal();
    updateBadges();
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
