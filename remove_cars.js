const fs = require('fs');
const mongoose = require('mongoose');

const env = fs.readFileSync('.env', 'utf-8');
const match = env.match(/MONGODB_URI=(.*)/);

if(match) {
    mongoose.connect(match[1].trim()).then(async () => {
        const ProductSchema = new mongoose.Schema({ sku: String });
        const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
        const result = await Product.deleteMany({ sku: { $regex: '^CAR-(BLK|RED)', $options: 'i' } });
        console.log('Deleted ' + result.deletedCount + ' cars directly from MongoDB.');
        process.exit(0);
    }).catch(console.error);
} else {
    console.log('No URI found');
}
