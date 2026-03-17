"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import styles from "../Auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("สมัครสมาชิกสำเร็จ กำลังพาไปยังหน้าเข้าสู่ระบบ...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "การสมัครสมาชิกล้มเหลว");
    } finally {
      if (!success) setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.authCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.logoArea}>
           <div className={styles.iconWrapper}><UserPlus size={24} /></div>
           <h1 className={styles.title}>สมัครสมาชิก</h1>
           <p className={styles.subtitle}>สร้างบัญชีร้านค้าใหม่เพื่อเริ่มใช้ UltraPOS</p>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>{success}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>ชื่อผู้ใช้ (Username)</label>
            <input 
              type="text" 
              className={styles.input} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ตั้งชื่อผู้ใช้ของร้าน"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>รหัสผ่าน (Password)</label>
            <input 
              type="password" 
              className={styles.input} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ตั้งรหัสผ่าน"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>ยืนยันรหัสผ่าน</label>
            <input 
              type="password" 
              className={styles.input} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading || !!success}>
            {loading ? "กำลังดำเนินการ..." : "สมัครใช้งานฟรี"}
          </button>
        </form>

        <p className={styles.switchText}>
          มีบัญชีอยู่แล้ว? <Link href="/login" className={styles.switchLink}>เข้าสู่ระบบ</Link>
        </p>
      </motion.div>
    </div>
  );
}
