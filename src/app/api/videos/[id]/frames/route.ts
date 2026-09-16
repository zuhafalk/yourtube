import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { imageUrl, order, duration } = body;

    if (!imageUrl || order === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "imageUrl and order are required",
        },
        { status: 400 }
      );
    }

    const frame = await db.orm.public.VideoFrame.create({
      imageUrl,
      order,
      duration: duration ?? 2,
      videoId: id,
    });

    return NextResponse.json(
      {
        success: true,
        frame,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Video frame error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create video frame",
      },
      { status: 500 }
    );
  }
}