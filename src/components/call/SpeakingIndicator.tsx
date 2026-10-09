"use client";

import { useEffect } from "react";
import { updateParticipantStatus } from "@/lib/callSignaling";

type SpeakingIndicatorProps = {
  stream: MediaStream | null;
  roomId: string;
  participantId: string;
};

export default function SpeakingIndicator({
  stream,
  roomId,
  participantId,
}: SpeakingIndicatorProps) {
  useEffect(() => {
    if (!stream || !roomId || !participantId) {
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const audioTracks = stream.getAudioTracks();

    if (audioTracks.length === 0) {
      return;
    }

    const audioContext = new AudioContextClass();

    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;

    const audioStream = new MediaStream(
      audioTracks
    );

    const source =
      audioContext.createMediaStreamSource(
        audioStream
      );

    source.connect(analyser);

    const dataArray = new Uint8Array(
      analyser.frequencyBinCount
    );

    let animationFrame = 0;
    let lastSpeakingState = false;

    const detectSpeaking = () => {
      analyser.getByteFrequencyData(
        dataArray
      );

      let total = 0;

      for (let i = 0; i < dataArray.length; i++) {
        total += dataArray[i];
      }

      const average =
        total / dataArray.length;

      const speaking = average > 18;

      if (speaking !== lastSpeakingState) {
        lastSpeakingState = speaking;

        void updateParticipantStatus(
          roomId,
          participantId,
          {
            isSpeaking: speaking,
          }
        ).catch((error) => {
          console.error(
            "Speaking status update error:",
            error
          );
        });
      }

      animationFrame =
        requestAnimationFrame(
          detectSpeaking
        );
    };

    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }

    detectSpeaking();

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      void updateParticipantStatus(
        roomId,
        participantId,
        {
          isSpeaking: false,
        }
      ).catch(() => {});

      source.disconnect();
      analyser.disconnect();

      void audioContext.close();
    };
  }, [
    stream,
    roomId,
    participantId,
  ]);

  return null;
}