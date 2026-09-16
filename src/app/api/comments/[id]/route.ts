import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function DELETE(
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
          message: "You can delete only your own comment",
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
    console.error("Delete comment API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete comment",
      },
      { status: 500 }
    );
  }
}