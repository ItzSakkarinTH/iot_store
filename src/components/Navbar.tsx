"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, Search, BookOpen, LayoutGrid, Sparkles, ShieldCheck, Phone } from "lucide-react";
import styles from "./Navbar.module.css";
import { useStore } from "@/store/useStore";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useStore();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem("token");
    }
    return false;
  });
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setUserRole(localStorage.getItem("role"));
    };
    checkLogin();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setUserRole(null);
    router.push("/login");
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logoArea}>
        <Sparkles className={styles.logoIcon} size={24} />
        <span>UltraStore</span>
      </Link>

      <div className={styles.navLinks}>
        <Link href="/" className={`${styles.navLink} ${pathname === "/" ? styles.active : ""}`}>
          <LayoutGrid size={18} /> หน้าแรก
        </Link>
        <Link href="/shop" className={`${styles.navLink} ${pathname === "/shop" ? styles.active : ""}`}>
          <Search size={18} /> Discovery
        </Link>
        {isLoggedIn && userRole === "admin" && (
          <Link href="/dashboard" className={`${styles.navLink} ${pathname.startsWith("/dashboard") ? styles.active : ""}`}>
            <ShieldCheck size={18} /> จัดการร้านค้า
          </Link>
        )}
        <Link href="#" className={styles.navLink}>
          <BookOpen size={18} /> วิธีใช้งาน
        </Link>
        <Link href="#" className={styles.navLink}>
          <Sparkles size={18} /> แพลน
        </Link>
        <Link href="#" className={styles.navLink}>
          <Phone size={18} /> ติดต่อ
        </Link>
      </div>

      <div className={styles.userArea}>
        <Link href="/shop" className={styles.cartBtn}>
          <ShoppingCart size={22} />
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </Link>
        
        {isLoggedIn ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className={styles.profile}>
              <div className={styles.avatar}>{userRole === "admin" ? "A" : "U"}</div>
              <span>{userRole === "admin" ? "Admin" : "Customer"}</span>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <Link href="/login" className={styles.loginBtn}>เข้าสู่ระบบ</Link>
        )}
      </div>
    </nav>
  );
}
