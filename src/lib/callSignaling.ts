import {
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,

  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export const firestore =
  getFirestore(firebaseApp);

export type SignalType =
  | "offer"
  | "answer"
  | "ice-candidate"
  | "participant-status";

export type ParticipantStatus = {
  micOn?: boolean;
  cameraOn?: boolean;
  raisedHand?: boolean;
  isSpeaking?: boolean;
};

export type SignalMessage = {
  id?: string;

  roomId: string;

  senderId: string;

  receiverId?: string;

  type: SignalType;

  payload:
    | RTCSessionDescriptionInit
    | RTCIceCandidateInit
    | ParticipantStatus;

  createdAt?: unknown;
};

export type Participant = {
  id: string;

  name: string;

  joinedAt?: unknown;

  micOn?: boolean;

  cameraOn?: boolean;

  raisedHand?: boolean;

  isSpeaking?: boolean;
};

type FirestoreData = {
  [key: string]: unknown;
};

const signalsCollection = collection(
  firestore,
  "callSignals"
);

const participantsCollection = collection(
  firestore,
  "callParticipants"
);

function getParticipantFromData(
  data: FirestoreData
): Participant {
  return {
    id: String(
      data.participantId ?? ""
    ),

    name: String(
      data.name ?? "Participant"
    ),

    joinedAt: data.joinedAt,

    micOn:
      data.micOn !== false,

    cameraOn:
      data.cameraOn !== false,

    raisedHand:
      data.raisedHand === true,

    isSpeaking:
      data.isSpeaking === true,
  };
}

export async function sendSignal(
  message: SignalMessage
): Promise<void> {
  await addDoc(
    signalsCollection,
    {
      roomId: message.roomId,

      senderId: message.senderId,

      receiverId:
        message.receiverId ?? null,

      type: message.type,

      payload: message.payload,

      createdAt:
        serverTimestamp(),
    }
  );
}

export function listenForSignals(
  roomId: string,

  receiverId: string,

  callback: (
    message: SignalMessage
  ) => void
): Unsubscribe {
  const signalsQuery = query(
    signalsCollection,

    where(
      "roomId",
      "==",
      roomId
    ),

    where(
      "receiverId",
      "==",
      receiverId
    )
  );

  return onSnapshot(
    signalsQuery,
    (snapshot) => {
      snapshot.docChanges().forEach(
        (change) => {
          if (
            change.type !== "added"
          ) {
            return;
          }

          const data =
            change.doc.data() as FirestoreData;

          callback({
            id: change.doc.id,

            roomId: String(
              data.roomId ?? ""
            ),

            senderId: String(
              data.senderId ?? ""
            ),

            receiverId:
              data.receiverId != null
                ? String(
                    data.receiverId
                  )
                : undefined,

            type:
              data.type as SignalType,

            payload:
              data.payload as SignalMessage["payload"],

            createdAt:
              data.createdAt,
          });
        }
      );
    }
  );
}

export function listenForRoomSignals(
  roomId: string,

  senderId: string,

  callback: (
    message: SignalMessage
  ) => void
): Unsubscribe {
  const signalsQuery = query(
    signalsCollection,

    where(
      "roomId",
      "==",
      roomId
    )
  );

  return onSnapshot(
    signalsQuery,
    (snapshot) => {
      snapshot.docChanges().forEach(
        (change) => {
          if (
            change.type !== "added"
          ) {
            return;
          }

          const data =
            change.doc.data() as FirestoreData;

          if (
            String(
              data.senderId ?? ""
            ) === senderId
          ) {
            return;
          }

          callback({
            id: change.doc.id,

            roomId: String(
              data.roomId ?? ""
            ),

            senderId: String(
              data.senderId ?? ""
            ),

            receiverId:
              data.receiverId != null
                ? String(
                    data.receiverId
                  )
                : undefined,

            type:
              data.type as SignalType,

            payload:
              data.payload as SignalMessage["payload"],

            createdAt:
              data.createdAt,
          });
        }
      );
    }
  );
}

export async function addParticipant(
  roomId: string,

  participant: Participant
): Promise<void> {
  const participantRef = doc(
    participantsCollection,

    `${roomId}_${participant.id}`
  );

  await setDoc(
    participantRef,
    {
      roomId,

      participantId:
        participant.id,

      name:
        participant.name,

      micOn:
        participant.micOn ?? true,

      cameraOn:
        participant.cameraOn ?? true,

      raisedHand:
        participant.raisedHand ?? false,

      isSpeaking:
        participant.isSpeaking ?? false,

      joinedAt:
        serverTimestamp(),
    }
  );
}

export async function updateParticipantStatus(
  roomId: string,

  participantId: string,

  status: ParticipantStatus
): Promise<void> {
  const participantRef = doc(
    participantsCollection,

    `${roomId}_${participantId}`
  );

  await setDoc(
    participantRef,

    {
      ...status,
    },

    {
      merge: true,
    }
  );
}

export async function removeParticipant(
  roomId: string,

  participantId: string
): Promise<void> {
  const participantRef = doc(
    participantsCollection,

    `${roomId}_${participantId}`
  );

  await deleteDoc(
    participantRef
  );
}

export function listenForParticipants(
  roomId: string,

  callback: (
    participants: Participant[]
  ) => void
): Unsubscribe {
  const participantsQuery = query(
    participantsCollection,

    where(
      "roomId",
      "==",
      roomId
    )
  );

  return onSnapshot(
    participantsQuery,
    (snapshot) => {
      const participants =
        snapshot.docs.map(
          (item) => {
            const data =
              item.data() as FirestoreData;

            return getParticipantFromData(
              data
            );
          }
        );

      callback(
        participants
      );
    }
  );
}

export async function getRoomParticipants(
  roomId: string
): Promise<Participant[]> {
  const participantsQuery = query(
    participantsCollection,

    where(
      "roomId",
      "==",
      roomId
    )
  );

  const snapshot =
    await getDocs(
      participantsQuery
    );

  return snapshot.docs.map(
    (item) => {
      const data =
        item.data() as FirestoreData;

      return getParticipantFromData(
        data
      );
    }
  );
}

export async function clearParticipantSignals(
  roomId: string,

  participantId: string
): Promise<void> {
  const signalsQuery = query(
    signalsCollection,

    where(
      "roomId",
      "==",
      roomId
    ),

    where(
      "senderId",
      "==",
      participantId
    )
  );

  const snapshot =
    await getDocs(
      signalsQuery
    );

  await Promise.all(
    snapshot.docs.map(
      (item) =>
        deleteDoc(
          doc(
            signalsCollection,
            item.id
          )
        )
    )
  );
}