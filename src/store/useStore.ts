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

export interface UserAccount {
  _id: string;
  username: string;
  role: string;
}

export interface Order {
  _id: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  createdAt: Date;
  status: string;
  cancelReason?: string;
  cancelDetails?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  slipUrl?: string;
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
  users: UserAccount[];
  settings: Record<string, string>;
  fetchUsers: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  updateSetting: (key: string, value: string) => Promise<boolean>;
  addMember: (member: Member) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  products: [],
  cart: [],
  orders: [],
  isCartOpen: false,
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  
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
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/orders', { headers });
      
      if (res.status === 401) {
        set({ orders: [] });
        return;
      }
      
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
  },

  users: [],
  fetchUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) set({ users: data });
    } catch (err) { console.error(err); }
  },

  updateUserPassword: async (userId, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ userId, newPassword })
      });
      return res.ok;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  deleteUser: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        set((state) => ({ users: state.users.filter(u => u._id !== userId) }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  settings: {},
  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (typeof data === 'object') set({ settings: data });
    } catch (err) { console.error(err); }
  },

  updateSetting: async (key, value) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        set((state) => ({ settings: { ...state.settings, [key]: value } }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}));
