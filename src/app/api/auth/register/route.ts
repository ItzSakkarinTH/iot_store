import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import * as bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { username, password, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || "user"; 
    
    await User.create({ username, password: hashedPassword, role: userRole });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
