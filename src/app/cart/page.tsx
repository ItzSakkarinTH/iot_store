"use client";

import { useStore } from "@/store/useStore";
import { CheckSquare, Tag, FileText, Trash2, ShoppingCart } from "lucide-react";
import styles from "./Cart.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, clearCart, addOrder } = useStore();
  const [coupon, setCoupon] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const orderData = {
        items: cart.map(item => ({ product: item._id, quantity: item.quantity, price: item.price })),
        total: cartTotal(),
        paymentMethod: "Credit Card",
        status: "Completed",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const result = await res.json();
        addOrder(result);
        clearCart();
        setShowPayment(false);
        setShowSuccess(true);
      } else {
        alert("ทำรายการไม่สำเร็จ กรุณาลองใหม่");
        setShowPayment(false);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
      setShowPayment(false);
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      removeFromCart(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* Delete Modal */}
      {deleteId && (
        <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>ยืนยันการนำสินค้าออกจากตะกร้า</h2>
            <p className={styles.modalDesc}>
              นำสินค้าออกจากตะกร้า 1 รายการ ของแถมและโปรโมชันที่เกี่ยวข้องกับสินค้าจะถูกนำออกจากตะกร้าด้วย
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnCancel} onClick={() => setDeleteId(null)}>ยกเลิก</button>
              <button className={styles.modalBtnConfirm} onClick={confirmDelete}>ลบรายการสินค้า</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className={styles.modalOverlay} onClick={() => setShowPayment(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>ยืนยันการชำระเงิน</h2>
            <p className={styles.modalDesc}>
              ยอดชำระเงินทั้งหมด <b>฿{cartTotal().toLocaleString()}</b><br/>ต้องการดำเนินการชำระเงินเลยหรือไม่?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnCancel} onClick={() => setShowPayment(false)}>ยกเลิก</button>
              <button className={styles.modalBtnSuccess} onClick={handleCheckout}>ยืนยันการชำระเงิน</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div style={{ background: 'var(--success)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckSquare size={32} color="white" />
            </div>
            <h2 className={styles.modalTitle}>สั่งซื้อสำเร็จ!</h2>
            <p className={styles.modalDesc}>
              รายการคำสั่งซื้อของคุณได้รับการยืนยันแล้ว
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnSuccess} onClick={() => router.push("/history")}>ดูประวัติการสั่งซื้อ</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.titleArea}>
        <CheckSquare size={28} />ตะกร้าสินค้า ({cart.length})
      </div>

      <div className={styles.layout}>
        {cart.length === 0 ? (
          <div className={styles.card} style={{ flex: 1, textAlign: 'center', padding: '6rem 2rem' }}>
            <ShoppingCart size={64} style={{ opacity: 0.2, margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>ไม่มีสินค้าในตะกร้า</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>คุณยังไม่ได้เลือกสินค้าใดๆ ลงในตะกร้า</p>
            <button 
              className={styles.checkoutBtn} 
              onClick={() => router.push('/shop')}
              style={{ width: 'auto', padding: '1rem 2rem', margin: '0 auto' }}
            >
              ไปเลือกซื้อสินค้า
            </button>
          </div>
        ) : (
          <>
            {/* Left Column - Product List */}
            <div className={styles.leftCol}>
              <div className={styles.card}>
                <div className={styles.selectAllBar}>
                  <input type="checkbox" className={styles.checkbox} checked readOnly />
                  <ShoppingCart size={20} />
                  <span>สินค้าทั้งหมด ({cart.length})</span>
                </div>
                
                <div className={styles.productList}>
                  {cart.map((item) => (
                    <div key={item._id} className={styles.productItem}>
                      <input type="checkbox" className={styles.checkbox} checked readOnly />
                      
                      <div className={styles.imageBox}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span>No Image</span>
                        )}
                      </div>
                      
                      <div className={styles.itemDetails}>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemDesc}>รหัสอ้างอิง: {item.sku}</div>
                        {item.stock < 10 && <div className={styles.itemStatus}>เหลือเพียง {item.stock} ชิ้น</div>}
                      </div>

                      <div className={styles.itemActions}>
                        <div className={styles.itemPrice}>฿{(item.price * item.quantity).toLocaleString()}</div>
                        
                        <div className={styles.qtyWrapper}>
                          <button className={styles.qtyBtn} onClick={() => updateCartQuantity(item._id, item.quantity - 1)}>-</button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button className={styles.qtyBtn} onClick={() => updateCartQuantity(item._id, item.quantity + 1)}>+</button>
                        </div>

                        <button className={styles.deleteBtn} onClick={() => setDeleteId(item._id)}>
                          <Trash2 size={16} /> ลบสินค้า
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className={styles.rightCol}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}><Tag size={20} /> โค้ดส่วนลด</h3>
                <div className={styles.couponInputWrapper}>
                  <input 
                    type="text" 
                    placeholder="กรอกโค้ดส่วนลด..." 
                    className={styles.couponInput}
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <button className={styles.couponBtn}>ใช้งาน</button>
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}><FileText size={20} /> สรุปรายการสั่งซื้อ</h3>
                
                <div className={styles.summaryArea}>
                  <div className={styles.summaryRow}>
                    <span>คำสั่งซื้อสินค้าทั้งหมด ({cart.length} ชิ้น)</span>
                    <span className={styles.value}>฿{cartTotal().toLocaleString()}</span>
                  </div>
                  
                  <hr className={styles.divider} />
                  
                  <div className={`${styles.summaryRow} ${styles.discount}`}>
                    <span>คูปอง / โค้ดส่วนลด<br/><small style={{color: 'var(--text-muted)'}}>(ส่วนลดหลัก)</small></span>
                    <span className={styles.value}>-฿0</span>
                  </div>

                  <div className={styles.totalRow}>
                    <div>
                      <span className={styles.totalLabel}>ยอดรวมสุทธิทั้งหมด :</span>
                      <span className={styles.totalSub}>(ราคานี้รวมภาษีมูลค่าเพิ่ม)</span>
                    </div>
                    <span className={styles.totalValue}>฿{cartTotal().toLocaleString()}</span>
                  </div>

                  <button 
                    className={styles.checkoutBtn}
                    onClick={() => setShowPayment(true)}
                  >
                    ดำเนินการต่อ
                  </button>

                  <button className={styles.quoteBtn}>
                    <FileText size={18} /> ขอใบเสนอราคา
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
