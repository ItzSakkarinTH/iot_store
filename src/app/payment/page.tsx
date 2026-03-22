"use client";

import { useState, useEffect } from "react";
import styles from "./Payment.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, Save, Smartphone, CheckCircle2, 
  ShieldCheck, Info, Upload, Trash2, QrCode as QrIcon, User 
} from "lucide-react";
import { useStore } from "@/store/useStore";

export default function PaymentManagementView() {
  const { settings, fetchSettings, updateSetting } = useStore();
  const [promptPay, setPromptPay] = useState("");
  const [promptPayName, setPromptPayName] = useState("");
  const [promptPayQR, setPromptPayQR] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings.promptpay) setPromptPay(settings.promptpay);
    if (settings.promptpay_name) setPromptPayName(settings.promptpay_name);
    if (settings.promptpay_qr) setPromptPayQR(settings.promptpay_qr);
  }, [settings.promptpay, settings.promptpay_name, settings.promptpay_qr]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("ขนาดไฟล์ใหญ่เกินไป (กรุณาใช้ไฟล์ไม่เกิน 1MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPromptPayQR(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        updateSetting("promptpay", promptPay),
        updateSetting("promptpay_name", promptPayName),
        updateSetting("promptpay_qr", promptPayQR)
      ]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert("ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    promptPay !== (settings.promptpay || "") || 
    promptPayName !== (settings.promptpay_name || "") || 
    promptPayQR !== (settings.promptpay_qr || "");

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <CreditCard size={28} className={styles.icon} />
          <h2>จัดการวิธีการชำระเงิน</h2>
        </div>
        <button 
          className={styles.saveAllBtn} 
          onClick={handleSaveAll}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? "กำลังบันทึก..." : <><Save size={18} /> บันทึกการตั้งค่าทั้งหมด</>}
        </button>
      </header>

      <div className={styles.contentGrid}>
        {/* Section 1: Phone Number */}
        <div className={styles.card}>
          <div className={styles.cardInfo}>
            <div className={styles.iconCircle}>
               <Smartphone size={32} />
            </div>
            <div className={styles.cardText}>
              <h3>เบอร์โทรศัพท์พร้อมเพย์</h3>
              <p>ระบุเบอร์โทรศัพท์สำหรับรับโอนเงิน</p>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>เบอร์โทรศัพท์ / เลขประจำตัวผู้เสียภาษี</label>
            <div className={styles.inputWrapper}>
              <Smartphone size={20} className={styles.inputIcon} />
              <input 
                type="text" 
                placeholder="08X-XXX-XXXX" 
                value={promptPay}
                onChange={(e) => setPromptPay(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>ชื่อเจ้าของบัญชี</label>
            <div className={styles.inputWrapper}>
              <User size={20} className={styles.inputIcon} />
              <input 
                type="text" 
                placeholder="ชื่อ-นามสกุล / ชื่อร้าน" 
                value={promptPayName}
                onChange={(e) => setPromptPayName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: QR Code */}
        <div className={styles.card}>
          <div className={styles.cardInfo}>
            <div className={`${styles.iconCircle} ${styles.blueIcon}`}>
               <QrIcon size={32} />
            </div>
            <div className={styles.cardText}>
              <h3>PromptPay QR Code</h3>
              <p>อัปโหลดรูปภาพ QR เพื่อให้ลูกค้าสแกนได้สะดวก</p>
            </div>
          </div>

          <div className={styles.qrUploadContainer}>
            {promptPayQR ? (
              <div className={styles.qrPreviewContainer}>
                <img src={promptPayQR} alt="QR Preview" className={styles.qrPreview} />
                <button 
                  className={styles.removeQrBtn} 
                  onClick={() => setPromptPayQR("")}
                >
                  <Trash2 size={16} /> ลบรูปภาพ
                </button>
              </div>
            ) : (
              <div className={styles.uploadArea} onClick={() => document.getElementById("qrInput")?.click()}>
                <Upload size={32} className={styles.uploadIcon} />
                <div className={styles.uploadText}>
                  <strong>คลิกเพื่ออัปโหลด</strong>
                  <span>รองรับ PNG, JPG (ไม่เกิน 1MB)</span>
                </div>
                <input 
                  id="qrInput" 
                  type="file" 
                  accept="image/*" 
                  style={{ display: "none" }} 
                  onChange={handleFileChange} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className={styles.successToast}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <CheckCircle2 size={24} /> 
            <span>บันทึกข้อมูลการชำระเงินเรียบร้อยแล้ว!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.footerInfo}>
        <div className={styles.infoBox}>
           <ShieldCheck size={20} className={styles.infoIcon} />
           <p>ข้อมูลเหล่านี้จะถูกนำไปแสดงในหน้ารายการสินค้าและขั้นตอนการสั่งซื้อ เพื่ออำนวยความสะดวกในการชำระเงินของลูกค้า</p>
        </div>
        <div className={`${styles.infoBox} ${styles.warningBox}`}>
           <Info size={20} className={styles.warningIcon} />
           <p>คำแนะนำ: ตรวจสอบความถูกต้องของข้อมูลทุกครั้งก่อนบันทึก เนื่องจากการระบุเบอร์โทรศัพท์ผิดพลาดอาจส่งผลต่อการได้รับรับเงินของท่าน</p>
        </div>
      </div>
    </motion.div>
  );
}
