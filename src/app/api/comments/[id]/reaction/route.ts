import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await context.params;

    const cookieStore = await cookies();
    const userId = cookieStore.get("yourtube_user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to react to comments",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const type = body.type;

    if (type !== "LIKE" && type !== "DISLIKE") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reaction type",
        },
        { status: 400 }
      );
    }

    const comment = await db.orm.public.Comment
      .where({ id: commentId })
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

    const existingReaction =
      await db.orm.public.CommentReaction
        .where({
          userId,
          commentId,
        })
        .first();

    if (existingReaction) {
      if (existingReaction.type === type) {
        await db.orm.public.CommentReaction
          .where({ id: existingReaction.id })
          .delete();

        return NextResponse.json({
          success: true,
          action: "removed",
          reaction: null,
          message: "Reaction removed",
        });
      }

      await db.orm.public.CommentReaction
        .where({ id: existingReaction.id })
        .update({
          type,
        });

      return NextResponse.json({
        success: true,
        action: "changed",
        reaction: type,
        message: "Reaction changed",
      });
    }

    await db.orm.public.CommentReaction.create({
      userId,
      commentId,
      type,
    });

    return NextResponse.json({
      success: true,
      action: "added",
      reaction: type,
      message:
        type === "LIKE"
          ? "Comment liked"
          : "Comment disliked",
    });
  } catch (error) {
    console.error(
      "Comment reaction API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update comment reaction",
      },
      { status: 500 }
    );
  }
}