import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  sku: { type: String, unique: true },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
