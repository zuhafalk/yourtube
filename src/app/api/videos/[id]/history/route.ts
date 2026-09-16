import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

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
          message: "Please login to save watch history",
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

    const existingHistory =
      await db.orm.public.WatchHistory
        .where({
          userId,
          videoId: id,
        })
        .first();

    if (existingHistory) {
      await db.orm.public.WatchHistory
        .where({ id: existingHistory.id })
        .delete();
    }

    await db.orm.public.WatchHistory.create({
      userId,
      videoId: id,
    });

    return NextResponse.json({
      success: true,
      message: "Watch history saved",
    });
  } catch (error) {
    console.error("Watch history API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save watch history",
      },
      { status: 500 }
    );
  }
}