import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Setting from '@/models/Setting';
import jwt from "jsonwebtoken";

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_for_demo_only") as { userId: string, role: string };
    if (decoded.role !== "admin") return null;
    return decoded;
  } catch (err) {
    return null;
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await Setting.find({});
    // Map to a more useful object { key: value }
    const res: Record<string, string> = {};
    settings.forEach(s => { res[s.key] = s.value; });
    return NextResponse.json(res);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectToDatabase();
    const { key, value } = await req.json();

    if (!key) return NextResponse.json({ error: "Key is required" }, { status: 400 });

    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );

    return NextResponse.json(setting);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
  }
}
