"use client";

import { useStore, CartItem } from "@/store/useStore";
import styles from "./History.module.css";
import { motion } from "framer-motion";
import { Search, Store, Info, Package, Truck } from "lucide-react";
import { useState, useEffect } from "react";

const tabs = ["ทั้งหมด", "สำเร็จแล้ว", "ยกเลิก"];

export default function HistoryView() {
  const { orders, fetchOrders } = useStore();
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(o => {
    if (activeTab === "ทั้งหมด") return true;
    if (activeTab === "สำเร็จแล้ว" && o.status === "Completed") return true;
    if (activeTab === "ยกเลิก" && o.status === "Cancelled") return true;
    if (o.status === activeTab) return true;
    return false;
  });

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.tabsContainer}>
        {tabs.map(tab => (
          <button 
            key={tab} 
            className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.searchBar}>
        <Search size={20} color="#999" />
        <input 
          type="text" 
          placeholder="คุณสามารถค้นหาโดยใช้ชื่อผู้ขาย หมายเลขคำสั่งซื้อ หรือชื่อสินค้า" 
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.listContainer}>
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>ยังไม่มีคำสั่งซื้อ</div>
        ) : (
          filteredOrders.map(order => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.shopInfo}>
                  <Store size={16} /> <span>UltraStore</span>
                </div>
                <div className={styles.orderStatus}>
                  {order.status === "Completed" ? "สำเร็จแล้ว" : 
                   order.status === "Cancelled" ? "ยกเลิก" : 
                   order.status === "Pending" ? "ที่ต้องชำระ" : order.status}
                </div>
              </div>
              
              <div className={styles.itemsList}>
                {order.items.map((item: CartItem) => (
                  <div key={item._id} className={styles.itemRow}>
                    <div className={styles.itemMain}>
                      {item.image ? (
                        <img src={item.image} className={styles.itemImage} alt={item.name} />
                      ) : (
                        <div className={styles.itemImage} style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '0.8rem' }}>ไม่มีรูป</div>
                      )}
                      <div className={styles.itemDetails}>
                        <span className={styles.itemName}>{item.name || "ชื่อสินค้า"}</span>
                        <span className={styles.itemVariant}>ตัวเลือกสินค้า: ปกติ</span>
                        <span className={styles.itemQuantity}>x{item.quantity}</span>
                      </div>
                    </div>
                    <span className={styles.itemPrice}>฿{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className={styles.orderFooter}>
                <div className={styles.totalRow}>
                  รวมการสั่งซื้อ: <span className={styles.totalSum}>฿{order.total.toLocaleString()}</span>
                </div>
                <div className={styles.actionRow}>
                  <div className={styles.statusMessage}>
                    {order.status === "Cancelled" ? "ยกเลิกอัตโนมัติโดยระบบ" : "คำสั่งซื้อสำเร็จเรียบร้อย"} <Info size={14} />
                  </div>
                  <div className={styles.actionBtns}>
                    <button className={`${styles.actionBtn} ${styles.primary}`}>ซื้ออีกครั้ง</button>
                    {order.status === "Cancelled" && <button className={styles.actionBtn}>ดูรายละเอียดการยกเลิกคำสั่งซื้อ</button>}
                    <button className={styles.actionBtn}>ติดต่อผู้ขาย</button>
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
