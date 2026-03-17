import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
    enum: ["admin", "user", "cashier"]
  }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Force re-registration if the 'user' role is missing from the enum (happens during dev hot-reloading)
const rolePath = User.schema.path('role');
if (rolePath && 'enumValues' in rolePath) {
  const roleEnum = (rolePath as { enumValues: string[] }).enumValues;
  if (roleEnum && !roleEnum.includes('user')) {
    delete mongoose.models.User;
  }
}

export default mongoose.models.User || mongoose.model('User', UserSchema);
