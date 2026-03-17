import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Since this is a demo, we will check against standard mock credentials if DB is empty,
    // or authenticate against DB.
    let user = await User.findOne({ username });

    // Mock initial user for demo purposes if not existing:
    if (!user && username === "admin") {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      user = await User.create({ username: "admin", password: hashedPassword, role: "admin" });
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret_for_demo_only",
      { expiresIn: "1d" }
    );

    return NextResponse.json({ token, role: user.role, message: "Login successful" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
