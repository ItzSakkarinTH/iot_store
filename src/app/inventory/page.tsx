"use client";

import { useState, useEffect } from "react";
import { useStore, Product } from "@/store/useStore";
import styles from "./Inventory.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Save, X, Package, Tag, Hash, BadgePlus, Coins } from "lucide-react";

export default function InventoryView() {
  const { products, addProduct, updateProduct, deleteProduct, fetchProducts } = useStore();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({
    name: "", price: 0, category: "", stock: 0, sku: "", image: ""
  });
  const [uploading, setUploading] = useState(false);

  const handleEditClick = (product: Product) => {
    setEditingId(product._id);
    setEditForm(product);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });
      const newBlob = await response.json();
      setEditForm(prev => ({ ...prev, image: newBlob.url }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('อัพโหลดรูปภาพไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const finalForm = { ...editForm };
    if (!finalForm.sku || finalForm.sku.trim() === "") {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      finalForm.sku = `PROD-${randomSuffix}`;
    }

    if (editingId) {
      try {
        if (editingId === "new") {
           const res = await fetch('/api/inventory', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(finalForm)
           });
           const newProd = await res.json();
           addProduct(newProd);
        } else {
           const res = await fetch('/api/inventory', {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ ...finalForm, _id: editingId })
           });
           const updatedProd = await res.json();
           updateProduct(editingId, updatedProd);
        }
      } catch (err) { console.error(err); }
    }
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?")) {
      try {
        await fetch(`/api/inventory?id=${id}`, { method: 'DELETE' });
        deleteProduct(id);
      } catch (err) { console.error(err); }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ 
      ...prev, 
      [name]: name === "price" || name === "stock" ? Number(value) : value 
    }));
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className={styles.header}>
        <h2>จัดการข้อมูลสินค้า</h2>
        <button 
          className={styles.addBtn}
          onClick={() => {
             setEditingId("new");
             setEditForm({ name: "", price: 0, category: "", stock: 0, sku: "", image: "" });
             setIsModalOpen(true);
          }}
        >
          <Plus size={18} /> เพิ่มสินค้าใหม่
        </button>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>รูปภาพ</th>
              <th>ชื่อสินค้า</th>
              <th>SKU</th>
              <th>หมวดหมู่</th>
              <th>ราคา</th>
              <th>คงเหลือ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td data-label="รูปภาพ">
                  {product.image ? (
                    <img src={product.image} className={styles.productThumb} alt={product.name} />
                  ) : (
                    <div className={styles.productThumb} style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={16} color="#ccc" />
                    </div>
                  )}
                </td>
                <td data-label="ชื่อสินค้า">{product.name}</td>
                <td data-label="SKU">{product.sku}</td>
                <td data-label="หมวดหมู่">{product.category}</td>
                <td data-label="ราคา" className={styles.priceCol}>฿{product.price.toLocaleString()}</td>
                <td data-label="คงเหลือ">
                  <span className={`${styles.stockBadge} ${product.stock < 10 ? styles.lowStock : ""}`}>
                    {product.stock}
                  </span>
                </td>
                <td data-label="จัดการ" className={styles.actions}>
                  <button onClick={() => handleEditClick(product)} className={styles.editBtn}><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(product._id)} className={styles.delBtn}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                  ไม่มีข้อมูลสินค้าในคลัง
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <motion.div 
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className={styles.modalHeader}>
                <h3>{editingId === "new" ? "เพิ่มสินค้าใหม่" : "แก้ไขข้อมูลสินค้า"}</h3>
                <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}><X /></button>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.imageUploadArea}>
                   <div className={styles.modalUploadPreview}>
                    {editForm.image ? (
                      <img src={editForm.image} className={styles.modalProductThumb} alt="preview" />
                    ) : (
                      <div className={styles.modalProductThumbPlaceholder}>
                        <Plus size={40} />
                        <p>อัพโหลดรูปภาพ</p>
                      </div>
                    )}
                    <label className={styles.modalUploadLabel}>
                      {uploading ? "กำลังอัพโหลด..." : "เลือกรูปภาพ"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className={styles.hiddenFileInput}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                <div className={styles.formFields}>
                  <div className={styles.fieldGroup}>
                    <label><Package size={16}/> ชื่อสินค้า</label>
                    <input name="name" value={editForm.name} onChange={handleChange} placeholder="ระบุชื่อสินค้า" />
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label><Hash size={16}/> SKU / รหัสสินค้า</label>
                      <input name="sku" value={editForm.sku} onChange={handleChange} placeholder="(สแกนหรือสุ่มอัตโนมัติ)" />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label><Tag size={16}/> หมวดหมู่</label>
                      <input name="category" value={editForm.category} onChange={handleChange} placeholder="ระบุหมวดหมู่" />
                    </div>
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label><Coins size={16}/> ราคา (บาท)</label>
                      <input type="number" name="price" value={editForm.price} onChange={handleChange} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label><BadgePlus size={16}/> จำนวนในสต็อก</label>
                      <input type="number" name="stock" value={editForm.stock} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  className={styles.modalSaveBtn} 
                  onClick={handleSave}
                  disabled={uploading}
                >
                  <Save size={18}/> {editingId === "new" ? "บันทึกสินค้า" : "บันทึกการแก้ไข"}
                </button>
                <button className={styles.modalCancelBtn} onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

