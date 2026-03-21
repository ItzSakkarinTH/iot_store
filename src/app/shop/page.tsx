"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { ShoppingCart, Plus } from "lucide-react";
import styles from "./Shop.module.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ShopPage() {
  const router = useRouter();
  const { 
    products, cart, addToCart, fetchProducts, cartTotal
  } = useStore();
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
                <p className={styles.sku}>SKU: {product.sku}</p>
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
          onClick={() => router.push('/cart')}
        >
          <ShoppingCart />
          <span>{cart.length} รายการ | ฿{cartTotal().toLocaleString()}</span>
        </motion.div>
      )}

    </div>
  );
}
