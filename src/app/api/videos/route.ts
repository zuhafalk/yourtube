import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const type = new URL(request.url).searchParams.get("type");

    const videos = await db.orm.public.Video.all();

    const result =
      type === "short"
        ? videos.filter((video) => video.isShort === true)
        : type === "video"
        ? videos.filter((video) => !video.isShort)
        : videos;

    return NextResponse.json({
      success: true,
      videos: result,
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
      isShort,
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
      isShort: isShort === true,
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