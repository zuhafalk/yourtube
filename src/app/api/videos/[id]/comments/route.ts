import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { moderateComment } from "@/lib/comments/moderation";
import { checkCommentRateLimit } from "@/lib/comments/rateLimit";

function temporalToString(value: unknown): string {
  return String(value);
}

function temporalTime(value: unknown): number {
  return Date.parse(String(value));
}

function normalizeForDuplicateCheck(
  text: string
): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";

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

    const comments = await db.orm.public.Comment
      .where({ videoId: id })
      .all();

    const enrichedComments = await Promise.all(
      comments.map(async (comment: any) => {
        let user = null;

        try {
          user = await db.orm.public.User
            .where({ id: comment.userId })
            .first();
        } catch (error) {
          console.error(
            "Failed to fetch comment user:",
            error
          );
        }

        let reactions: any[] = [];

        try {
          reactions =
            await db.orm.public.CommentReaction
              .where({ commentId: comment.id })
              .all();
        } catch (error) {
          console.error(
            "Failed to fetch comment reactions:",
            error
          );
        }

        const likes = reactions.filter(
          (reaction: any) =>
            reaction.type === "LIKE"
        ).length;

        const dislikes = reactions.filter(
          (reaction: any) =>
            reaction.type === "DISLIKE"
        ).length;

        return {
          id: comment.id,
          text: comment.text,

          createdAt: temporalToString(
            comment.createdAt
          ),

          updatedAt: temporalToString(
            comment.updatedAt
          ),

          userId: comment.userId,
          parentId: comment.parentId ?? null,

          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
              }
            : null,

          likes,
          dislikes,
          replyCount: 0,
        };
      })
    );

    const replyCounts = new Map<
      string,
      number
    >();

    for (const comment of enrichedComments) {
      if (comment.parentId) {
        const currentCount =
          replyCounts.get(comment.parentId) || 0;

        replyCounts.set(
          comment.parentId,
          currentCount + 1
        );
      }
    }

    const finalComments =
      enrichedComments.map((comment) => ({
        ...comment,
        replyCount:
          replyCounts.get(comment.id) || 0,
      }));

    if (sort === "oldest") {
      finalComments.sort(
        (a, b) =>
          temporalTime(a.createdAt) -
          temporalTime(b.createdAt)
      );
    } else if (sort === "popular") {
      finalComments.sort(
        (a, b) =>
          b.likes -
          b.dislikes -
          (a.likes - a.dislikes)
      );
    } else {
      finalComments.sort(
        (a, b) =>
          temporalTime(b.createdAt) -
          temporalTime(a.createdAt)
      );
    }

    return NextResponse.json({
      success: true,
      comments: finalComments,
      total: finalComments.length,
      sort,
    });
  } catch (error) {
    console.error(
      "Comments GET API error:",
      error
    );

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
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const cookieStore = await cookies();

    const userId = cookieStore.get(
      "yourtube_user_id"
    )?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to comment",
        },
        { status: 401 }
      );
    }

    const rateLimit =
      checkCommentRateLimit(userId);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many comments. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
          retryAfterSeconds:
            rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              rateLimit.retryAfterSeconds
            ),
          },
        }
      );
    }

    const body = await request.json();

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    const parentId =
      typeof body.parentId === "string" &&
      body.parentId.trim()
        ? body.parentId.trim()
        : null;

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

    const moderationResult =
      moderateComment(text);

    if (!moderationResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message:
            moderationResult.reason ||
            "Comment was rejected by moderation",
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

    // Prevent exact duplicate comments
    const existingComments =
      await db.orm.public.Comment
        .where({
          videoId: id,
          userId,
        })
        .all();

    const normalizedNewText =
      normalizeForDuplicateCheck(text);

    const duplicateComment =
      existingComments.find(
        (comment: any) =>
          normalizeForDuplicateCheck(
            String(comment.text)
          ) === normalizedNewText
      );

    if (duplicateComment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have already posted this comment",
        },
        { status: 409 }
      );
    }

    if (parentId) {
      const parentComment =
        await db.orm.public.Comment
          .where({ id: parentId })
          .first();

      if (!parentComment) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Parent comment not found",
          },
          { status: 404 }
        );
      }

      if (parentComment.videoId !== id) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid parent comment",
          },
          { status: 400 }
        );
      }
    }

    const commentData: any = {
      text,
      userId,
      videoId: id,
    };

    if (parentId) {
      commentData.parentId = parentId;
    }

    const comment =
      await db.orm.public.Comment.create(
        commentData
      );

    return NextResponse.json(
      {
        success: true,
        comment: {
          ...comment,

          createdAt: temporalToString(
            comment.createdAt
          ),

          updatedAt: temporalToString(
            comment.updatedAt
          ),

          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },

          likes: 0,
          dislikes: 0,
          replyCount: 0,
        },

        message: parentId
          ? "Reply added successfully"
          : "Comment added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Comments POST API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add comment",
      },
      { status: 500 }
    );
  }
}