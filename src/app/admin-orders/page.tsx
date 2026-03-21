"use client";

import { useStore, CartItem } from "@/store/useStore";
import styles from "./AdminOrders.module.css";
import { motion } from "framer-motion";
import { Search, Box } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminOrdersView() {
  const { orders, fetchOrders } = useStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <Box size={28} className={styles.icon} />
          <h2>รายการคำสั่งซื้อทั้งหมด (สำหรับผู้ดูแล/Admin)</h2>
        </div>
        
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="ค้นหาตามรหัสรายการ หรือ ชื่อสินค้า..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className={styles.listContainer}>
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>ยังไม่มีรายการคำสั่งซื้อเข้ามา</div>
        ) : (
          filteredOrders.map(order => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderId}>Order #{order._id} <span style={{fontSize:'0.9rem', padding: '0.2rem 0.5rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px', marginLeft:'10px'}}>{order.status}</span></div>
                <div className={styles.orderDate}>{new Date(order.createdAt).toLocaleString()}</div>
              </div>
              
              <div className={styles.orderBody}>
                <div className={styles.itemsList}>
                  {order.items.map((item: CartItem) => (
                    <div key={item._id} className={styles.itemRow}>
                      <div className={styles.itemMain}>
                        {item.image ? (
                          <img src={item.image} className={styles.miniThumb} alt={item.name} />
                        ) : (
                          <div className={styles.miniThumbPlaceholder} />
                        )}
                        <span className={styles.itemNameText}>{item.quantity}x {item.name}</span>
                      </div>
                      <span className={styles.itemSum}>฿{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className={styles.orderSummary}>
                  <div className={styles.paymentMethod}>
                    Method: <span>{order.paymentMethod}</span>
                  </div>
                  <div className={styles.totalBlock}>
                    Total: <span className={styles.totalValue}>฿{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
