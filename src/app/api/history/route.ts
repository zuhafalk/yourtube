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
          message: "Please login to view your history",
        },
        { status: 401 }
      );
    }

    const history =
      await db.orm.public.WatchHistory
        .where({ userId })
        .all();

    const result = [];

    for (const item of history) {
      const video = await db.orm.public.Video
        .where({ id: item.videoId })
        .first();

      if (video) {
        result.push({
          video,
          watchedAt: String(item.watchedAt),
        });
      }
    }

    result.sort((a, b) => {
      return (
        new Date(b.watchedAt).getTime() -
        new Date(a.watchedAt).getTime()
      );
    });

    return NextResponse.json({
      success: true,
      history: result,
    });
  } catch (error) {
    console.error("History GET API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch watch history",
      },
      { status: 500 }
    );
  }
}