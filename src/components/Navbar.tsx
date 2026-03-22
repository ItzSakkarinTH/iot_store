"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShoppingCart, Search, BookOpen, LayoutGrid, Sparkles, ShieldCheck,
  Phone, Menu, X, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Navbar.module.css";
import { useStore } from "@/store/useStore";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useStore();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoggedIn(!!localStorage.getItem("token"));
      setUserRole(localStorage.getItem("role"));
    }
  }, [pathname]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isMenuOpen) setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 60 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setUserRole(null);
    router.push("/login");
  };

  return (
    <nav className={`${styles.navbar} ${isVisible ? '' : styles.navHidden}`}>
      <Link href="/" className={styles.logoArea}>
        <Sparkles className={styles.logoIcon} size={24} />
        <span>UltraStore</span>
      </Link>

      <div className={styles.navLinks}>
        <Link href="/" className={`${styles.navLink} ${pathname === "/" ? styles.active : ""}`}>
          <LayoutGrid size={18} /> หน้าแรก
        </Link>
        <Link href="/shop" className={`${styles.navLink} ${pathname === "/shop" ? styles.active : ""}`}>
          <Search size={18} /> สินค้า
        </Link>
        {isLoggedIn && userRole === "admin" && (
          <Link href="/dashboard" className={`${styles.navLink} ${pathname.startsWith("/dashboard") ? styles.active : ""}`}>
            <ShieldCheck size={18} /> จัดการร้านค้า
          </Link>
        )}
        {isLoggedIn && userRole !== "admin" && (
          <Link href="/history" className={`${styles.navLink} ${pathname === "/history" ? styles.active : ""}`}>
            <BookOpen size={18} /> ประวัติการสั่งซื้อ
          </Link>
        )}
        <Link href="/how-to-use" className={`${styles.navLink} ${pathname.startsWith("/how-to-use") ? styles.active : ""}`}>
          <LayoutGrid size={18} /> วิธีการใช้งาน
        </Link>
        {isLoggedIn && userRole === "admin" && (
          <Link href="/admin-orders" className={`${styles.navLink} ${pathname === "/admin-orders" ? styles.active : ""}`}>
            <BookOpen size={18} /> รายการคำสั่งซื้อใหม่
          </Link>
        )}
        <Link href="/contact" className={`${styles.navLink} ${pathname === "/contact" ? styles.active : ""}`}>
          <Phone size={18} /> ติดต่อ
        </Link>
      </div>

      <div className={styles.userArea}>
        <Link href="/cart" className={styles.cartBtn}>
          <ShoppingCart size={22} />
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </Link>

        {isLoggedIn ? (
          <div className={styles.profileArea}>
            <div 
              className={styles.profile} 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className={styles.avatar}>{userRole === "admin" ? "A" : "U"}</div>
              <span className={styles.userName}>{userRole === "admin" ? "Admin" : "Customer"}</span>
            </div>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  className={styles.profileDropdown}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                >
                  <button onClick={handleLogout} className={styles.dropdownItem}>
                    <LogOut size={16} /> ออกจากระบบ
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link href="/login" className={styles.loginBtn}>เข้าสู่ระบบ</Link>
        )}
      </div>

      <button
        className={styles.menuToggle}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle Menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={styles.mobileOverlay}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className={styles.mobileMenuContent}>
              <div className={styles.mobileLinks}>
                <Link href="/" className={`${styles.mobileLink} ${pathname === "/" ? styles.active : ""}`}>
                  <LayoutGrid size={20} /> หน้าแรก
                </Link>
                <Link href="/shop" className={`${styles.mobileLink} ${pathname === "/shop" ? styles.active : ""}`}>
                  <Search size={20} /> สินค้า
                </Link>
                {isLoggedIn && userRole === "admin" && (
                  <Link href="/dashboard" className={`${styles.mobileLink} ${pathname.startsWith("/dashboard") ? styles.active : ""}`}>
                    <ShieldCheck size={20} /> จัดการร้านค้า
                  </Link>
                )}
                {isLoggedIn && userRole !== "admin" && (
                  <Link href="/history" className={`${styles.mobileLink} ${pathname === "/history" ? styles.active : ""}`}>
                    <BookOpen size={20} /> ประวัติการสั่งซื้อ
                  </Link>
                )}
                <Link href="/how-to-use" className={`${styles.mobileLink} ${pathname.startsWith("/how-to-use") ? styles.active : ""}`}>
                  <LayoutGrid size={20} /> วิธีการใช้งาน
                </Link>
                <Link href="/contact" className={`${styles.mobileLink} ${pathname === "/contact" ? styles.active : ""}`}>
                  <Phone size={20} /> ติดต่อ
                </Link>
              </div>

              <div className={styles.mobileBottomArea}>
                {isLoggedIn ? (
                  <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                    <LogOut size={20} /> ออกจากระบบ
                  </button>
                ) : (
                  <Link href="/login" className={styles.mobileLoginBtn}>เข้าสู่ระบบ</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
