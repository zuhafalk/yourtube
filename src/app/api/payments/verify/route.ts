import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

const TEST_USER_ID = "66b1db50-5905-484f-ac8b-02df22540ff5";

const PLAN_DURATION_DAYS: Record<string, number> = {
  BRONZE: 30,
  SILVER: 30,
  GOLD: 30,
};

const PLAN_PRICES: Record<string, number> = {
  BRONZE: 99,
  SILVER: 199,
  GOLD: 299,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !plan
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing payment verification details",
        },
        { status: 400 }
      );
    }

    const normalizedPlan = String(plan).toUpperCase();

    if (!PLAN_PRICES[normalizedPlan]) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid subscription plan",
        },
        { status: 400 }
      );
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpaySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay secret is not configured",
        },
        { status: 500 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const generatedBuffer = Buffer.from(generatedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);

    if (
      generatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(generatedBuffer, receivedBuffer)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
        },
        { status: 400 }
      );
    }

    const existingPlan = await db.orm.public.UserPlan
      .where({
        userId: TEST_USER_ID,
      })
      .first();

    const startDate = (globalThis as any).Temporal.Now.instant();

    const expiryDate = startDate.add({
     hours: PLAN_DURATION_DAYS[normalizedPlan] * 24,
    });

    const amount = PLAN_PRICES[normalizedPlan];

    let userPlan;

    if (existingPlan) {
      userPlan = await db.orm.public.UserPlan
        .where({
          id: existingPlan.id,
        })
        .update({
          plan: normalizedPlan,
          status: "ACTIVE",
          startDate,
          expiryDate,
          renewalDate: expiryDate,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount,
          currency: "INR",
        });
    } else {
      userPlan = await db.orm.public.UserPlan.create({
        userId: TEST_USER_ID,
        plan: normalizedPlan,
        status: "ACTIVE",
        startDate,
        expiryDate,
        renewalDate: expiryDate,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount,
        currency: "INR",
      });
    }

    return NextResponse.json({
      success: true,
      message: `${normalizedPlan} subscription activated successfully`,
      plan: userPlan,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify payment",
      },
      { status: 500 }
    );
  }
}