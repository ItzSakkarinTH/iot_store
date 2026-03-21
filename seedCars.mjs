import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://HotelManager:manager011@sisaket.jjjl8q1.mongodb.net/iot_store?retryWrites=true&w=majority&appName=Sisaket";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, unique: true },
  image: { type: String },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove the product that has 0 stock (the one from picture 2)
    const delResult = await Product.deleteMany({ stock: 0 });
    console.log(`Deleted ${delResult.deletedCount} out of stock items`);

    const cars = [
      {
        name: "Black Car Premium",
        price: 850000,
        category: "รถยนต์",
        stock: 5,
        sku: "CAR-BLK-001",
        image: "/blackcar.jpg"
      },
      {
        name: "Red Sports Car Model A",
        price: 1200000,
        category: "รถยนต์",
        stock: 3,
        sku: "CAR-RED-001",
        image: "/redcar1.jpg"
      },
      {
        name: "Red Sports Car Model B",
        price: 1350000,
        category: "รถยนต์",
        stock: 2,
        sku: "CAR-RED-002",
        image: "/redcar2.jpg"
      }
    ];

    for (const car of cars) {
      await Product.findOneAndUpdate({ sku: car.sku }, car, { upsert: true });
    }
    
    console.log('Successfully seeded 3 cars');

  } catch (error) {
    console.error('Error seeding:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
