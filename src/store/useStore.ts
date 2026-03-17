import { create } from 'zustand';

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Member {
  _id: string;
  id: string; // Display ID e.g. M001
  name: string;
  phone: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold';
}

export interface Order {
  _id: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  createdAt: Date;
  status: string;
}

export interface StoreState {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  cartTotal: () => number;
  fetchProducts: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchMembers: () => Promise<void>;
  members: Member[];
  addMember: (member: Member) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  products: [],
  cart: [],
  orders: [],
  
  setProducts: (products) => set({ products }),
  
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  
  updateProduct: (id, updatedProduct) => set((state) => ({
    products: state.products.map((p) => (p._id === id ? { ...p, ...updatedProduct } : p))
  })),
  
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p._id !== id)
  })),

  addToCart: (product, qty = 1) => set((state) => {
    const existing = state.cart.find(item => item._id === product._id);
    if (existing) {
      if (existing.quantity + qty > product.stock) {
        return state; // Prevent over-adding
      }
      return {
        cart: state.cart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + qty } : item
        )
      };
    }
    return { cart: [...state.cart, { ...product, quantity: qty }] };
  }),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter(item => item._id !== id)
  })),

  updateCartQuantity: (id, quantity) => set((state) => {
    if (quantity <= 0) {
      return { cart: state.cart.filter(item => item._id !== id) };
    }
    
    // Check against stock
    const cartItems = state.cart.map(item => {
      if (item._id === id) {
        // Enforce max stock
        const validQuantity = quantity > item.stock ? item.stock : quantity;
        return { ...item, quantity: validQuantity };
      }
      return item;
    });

    return { cart: cartItems };
  }),

  clearCart: () => set({ cart: [] }),

  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  
  setOrders: (orders) => set({ orders }),

  cartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  fetchProducts: async () => {
     try {
       const res = await fetch('/api/inventory');
       const data = await res.json();
       if (Array.isArray(data)) set({ products: data });
     } catch (err) { console.error(err); }
  },

  fetchOrders: async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (Array.isArray(data)) set({ orders: data });
    } catch (err) { console.error(err); }
  },

  members: [],
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  
  fetchMembers: async () => {
    try {
      const res = await fetch('/api/loyalty');
      const data = await res.json();
      if (Array.isArray(data)) set({ members: data });
    } catch (err) { console.error(err); }
  }
}));
