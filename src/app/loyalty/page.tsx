"use client";

import { useState, useEffect } from "react";
import styles from "./Loyalty.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Key, Trash2, X, Shield, User as UserIcon, AlertCircle } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function MemberManagementView() {
  const { users, fetchUsers, updateUserPassword, deleteUser } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [passwordModal, setPasswordModal] = useState<{ id: string, name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ id: string, name: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdatePassword = async () => {
    if (!passwordModal || !newPassword) return;
    setIsProcessing(true);
    const success = await updateUserPassword(passwordModal.id, newPassword);
    if (success) {
      alert("แก้ไขรหัสผ่านสำเร็จ");
      setPasswordModal(null);
      setNewPassword("");
    } else {
      alert("เกิดข้อผิดพลาดในการแก้ไขรหัสผ่าน");
    }
    setIsProcessing(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteModal) return;
    
    // Safety check: Don't delete self if possible (client side check)
    const currentUsername = typeof window !== 'undefined' ? localStorage.getItem("username") : "";
    if (deleteModal.name === currentUsername) {
      alert("ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้");
      setDeleteModal(null);
      return;
    }

    setIsProcessing(true);
    const success = await deleteUser(deleteModal.id);
    if (success) {
      setDeleteModal(null);
    } else {
      alert("เกิดข้อผิดพลาดในการลบบัญชี");
    }
    setIsProcessing(false);
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <Users size={28} className={styles.icon} />
          <h2>การจัดการสมาชิกและผู้ใช้งาน</h2>
        </div>
        
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อผู้ใช้งาน..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
           <h3>ผู้ใช้งานทั้งหมด</h3>
           <p className={styles.statVal}>{users.length}</p>
        </div>
        <div className={styles.statCard}>
           <h3>ระดับแอดมิน</h3>
           <p className={styles.statVal}>{users.filter(u => u.role === "admin").length}</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>รหัสผู้ใช้ (UID)</th>
              <th>ชื่อผู้ใช้งาน</th>
              <th>บทบาท (Role)</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  ไม่พบข้อมูลผู้ใช้งาน
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user._id}>
                  <td data-label="UID">{user._id.slice(-8).toUpperCase()}</td>
                  <td data-label="Username" className={styles.memberName}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <UserIcon size={16} color="#64748b" />
                      {user.username}
                    </div>
                  </td>
                  <td data-label="Role">
                    <span className={`${styles.tierBadge} ${user.role === "admin" ? styles.gold : styles.silver}`}>
                      {user.role === "admin" ? <Shield size={14} /> : null}
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Action">
                    <div className={styles.actionBtnGroup}>
                      <button 
                        className={styles.editBtn} 
                        onClick={() => setPasswordModal({ id: user._id, name: user.username })}
                        title="เปลี่ยนรหัสผ่าน"
                      >
                        <Key size={18} />
                      </button>
                      <button 
                        className={styles.deleteBtn} 
                        onClick={() => setDeleteModal({ id: user._id, name: user.username })}
                        title="ลบบัญชี"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {passwordModal && (
          <div className={styles.modalOverlay} onClick={() => setPasswordModal(null)}>
            <motion.div 
              className={styles.modalContent} 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <h3>เปลี่ยนรหัสผ่าน</h3>
                <button onClick={() => setPasswordModal(null)}><X size={20} /></button>
              </div>
              <div className={styles.modalBody}>
                <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  กำลังเปลี่ยนรหัสผ่านสำหรับ: <strong>{passwordModal.name}</strong>
                </div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "600" }}>รหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  className={styles.searchInput} 
                  style={{ 
                    width: "100%", 
                    border: "1px solid var(--glass-border)", 
                    padding: '0.8rem',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.02)'
                  }}
                  placeholder="ป้อนรหัสผ่านใหม่..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setPasswordModal(null)}>ยกเลิก</button>
                <button 
                  className={styles.confirmBtn} 
                  onClick={handleUpdatePassword}
                  disabled={isProcessing || !newPassword}
                >
                  {isProcessing ? "กำลังบันทึก..." : "อัปเดตรหัสผ่าน"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <div className={styles.modalOverlay} onClick={() => setDeleteModal(null)}>
            <motion.div 
              className={styles.modalContent} 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ maxWidth: "400px" }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ background: "#fef2f2", color: "#ef4444", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", boxShadow: '0 10px 15px rgba(239, 68, 68, 0.2)' }}>
                  <AlertCircle size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>ยืนยันการลบบัญชี?</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: '2rem', lineHeight: 1.5 }}>
                  คุณกำลังจะลบบัญชีของ <strong>{deleteModal.name}</strong><br/>
                  การดำเนินการนี้จะลบข้อมูลผู้ใช้ออกถาวร และไม่สามารถย้อนกลับได้
                </p>
              </div>
              <div className={styles.modalFooter} style={{ display: "flex", gap: "1rem" }}>
                <button 
                  className={styles.cancelBtn}
                  style={{ flex: 1 }}
                  onClick={() => setDeleteModal(null)}
                >
                  ยกเลิก
                </button>
                <button 
                  className={styles.confirmBtn}
                  style={{ flex: 1, background: '#ef4444', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
                  onClick={handleDeleteUser}
                  disabled={isProcessing}
                >
                  {isProcessing ? "กำลังลบ..." : "ลบบัญชี"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
