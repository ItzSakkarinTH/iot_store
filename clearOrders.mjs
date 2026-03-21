import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://HotelManager:manager011@sisaket.jjjl8q1.mongodb.net/iot_store?retryWrites=true&w=majority&appName=Sisaket";

async function clear() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove all old orders so it starts fresh 
    const delResult = await mongoose.connection.collection('orders').deleteMany({});
    console.log(`Deleted ${delResult.deletedCount} old test orders`);

  } catch (error) {
    console.error('Error clearing:', error);
  } finally {
    await mongoose.disconnect();
  }
}

clear();
