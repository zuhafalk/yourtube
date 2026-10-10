import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const user = await db.orm.public.User
      .where({ email })
      .first();

    const result = user
      ? await verifyPassword(password, user.password)
      : { valid: false, needsUpgrade: false };

    if (!user || !result.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    if (result.needsUpgrade) {
      try {
        await db.orm.public.User
          .where({ id: user.id })
          .update({ password: await hashPassword(password) });
      } catch (upgradeError) {
        console.error("Password upgrade failed:", upgradeError);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });

    response.cookies.set("yourtube_user_id", user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to login",
      },
      { status: 500 }
    );
  }
}