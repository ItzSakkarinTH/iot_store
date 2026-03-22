"use client";

import { useEffect, useState } from "react";
import { useStore, Product } from "@/store/useStore";
import styles from "./Shop.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, X, ShoppingBag, Smartphone } from "lucide-react";

export default function ShopPage() {
  const router = useRouter();
  const { 
    products, cart, addToCart, fetchProducts, cartTotal, settings, fetchSettings
  } = useStore();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQty = (id: string, val: number, stock: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min(stock, (prev[id] || 1) + val))
    }));
  };

  const handleAddToCart = (product: Product) => {
    const qty = quantities[product._id] || 1;
    addToCart(product, qty);
    router.push('/cart');
  };

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, [fetchProducts, fetchSettings]);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = category === "All" ? products : products.filter(p => p.category === category);

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
          {filteredProducts.map(product => {
            const qty = quantities[product._id] || 1;
            const isOutOfStock = product.stock <= 0;
            
            return (
              <motion.div 
                key={product._id} 
                className={`${styles.productCard} ${isOutOfStock ? styles.outOfStockCard : ""}`}
                whileHover={!isOutOfStock ? { y: -8, scale: 1.02 } : {}}
              >
                <div className={styles.imagePlaceholder}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className={styles.productImg} />
                  ) : (
                    <ShoppingBag size={48} color="#cbd5e1" />
                  )}
                  {isOutOfStock && <div className={styles.badge}>สินค้าหมด</div>}
                </div>
                
                <div className={styles.cardBody}>
                  <h3 className={styles.name}>{product.name}</h3>
                  <p className={styles.sku}>รายละเอียดเพิ่มเติมคลิกดูได้เลยจ้า</p>
                  
                  <div className={styles.infoRow}>
                    <span className={`${styles.stockStatus} ${isOutOfStock ? styles.lowStock : ""}`}>
                      เหลือ : {product.stock} ชิ้น
                    </span>
                    <div className={styles.pricePill}>
                      {product.price.toLocaleString()} ฿
                    </div>
                  </div>


                  {!isOutOfStock && (
                    <>
                      <div className={styles.qtyRow}>
                        <span className={styles.qtyLabel}>จำนวนที่ต้องการ</span>
                        <div className={styles.qtyPicker}>
                          <button className={styles.qtyBtn} onClick={() => updateQty(product._id, -1, product.stock)}><Minus size={14}/></button>
                          <span className={styles.qtyVal}>{qty}</span>
                          <button className={styles.qtyBtn} onClick={() => updateQty(product._id, 1, product.stock)}><Plus size={14}/></button>
                        </div>
                      </div>
                      <button 
                        className={styles.buyBtn} 
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart size={18} /> สั่งซื้อตอนนี้เลย
                      </button>
                    </>
                  )}

                  {isOutOfStock && (
                    <button className={styles.outOfStockBtn} disabled>
                      <X size={18} /> สินค้าหมด
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <motion.div 
          className={styles.cartPanel}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => router.push('/cart')}
        >
          <ShoppingCart />
          <span>{cart.length} รายการ | ฿{cartTotal().toLocaleString()}</span>
        </motion.div>
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModalOpen && settings.promptpay_qr && (
          <div 
            className={styles.modalOverlay} 
            onClick={() => setQrModalOpen(false)}
            style={{ zIndex: 3000 }}
          >
            <motion.div 
              className={styles.modal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '400px', textAlign: 'center' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>QR Code พร้อมเพย์</h3>
                <button 
                  onClick={() => setQrModalOpen(false)}
                  style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                <img 
                  src={settings.promptpay_qr} 
                  alt="PromptPay QR" 
                  style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                   <Smartphone size={24} color="var(--primary)" />
                   <span>{settings.promptpay}</span>
                </div>
                {settings.promptpay_name && (
                  <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    ชื่อบัญชี: {settings.promptpay_name}
                  </div>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '0.95rem' }}>สแกนผ่านแอปธนาคารเพื่อชำระเงิน</p>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
