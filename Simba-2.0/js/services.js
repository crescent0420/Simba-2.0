// ==================== SIMBA SERVICES LAYER ====================
// API Services for Simba 2.0 - Connected to Django Backend
// Provides centralized data fetching with loading/error states

const API_BASE = (typeof window !== 'undefined' && window.SIMBA_API_BASE) || 'http://127.0.0.1:8000/api/v1';

// ==================== STATE MANAGEMENT ====================
const State = {
  _listeners: new Map(),
  _state: { loading: false, error: null, user: null, products: [], cart: [], orders: [] },
  
  get(key) { return this._state[key]; },
  
  set(key, value) {
    const old = this._state[key];
    this._state[key] = value;
    this._notify(key, value, old);
  },

  subscribe(key, fn) {
    if (!this._listeners.has(key)) this._listeners.set(key, []);
    this._listeners.get(key).push(fn);
  },

  _notify(key, value, old) {
    const listeners = this._listeners.get(key) || [];
    listeners.forEach(fn => fn(value, old));
  },
};

// ==================== TOAST NOTIFICATIONS ====================
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

// ==================== API CLIENT ====================
class ApiClient {
  constructor(baseUrl = API_BASE) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('simba_token');
  }
  
  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('simba_token', token);
    else localStorage.removeItem('simba_token');
  }
  
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    return headers;
  }
  
  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const config = {
      ...options,
      headers: { ...this.getHeaders(), ...options.headers },
    };
    
    State.set('loading', true);
    State.set('error', null);
    
    try {
      const res = await fetch(url, config);
      
      if (res.status === 401) {
        this.setToken(null);
        window.location.href = 'auth.html';
        throw new Error('Session expired');
      }
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Request failed');
      }
      
      State.set('loading', false);
      return data;
    } catch (error) {
      State.set('loading', false);
      State.set('error', error.message);
      showToast(error.message, 'error');
      throw error;
    }
  }
  
  get(path) { return this.request(path); }
  post(path, data) { return this.request(path, { method: 'POST', body: JSON.stringify(data) }); }
  put(path, data) { return this.request(path, { method: 'PUT', body: JSON.stringify(data) }); }
  patch(path, data) { return this.request(path, { method: 'PATCH', body: JSON.stringify(data) }); }
  delete(path) { return this.request(path, { method: 'DELETE' }); }
}

// Create singleton instance
const api = new ApiClient();

// ==================== AUTH SERVICE ====================
const AuthService = {
  async login(phone, password) {
    const data = await api.post('/auth/login/', { login: phone, password });
    if (data.access) {
      api.setToken(data.access);
      localStorage.setItem('simba_user', JSON.stringify(data.user));
    }
    return data;
  },
  
  async register(phone, password, name) {
    const data = await api.post('/auth/register/', { phone, password, first_name: name });
    if (data.access) {
      api.setToken(data.access);
      localStorage.setItem('simba_user', JSON.stringify(data.user));
    }
    return data;
  },
  
  async me() {
    if (!api.token) return null;
    return await api.get('/auth/me/');
  },
  
  logout() {
    api.setToken(null);
    localStorage.removeItem('simba_user');
    window.location.href = 'index.html';
  },
  
  isLoggedIn() { return !!api.token; },
};

// ==================== PRODUCTS SERVICE ====================
const ProductsService = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/products/${query ? `?${query}` : ''}`);
  },
  
  async get(id) {
    return await api.get(`/products/${id}/`);
  },
  
  async featured() {
    return await api.get('/products/featured/');
  },
  
  async search(query) {
    return await api.get(`/products/search/?q=${encodeURIComponent(query)}`);
  },
  
  async categories() {
    return await api.get('/products/categories/');
  },
};

// ==================== CART SERVICE ====================
const CartService = {
  async get() {
    return await api.get('/products/cart/');
  },
  
  async add(productId, quantity = 1) {
    return await api.post('/products/cart/', { product_id: productId, quantity });
  },
  
  async update(itemId, quantity) {
    return await api.put(`/products/cart/${itemId}/`, { quantity });
  },
  
  async remove(itemId) {
    return await api.delete(`/products/cart/${itemId}/`);
  },
  
  async clear() {
    return await api.delete('/products/cart/');
  },
};

// ==================== ORDERS SERVICE ====================
const OrdersService = {
  async list() {
    return await api.get('/orders/');
  },
  
  async get(id) {
    return await api.get(`/orders/${id}/`);
  },
  
  async create(data) {
    return await api.post('/orders/create/', data);
  },
  
  async cancel(id) {
    return await api.post(`/orders/${id}/cancel/`);
  },
  
  async pay(id) {
    // Payment processing - placeholder for MoMo integration
    return await api.post(`/orders/${id}/pay/`, { method: 'momo' });
  },
};

// ==================== BRANCHES SERVICE ====================
const BranchesService = {
  async list() {
    return await api.get('/auth/branches/');
  },
};


// ==================== REP SERVICE ====================
const RepService = {
  async listOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await api.get(`/orders/rep/${query ? `?${query}` : ''}`);
  },
  async getOrder(number) { return await api.get(`/orders/rep/${number}/`); },
  async updateOrderStatus(number, status, note = '') {
    return await api.post(`/orders/rep/${number}/status/`, { status, note });
  },
  async dashboard() { return await api.get('/orders/rep/dashboard/'); },
  // Product management endpoints are not in the canonical backend yet (Phase 3).
  async createProduct() { showToast('Product management API is coming in Phase 3', 'info'); },
  async updateProduct() { showToast('Product management API is coming in Phase 3', 'info'); },
  async deleteProduct() { showToast('Product management API is coming in Phase 3', 'info'); },
};

// Export all services
window.Services = {
  api,
  auth: AuthService,
  products: ProductsService,
  cart: CartService,
  orders: OrdersService,
  branches: BranchesService,
  rep: RepService,
  State,
  showToast,
};