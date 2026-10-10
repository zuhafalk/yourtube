
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const thumbnailFile = formData.get("thumbnail");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No video file provided." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { success: false, message: "Only video files are allowed." },
        { status: 400 }
      );
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();

    const videoBlob = await put(
      `videos/${timestamp}-${safeFileName}`,
      file,
      {
        access: "public",
        multipart: true,
        token: process.env.videos_READ_WRITE_TOKEN,
      }
    );

    let thumbnailUrl: string | null = null;

    if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
      if (thumbnailFile.type !== "image/jpeg") {
        return NextResponse.json(
          {
            success: false,
            message: "Thumbnail must be a JPEG image.",
          },
          { status: 400 }
        );
      }

      const thumbnailBlob = await put(
        `thumbnails/${timestamp}-${safeFileName}.jpg`,
        thumbnailFile,
        {
          access: "public",
          token: process.env.videos_READ_WRITE_TOKEN,
        }
      );

      thumbnailUrl = thumbnailBlob.url;
    }

    return NextResponse.json({
      success: true,
      videoUrl: videoBlob.url,
      thumbnailUrl,
      pathname: videoBlob.pathname,
      message: "Video uploaded successfully.",
    });
  } catch (error) {
    console.error("Vercel Blob upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload video.",
      },
      { status: 500 }
    );
  }
}