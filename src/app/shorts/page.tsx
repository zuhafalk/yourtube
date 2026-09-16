"use client";

import Link from "next/link";
import { ArrowLeft, Clapperboard, Play } from "lucide-react";

export default function ShortsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="h-16 bg-white border-b flex items-center px-4 gap-4">
        <Link
          href="/"
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </Link>

        <h1 className="text-xl font-bold">Shorts</h1>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="text-center py-20">
          <Clapperboard
            size={56}
            className="mx-auto text-gray-400"
          />

          <h2 className="text-2xl font-bold mt-5">
            Your Shorts
          </h2>

          <p className="text-gray-500 mt-2">
            Short-form videos will appear here.
          </p>

          <Link
            href="/upload"
            className="inline-flex items-center gap-2 mt-6 bg-red-600 text-white px-5 py-3 rounded-full font-semibold hover:bg-red-700"
          >
            <Play size={18} />
            Upload a video
          </Link>
        </div>
      </main>
    </div>
  );
}