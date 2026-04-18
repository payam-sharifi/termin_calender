"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "./ChatWidget.module.css";

type Role = "user" | "assistant";

export type ChatMessage = {
  role: Role;
  content: string;
  alternatives?: string[];
};

const FALLBACK_REPLY =
  "Something went wrong while contacting the assistant. Please try again in a moment.";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleOpen = useCallback(() => {
    setOpen((o) => {
      const next = !o;
      if (next) setPanelVisible(true);
      return next;
    });
  }, []);

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    } else {
      closeTimerRef.current = setTimeout(() => setPanelVisible(false), 220);
    }
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [open]);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, loading, open, scrollToBottom]);

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = [...messages, userMsg];
    const payload = {
      message: trimmed,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { message?: string; alternatives?: string[] } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: FALLBACK_REPLY },
        ]);
        return;
      }

      if (!res.ok) {
        const text =
          typeof data.message === "string" && data.message.trim()
            ? data.message
            : FALLBACK_REPLY;
        setMessages((prev) => [...prev, { role: "assistant", content: text }]);
        return;
      }

      const reply =
        typeof data.message === "string" && data.message.trim()
          ? data.message
          : FALLBACK_REPLY;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          alternatives: data.alternatives,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: FALLBACK_REPLY },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className={styles.root} aria-live="polite">
      {panelVisible && (
        <div
          className={`${styles.panel} ${open ? styles.panelOpen : styles.panelClosed}`}
          role="dialog"
          aria-modal="false"
          aria-label="Booking assistant chat"
        >
          <header className={styles.header}>
            <h2 className={styles.title}>Booking Assistant</h2>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className={styles.messages}>
            {messages.length === 0 && !loading && (
              <div className={`${styles.row} ${styles.rowBot}`}>
                <div className={`${styles.bubble} ${styles.bubbleBot}`}>
                  Hi! Tell me when you would like an appointment (for example
                  tomorrow at 3 PM), and I will help you book it.
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={`${i}-${m.role}-${m.content.slice(0, 24)}`}
                className={`${styles.row} ${m.role === "user" ? styles.rowUser : styles.rowBot}`}
              >
                <div
                  className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleBot}`}
                >
                  {m.content}
                  {m.role === "assistant" &&
                    m.alternatives &&
                    m.alternatives.length > 0 && (
                      <ul className={styles.alternatives}>
                        {m.alternatives.map((slot) => (
                          <li key={slot}>{slot}</li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.row} ${styles.rowBot}`}>
                <div className={`${styles.bubble} ${styles.bubbleBot}`}>
                  <span className={styles.typing}>Typing…</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className={styles.footer}>
            <div className={styles.form}>
              <textarea
                className={styles.input}
                rows={1}
                placeholder="Type a message…"
                value={input}
                disabled={loading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <button
                type="button"
                className={styles.sendBtn}
                onClick={() => void send()}
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.toggleBtn}
        onClick={toggleOpen}
        aria-expanded={open}
        aria-label={open ? "Close booking chat" : "Open booking chat"}
      >
        <svg
          className={styles.toggleIcon}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
          <path d="M7 9h10v2H7zm0-3h10v2H7z" />
        </svg>
      </button>
    </div>
  );
}
