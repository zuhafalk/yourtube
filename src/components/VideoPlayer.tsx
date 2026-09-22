"use client";

import { useEffect, useRef } from "react";

type VideoPlayerProps = {
  videoUrl: string;
  poster?: string | null;
  onPlay?: () => void;
  onEnded?: () => void;
};

export default function VideoPlayer({
  videoUrl,
  poster,
  onPlay,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = false;
    video.volume = 1;
  }, [videoUrl]);

  return (
    <div className="overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        key={videoUrl}
        src={videoUrl}
        poster={poster || undefined}
        controls
        playsInline
        preload="auto"
        muted={false}
        className="aspect-video h-auto w-full object-contain"
        onPlay={() => {
          onPlay?.();
        }}
        onEnded={() => {
          onEnded?.();
        }}
      />
    </div>
  );
}