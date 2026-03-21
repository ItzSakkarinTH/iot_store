"use client";

import { useState, useEffect } from "react";
import { useStore, Product } from "@/store/useStore";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import styles from "./Inventory.module.css";
import { motion } from "framer-motion";

export default function InventoryView() {
  const { products, addProduct, updateProduct, deleteProduct, fetchProducts } = useStore();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleEditClick = (product: Product) => {
    setEditingId(product._id);
    setEditForm(product);
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
    if (editingId) {
      try {
        if (editingId === "new") {
           const res = await fetch('/api/inventory', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(editForm)
           });
           const newProd = await res.json();
           addProduct(newProd);
        } else {
           const res = await fetch('/api/inventory', {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ ...editForm, _id: editingId })
           });
           const updatedProd = await res.json();
           updateProduct(editingId, updatedProd);
        }
      } catch (err) { console.error(err); }
    }
    setEditingId(null);
    setIsAdding(false);
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
             setIsAdding(true);
          }}
        >
          <Plus size={18} /> เพิ่มสินค้า
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
            {(isAdding && editingId === "new") && (
              <tr className={styles.editingRow}>
                <td className={styles.imageEditCell}>
                  <div className={styles.uploadPreview}>
                    {editForm.image ? (
                      <img src={editForm.image} className={styles.productThumb} alt="preview" />
                    ) : (
                      <div className={styles.productThumbPlaceholder}>
                        <Plus size={20} />
                      </div>
                    )}
                    <label className={styles.uploadLabel}>
                      <span>{uploading ? "กำลังอัพโหลด..." : "เปลี่ยนรูป"}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className={styles.hiddenFileInput}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </td>
                <td><input name="name" value={editForm.name} onChange={handleChange} className={styles.input} placeholder="ชื่อสินค้า" /></td>
                <td><input name="sku" value={editForm.sku} onChange={handleChange} className={styles.input} placeholder="SKU" /></td>
                <td><input name="category" value={editForm.category} onChange={handleChange} className={styles.input} placeholder="หมวดหมู่" /></td>
                <td><input type="number" name="price" value={editForm.price} onChange={handleChange} className={styles.input} /></td>
                <td><input type="number" name="stock" value={editForm.stock} onChange={handleChange} className={styles.input} /></td>
                <td className={styles.actions}>
                  <button onClick={handleSave} className={styles.saveBtn} disabled={uploading}><Save size={18}/></button>
                  <button onClick={() => { setEditingId(null); setIsAdding(false); }} className={styles.cancelBtn}><X size={18}/></button>
                </td>
              </tr>
            )}
            {products.map(product => (
              <tr key={product._id} className={editingId === product._id ? styles.editingRow : ""}>
                {editingId === product._id ? (
                  <>
                    <td className={styles.imageEditCell}>
                      <div className={styles.uploadPreview}>
                        {editForm.image ? (
                          <img src={editForm.image} className={styles.productThumb} alt="preview" />
                        ) : (
                          <div className={styles.productThumbPlaceholder}>
                            <Plus size={20} />
                          </div>
                        )}
                        <label className={styles.uploadLabel}>
                          <span>{uploading ? "กำลังอัพโหลด..." : "เปลี่ยนรูป"}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            className={styles.hiddenFileInput}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    </td>
                    <td data-label="ชื่อสินค้า"><input name="name" value={editForm.name} onChange={handleChange} className={styles.input} /></td>
                    <td data-label="SKU"><input name="sku" value={editForm.sku} onChange={handleChange} className={styles.input} /></td>
                    <td data-label="หมวดหมู่"><input name="category" value={editForm.category} onChange={handleChange} className={styles.input} /></td>
                    <td data-label="ราคา"><input type="number" name="price" value={editForm.price} onChange={handleChange} className={styles.input} /></td>
                    <td data-label="คงเหลือ"><input type="number" name="stock" value={editForm.stock} onChange={handleChange} className={styles.input} /></td>
                    <td data-label="จัดการ" className={styles.actions}>
                      <button onClick={handleSave} className={styles.saveBtn} disabled={uploading}><Save size={18}/></button>
                      <button onClick={() => setEditingId(null)} className={styles.cancelBtn}><X size={18}/></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td data-label="รูปภาพ">
                      {product.image ? (
                        <img src={product.image} className={styles.productThumb} alt={product.name} />
                      ) : (
                        <div className={styles.productThumb} style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={16} color="#ccc" />
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
                  </>
                )}
              </tr>
            ))}
            {products.length === 0 && !isAdding && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  ไม่มีข้อมูลสินค้าในคลัง
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

