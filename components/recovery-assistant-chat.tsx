"use client"

import { useEffect, useRef, useState } from "react"
import { Send, Bot, User, Stethoscope, Zap, Sun, Moon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface AssessmentSummary {
  practitioner_brief?: string
  primary_focus_area?: string
  recovery_signals?: string[]
  protocol_recommendation?: {
    name: string
    rationale: string
    sun_placement: string
    moon_placement: string
    intensity?: string
  }
  suggested_questions?: string[]
}

export interface RecoveryAssistantChatProps {
  clientId: string
  clientName: string
  senderRole: "practitioner" | "client"
  assessmentId?: string
  sessionId?: string
  assessmentSummary?: AssessmentSummary
  onProtocolSelect?: (protocol: string) => void
}

interface ChatMessage {
  id: string
  sender_role: "practitioner" | "client" | "assistant"
  content: string
  created_at: string
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-cyan-400" />
      </div>
      <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.sender_role === "assistant"
  const isUser = !isAssistant

  return (
    <div className={cn("flex items-end gap-2 mb-4 group", isUser && "flex-row-reverse")}>
      {isAssistant && (
        <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-cyan-400" />
        </div>
      )}
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-violet-400" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] px-4 py-3 text-sm leading-relaxed",
          isAssistant
            ? "bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm"
            : "bg-violet-600/80 text-white rounded-2xl rounded-br-sm",
        )}
      >
        {message.content}
        <span className="block text-[10px] mt-1 opacity-0 group-hover:opacity-50 transition-opacity text-right">
          {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  )
}

export function RecoveryAssistantChat({
  clientId,
  clientName,
  senderRole,
  assessmentId,
  sessionId,
  assessmentSummary,
  onProtocolSelect,
}: RecoveryAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<AssessmentSummary | undefined>(assessmentSummary)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(
    assessmentSummary?.suggested_questions ?? [],
  )
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // On mount: summarize if assessmentId, then load history
  useEffect(() => {
    async function init() {
      if (assessmentId && !assessmentSummary) {
        try {
          const res = await fetch(`/api/assessments/${assessmentId}/summarize`, { method: "POST" })
          if (res.ok) {
            const data = await res.json()
            setSummary(data)
            setSuggestedQuestions(data.suggested_questions ?? [])
          }
        } catch {
          // summarize failed silently — chat still works
        }
      }

      const res = await fetch(`/api/chat/history?clientId=${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, assessmentId])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const optimistic: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      sender_role: senderRole,
      content: text.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          message: text.trim(),
          senderRole,
          assessmentId,
          sessionId,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender_role: "assistant",
          content: data.reply,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMsg])
        if (data.suggestedQuestions?.length) {
          setSuggestedQuestions(data.suggestedQuestions)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const hasContext = Boolean(summary?.practitioner_brief)

  return (
    <div className="flex gap-4 h-[680px]">
      {/* Left panel: Assessment Context (1/3) */}
      <div className="w-1/3 flex flex-col gap-3 overflow-y-auto pr-1">
        {hasContext && summary ? (
          <>
            {/* Recovery Brief */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Recovery Brief
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-zinc-200 leading-relaxed">{summary.practitioner_brief}</p>
              </CardContent>
            </Card>

            {/* Today's Focus */}
            {summary.primary_focus_area && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Today&apos;s Focus
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-sm font-medium text-cyan-300">{summary.primary_focus_area}</p>
                </CardContent>
              </Card>
            )}

            {/* Recovery Signals */}
            {summary.recovery_signals?.length ? (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Recovery Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 flex flex-wrap gap-2">
                  {summary.recovery_signals.map((signal, i) => {
                    const isFlag = signal.toLowerCase().includes("low") ||
                      signal.toLowerCase().includes("restricted") ||
                      signal.toLowerCase().includes("flag") ||
                      signal.toLowerCase().includes("limited")
                    return (
                      <Badge
                        key={i}
                        className={cn(
                          "text-xs",
                          isFlag
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                        )}
                        variant="outline"
                      >
                        {signal}
                      </Badge>
                    )
                  })}
                </CardContent>
              </Card>
            ) : null}

            {/* Protocol Recommendation */}
            {summary.protocol_recommendation && (
              <Card className="bg-zinc-900 border-cyan-500/30 border">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Protocol Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <p className="text-sm font-semibold text-white">
                    {summary.protocol_recommendation.name}
                  </p>
                  <div className="flex gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-400" />
                      {summary.protocol_recommendation.sun_placement}
                    </span>
                    <span className="flex items-center gap-1">
                      <Moon className="w-3 h-3 text-blue-400" />
                      {summary.protocol_recommendation.moon_placement}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {summary.protocol_recommendation.rationale}
                  </p>
                  {onProtocolSelect && (
                    <Button
                      size="sm"
                      className="w-full mt-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
                      onClick={() =>
                        onProtocolSelect(summary.protocol_recommendation!.name)
                      }
                    >
                      Apply Protocol
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                  Suggested Questions
                </p>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(q)
                      textareaRef.current?.focus()
                    }}
                    className="w-full text-left text-xs bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card className="bg-zinc-900 border-zinc-800 h-full">
            <CardContent className="flex flex-col items-center justify-center h-full text-center px-6 py-10 gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-sm font-medium text-zinc-400">No assessment loaded</p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Complete and submit an assessment above to get AI-powered recovery insights,
                protocol recommendations, and personalized context for {clientName}.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right panel: Chat (2/3) */}
      <div className="flex-1 flex flex-col bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recovery Assistant</h3>
            <p className="text-xs text-zinc-400">{clientName}</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              senderRole === "practitioner"
                ? "border-violet-500/40 text-violet-300"
                : "border-cyan-500/40 text-cyan-300",
            )}
          >
            {senderRole === "practitioner" ? "Practitioner View" : "Client View"}
          </Badge>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 pt-4" ref={scrollRef as React.RefObject<HTMLDivElement>}>
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
              <Bot className="w-8 h-8 text-zinc-600" />
              <p className="text-sm text-zinc-500">
                {hasContext
                  ? `Recovery context loaded for ${clientName}. Ask me anything.`
                  : `Load an assessment to get personalized insights, or ask me anything about ${clientName}'s recovery history.`}
              </p>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {loading && <TypingIndicator />}
            </>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t border-zinc-800">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setInput(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(input)
                  }
                }}
                placeholder="Ask about recovery, protocol, or this client..."
                className="resize-none bg-zinc-900 border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-600 min-h-[44px] max-h-[120px] pr-12"
                rows={1}
              />
              <span className="absolute bottom-2 right-2 text-[10px] text-zinc-600">
                {input.length}/500
              </span>
            </div>
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 text-white h-11 w-11 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
