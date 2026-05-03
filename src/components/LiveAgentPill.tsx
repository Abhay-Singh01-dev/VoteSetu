import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, Mic, MicOff, Glasses } from "lucide-react";
import { useGeminiLive } from "@/hooks/useGeminiLive";

interface LiveAgentPillProps {
  open: boolean;
  onClose: () => void;
}

const LiveAgentPill = ({ open, onClose }: LiveAgentPillProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const inactivityTimeout = useRef<number | null>(null);

  const {
    isConnecting,
    isActive,
    isSpeaking,
    resetInactivity: resetHookInactivity,
  } = useGeminiLive(open, isMuted, {
    systemInstruction:
      "You are a helpful election assistant for India. Talk ONLY about elections. Be natural, concise, and professional like a real live assistant.",
    model: "models/gemini-2.0-flash-exp",
  });

  const resetInactivity = useCallback(() => {
    resetHookInactivity();
    if (inactivityTimeout.current) window.clearTimeout(inactivityTimeout.current);
    if (!isMuted && open) {
      inactivityTimeout.current = window.setTimeout(onClose, 10000);
    }
  }, [isMuted, onClose, open, resetHookInactivity]);

  useEffect(() => {
    resetInactivity();
  }, [open, isMuted, resetInactivity]);

  if (!open && !isActive) return null;

  return (
    <div
      onMouseMove={resetInactivity}
      className={cn(
        "fixed bottom-8 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-4 rounded-full bg-slate-950/95 p-1.5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-2xl border border-white/10 transition-all duration-700 ease-in-out",
        open
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-40 opacity-0 scale-90 pointer-events-none",
      )}
    >
      <div className="flex items-center gap-1 pl-2">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/30 hover:bg-white/10 hover:text-white transition-all"
          aria-label="Close live assistant"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="h-6 w-[1px] bg-white/10 mx-1" />

        {/* Vision Status */}
        <div className="flex items-center gap-2 px-1">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Glasses className={cn("h-4 w-4", !isMuted && "animate-pulse")} />
            <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
          </div>
          <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-widest text-primary/80">
            Vision
          </span>
        </div>
      </div>

      {/* Main Mic Controller - Compact */}
      <div className="relative pr-1">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            "group relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-500",
            isMuted
              ? "bg-white/5 text-white/20"
              : "bg-gradient-to-br from-primary/30 to-primary/10 text-primary shadow-lg",
          )}
          aria-label={
            isMuted ? "Unmute live assistant microphone" : "Mute live assistant microphone"
          }
        >
          {!isMuted && isSpeaking && (
            <div className="absolute inset-0 bg-primary/20 animate-pulse rounded-full" />
          )}

          <div className="relative z-10">
            {isMuted ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6 transition-transform group-hover:scale-110" />
            )}
          </div>

          {!isMuted && (
            <div className="absolute inset-0 border border-primary/30 rounded-full animate-ping opacity-30" />
          )}
        </button>

        {/* Status Dot */}
        <div
          className={cn(
            "absolute -right-0.5 top-0 h-3 w-3 rounded-full border-2 border-slate-950 transition-all duration-500",
            isConnecting
              ? "bg-amber-500 animate-bounce"
              : isMuted
                ? "bg-rose-500"
                : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
          )}
        />
      </div>
    </div>
  );
};

export default LiveAgentPill;
