import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Member from '@/models/Member';

export async function GET() {
  try {
    await connectToDatabase();
    const members = await Member.find({}).sort({ points: -1 });
    return NextResponse.json(members);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const member = await Member.create(body);
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
