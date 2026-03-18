"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { ShoppingCart, Plus, X } from "lucide-react";
import styles from "./Shop.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function ShopPage() {
  const { 
    products, cart, addToCart, updateCartQuantity, cartTotal, 
    fetchProducts, clearCart, addOrder, isCartOpen, setIsCartOpen 
  } = useStore();
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = category === "All" ? products : products.filter(p => p.category === category);

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart, 
          total: cartTotal(), 
          paymentMethod: 'Online Payment' 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      addOrder(data);
      clearCart();
      setIsCartOpen(false);
      alert("สั่งซื้อสำเร็จ!");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการสั่งซื้อ");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          รายการสินค้าทั้งหมด
        </motion.h1>
        <p>สินค้าคุณภาพดี สำหรับคุณโดยเฉพาะ</p>
      </header>

      <main className={styles.content}>
        <div className={styles.filters}>
          {categories.map(c => (
            <button 
              key={c} 
              className={`${styles.filterBtn} ${category === c ? styles.activeFilter : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filteredProducts.map(product => (
            <motion.div 
              key={product._id} 
              className={styles.productCard}
              whileHover={{ y: -5 }}
            >
              <div className={styles.imagePlaceholder}>
                {product.image ? (
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ShoppingCart size={48} />
                )}
              </div>
              <div className={styles.cardBody}>
                <span className={styles.category}>{product.category}</span>
                <h3 className={styles.name}>{product.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>SKU: {product.sku}</p>
                <div className={styles.priceRow}>
                  <span className={styles.price}>฿{product.price.toLocaleString()}</span>
                  <button className={styles.addBtn} onClick={() => addToCart(product)}>
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <motion.div 
          className={styles.cartPanel}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart />
          <span>{cart.length} รายการ | ฿{cartTotal().toLocaleString()}</span>
        </motion.div>
      )}

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsCartOpen(false)}>
            <motion.div 
              className={styles.modal} 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h2>ตะกร้าสินค้าของคุณ</h2>
                <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}>
                  <X />
                </button>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {cart.map(item => (
                  <div key={item._id} className={styles.cartItem}>
                    <div>
                      <h4 style={{ margin: 0 }}>{item.name}</h4>
                      <p style={{ color: '#94a3b8', margin: 0 }}>฿{item.price.toLocaleString()}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button onClick={() => updateCartQuantity(item._id, item.quantity - 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', width: '24px' }}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => addToCart(item)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', width: '24px' }}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700 }}>
                  <span>ยอดรวมทั้งสิ้น</span>
                  <span>฿{cartTotal().toLocaleString()}</span>
                </div>
                <button 
                  className={styles.checkoutBtn} 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  ยืนยันการสั่งซื้อ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
