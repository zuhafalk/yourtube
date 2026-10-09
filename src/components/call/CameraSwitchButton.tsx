"use client";

import { Camera } from "lucide-react";

type CameraSwitchButtonProps = {
  onSwitch: () => void;
  disabled?: boolean;
};

export default function CameraSwitchButton({
  onSwitch,
  disabled = false,
}: CameraSwitchButtonProps) {
  return (
    <button
      type="button"
      onClick={onSwitch}
      disabled={disabled}
      className="rounded-full bg-zinc-800 p-3 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
      title="Switch camera"
      aria-label="Switch camera"
    >
      <Camera className="h-5 w-5" />
    </button>
  );
}