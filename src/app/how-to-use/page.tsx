"use client";

import { motion } from "framer-motion";
import { UserPlus, Search, ShoppingCart, BookOpen } from "lucide-react";
import styles from "./HowToUse.module.css";
import Link from "next/link";

export default function HowToUsePage() {
  const steps = [
    {
      num: 1,
      id: "step-1",
      title: "สมัครสมาชิกและเข้าสู่ระบบ",
      desc: "เริ่มต้นการใช้งาน UltraStore ง่ายๆ เพียงแค่คลิก 'เข้าสู่ระบบ / สมัครสมาชิก' ที่มุมขวาบนของจอ กรอกข้อมูลของคุณให้ครบถ้วนเพื่อสร้างบัญชีใหม่ จากนั้นให้ล็อกอินเข้าสู่ระบบเพื่อใช้งานฟังก์ชันได้อย่างครบถ้วน",
      tip: "เมื่อมีบัญชี คุณสามารถติดตามประวัติคำสั่งซื้อ และรับสิทธิพิเศษสำหรับลูกค้า (Customer) ได้ 100%!",
      icon: <UserPlus className={styles.stepIcon} size={28} />
    },
    {
      num: 2,
      id: "step-2",
      title: "ค้นหาและเลือกซื้อสินค้า",
      desc: "เมื่อเข้าสู่ระบบแล้ว ให้ไปที่เมนู 'สินค้า' ด้านบน ในหน้านั้นคุณจะได้พบกับแคตตาล็อกสินค้านวัตกรรม รถยนต์ และอุปกรณ์สุดล้ำ คุณสามารถทัชหน้าจอ หรือคลิกดูรายละเอียดของสินค้าที่คุณถูกใจได้ทันที",
      tip: "หากต้องการซื้อสินค้า ให้คลิกโชว์หน้าต่างของสินค้า แล้วกดปุ่มรถเข็นสีแดง 🛒 ที่อยู่ข้าง ราคา ได้เลยครับ!",
      icon: <Search className={styles.stepIcon} size={28} />
    },
    {
      num: 3,
      id: "step-3",
      title: "ตรวจสอบตะกร้าสินค้าและชำระเงิน",
      desc: "คลิกไอคอนตะกร้าขวาบนของหน้าจอเพื่อไปยังหน้า 'ตะกร้าสินค้า' ในหน้านี้คุณสามารถเช็คยอดเงินรวม ปรับเพิ่ม/ลดจำนวน หรือลบของที่ไม่ต้องการออกได้ เมื่อตรวจทานเรียบร้อยแล้ว กดยืนยันชำระเงินเพื่อส่งออเดอร์ให้เรา",
      tip: "ก่อนกดยืนยัน อย่าลืมตรวจสอบจำนวนสินค้าในตะกร้า เพื่อป้องกันความผิดพลาดนะครับ",
      icon: <ShoppingCart className={styles.stepIcon} size={28} />
    },
    {
      num: 4,
      id: "step-4",
      title: "เช็คประวัติและติดตามสถานะ",
      desc: "หลังจากที่คุณสั่งซื้อเสร็จ ระบบจะพาคุณมาที่หน้า 'ประวัติการสั่งซื้อ' ซึ่งในหน้านี้คุณสามารถตรวจสอบได้เลยว่าออเดอร์ที่คุณเคยประทับรอยไว้มีอะไรบ้าง ทุกคำสั่งซื้อจะถูกแยกระหว่าง 'สำเร็จแล้ว' และอื่นๆ อย่างชัดเจน",
      tip: "โปรดจำไว้ว่า 'คุณต้องล็อกอินก่อนเสมอ' ปุ่มประวัติการสั่งซื้อบนเมนูด้านบนถึงจะมองเห็นและคลิกใช้งานได้ครับ 🔒",
      icon: <BookOpen className={styles.stepIcon} size={28} />
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          คู่มือวิธีการใช้งาน
        </motion.h1>
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          เรียนรู้วิธีการช้อปปิ้งและใช้งานฟังก์ชันต่างๆ บนเว็บไซต์ UltraStore ของเราแบบง่ายๆ อธิบายละเอียดทีละสเตป เพื่อให้คุณช้อปปิ้งออนไลน์สนุก ไร้อุปสรรค 
        </motion.p>
      </header>

      <main className={styles.content}>
        {steps.map((step, index) => (
          <motion.div 
            key={step.id} 
            className={styles.stepCard}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className={styles.stepNumber}>{step.num}</div>
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>
                {step.icon}
                {step.title}
              </h2>
              <p className={styles.stepDesc}>{step.desc}</p>
              {step.tip && (
                <div className={styles.tips}>
                  <b>💡 Tip:</b> {step.tip}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </main>

      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <Link 
          href="/shop" 
          style={{ 
            background: "var(--primary)", 
            color: "white", 
            padding: "1rem 2rem", 
            borderRadius: "30px", 
            fontWeight: "bold",
            display: "inline-block",
            textDecoration: "none",
            boxShadow: "0 5px 15px var(--primary-glow)"
          }}
        >
          ลองไปเลือกซื้อสินค้ากันเลย! →
        </Link>
      </div>
    </div>
  );
}
