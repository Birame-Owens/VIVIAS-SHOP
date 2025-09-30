// resources/js/client/utils/api.js

const getCsrfToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
};

class ApiService {
  constructor(baseURL = '/api/client') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const csrfToken = getCsrfToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur API');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // =================== CONFIGURATION ===================
  getConfig() {
    return this.request('/config');
  }

  // =================== PAGE D'ACCUEIL ===================
  getHomeData() {
    return this.request('/home');
  }

  getFeaturedProducts() {
    return this.request('/featured-products');
  }

  getNewArrivals() {
    return this.request('/new-arrivals');
  }

  getProductsOnSale() {
    return this.request('/products-on-sale');
  }

  getCategoriesPreview() {
    return this.request('/categories-preview');
  }

  getActivePromotions() {
    return this.request('/active-promotions');
  }

  getShopStats() {
    return this.request('/shop-stats');
  }

  getTestimonials() {
    return this.request('/testimonials');
  }

  // =================== NAVIGATION ===================
  getMainMenu() {
    return this.request('/navigation/menu');
  }

  getCategoryPreview(slug) {
    return this.request(`/navigation/categories/${slug}/preview`);
  }

  // =================== PRODUITS ===================
  getProducts(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/products?${params}`);
  }

  getTrendingProducts() {
    return this.request('/products/trending');
  }

  getNewArrivalProducts() {
    return this.request('/products/new-arrivals');
  }

  getOnSaleProducts() {
    return this.request('/products/on-sale');
  }

  getProductBySlug(slug) {
    return this.request(`/products/${slug}`);
  }

  getProductImages(productId) {
    return this.request(`/products/${productId}/images`);
  }

  getRelatedProducts(productId) {
    return this.request(`/products/${productId}/related`);
  }

  incrementProductViews(productId) {
    return this.request(`/products/${productId}/view`, {
      method: 'POST',
    });
  }

  getProductWhatsAppData(productId) {
    return this.request(`/products/${productId}/whatsapp-data`);
  }

  // =================== CATÉGORIES ===================
  getCategories() {
    return this.request('/categories');
  }

  getCategoryBySlug(slug) {
    return this.request(`/categories/${slug}`);
  }

  getCategoryProducts(slug, filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/categories/${slug}/products?${params}`);
  }

  // =================== RECHERCHE ===================
  search(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters }).toString();
    return this.request(`/search?${params}`);
  }

  getSearchSuggestions(query) {
    return this.request(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  quickSearch(query) {
    return this.request(`/search/quick?q=${encodeURIComponent(query)}`);
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

  // =================== FAVORIS ===================
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
    return this.request('/auth/profile');
  }

  updateProfile(data) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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

  // =================== NEWSLETTER ===================
  subscribeNewsletter(email, data = {}) {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, ...data }),
    });
  }
}

// Instance singleton
const api = new ApiService();

export default api;