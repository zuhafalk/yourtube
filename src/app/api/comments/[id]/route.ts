import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const EDIT_TIME_LIMIT_MS = 15 * 60 * 1000;

function getTime(value: unknown): number {
  return Date.parse(String(value));
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const cookieStore = await cookies();
    const userId =
      cookieStore.get("yourtube_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment cannot be empty",
        },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Comment cannot exceed 1000 characters",
        },
        { status: 400 }
      );
    }

    const comment = await db.orm.public.Comment
      .where({ id })
      .first();

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment not found",
        },
        { status: 404 }
      );
    }

    if (comment.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can edit only your own comment",
        },
        { status: 403 }
      );
    }

    const createdAt = getTime(comment.createdAt);
    const now = Date.now();

    if (
      Number.isNaN(createdAt) ||
      now - createdAt > EDIT_TIME_LIMIT_MS
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The 15-minute edit period has expired",
        },
        { status: 403 }
      );
    }

    await db.orm.public.Comment
      .where({ id })
      .update({
        text,
      });

    const updatedComment =
      await db.orm.public.Comment
        .where({ id })
        .first();

    return NextResponse.json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment
        ? {
            ...updatedComment,
            createdAt: String(
              updatedComment.createdAt
            ),
            updatedAt: String(
              updatedComment.updatedAt
            ),
          }
        : null,
    });
  } catch (error) {
    console.error(
      "Edit comment API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to edit comment",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const cookieStore = await cookies();
    const userId =
      cookieStore.get("yourtube_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login",
        },
        { status: 401 }
      );
    }

    const comment = await db.orm.public.Comment
      .where({ id })
      .first();

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment not found",
        },
        { status: 404 }
      );
    }

    if (comment.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can delete only your own comment",
        },
        { status: 403 }
      );
    }

    await db.orm.public.Comment
      .where({ id })
      .delete();

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete comment API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete comment",
      },
      { status: 500 }
    );
  }
}