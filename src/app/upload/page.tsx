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

export default function UploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");

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
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const pathname = `videos/${Date.now()}-${safeFileName}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("pathname", pathname);

      const blobUrl = await new Promise<string>((resolve, reject) => {
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

            if (xhr.status >= 200 && xhr.status < 300 && data.success) {
              resolve(data.videoUrl);
              return;
            }

            reject(new Error(data.message || "Upload failed."));
          } catch {
            reject(new Error("Unexpected response from server."));
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

      setUploadProgress(95);

      const videoResponse = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          thumbnail: null,
          category,
          uploaderId: TEST_USER_ID,
          videoUrl: blobUrl,
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
      setMessage("Your video has been uploaded successfully.");

      setTitle("");
      setDescription("");
      setCategory("Technology");
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
                        Uploading video...
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
                Your video is uploaded to Vercel Blob cloud storage through
                the application server.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
