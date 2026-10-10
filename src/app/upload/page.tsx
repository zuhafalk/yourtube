"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  FileVideo,
  Loader2,
  Upload,
  X,
} from "lucide-react";

const TEST_USER_ID = "66b1db50-5905-484f-ac8b-02df22540ff5";

const CATEGORIES = [
  "Technology",
  "Education",
  "Gaming",
  "Music",
  "Sports",
  "Cooking",
  "Travel",
  "Entertainment",
  "Fitness",
  "News",
  "AI & Machine Learning",
  "Programming",
  "Science",
  "Other",
];

function waitForVideoEvent(
  video: HTMLVideoElement,
  eventName: "loadedmetadata" | "seeked",
  timeoutMs = 15000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener(eventName, onSuccess);
      video.removeEventListener("error", onError);
    };

    const onSuccess = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error("Could not read a video frame."));
    };

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timed out while preparing the video thumbnail."));
    }, timeoutMs);

    video.addEventListener(eventName, onSuccess, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}

async function generateThumbnail(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");

  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;

  try {
    const metadataPromise = waitForVideoEvent(video, "loadedmetadata");
    video.load();
    await metadataPromise;

    if (
      !Number.isFinite(video.duration) ||
      video.duration <= 0 ||
      video.videoWidth <= 0 ||
      video.videoHeight <= 0
    ) {
      throw new Error("This video does not contain readable frames.");
    }

    const maxWidth = 640;
    const scale = Math.min(1, maxWidth / video.videoWidth);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!context) {
      throw new Error("Could not create the thumbnail canvas.");
    }

    const duration = video.duration;
    const lastSafeTime = Math.max(0, duration - 0.15);

    const timestamps = [
      Math.min(duration * 0.25, lastSafeTime),
      Math.min(duration * 0.5, lastSafeTime),
      Math.min(duration * 0.75, lastSafeTime),
      Math.min(duration * 0.1, lastSafeTime),
      0,
    ];

    let bestBlob: Blob | null = null;
    let bestBrightness = -1;

    for (const timestamp of Array.from(new Set(timestamps))) {
      try {
        if (Math.abs(video.currentTime - timestamp) > 0.01) {
          const seekPromise = waitForVideoEvent(video, "seeked");
          video.currentTime = timestamp;
          await seekPromise;
        }

        // Allow the decoded frame to become available before drawing it.
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        });

        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          continue;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const pixels = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;

        // Estimate frame brightness by sampling pixels.
        let brightnessTotal = 0;
        let sampleCount = 0;
        const pixelCount = canvas.width * canvas.height;
        const pixelStep = Math.max(1, Math.floor(pixelCount / 2500));

        for (let pixel = 0; pixel < pixelCount; pixel += pixelStep) {
          const index = pixel * 4;
          brightnessTotal +=
            pixels[index] * 0.299 +
            pixels[index + 1] * 0.587 +
            pixels[index + 2] * 0.114;
          sampleCount++;
        }

        const brightness =
          sampleCount > 0 ? brightnessTotal / sampleCount : 0;

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, "image/jpeg", 0.9);
        });

        if (blob && brightness > bestBrightness) {
          bestBrightness = brightness;
          bestBlob = blob;
        }

        // Prefer a frame that isn't almost completely black.
        if (blob && brightness >= 25) {
          return new File([blob], "thumbnail.jpg", {
            type: "image/jpeg",
          });
        }
      } catch (frameError) {
        console.warn("Skipping an unreadable video frame:", frameError);
      }
    }

    if (bestBlob) {
      return new File([bestBlob], "thumbnail.jpg", {
        type: "image/jpeg",
      });
    }

    throw new Error(
      "Could not generate a thumbnail. Try a different video file."
    );
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

export default function UploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [isShort, setIsShort] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function handleFileSelect(selectedFile: File | null) {
    if (!selectedFile) return;

    setMessage("");
    setSuccess(false);
    setVideoUrl("");
    setUploadProgress(0);

    if (!selectedFile.type.startsWith("video/")) {
      setFile(null);
      setMessage("Please select a valid video file.");
      return;
    }

    setFile(selectedFile);
  }

  function removeFile() {
    if (uploading) return;

    setFile(null);
    setUploadProgress(0);
    setMessage("");
    setSuccess(false);
    setVideoUrl("");

    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  }

  async function handleUpload() {
    if (uploading) return;

    if (!file) {
      setMessage("Please select a video first.");
      setSuccess(false);
      return;
    }

    if (!title.trim()) {
      setMessage("Please enter a video title.");
      setSuccess(false);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage("");
    setSuccess(false);
    setVideoUrl("");

    try {
      setMessage("Generating a clear video thumbnail...");

      const thumbnailFile = await generateThumbnail(file);

      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const pathname = `videos/${Date.now()}-${safeFileName}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("thumbnail", thumbnailFile);
      formData.append("pathname", pathname);

      const uploadResult = await new Promise<{
        videoUrl: string;
        thumbnailUrl: string | null;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round(
              (event.loaded / event.total) * 100
            );
            setUploadProgress(percentage);
          }
        };

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);

            if (
              xhr.status >= 200 &&
              xhr.status < 300 &&
              data.success &&
              data.videoUrl
            ) {
              resolve({
                videoUrl: data.videoUrl,
                thumbnailUrl: data.thumbnailUrl ?? null,
              });
              return;
            }

            reject(new Error(data.message || "Video upload failed."));
          } catch {
            reject(new Error("Unexpected response from upload server."));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error while uploading video."));
        };

        xhr.onabort = () => {
          reject(new Error("Video upload was cancelled."));
        };

        xhr.send(formData);
      });

      const { videoUrl: blobUrl, thumbnailUrl } = uploadResult;

      setUploadProgress(95);
      setMessage("Saving video details...");

      const videoResponse = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          thumbnail: thumbnailUrl,
          category,
          uploaderId: TEST_USER_ID,
          videoUrl: blobUrl,
          isShort,
        }),
      });

      const videoData = await videoResponse.json();

      if (!videoResponse.ok || !videoData.success) {
        throw new Error(
          videoData.message || "Video uploaded, but database save failed."
        );
      }

      setUploadProgress(100);
      setVideoUrl(blobUrl);
      setSuccess(true);
      setMessage("Your video and thumbnail have been uploaded successfully.");

      setTitle("");
      setDescription("");
      setCategory("Technology");
      setIsShort(false);
      setFile(null);

      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);

      setSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading the video."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-lg font-bold text-white shadow-sm">
              Y
            </div>

            <div>
              <h1 className="text-lg font-bold leading-tight">Your Tube</h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Creator Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
            <CloudUpload size={16} />
            <span>Upload</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-red-600">
            CREATOR STUDIO
          </p>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Upload a video
          </h2>

          <p className="mt-2 max-w-2xl text-gray-500">
            Share your content with the Your Tube community. Add details,
            choose a category, and publish your video.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <section className="border-b p-5 sm:p-7">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Video details</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tell viewers what your video is about.
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="video-title"
                className="mb-2 block text-sm font-semibold"
              >
                Title
              </label>

              <input
                id="video-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title that describes your video"
                maxLength={100}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

              <div className="mt-1 text-right text-xs text-gray-400">
                {title.length}/100
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="video-description"
                className="mb-2 block text-sm font-semibold"
              >
                Description
              </label>

              <textarea
                id="video-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers more about your video..."
                rows={5}
                maxLength={1000}
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

              <div className="mt-1 text-right text-xs text-gray-400">
                {description.length}/1000
              </div>
            </div>

            <div>
              <label
                htmlFor="video-category"
                className="mb-2 block text-sm font-semibold"
              >
                Category
              </label>

              <select
                id="video-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={isShort}
                onChange={(e) => setIsShort(e.target.checked)}
                className="mt-1 h-4 w-4 accent-red-600"
              />

              <span>
                <span className="block text-sm font-semibold">
                  Upload as a Short
                </span>
                <span className="block text-xs text-gray-500">
                  Short videos appear in the Shorts section instead of the
                  home page. Best for vertical videos under 60 seconds.
                </span>
              </span>
            </label>
          </section>

          <section className="p-5 sm:p-7">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Video file</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload your video file directly to secure cloud storage.
              </p>
            </div>

            {!file ? (
              <label
                htmlFor="video-file"
                className="group flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 text-center transition hover:border-red-400 hover:bg-red-50/30"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition group-hover:scale-105">
                  <Upload
                    size={28}
                    className="text-gray-500 group-hover:text-red-600"
                  />
                </div>

                <p className="font-semibold">Click to choose a video</p>

                <p className="mt-1 text-sm text-gray-500">
                  MP4, WebM, MOV and other video formats
                </p>

                <span className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-red-600">
                  Select video
                </span>

                <input
                  id="video-file"
                  ref={inputFileRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileSelect(e.target.files?.[0] || null)
                  }
                />
              </label>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
                    <FileVideo size={24} className="text-red-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{file.name}</p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatFileSize(file.size)} • {file.type || "Video"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={uploading}
                    aria-label="Remove selected video"
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>

                {uploading && (
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {uploadProgress === 0
                          ? "Preparing thumbnail or upload..."
                          : "Uploading video..."}
                      </span>

                      <span className="font-semibold text-red-600">
                        {uploadProgress}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-red-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {uploading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <CloudUpload size={19} />
                  Upload video
                </>
              )}
            </button>

            {message && (
              <div
                className={`mt-5 flex items-start gap-3 rounded-xl border p-4 ${
                  success
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {success ? (
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />
                )}

                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            {videoUrl && (
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Video preview</h3>
                    <p className="text-sm text-gray-500">
                      Your uploaded video is ready.
                    </p>
                  </div>

                  <CheckCircle2 size={22} className="text-green-600" />
                </div>

                <div className="overflow-hidden rounded-2xl bg-black">
                  <video
                    src={videoUrl}
                    controls
                    playsInline
                    className="aspect-video w-full"
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="mt-5 rounded-xl border bg-white px-5 py-4">
          <div className="flex gap-3">
            <CloudUpload size={20} className="mt-0.5 shrink-0 text-gray-500" />

            <div>
              <p className="text-sm font-semibold">About video uploads</p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Your video and its thumbnail are uploaded to Vercel Blob cloud
                storage through the application server.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}