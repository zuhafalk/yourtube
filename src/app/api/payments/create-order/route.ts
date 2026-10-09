
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";

const PLAN_PRICES: Record<string, number> = {
  BRONZE: 99,
  SILVER: 199,
  GOLD: 299,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const plan = String(body?.plan || "").toUpperCase();

    if (!Object.prototype.hasOwnProperty.call(PLAN_PRICES, plan)) {
      return NextResponse.json(
        { success: false, message: "Invalid subscription plan" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      console.error("Razorpay configuration error", {
        keyIdPresent: Boolean(keyId),
        keySecretPresent: Boolean(keySecret),
      });

      return NextResponse.json(
        {
          success: false,
          message: "Razorpay keys are missing in the production environment.",
        },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amount = PLAN_PRICES[plan] * 100;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `yourtube_${plan.toLowerCase()}_${Date.now()}`,
      notes: { plan },
    });

    if (!order?.id) {
      console.error("Razorpay returned no order ID");

      return NextResponse.json(
        { success: false, message: "Razorpay did not return an order ID." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        plan,
      },
      keyId,
    });
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number;
      message?: string;
      code?: string;
      error?: {
        description?: string;
        code?: string;
        reason?: string;
      };
    };

    const statusCode =
      typeof err.statusCode === "number" ? err.statusCode : 500;

    const description =
      err.error?.description ||
      err.error?.reason ||
      err.message ||
      "Unknown order creation error";

    console.error("Razorpay order creation failed", {
      statusCode,
      code: err.error?.code || err.code || "UNKNOWN",
      description,
    });

    return NextResponse.json(
      {
        success: false,
        message: description,
      },
      { status: statusCode >= 400 && statusCode < 600 ? statusCode : 500 }
    );
  }
}
