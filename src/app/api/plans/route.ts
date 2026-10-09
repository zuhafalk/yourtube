import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const TEST_USER_ID = "66b1db50-5905-484f-ac8b-02df22540ff5";

export async function GET() {
  try {
    let userPlan = await db.orm.public.UserPlan
      .where({ userId: TEST_USER_ID })
      .first();

    if (!userPlan) {
      userPlan = await db.orm.public.UserPlan.create({
        userId: TEST_USER_ID,
        plan: "FREE",
        status: "ACTIVE",
      });
    }

    return NextResponse.json({
      success: true,
      plan: userPlan,
    });
  } catch (error) {
    console.error("Plans API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user plan",
      },
      { status: 500 }
    );
  }
}