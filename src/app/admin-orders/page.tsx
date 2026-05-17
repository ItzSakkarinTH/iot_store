"use client";

import { useStore } from "@/store/useStore";
import styles from "./AdminOrders.module.css";
import { motion } from "framer-motion";
import { Search, Box, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Clock, Package, Info } from "lucide-react";
import React, { useState, useEffect } from "react";

const tabs = ["ทั้งหมด", "สำเร็จแล้ว", "ยกเลิก"];

export default function AdminOrdersView() {
  const { orders, fetchOrders } = useStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const itemsPerPage = 7;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, activeTab]);



  const filteredOrders = orders.filter(o =>
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(o => {
    if (activeTab === "ทั้งหมด") return true;
    if (activeTab === "สำเร็จแล้ว" && o.status === "Completed") return true;
    if (activeTab === "ยกเลิก" && o.status === "Cancelled") return true;
    if (o.status === activeTab) return true;
    return false;
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
      <div className={styles.header}>
        <div className={styles.titleArea}>
           <Box size={28} className={styles.icon} />
           <h2>รายการคำสั่งซื้อทั้งหมด</h2>
        </div>
        
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="ค้นหาสินค้า, ผู้ส่ง, เอกสาร..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
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
                <td colSpan={6} className={styles.emptyCell}>ไม่พบข้อมูลตามที่ค้นหา</td>
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
                      <div className={styles.actionBtn}>
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

                              <div className={styles.headerTitles}>
                                <div className={styles.mainTitle}>{new Date(order.createdAt).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                <div className={styles.subTitle}>{order.total.toLocaleString()} บาท</div>
                              </div>
                            </div>
                            <div className={styles.cardHeaderRight}>
                               <div className={`${styles.statusBadgeFull} ${order.status === 'Completed' ? styles.bgSuccess : order.status === 'Cancelled' ? styles.bgDanger : styles.bgWarning}`}>
                                 <Clock size={16} /> {order.status === 'Completed' ? 'ชำระเงินสำเร็จ' : order.status === 'Cancelled' ? 'ยกเลิกแล้ว' : 'รอตรวจสอบ'}
                               </div>
                               <button className={styles.expandIconBtn}><ChevronUp size={20} /></button>
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

                          {(order.buyerName || order.buyerPhone || order.buyerAddress) && (
                            <div className={styles.buyerDetailSection}>
                              <label className={styles.sectionLabel}>ข้อมูลลูกค้าและที่อยู่จัดส่ง</label>
                              <div className={styles.buyerInfoGrid}>
                                <div className={styles.buyerInfoItem}>
                                  <span className={styles.infoLabelSmall}>ชื่อลูกค้า:</span>
                                  <span className={styles.infoValueSmall}>{order.buyerName || "-"}</span>
                                </div>
                                <div className={styles.buyerInfoItem}>
                                  <span className={styles.infoLabelSmall}>เบอร์โทรศัพท์:</span>
                                  <span className={styles.infoValueSmall}>{order.buyerPhone || "-"}</span>
                                </div>
                                <div className={styles.buyerInfoItem} style={{ gridColumn: 'span 2' }}>
                                  <span className={styles.infoLabelSmall}>ที่อยู่จัดส่ง:</span>
                                  <span className={styles.infoValueSmall}>{order.buyerAddress || "-"}</span>
                                </div>
                              </div>
                            </div>
                          )}

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

                          <div className={`${styles.noticeBanner} ${order.status === 'Completed' ? styles.bannerSuccess : order.status === 'Cancelled' ? styles.bannerDanger : styles.bannerWarning}`}>
                             <Info size={18} />
                             <span>{order.status === 'Completed' ? 'รายการนี้ตรวจสอบและยืนยันเรียบร้อยแล้ว' : order.status === 'Cancelled' ? 'รายการนี้ถูกยกเลิก: ' + (order.cancelReason || 'ไม่ระบุ') : 'กำลังรอการตรวจสอบจากผู้ดูแลและระบบ โปรดรอสักครู่'}</span>
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
