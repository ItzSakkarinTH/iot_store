"use client";

import { useState, useEffect } from "react";
import { useStore, Order, CartItem } from "@/store/useStore";
import { 
  Search, Plus, Minus, Trash2, CreditCard, ScanLine, 
  CheckCircle, ArrowRight, ShoppingCart
} from "lucide-react";
import styles from "./POS.module.css";
import { motion, AnimatePresence } from "framer-motion";
import Tesseract from 'tesseract.js';

export default function POSView() {
  const { products, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, addOrder, fetchProducts } = useStore();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [isConfirmScreenOpen, setConfirmScreenOpen] = useState(false);
  const [isReceiptOpen, setReceiptOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [scannedText, setScannedText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);



  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const total = cartTotal();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutModalOpen(true);
  };

  const handleConfirmPay = () => {
    setCheckoutModalOpen(false);
    setConfirmScreenOpen(true);
  };

  const finalizeOrder = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total, paymentMethod })
      });
      const newOrder = await res.json();
      if (!res.ok) throw new Error(newOrder.error);
      
      addOrder(newOrder); // Update store
      setRecentOrder(newOrder);
      clearCart();
      setConfirmScreenOpen(false);
      setReceiptOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  };

  const runOCR = async (file: File) => {
    setIsScanning(true);
    try {
      const result = await Tesseract.recognize(file, 'tha+eng', {
        logger: m => console.log(m)
      });
      setScannedText(result.data.text);
    } catch (err) {
      console.error(err);
      setScannedText("Error scanning text");
    }
    setIsScanning(false);
  };

  return (
    <div className={styles.container}>
      {/* Product Selection */}
      <div className={styles.productSection}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className={styles.productGrid}>
          {filteredProducts.map(product => (
            <div key={product._id} className={styles.productCard} onClick={() => addToCart(product)}>
              {product.image ? (
                <img src={product.image} className={styles.productImage} alt={product.name} />
              ) : (
                <div className={styles.productImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={32} color="#ccc" />
                </div>
              )}
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productStock}>Stock: {product.stock}</p>
                <p className={styles.productPrice}>฿{product.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className={styles.cartSection}>
        <h2 className={styles.cartTitle}>Current Order</h2>
        <div className={styles.cartItems}>
          <AnimatePresence>
            {cart.map(item => (
              <motion.div 
                key={item._id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className={styles.cartItem}
              >
                <div className={styles.itemDetails}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemPrice}>฿{item.price * item.quantity}</p>
                </div>
                <div className={styles.qtyControls}>
                  <button onClick={() => updateCartQuantity(item._id, item.quantity - 1)} className={styles.qtyBtn}><Minus size={14}/></button>
                  <span className={styles.qtyVal}>{item.quantity}</span>
                  <button onClick={() => addToCart(item)} className={styles.qtyBtn}><Plus size={14}/></button>
                  <button onClick={() => removeFromCart(item._id)} className={styles.delBtn}><Trash2 size={16}/></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && <p className={styles.emptyCart}>Cart is empty</p>}
        </div>
        
        <div className={styles.cartFooter}>
          <div className={styles.totalRow}>
            <span>Total</span>
            <span className={styles.totalAmount}>฿{total.toLocaleString()}</span>
          </div>
          <button 
            className={styles.checkoutBtn} 
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Checkout Modal (Step 1) */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div className={styles.modalOverlay}>
            <motion.div 
              className={styles.modalCard}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <h2>Select Payment Method</h2>
              <div className={styles.paymentOptions}>
                {["Cash", "Credit Card", "PromptPay"].map(method => (
                  <button 
                    key={method}
                    className={`${styles.payBtn} ${paymentMethod === method ? styles.payBtnActive : ""}`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <CreditCard size={20} />
                    {method}
                  </button>
                ))}
              </div>
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => setCheckoutModalOpen(false)}>Cancel</button>
                <button className={styles.confirmBtn} onClick={handleConfirmPay}>
                  Next <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Screen (Step 2) */}
      <AnimatePresence>
        {isConfirmScreenOpen && (
          <div className={styles.modalOverlay}>
            <motion.div 
              className={styles.modalCard}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2>Order Confirmation</h2>
              <p>Total Items: {cart.reduce((s, i) => s + i.quantity, 0)}</p>
              <h3 className={styles.totalAmount2}>Total: ฿{total.toLocaleString()}</h3>
              <p className={styles.paymentMethod}>Payment: {paymentMethod}</p>
              
              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={() => {
                  setConfirmScreenOpen(false);
                  setCheckoutModalOpen(true);
                }}>Back</button>
                <button className={styles.successBtn} onClick={finalizeOrder}>
                  <CheckCircle size={18} /> Confirm Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Screen */}
      <AnimatePresence>
        {isReceiptOpen && recentOrder && (
          <div className={styles.modalOverlay}>
             <motion.div 
              className={styles.receiptCard}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className={styles.receiptTitle}>EcoPOS Receipt</h2>
              <p>Order ID: {recentOrder._id}</p>
              <p>Date: {recentOrder.createdAt.toLocaleString()}</p>
              <div className={styles.receiptItems}>
                {recentOrder.items.map((i: CartItem) => (
                  <div key={i._id} className={styles.receiptItem}>
                    <span>{i.name} x{i.quantity}</span>
                    <span>฿{i.price * i.quantity}</span>
                  </div>
                ))}
              </div>
              <h3 className={styles.receiptTotal}>Total: ฿{recentOrder.total.toLocaleString()}</h3>
              <p>Method: {recentOrder.paymentMethod}</p>

              {/* Tesseract OCR Section */}
              <div className={styles.ocrSection}>
                <h4><ScanLine size={16} /> Scan Receipt (OCR Verification)</h4>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) runOCR(file);
                  }}
                  className={styles.fileInput}
                />
                {isScanning ? <p>Scanning...</p> : (
                  <textarea readOnly value={scannedText} className={styles.ocrOutput} placeholder="OCR Text will appear here..."></textarea>
                )}
              </div>

              <button className={styles.closeBtn} onClick={() => setReceiptOpen(false)}>Close Receipt</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
