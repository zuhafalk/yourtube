import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: channelId } = await context.params;

    const cookieStore = await cookies();
    const subscriberId =
      cookieStore.get("yourtube_user_id")?.value;

    if (!subscriberId) {
      return NextResponse.json({
        success: true,
        subscribed: false,
        subscriberCount: 0,
      });
    }

    const channel = await db.orm.public.User
      .where({ id: channelId })
      .first();

    if (!channel) {
      return NextResponse.json(
        {
          success: false,
          message: "Channel not found",
        },
        { status: 404 }
      );
    }

    const existingSubscription =
      await db.orm.public.Subscription
        .where({
          subscriberId,
          channelId,
        })
        .first();

    const subscriptions =
      await db.orm.public.Subscription
        .where({ channelId })
        .all();

    return NextResponse.json({
      success: true,
      subscribed: Boolean(existingSubscription),
      subscriberCount: subscriptions.length,
    });
  } catch (error) {
    console.error(
      "Subscription status API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to check subscription",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: channelId } = await context.params;

    const cookieStore = await cookies();
    const subscriberId =
      cookieStore.get("yourtube_user_id")?.value;

    if (!subscriberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to subscribe",
        },
        { status: 401 }
      );
    }

    if (subscriberId === channelId) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot subscribe to your own channel",
        },
        { status: 400 }
      );
    }

    const channel = await db.orm.public.User
      .where({ id: channelId })
      .first();

    if (!channel) {
      return NextResponse.json(
        {
          success: false,
          message: "Channel not found",
        },
        { status: 404 }
      );
    }

    const existingSubscription =
      await db.orm.public.Subscription
        .where({
          subscriberId,
          channelId,
        })
        .first();

    let subscribed: boolean;

    if (existingSubscription) {
      await db.orm.public.Subscription
        .where({ id: existingSubscription.id })
        .delete();

      subscribed = false;
    } else {
      await db.orm.public.Subscription.create({
        subscriberId,
        channelId,
      });

      subscribed = true;
    }

    const subscriptions =
      await db.orm.public.Subscription
        .where({ channelId })
        .all();

    return NextResponse.json({
      success: true,
      subscribed,
      subscriberCount: subscriptions.length,
      message: subscribed
        ? "Subscribed successfully"
        : "Unsubscribed successfully",
    });
  } catch (error) {
    console.error(
      "Subscription API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update subscription",
      },
      { status: 500 }
    );
  }
}