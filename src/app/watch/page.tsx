"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ThumbsUp,
  MessageCircle,
  Trash2,
  Share2,
  Clock,
  Check,
  Send,
  Play,
  Bell,
} from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";

type Video = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  category?: string | null;
  views?: number | null;
  videoUrl?: string | null;
  uploaderId?: string | null;
  uploader?: {
    id: string;
    name?: string | null;
    avatar?: string | null;
  } | null;
};

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
};

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-500">Loading video...</p>
        </div>
      }
    >
      <WatchContent />
    </Suspense>
  );
}

function WatchContent() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("id");

  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [watchLater, setWatchLater] = useState(false);
  const [watchLaterLoading, setWatchLaterLoading] = useState(false);

  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  const [viewCounted, setViewCounted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  // Load video
  useEffect(() => {
    if (!videoId || videoId === "undefined") {
      setLoading(false);
      setError("No valid video ID was provided.");
      return;
    }

    async function loadVideo() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/videos/${videoId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch video");
        }

        const data = await response.json();

        if (!data.success || !data.video) {
          throw new Error(data.message || "Video not found");
        }

        setVideo(data.video);
        setLikeCount(Number(data.video.likes ?? 0));
      } catch (error) {
        console.error("Failed to load video:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load video"
        );
      } finally {
        setLoading(false);
      }
    }

    loadVideo();
  }, [videoId]);

  // Load comments
  useEffect(() => {
    if (!videoId || videoId === "undefined") {
      setCommentsLoading(false);
      return;
    }

    async function loadComments() {
      try {
        setCommentsLoading(true);

        const response = await fetch(
          `/api/videos/${videoId}/comments`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error("Failed to load comments:", error);
      } finally {
        setCommentsLoading(false);
      }
    }

    loadComments();
  }, [videoId]);

  // Load like status
  useEffect(() => {
    if (!videoId || videoId === "undefined") {
      return;
    }

    async function loadLikeStatus() {
      try {
        const response = await fetch(
          `/api/videos/${videoId}/like`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setLiked(Boolean(data.liked));
          setLikeCount(Number(data.likeCount ?? 0));
        }
      } catch (error) {
        console.error("Failed to load like status:", error);
      }
    }

    loadLikeStatus();
  }, [videoId]);

  // Load Watch Later status
  useEffect(() => {
    if (!videoId || videoId === "undefined") {
      return;
    }

    async function loadWatchLaterStatus() {
      try {
        const response = await fetch(
          `/api/videos/${videoId}/watch-later`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setWatchLater(Boolean(data.saved));
        }
      } catch (error) {
        console.error(
          "Failed to load Watch Later status:",
          error
        );
      }
    }

    loadWatchLaterStatus();
  }, [videoId]);

  // Load subscription status
  useEffect(() => {
    const uploaderId = video?.uploaderId;

    if (!uploaderId || uploaderId === "undefined") {
      return;
    }

    async function loadSubscriptionStatus() {
      try {
        const response = await fetch(
          `/api/users/${uploaderId}/subscribe`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setSubscribed(Boolean(data.subscribed));
          setSubscriberCount(
            Number(data.subscriberCount ?? 0)
          );
        }
      } catch (error) {
        console.error(
          "Failed to load subscription status:",
          error
        );
      }
    }

    loadSubscriptionStatus();
  }, [video?.uploaderId]);

  // Like / unlike
  async function handleLike() {
    if (!videoId || videoId === "undefined") {
      return;
    }

    try {
      const response = await fetch(
        `/api/videos/${videoId}/like`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setLiked(Boolean(data.liked));
        setLikeCount(Number(data.likeCount ?? 0));
      } else {
        alert(data.message || "Failed to like video");
      }
    } catch (error) {
      console.error("Failed to like video:", error);
      alert("Failed to like video");
    }
  }

  // Subscribe / unsubscribe
  async function handleSubscribe() {
    if (!video?.uploaderId || subscribeLoading) {
      return;
    }

    try {
      setSubscribeLoading(true);

      const response = await fetch(
        `/api/users/${video.uploaderId}/subscribe`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSubscribed(Boolean(data.subscribed));
        setSubscriberCount(
          Number(data.subscriberCount ?? 0)
        );
      } else {
        alert(
          data.message || "Failed to update subscription"
        );
      }
    } catch (error) {
      console.error(
        "Failed to update subscription:",
        error
      );

      alert("Failed to update subscription");
    } finally {
      setSubscribeLoading(false);
    }
  }

  // Add comment
  async function handleCommentSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (
      !videoId ||
      videoId === "undefined" ||
      !commentText.trim()
    ) {
      return;
    }

    try {
      setCommentSubmitting(true);

      const response = await fetch(
        `/api/videos/${videoId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: commentText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setComments((current) => [
          data.comment,
          ...current,
        ]);

        setCommentText("");
      } else {
        alert(
          data.message || "Failed to add comment"
        );
      }
    } catch (error) {
      console.error(
        "Failed to add comment:",
        error
      );

      alert("Failed to add comment");
    } finally {
      setCommentSubmitting(false);
    }
  }

  // Delete comment
  async function handleDeleteComment(
    commentId: string
  ) {
    try {
      const response = await fetch(
        `/api/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setComments((current) =>
          current.filter(
            (comment) => comment.id !== commentId
          )
        );
      } else {
        alert(
          data.message || "Failed to delete comment"
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete comment:",
        error
      );

      alert("Failed to delete comment");
    }
  }

  // Watch Later
  async function handleWatchLater() {
    if (
      !videoId ||
      videoId === "undefined" ||
      watchLaterLoading
    ) {
      return;
    }

    try {
      setWatchLaterLoading(true);

      const response = await fetch(
        `/api/videos/${videoId}/watch-later`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setWatchLater(Boolean(data.saved));
      } else {
        alert(
          data.message ||
            "Please login to use Watch Later"
        );
      }
    } catch (error) {
      console.error(
        "Failed to update Watch Later:",
        error
      );

      alert("Failed to update Watch Later");
    } finally {
      setWatchLaterLoading(false);
    }
  }

  // Share
  async function handleShare() {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      alert("Video link copied!");
    } catch (error) {
      console.error(
        "Failed to copy link:",
        error
      );

      alert("Failed to copy video link");
    }
  }

  // Delete video
  async function handleDeleteVideo() {
    if (
      !videoId ||
      videoId === "undefined" ||
      deleting
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this video?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/videos/${videoId}/delete`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        window.location.href = "/";
      } else {
        alert(
          data.message ||
            "Failed to delete video"
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete video:",
        error
      );

      alert(
        "Failed to delete video"
      );
    } finally {
      setDeleting(false);
    }
  }

  // Count one view when video starts playing
  async function handleVideoPlay() {
    if (
      !videoId ||
      videoId === "undefined" ||
      viewCounted
    ) {
      return;
    }

    try {
      await fetch(
        `/api/videos/${videoId}/history`,
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(
        "Failed to save watch history:",
        error
      );
    }

    try {
      const response = await fetch(
        `/api/videos/${videoId}/views`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setViewCounted(true);

        setVideo((currentVideo) => {
          if (!currentVideo) {
            return currentVideo;
          }

          return {
            ...currentVideo,
            views: Number(data.views),
          };
        });
      }
    } catch (error) {
      console.error(
        "Failed to update view count:",
        error
      );
    }
  }

  function formatViews(
    views: number | null | undefined
  ) {
    const count = Number(views ?? 0);

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    }

    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }

    return `${count} views`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">
          Loading video...
        </p>
      </main>
    );
  }

  if (error || !video) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border rounded-xl p-8 text-center max-w-md">
          <h1 className="text-xl font-semibold text-gray-900">
            Unable to load video
          </h1>

          <p className="text-gray-500 mt-2">
            {error || "Video not found"}
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="mt-5 px-5 py-2 rounded-full bg-black text-white"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Video Player */}
        <div className="bg-black rounded-xl overflow-hidden">
          {video.videoUrl ? (
            <VideoPlayer
              videoUrl={video.videoUrl}
              poster={video.thumbnail}
              onPlay={handleVideoPlay}
            />
          ) : (
            <div className="aspect-video flex items-center justify-center text-white">
              <div className="text-center">
                <Play className="w-12 h-12 mx-auto mb-3" />

                <p>
                  Video is not available
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Video Information */}
        <div className="mt-5">
          <h1 className="text-2xl font-bold text-gray-900">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
            <span>
              {formatViews(video.views)}
            </span>

            {video.category && (
              <>
                <span>•</span>
                <span>{video.category}</span>
              </>
            )}
          </div>

          {/* Channel / Subscribe */}
          <div className="flex flex-wrap items-center gap-4 mt-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
                {(
                  video.uploader?.name ||
                  "User"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <p className="font-semibold text-gray-900">
                  {video.uploader?.name ||
                    "YourTube User"}
                </p>

                <p className="text-sm text-gray-500">
                  {subscriberCount}{" "}
                  {subscriberCount === 1
                    ? "subscriber"
                    : "subscribers"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubscribe}
              disabled={subscribeLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition disabled:opacity-50 ${
                subscribed
                  ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {subscribed ? (
                <Check className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}

              {subscribeLoading
                ? "Updating..."
                : subscribed
                ? "Subscribed"
                : "Subscribe"}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-5">

            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
                liked
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />

              <span>
                {likeCount}
              </span>
            </button>

            {/* Watch Later */}
            <button
              type="button"
              onClick={handleWatchLater}
              disabled={watchLaterLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
                watchLater
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              } disabled:opacity-50`}
            >
              {watchLater ? (
                <Check className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}

              <span>
                {watchLater
                  ? "Saved"
                  : "Watch Later"}
              </span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white text-gray-700 border-gray-300 hover:bg-gray-100 transition"
            >
              <Share2 className="w-4 h-4" />

              Share
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={handleDeleteVideo}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-300 bg-white text-red-600 hover:bg-red-50 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />

              {deleting
                ? "Deleting..."
                : "Delete Video"}
            </button>
          </div>

          {/* Description */}
          {video.description && (
            <div className="mt-6 bg-white rounded-xl border p-5">
              <p className="text-gray-700 whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}

          {/* Comments */}
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-5">
              <MessageCircle className="w-5 h-5" />

              <h2 className="text-xl font-semibold">
                Comments ({comments.length})
              </h2>
            </div>

            <form
              onSubmit={handleCommentSubmit}
              className="flex gap-3 mb-6"
            >
              <input
                type="text"
                value={commentText}
                onChange={(event) =>
                  setCommentText(
                    event.target.value
                  )
                }
                placeholder="Add a comment..."
                className="flex-1 border rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-gray-300"
              />

              <button
                type="submit"
                disabled={
                  commentSubmitting ||
                  !commentText.trim()
                }
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-black text-white hover:bg-gray-800 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />

                {commentSubmitting
                  ? "Posting..."
                  : "Post"}
              </button>
            </form>

            {commentsLoading ? (
              <p className="text-gray-500">
                Loading comments...
              </p>
            ) : comments.length === 0 ? (
              <div className="bg-white border rounded-xl p-6 text-center">
                <MessageCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />

                <p className="text-gray-500">
                  No comments yet. Be the first
                  to comment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          User
                        </p>

                        <p className="text-gray-800 mt-1">
                          {comment.text}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteComment(
                            comment.id
                          )
                        }
                        className="text-gray-400 hover:text-red-600 transition"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}