"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShoppingBag, Zap, Globe, Truck } from "lucide-react";
import styles from "./Landing.module.css";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.heroLayout}>
          <motion.div 
            className={styles.heroText}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={styles.badge}>
              <Zap size={14} className={styles.zapIcon} /> สุดยอดนวัตกรรมเพื่อคุณ
            </div>
            
            <h1 className={styles.title}>
              ค้นพบนวัตกรรมใหม่<br />
              ที่ <span className={styles.highlight}>UltraStore</span>
            </h1>
            
            <p className={styles.subtitle}>
              ศูนย์รวมอุปกรณ์ IoT และเทคโนโลยีล้ำสมัยเพื่อชีวิตที่สะดวกสบายและอนาคตกว่า
              ดีไซน์พรีเมียม ประสิทธิภาพสูง พร้อมบริการหลังการขายระดับสากล
            </p>

            <div className={styles.actions}>
              <Link href="/shop" className={styles.primaryBtn}>
                เลือกซื้อสินค้าเลย <ArrowRight size={18} />
              </Link>
              <Link href="/register" className={styles.secondaryBtn}>
                <Sparkles size={18} /> สมัครสมาชิกรับโค้ดลด
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className={styles.heroImageContainer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className={styles.imageGlow}></div>
            <Image 
              src="/store_hero_banner_1773747636931.png" 
              alt="UltraStore Hero" 
              className={styles.heroImg}
              width={600}
              height={400}
              priority
            />
          </motion.div>
        </div>

        <motion.div 
          className={styles.featuresGrid}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
           <div className={styles.featureCard}>
             <div className={styles.featureIcon}><ShoppingBag size={24}/></div>
             <h3>สินค้าคุณภาพพรีเมียม</h3>
             <p>คัดสรรเฉพาะแบรนด์ชั้นนำและเทคโนโลยีที่ผ่านการทดสอบมาตรฐานสูงสุด</p>
           </div>
           
           <div className={styles.featureCard}>
             <div className={styles.featureIcon}><Truck size={24}/></div>
             <h3>จัดส่งรวดเร็วทั่วไทย</h3>
             <p>ระบบ Logistics ทันสมัย มั่นใจของถึงมือคุณอย่างปลอดภัยและรวดเร็ว</p>
           </div>
           
           <div className={styles.featureCard}>
             <div className={styles.featureIcon}><Globe size={24}/></div>
             <h3>บริการ 24 ชั่วโมง</h3>
             <p>สั่งซื้อและรับคำปรึกษาจากทีมงานผู้เชี่ยวชาญได้ทุกเมื่อที่คุณต้องการ</p>
           </div>
        </motion.div>
      </main>
    </div>
  );
}
