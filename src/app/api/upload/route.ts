import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No video file provided.",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only video files are allowed.",
        },
        { status: 400 }
      );
    }

    console.log("Starting Vercel Blob upload...");
    console.log("File:", file.name);
    console.log("Size:", file.size);
    console.log("Type:", file.type);

    const safeFileName = file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    );

    const blob = await put(
      `videos/${Date.now()}-${safeFileName}`,
      file,
      {
        access: "public",
        multipart: true,
      }
    );

    console.log("Vercel Blob upload successful.");
    console.log("Blob URL:", blob.url);

    return NextResponse.json({
      success: true,
      videoUrl: blob.url,
      pathname: blob.pathname,
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