"use client";

import {
  useState, useRef, useEffect, useCallback,
} from "react";
import { X, Send, ChevronDown, Loader2 } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

// ── Quick suggestion chips ─────────────────────────────────────────────────
const QUICK = [
  "Что посоветуешь?",
  "Что взять на двоих?",
  "Что-нибудь острое",
  "Что подешевле?",
];

// ── Greeting ──────────────────────────────────────────────────────────────
const GREETING: Message = {
  id:   "greeting",
  role: "model",
  text: "Привет.\n\nЯ AI-помощник. Помогу подобрать блюдо из нашего меню.",
};

// ── Typing indicator ──────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7, height: 7,
            borderRadius: "50%",
            background: "var(--fg-muted)",
            display: "inline-block",
            animation: "aiDot 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Single message bubble ──────────────────────────────────────────────────
function Bubble({ msg, isLast }: { msg: Message; isLast: boolean }) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      style={{
        animation: "aiMsgIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {/* Avatar — only for AI */}
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-auto mr-2"
          style={{ background: "var(--brand)", flexShrink: 0 }}
        >
          {/* Simple robot emoji icon */}
          <span style={{ fontSize: "16px" }}>🤖</span>
        </div>
      )}

      <div
        className="max-w-[78%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
        style={{
          background:   isUser ? "var(--brand)"   : "var(--bg-section)",
          color:        isUser ? "#fff"            : "var(--fg)",
          borderRadius: isUser
            ? "18px 18px 4px 18px"
            : "18px 18px 18px 4px",
          boxShadow: isUser
            ? "0 2px 12px rgba(249,115,22,0.25)"
            : "0 2px 8px rgba(0,0,0,0.06)",
          border: isUser ? "none" : "1px solid var(--border)",
          wordBreak: "break-word",
        }}
      >
        {msg.text}
      </div>
    </div>
  );
}

// ── Main chat component ────────────────────────────────────────────────────
export default function AiChat() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showQuick, setShowQuick] = useState(true);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setShowQuick(false);
    setInput("");

    const userMsg: Message = {
      id:   `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build history: everything except the greeting
      const history = [...messages.filter((m) => m.id !== "greeting"), userMsg];

      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id:   `m-${Date.now()}`,
          role: "model",
          text: data.reply ?? "Не удалось получить ответ. Попробуйте ещё раз.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id:   `m-err-${Date.now()}`,
          role: "model",
          text: "Ошибка соединения. Проверьте интернет и попробуйте снова.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleReset() {
    setMessages([GREETING]);
    setShowQuick(true);
    setInput("");
  }

  return (
    <>
      {/* ── CSS keyframes injected once ── */}
      <style>{`
        @keyframes aiDot {
          0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
          40%          { transform: scale(1);   opacity: 1; }
        }
        @keyframes aiMsgIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes aiChatOpen {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes aiBtnPulse {
          0%,100% { box-shadow: 0 4px 20px rgba(249,115,22,0.35); }
          50%      { box-shadow: 0 4px 32px rgba(249,115,22,0.55); }
        }
      `}</style>

      {/* ── Floating button ── */}
      {!open && (
        <button
          aria-label="Открыть AI-помощника"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: "var(--brand)",
            boxShadow: "0 4px 20px rgba(249,115,22,0.38)",
            animation: "aiBtnPulse 3s ease-in-out infinite",
          }}
        >
          {/* Chat emoji instead of Bot icon */}
          <span style={{ fontSize: "28px" }}>💬</span>
        </button>
      )}

      {/* ── Chat window ── */}
      {open && (
        <div
          className="fixed z-50 flex flex-col"
          style={{
            /* Desktop: right-bottom popup */
            bottom: "24px",
            right:  "24px",
            width:  "min(420px, calc(100vw - 32px))",
            height: "min(680px, calc(100dvh - 80px))",
            background:   "var(--bg-card)",
            border:       "1.5px solid var(--border)",
            borderRadius: "22px",
            boxShadow:    "0 24px 72px rgba(0,0,0,0.22)",
            animation:    "aiChatOpen 0.35s cubic-bezier(0.22,1,0.36,1) both",
            /* Mobile: almost full screen */
          }}
          // Override for mobile: positioned at bottom, full width
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{
              borderBottom: "1px solid var(--border)",
              background:   "var(--bg-section)",
              borderRadius: "22px 22px 0 0",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "var(--brand)" }}
              >
                {/* Robot emoji for header */}
                <span style={{ fontSize: "20px" }}>🤖</span>
              </div>
              <div>
                <p className="font-black text-sm" style={{ color: "var(--fg)" }}>
                  AI-помощник
                </p>
                <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
                  Помогу выбрать блюдо из нашего меню
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Reset */}
              <button
                onClick={handleReset}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-xs font-bold"
                style={{ color: "var(--fg-muted)" }}
                title="Новый диалог"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ color: "var(--fg-muted)" }}
                title="Закрыть"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Messages list ── */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
            style={{ overscrollBehavior: "contain" }}
          >
            {messages.map((msg, i) => (
              <Bubble key={msg.id} msg={msg} isLast={i === messages.length - 1} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="flex items-center"
                  style={{
                    background:   "var(--bg-section)",
                    border:       "1px solid var(--border)",
                    borderRadius: "18px 18px 18px 4px",
                    minWidth: 56,
                  }}
                >
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Quick chips ── */}
          {showQuick && !loading && messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: "var(--bg-section)",
                    color:      "var(--fg-sub)",
                    border:     "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)";
                    (e.currentTarget as HTMLElement).style.color       = "var(--brand)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.color       = "var(--fg-sub)";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* ── Input ── */}
          <div
            className="px-4 pb-4 pt-2 shrink-0"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div
              className="flex items-end gap-2 px-4 py-2.5 rounded-2xl"
              style={{
                background: "var(--bg-section)",
                border:     "1.5px solid var(--border)",
                transition: "border-color 0.2s",
              }}
              onFocusCapture={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--brand)";
              }}
              onBlurCapture={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Напишите сообщение..."
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent outline-none text-sm resize-none"
                style={{
                  color:       "var(--fg)",
                  lineHeight:  "1.5",
                  maxHeight:   "120px",
                  overflowY:   "auto",
                  minHeight:   "24px",
                }}
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                style={{
                  background: input.trim() && !loading ? "var(--brand)" : "var(--border)",
                }}
                onMouseEnter={(e) => {
                  if (input.trim() && !loading)
                    (e.currentTarget as HTMLElement).style.background = "var(--brand-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    input.trim() && !loading ? "var(--brand)" : "var(--border)";
                }}
              >
                {loading
                  ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  : <Send className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
            <p className="text-center text-[10px] mt-1.5" style={{ color: "var(--fg-muted)" }}>
              Enter — отправить · Shift+Enter — новая строка
            </p>
          </div>
        </div>
      )}

      {/* ── Mobile: full-screen overlay ── */}
      <style>{`
        @media (max-width: 640px) {
          /* Override fixed popup to full-screen on mobile */
          .ai-chat-window {
            bottom: 0 !important;
            right:  0 !important;
            left:   0 !important;
            width:  100vw !important;
            height: 100dvh !important;
            border-radius: 0 !important;
            border: none !important;
          }
        }
      `}</style>
    </>
  );
}
