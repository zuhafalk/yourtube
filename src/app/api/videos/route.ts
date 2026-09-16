import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const videos = await db.orm.public.Video.all();

    return NextResponse.json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error("Videos GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch videos",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      thumbnail,
      videoUrl,
      category,
      uploaderId,
    } = body;

    if (!title || !uploaderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and uploaderId are required",
        },
        { status: 400 }
      );
    }

    const video = await db.orm.public.Video.create({
      title,
      description: description ?? null,
      thumbnail: thumbnail ?? null,
       videoUrl: videoUrl ?? null,
      category: category ?? null,
      uploaderId,
    });

    return NextResponse.json(
      {
        success: true,
        video,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Videos POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create video",
      },
      { status: 500 }
    );
  }
}