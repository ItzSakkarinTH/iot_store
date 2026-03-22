"use client";

import { useStore } from "@/store/useStore";
import { CheckSquare, Tag, FileText, Trash2, ShoppingCart, UploadCloud, Loader2 } from "lucide-react";
import styles from "./Cart.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Tesseract from "tesseract.js";

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, clearCart, addOrder } = useStore();
  const [coupon, setCoupon] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // OCR State
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [ocrText, setOcrText] = useState("");
  
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setOcrStatus("processing");

    try {
      // Use Tesseract to perform OCR on Thai and English text
      const result = await Tesseract.recognize(file, 'tha+eng');
      const text = result.data.text;
      
      setOcrText(text);
      setOcrStatus("success");
    } catch (err) {
      console.error("OCR Error:", err);
      setOcrStatus("error");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (slipFile && ocrStatus === "processing") {
      alert("กรุณารอระบบตรวจสอบสลิปให้เสร็จสิ้นก่อน");
      return;
    }
    if (slipFile && ocrStatus === "success" && !(ocrText.includes(cartTotal().toString()) || ocrText.replace(/,/g, '').includes(cartTotal().toString()))) {
      alert("ไม่สามารถดำเนินการต่อได้เนื่องจากยอดเงินในสลิปไม่ตรงกับยอดที่ต้องชำระ");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const orderData = {
        items: cart.map(item => ({ 
          productId: item._id, 
          name: item.name, 
          image: item.image, 
          quantity: item.quantity, 
          price: item.price 
        })),
        total: cartTotal(),
        paymentMethod: slipFile ? "Bank Transfer" : "Credit Card",
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
        // Reset OCR states
        setSlipFile(null);
        setSlipPreview(null);
        setOcrStatus("idle");
        setOcrText("");
      } else {
        alert("ทำรายการไม่สำเร็จ กรุณาลองใหม่");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
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

      {/* Payment Modal with OCR */}
      {showPayment && (
        <div className={styles.modalOverlay} onClick={() => setShowPayment(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>ยืนยันการชำระเงิน</h2>
            <p className={styles.modalDesc}>
              ยอดชำระเงินทั้งหมด <b>฿{cartTotal().toLocaleString()}</b>
            </p>
            
            <div className={styles.ocrSection} style={{ marginTop: '1rem', padding: '1.5rem', border: '1px dashed var(--glass-border)', borderRadius: '12px', background: 'rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>1. อัปโหลดสลิปโอนเงิน (AI ตรวจสอบ)</h3>
              
              {!slipPreview ? (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', backgroundColor: 'var(--surface)', border: '2px dashed var(--primary)', borderRadius: '12px', cursor: 'pointer', color: 'var(--primary)', transition: '0.2s' }}>
                  <UploadCloud size={32} style={{ marginBottom: '0.5rem' }} />
                  <span>คลิกเพื่ออัปโหลดสลิป</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
              ) : (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <img src={slipPreview} alt="Slip" style={{ width: '100px', height: 'auto', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                  <div style={{ flex: 1 }}>
                    {ocrStatus === "processing" && (
                      <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <Loader2 className={styles.spinnerIcon} /> AI กำลังอ่านค่าจากสลิป...
                      </div>
                    )}
                    {ocrStatus === "success" && (() => {
                      const isAmountMatched = ocrText.includes(cartTotal().toString()) || ocrText.replace(/,/g, '').includes(cartTotal().toString());
                      return (
                      <div style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          ✅ สแกนสลิปสำเร็จ
                        </div>
                        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span style={{ color: '#64748b' }}>สถานะยอดเงิน:</span>
                             <span style={{ fontWeight: 600, color: isAmountMatched ? 'green' : '#dc2626' }}>
                               {isAmountMatched ? `ตรงกัน (฿${cartTotal().toLocaleString()})` : "❌ ยอดโอนไม่ตรงกับบิล"}
                             </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span style={{ color: '#64748b' }}>ธนาคารต้นทาง:</span>
                             <span style={{ fontWeight: 600 }}>{/krungthai|กรุงไทย/i.test(ocrText) ? "กรุงไทย (KTB)" : /kbank|กสิกร/i.test(ocrText) ? "กสิกรไทย (KBANK)" : /scb|ไทยพาณิชย์/i.test(ocrText) ? "ไทยพาณิชย์ (SCB)" : /bbl|กรุงเทพ/i.test(ocrText) ? "กรุงเทพ (BBL)" : "ตรวจพบข้อมูล"}</span>
                          </div>
                          
                          <details style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                            <summary style={{ cursor: 'pointer' }}>ดูข้อความดิบ (Raw Text)</summary>
                            <div style={{ marginTop: '0.5rem', maxHeight: '80px', overflowY: 'auto', whiteSpace: 'pre-wrap', background: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #f1f5f9', color: '#64748b' }}>
                               {ocrText || "ไม่แน่ใจข้อมูลดิบ"}
                            </div>
                          </details>
                        </div>
                      </div>
                    );})()}
                    {ocrStatus === "error" && (
                      <div style={{ color: 'red' }}>❌ เกิดข้อผิดพลาดในการอ่านสลิป</div>
                    )}
                    <label style={{ display: 'inline-block', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'underline' }}>
                      เปลี่ยนรูปภาพ
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalActions} style={{ marginTop: '2rem' }}>
              <button className={styles.modalBtnCancel} onClick={() => setShowPayment(false)}>ยกเลิก</button>
              <button 
                className={styles.modalBtnSuccess} 
                onClick={handleCheckout} 
                disabled={ocrStatus === "processing" || (ocrStatus === "success" && !(ocrText.includes(cartTotal().toString()) || ocrText.replace(/,/g, '').includes(cartTotal().toString())))}
                style={{ 
                  opacity: ocrStatus === "processing" ? 0.6 : (ocrStatus === "success" && !(ocrText.includes(cartTotal().toString()) || ocrText.replace(/,/g, '').includes(cartTotal().toString()))) ? 0.4 : 1, 
                  cursor: (ocrStatus === "processing" || (ocrStatus === "success" && !(ocrText.includes(cartTotal().toString()) || ocrText.replace(/,/g, '').includes(cartTotal().toString())))) ? 'not-allowed' : 'pointer'
                }}
              >
                ยืนยันและชำระเงิน
              </button>
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
