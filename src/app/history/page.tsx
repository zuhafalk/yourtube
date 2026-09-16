"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  History as HistoryIcon,
  Play,
  LogIn,
} from "lucide-react";

type Video = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  category?: string | null;
  views?: number | null;
  videoUrl?: string | null;
};

type HistoryItem = {
  video: Video;
  watchedAt: string;
};

export default function HistoryPage() {
  const [videos, setVideos] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/history");
        const data = await response.json();

        if (response.status === 401) {
          setLoggedIn(false);
          setVideos([]);
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load watch history"
          );
        }

        setLoggedIn(true);
        setVideos(data.history || []);
      } catch (error) {
        console.error("History page error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load watch history"
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString();
  }

  function formatViews(views: number | null | undefined) {
    const count = views ?? 0;

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    }

    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }

    return `${count} views`;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <HistoryIcon className="w-7 h-7 text-gray-800" />

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Watch History
            </h1>

            <p className="text-gray-500 mt-1">
              Videos you have watched recently
            </p>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-gray-500">
              Loading your watch history...
            </p>
          </div>
        )}

        {!loading && !loggedIn && (
          <div className="bg-white rounded-xl border p-10 text-center">
            <HistoryIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />

            <h2 className="text-xl font-semibold text-gray-900">
              Login to view your history
            </h2>

            <p className="text-gray-500 mt-2 mb-6">
              Your watched videos will appear here after you
              log in.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 transition"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </div>
        )}

        {!loading && loggedIn && error && (
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading &&
          loggedIn &&
          !error &&
          videos.length === 0 && (
            <div className="bg-white rounded-xl border p-10 text-center">
              <HistoryIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />

              <h2 className="text-xl font-semibold text-gray-900">
                Your history is empty
              </h2>

              <p className="text-gray-500 mt-2 mb-6">
                Videos you watch will appear here.
              </p>

              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 transition"
              >
                <Play className="w-4 h-4" />
                Browse videos
              </Link>
            </div>
          )}

        {!loading &&
          loggedIn &&
          !error &&
          videos.length > 0 && (
            <div className="space-y-5">
              {videos.map((item) => {
                const video = item.video;

                return (
                  <Link
                    key={video.id}
                    href={`/watch?id=${video.id}`}
                    className="block bg-white rounded-xl border p-4 hover:shadow-md transition"
                  >
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="w-full sm:w-64 h-36 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                          {video.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                          <span>
                            {formatViews(video.views)}
                          </span>

                          {video.category && (
                            <>
                              <span>•</span>
                              <span>{video.category}</span>
                            </>
                          )}

                          <span>•</span>

                          <span>
                            Watched{" "}
                            {formatDate(item.watchedAt)}
                          </span>
                        </div>

                        {video.description && (
                          <p className="text-gray-600 mt-3 line-clamp-2">
                            {video.description}
                          </p>
                        )}

                        <div className="mt-4">
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-900">
                            <Play className="w-4 h-4" />
                            Watch again
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
      </div>
    </main>
  );
}