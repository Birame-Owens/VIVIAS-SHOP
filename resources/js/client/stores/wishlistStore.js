import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      isLoading: false,
      lastSync: null,

      setItems: (items) => set({ items }),
      setCount: (count) => set({ count }),

      syncWishlist: async () => {
        try {
          set({ isLoading: true });
          const response = await api.getWishlist();
          
          if (response.success) {
            set({
              items: response.data || [],
              count: response.data?.length || 0,
              lastSync: Date.now(),
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Erreur sync wishlist:', error);
          set({ isLoading: false });
        }
      },

      addItem: async (productId) => {
        try {
          set({ isLoading: true });
          const response = await api.addToWishlist(productId);
          
          if (response.success) {
            get().syncWishlist();
          }
          
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      removeItem: async (productId) => {
        try {
          set({ isLoading: true });
          const response = await api.removeFromWishlist(productId);
          
          if (response.success) {
            get().syncWishlist();
          }
          
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      clearWishlist: async () => {
        try {
          set({ isLoading: true });
          const response = await api.clearWishlist();
          
          if (response.success) {
            set({
              items: [],
              count: 0,
              isLoading: false,
            });
          }
          
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      moveToCart: async (productId) => {
        try {
          set({ isLoading: true });
          const response = await api.moveWishlistToCart(productId);
          
          if (response.success) {
            get().syncWishlist();
          }
          
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'vivias-wishlist-storage',
      partialize: (state) => ({
        lastSync: state.lastSync,
      }),
    }
  )
);
