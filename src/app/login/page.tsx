"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import styles from "../Auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // On successful login, save token and redirect
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      
      if (data.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/shop");
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
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
           <div className={styles.iconWrapper}><LogIn size={24} /></div>
           <h1 className={styles.title}>เข้าสู่ระบบ UltraPOS</h1>
           <p className={styles.subtitle}>กรุณากรอกข้อมูลของคุณเพื่อเข้าสู่แดชบอร์ด</p>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>ชื่อผู้ใช้ (Username)</label>
            <input 
              type="text" 
              className={styles.input} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
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
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className={styles.switchText}>
          ยังไม่มีบัญชีผู้ใช้? <Link href="/register" className={styles.switchLink}>สมัครสมาชิกที่นี่</Link>
        </p>
      </motion.div>
    </div>
  );
}
