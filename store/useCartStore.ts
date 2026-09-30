import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  image: string;
  category: string;
};

interface CartState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (item) => set((state) => {
        const existingItem = state.cart.find((c) => c.id === item.id);
        if (existingItem) {
          // Kalau barang udah ada di keranjang, tambahin jumlahnya
          return {
            cart: state.cart.map((c) =>
              c.id === item.id ? { ...c, qty: c.qty + item.qty } : c
            ),
          };
        }
        // Kalau barang baru, masukin ke array
        return { cart: [...state.cart, item] };
      }),
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((c) => c.id !== id)
      })),
      updateQty: (id, qty) => set((state) => ({
        cart: state.cart.map((c) => (c.id === id ? { ...c, qty } : c))
      })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'arasa-cart-storage', // Nama key di LocalStorage
    }
  )
);