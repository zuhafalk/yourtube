"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Clapperboard,
  MessageCircle,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";

type Short = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  thumbnail: string | null;
  views: number;
  uploader?: { name: string | null } | null;
};

function ShortCard({
  short,
  muted,
  onToggleMute,
}: {
  short: Short;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.play().catch(() => {});
        } else {
          element.pause();
          element.currentTime = 0;
        }
      },
      { threshold: 0.7 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  function togglePlay() {
    const element = videoRef.current;

    if (!element) return;

    if (element.paused) {
      element.play().catch(() => {});
    } else {
      element.pause();
    }
  }

  return (
    <section className="flex h-full snap-start items-center justify-center bg-black">
      <div className="relative h-full w-full max-w-md">
        <video
          ref={videoRef}
          src={short.videoUrl || undefined}
          poster={short.thumbnail || undefined}
          loop
          muted
          playsInline
          preload="metadata"
          onClick={togglePlay}
          className="h-full w-full cursor-pointer object-contain"
        />

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute right-3 top-3 rounded-full bg-black/60 p-2.5 text-white"
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-6">
          <p className="text-sm font-semibold text-white">
            @{short.uploader?.name || "yourtube"}
          </p>

          <h2 className="mt-1 line-clamp-2 text-base font-semibold text-white">
            {short.title}
          </h2>

          <p className="mt-1 text-xs text-gray-300">
            {short.views || 0} views
          </p>
        </div>

        <Link
          href={`/watch?id=${short.id}`}
          aria-label="Open comments"
          className="absolute bottom-24 right-3 flex flex-col items-center gap-1 rounded-full bg-black/60 p-3 text-white"
        >
          <MessageCircle size={22} />
        </Link>
      </div>
    </section>
  );
}

export default function ShortsPage() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    async function loadShorts() {
      try {
        const response = await fetch("/api/videos?type=short");

        if (!response.ok) {
          throw new Error("Failed to load shorts");
        }

        const data = await response.json();

        if (data.success) {
          setShorts(
            (data.videos || []).filter((item: Short) => item.videoUrl)
          );
        } else {
          throw new Error(data.message || "Failed to load shorts");
        }
      } catch (err) {
        console.error("Failed to load shorts:", err);

        setError(
          err instanceof Error ? err.message : "Failed to load shorts"
        );
      } finally {
        setLoading(false);
      }
    }

    loadShorts();
  }, []);

  return (
    <div className="min-h-dvh bg-gray-100">
      <header className="flex h-16 items-center justify-between border-b bg-white px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Back to home"
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <ArrowLeft size={24} />
          </Link>

          <h1 className="text-xl font-bold">Shorts</h1>
        </div>

        <Link
          href="/upload"
          className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          <Upload size={16} />
          Upload
        </Link>
      </header>

      {loading ? (
        <div className="flex h-[calc(100dvh-4rem)] items-center justify-center">
          <p className="text-gray-500">Loading shorts...</p>
        </div>
      ) : error ? (
        <div className="flex h-[calc(100dvh-4rem)] items-center justify-center px-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : shorts.length === 0 ? (
        <div className="px-6 py-20 text-center">
          <Clapperboard size={56} className="mx-auto text-gray-400" />

          <h2 className="mt-5 text-2xl font-bold">No shorts yet</h2>

          <p className="mt-2 text-gray-500">
            Upload a video and choose &quot;Upload as a Short&quot; to see it
            here.
          </p>

          <Link
            href="/upload"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            <Upload size={18} />
            Upload a short
          </Link>
        </div>
      ) : (
        <main className="h-[calc(100dvh-4rem)] snap-y snap-mandatory overflow-y-scroll bg-black">
          {shorts.map((short) => (
            <ShortCard
              key={short.id}
              short={short}
              muted={muted}
              onToggleMute={() => setMuted((current) => !current)}
            />
          ))}
        </main>
      )}
    </div>
  );
}