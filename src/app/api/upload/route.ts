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

    const oidcToken = process.env.VERCEL_OIDC_TOKEN;
    const storeId =
      process.env.BLOB_STORE_ID ||
      process.env.videos_STORE_ID;

    if (!oidcToken) {
      throw new Error(
        "VERCEL_OIDC_TOKEN is not available."
      );
    }

    if (!storeId) {
      throw new Error(
        "Blob store ID is not available."
      );
    }

    console.log("Starting Vercel Blob upload...");
    console.log("File:", file.name);
    console.log("Size:", file.size);
    console.log("Type:", file.type);
    console.log("OIDC available:", Boolean(oidcToken));
    console.log("Store ID available:", Boolean(storeId));

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
        oidcToken,
        storeId,
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