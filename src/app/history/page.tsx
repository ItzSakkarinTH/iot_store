"use client";

import { useStore, CartItem } from "@/store/useStore";
import styles from "./History.module.css";
import { motion } from "framer-motion";
import { History, Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function HistoryView() {
  const { orders, fetchOrders } = useStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <History size={28} className={styles.icon} />
          <h2>Sales History</h2>
        </div>
        
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search Order ID or Method..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className={styles.listContainer}>
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>No sales history found.</div>
        ) : (
          filteredOrders.map(order => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderId}>Order #{order._id}</div>
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
