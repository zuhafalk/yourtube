"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Trash2,
  Share2,
  Clock,
  Check,
  Send,
  Play,
  Bell,
  Download,
  Reply,
  Pencil,
  X,
  Languages,
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

type CommentUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  userId: string;
  parentId?: string | null;
  user?: CommentUser | null;
  likes?: number;
  dislikes?: number;
  replyCount?: number;
};

type SortType = "newest" | "oldest" | "popular";

type TranslationLanguage = {
  code: string;
  name: string;
};

const translationLanguages: TranslationLanguage[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "kn", name: "Kannada" },
  { code: "te", name: "Telugu" },
  { code: "ta", name: "Tamil" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "bn", name: "Bengali" },
  { code: "gu", name: "Gujarati" },
  { code: "pa", name: "Punjabi" },
  { code: "ur", name: "Urdu" },
];

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

  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadPlan, setDownloadPlan] = useState("FREE");
  const [downloadRemaining, setDownloadRemaining] = useState(0);

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [commentSort, setCommentSort] =
    useState<SortType>("newest");

  const [replyingTo, setReplyingTo] = useState<string | null>(
    null
  );

  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const [reactionLoading, setReactionLoading] =
    useState<string | null>(null);

  const [editingCommentId, setEditingCommentId] =
    useState<string | null>(null);

  const [editingText, setEditingText] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deletingCommentId, setDeletingCommentId] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  // Translation state
  const [translationLanguage, setTranslationLanguage] =
    useState("en");

  const [translations, setTranslations] = useState<
    Record<string, string>
  >({});

  const [translationLanguagesByComment, setTranslationLanguagesByComment] =
    useState<Record<string, string>>({});

  const [translatingCommentId, setTranslatingCommentId] =
    useState<string | null>(null);

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
          `/api/videos/${videoId}/comments?sort=${commentSort}`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setComments(data.comments || []);
        } else {
          console.error(
            "Failed to load comments:",
            data.message
          );
        }
      } catch (error) {
        console.error("Failed to load comments:", error);
      } finally {
        setCommentsLoading(false);
      }
    }

    loadComments();
  }, [videoId, commentSort]);

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

  // Load download quota
  useEffect(() => {
    if (!videoId || videoId === "undefined") {
      return;
    }

    async function loadDownloadQuota() {
      try {
        const response = await fetch(
          `/api/videos/${videoId}/download`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setDownloadPlan(
            String(data.plan?.name || "FREE")
          );

          setDownloadRemaining(
            Number(data.plan?.remaining ?? 0)
          );
        }
      } catch (error) {
        console.error(
          "Failed to load download quota:",
          error
        );
      }
    }

    loadDownloadQuota();
  }, [videoId]);

  // Translate comment
  async function handleTranslateComment(
    comment: Comment
  ) {
    const commentId = comment.id;

    if (translatingCommentId) {
      return;
    }

    const existingTranslation =
      translations[commentId];

    const existingLanguage =
      translationLanguagesByComment[commentId];

    if (
      existingTranslation &&
      existingLanguage === translationLanguage
    ) {
      setTranslations((current) => {
        const next = { ...current };
        delete next[commentId];
        return next;
      });

      setTranslationLanguagesByComment((current) => {
        const next = { ...current };
        delete next[commentId];
        return next;
      });

      return;
    }

    try {
      setTranslatingCommentId(commentId);

      const response = await fetch(
        `/api/comments/${commentId}/translate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: comment.text,
            targetLanguage: translationLanguage,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setTranslations((current) => ({
          ...current,
          [commentId]: data.translatedText,
        }));

        setTranslationLanguagesByComment((current) => ({
          ...current,
          [commentId]: translationLanguage,
        }));
      } else {
        alert(
          data.message ||
            "Failed to translate comment"
        );
      }
    } catch (error) {
      console.error(
        "Failed to translate comment:",
        error
      );

      alert("Failed to translate comment");
    } finally {
      setTranslatingCommentId(null);
    }
  }

  // Like / unlike video
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

  // Add main comment
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

  // Add reply
  async function handleReplySubmit(
    event: React.FormEvent,
    parentId: string
  ) {
    event.preventDefault();

    if (
      !videoId ||
      videoId === "undefined" ||
      !replyText.trim()
    ) {
      return;
    }

    try {
      setReplySubmitting(true);

      const response = await fetch(
        `/api/videos/${videoId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: replyText.trim(),
            parentId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setComments((current) => [
          ...current,
          data.comment,
        ]);

        setReplyText("");
        setReplyingTo(null);
      } else {
        alert(
          data.message || "Failed to add reply"
        );
      }
    } catch (error) {
      console.error(
        "Failed to add reply:",
        error
      );

      alert("Failed to add reply");
    } finally {
      setReplySubmitting(false);
    }
  }

  // Like / dislike a comment
  async function handleCommentReaction(
    commentId: string,
    type: "LIKE" | "DISLIKE"
  ) {
    if (reactionLoading) {
      return;
    }

    try {
      setReactionLoading(commentId);

      const response = await fetch(
        `/api/comments/${commentId}/reaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            "Failed to update comment reaction"
        );
        return;
      }

      setComments((current) =>
        current.map((comment) => {
          if (comment.id !== commentId) {
            return comment;
          }

          const currentLikes = Number(
            comment.likes ?? 0
          );

          const currentDislikes = Number(
            comment.dislikes ?? 0
          );

          if (data.action === "added") {
            return {
              ...comment,
              likes:
                type === "LIKE"
                  ? currentLikes + 1
                  : currentLikes,
              dislikes:
                type === "DISLIKE"
                  ? currentDislikes + 1
                  : currentDislikes,
            };
          }

          if (data.action === "removed") {
            return {
              ...comment,
              likes:
                type === "LIKE"
                  ? Math.max(0, currentLikes - 1)
                  : currentLikes,
              dislikes:
                type === "DISLIKE"
                  ? Math.max(0, currentDislikes - 1)
                  : currentDislikes,
            };
          }

          if (data.action === "changed") {
            return {
              ...comment,
              likes:
                type === "LIKE"
                  ? currentLikes + 1
                  : Math.max(0, currentLikes - 1),
              dislikes:
                type === "DISLIKE"
                  ? currentDislikes + 1
                  : Math.max(0, currentDislikes - 1),
            };
          }

          return comment;
        })
      );
    } catch (error) {
      console.error(
        "Failed to react to comment:",
        error
      );

      alert("Failed to update comment reaction");
    } finally {
      setReactionLoading(null);
    }
  }

  // Start editing a comment
  function startEditingComment(comment: Comment) {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
    setReplyingTo(null);
    setReplyText("");
  }

  // Cancel editing
  function cancelEditingComment() {
    setEditingCommentId(null);
    setEditingText("");
  }

  // Edit comment
  async function handleEditComment(
    commentId: string
  ) {
    if (!editingText.trim() || editSubmitting) {
      return;
    }

    try {
      setEditSubmitting(true);

      const response = await fetch(
        `/api/comments/${commentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: editingText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setComments((current) =>
          current.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  text:
                    data.comment?.text ??
                    editingText.trim(),
                  updatedAt:
                    data.comment?.updatedAt ??
                    comment.updatedAt,
                }
              : comment
          )
        );

        setTranslations((current) => {
          const next = { ...current };
          delete next[commentId];
          return next;
        });

        setTranslationLanguagesByComment((current) => {
          const next = { ...current };
          delete next[commentId];
          return next;
        });

        cancelEditingComment();
      } else {
        alert(
          data.message || "Failed to edit comment"
        );
      }
    } catch (error) {
      console.error(
        "Failed to edit comment:",
        error
      );

      alert("Failed to edit comment");
    } finally {
      setEditSubmitting(false);
    }
  }

  // Delete comment
  async function handleDeleteComment(
    commentId: string
  ) {
    if (deletingCommentId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCommentId(commentId);

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
            (comment) =>
              comment.id !== commentId &&
              comment.parentId !== commentId
          )
        );

        setTranslations((current) => {
          const next = { ...current };
          delete next[commentId];
          return next;
        });

        setTranslationLanguagesByComment((current) => {
          const next = { ...current };
          delete next[commentId];
          return next;
        });

        if (editingCommentId === commentId) {
          cancelEditingComment();
        }
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
    } finally {
      setDeletingCommentId(null);
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

  // Download
  async function handleDownload() {
    if (
      !videoId ||
      videoId === "undefined" ||
      downloadLoading
    ) {
      return;
    }

    try {
      setDownloadLoading(true);

      const response = await fetch(
        `/api/videos/${videoId}/download`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const fileUrl = data.download?.fileUrl;

        setDownloadPlan(
          String(data.quota?.plan || downloadPlan)
        );

        setDownloadRemaining(
          Number(data.quota?.remaining ?? 0)
        );

        if (fileUrl) {
          const link = document.createElement("a");

          link.href = fileUrl;
          link.download =
            data.download?.fileName ||
            "yourtube-video.mp4";
          link.target = "_blank";
          link.rel = "noopener noreferrer";

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        alert(
          `Download started. ${Number(
            data.quota?.remaining ?? 0
          )} download(s) remaining today.`
        );
      } else {
        if (response.status === 429) {
          setDownloadRemaining(0);
        }

        alert(
          data.message ||
            "Download could not be started"
        );
      }
    } catch (error) {
      console.error(
        "Failed to download video:",
        error
      );

      alert("Failed to download video");
    } finally {
      setDownloadLoading(false);
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

      alert("Failed to delete video");
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

  function formatCommentDate(
    date: string
  ) {
    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) {
      return "";
    }

    const difference =
      Date.now() - timestamp;

    const seconds = Math.floor(
      difference / 1000
    );

    if (seconds < 60) {
      return "just now";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 30) {
      return `${days}d ago`;
    }

    return new Date(date).toLocaleDateString();
  }

  function getCommentUserName(
    comment: Comment
  ) {
    return (
      comment.user?.name ||
      "YourTube User"
    );
  }

  function getCommentInitial(
    comment: Comment
  ) {
    return getCommentUserName(comment)
      .charAt(0)
      .toUpperCase();
  }

  function getTranslatedText(
    comment: Comment
  ) {
    return translations[comment.id];
  }

  function isTranslated(
    comment: Comment
  ) {
    return Boolean(
      translations[comment.id] &&
      translationLanguagesByComment[comment.id] ===
        translationLanguage
    );
  }

  const rootComments = comments.filter(
    (comment) => !comment.parentId
  );

  const repliesByParent = new Map<
    string,
    Comment[]
  >();

  for (const comment of comments) {
    if (!comment.parentId) {
      continue;
    }

    const existing =
      repliesByParent.get(comment.parentId) ||
      [];

    existing.push(comment);

    repliesByParent.set(
      comment.parentId,
      existing
    );
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
              <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold overflow-hidden">
                {video.uploader?.avatar ? (
                  <img
                    src={video.uploader.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (
                    video.uploader?.name ||
                    "User"
                  )
                    .charAt(0)
                    .toUpperCase()
                )}
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

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={
                downloadLoading ||
                downloadRemaining === 0
              }
              className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white text-gray-700 border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                downloadRemaining === 0
                  ? `No downloads remaining today on ${downloadPlan} plan`
                  : `${downloadRemaining} download(s) remaining today`
              }
            >
              <Download className="w-4 h-4" />

              {downloadLoading
                ? "Downloading..."
                : "Download"}
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

          {/* Download quota */}
          <div className="mt-3 text-sm text-gray-500">
            {downloadPlan} plan •{" "}
            {downloadRemaining} download
            {downloadRemaining === 1
              ? ""
              : "s"} remaining today
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
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />

                <h2 className="text-xl font-semibold">
                  Comments ({comments.length})
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Translation language */}
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-gray-500" />

                  <select
                    value={translationLanguage}
                    onChange={(event) => {
                      setTranslationLanguage(
                        event.target.value
                      );

                      setTranslations({});
                      setTranslationLanguagesByComment(
                        {}
                      );
                    }}
                    className="border rounded-lg px-3 py-2 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-gray-300"
                    title="Translation language"
                  >
                    {translationLanguages.map(
                      (language) => (
                        <option
                          key={language.code}
                          value={language.code}
                        >
                          {language.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Sort */}
                <select
                  value={commentSort}
                  onChange={(event) =>
                    setCommentSort(
                      event.target.value as SortType
                    )
                  }
                  className="border rounded-lg px-3 py-2 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="newest">
                    Newest
                  </option>

                  <option value="oldest">
                    Oldest
                  </option>

                  <option value="popular">
                    Popular
                  </option>
                </select>
              </div>
            </div>

            {/* Add Comment */}
            <form
              onSubmit={handleCommentSubmit}
              className="flex gap-3 mb-6"
            >
              <input
                type="text"
                value={commentText}
                maxLength={1000}
                onChange={(event) =>
                  setCommentText(
                    event.target.value
                  )
                }
                placeholder="Add a comment..."
                className="flex-1 border rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-gray-300 bg-white"
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
              <div className="space-y-5">
                {rootComments.map((comment) => {
                  const replies =
                    repliesByParent.get(
                      comment.id
                    ) || [];

                  const isEditing =
                    editingCommentId === comment.id;

                  const translatedText =
                    getTranslatedText(comment);

                  const translated =
                    isTranslated(comment);

                  return (
                    <div
                      key={comment.id}
                      className="bg-white border rounded-xl p-5"
                    >
                      {/* Main Comment */}
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 shrink-0 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold overflow-hidden">
                          {comment.user?.avatar ? (
                            <img
                              src={comment.user.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getCommentInitial(
                              comment
                            )
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* User information */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {getCommentUserName(
                                comment
                              )}
                            </span>

                            <span className="text-xs text-gray-400">
                              {formatCommentDate(
                                comment.createdAt
                              )}
                            </span>

                            {comment.updatedAt &&
                              comment.updatedAt !==
                                comment.createdAt && (
                                <span className="text-xs text-gray-400">
                                  • edited
                                </span>
                              )}
                          </div>

                          {/* Edit form / Comment text */}
                          {isEditing ? (
                            <div className="mt-3">
                              <textarea
                                value={editingText}
                                maxLength={1000}
                                autoFocus
                                onChange={(event) =>
                                  setEditingText(
                                    event.target.value
                                  )
                                }
                                className="w-full min-h-24 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-300 resize-y"
                              />

                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditComment(
                                      comment.id
                                    )
                                  }
                                  disabled={
                                    editSubmitting ||
                                    !editingText.trim()
                                  }
                                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4" />

                                  {editSubmitting
                                    ? "Saving..."
                                    : "Save"}
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    cancelEditingComment
                                  }
                                  disabled={
                                    editSubmitting
                                  }
                                  className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                >
                                  <X className="w-4 h-4" />

                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-gray-800 mt-2 whitespace-pre-wrap break-words">
                                {translated
                                  ? translatedText
                                  : comment.text}
                              </p>

                              {translated && (
                                <p className="text-xs text-gray-400 mt-2">
                                  Translated to{" "}
                                  {
                                    translationLanguages.find(
                                      (language) =>
                                        language.code ===
                                        translationLanguage
                                    )?.name
                                  }
                                </p>
                              )}
                            </>
                          )}

                          {/* Comment actions */}
                          {!isEditing && (
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCommentReaction(
                                    comment.id,
                                    "LIKE"
                                  )
                                }
                                disabled={
                                  reactionLoading ===
                                  comment.id
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                              >
                                <ThumbsUp className="w-4 h-4" />

                                <span>
                                  {Number(
                                    comment.likes ?? 0
                                  )}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleCommentReaction(
                                    comment.id,
                                    "DISLIKE"
                                  )
                                }
                                disabled={
                                  reactionLoading ===
                                  comment.id
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                              >
                                <ThumbsDown className="w-4 h-4" />

                                <span>
                                  {Number(
                                    comment.dislikes ?? 0
                                  )}
                                </span>
                              </button>

                              {/* Translate */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleTranslateComment(
                                    comment
                                  )
                                }
                                disabled={
                                  translatingCommentId ===
                                  comment.id
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                                title={
                                  translated
                                    ? "Hide translation"
                                    : "Translate comment"
                                }
                              >
                                <Languages className="w-4 h-4" />

                                {translatingCommentId ===
                                comment.id
                                  ? "Translating..."
                                  : translated
                                  ? "Original"
                                  : "Translate"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingTo(
                                    comment.id
                                  );
                                  setReplyText("");
                                  setEditingCommentId(
                                    null
                                  );
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition"
                              >
                                <Reply className="w-4 h-4" />

                                Reply
                              </button>

                              {comment.replyCount &&
                                comment.replyCount >
                                  0 && (
                                  <span className="text-xs text-gray-400 ml-1">
                                    {comment.replyCount}{" "}
                                    {comment.replyCount ===
                                    1
                                      ? "reply"
                                      : "replies"}
                                  </span>
                                )}

                              <button
                                type="button"
                                onClick={() =>
                                  startEditingComment(
                                    comment
                                  )
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition"
                                title="Edit comment"
                              >
                                <Pencil className="w-4 h-4" />

                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteComment(
                                    comment.id
                                  )
                                }
                                disabled={
                                  deletingCommentId ===
                                  comment.id
                                }
                                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                title="Delete comment"
                              >
                                <Trash2 className="w-4 h-4" />

                                {deletingCommentId ===
                                comment.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          )}

                          {/* Reply form */}
                          {replyingTo ===
                            comment.id && (
                            <form
                              onSubmit={(event) =>
                                handleReplySubmit(
                                  event,
                                  comment.id
                                )
                              }
                              className="flex gap-2 mt-4"
                            >
                              <input
                                type="text"
                                value={replyText}
                                maxLength={1000}
                                autoFocus
                                onChange={(event) =>
                                  setReplyText(
                                    event.target.value
                                  )
                                }
                                placeholder="Write a reply..."
                                className="flex-1 border rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                              />

                              <button
                                type="submit"
                                disabled={
                                  replySubmitting ||
                                  !replyText.trim()
                                }
                                className="px-4 py-2.5 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition disabled:opacity-50"
                              >
                                {replySubmitting
                                  ? "Posting..."
                                  : "Reply"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingTo(
                                    null
                                  );
                                  setReplyText("");
                                }}
                                className="px-4 py-2.5 rounded-full border text-sm text-gray-600 hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                            </form>
                          )}

                          {/* Replies */}
                          {replies.length > 0 && (
                            <div className="mt-5 ml-3 sm:ml-8 border-l-2 border-gray-100 pl-4 space-y-4">
                              {replies.map(
                                (reply) => {
                                  const isReplyEditing =
                                    editingCommentId ===
                                    reply.id;

                                  const replyTranslatedText =
                                    getTranslatedText(
                                      reply
                                    );

                                  const replyTranslated =
                                    isTranslated(
                                      reply
                                    );

                                  return (
                                    <div
                                      key={reply.id}
                                      className="flex items-start gap-3"
                                    >
                                      <div className="w-8 h-8 shrink-0 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold overflow-hidden">
                                        {reply.user
                                          ?.avatar ? (
                                          <img
                                            src={
                                              reply
                                                .user
                                                .avatar
                                            }
                                            alt=""
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          getCommentInitial(
                                            reply
                                          )
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="font-medium text-gray-900 text-sm">
                                            {getCommentUserName(
                                              reply
                                            )}
                                          </span>

                                          <span className="text-xs text-gray-400">
                                            {formatCommentDate(
                                              reply.createdAt
                                            )}
                                          </span>

                                          {reply.updatedAt &&
                                            reply.updatedAt !==
                                              reply.createdAt && (
                                              <span className="text-xs text-gray-400">
                                                • edited
                                              </span>
                                            )}
                                        </div>

                                        {/* Reply edit form / text */}
                                        {isReplyEditing ? (
                                          <div className="mt-2">
                                            <textarea
                                              value={
                                                editingText
                                              }
                                              maxLength={
                                                1000
                                              }
                                              autoFocus
                                              onChange={(
                                                event
                                              ) =>
                                                setEditingText(
                                                  event
                                                    .target
                                                    .value
                                                )
                                              }
                                              className="w-full min-h-20 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300 resize-y"
                                            />

                                            <div className="flex items-center gap-2 mt-2">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleEditComment(
                                                    reply.id
                                                  )
                                                }
                                                disabled={
                                                  editSubmitting ||
                                                  !editingText.trim()
                                                }
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs hover:bg-gray-800 disabled:opacity-50"
                                              >
                                                <Check className="w-3.5 h-3.5" />

                                                {editSubmitting
                                                  ? "Saving..."
                                                  : "Save"}
                                              </button>

                                              <button
                                                type="button"
                                                onClick={
                                                  cancelEditingComment
                                                }
                                                disabled={
                                                  editSubmitting
                                                }
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                              >
                                                <X className="w-3.5 h-3.5" />

                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap break-words">
                                              {replyTranslated
                                                ? replyTranslatedText
                                                : reply.text}
                                            </p>

                                            {replyTranslated && (
                                              <p className="text-xs text-gray-400 mt-1">
                                                Translated to{" "}
                                                {
                                                  translationLanguages.find(
                                                    (
                                                      language
                                                    ) =>
                                                      language.code ===
                                                      translationLanguage
                                                  )?.name
                                                }
                                              </p>
                                            )}
                                          </>
                                        )}

                                        {!isReplyEditing && (
                                          <div className="flex flex-wrap items-center gap-1 mt-2">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleCommentReaction(
                                                  reply.id,
                                                  "LIKE"
                                                )
                                              }
                                              disabled={
                                                reactionLoading ===
                                                reply.id
                                              }
                                              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                                            >
                                              <ThumbsUp className="w-3.5 h-3.5" />

                                              {Number(
                                                reply.likes ??
                                                  0
                                              )}
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleCommentReaction(
                                                  reply.id,
                                                  "DISLIKE"
                                                )
                                              }
                                              disabled={
                                                reactionLoading ===
                                                reply.id
                                              }
                                              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                                            >
                                              <ThumbsDown className="w-3.5 h-3.5" />

                                              {Number(
                                                reply.dislikes ??
                                                  0
                                              )}
                                            </button>

                                            {/* Translate Reply */}
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleTranslateComment(
                                                  reply
                                                )
                                              }
                                              disabled={
                                                translatingCommentId ===
                                                reply.id
                                              }
                                              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                                              title={
                                                replyTranslated
                                                  ? "Hide translation"
                                                  : "Translate reply"
                                              }
                                            >
                                              <Languages className="w-3.5 h-3.5" />

                                              {translatingCommentId ===
                                              reply.id
                                                ? "Translating..."
                                                : replyTranslated
                                                ? "Original"
                                                : "Translate"}
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() => {
                                                setReplyingTo(
                                                  comment.id
                                                );
                                                setReplyText(
                                                  ""
                                                );
                                              }}
                                              className="px-2.5 py-1 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
                                            >
                                              Reply
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                startEditingComment(
                                                  reply
                                                )
                                              }
                                              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition"
                                              title="Edit reply"
                                            >
                                              <Pencil className="w-3.5 h-3.5" />

                                              Edit
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteComment(
                                                  reply.id
                                                )
                                              }
                                              disabled={
                                                deletingCommentId ===
                                                reply.id
                                              }
                                              className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                              title="Delete reply"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />

                                              {deletingCommentId ===
                                              reply.id
                                                ? "Deleting..."
                                                : "Delete"}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}