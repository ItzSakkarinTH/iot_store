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

  const handleEditClick = (product: Product) => {
    setEditingId(product._id);
    setEditForm(product);
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
    if (window.confirm("Are you sure?")) {
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
        <h2>Inventory Management</h2>
        <button 
          className={styles.addBtn}
          onClick={() => {
             setEditingId("new");
             setEditForm({ name: "", price: 0, category: "", stock: 0, sku: "" });
             setIsAdding(true);
          }}
        >
          <Plus size={18} /> Add Product
        </button>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && editingId === "new" && (
              <tr className={styles.editingRow}>
                <td><input name="name" value={editForm.name} onChange={handleChange} className={styles.input} placeholder="Product Name" /></td>
                <td><input name="sku" value={editForm.sku} onChange={handleChange} className={styles.input} placeholder="SKU" /></td>
                <td><input name="category" value={editForm.category} onChange={handleChange} className={styles.input} placeholder="Category" /></td>
                <td><input type="number" name="price" value={editForm.price} onChange={handleChange} className={styles.input} /></td>
                <td><input type="number" name="stock" value={editForm.stock} onChange={handleChange} className={styles.input} /></td>
                <td className={styles.actions}>
                  <button onClick={handleSave} className={styles.saveBtn}><Save size={18}/></button>
                  <button onClick={() => { setEditingId(null); setIsAdding(false); }} className={styles.cancelBtn}><X size={18}/></button>
                </td>
              </tr>
            )}
            {products.map(product => (
              <tr key={product._id} className={editingId === product._id ? styles.editingRow : ""}>
                {editingId === product._id ? (
                  <>
                    <td data-label="Name"><input name="name" value={editForm.name} onChange={handleChange} className={styles.input} /></td>
                    <td data-label="SKU"><input name="sku" value={editForm.sku} onChange={handleChange} className={styles.input} /></td>
                    <td data-label="Category"><input name="category" value={editForm.category} onChange={handleChange} className={styles.input} /></td>
                    <td data-label="Price"><input type="number" name="price" value={editForm.price} onChange={handleChange} className={styles.input} /></td>
                    <td data-label="Stock"><input type="number" name="stock" value={editForm.stock} onChange={handleChange} className={styles.input} /></td>
                    <td data-label="Actions" className={styles.actions}>
                      <button onClick={handleSave} className={styles.saveBtn}><Save size={18}/></button>
                      <button onClick={() => setEditingId(null)} className={styles.cancelBtn}><X size={18}/></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td data-label="Name">{product.name}</td>
                    <td data-label="SKU">{product.sku}</td>
                    <td data-label="Category">{product.category}</td>
                    <td data-label="Price" className={styles.priceCol}>฿{product.price}</td>
                    <td data-label="Stock">
                      <span className={`${styles.stockBadge} ${product.stock < 10 ? styles.lowStock : ""}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td data-label="Actions" className={styles.actions}>
                      <button onClick={() => handleEditClick(product)} className={styles.editBtn}><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(product._id)} className={styles.delBtn}><Trash2 size={16}/></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {products.length === 0 && !isAdding && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  No products in inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
