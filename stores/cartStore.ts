// stores/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stripePriceId: string;
  modifiers?: { // Make this optional
    id: string;
    name: string;
    price: number;
    stripePriceId: string;
    quantity: number;
  }[];
}

interface CartStore {
  cartItems: CartItem[];
  sessionId: string | null;
  initializeSession: () => void;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      sessionId: null,

      initializeSession: () => {
        const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
        if (!localStorage.getItem('sessionId')) {
          localStorage.setItem('sessionId', sessionId);
        }
        set({ sessionId });
        
        // Load from API
        fetch(`/api/cart?sessionId=${sessionId}`)
          .then(res => res.json())
          .then(items => set({ cartItems: items }))
          .catch(console.error);
      },

      addToCart: async (item) => {
        const { sessionId, cartItems } = get();
        const existingItem = cartItems.find(i => i.id === item.id);
        const newItems = existingItem
          ? cartItems.map(i => 
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            )
          : [...cartItems, item];

        set({ cartItems: newItems });
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, cartItems: newItems })
        });
      },

      removeFromCart: async (itemId) => {
        const { sessionId, cartItems } = get();
        const newItems = cartItems.filter(item => item.id !== itemId);
        
        set({ cartItems: newItems });
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, cartItems: newItems })
        });
      },

      updateQuantity: async (itemId, quantity) => {
        const { sessionId, cartItems } = get();
        const newItems = cartItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );

        set({ cartItems: newItems });
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, cartItems: newItems })
        });
      },

      clearCart: async () => {
        const { sessionId } = get();
        set({ cartItems: [] });
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, cartItems: [] })
        });
      },

      totalItems: () => get().cartItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () => {
        const total = get().cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        return total || 0; // Ensure it always returns a number
      },
      
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        sessionId: state.sessionId,
        cartItems: state.cartItems 
      }),
    }
  )
);