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
  buyerName: { type: String },
  buyerPhone: { type: String },
  buyerAddress: { type: String },
  cancelReason: { type: String },
  cancelDetails: { type: String },
}, { timestamps: true });

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.model('Order', OrderSchema);
