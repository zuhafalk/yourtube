import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

export async function DELETE(
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

    // Delete the physical video file if it is a local upload
    if (video.videoUrl?.startsWith("/uploads/videos/")) {
      const filePath = path.join(
        process.cwd(),
        "public",
        video.videoUrl
      );

      try {
        await unlink(filePath);
      } catch (fileError) {
        console.warn("Video file could not be deleted:", fileError);
      }
    }

    // Delete the video record from the database
    await db.orm.public.Video
      .where({ id })
      .delete();

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Delete video API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete video",
      },
      { status: 500 }
    );
  }
}