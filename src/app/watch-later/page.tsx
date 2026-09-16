"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  Play,
  Trash2,
} from "lucide-react";

type Video = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  category: string | null;
  views: number;
  createdAt: string;
  videoUrl: string | null;
};

type WatchLaterItem = {
  video: Video;
  savedAt: string;
};

export default function WatchLaterPage() {
  const [videos, setVideos] = useState<
    WatchLaterItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] =
    useState(false);

  const [removingId, setRemovingId] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadWatchLater() {
      try {
        const response = await fetch(
          "/api/watch-later"
        );

        const data = await response.json();

        if (response.status === 401) {
          setLoginRequired(true);
          return;
        }

        if (response.ok && data.success) {
          setVideos(data.videos || []);
        }
      } catch (error) {
        console.error(
          "Failed to load Watch Later:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadWatchLater();
  }, []);

  async function removeFromWatchLater(
    videoId: string
  ) {
    try {
      setRemovingId(videoId);

      const response = await fetch(
        `/api/videos/${videoId}/watch-later`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setVideos((previous) =>
          previous.filter(
            (item) => item.video.id !== videoId
          )
        );
      } else {
        alert(
          data.message ||
            "Failed to remove video"
        );
      }
    } catch (error) {
      console.error(
        "Failed to remove video:",
        error
      );

      alert("Failed to remove video");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="h-16 bg-white border-b flex items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-700 hover:text-black"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>

        <div className="flex items-center gap-2 ml-6">
          <Clock size={22} />

          <h1 className="text-xl font-bold">
            Watch Later
          </h1>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">
              Loading Watch Later...
            </p>
          </div>
        ) : loginRequired ? (
          <div className="bg-white rounded-2xl border p-10 text-center">
            <Clock
              size={50}
              className="mx-auto text-gray-400 mb-4"
            />

            <h2 className="text-2xl font-bold">
              Login to use Watch Later
            </h2>

            <p className="text-gray-500 mt-2">
              Save videos here and watch them
              whenever you want.
            </p>

            <Link
              href="/login"
              className="inline-block mt-6 bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700"
            >
              Login
            </Link>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center">
            <Clock
              size={50}
              className="mx-auto text-gray-400 mb-4"
            />

            <h2 className="text-2xl font-bold">
              Watch Later is empty
            </h2>

            <p className="text-gray-500 mt-2">
              Save videos you want to watch later.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-6 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800"
            >
              <Play
                size={18}
                fill="currentColor"
              />
              Browse Videos
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  Watch Later
                </h2>

                <p className="text-gray-500 mt-1">
                  Videos saved for later
                </p>
              </div>

              <span className="text-sm text-gray-500">
                {videos.length}{" "}
                {videos.length === 1
                  ? "video"
                  : "videos"}
              </span>
            </div>

            <div className="space-y-5">
              {videos.map((item) => {
                const video = item.video;

                return (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl border p-4"
                  >
                    <div className="flex flex-col sm:flex-row gap-5">
                      {/* THUMBNAIL */}
                      <Link
                        href={`/watch?id=${video.id}`}
                        className="relative w-full sm:w-64 aspect-video shrink-0 bg-gray-200 rounded-lg overflow-hidden"
                      >
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 text-white flex items-center justify-center">
                            <Play
                              size={40}
                              fill="currentColor"
                            />
                          </div>
                        )}
                      </Link>

                      {/* DETAILS */}
                      <div className="flex-1">
                        <Link
                          href={`/watch?id=${video.id}`}
                        >
                          <h3 className="text-lg font-bold line-clamp-2 hover:underline">
                            {video.title}
                          </h3>
                        </Link>

                        <p className="text-sm text-gray-500 mt-2">
                          {video.views || 0} views
                        </p>

                        {video.category && (
                          <p className="text-sm text-gray-500 mt-1">
                            {video.category}
                          </p>
                        )}

                        {video.description && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {video.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-4">
                          <Link
                            href={`/watch?id=${video.id}`}
                            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800"
                          >
                            <Play
                              size={15}
                              fill="currentColor"
                            />
                            Watch
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromWatchLater(
                                video.id
                              )
                            }
                            disabled={
                              removingId ===
                              video.id
                            }
                            className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={15} />

                            {removingId ===
                            video.id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}