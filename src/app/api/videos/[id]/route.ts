import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const video = await db.orm.public.Video
      .where({ id })
      .include("frames")
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

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error) {
    console.error("Video details API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch video details",
      },
      { status: 500 }
    );
  }
}