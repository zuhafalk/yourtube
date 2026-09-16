import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("yourtube_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to view Watch Later",
        },
        { status: 401 }
      );
    }

    const savedVideos =
      await db.orm.public.WatchLater
        .where({ userId })
        .all();

    const result = [];

    for (const item of savedVideos) {
      const video = await db.orm.public.Video
        .where({ id: item.videoId })
        .first();

      if (video) {
        result.push({
          video,
          savedAt: String(item.createdAt),
        });
      }
    }

    result.sort((a, b) => {
      return (
        new Date(b.savedAt).getTime() -
        new Date(a.savedAt).getTime()
      );
    });

    return NextResponse.json({
      success: true,
      videos: result,
    });
  } catch (error) {
    console.error(
      "Watch Later GET API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Watch Later",
      },
      { status: 500 }
    );
  }
}