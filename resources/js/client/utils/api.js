// resources/js/client/utils/api.js - VERSION OPTIMISÉE

// =================== SYSTÈME DE CACHE ===================
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.durations = {
      config: 30 * 60 * 1000,      // 30 min
      categories: 10 * 60 * 1000,  // 10 min
      product: 5 * 60 * 1000,      // 5 min
      home: 5 * 60 * 1000,         // 5 min
      search: 2 * 60 * 1000,       // 2 min
      default: 3 * 60 * 1000       // 3 min
    };
  }

  key(type, params = '') {
    return `${type}_${params}`;
  }

  get(type, params = '') {
    const item = this.cache.get(this.key(type, params));
    if (!item) return null;
    
    const duration = this.durations[type] || this.durations.default;
    if (Date.now() - item.timestamp > duration) {
      this.cache.delete(this.key(type, params));
      return null;
    }
    
    return item.data;
  }

  set(type, data, params = '') {
    this.cache.set(this.key(type, params), {
      data,
      timestamp: Date.now()
    });
  }

  invalidate(type, params = '') {
    if (params) {
      this.cache.delete(this.key(type, params));
    } else {
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${type}_`)) {
          this.cache.delete(key);
        }
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new CacheManager();

// =================== HELPERS ===================
const getCsrfToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
};

// =================== API SERVICE ===================
class ApiService {
  constructor(baseURL = '/api/client') {
    this.baseURL = baseURL;
    this.pendingRequests = new Map(); // Éviter requêtes en double
    this.csrfInitialized = false;
    this.csrfInitPromise = null; // Stocker la promesse d'init CSRF
  }

  // Initialiser le cookie CSRF Sanctum
  async initCsrf() {
    if (this.csrfInitialized) return Promise.resolve();
    
    // Si init en cours, retourner la même promesse
    if (this.csrfInitPromise) return this.csrfInitPromise;
    
    this.csrfInitPromise = fetch('/sanctum/csrf-cookie', {
      credentials: 'include',
    })
      .then(() => {
        this.csrfInitialized = true;
      })
      .catch((error) => {
        console.warn('CSRF init failed, will retry on next request:', error);
      })
      .finally(() => {
        this.csrfInitPromise = null;
      });
    
    return this.csrfInitPromise;
  }

  async request(endpoint, options = {}) {
    // ✅ CRITIQUE: Initialiser CSRF pour TOUTES les requêtes (même GET)
    // pour garantir que la même session est utilisée partout
    if (!this.csrfInitialized) {
      await this.initCsrf();
    }

    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET'; // ✅ Définir method ici
    const requestKey = `${method}_${url}_${JSON.stringify(options.body || '')}`;

    // Si requête identique en cours, retourner la même promesse
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    // Récupérer le token d'authentification
    const token = localStorage.getItem('auth_token');

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
      credentials: 'include',
    };

    const requestPromise = fetch(url, config)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          // Si erreur 419 CSRF, réinitialiser et réessayer
          if (response.status === 419) {
            this.csrfInitialized = false;
            throw new Error('CSRF token mismatch.');
          }
          throw new Error(data.message || 'Erreur API');
        }
        return data;
      })
      .catch((error) => {
        console.error('API Error:', error);
        throw error;
      })
      .finally(() => {
        this.pendingRequests.delete(requestKey);
      });

    this.pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  }

  // Méthode avec cache
  async cachedRequest(cacheType, endpoint, cacheParams = '', options = {}) {
    const cached = cache.get(cacheType, cacheParams);
    if (cached) return cached;

    const data = await this.request(endpoint, options);
    cache.set(cacheType, data, cacheParams);
    return data;
  }

  // =================== MÉTHODES HTTP ===================
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // =================== CONFIGURATION ===================
  getConfig() {
    return this.cachedRequest('config', '/config');
  }

  // =================== PAGE D'ACCUEIL ===================
  getHomeData() {
    return this.cachedRequest('home', '/home');
  }

  getFeaturedProducts() {
    return this.cachedRequest('home', '/featured-products', 'featured');
  }

  getNewArrivals() {
    return this.cachedRequest('home', '/new-arrivals', 'new');
  }

  getProductsOnSale() {
    return this.cachedRequest('home', '/products-on-sale', 'sale');
  }

  getCategoriesPreview() {
    return this.cachedRequest('categories', '/categories-preview', 'preview');
  }

  getActivePromotions() {
    return this.request('/active-promotions');
  }

  getShopStats() {
    return this.cachedRequest('home', '/shop-stats', 'stats');
  }

  getTestimonials() {
    return this.cachedRequest('home', '/testimonials', 'testimonials');
  }

  // =================== NAVIGATION ===================
  getMainMenu() {
    return this.cachedRequest('categories', '/navigation/menu', 'menu');
  }

  getCategoryPreview(slug) {
    return this.cachedRequest('categories', `/navigation/categories/${slug}/preview`, slug);
  }

  // =================== PRODUITS ===================
  getProducts(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/client/products?${params}`);
  }

  getTrendingProducts() {
    return this.cachedRequest('product', '/client/products/trending', 'trending');
  }

  getNewArrivalProducts() {
    return this.cachedRequest('product', '/client/products/new-arrivals', 'new-arrivals');
  }

  getOnSaleProducts() {
    return this.cachedRequest('product', '/client/products/on-sale', 'on-sale');
  }

  getProductBySlug(slug) {
    return this.cachedRequest('product', `/products/${slug}`, slug);
  }

  getProductImages(productId) {
    return this.cachedRequest('product', `/products/${productId}/images`, `images_${productId}`);
  }

  getRelatedProducts(productId) {
    return this.cachedRequest('product', `/products/${productId}/related`, `related_${productId}`);
  }

  incrementProductViews(productId) {
    return this.request(`/products/${productId}/view`, { method: 'POST' });
  }

  getProductWhatsAppData(productId) {
    return this.request(`/products/${productId}/whatsapp-data`);
  }

  getProductPageData(slug) {
    return this.cachedRequest('product', `/products/${slug}/page-data`, slug);
  }
  // =================== CATÉGORIES ===================
  getCategories() {
    return this.cachedRequest('categories', '/categories');
  }

  getCategoryBySlug(slug) {
    return this.cachedRequest('categories', `/categories/${slug}`, slug);
  }

  getCategoryProducts(slug, filters = {}) {
    const params = new URLSearchParams(filters).toString();
    // Ne PAS utiliser cachedRequest - toujours faire une requête fraîche
    return this.request(`/categories/${slug}/products?${params}`);
  }

  // =================== RECHERCHE ===================
  search(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters }).toString();
    return this.request(`/search?${params}`);
  }

  getSearchSuggestions(query) {
    const normalized = query.toLowerCase().trim();
    return this.cachedRequest('search', `/search/suggestions?q=${encodeURIComponent(query)}`, normalized);
  }

  quickSearch(query) {
    if (!query || query.length < 2) {
      return Promise.resolve({ success: true, data: { produits: [], categories: [] } });
    }
    const normalized = query.toLowerCase().trim();
    return this.cachedRequest('search', `/search/quick?q=${encodeURIComponent(query)}`, normalized);
  }

  // =================== PANIER (Pas de cache) ===================
  getCart() {
    return this.request('/cart');
  }

  addToCart(productId, quantity = 1, options = {}) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity, ...options }),
    });
  }

  updateCartItem(itemId, quantity) {
    return this.request(`/cart/update/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  removeCartItem(itemId) {
    return this.request(`/cart/remove/${itemId}`, {
      method: 'DELETE',
    });
  }

  removeFromCart(itemId) {
    return this.removeCartItem(itemId);
  }

  clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE',
    });
  }

  getCartCount() {
    return this.request('/cart/count');
  }

  getCartTotal() {
    return this.request('/cart/total');
  }

  generateCartWhatsAppMessage() {
    return this.request('/cart/whatsapp', {
      method: 'POST',
    });
  }

  applyCoupon(code) {
    return this.request('/cart/apply-coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  removeCoupon() {
    return this.request('/cart/remove-coupon', {
      method: 'DELETE',
    });
  }

  // =================== FAVORIS (Pas de cache) ===================
  getWishlist() {
    return this.request('/wishlist');
  }

  addToWishlist(productId) {
    return this.request('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  removeFromWishlist(productId) {
    return this.request(`/wishlist/remove/${productId}`, {
      method: 'DELETE',
    });
  }

  clearWishlist() {
    return this.request('/wishlist/clear', {
      method: 'DELETE',
    });
  }

  getWishlistCount() {
    return this.request('/wishlist/count');
  }

  moveWishlistItemToCart(productId) {
    return this.request(`/wishlist/move-to-cart/${productId}`, {
      method: 'POST',
    });
  }

  checkProductInWishlist(productId) {
    return this.request(`/wishlist/check/${productId}`);
  }

  // =================== AUTHENTIFICATION ===================
  register(data) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  guestCheckout(data) {
    return this.request('/auth/guest-checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  getProfile() {
    return this.request('/account/profile');
  }

  updateProfile(data) {
    return this.request('/account/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // =================== COMPTE CLIENT ===================
  getOrders() {
    return this.request('/account/orders');
  }

  getOrderDetails(orderNumber) {
    return this.request(`/account/orders/${orderNumber}`);
  }

  getInvoices() {
    return this.request('/account/invoices');
  }

  downloadInvoice(invoiceId) {
    return this.request(`/account/invoices/${invoiceId}/download`);
  }

  getMeasurements() {
    return this.request('/auth/measurements');
  }

  saveMeasurements(data) {
    return this.request('/auth/measurements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // =================== AUTHENTIFICATION ===================
  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    }).finally(() => {
      // Nettoyer le cache et le token
      this.clearCache();
      localStorage.removeItem('auth_token');
    });
  }

  getCurrentUser() {
    return this.request('/auth/user');
  }

  // =================== NEWSLETTER ===================
  subscribeNewsletter(email, data = {}) {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, ...data }),
    });
  }

  // =================== UTILITAIRES ===================
  clearCache() {
    cache.clear();
  }

  invalidateCache(type, params) {
    cache.invalidate(type, params);
  }
}

// Instance singleton
const api = new ApiService();

export default api;