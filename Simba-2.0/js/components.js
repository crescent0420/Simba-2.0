// ==================== SIMBA UI COMPONENTS ====================
// Reusable components for Simba 2.0

// ==================== TRANSLATIONS ====================
const TRANS = {
  en: {
    add_to_cart: 'Add to Cart',
    added: 'Added ✓',
    remove: 'Remove',
    checkout: 'Checkout →',
    subtotal: 'Subtotal',
    total: 'Total',
    quantity: 'Qty',
    price: 'Price',
    free_pickup: 'Free Pick-up',
    proceed: 'Proceed to Checkout',
    empty_cart: 'Your cart is empty',
    empty_cart_sub: 'Add some products to get started',
    continue_shopping: 'Continue Shopping',
    processing: 'Processing...',
    confirming: 'Confirming payment...',
    success: 'Success!',
    error: 'Error',
    retry: 'Retry',
    loading: 'Loading...',
    out_of_stock: 'Out of Stock',
    new: 'NEW',
    hot: '🔥',
    search: 'Search products...',
    filter: 'Filter',
    sort: 'Sort',
    category: 'Category',
    all: 'All',
    results: 'results',
    found_products: 'Found {count} products',
    no_results: 'No products found',
    in_stock: 'In Stock Only',
    price_range: 'Price Range',
  },
  fr: {
    add_to_cart: 'Ajouter au panier',
    added: 'Ajouté ✓',
    remove: 'Supprimer',
    checkout: 'Paiement →',
    subtotal: 'Sous-total',
    total: 'Total',
    quantity: 'Qté',
    price: 'Prix',
    free_pickup: 'Retrait gratuit',
    proceed: 'Passer à la caisse',
    empty_cart: 'Votre panier est vide',
    empty_cart_sub: 'Ajoutez des produits pour commencer',
    continue_shopping: 'Continuer mes achats',
    processing: 'Traitement...',
    confirming: 'Confirmation du paiement...',
    success: 'Succès!',
    error: 'Erreur',
    retry: 'Réessayer',
    loading: 'Chargement...',
    out_of_stock: 'Rupture de stock',
    new: 'NOUVEAU',
    hot: '🔥',
    search: 'Rechercher des produits...',
    filter: 'Filtrer',
    sort: 'Trier',
    category: 'Catégorie',
    all: 'Tout',
    results: 'résultats',
    found_products: '{count} produits trouvés',
    no_results: 'Aucun produit trouvé',
    in_stock: 'En stock uniquement',
    price_range: 'Fourchette de prix',
  },
  rw: {
    add_to_cart: 'Funguranya',
    added: 'Fungujewe ✓',
    remove: 'Funguza',
    checkout: 'Kwishyura →',
    subtotal: 'Igiciro cose',
    total: 'Igiciro cyose',
    quantity: 'Ingano',
    price: 'Igiciro',
    free_pickup: 'Kugura bitaramo',
    proceed: 'Komeza kuri checkout',
    empty_cart: 'I karute yawe iri ho',
    empty_cart_sub: 'Fungura ibicuruzwa winjire',
    continue_shopping: 'Komeza ukugura',
    processing: 'Processing...',
    confirming: 'Confirmation...',
    success: 'Byagenze!',
    error: 'Ikosa',
    retry: ' retry',
    loading: 'Loading...',
    out_of_stock: 'Ntibihari',
    new: 'USHUSH',
    hot: '🔥',
    search: 'Shakisha ibicuruzwa...',
    filter: 'GFilter',
    sort: 'Tonganya',
    category: 'Category',
    all: 'Byose',
    results: 'ibibuto',
    found_products: 'Ibicuruzwa {count} byabonetse',
    no_results: 'Nta bicuruzwa byabonetse',
    in_stock: 'Hariho gusa',
    price_range: 'Igiciro',
  },
};

var currentLang = localStorage.getItem('simba_lang') || 'en';

function t(key) {
  return TRANS[currentLang]?.[key] || TRANS.en[key] || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('simba_lang', lang);
  document.querySelectorAll('[data-t]').forEach(el => {
    el.textContent = t(el.dataset.t);
  });
}

function formatPrice(amount) {
  return new Intl.NumberFormat('rw-RW').format(Math.round(amount)) + ' RWF';
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('rw-RW');
}

function timeAgo(dateStr) {
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

// ==================== PRODUCT CARD ====================
function productCard(p, options = {}) {
  const {
    onAdd = (id) => Cart.add(p),
    onClick = (id) => window.location = `product.html?id=${p.id}`,
  } = options;
  
  const inCart = Cart.getLocal().find(i => i.id === p.id);
  const qty = inCart?.qty || 0;
  const isNew = p.id % 7 === 0;
  const isHot = p.id % 11 === 0;
  
  const fallbackImage = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect fill="#f5f2ee" width="300" height="300"/><text fill="#6b6560" font-family="sans-serif" font-size="16" x="50%" y="50%" text-anchor="middle">${p.category || 'Product'}</text></svg>`);
  
  return `
    <div class="card" onclick="onClick(${p.id})" ${!p.inStock ? 'style="opacity:0.6"' : ''}>
      <div class="card-img">
        <img src="${p.image || fallbackImage}" alt="${esc(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage}'"/>
        ${!p.inStock ? `<div class="out-of-stock-badge">${t('out_of_stock')}</div>` : ''}
        ${isNew ? '<span class="badge badge-new">NEW</span>' : ''}
        ${isHot ? '<span class="badge badge-hot">🔥</span>' : ''}
        ${qty > 0 ? `<span class="qty-badge">${qty}</span>` : ''}
      </div>
      <div class="card-body">
        <div class="card-category">${p.category || ''}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-unit">${p.unit || 'pc'}</div>
      </div>
      <div class="card-foot">
        <div class="card-price">${formatPrice(p.price)}</div>
        <button class="add-btn ${qty > 0 ? 'added' : ''}" 
          onclick="event.stopPropagation();cartAdd(${p.id})"
          ${!p.inStock ? 'disabled' : ''}>
          ${qty > 0 ? '✓' : '+'}
        </button>
      </div>
    </div>
  `;
}

// ==================== CART ITEM ====================
function cartItem(item, options = {}) {
  const { onQtyChange, onRemove } = options;
  
  return `
    <div class="cart-item">
      <img src="${item.image || ''}" alt="${item.name}" class="cart-item-img" 
        onerror="this.src='data:image/svg+xml,${encodeURIComponent('<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect fill=%22%23f5f2ee%22 width=%2250%22 height=%2250%22/></svg>')}'"/>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
      </div>
      <div class="cart-item-qty">
        <button onclick="cartUpdate(${item.id}, ${(item.qty || 1) - 1})">−</button>
        <span>${item.qty}</span>
        <button onclick="cartUpdate(${item.id}, ${(item.qty || 1) + 1})">+</button>
      </div>
      <div class="cart-item-sub">${formatPrice(item.price * item.qty)}</div>
      <button class="cart-item-remove" onclick="cartRemove(${item.id})">✕</button>
    </div>
  `;
}

// ==================== EMPTY STATE ====================
function emptyState(icon, title, subtitle, actionText, actionHref) {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${subtitle}</p>
      ${actionText ? `<a href="${actionHref || 'shop.html'}" class="btn-primary">${actionText}</a>` : ''}
    </div>
  `;
}

// ==================== SKELETON LOADER ====================
function skeletonCards(count = 8) {
  return Array(count).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-line w-60"></div>
      <div class="skeleton-line w-80"></div>
      <div class="skeleton-line w-40"></div>
    </div>
  `).join('');
}

function skeletonList(count = 5) {
  return Array(count).fill(0).map(() => `
    <div class="skeleton-row">
      <div class="skeleton-line w-30"></div>
      <div class="skeleton-line w-50"></div>
      <div class="skeleton-line w-20"></div>
    </div>
  `).join('');
}

// ==================== MODAL ====================
function showModal(id) {
  document.getElementById(id)?.classList.add('open');
}

function hideModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

// ==================== DRAWER ====================
function openDrawer(id) {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}

// Cart drawer shorthand
function updateCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  
  const cart = Cart.getLocal();
  const itemsContainer = document.getElementById('cart-drawer-items');
  const totalEl = document.getElementById('cart-drawer-total');
  const checkoutBtn = document.getElementById('cart-drawer-checkout');
  
  if (cart.length === 0) {
    if (itemsContainer) itemsContainer.innerHTML = emptyState('🛒', t('empty_cart'), t('empty_cart_sub'), t('continue_shopping'), 'shop.html');
    if (totalEl) totalEl.textContent = formatPrice(0);
    if (checkoutBtn) checkoutBtn.style.display = 'none';
  } else {
    if (itemsContainer) itemsContainer.innerHTML = cart.map(cartItem).join('');
    if (totalEl) totalEl.textContent = formatPrice(Cart.getTotal());
    if (checkoutBtn) checkoutBtn.style.display = '';
  }
}

// ==================== CATEGORY CHIPS ====================
function categoryChips(categories, selected, onSelect) {
  const all = [{ name: t('all'), count: PRODUCTS.length }];
  const counts = categories.map(c => ({
    name: c,
    count: PRODUCTS.filter(p => p.category === c).length,
  }));
  
  return [...all, ...counts].map(c => `
    <button class="chip ${selected === c.name ? 'active' : ''}" 
      onclick="onSelect('${c.name}')">
      ${c.name} <span class="chip-count">${c.count}</span>
    </button>
  `).join('');
}

// ==================== FILTERS ====================
function Filters(props = {}) {
  const {
    categories = [],
    selectedCategory = 'All',
    onCategoryChange,
    searchTerm = '',
    onSearchChange,
    minPrice = 0,
    maxPrice = 100000,
    onPriceChange,
    inStockOnly = false,
    onInStockChange,
  } = props;
  
  return `
    <div class="filters">
      <div class="search-box">
        <input type="text" placeholder="${t('search')}" value="${searchTerm}" 
          oninput="onSearchChange(this.value)"/>
      </div>
      <div class="category-chips">
        ${categoryChips(categories, selectedCategory, onCategoryChange)}
      </div>
      <div class="filter-row">
        <label>
          <input type="checkbox" ${inStockOnly ? 'checked' : ''} onchange="onInStockChange(this.checked)"/>
          ${t('in_stock')}
        </label>
        <input type="range" min="${minPrice}" max="${maxPrice}" value="${maxPrice}" 
          onchange="onPriceChange(this.value)"/>
        <span>${formatPrice(maxPrice)}</span>
      </div>
    </div>
  `;
}

// ==================== PAGINATION ====================
function Pagination(currentPage, totalPages, onPageChange) {
  if (totalPages <= 1) return '';
  
  return `
    <div class="pagination">
      <button ${currentPage === 1 ? 'disabled' : ''} onclick="onPageChange(${currentPage - 1})">← Prev</button>
      <span>Page ${currentPage} of ${totalPages}</span>
      <button ${currentPage === totalPages ? 'disabled' : ''} onclick="onPageChange(${currentPage + 1})">Next →</button>
    </div>
  `;
}