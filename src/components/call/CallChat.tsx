"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  id: number;
  name: string;
  message: string;
  time: string;
};

type CallChatProps = {
  open: boolean;
  onClose: () => void;
};

export default function CallChat({ open, onClose }: CallChatProps) {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      name: "You",
      message: "Welcome to the meeting!",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now(),
      name: "You",
      message: trimmedMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      newMessage,
    ]);

    setMessage("");
  };

  if (!open) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 bottom-4 z-50 flex w-[360px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <MessageCircle className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Meeting chat
            </h2>
            <p className="text-xs text-zinc-400">
              Messages during this call
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((item) => (
          <div key={item.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-white">
                {item.name}
              </span>

              <span className="text-[10px] text-zinc-500">
                {item.time}
              </span>
            </div>

            <div className="w-fit max-w-[90%] rounded-xl bg-white/10 px-3 py-2 text-sm leading-relaxed text-zinc-100">
              {item.message}
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-zinc-500">
            No messages yet.
            <br />
            Start the conversation.
          </div>
        )}
      </div>

      {/* Message input */}
      <form
        onSubmit={sendMessage}
        className="border-t border-white/10 p-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />

          <button
            type="submit"
            disabled={!message.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}