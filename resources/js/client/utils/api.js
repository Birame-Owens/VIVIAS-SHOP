// resources/js/client/utils/api.js - VERSION FINALE AVEC AUTH SANCTUM

// =================== SYSTÈME DE CACHE ===================
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.durations = {
      config: 30 * 60 * 1000,
      categories: 10 * 60 * 1000,
      product: 5 * 60 * 1000,
      home: 5 * 60 * 1000,
      search: 2 * 60 * 1000,
      default: 3 * 60 * 1000
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

// =================== API SERVICE ===================
class ApiService {
  constructor(baseURL = '/api/client') {
    this.baseURL = baseURL;
    this.pendingRequests = new Map();
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }

  setToken(token) {
    localStorage.setItem('auth_token', token);
  }

  removeToken() {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';
    const requestKey = `${method}_${url}_${JSON.stringify(options.body || '')}`;

    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    const token = this.getToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    };

    const requestPromise = fetch(url, config)
      .then(async (response) => {
        const data = await response.json();
        
        if (response.status === 401 && token) {
          this.removeToken();
          if (window.location.pathname !== '/' && window.location.pathname !== '/cart') {
            window.location.href = '/';
          }
          throw new Error('Session expirée');
        }
        
        if (!response.ok) {
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

  async cachedRequest(cacheType, endpoint, cacheParams = '', options = {}) {
    const cached = cache.get(cacheType, cacheParams);
    if (cached) return cached;

    const data = await this.request(endpoint, options);
    cache.set(cacheType, data, cacheParams);
    return data;
  }

  getConfig() {
    return this.cachedRequest('config', '/config');
  }

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

  getMainMenu() {
    return this.cachedRequest('categories', '/navigation/menu', 'menu');
  }

  getCategoryPreview(slug) {
    return this.cachedRequest('categories', `/navigation/categories/${slug}/preview`, slug);
  }

  getProducts(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/products?${params}`);
  }

  getTrendingProducts() {
    return this.cachedRequest('product', '/products/trending', 'trending');
  }

  getNewArrivalProducts() {
    return this.cachedRequest('product', '/products/new-arrivals', 'new-arrivals');
  }

  getOnSaleProducts() {
    return this.cachedRequest('product', '/products/on-sale', 'on-sale');
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

  getCategories() {
    return this.cachedRequest('categories', '/categories');
  }

  getCategoryBySlug(slug) {
    return this.cachedRequest('categories', `/categories/${slug}`, slug);
  }

  getCategoryProducts(slug, filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/categories/${slug}/products?${params}`);
  }

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

  // =================== PANIER ===================
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

  // =================== WISHLIST ===================
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
  async register(data) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  guestCheckout(data) {
    return this.request('/auth/guest-checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.removeToken();
    }
    return { success: true };
  }

  getProfile() {
    return this.request('/auth/profile');
  }

  updateProfile(data) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  getOrders() {
    return this.request('/auth/orders');
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

  // =================== CHECKOUT & PAIEMENT ===================
  
  /**
   * Vérifier le statut d'un paiement Stripe après redirection
   */
  async verifyStripePayment(sessionId) {
    try {
      const response = await this.request(`/payment/verify-stripe?session_id=${sessionId}`);
      
      // Si le paiement est validé, invalider le cache du panier
      if (response.success && response.data?.paiement?.statut === 'valide') {
        this.invalidateCache('cart');
      }
      
      return response;
    } catch (error) {
      console.error('Erreur vérification Stripe:', error);
      throw error;
    }
  }

  // =================== NEWSLETTER ===================
  subscribeNewsletter(email, data = {}) {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, ...data }),
    });
  }

  // =================== CACHE ===================
  clearCache() {
    cache.clear();
  }

  invalidateCache(type, params) {
    cache.invalidate(type, params);
  }
}

const api = new ApiService();

export default api;