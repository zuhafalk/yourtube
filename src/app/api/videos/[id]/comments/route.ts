import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const comments = await db.orm.public.Comment
      .where({ videoId: id })
      .all();

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Comments GET API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch comments",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
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
          message: "Please login to comment",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment cannot be empty",
        },
        { status: 400 }
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

    const user = await db.orm.public.User
      .where({ id: userId })
      .first();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 401 }
      );
    }

    const comment = await db.orm.public.Comment.create({
      text,
      userId,
      videoId: id,
    });

    return NextResponse.json({
      success: true,
      comment,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Comments POST API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add comment",
      },
      { status: 500 }
    );
  }
}