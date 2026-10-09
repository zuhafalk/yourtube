"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Video } from "lucide-react";

export default function JoinPage() {
  const [roomId, setRoomId] = useState("");

  function handleJoin(event: FormEvent) {
    event.preventDefault();

    const cleanedRoomId = roomId.trim();

    if (!cleanedRoomId) {
      return;
    }

    window.location.href = `/call?room=${encodeURIComponent(
      cleanedRoomId
    )}`;
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-8">
        <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mx-auto">
          <Video size={28} />
        </div>

        <h1 className="text-2xl font-bold text-center mt-5">
          Join a meeting
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Enter the meeting room ID shared with you.
        </p>

        <form onSubmit={handleJoin} className="mt-8 space-y-4">
          <input
            type="text"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            placeholder="Enter room ID"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"
          />

          <button
            type="submit"
            className="w-full bg-black text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
          >
            Join meeting
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-5">
          Example: abc12345
        </p>
      </div>
    </main>
  );
}