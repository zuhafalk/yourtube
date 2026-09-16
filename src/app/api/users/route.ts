import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.orm.public.User.all();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Users API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}
