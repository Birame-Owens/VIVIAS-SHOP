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
  constructor(baseURL = '/api') {
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
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';
    const requestKey = `${method}_${url}_${JSON.stringify(options.body || '')}`;

    // Si requête identique en cours, retourner la même promesse
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    // Récupérer le token d'authentification
    const token = localStorage.getItem('auth_token');

    // ✅ CRITIQUE: Initialiser CSRF seulement si pas de token Bearer
    // Quand on a un Bearer token, Sanctum n'utilise pas la session/CSRF
    if (!token && !this.csrfInitialized) {
      await this.initCsrf();
    }

    const config = {
      ...options,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // CSRF token seulement pour les sessions (pas de Bearer token)
        ...(!token ? { 'X-CSRF-TOKEN': getCsrfToken() || '' } : {}),
        // Bearer token pour authentification API
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
      credentials: 'include', // Important pour les cookies de session
    };

    const requestPromise = fetch(url, config)
      .then(async (response) => {
        const contentType = response.headers.get('content-type');
        
        // Vérifier si c'est du JSON
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          
          if (!response.ok) {
            // Si erreur 419 CSRF et pas de token, réinitialiser
            if (response.status === 419 && !token) {
              this.csrfInitialized = false;
              throw new Error('CSRF token mismatch.');
            }
            // Si 401 et token présent, c'est expiré
            if (response.status === 401 && token) {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
              // Ne pas recharger automatiquement pour éviter les boucles
            }
            throw new Error(data.message || 'Erreur API');
          }
          return data;
        } else {
          // Si pas JSON, c'est probablement une erreur HTML (500)
          const text = await response.text();
          console.error('❌ Response non-JSON:', text.substring(0, 200));
          throw new Error('Erreur serveur - réponse invalide');
        }
      })
      .catch((error) => {
        console.error('🔴 API Error:', error);
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
    return this.cachedRequest('config', '/client/config');
  }

  // =================== PAGE D'ACCUEIL ===================
  getHomeData() {
    return this.cachedRequest('home', '/client/home');
  }

  getFeaturedProducts() {
    return this.cachedRequest('home', '/client/featured-products', 'featured');
  }

  getNewArrivals() {
    return this.cachedRequest('home', '/client/new-arrivals', 'new');
  }

  getProductsOnSale() {
    return this.cachedRequest('home', '/client/products-on-sale', 'sale');
  }

  getCategoriesPreview() {
    return this.cachedRequest('categories', '/client/categories-preview', 'preview');
  }

  getActivePromotions() {
    return this.request('/client/active-promotions');
  }

  getShopStats() {
    return this.cachedRequest('home', '/client/shop-stats', 'stats');
  }

  getTestimonials() {
    return this.cachedRequest('home', '/client/testimonials', 'testimonials');
  }

  // =================== NAVIGATION ===================
  getMainMenu() {
    return this.cachedRequest('categories', '/client/navigation/menu', 'menu');
  }

  getCategoryPreview(slug) {
    return this.cachedRequest('categories', `/client/navigation/categories/${slug}/preview`, slug);
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
    return this.cachedRequest('product', `/client/products/${slug}`, slug);
  }

  getProductImages(productId) {
    return this.cachedRequest('product', `/client/products/${productId}/images`, `images_${productId}`);
  }

  getRelatedProducts(productId) {
    return this.cachedRequest('product', `/client/products/${productId}/related`, `related_${productId}`);
  }

  incrementProductViews(productId) {
    return this.request(`/client/products/${productId}/view`, { method: 'POST' });
  }

  getProductWhatsAppData(productId) {
    return this.request(`/client/products/${productId}/whatsapp-data`);
  }

  getProductPageData(slug) {
    return this.cachedRequest('product', `/client/products/${slug}/page-data`, slug);
  }
  // =================== CATÉGORIES ===================
  getCategories() {
    return this.cachedRequest('categories', '/client/categories');
  }

  getCategoryBySlug(slug) {
    return this.cachedRequest('categories', `/client/categories/${slug}`, slug);
  }

  getCategoryProducts(slug, filters = {}) {
    const params = new URLSearchParams(filters).toString();
    // Ne PAS utiliser cachedRequest - toujours faire une requête fraîche
    return this.request(`/client/categories/${slug}/products?${params}`);
  }

  // =================== RECHERCHE ===================
  search(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters }).toString();
    return this.request(`/client/search?${params}`);
  }

  getSearchSuggestions(query) {
    const normalized = query.toLowerCase().trim();
    return this.cachedRequest('search', `/client/search/suggestions?q=${encodeURIComponent(query)}`, normalized);
  }

  quickSearch(query) {
    if (!query || query.length < 2) {
      return Promise.resolve({ success: true, data: { produits: [], categories: [] } });
    }
    const normalized = query.toLowerCase().trim();
    return this.cachedRequest('search', `/client/search/quick?q=${encodeURIComponent(query)}`, normalized);
  }

  // =================== PANIER (Pas de cache) ===================
  getCart() {
    return this.request('/client/cart');
  }

  addToCart(productId, quantity = 1, options = {}) {
    return this.request('/client/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity, ...options }),
    });
  }

  updateCartItem(itemId, quantity) {
    return this.request(`/client/cart/update/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  removeCartItem(itemId) {
    return this.request(`/client/cart/remove/${itemId}`, {
      method: 'DELETE',
    });
  }

  removeFromCart(itemId) {
    return this.removeCartItem(itemId);
  }

  clearCart() {
    return this.request('/client/cart/clear', {
      method: 'DELETE',
    });
  }

  getCartCount() {
    return this.request('/client/cart/count');
  }

  getCartTotal() {
    return this.request('/client/cart/total');
  }

  generateCartWhatsAppMessage() {
    return this.request('/client/cart/whatsapp', {
      method: 'POST',
    });
  }

  applyCoupon(code) {
    return this.request('/client/cart/apply-coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  removeCoupon() {
    return this.request('/client/cart/remove-coupon', {
      method: 'DELETE',
    });
  }

  // =================== FAVORIS (Pas de cache) ===================
  getWishlist() {
    return this.request('/client/wishlist');
  }

  addToWishlist(productId) {
    return this.request('/client/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  removeFromWishlist(productId) {
    return this.request(`/client/wishlist/remove/${productId}`, {
      method: 'DELETE',
    });
  }

  clearWishlist() {
    return this.request('/client/wishlist/clear', {
      method: 'DELETE',
    });
  }

  getWishlistCount() {
    return this.request('/client/wishlist/count');
  }

  moveWishlistItemToCart(productId) {
    return this.request(`/client/wishlist/move-to-cart/${productId}`, {
      method: 'POST',
    });
  }

  checkProductInWishlist(productId) {
    return this.request(`/client/wishlist/check/${productId}`);
  }

  // =================== AUTHENTIFICATION ===================
  register(data) {
    return this.request('/client/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  login(email, password) {
    return this.request('/client/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  guestCheckout(data) {
    return this.request('/client/auth/guest-checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  logout() {
    return this.request('/client/auth/logout', {
      method: 'POST',
    });
  }

  getProfile() {
    return this.request('/client/account/profile');
  }

  updateProfile(data) {
    return this.request('/client/account/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // =================== COMPTE CLIENT ===================
  getOrders() {
    return this.request('/client/account/orders');
  }

  getOrderDetails(orderNumber) {
    return this.request(`/client/account/orders/${orderNumber}`);
  }

  getInvoices() {
    return this.request('/client/account/invoices');
  }

  downloadInvoice(invoiceId) {
    return this.request(`/client/account/invoices/${invoiceId}/download`);
  }

  getMeasurements() {
    return this.request('/client/auth/measurements');
  }

  saveMeasurements(data) {
    return this.request('/client/auth/measurements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // =================== AUTHENTIFICATION ===================
  login(credentials) {
    return this.request('/client/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  register(userData) {
    return this.request('/client/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  logout() {
    return this.request('/client/auth/logout', {
      method: 'POST',
    }).finally(() => {
      // Nettoyer le cache et le token
      this.clearCache();
      localStorage.removeItem('auth_token');
    });
  }

  getCurrentUser() {
    return this.request('/client/auth/user');
  }

  // =================== NEWSLETTER ===================
  subscribeNewsletter(email, data = {}) {
    return this.request('/client/newsletter/subscribe', {
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
// Rebuild: 20251201_142727

// Force rebuild 15:11:03
