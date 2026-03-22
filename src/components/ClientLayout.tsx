"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import layoutStyles from "@/app/Layout.module.css";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/shop" || pathname === "/cart" || pathname === "/contact";
  const isUserPage = pathname === "/history";

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const token = localStorage.getItem("token");
      
      if (!token && !isPublicPage) {
        router.push("/login");
      } else if (token) {
        const role = localStorage.getItem("role");
        const isAuthPage = pathname === "/login" || pathname === "/register";
        
        if (isAuthPage) {
          router.push(role === "admin" ? "/dashboard" : "/shop");
        } else if (!isPublicPage && !isUserPage && role !== "admin") {
          // If trying to access admin-only pages, kick to shop
          router.push("/shop");
        }
      }
    }
  }, [isMounted, pathname, router, isPublicPage, isUserPage]);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const isAuthorized = isPublicPage || isUserPage || !!token;

  if (!isMounted || (!isAuthorized && !isPublicPage && !isUserPage)) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'black' }}>Loading...</div>;
  }

  const hideSidebar = isPublicPage || isUserPage;

  return (
    <>
      <Navbar />
      <div className={hideSidebar ? "" : layoutStyles.container}>
        {!hideSidebar && <Sidebar />}
        <main className={hideSidebar ? "" : layoutStyles.mainContent}>
          {children}
        </main>
      </div>
    </>
  );
}
