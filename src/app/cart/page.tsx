"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { 
  ShoppingCart, Trash2, Plus, Minus, 
  CheckSquare, Loader2, UploadCloud, 
  Smartphone, User, QrCode
} from "lucide-react";
import styles from "./Cart.module.css";
import { useRouter } from "next/navigation";
import Tesseract from "tesseract.js";

export default function CartPage() {
  const { 
    cart, settings, fetchSettings, removeFromCart, updateCartQuantity, clearCart, addOrder
  } = useStore();
  const router = useRouter();

  const [coupon, setCoupon] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Buyer Information
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  
  // OCR and Slip State
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [ocrText, setOcrText] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchSettings();
  }, [fetchSettings]);

  if (!isClient) return null;

  const cartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
      performOCR(file);
    }
  };

  const performOCR = async (file: File) => {
    setOcrStatus("processing");
    try {
      const result = await Tesseract.recognize(file, 'tha+eng', {
        logger: m => console.log(m)
      });
      setOcrText(result.data.text);
      setOcrStatus("success");
    } catch (err) {
      console.error(err);
      setOcrStatus("error");
    }
  };

  const handleCheckout = async () => {
    if (!buyerName || !buyerPhone || !buyerAddress) {
       alert("กรุณากรอกข้อมูลผู้ซื้อและที่อยู่จัดส่งให้ครบถ้วน");
       return;
    }
    if (!slipFile) {
      alert("กรุณาอัปโหลดสลิปเพื่อยืนยันการชำระเงิน");
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderData = {
        items: cart,
        total: cartTotal(),
        buyerName,
        buyerPhone,
        buyerAddress,
        paymentMethod: "PromptPay",
        orderDate: new Date().toISOString(),
        slipUrl: slipPreview // Normally you'd upload to cloud storage first
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        clearCart();
        setShowPayment(false);
        setShowSuccess(true);
      } else {
        alert("เกิดข้อผิดพลาดในการสั่งซื้อ");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.titleArea}>
        <ShoppingCart size={32} />
        <h1>ตะกร้าสินค้า</h1>
      </header>

      {cart.length === 0 ? (
        <div className={styles.emptyState}>
          <p>ไม่มีสินค้าในตะกร้า</p>
          <button className={styles.checkoutBtn} onClick={() => router.push("/")} style={{ width: 'auto', marginTop: '1rem' }}>
            เลือกซื้อสินค้า
          </button>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.leftCol}>
            <div className={styles.productList}>
              {cart.map((item) => (
                <div key={item._id} className={styles.productItem}>
                  <div className={styles.imageBox}>
                    {item.image ? <img src={item.image} alt={item.name} /> : <ShoppingCart size={40} />}
                  </div>
                  <div className={styles.itemDetails}>
                    <h2 className={styles.itemName}>{item.name}</h2>
                    <p className={styles.itemPrice}>฿{item.price.toLocaleString()}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.qtyWrapper}>
                      <button className={styles.qtyBtn} onClick={() => updateCartQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1}>
                         <Minus size={14} />
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button className={styles.qtyBtn} onClick={() => updateCartQuantity(item._id, item.quantity + 1)}>
                         <Plus size={14} />
                      </button>
                    </div>
                    <button className={styles.deleteBtn} onClick={() => removeFromCart(item._id)}>
                      <Trash2 size={18} /> ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>สรุปคำสั่งซื้อ</h2>
              <div className={styles.summaryArea}>
                <div className={styles.summaryRow}>
                  <span>ยอดรวมสินค้า</span>
                  <span className={styles.value}>฿{cartTotal().toLocaleString()}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>ค่าจัดส่ง</span>
                  <span className={styles.value}>ฟรี</span>
                </div>
                <hr className={styles.divider} />
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>ทั้งหมด</span>
                  <span className={styles.totalValue}>฿{cartTotal().toLocaleString()}</span>
                </div>
                <button className={styles.checkoutBtn} onClick={() => setShowPayment(true)}>สั่งซื้อสินค้า</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal with OCR */}
      {showPayment && (
        <div className={styles.modalOverlay} onClick={() => setShowPayment(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '1000px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>ยืนยันการชำระเงิน</h2>
            <p className={styles.modalDesc}>
              ยอดชำระเงินทั้งหมด <b>฿{cartTotal().toLocaleString()}</b>
            </p>

            <div className={styles.modalBodyGrid}>
              <div className={styles.modalLeftCol}>
                {/* Buyer Info Section */}
                <div className={styles.buyerInfoSection}>
                   <h3 className={styles.ocrStepTitle}>1. ข้อมูลผู้ซื้อและที่อยู่สำหรับจัดส่ง</h3>
                   <div className={styles.inputGroup}>
                     <label>ชื่อ-นามสกุล</label>
                     <input 
                       type="text" 
                       placeholder="กรอกชื่อ-นามสกุล..." 
                       value={buyerName}
                       onChange={(e) => setBuyerName(e.target.value)}
                     />
                   </div>
                   <div className={styles.inputGroup}>
                     <label>เบอร์โทรศัพท์</label>
                     <input 
                       type="text" 
                       placeholder="กรอกเบอร์โทรศัพท์..." 
                       value={buyerPhone}
                       onChange={(e) => setBuyerPhone(e.target.value)}
                     />
                   </div>
                   <div className={styles.inputGroup}>
                     <label>ที่อยู่สำหรับจัดส่ง</label>
                     <textarea 
                       placeholder="กรอกที่อยู่ บ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์..." 
                       rows={3}
                       value={buyerAddress}
                       onChange={(e) => setBuyerAddress(e.target.value)}
                     />
                   </div>
                </div>
              </div>
              
              <div className={styles.modalRightCol}>
                {/* PromptPay Info Section */}
                {(settings.promptpay || settings.promptpay_qr) && (
                  <div className={styles.paymentInfoCard}>
                    <div className={styles.paymentInfoTitle}>
                       <QrCode size={18} />
                       <span>2. ช่องทางการโอนเงิน (PromptPay)</span>
                    </div>
                    
                    <div className={styles.paymentInfoContent}>
                      {settings.promptpay_qr && (
                        <div className={styles.checkoutQrBox}>
                          <img src={settings.promptpay_qr} alt="PromptPay QR" />
                        </div>
                      )}
                      
                      <div className={styles.checkoutDetailsBox}>
                        <div className={styles.detailItem}>
                           <Smartphone size={16} />
                           <span className={styles.detailLabel}>พร้อมเพย์:</span>
                           <span className={styles.detailValue}>{settings.promptpay}</span>
                        </div>
                        {settings.promptpay_name && (
                          <div className={styles.detailItem}>
                             <User size={16} />
                             <span className={styles.detailLabel}>ชื่อบัญชี:</span>
                             <span className={styles.detailValue}>{settings.promptpay_name}</span>
                          </div>
                        )}
                        <div className={styles.scanNotice}>* สแกน QR หรือโอนเข้าเบอร์ด้านบน</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* OCR Section - Full Width at Bottom */}
            <div className={styles.ocrSection} style={{ marginTop: '1.5rem' }}>
              <h3 className={styles.ocrStepTitle}>3. อัปโหลดสลิปโอนเงิน (AI ตรวจสอบ)</h3>
              
              {!slipPreview ? (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '2px dashed var(--primary)', borderRadius: '12px', cursor: 'pointer', color: 'var(--primary)', transition: '0.2s' }}>
                  <UploadCloud size={32} style={{ marginBottom: '0.5rem' }} />
                  <span>คลิกเพื่ออัปโหลดสลิป</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
              ) : (
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <img src={slipPreview} alt="Slip" style={{ width: '120px', height: 'auto', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    {ocrStatus === "processing" && (
                      <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <Loader2 className={styles.spinnerIcon} /> AI กำลังอ่านค่าจากสลิป...
                      </div>
                    )}
                    {ocrStatus === "success" && (() => {
                      const isAmountMatched = ocrText.includes(cartTotal().toString()) || ocrText.replace(/,/g, '').includes(cartTotal().toString());
                      return (
                      <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          ✅ สแกนสลิปสำเร็จ
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span style={{ color: 'var(--text-muted)' }}>สถานะยอดเงิน:</span>
                             <span style={{ fontWeight: 600, color: isAmountMatched ? 'var(--success)' : 'var(--danger)' }}>
                               {isAmountMatched ? `ตรงกัน (฿${cartTotal().toLocaleString()})` : "❌ ยอดโอนไม่ตรงกับบิล"}
                             </span>
                          </div>
                          <details style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <summary style={{ cursor: 'pointer' }}>ดูข้อความที่ AI อ่านได้</summary>
                            <div style={{ marginTop: '0.5rem', maxHeight: '80px', overflowY: 'auto', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.1)', padding: '0.5rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                               {ocrText || "ไม่พบข้อความ"}
                            </div>
                          </details>
                        </div>
                      </div>
                    );})()}
                    {ocrStatus === "error" && (
                      <div style={{ color: 'var(--danger)' }}>❌ เกิดข้อผิดพลาดในการอ่านสลิป</div>
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
                disabled={isCheckingOut || ocrStatus === "processing" || (ocrStatus === "success" && !(ocrText.includes(cartTotal().toString()) || ocrText.replace(/,/g, '').includes(cartTotal().toString())))}
                style={{ 
                  opacity: (isCheckingOut || ocrStatus === "processing") ? 0.6 : (ocrStatus === "success" && !(ocrText.includes(cartTotal().toString()) || ocrText.replace(/,/g, '').includes(cartTotal().toString()))) ? 0.4 : 1, 
                  cursor: (isCheckingOut || ocrStatus === "processing" || (ocrStatus === "success" && !(ocrText.includes(cartTotal().toString()) || ocrText.replace(/,/g, '').includes(cartTotal().toString())))) ? 'not-allowed' : 'pointer'
                }}
              >
                {isCheckingOut ? <Loader2 className={styles.spinnerIcon} /> : "ยืนยันและชำระเงิน"}
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
    </div>
  );
}
