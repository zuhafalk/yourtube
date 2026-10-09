"use client";

import { useEffect, useState } from "react";

type CallTimerProps = {
  active: boolean;
};

export default function CallTimer({ active }: CallTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime =
    `${hours.toString().padStart(2, "0")}:` +
    `${minutes.toString().padStart(2, "0")}:` +
    `${remainingSeconds.toString().padStart(2, "0")}`;

  if (!active) {
    return null;
  }

  return (
    <div className="absolute top-5 right-5 bg-black/70 px-4 py-2 rounded-lg text-sm font-medium">
      {formattedTime}
    </div>
  );
}