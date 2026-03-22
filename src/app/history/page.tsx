"use client";

import { useStore } from "@/store/useStore";
import styles from "./History.module.css";
import { motion } from "framer-motion";
import { Search, Store, Info, Package, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Clock } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const tabs = ["ทั้งหมด", "สำเร็จแล้ว", "ยกเลิก"];

export default function HistoryView() {
  const { orders, fetchOrders } = useStore();
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const itemsPerPage = 8;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

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

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (activeTab === "ทั้งหมด") return true;
    if (activeTab === "สำเร็จแล้ว" && o.status === "Completed") return true;
    if (activeTab === "ยกเลิก" && o.status === "Cancelled") return true;
    return o.status === activeTab;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, 5);
      else if (end === totalPages) start = Math.max(1, totalPages - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

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

      <div className={styles.header}>
        <div className={styles.titleArea}>
           <Store size={28} className={styles.icon} />
           <h2>ประวัติที่ผ่านมา ({orders.length})</h2>
        </div>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.filtersGroup}>
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
        </div>

        {totalPages > 0 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>แสดง {((currentPage-1)*itemsPerPage)+1}-{Math.min(currentPage*itemsPerPage, filteredOrders.length)} จาก {filteredOrders.length} รายการ</span>
            <div className={styles.pageControls}>
              <button 
                className={styles.pageBtn} 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              
              {getPageNumbers().map((page, idx) => (
                <button 
                  key={idx}
                  className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              
              <button 
                className={styles.pageBtn} 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.searchBar}>
        <Search size={20} color="#999" />
        <input
          type="text"
          placeholder="คุณสามารถค้นหาโดยใช้ชื่อผู้ประกอบการ หมายเลขคำสั่งซื้อ หรือชื่อสินค้า"
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>รหัสออเดอร์</th>
              <th>วันที่สั่งซื้อ</th>
              <th>วิธีชำระ</th>
              <th>ยอดรวม</th>
              <th>สถานะ</th>
              <th style={{ textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>ยังไม่มีคำสั่งซื้อ</td>
              </tr>
            ) : (
              currentOrders.map(order => (
                <React.Fragment key={order._id}>
                  <tr 
                    className={`${styles.orderRow} ${expandedOrderId === order._id ? styles.rowActive : ""}`}
                    onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                  >
                    <td>
                      <div className={styles.idCell}>
                        <Package size={16} className={styles.idIcon} />
                        #{order._id.slice(-8).toUpperCase()}
                      </div>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString('th-TH', { 
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}</td>
                    <td>{order.paymentMethod}</td>
                    <td className={styles.amountText}>฿{order.total.toLocaleString()}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${order.status === 'Completed' ? styles.statusCompleted : order.status === 'Cancelled' ? styles.statusCancelled : styles.statusPending}`}>
                        {order.status === 'Completed' ? 'สำเร็จแล้ว' : order.status === 'Cancelled' ? 'ยกเลิก' : 'รอดำเนินการ'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className={styles.actionBtnRow}>
                        {expandedOrderId === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </td>
                  </tr>
                  {expandedOrderId === order._id && (
                    <tr className={styles.detailRow}>
                      <td colSpan={6}>
                        <motion.div 
                          className={styles.orderDetailCard}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <div className={styles.detailCardHeader}>
                            <div className={styles.cardHeaderLeft}>
                                <div className={styles.mainTitle}>{new Date(order.createdAt).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                <div className={styles.subTitle}>{order.total} บาท</div>
                            </div>
                            <div className={styles.cardHeaderRight}>
                               <div className={`${styles.statusBadgeFull} ${order.status === 'Completed' ? styles.bgSuccess : order.status === 'Cancelled' ? styles.bgDanger : styles.bgWarning}`}>
                                 <Clock size={16} /> {order.status === 'Completed' ? 'ชำระเงินสำเร็จ' : order.status === 'Cancelled' ? 'ยกเลิกแล้ว' : 'รอตรวจสอบ'}
                               </div>
                            </div>
                          </div>

                          <div className={styles.detailInfoGrid}>
                            <div className={styles.infoCol}>
                              <div className={styles.infoLabel}>รหัสการจอง</div>
                              <div className={styles.infoValue}>#{order._id.slice(-8).toUpperCase()}</div>
                            </div>
                            <div className={styles.infoCol}>
                              <div className={styles.infoLabel}>วันที่จอง</div>
                              <div className={styles.infoValue}>{new Date(order.createdAt).toLocaleString('th-TH')}</div>
                            </div>
                            

                            <div className={styles.infoCol}>
                              <div className={styles.infoLabel}>ยอดชำระ</div>
                              <div className={styles.infoValueEmphasis}>{order.total.toLocaleString()} บาท</div>
                            </div>
                            <div className={styles.infoCol}>
                              <div className={styles.infoLabel}>ประเภทสินค้า</div>
                              <div className={styles.infoValue}>สินค้าทั่วไป</div>
                            </div>
                            <div className={styles.infoCol}>
                              <div className={styles.infoLabel}>สถานะ</div>
                              <div className={`${styles.statusText} ${order.status === 'Completed' ? styles.txtSuccess : order.status === 'Cancelled' ? styles.txtDanger : styles.txtWarning}`}>
                                {order.status === 'Completed' ? 'สำเร็จแล้ว' : order.status === 'Cancelled' ? 'ยกเลิก' : 'รอตรวจสอบ'}
                              </div>
                            </div>
                          </div>

                          <div className={styles.itemsSection}>
                             <label className={styles.sectionLabel}>รายการสินค้า ({order.items.length})</label>
                             <div className={styles.miniItemsList}>
                                {order.items.map((item, idx) => (
                                  <div key={idx} className={styles.miniItem}>
                                    <div className={styles.miniItemMain}>
                                      <span className={styles.itemNameText}>{item.name}</span>
                                      <span className={styles.itemQtyText}>x{item.quantity}</span>
                                    </div>
                                    <span className={styles.itemPriceText}>฿{(item.price * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))}
                             </div>
                          </div>

                          <div className={styles.slipWrapper}>
                             <label className={styles.sectionLabel}>หลักฐานการชำระเงิน</label>
                             <div className={styles.receiptContainer}>
                                <div className={styles.receiptHeader}>
                                   <div className={styles.receiptShop}>
                                      <span className={styles.shopLogo}>MAKE</span>
                                      <span className={styles.shopBy}>by KBank</span>
                                   </div>
                                   <div className={styles.receiptTitle}>โอนเงินสำเร็จ</div>
                                   <div className={styles.receiptDate}>{new Date().toLocaleDateString('th-TH')}</div>
                                </div>
                                <div className={styles.receiptBody}>
                                   <div className={styles.receiptRow}>
                                      <div className={styles.userIcon}>👤</div>
                                      <div className={styles.userDetails}>
                                         <strong>ศักรินทร์ ห.</strong>
                                         <span>xxx-x-x3524-x</span>
                                      </div>
                                   </div>
                                   <div className={styles.receiptArrow}>↓</div>
                                   <div className={styles.receiptRow}>
                                      <div className={styles.userIcon}>👤</div>
                                      <div className={styles.userDetails}>
                                         <strong>ศักรินทร์ หาญกล้า</strong>
                                         <span>xxx-x-x8618-x</span>
                                      </div>
                                   </div>
                                   <div className={styles.receiptTotal}>
                                      <span>จำนวน</span>
                                      <strong>{order.total.toFixed(2)} บาท</strong>
                                   </div>
                                   <div className={styles.receiptRef}>
                                      เลขที่รายการ: {order._id.slice(0, 12)}
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className={styles.footerActions}>
                             <div className={`${styles.noticeBanner} ${order.status === 'Completed' ? styles.bannerSuccess : order.status === 'Cancelled' ? styles.bannerDanger : styles.bannerWarning}`}>
                                <Info size={18} />
                                <span>{order.status === 'Completed' ? 'รายการนี้ตรวจสอบและยืนยันเรียบร้อยแล้ว' : order.status === 'Cancelled' ? 'รายการนี้ถูกยกเลิก: ' + (order.cancelReason || 'ไม่ระบุ') : 'กำลังรอการตรวจสอบจากผู้ดูแลและระบบ โปรดรอสักครู่'}</span>
                             </div>

                             <div className={styles.btnGroup}>
                                <button className={`${styles.actionBtn} ${styles.primary}`} onClick={() => router.push('/shop')}>ซื้ออีกครั้ง</button>
                                {(order.status === "Pending" || order.status === "Completed") && (
                                  <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); setCancelModal(order._id); }}>ยกเลิกคำสั่งซื้อ</button>
                                )}
                                <button className={styles.actionBtn} onClick={() => router.push('/contact')}>ติดต่อผู้ขาย</button>
                             </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
