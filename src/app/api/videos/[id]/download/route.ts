import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const TEST_USER_ID = "66b1db50-5905-484f-ac8b-02df22540ff5";

const DAILY_LIMITS: Record<string, number> = {
  FREE: 1,
  BRONZE: 5,
  SILVER: 10,
  GOLD: 20,
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await context.params;

    const video = await db.orm.public.Video
      .where({ id: videoId })
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

    let userPlan = await db.orm.public.UserPlan
      .where({ userId: TEST_USER_ID })
      .first();

    if (!userPlan) {
      userPlan = await db.orm.public.UserPlan.create({
        userId: TEST_USER_ID,
        plan: "FREE",
        status: "ACTIVE",
      });
    }

    const plan = String(userPlan.plan || "FREE").toUpperCase();
    const dailyLimit = DAILY_LIMITS[plan] ?? 1;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const downloads = await db.orm.public.Download
      .where({
        userId: TEST_USER_ID,
      })
      .all();

    const todayDownloads = downloads.filter((download) => {
      const downloadedAt = new Date(String(download.downloadedAt));
      return downloadedAt >= startOfDay;
    });

    const remaining = Math.max(
      dailyLimit - todayDownloads.length,
      0
    );

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnail,
        videoUrl: video.videoUrl,
      },
      plan: {
        name: plan,
        dailyLimit,
        usedToday: todayDownloads.length,
        remaining,
      },
      canDownload: remaining > 0,
    });
  } catch (error) {
    console.error("Download GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to check download availability",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await context.params;

    const video = await db.orm.public.Video
      .where({ id: videoId })
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

    if (!video.videoUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "This video does not have a downloadable file",
        },
        { status: 400 }
      );
    }

    let userPlan = await db.orm.public.UserPlan
      .where({ userId: TEST_USER_ID })
      .first();

    if (!userPlan) {
      userPlan = await db.orm.public.UserPlan.create({
        userId: TEST_USER_ID,
        plan: "FREE",
        status: "ACTIVE",
      });
    }

    const plan = String(userPlan.plan || "FREE").toUpperCase();
    const dailyLimit = DAILY_LIMITS[plan] ?? 1;

    if (userPlan.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Your subscription is not active",
        },
        { status: 403 }
      );
    }

    if (
      userPlan.expiryDate &&
      new Date(String(userPlan.expiryDate)).getTime() < Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Your subscription has expired",
        },
        { status: 403 }
      );
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const downloads = await db.orm.public.Download
      .where({
        userId: TEST_USER_ID,
      })
      .all();

    const todayDownloads = downloads.filter((download) => {
      const downloadedAt = new Date(String(download.downloadedAt));
      return downloadedAt >= startOfDay;
    });

    if (todayDownloads.length >= dailyLimit) {
      return NextResponse.json(
        {
          success: false,
          message: `Daily download limit reached for ${plan} plan`,
          plan,
          dailyLimit,
          usedToday: todayDownloads.length,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    const duplicateDownload = todayDownloads.find(
      (download) => download.videoId === videoId
    );

    if (duplicateDownload) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already downloaded this video today",
          download: duplicateDownload,
        },
        { status: 409 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ||
      realIp ||
      "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    let browser = "Unknown";
    let deviceType = "Desktop";

    if (/Edg\//i.test(userAgent)) {
      browser = "Microsoft Edge";
    } else if (/Chrome\//i.test(userAgent)) {
      browser = "Google Chrome";
    } else if (/Firefox\//i.test(userAgent)) {
      browser = "Mozilla Firefox";
    } else if (/Safari\//i.test(userAgent)) {
      browser = "Safari";
    }

    if (/Mobi|Android/i.test(userAgent)) {
      deviceType = "Mobile";
    } else if (/Tablet|iPad/i.test(userAgent)) {
      deviceType = "Tablet";
    }

    const fileName = `${video.title
      .replace(/[^a-zA-Z0-9\s-_]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 80)}.mp4`;

    const download = await db.orm.public.Download.create({
      userId: TEST_USER_ID,
      videoId,
      status: "COMPLETED",
      plan,
      fileName,
      fileUrl: video.videoUrl,
      ipAddress,
      deviceType,
      browser,
      userAgent,
    });

    const remaining = Math.max(
      dailyLimit - todayDownloads.length - 1,
      0
    );

    return NextResponse.json({
      success: true,
      message: "Download started successfully",
      download: {
        id: download.id,
        videoId,
        title: video.title,
        fileName,
        fileUrl: video.videoUrl,
        status: download.status,
      },
      quota: {
        plan,
        dailyLimit,
        usedToday: todayDownloads.length + 1,
        remaining,
      },
    });
  } catch (error) {
    console.error("Download POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create download",
      },
      { status: 500 }
    );
  }
}