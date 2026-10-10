import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const GENERIC_MESSAGE =
  "If an account exists for that email, a reset link has been sent.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await db.orm.public.User.where({ email }).first();

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      await db.orm.public.PasswordResetToken.create({
        userId: user.id,
        tokenHash,
        expiresAtMs: String(Date.now() + 60 * 60 * 1000),
      });

      const baseUrl =
        process.env.APP_URL || new URL(request.url).origin;

      const resetLink = `${baseUrl}/reset-password?token=${token}`;

      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (!smtpUser || !smtpPass) {
        console.error(
          "SMTP_USER / SMTP_PASS are not set, so no email was sent."
        );

        if (process.env.NODE_ENV !== "production") {
          console.log("DEV ONLY - password reset link:", resetLink);
        }
      } else {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: smtpUser, pass: smtpPass },
          });

          await transporter.sendMail({
            from: `"Your Tube" <${smtpUser}>`,
            to: user.email,
            subject: "Reset your Your Tube password",
            text: `Hi ${user.name || "there"},\n\nUse this link to set a new password. It expires in 1 hour:\n${resetLink}\n\nIf you didn't ask for this, you can ignore this email.`,
            html: `<p>Hi ${user.name || "there"},</p><p>Use the link below to set a new password. It expires in 1 hour.</p><p><a href="${resetLink}">Reset your password</a></p><p>If you didn't ask for this, you can ignore this email.</p>`,
          });
        } catch (mailError) {
          console.error("Failed to send reset email:", mailError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: GENERIC_MESSAGE,
    });
  } catch (error) {
    console.error("Forgot password API error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}