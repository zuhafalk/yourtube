import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const cookieStore = await cookies();
    const userId = cookieStore.get("yourtube_user_id")?.value;

    if (!userId) {
      return NextResponse.json({
        success: true,
        saved: false,
      });
    }

    const existing = await db.orm.public.WatchLater
      .where({
        userId,
        videoId: id,
      })
      .first();

    return NextResponse.json({
      success: true,
      saved: Boolean(existing),
    });
  } catch (error) {
    console.error("Watch Later status API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to check Watch Later status",
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
    const { id } = await context.params;

    const cookieStore = await cookies();
    const userId = cookieStore.get("yourtube_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to use Watch Later",
        },
        { status: 401 }
      );
    }

    const video = await db.orm.public.Video
      .where({ id })
      .first();

    if (!video) {
      return NextResponse.json(
        {
          success: false,
          message: "Video not found",
        },
        { status: 404 }
      );
    }

    const existing = await db.orm.public.WatchLater
      .where({
        userId,
        videoId: id,
      })
      .first();

    if (existing) {
      await db.orm.public.WatchLater
        .where({ id: existing.id })
        .delete();

      return NextResponse.json({
        success: true,
        saved: false,
        message: "Removed from Watch Later",
      });
    }

    await db.orm.public.WatchLater.create({
      userId,
      videoId: id,
    });

    return NextResponse.json({
      success: true,
      saved: true,
      message: "Added to Watch Later",
    });
  } catch (error) {
    console.error("Watch Later API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update Watch Later",
      },
      { status: 500 }
    );
  }
}