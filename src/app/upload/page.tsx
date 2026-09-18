"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { Upload, Video, CheckCircle, AlertCircle } from "lucide-react";

const TEST_USER_ID = "66b1db50-5905-484f-ac8b-02df22540ff5";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) {
      setMessage("Please select a video first.");
      return;
    }

    if (!title.trim()) {
      setMessage("Please enter a video title.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage("");
    setVideoUrl("");

    try {
      // Step 1: Upload directly from the browser to Vercel Blob
      const blob = await upload(
        `videos/${Date.now()}-${file.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        )}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/upload",
          multipart: true,
          onUploadProgress(progress) {
            setUploadProgress(Math.round(progress.percentage));
          },
        }
      );

      // Step 2: Save video information in the database
      const videoResponse = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          thumbnail: "/uploads/videos/upi-fraud-cover.jpg",
          category,
          uploaderId: TEST_USER_ID,
          videoUrl: blob.url,
        }),
      });

      const videoData = await videoResponse.json();

      if (!videoResponse.ok || !videoData.success) {
        setMessage(
          videoData.message ||
            "Video uploaded, but database save failed."
        );
        return;
      }

      setVideoUrl(blob.url);
      setMessage("Video uploaded and saved successfully!");

      setTitle("");
      setDescription("");
      setFile(null);
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="h-16 bg-white border-b flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 text-white px-2 py-1 rounded-lg font-bold">
            Y
          </div>

          <h1 className="text-xl font-bold">Your Tube</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto p-6 md:p-10">
        <div className="bg-white rounded-2xl border p-6 md:p-8">
          {/* Heading */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-100 rounded-full">
              <Video className="text-red-600" size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Upload Video
              </h2>

              <p className="text-gray-500">
                Upload your video to Your Tube
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-5">
            <label className="block font-semibold mb-2">
              Video Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block font-semibold mb-2">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe your video"
              rows={4}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Category */}
          <div className="mb-5">
            <label className="block font-semibold mb-2">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
            >
              <option>Technology</option>
              <option>Education</option>
              <option>Gaming</option>
              <option>Music</option>
              <option>Sports</option>
              <option>Travel</option>
              <option>Cooking</option>
              <option>Entertainment</option>
              <option>Fitness</option>
              <option>News</option>
              <option>AI & Machine Learning</option>
              <option>Programming</option>
              <option>Science</option>
              <option>Other</option>
            </select>
          </div>

          {/* File picker */}
          <label className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">
            <Upload
              size={40}
              className="text-gray-500 mb-3"
            />

            <p className="font-semibold">
              {file ? file.name : "Choose a video"}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              MP4, WebM, MOV and other video formats
            </p>

            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const selectedFile =
                  e.target.files?.[0] || null;

                setFile(selectedFile);
                setMessage("");
                setVideoUrl("");
                setUploadProgress(0);
              }}
            />
          </label>

          {/* Selected file */}
          {file && (
            <div className="mt-5 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">
                Selected video
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {file.name}
              </p>

              <p className="text-sm text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">
                  Uploading video...
                </span>

                <span>{uploadProgress}%</span>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full mt-6 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {uploading
              ? `Uploading... ${uploadProgress}%`
              : "Upload Video"}
          </button>

          {/* Message */}
          {message && (
            <div className="mt-5 flex items-center gap-2">
              {videoUrl ? (
                <CheckCircle
                  className="text-green-600"
                  size={20}
                />
              ) : (
                <AlertCircle
                  className="text-red-600"
                  size={20}
                />
              )}

              <p
                className={
                  videoUrl
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {message}
              </p>
            </div>
          )}

          {/* Uploaded video preview */}
          {videoUrl && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">
                Video Preview
              </h3>

              <video
                src={videoUrl}
                controls
                className="w-full rounded-xl bg-black"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}