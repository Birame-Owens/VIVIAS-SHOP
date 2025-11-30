import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      count: 0,
      total: 0,
      subtotal: 0,
      shipping: 0,
      discount: 0,
      coupon: null,
      isLoading: false,
      lastSync: null,

      // Actions
      setItems: (items) => set({ items }),
      
      setCount: (count) => set({ count }),
      
      setTotals: (totals) => set({
        total: totals.total || 0,
        subtotal: totals.subtotal || 0,
        shipping: totals.shipping || 0,
        discount: totals.discount || 0,
      }),

      setCoupon: (coupon) => set({ coupon }),

      // Synchroniser avec le backend
      syncCart: async () => {
        try {
          set({ isLoading: true });
          const response = await api.getCart();
          
          console.log('🛒 syncCart - Response:', response);
          
          if (response.success) {
            const cartData = {
              items: response.data.items || [],
              count: response.data.count || 0,
              subtotal: response.data.subtotal || 0,
              total: response.data.total || 0,
              shipping: response.data.shipping_fee || 0, // ✅ CORRIGÉ: shipping_fee au lieu de shipping
              discount: response.data.discount || 0,
              coupon: response.data.coupon || null,
              lastSync: Date.now(),
              isLoading: false,
            };
            
            console.log('🛒 syncCart - Setting cart data:', cartData);
            set(cartData);
          } else {
            console.warn('⚠️ syncCart - Response not successful:', response);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('❌ Erreur sync cart:', error);
          set({ isLoading: false });
        }
      },

      // Ajouter un produit
      addItem: async (productId, quantity = 1, options = null) => {
        try {
          set({ isLoading: true });
          const response = await api.addToCart(productId, quantity, options);
          
          if (response.success) {
            get().syncCart();
          }
          
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Mettre à jour la quantité
      updateItem: async (itemId, quantity) => {
        try {
          set({ isLoading: true });
          const response = await api.updateCartItem(itemId, quantity);
          
          if (response.success) {
            get().syncCart();
          }
          
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Supprimer un produit
      removeItem: async (itemId) => {
        try {
          set({ isLoading: true });
          const response = await api.removeFromCart(itemId);
          
          if (response.success) {
            get().syncCart();
          }
          
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Vider le panier
      clearCart: async () => {
        try {
          set({ isLoading: true });
          const response = await api.clearCart();
          
          if (response.success) {
            set({
              items: [],
              count: 0,
              total: 0,
              subtotal: 0,
              shipping: 0,
              discount: 0,
              coupon: null,
              isLoading: false,
            });
          }
          
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Réinitialiser complètement le store (pour déconnexion)
      resetStore: () => {
        set({
          items: [],
          count: 0,
          total: 0,
          subtotal: 0,
          shipping: 0,
          discount: 0,
          coupon: null,
          isLoading: false,
          lastSync: null,
        });
      },

      // Appliquer un coupon
      applyCoupon: async (code) => {
        try {
          set({ isLoading: true });
          const response = await api.applyCoupon(code);
          
          if (response.success) {
            get().syncCart();
          }
          
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Retirer le coupon
      removeCoupon: async () => {
        try {
          set({ isLoading: true });
          const response = await api.removeCoupon();
          
          if (response.success) {
            get().syncCart();
          }
          
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'vivias-cart-storage',
      partialize: (state) => ({
        lastSync: state.lastSync,
      }),
    }
  )
);
