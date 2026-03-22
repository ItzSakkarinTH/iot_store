"use client";

import { useStore, CartItem } from "@/store/useStore";
import styles from "./History.module.css";
import { motion } from "framer-motion";
import { Search, Store, Info, Package, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const tabs = ["ทั้งหมด", "สำเร็จแล้ว", "ยกเลิก"];

export default function HistoryView() {
  const { orders, fetchOrders } = useStore();
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelDetails, setCancelDetails] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const cancelOptions = [
    "เปลี่ยนใจ / ไม่ต้องการแล้ว",
    "สั่งซื้อผิดพลาด / ขนาดหรือสีผิด",
    "พบสินค้าที่อื่นราคาถูกกว่า",
    "จัดส่งล่าช้าเกินไป",
    "อื่นๆ"
  ];
  
  const router = useRouter();

  const handleCancelSubmit = async () => {
    if (!cancelReason) {
      alert("กรุณาเลือกสาเหตุการยกเลิก");
      return;
    }
    
    setIsCancelling(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: cancelModal,
          cancelReason,
          cancelDetails
        })
      });
      
      if (res.ok) {
        setCancelModal(null);
        setCancelReason("");
        setCancelDetails("");
        fetchOrders();
      } else {
        alert("ทำรายการไม่สำเร็จ");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsCancelling(false);
    }
  };

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
      {cancelModal && (
        <div className={styles.modalOverlay} onClick={() => setCancelModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ textAlign: 'left', maxWidth: '500px' }}>
            <h2 className={styles.modalTitle}>ยกเลิกคำสั่งซื้อ</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>สาเหตุที่ยกเลิก *</label>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{ 
                    width: '100%', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '8px', 
                    background: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    color: cancelReason ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  <span>{cancelReason || "-- เลือกสาเหตุ --"}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▼</span>
                </div>
                
                {isDropdownOpen && (
                  <div style={{ 
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', 
                    background: 'white', border: '1px solid var(--glass-border)', borderRadius: '8px', 
                    boxShadow: 'var(--glass-shadow)', zIndex: 10, overflow: 'hidden' 
                  }}>
                    {cancelOptions.map((option, idx) => (
                      <div 
                        key={idx}
                        onClick={() => { setCancelReason(option); setIsDropdownOpen(false); }}
                        style={{ 
                          padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: idx < cancelOptions.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                          background: cancelReason === option ? 'var(--primary-light)' : 'white', 
                          color: cancelReason === option ? 'var(--primary)' : 'var(--text-primary)',
                          fontWeight: cancelReason === option ? 600 : 400
                        }}
                        onMouseEnter={(e) => { if (cancelReason !== option) e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={(e) => { if (cancelReason !== option) e.currentTarget.style.background = 'white'; }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>รายละเอียดเพิ่มเติม</label>
                <textarea 
                  className={styles.searchInput}
                  rows={3}
                  style={{ width: '100%', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '8px', resize: 'vertical' }}
                  placeholder="รบกวนระบุข้อมูลเพิ่มเติมเพื่อให้เราปรับปรุงให้ดีขึ้น..."
                  value={cancelDetails}
                  onChange={e => setCancelDetails(e.target.value)}
                />
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className={styles.actionBtn} 
                onClick={() => setCancelModal(null)}
                style={{ background: 'var(--surface)' }}
              >
                ปิด
              </button>
              <button 
                className={`${styles.actionBtn} ${styles.primary}`} 
                onClick={handleCancelSubmit}
                disabled={isCancelling}
                style={{ opacity: isCancelling ? 0.6 : 1, background: 'var(--primary)', borderColor: 'var(--primary)' }}
              >
                {isCancelling ? "กำลังดำเนินการ..." : "ยืนยันการยกเลิก"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {order.status === "Completed" ? "ชำระแล้ว" :
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
                {order.status === "Cancelled" && order.cancelReason && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', marginTop: '1rem', color: '#991b1b', fontSize: '0.95rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>สาเหตุการยกเลิก: {order.cancelReason}</div>
                    {order.cancelDetails && <div>รายละเอียด: {order.cancelDetails}</div>}
                  </div>
                )}
                <div className={styles.actionRow} style={{ marginTop: '1.25rem' }}>
                  <div className={styles.statusMessage}>
                    {order.status === "Cancelled" ? "ยกเลิกอัตโนมัติโดยระบบ" : "คำสั่งซื้อสำเร็จเรียบร้อย"} <Info size={14} />
                  </div>
                  <div className={styles.actionBtns}>
                    <button className={`${styles.actionBtn} ${styles.primary}`} onClick={() => router.push('/shop')}>ซื้ออีกครั้ง</button>
                    {(order.status === "Pending" || order.status === "Completed") && (
                      <button className={styles.actionBtn} onClick={() => setCancelModal(order._id)}>ยกเลิกคำสั่งซื้อ</button>
                    )}
                    <button className={styles.actionBtn} onClick={() => router.push('/contact')}>ติดต่อผู้ขาย</button>
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
