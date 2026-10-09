"use client";

import {
  Camera,
  CameraOff,
  Copy,
  Hand,
  LogOut,
  Mic,
  MicOff,
  MonitorUp,
  MonitorOff,
  Users,
  Video,
} from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import CallChat from "@/components/call/CallChat";
import CallTimer from "@/components/call/CallTimer";
import CameraSwitchButton from "@/components/call/CameraSwitchButton";
import ParticipantPanel, {
  type ParticipantStatus,
} from "@/components/call/ParticipantPanel";
import SpeakingIndicator from "@/components/call/SpeakingIndicator";

import {
  addParticipant,
  listenForParticipants,
  listenForRoomSignals,
  removeParticipant,
  sendSignal,
  updateParticipantStatus,
  type Participant,
  type SignalMessage,
} from "@/lib/callSignaling";

import {
  addLocalStream,
  closePeerConnection,
  createAnswer,
  createOffer,
  createPeerConnection,
  replaceVideoTrack,
  setRemoteDescription,
} from "@/lib/webrtc";

type RemotePeer = {
  participant: Participant;
  peer: RTCPeerConnection;
  stream: MediaStream;
};

function CallPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomFromUrl = searchParams.get("room");

  const [roomId, setRoomId] = useState(roomFromUrl ?? "");
  const [roomInput, setRoomInput] = useState(roomFromUrl ?? "");
  const [started, setStarted] = useState(false);
  const [joining, setJoining] = useState(false);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [raisedHand, setRaisedHand] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState("");
  const [localParticipantId, setLocalParticipantId] = useState("");
  const [localName, setLocalName] = useState("");

  const [facingMode, setFacingMode] =
    useState<"user" | "environment">("user");

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

  const peersRef = useRef<Map<string, RemotePeer>>(new Map());
  const participantIdRef = useRef("");
  const roomIdRef = useRef(roomId);
  const remoteContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    if (roomFromUrl) {
      setRoomId(roomFromUrl);
      setRoomInput(roomFromUrl);
    }
  }, [roomFromUrl]);

  useEffect(() => {
    const id = crypto.randomUUID();

    participantIdRef.current = id;
    setLocalParticipantId(id);

    setLocalName(
      `Guest-${Math.floor(1000 + Math.random() * 9000)}`
    );
  }, []);

  useEffect(() => {
    if (!started) return;

    let cancelled = false;

    const attachLocalVideo = async () => {
      const video = localVideoRef.current;
      const stream = localStreamRef.current;

      if (!video || !stream) {
        console.warn(
          "Local video element or camera stream is not ready."
        );
        return;
      }

      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;

      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }

      try {
        await video.play();

        if (!cancelled) {
          console.info(
            "Local camera preview started.",
            stream.getVideoTracks().map((track) => ({
              label: track.label,
              enabled: track.enabled,
              readyState: track.readyState,
            }))
          );
        }
      } catch (playError) {
        console.error(
          "Unable to play local camera video:",
          playError
        );
      }
    };

    void attachLocalVideo();

    return () => {
      cancelled = true;
    };
  }, [started]);

  const addRemoteVideo = (
    participantId: string,
    stream: MediaStream
  ) => {
    if (!remoteContainerRef.current) return;

    let video = document.getElementById(
      `remote-video-${participantId}`
    ) as HTMLVideoElement | null;

    if (!video) {
      video = document.createElement("video");
      video.id = `remote-video-${participantId}`;
      video.autoplay = true;
      video.playsInline = true;
      video.controls = false;
      video.className =
        "h-full w-full rounded-2xl bg-zinc-900 object-cover";

      remoteContainerRef.current.appendChild(video);
    }

    video.srcObject = stream;

    void video.play().catch((playError) => {
      console.error(
        "Unable to play remote participant video:",
        playError
      );
    });
  };

  const createConnection = async (
    participant: Participant,
    shouldCreateOffer: boolean
  ) => {
    if (!localStreamRef.current) return;

    if (peersRef.current.has(participant.id)) return;

    const remoteStream = new MediaStream();

    const peer = createPeerConnection(
      (event) => {
        event.streams[0]?.getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });

        addRemoteVideo(participant.id, remoteStream);
      },
      async (candidate) => {
        try {
          await sendSignal({
            roomId: roomIdRef.current,
            senderId: participantIdRef.current,
            receiverId: participant.id,
            type: "ice-candidate",
            payload: candidate.toJSON(),
          });
        } catch (signalError) {
          console.error("ICE candidate error:", signalError);
        }
      }
    );

    addLocalStream(peer, localStreamRef.current);

    peersRef.current.set(participant.id, {
      participant,
      peer,
      stream: remoteStream,
    });

    if (shouldCreateOffer) {
      const offer = await createOffer(peer);

      await sendSignal({
        roomId: roomIdRef.current,
        senderId: participantIdRef.current,
        receiverId: participant.id,
        type: "offer",
        payload: offer,
      });
    }
  };

  const handleSignal = async (signal: SignalMessage) => {
    if (signal.senderId === participantIdRef.current) return;

    if (signal.type === "participant-status") return;

    if (signal.type === "offer") {
      let remotePeer = peersRef.current.get(signal.senderId);

      if (!remotePeer) {
        const remoteStream = new MediaStream();

        const peer = createPeerConnection(
          (event) => {
            event.streams[0]?.getTracks().forEach((track) => {
              remoteStream.addTrack(track);
            });

            addRemoteVideo(signal.senderId, remoteStream);
          },
          async (candidate) => {
            try {
              await sendSignal({
                roomId: roomIdRef.current,
                senderId: participantIdRef.current,
                receiverId: signal.senderId,
                type: "ice-candidate",
                payload: candidate.toJSON(),
              });
            } catch (signalError) {
              console.error("ICE candidate error:", signalError);
            }
          }
        );

        if (localStreamRef.current) {
          addLocalStream(peer, localStreamRef.current);
        }

        remotePeer = {
          participant: {
            id: signal.senderId,
            name: "Participant",
          },
          peer,
          stream: remoteStream,
        };

        peersRef.current.set(signal.senderId, remotePeer);
      }

      await setRemoteDescription(
        remotePeer.peer,
        signal.payload as RTCSessionDescriptionInit
      );

      const answer = await createAnswer(remotePeer.peer);

      await sendSignal({
        roomId: roomIdRef.current,
        senderId: participantIdRef.current,
        receiverId: signal.senderId,
        type: "answer",
        payload: answer,
      });

      return;
    }

    if (signal.type === "answer") {
      const remotePeer = peersRef.current.get(signal.senderId);

      if (!remotePeer) return;

      await setRemoteDescription(
        remotePeer.peer,
        signal.payload as RTCSessionDescriptionInit
      );

      return;
    }

    if (signal.type === "ice-candidate") {
      const remotePeer = peersRef.current.get(signal.senderId);

      if (!remotePeer) return;

      try {
        await remotePeer.peer.addIceCandidate(
          new RTCIceCandidate(
            signal.payload as RTCIceCandidateInit
          )
        );
      } catch (iceError) {
        console.error(
          "Failed to add ICE candidate:",
          iceError
        );
      }
    }
  };

  useEffect(() => {
    if (!started || !roomId) return;

    const unsubscribeSignals = listenForRoomSignals(
      roomId,
      participantIdRef.current,
      (signal) => {
        void handleSignal(signal);
      }
    );

    const unsubscribeParticipants = listenForParticipants(
      roomId,
      (nextParticipants) => {
        setParticipants(nextParticipants);
      }
    );

    return () => {
      unsubscribeSignals();
      unsubscribeParticipants();
    };
  }, [started, roomId]);

  useEffect(() => {
    if (!started || !roomId || !localParticipantId) return;

    const connectParticipants = async () => {
      for (const participant of participants) {
        if (participant.id === localParticipantId) continue;

        if (!peersRef.current.has(participant.id)) {
          await createConnection(
            participant,
            localParticipantId > participant.id
          );
        }
      }
    };

    void connectParticipants();
  }, [
    participants,
    started,
    roomId,
    localParticipantId,
  ]);

  const startCall = async (selectedRoomId: string) => {
    if (!selectedRoomId.trim()) {
      setError("Please enter a meeting ID.");
      return;
    }

    setJoining(true);
    setError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera and microphone are not supported."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: true,
        });

      const cameraTrack =
        stream.getVideoTracks()[0] ?? null;

      const microphoneTrack =
        stream.getAudioTracks()[0] ?? null;

      if (!cameraTrack) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });

        throw new Error("No camera was detected.");
      }

      localStreamRef.current = stream;
      cameraTrackRef.current = cameraTrack;

      cameraTrack.enabled = true;

      if (microphoneTrack) {
        microphoneTrack.enabled = true;
      }

      setMicOn(Boolean(microphoneTrack));
      setCameraOn(true);

      setRoomId(selectedRoomId);
      setRoomInput(selectedRoomId);

      setStarted(true);

      await addParticipant(selectedRoomId, {
        id: participantIdRef.current,
        name: localName,
        micOn: Boolean(microphoneTrack),
        cameraOn: true,
        raisedHand: false,
      });

      router.replace(
        `/call?room=${encodeURIComponent(selectedRoomId)}`
      );
    } catch (mediaError) {
      console.error(
        "Unable to access camera/microphone:",
        mediaError
      );

      localStreamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      localStreamRef.current = null;
      cameraTrackRef.current = null;

      setError(
        "Unable to start the camera. Please allow camera permission and try again."
      );
    } finally {
      setJoining(false);
    }
  };

  const createMeeting = () => {
    const generatedRoomId = crypto
      .randomUUID()
      .slice(0, 8);

    void startCall(generatedRoomId);
  };

  const joinMeeting = () => {
    void startCall(roomInput.trim());
  };

  const toggleMic = () => {
    const stream = localStreamRef.current;

    if (!stream) return;

    const nextState = !micOn;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = nextState;
    });

    setMicOn(nextState);

    void updateParticipantStatus(
      roomIdRef.current,
      participantIdRef.current,
      {
        micOn: nextState,
      }
    );
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;

    if (!stream) return;

    const nextState = !cameraOn;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = nextState;
    });

    setCameraOn(nextState);

    void updateParticipantStatus(
      roomIdRef.current,
      participantIdRef.current,
      {
        cameraOn: nextState,
      }
    );
  };

  const switchCamera = async () => {
    if (!localStreamRef.current) return;

    if (screenSharing) {
      setError(
        "Stop screen sharing before switching the camera."
      );
      return;
    }

    try {
      const devices =
        await navigator.mediaDevices.enumerateDevices();

      const cameras = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (cameras.length < 2) {
        setError(
          "Only one camera is available on this device."
        );
        return;
      }

      const currentCameraId =
        cameraTrackRef.current?.getSettings().deviceId;

      const nextCamera = cameras.find(
        (camera) => camera.deviceId !== currentCameraId
      );

      if (!nextCamera) {
        setError("No other camera is available.");
        return;
      }

      const newStream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: {
              exact: nextCamera.deviceId,
            },
          },
          audio: false,
        });

      const newCameraTrack =
        newStream.getVideoTracks()[0];

      if (!newCameraTrack) {
        newStream.getTracks().forEach((track) => {
          track.stop();
        });

        setError("Unable to access the other camera.");
        return;
      }

      const currentStream = localStreamRef.current;
      const oldCameraTrack = cameraTrackRef.current;

      currentStream.getVideoTracks().forEach((track) => {
        currentStream.removeTrack(track);
      });

      currentStream.addTrack(newCameraTrack);

      cameraTrackRef.current = newCameraTrack;

      for (const remotePeer of peersRef.current.values()) {
        await replaceVideoTrack(
          remotePeer.peer,
          newCameraTrack
        );
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = currentStream;

        try {
          await localVideoRef.current.play();
        } catch (playError) {
          console.error(
            "Camera switch playback error:",
            playError
          );
        }
      }

      oldCameraTrack?.stop();

      setFacingMode(
        facingMode === "user"
          ? "environment"
          : "user"
      );

      setCameraOn(true);
      setError("");

      await updateParticipantStatus(
        roomIdRef.current,
        participantIdRef.current,
        {
          cameraOn: true,
        }
      );
    } catch (cameraError) {
      console.error("Camera switch error:", cameraError);

      setError(
        "Camera switching is not available on this device."
      );
    }
  };

  const toggleRaiseHand = () => {
    const nextState = !raisedHand;

    setRaisedHand(nextState);

    void updateParticipantStatus(
      roomIdRef.current,
      participantIdRef.current,
      {
        raisedHand: nextState,
      }
    );
  };

  const startScreenShare = async () => {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getDisplayMedia
    ) {
      setError(
        "Screen sharing is not supported by this browser."
      );
      return;
    }

    try {
      const screenStream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

      screenStreamRef.current = screenStream;

      const screenTrack =
        screenStream.getVideoTracks()[0];

      if (!screenTrack) {
        screenStream.getTracks().forEach((track) => {
          track.stop();
        });

        setError("No screen-sharing track was created.");
        return;
      }

      for (const remotePeer of peersRef.current.values()) {
        await replaceVideoTrack(
          remotePeer.peer,
          screenTrack
        );
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          screenStream;

        try {
          await localVideoRef.current.play();
        } catch (playError) {
          console.error(
            "Screen share playback error:",
            playError
          );
        }
      }

      setScreenSharing(true);
      setError("");

      screenTrack.onended = () => {
        void stopScreenShare();
      };
    } catch (screenError) {
      console.error(
        "Screen sharing error:",
        screenError
      );

      setError(
        "Screen sharing is not available in this browser or device."
      );
    }
  };

  const stopScreenShare = async () => {
    screenStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    screenStreamRef.current = null;

    const cameraTrack = cameraTrackRef.current;

    if (!cameraTrack) return;

    for (const remotePeer of peersRef.current.values()) {
      await replaceVideoTrack(
        remotePeer.peer,
        cameraTrack
      );
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject =
        localStreamRef.current;

      try {
        await localVideoRef.current.play();
      } catch (playError) {
        console.error(
          "Camera playback error:",
          playError
        );
      }
    }

    setScreenSharing(false);
  };

  const toggleScreenShare = () => {
    if (screenSharing) {
      void stopScreenShare();
    } else {
      void startScreenShare();
    }
  };

  const copyMeetingLink = async () => {
    const link =
      `${window.location.origin}/call?room=${encodeURIComponent(
        roomId
      )}`;

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea =
          document.createElement("textarea");

        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful =
          document.execCommand("copy");

        document.body.removeChild(textArea);

        if (!successful) {
          throw new Error("Copy command failed.");
        }
      }

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (copyError) {
      console.error("Copy failed:", copyError);
      setError(
        "Unable to copy the meeting link. Please copy the link from the browser address bar."
      );
    }
  };

  const leaveCall = () => {
    const currentRoomId = roomIdRef.current;
    const currentParticipantId =
      participantIdRef.current;

    void removeParticipant(
      currentRoomId,
      currentParticipantId
    ).catch((removeError) => {
      console.error(
        "Participant removal error:",
        removeError
      );
    });

    screenStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    screenStreamRef.current = null;

    localStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    localStreamRef.current = null;

    cameraTrackRef.current = null;

    peersRef.current.forEach(({ peer }) => {
      closePeerConnection(peer);
    });

    peersRef.current.clear();

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setStarted(false);
    setMicOn(true);
    setCameraOn(true);
    setScreenSharing(false);
    setRaisedHand(false);
    setCopied(false);
    setFacingMode("user");
    setParticipants([]);
    setShowChat(false);
    setShowParticipants(false);
    setRoomId("");
    setRoomInput("");
    setError("");

    router.replace("/call");
  };

  const participantStatuses: ParticipantStatus[] =
    participants.map((participant) => ({
      id: participant.id,
      name:
        participant.id === localParticipantId
          ? `${participant.name} (You)`
          : participant.name,
      micOn: participant.micOn ?? true,
      cameraOn: participant.cameraOn ?? true,
      isSpeaking: participant.isSpeaking ?? false,
      raisedHand: participant.raisedHand ?? false,
    }));

  if (!started) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-black">
                <Video className="h-8 w-8" />
              </div>

              <h1 className="text-3xl font-bold">
                YourTube Meetings
              </h1>

              <p className="mt-2 text-zinc-400">
                Create a meeting or join an existing meeting.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={createMeeting}
                disabled={joining}
                className="rounded-xl bg-white px-5 py-4 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {joining ? "Starting..." : "Create meeting"}
              </button>

              <button
                type="button"
                onClick={() => {
                  const input =
                    document.getElementById(
                      "meeting-id"
                    ) as HTMLInputElement | null;

                  input?.focus();
                }}
                className="rounded-xl border border-white/20 px-5 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Join meeting
              </button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />

              <span className="text-xs text-zinc-500">
                OR
              </span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            <label
              htmlFor="meeting-id"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Meeting ID
            </label>

            <div className="flex gap-2">
              <input
                id="meeting-id"
                value={roomInput}
                onChange={(event) =>
                  setRoomInput(event.target.value)
                }
                placeholder="Enter meeting ID"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-white/30"
              />

              <button
                type="button"
                onClick={joinMeeting}
                disabled={
                  joining || !roomInput.trim()
                }
                className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/60 px-4 py-3 backdrop-blur-md">
        <div>
          <p className="text-sm font-semibold">
            YourTube Meeting
          </p>

          <p className="text-xs text-zinc-400">
            Room: {roomId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CallTimer active={started} />

          <button
            type="button"
            onClick={copyMeetingLink}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:bg-white/10"
          >
            <Copy className="h-4 w-4" />
            <span>{copied ? "Copied!" : "Copy link"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="absolute left-1/2 top-20 z-50 w-[calc(100%-32px)] max-w-lg -translate-x-1/2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300 backdrop-blur-md">
          {error}

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-3 font-semibold text-white underline"
          >
            Close
          </button>
        </div>
      )}

      <div className="flex min-h-screen flex-col pt-16">
        <div className="relative flex-1 p-4">
          <div
            ref={remoteContainerRef}
            className="grid h-full min-h-[420px] gap-4 sm:grid-cols-2"
          />

          <div className="absolute bottom-8 right-8 h-40 w-56 overflow-hidden rounded-2xl border border-white/20 bg-zinc-900 shadow-2xl sm:h-48 sm:w-64">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              controls={false}
              className="h-full w-full object-cover"
            />

            {!cameraOn && !screenSharing && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <CameraOff className="h-10 w-10 text-zinc-500" />
              </div>
            )}

            <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-xs">
              You
            </div>

            {raisedHand && (
              <div className="absolute right-2 top-2 rounded-lg bg-yellow-400 p-2 text-black">
                <Hand className="h-4 w-4 fill-current" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-white/10 bg-zinc-950 px-3 py-4">
          <button
            type="button"
            onClick={toggleMic}
            className={`rounded-full p-3 transition ${
              micOn
                ? "bg-zinc-800 hover:bg-zinc-700"
                : "bg-red-600 hover:bg-red-500"
            }`}
          >
            {micOn ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            className={`rounded-full p-3 transition ${
              cameraOn
                ? "bg-zinc-800 hover:bg-zinc-700"
                : "bg-red-600 hover:bg-red-500"
            }`}
          >
            {cameraOn ? (
              <Camera className="h-5 w-5" />
            ) : (
              <CameraOff className="h-5 w-5" />
            )}
          </button>

          <CameraSwitchButton
            onSwitch={() => {
              void switchCamera();
            }}
            disabled={screenSharing}
          />

          <button
            type="button"
            onClick={toggleScreenShare}
            className={`rounded-full p-3 transition ${
              screenSharing
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            {screenSharing ? (
              <MonitorOff className="h-5 w-5" />
            ) : (
              <MonitorUp className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleRaiseHand}
            className={`rounded-full p-3 transition ${
              raisedHand
                ? "bg-yellow-400 text-black hover:bg-yellow-300"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            <Hand
              className={`h-5 w-5 ${
                raisedHand ? "fill-current" : ""
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              setShowParticipants((current) => !current)
            }
            className={`rounded-full p-3 transition ${
              showParticipants
                ? "bg-white text-black"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            <Users className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setShowChat((current) => !current)
            }
            className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
              showChat
                ? "bg-white text-black"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            Chat
          </button>

          <button
            type="button"
            onClick={leaveCall}
            className="rounded-full bg-red-600 p-3 transition hover:bg-red-500"
            title="End call"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ParticipantPanel
        open={showParticipants}
        onClose={() => setShowParticipants(false)}
        participants={participantStatuses}
      />

      <CallChat
        open={showChat}
        onClose={() => setShowChat(false)}
      />

      <SpeakingIndicator
        stream={localStreamRef.current}
        roomId={roomId}
        participantId={localParticipantId}
      />
    </main>
  );
}

export default function CallPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
          <div className="text-sm text-zinc-400">
            Loading meeting...
          </div>
        </main>
      }
    >
      <CallPageContent />
    </Suspense>
  );
}