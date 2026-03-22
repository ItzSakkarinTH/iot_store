import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import jwt from 'jsonwebtoken';

function getAuthContext(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_for_demo_only") as any;
      return { userId: decoded.userId, role: decoded.role };
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Get and Post orders
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const auth = getAuthContext(req);
    let query = {};
    
    // If not admin and not authenticated, return empty or unauthorized
    if (!auth || auth.role !== 'admin') {
      if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      query = { userId: auth.userId }; // Normal users only see their own orders
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
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
    
    const auth = getAuthContext(req);
    const userId = auth ? auth.userId : 'guest';
    
    // Create actual order
    const order = await Order.create({ items, total, paymentMethod, userId });
    
    // Reduce stock for each item
    for (const item of items) {
       const idToUse = item.productId || item._id;
       if (idToUse) {
         await Product.findByIdAndUpdate(idToUse, { $inc: { stock: -item.quantity } });
       }
    }
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { orderId, cancelReason, cancelDetails } = body;
    
    const auth = getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Check permission
    if (order.userId !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Cancel the order
    order.status = 'Cancelled';
    order.cancelReason = cancelReason;
    order.cancelDetails = cancelDetails;
    await order.save();
    
    // Attempt to restore stock for cancelled items
    for (const item of order.items) {
       const idToUse = item.productId || item._id;
       if (idToUse) {
         await Product.findByIdAndUpdate(idToUse, { $inc: { stock: item.quantity } });
       }
    }
    
    return NextResponse.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
