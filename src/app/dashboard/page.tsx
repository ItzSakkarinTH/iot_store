"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer
} from "recharts";
import styles from "../Dashboard.module.css";
import { motion } from "framer-motion";
import { Gift, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { orders, fetchOrders } = useStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  // Calculate today's revenue based on current date (mock simple check)
  const today = new Date().toLocaleDateString();
  const todayRevenue = orders
    .filter(o => new Date(o.createdAt).toLocaleDateString() === today)
    .reduce((sum, order) => sum + order.total, 0);
  const totalSalesCount = orders.length;

  const lineData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString();
    const val = orders
      .filter(o => new Date(o.createdAt).toLocaleDateString() === dayStr)
      .reduce((sum, order) => sum + order.total, 0);
    return { day: i === 6 ? "วันนี้" : dayStr, value: val };
  });

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >

      <header className={styles.header}>
        <h1 className={styles.title}>ยินดีต้อนรับกลับมา!</h1>
        <p className={styles.subtitle}>Welcome back EcoPOS Admin!</p>
      </header>

      <div className={styles.mainGrid}>
        
        {/* Left Column */}
        <div className={styles.leftCol}>
          
          <div className={styles.panelSection}>
            <h2 className={styles.sectionHeader}>
              การวิเคราะห์
              <span className={styles.sectionSub}>Analytics</span>
            </h2>

            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <div className={styles.statLabelRow}>
                  <p>ยอดการรับเงิน (วันนี้)<br/><span>Sales Today</span></p>
                  <span className={styles.badge}>วันนี้</span>
                </div>
                <h3>{todayRevenue.toLocaleString()} <span>บาท</span></h3>
              </div>
              
              <div className={styles.statBox}>
                <div className={styles.statLabelRow}>
                  <p>ยอดการรับเงิน (ทั้งหมด)<br/><span>Total Sales</span></p>
                  <span className={styles.badge}>ทั้งหมด</span>
                </div>
                <h3>{totalRevenue.toLocaleString()} <span>บาท</span></h3>
              </div>
              
              <div className={styles.statBox}>
                <div className={styles.statLabelRow}>
                  <p>จำนวนรายการขาย<br/><span>Total Orders</span></p>
                  <span className={styles.badge}>ทั้งหมด</span>
                </div>
                <h3>{totalSalesCount} <span>ครั้ง</span></h3>
              </div>
            </div>
          </div>

          <div className={styles.panelSectionChart}>
             <div className={styles.chartHeader}>
                <div>
                  <h2 className={styles.chartTitle}>ประวัติยอดขาย<span className={styles.sectionSub}>Sales History</span></h2>
                </div>
                <div className={styles.chartFilters}>
                  {["7 วัน", "14 วัน", "1 เดือน", "3 เดือน"].map(f => (
                    <button key={f} className={`${styles.filterBtn} ${f === "1 เดือน" ? styles.filterActive : ""}`}>{f}</button>
                  ))}
                </div>
             </div>
             
             <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lineData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: "var(--text-muted)", fontSize: 12}} dy={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                      itemStyle={{ color: "#3b82f6" }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={0.2} fill="#3b82f6" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightCol}>
           <div className={styles.recentPanel}>
             <div className={styles.recentHeader}>
                <h2>รายการล่าสุด</h2>
                <span className={styles.sectionSub}>Recent Orders</span>
             </div>
             <div className={styles.recentList}>
               {orders.length === 0 ? (
                 <div className={styles.recentItemMock}>
                    <div className={styles.recentHead}>
                      <span className={styles.recentName}>ยังไม่มีรายการ<span className={styles.recentDate}>-</span></span>
                    </div>
                 </div>
               ) : (
                 orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0,5).map(order => (
                   <div key={order._id} className={styles.recentItemMock}>
                      <div className={styles.recentHead}>
                        <span className={styles.recentName}>ออเดอร์ #{order._id.substring(0,6)} <span className={styles.recentDate}>{new Date(order.createdAt).toLocaleString('th-TH')}</span></span>
                      </div>
                      <div className={styles.recentRow}>
                        <span className={styles.recentMsg}>{order.items.length} รายการ ({order.paymentMethod})</span>
                        <span className={styles.recentAmountBadge}>{order.total.toLocaleString()} บาท</span>
                      </div>
                   </div>
                 ))
               )}
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
