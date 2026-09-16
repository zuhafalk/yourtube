import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No video file provided",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only video files are allowed",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "videos"
    );

    const filePath = path.join(uploadDirectory, fileName);

    await writeFile(filePath, buffer);

    const videoUrl = `/uploads/videos/${fileName}`;

    return NextResponse.json({
      success: true,
      videoUrl,
      fileName,
      message: "Video uploaded successfully",
    });
  } catch (error) {
    console.error("Video upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload video",
      },
      { status: 500 }
    );
  }
}