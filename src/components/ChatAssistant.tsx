import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, Sparkles, Mic, Loader2, Volume2, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildPersonalisedGreeting, type CitationSource } from "@/lib/assistant";
import { useT } from "@/i18n/LanguageProvider";
import { getLocalizedSuggestedQuestions } from "@/i18n/content";
import SourceList from "@/components/SourceList";
import { useUser } from "@/context/UserContext";
import { getNextStep } from "@/lib/nextStep";
import { isElectionQuery } from "@/lib/voiceProcessor";
import LiveAgentPill from "./LiveAgentPill";
import SpeakButton from "./SpeakButton";

type Msg = { role: "user" | "assistant"; content: string; sources?: CitationSource[] };
type VoiceState = "idle" | "listening" | "processing" | "speaking";

interface ChatAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  liveAgentOpen: boolean;
  onLiveAgentOpenChange: (open: boolean) => void;
}

interface ISpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: () => void;
  onresult: (event: ISpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): ISpeechRecognition };
    webkitSpeechRecognition: { new (): ISpeechRecognition };
    SpeechSynthesisUtterance: { new (text?: string): SpeechSynthesisUtterance };
  }
}

function renderContent(text: string) {
  if (!text) return null;

  // Handle case where text might be raw JSON (from old backend or error)
  let cleanText = text;
  if (text.trim().startsWith('{"reply":')) {
    try {
      const parsed = JSON.parse(text);
      cleanText = parsed.reply || text;
    } catch {
      // If backend returns malformed JSON-like text, render raw text safely.
    }
  }

  const renderInlineMarkdown = (input: string) => {
    const parts = input.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={index} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const lines = cleanText.split("\n");
  return lines.map((line, i) => {
    // Basic Markdown patterns
    const isHeader = line.startsWith("### ");
    const isSubHeader = line.startsWith("## ");
    const isMainHeader = line.startsWith("# ");
    const isBullet = /^\s*[*\-•]\s+/.test(line);
    const isNumbered = /^\s*\d+\.\s+/.test(line);

    const content = line
      .replace(/^### /, "")
      .replace(/^## /, "")
      .replace(/^# /, "")
      .replace(/^[*\-•]\s+/, "")
      .replace(/^\d+\.\s+/, "");

    return (
      <div
        key={i}
        className={cn(
          "text-sm leading-relaxed",
          (isHeader || isSubHeader || isMainHeader) && "mt-3 mb-1 font-bold text-foreground",
          isMainHeader && "text-lg",
          isSubHeader && "text-base",
          (isBullet || isNumbered) && "relative pl-5",
          line.trim() === "" && "h-2",
        )}
      >
        {(isBullet || isNumbered) && (
          <span className="absolute left-1 top-0 text-primary/60">
            {isBullet ? "•" : line.match(/^\s*(\d+)\./)?.[1] + "."}
          </span>
        )}
        <span>{renderInlineMarkdown(content)}</span>
      </div>
    );
  });
}

const ChatAssistant = ({
  open,
  onOpenChange,
  liveAgentOpen,
  onLiveAgentOpenChange,
}: ChatAssistantProps) => {
  const { t, lang } = useT();
  const { user, setUser } = useUser();
  const suggestedQuestions = useMemo(() => getLocalizedSuggestedQuestions(lang), [lang]);
  const nextStep = useMemo(() => getNextStep(user), [user]);

  const personalisedGreeting = useMemo<Msg>(
    () => ({
      role: "assistant",
      content: buildPersonalisedGreeting(user, nextStep, t("chat.greeting")),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user.age, user.isRegistered, user.hasEpic, user.completedSteps.length, nextStep.id, t],
  );

  type ConvoState = "idle" | "awaiting_age_confirm" | "awaiting_reg_confirm";
  const [convoState, setConvoState] = useState<ConvoState>("idle");
  const [messages, setMessages] = useState<Msg[]>([personalisedGreeting]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Gemini Live state
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const isSupported = useRef(
    typeof window !== "undefined" &&
      (!!window.SpeechRecognition || !!window.webkitSpeechRecognition),
  );

  useEffect(() => {
    if (open) {
      setUser({ currentScreen: "chat" });
    } else {
      stopLiveMode();
    }
  }, [open, setUser]);

  // Refresh greeting
  useEffect(() => {
    setMessages((m) => (m.length <= 1 ? [personalisedGreeting] : m));
  }, [personalisedGreeting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open, voiceState]);

  // Init synthesis
  useEffect(() => {
    synthesisRef.current = window.speechSynthesis;
    return () => {
      stopLiveMode();
    };
  }, []);

  const resetSilenceTimeout = () => {
    if (silenceTimeoutRef.current) window.clearTimeout(silenceTimeoutRef.current);
  };

  const processMessage = async (text: string): Promise<Msg> => {
    if (!isElectionQuery(text)) {
      return { role: "assistant", content: "I can only help with voting and elections." };
    }

    const qLower = text.toLowerCase();

    if (convoState === "awaiting_age_confirm") {
      if (["yes", "yeah", "yup", "18"].some((w) => qLower.includes(w))) {
        setUser({ age: 18 });
        setConvoState("awaiting_reg_confirm");
        return { role: "assistant", content: "Awesome! Do you already have a Voter ID card?" };
      } else {
        setUser({ age: 17 });
        setConvoState("idle");
        return {
          role: "assistant",
          content: "You need to be 18 to vote. Do not worry, your time will come!",
        };
      }
    } else if (convoState === "awaiting_reg_confirm") {
      if (["yes", "yeah", "yup", "i have", "i am"].some((w) => qLower.includes(w))) {
        setUser({ isRegistered: true, hasEpic: true });
        setConvoState("idle");
        return {
          role: "assistant",
          content: "Perfect! All you need to do now is find out where to vote.",
        };
      } else {
        setUser({ isRegistered: false });
        setConvoState("idle");
        return {
          role: "assistant",
          content: "No problem! Let us get you registered online. You just need to fill Form 6.",
        };
      }
    } else {
      if (
        (qLower.includes("want to vote") ||
          qLower.includes("how to vote") ||
          qLower.includes("can i vote")) &&
        user.age === undefined
      ) {
        setConvoState("awaiting_age_confirm");
        return {
          role: "assistant",
          content: "I would love to help! Tell me, are you 18 or older?",
        };
      }
      return { role: "assistant", content: "" }; // Will be handled by streaming
    }
  };

  const streamMessage = async (text: string) => {
    // Add an empty assistant message that we will populate
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    setTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error("Failed to connect to assistant");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let displayedContent = "";

      const updateInterval = 40; // ms per word approx

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
        }
      }

      // Smooth word-by-word display
      const words = fullContent.split(" ");
      for (let i = 0; i < words.length; i++) {
        displayedContent += (i === 0 ? "" : " ") + words[i];
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = displayedContent;
          return newMessages;
        });
        await new Promise((r) => setTimeout(r, updateInterval));
      }

      setTyping(false);
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content =
          "Sorry, I'm having trouble connecting to my brain right now. Please try again.";
        return newMessages;
      });
      setTyping(false);
    }
  };

  const speak = (text: string) => {
    if (!synthesisRef.current || !window.SpeechSynthesisUtterance) return;
    synthesisRef.current.cancel();

    const cleanText = text.replace(/\*\*/g, "");
    const utterance = new window.SpeechSynthesisUtterance(cleanText);

    utterance.onstart = () => setVoiceState("speaking");
    utterance.onend = () => {
      setVoiceState("idle");
    };
    utterance.onerror = () => setVoiceState("idle");
    synthesisRef.current.speak(utterance);
  };

  const stopLiveMode = () => {
    setVoiceState("idle");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        /* ignore */
      }
    }
    if (synthesisRef.current) synthesisRef.current.cancel();
    if (silenceTimeoutRef.current) window.clearTimeout(silenceTimeoutRef.current);
  };

  const handleLiveQuery = async (text: string) => {
    if (synthesisRef.current) synthesisRef.current.cancel();
    resetSilenceTimeout();
    setMessages((m) => [...m, { role: "user", content: text }]);
    setVoiceState("processing");

    if (!isElectionQuery(text)) {
      const reply = {
        role: "assistant" as const,
        content: "I can only help with voting and elections.",
      };
      setMessages((m) => [...m, reply]);
      speak(reply.content);
      return;
    }

    // Check for flow state messages (age/reg confirm)
    if (convoState !== "idle" || (text.toLowerCase().includes("vote") && user.age === undefined)) {
      const reply = await processMessage(text);
      setMessages((m) => [...m, reply]);
      speak(reply.content);
      return;
    }

    await streamMessage(text);
  };

  const startRecognition = () => {
    if (!isSupported.current) return;

    if (!recognitionRef.current) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionClass();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-IN";
    }

    const recognition = recognitionRef.current;

    recognition.onstart = () => {
      setVoiceState("listening");
      resetSilenceTimeout();
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      if (!event.results || !event.results[0]) return;

      let finalTranscript = "";
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setInput((prev) => (prev ? prev + " " + finalTranscript : finalTranscript));
      }
    };

    recognition.onerror = (event: { error: string }) => {
      console.error("Speech recognition error:", event.error);
      setVoiceState("idle");
    };

    recognition.onend = () => {
      setVoiceState("idle");
    };

    try {
      recognition.start();
    } catch (e) {
      // Ignored if already started
    }
  };

  const send = async (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");

    if (!isElectionQuery(q)) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I can only help with voting and elections." },
      ]);
      return;
    }

    // Check for flow state messages
    if (convoState !== "idle" || (q.toLowerCase().includes("vote") && user.age === undefined)) {
      setTyping(true);
      const reply = await processMessage(q);
      setMessages((m) => [...m, reply]);
      setTyping(false);
      return;
    }

    await streamMessage(q);
  };

  return (
    <>
      <button
        aria-label={open ? t("chat.closeLabel") : t("chat.openLabel")}
        onClick={() => onOpenChange(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 animate-pulse-glow items-center justify-center rounded-full bg-gradient-hero text-primary-foreground shadow-elegant transition-bounce hover:scale-110"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <div
        className={cn(
          "fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-md origin-bottom-right transition-bounce sm:right-6",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="flex h-[min(640px,80vh)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
          {/* Header */}
          <div className="relative bg-gradient-hero p-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{t("chat.title")}</h3>
                  <p className="text-xs text-primary-foreground/80">{t("chat.subtitle")}</p>
                </div>
              </div>
            </div>
            <div
              className="tricolor-bar mt-3 opacity-80"
              style={{
                background: "linear-gradient(90deg, #fff, hsl(var(--india-green)), #fff)",
              }}
            />
          </div>

          {/* Message list */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-secondary/30 p-4 relative"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex animate-fade-in-up",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] space-y-1 rounded-2xl px-4 py-3 shadow-soft",
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-card text-foreground",
                  )}
                >
                  {m.role === "user" ? (
                    <p className="text-sm leading-relaxed">{m.content}</p>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-1">{renderContent(m.content)}</div>
                        <SpeakButton text={m.content} className="-mt-1 -mr-2" />
                      </div>
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-3 border-t border-border/60 pt-2">
                          <SourceList
                            sources={m.sources}
                            className="mt-0"
                            citationFor={m.content.slice(0, 80)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Live mode states */}
            {voiceState === "listening" && (
              <div className="sticky bottom-0 flex justify-center pb-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="rounded-full bg-primary/10 border border-primary/20 px-4 py-2 flex items-center gap-2 backdrop-blur shadow-soft">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-medium text-primary">
                    Listening to your question
                  </span>
                </div>
              </div>
            )}

            {voiceState === "speaking" && (
              <div className="sticky bottom-0 flex justify-center pb-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="rounded-full bg-accent/10 border border-accent/20 px-4 py-2 flex items-center gap-2 backdrop-blur shadow-soft">
                  <Volume2 className="h-4 w-4 text-accent animate-pulse" />
                  <span className="text-xs font-medium text-accent">Speaking the answer</span>
                </div>
              </div>
            )}

            {/* Typing / Processing indicator */}
            {(typing || voiceState === "processing") && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-card px-4 py-3 shadow-soft">
                  <div className="flex gap-1">
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Suggested questions */}
            {messages.length === 1 && (
              <div className="pt-2">
                <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("chat.quickQuestions")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition-smooth hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-border bg-card p-3"
          >
            <div className="relative flex-1 flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("chat.placeholder")}
                aria-label={t("chat.placeholder")}
                className="pr-10"
              />
              {!input.trim() && (
                <button
                  type="button"
                  onClick={() => onLiveAgentOpenChange(true)}
                  className="absolute right-2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95 group"
                  title="Gemini Live"
                >
                  <Sparkles className="h-2.5 w-2.5 transition-transform group-hover:rotate-12" />
                  Gemini Live
                </button>
              )}
            </div>

            {input.trim() && (
              <Button
                type="submit"
                size="icon"
                disabled={typing}
                className="shrink-0 animate-in fade-in zoom-in duration-300"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default React.memo(ChatAssistant);
