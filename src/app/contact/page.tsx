"use client";

import { motion } from "framer-motion";
import { MessageCircle, Facebook, MapPin, ExternalLink } from "lucide-react";
import styles from "./Contact.module.css";

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <motion.h1 
        className={styles.title}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        ช่องทาง<span className={styles.highlight}>ติดต่อเรา</span>
      </motion.h1>

      <motion.div 
        className={styles.contactGrid}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* LINE Contact */}
        <div className={styles.contactCard}>
          <div className={styles.iconWrapper}>
            <MessageCircle size={36} />
          </div>
          <h2 className={styles.cardTitle}>LINE Official</h2>
          <p className={styles.cardDesc}>
            สอบถามข้อมูลสินค้าและบริการได้รวดเร็วทันใจ
          </p>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)'}}>
            @sisaketshop
          </div>
          <a 
            href="https://line.me/R/ti/p/@sisaketshop" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.contactLink}
          >
            เพิ่มเพื่อน <ExternalLink size={16} />
          </a>
        </div>

        {/* Facebook Contact */}
        <div className={styles.contactCard}>
          <div className={styles.iconWrapper}>
            <Facebook size={36} />
          </div>
          <h2 className={styles.cardTitle}>Facebook Page</h2>
          <p className={styles.cardDesc}>
            ติดตามข่าวสาร และโปรโมชั่นใหม่ๆ ได้ที่เพจ
          </p>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)'}}>
            facebook.com/sisaketshop
          </div>
          <a 
            href="https://facebook.com/sisaketshop" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.contactLink}
          >
            ไปที่เพจ <ExternalLink size={16} />
          </a>
        </div>

        {/* Location / Address */}
        <div className={styles.contactCard}>
          <div className={styles.iconWrapper}>
            <MapPin size={36} />
          </div>
          <h2 className={styles.cardTitle}>ที่อยู่ร้าน</h2>
          <p className={styles.cardDesc}>
            ชุมชนหนองยางข้างวัด ต.หนองครอ อ.เมือง จ.ศรีสะเกษ 33000<br/>
            (บ้านที่มีตู้กดน้ำหน้าบ้าน)
          </p>
          <a 
            href="https://maps.google.com/?q=ชุมชนหนองยางข้างวัด อำเภอเมือง ศรีสะเกษ"
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.contactLink}
          >
            ดูแผนที่ <ExternalLink size={16} />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
