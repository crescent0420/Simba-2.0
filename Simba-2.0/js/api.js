// ==================== SIMBA API + UI HELPERS ====================
// Uses window.Services from services.js - no re-exports needed

// ==================== UI HELPERS ====================

// Toast notifications
function showToast(msg, type = 'info') {
  const id = 'toast-' + Date.now();
  const el = document.createElement('div');
  el.id = id;
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// Loading state helper
function withLoading(promise) {
  window.Services.State.set('loading', true);
  return promise.finally(() => window.Services.State.set('loading', false));
}

// ==================== CART (UI + API) ====================
const Cart = {
  _local: null,
  
  init() {
    this._local = JSON.parse(localStorage.getItem('simba_cart') || '[]');
    this._updateBadge();
    return this;
  },
  
  getLocal() {
    if (!this._local) this.init();
    return this._local;
  },
  
  setLocal(cart) {
    this._local = cart;
    localStorage.setItem('simba_cart', JSON.stringify(cart));
    this._updateBadge();
  },
  
  _updateBadge() {
    const count = this.getLocal().reduce((s, i) => s + i.qty, 0);
    localStorage.setItem('simba_cart_count', count);
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline' : 'none';
    });
  },
  
  async sync() {
    if (!window.Services.auth.isLoggedIn()) return this.getLocal();
    
    try {
      const res = await window.Services.cart.get();
      if (res?.items) {
        return res.items.map(item => ({
          id: item.product?.product_id,
          name: item.product?.name,
          price: item.product?.price,
          qty: item.quantity,
          image: item.product?.image,
          category: item.product?.category,
          unit: item.product?.unit,
          pk: item.id,
        }));
      }
    } catch (e) {
      // Fallback to local
    }
    return this.getLocal();
  },
  
  async add(product, qty = 1) {
    // Try API first
    if (window.Services.auth.isLoggedIn()) {
      try {
        await window.Services.cart.add(product.id, qty);
        return this.sync();
      } catch (e) {
        showToast('Failed to sync cart', 'error');
      }
    }
    
    // Local fallback
    const cart = this.getLocal();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ ...product, qty });
    }
    this.setLocal(cart);
    showToast('Added to cart');
    return cart;
  },
  
  async updateQty(id, qty) {
    const cart = this.getLocal();
    const item = cart.find(i => i.id === id);
    
    if (window.Services.auth.isLoggedIn() && item?.pk) {
      try {
        await window.Services.cart.update(item.pk, qty);
        return this.sync();
      } catch (e) {}
    }
    
    if (qty <= 0) {
      const idx = cart.findIndex(i => i.id === id);
      if (idx > -1) cart.splice(idx, 1);
    } else {
      if (item) item.qty = qty;
    }
    this.setLocal(cart);
    return cart;
  },
  
  async remove(id) {
    const cart = this.getLocal();
    const item = cart.find(i => i.id === id);
    
    if (window.Services.auth.isLoggedIn() && item?.pk) {
      try {
        await window.Services.cart.remove(item.pk);
        return this.sync();
      } catch (e) {}
    }
    
    const idx = cart.findIndex(i => i.id === id);
    if (idx > -1) cart.splice(idx, 1);
    this.setLocal(cart);
    return cart;
  },
  
  getTotal() {
    return this.getLocal().reduce((s, i) => s + (i.price * i.qty), 0);
  },
  
  updateBadge() {
    this._updateBadge();
  },
  
  clear() {
    localStorage.removeItem('simba_cart');
    localStorage.removeItem('simba_cart_count');
    if (window.Services.auth.isLoggedIn()) window.Services.cart.clear();
    this._updateBadge();
  },
};

// Initialize cart on load
document.addEventListener('DOMContentLoaded', () => Cart.init());

// ==================== WISHLIST (UI) ====================
const Wishlist = {
  get() {
    return JSON.parse(localStorage.getItem('simba_wishlist') || '[]');
  },
  
  add(product) {
    const wish = this.get();
    if (!wish.find(p => p.id === product.id)) {
      wish.push(product);
      localStorage.setItem('simba_wishlist', JSON.stringify(wish));
      showToast('Added to wishlist');
    }
    return wish;
  },
  
  remove(productId) {
    let wish = this.get();
    wish = wish.filter(p => p.id !== productId);
    localStorage.setItem('simba_wishlist', JSON.stringify(wish));
    return wish;
  },
  
  has(productId) {
    return this.get().some(p => p.id === productId);
  },
  
  toCart(product) {
    Cart.add(product, 1);
    this.remove(product.id);
  },
};

// ==================== UTILITIES ====================
const fmt = n => new Intl.NumberFormat('rw-RW').format(Math.round(n)) + ' RWF';
const tr = (key, params) => (window.i18n ? window.i18n.t(key, params) : key);
const esc = s => String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');

// Export to window
window.Cart = Cart;
window.Wishlist = Wishlist;
window.showToast = showToast;
window.fmt = fmt;
window.tr = tr;

// Aliases for backward compatibility (wired to the real service layer).
// Previously referenced undefined locals, which threw on load and broke every page.
window.products = window.Services.products;
window.cart = window.Services.cart;
window.orders = window.Services.orders;
window.Rep = window.Services.rep;