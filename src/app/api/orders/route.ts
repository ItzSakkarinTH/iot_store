import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

// Get and Post orders
export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { items, total, paymentMethod } = body;
    
    // Create actual order
    const order = await Order.create({ items, total, paymentMethod });
    
    // Reduce stock for each item
    for (const item of items) {
       await Product.findByIdAndUpdate(item._id, { $inc: { stock: -item.quantity } });
    }
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
