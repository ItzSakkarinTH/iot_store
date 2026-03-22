import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  quantity: Number,
  image: String,
});

const OrderSchema = new mongoose.Schema({
  userId: { type: String },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: 'Completed' },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
