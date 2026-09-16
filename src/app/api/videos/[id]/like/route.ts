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
        liked: false,
        likeCount: 0,
      });
    }

    const existingLike = await db.orm.public.Like
      .where({
        userId,
        videoId: id,
      })
      .first();

    const video = await db.orm.public.Video
      .where({ id })
      .include("likes", (likes) => likes.count())
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
      liked: Boolean(existingLike),
      likeCount: Number(video.likes ?? 0),
    });
  } catch (error) {
    console.error("Like status API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to check like status",
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
          message: "Please login to like videos",
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

    const existingLike = await db.orm.public.Like
      .where({
        userId,
        videoId: id,
      })
      .first();

    let liked: boolean;

    if (existingLike) {
      await db.orm.public.Like
        .where({ id: existingLike.id })
        .delete();

      liked = false;
    } else {
      await db.orm.public.Like.create({
        userId,
        videoId: id,
      });

      liked = true;
    }

    const updatedVideo = await db.orm.public.Video
      .where({ id })
      .include("likes", (likes) => likes.count())
      .first();

    return NextResponse.json({
      success: true,
      liked,
      likeCount: Number(updatedVideo?.likes ?? 0),
    });
  } catch (error) {
    console.error("Like API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update like",
      },
      { status: 500 }
    );
  }
}