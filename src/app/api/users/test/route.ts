import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const user = await db.orm.public.User.create({
      name: "Test User",
      email: `test-${Date.now()}@yourtube.local`,
      password: "test-password",
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Test user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create test user",
      },
      { status: 500 }
    );
  }
}