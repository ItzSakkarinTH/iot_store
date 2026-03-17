"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  LayoutDashboard, 
  PackageSearch,
  History,
  Users,
  LogOut,
  Sparkles
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { motion } from "framer-motion";

const navGroups = [
  {
    title: "ทั่วไป",
    items: [
      { href: "/", label: "หน้าหลัก UltraStore", Icon: Sparkles },
      { href: "/dashboard", label: "แผงควบคุม Dashboard", Icon: LayoutDashboard },
      { href: "/pos", label: "ระบบขายหน้าร้าน POS", Icon: ShoppingBag },
      { href: "/inventory", label: "จัดการข้อมูลสินค้า", Icon: PackageSearch },
      { href: "/history", label: "ประวัติการทำรายการ", Icon: History },
      { href: "/loyalty", label: "ระบบสมาชิก CRM", Icon: Users },
    ],
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={styles.desktopSidebar}>
        {navGroups.map((group, i) => (
          <div key={i} className={styles.navGroup}>
            <h4 className={styles.groupTitle}>{group.title}</h4>
            <nav className={styles.nav}>
              {group.items.map(({ href, label, Icon }) => {
                const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} className={`${styles.navItem} ${isActive ? styles.active : ""}`}>
                    <Icon size={20} className={isActive ? styles.activeIcon : styles.icon} />
                    <span className={styles.label}>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
        
        <div className={styles.bottomNav}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileNav}>
        {navGroups[0].items.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`${styles.mobileNavItem} ${isActive ? styles.mobileActive : ""}`}>
              {isActive && (
                <motion.div
                  layoutId="mobileNavActive"
                  className={styles.activeIndicator}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={20} className={styles.mobileIcon} />
              <span className={styles.mobileLabel}>{label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
