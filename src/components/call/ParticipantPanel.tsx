"use client";

import {
  Camera,
  CameraOff,
  Hand,
  Mic,
  MicOff,
  Users,
  X,
} from "lucide-react";

export type ParticipantStatus = {
  id: string;
  name: string;
  micOn: boolean;
  cameraOn: boolean;
  isSpeaking?: boolean;
  raisedHand?: boolean;
};

type ParticipantPanelProps = {
  open: boolean;
  onClose: () => void;
  participants: ParticipantStatus[];
};

export default function ParticipantPanel({
  open,
  onClose,
  participants,
}: ParticipantPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="absolute right-4 top-20 bottom-24 z-50 flex w-[340px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />

          <div>
            <h2 className="font-semibold">
              Participants
            </h2>

            <p className="text-xs text-zinc-500">
              {participants.length}{" "}
              {participants.length === 1
                ? "participant"
                : "participants"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close participants"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Participant list */}
      <div className="flex-1 overflow-y-auto p-3">
        {participants.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No participants yet.
          </div>
        ) : (
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`rounded-xl border p-3 transition ${
                  participant.isSpeaking
                    ? "border-green-400/60 bg-green-400/10"
                    : "border-white/10 bg-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {/* Avatar */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold ${
                        participant.isSpeaking
                          ? "bg-green-400 text-black"
                          : "bg-white text-black"
                      }`}
                    >
                      {participant.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* Name */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {participant.name}
                      </p>

                      {participant.isSpeaking && (
                        <p className="text-xs text-green-400">
                          Speaking
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status icons */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    {participant.raisedHand && (
                      <div
                        className="rounded-full bg-yellow-400 p-1.5 text-black"
                        title="Raised hand"
                      >
                        <Hand className="h-4 w-4 fill-current" />
                      </div>
                    )}

                    <div
                      className={`rounded-full p-1.5 ${
                        participant.micOn
                          ? "bg-zinc-800 text-white"
                          : "bg-red-600 text-white"
                      }`}
                      title={
                        participant.micOn
                          ? "Microphone on"
                          : "Microphone muted"
                      }
                    >
                      {participant.micOn ? (
                        <Mic className="h-4 w-4" />
                      ) : (
                        <MicOff className="h-4 w-4" />
                      )}
                    </div>

                    <div
                      className={`rounded-full p-1.5 ${
                        participant.cameraOn
                          ? "bg-zinc-800 text-white"
                          : "bg-red-600 text-white"
                      }`}
                      title={
                        participant.cameraOn
                          ? "Camera on"
                          : "Camera off"
                      }
                    >
                      {participant.cameraOn ? (
                        <Camera className="h-4 w-4" />
                      ) : (
                        <CameraOff className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Raised hand label */}
                {participant.raisedHand && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-400/10 px-3 py-2 text-xs text-yellow-300">
                    <Hand className="h-3.5 w-3.5 fill-current" />
                    Raised hand
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}