"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag, Zap, Globe, Truck } from "lucide-react";
import styles from "./Landing.module.css";
import Image from "next/image";

const images = ["/allcar1.jpg", "/test_car1.jpg", "/testcar2.jpg", "/testcar3.jpg"];

export default function LandingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4500); // Wait 4.5 seconds to show frame
    return () => clearInterval(interval);
  }, []);

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
            </div>
          </motion.div>

          <motion.div 
            className={styles.heroImageContainer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className={styles.imageGlow}></div>
            <div className={styles.carouselWrapper}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50, filter: "blur(5px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -50, filter: "blur(5px)" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className={styles.carouselItemAbsolute}
                >
                  <Image 
                    src={images[currentIndex]} 
                    alt={`UltraStore Showcase ${currentIndex + 1}`} 
                    className={styles.carouselImg}
                    width={600}
                    height={400}
                    unoptimized
                    priority={currentIndex === 0}
                  />
                </motion.div>
              </AnimatePresence>
              
              <div className={styles.indicators}>
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ''}`}
                  />
                ))}
              </div>
            </div>
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
