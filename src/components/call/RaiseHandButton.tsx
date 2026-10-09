"use client";

import { Hand } from "lucide-react";

type RaiseHandButtonProps = {
  raised: boolean;
  onToggle: () => void;
};

export default function RaiseHandButton({
  raised,
  onToggle,
}: RaiseHandButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full p-3 transition ${
        raised
          ? "bg-yellow-400 text-black hover:bg-yellow-300"
          : "bg-zinc-800 text-white hover:bg-zinc-700"
      }`}
      title={
        raised
          ? "Lower hand"
          : "Raise hand"
      }
      aria-label={
        raised
          ? "Lower hand"
          : "Raise hand"
      }
    >
      <Hand
        className={`h-5 w-5 ${
          raised ? "fill-current" : ""
        }`}
      />
    </button>
  );
}