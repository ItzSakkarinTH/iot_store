import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const dbUrl = process.env.MONGODB_URI;

async function checkOrders() {
  await mongoose.connect(dbUrl);
  console.log("Connected");
  const Order = mongoose.connection.collection('orders');
  const allOrders = await Order.find({}).toArray();
  console.log("All orders:");
  console.log(JSON.stringify(allOrders, null, 2));
  process.exit();
}
checkOrders();
