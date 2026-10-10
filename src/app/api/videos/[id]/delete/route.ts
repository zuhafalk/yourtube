import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

export async function DELETE(
_request: Request,
context: { params: Promise<{ id: string }> }
) {
try {
const { id } = await context.params;

// Require a logged-in user.
const cookieStore = await cookies();
const userId = cookieStore.get("yourtube_user_id")?.value;

if (!userId) {
  return NextResponse.json(
    { success: false, message: "Please login" },
    { status: 401 }
  );
}

// Find the requested video.
const video = await db.orm.public.Video
  .where({ id })
  .first();

if (!video) {
  return NextResponse.json(
    { success: false, message: "Video not found" },
    { status: 404 }
  );
}

// Only the uploader can delete this video.
if (video.uploaderId !== userId) {
  return NextResponse.json(
    {
      success: false,
      message: "You can delete only your own videos",
    },
    { status: 403 }
  );
}

// Delete the database record first.
await db.orm.public.Video
  .where({ id })
  .delete();

// Then remove a local upload, if applicable.
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

return NextResponse.json({
  success: true,
  message: "Video deleted successfully",
});


} catch (error) {
console.error("Delete video API error:", error);


return NextResponse.json(
  { success: false, message: "Failed to delete video" },
  { status: 500 }
);


}
}