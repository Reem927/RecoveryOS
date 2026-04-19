"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  ts: string
}

interface ChatFABProps {
  patientId: string
  patientName: string
  senderRole: "practitioner" | "client"
  assessmentId?: string
}

export function ChatFAB({ patientId, patientName, senderRole, assessmentId }: ChatFABProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Load chat history on open
  useEffect(() => {
    if (!open || messages.length > 0) return
    fetch(`/api/chat/history?clientId=${patientId}`)
      .then((r) => r.json())
      .then((data: Array<{ sender_role: string; content: string; created_at: string }>) => {
        if (Array.isArray(data)) {
          setMessages(
            data.map((m) => ({
              role: m.sender_role === "assistant" ? "assistant" : "user",
              content: m.content,
              ts: m.created_at,
            })),
          )
        }
      })
      .catch(() => {})
  }, [open, patientId, messages.length])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    setLoading(true)

    const optimistic: Message = { role: "user", content: text, ts: new Date().toISOString() }
    setMessages((p) => [...p, optimistic])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: patientId,
          message: text,
          senderRole,
          assessmentId,
        }),
      })
      if (res.ok) {
        const { reply } = await res.json()
        setMessages((p) => [
          ...p,
          { role: "assistant", content: reply, ts: new Date().toISOString() },
        ])
        if (!open) setUnread((u) => u + 1)
      }
    } finally {
      setLoading(false)
    }
  }

  function openChat() {
    setOpen(true)
    setUnread(0)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  return (
    <>
      {/* Drawer */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex w-[340px] flex-col rounded-2xl border border-black/10 bg-white shadow-2xl sm:right-6 sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center gap-3 rounded-t-2xl bg-[#162532] px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C97A56]/20">
              <Bot className="h-4 w-4 text-[#C97A56]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white">Recovery Assistant</p>
              <p className="text-[11px] text-white/40 truncate">{patientName}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-[320px] min-h-[180px] bg-[#FAFAF9]"
          >
            {messages.length === 0 && !loading && (
              <p className="text-center text-[12px] text-[#9CA3AF] pt-6">
                {senderRole === "client"
                  ? "Hi! Ask me anything about your recovery journey."
                  : `Ask me anything about ${patientName}'s recovery.`}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                    m.role === "user"
                      ? "bg-[#C97A56] text-white rounded-br-sm"
                      : "bg-white border border-black/[0.06] text-[#1F2937] rounded-bl-sm shadow-sm",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-black/[0.06] rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 items-end border-t border-black/[0.06] px-3 py-3 bg-white rounded-b-2xl">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                if (e.target.value.length <= 500) setInput(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 resize-none rounded-[10px] border border-black/[0.10] bg-[#F9F9F8] px-3 py-2 text-[13px] text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:border-[#C97A56]/50 focus:ring-1 focus:ring-[#C97A56]/20 max-h-[80px]"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#C97A56] text-white transition-colors hover:bg-[#B86A48] disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={open ? () => setOpen(false) : openChat}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#C97A56] text-white shadow-lg transition-all hover:bg-[#B86A48] hover:scale-105 active:scale-95 sm:right-6"
        aria-label="Open recovery assistant"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <Bot className="h-6 w-6" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
                {unread}
              </span>
            )}
          </>
        )}
      </button>
    </>
  )
}
