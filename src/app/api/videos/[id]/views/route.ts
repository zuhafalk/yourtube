import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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

    const currentViews = Number(video.views ?? 0);
    const newViews = currentViews + 1;

    await db.orm.public.Video
      .where({ id })
      .update({
        views: newViews,
      });

    return NextResponse.json({
      success: true,
      views: newViews,
    });
  } catch (error) {
    console.error("View count API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update view count",
      },
      { status: 500 }
    );
  }
}