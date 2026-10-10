import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token = body.token;
    const password = body.password;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, message: "Reset link is invalid" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const record = await db.orm.public.PasswordResetToken
      .where({ tokenHash })
      .first();

    if (!record || Number(record.expiresAtMs) < Date.now()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    await db.orm.public.User
      .where({ id: record.userId })
      .update({ password: await hashPassword(password) });

    await db.orm.public.PasswordResetToken
      .where({ tokenHash })
      .delete();

    return NextResponse.json({
      success: true,
      message: "Your password has been reset. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to reset password" },
      { status: 500 }
    );
  }
}