import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const TEST_USER_ID =
  "66b1db50-5905-484f-ac8b-02df22540ff5";

const DAILY_LIMITS: Record<string, number> = {
  FREE: 1,
  BRONZE: 5,
  SILVER: 10,
  GOLD: 20,
};

export async function GET() {
  try {
    let userPlan = await db.orm.public.UserPlan
      .where({
        userId: TEST_USER_ID,
      })
      .first();

    if (!userPlan) {
      userPlan = await db.orm.public.UserPlan.create({
        userId: TEST_USER_ID,
        plan: "FREE",
        status: "ACTIVE",
      });
    }

    const plan = String(
      userPlan.plan || "FREE"
    ).toUpperCase();

    const dailyLimit =
      DAILY_LIMITS[plan] ?? 1;

    const downloads = await db.orm.public.Download
      .where({
        userId: TEST_USER_ID,
      })
      .all();

    const videos = await db.orm.public.Video.all();

    const videoMap = new Map(
      videos.map((video) => [
        video.id,
        video,
      ])
    );

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayDownloads =
      downloads.filter((download) => {
        const downloadedAt = new Date(
          String(download.downloadedAt)
        );

        return downloadedAt >= startOfDay;
      });

    const remaining = Math.max(
      dailyLimit -
        todayDownloads.length,
      0
    );

    const downloadRecords =
      downloads
        .sort(
          (a, b) =>
            new Date(
              String(b.downloadedAt)
            ).getTime() -
            new Date(
              String(a.downloadedAt)
            ).getTime()
        )
        .map((download) => {
          const video = videoMap.get(
            download.videoId
          );

          return {
            id: download.id,
            videoId: download.videoId,
            downloadedAt:
              String(download.downloadedAt),
            status: download.status,
            plan: download.plan,
            fileName:
              download.fileName,
            fileSize:
              download.fileSize,
            fileUrl:
              download.fileUrl,
            video: video
              ? {
                  id: video.id,
                  title: video.title,
                  thumbnail:
                    video.thumbnail,
                }
              : null,
          };
        });

    return NextResponse.json({
      success: true,

      downloads: downloadRecords,

      plan: {
        name: plan,
        dailyLimit,
        usedToday:
          todayDownloads.length,
        remaining,
        status:
          userPlan.status,
        expiryDate:
          userPlan.expiryDate
            ? String(
                userPlan.expiryDate
              )
            : null,
      },
    });
  } catch (error) {
    console.error(
      "Downloads API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load download history",
      },
      {
        status: 500,
      }
    );
  }
}