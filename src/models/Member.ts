import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  points: { type: Number, default: 0 },
  tier: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: 'Bronze' },
}, { timestamps: true });

export default mongoose.models.Member || mongoose.model('Member', MemberSchema);
