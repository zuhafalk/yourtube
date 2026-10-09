export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun1.l.google.com:19302",
    },
  ],
};

export function createPeerConnection(
  onTrack: (event: RTCTrackEvent) => void,
  onIceCandidate?: (candidate: RTCIceCandidate) => void,
  onConnectionStateChange?: (
    state: RTCPeerConnectionState
  ) => void
): RTCPeerConnection {
  const peer = new RTCPeerConnection(ICE_SERVERS);

  peer.ontrack = onTrack;

  peer.onicecandidate = (event) => {
    if (event.candidate && onIceCandidate) {
      onIceCandidate(event.candidate);
    }
  };

  peer.onconnectionstatechange = () => {
    onConnectionStateChange?.(peer.connectionState);
  };

  return peer;
}

export async function createOffer(
  peer: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> {
  const offer = await peer.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });

  await peer.setLocalDescription(offer);

  return offer;
}

export async function createAnswer(
  peer: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> {
  const answer = await peer.createAnswer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });

  await peer.setLocalDescription(answer);

  return answer;
}

export async function setRemoteDescription(
  peer: RTCPeerConnection,
  description: RTCSessionDescriptionInit
): Promise<void> {
  await peer.setRemoteDescription(
    new RTCSessionDescription(description)
  );
}

export async function addIceCandidate(
  peer: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> {
  await peer.addIceCandidate(
    new RTCIceCandidate(candidate)
  );
}

export function addLocalStream(
  peer: RTCPeerConnection,
  stream: MediaStream
): void {
  const existingSenderTracks = new Set(
    peer
      .getSenders()
      .map((sender) => sender.track)
      .filter(Boolean)
  );

  stream.getTracks().forEach((track) => {
    if (!existingSenderTracks.has(track)) {
      peer.addTrack(track, stream);
    }
  });
}

export async function replaceVideoTrack(
  peer: RTCPeerConnection,
  track: MediaStreamTrack
): Promise<void> {
  const sender = peer
    .getSenders()
    .find(
      (item) =>
        item.track?.kind === "video"
    );

  if (sender) {
    await sender.replaceTrack(track);
  }
}

export async function replaceAudioTrack(
  peer: RTCPeerConnection,
  track: MediaStreamTrack
): Promise<void> {
  const sender = peer
    .getSenders()
    .find(
      (item) =>
        item.track?.kind === "audio"
    );

  if (sender) {
    await sender.replaceTrack(track);
  }
}

export function closePeerConnection(
  peer: RTCPeerConnection | null
): void {
  if (!peer) {
    return;
  }

  peer.getSenders().forEach((sender) => {
    sender.track?.stop();
  });

  peer.getReceivers().forEach((receiver) => {
    receiver.track?.stop();
  });

  peer.close();
}