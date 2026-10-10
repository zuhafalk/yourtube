import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const videos = await db.orm.public.Video.all();

    const shorts = videos.filter((video) => video.isShort === true);

    return NextResponse.json({
      success: true,
      videos: shorts,
    });
  } catch (error) {
    console.error("Shorts GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch shorts",
      },
      { status: 500 }
    );
  }
}