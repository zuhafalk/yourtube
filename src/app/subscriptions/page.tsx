"use client";

import Link from "next/link";
import { ArrowLeft, Tv } from "lucide-react";

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="h-16 bg-white border-b flex items-center px-4 gap-4">
        <Link
          href="/"
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </Link>

        <h1 className="text-xl font-bold">Subscriptions</h1>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="text-center py-20">
          <Tv
            size={56}
            className="mx-auto text-gray-400"
          />

          <h2 className="text-2xl font-bold mt-5">
            Your Subscriptions
          </h2>

          <p className="text-gray-500 mt-2">
            Videos from channels you subscribe to will appear
            here.
          </p>

          <Link
            href="/"
            className="inline-block mt-6 bg-black text-white px-5 py-3 rounded-full font-semibold"
          >
            Explore videos
          </Link>
        </div>
      </main>
    </div>
  );
}