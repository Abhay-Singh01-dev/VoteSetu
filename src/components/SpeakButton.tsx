import { useState, useEffect, useCallback } from "react";
import { Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpeakButtonProps {
  text: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const SpeakButton = ({ text, className, variant = "ghost", size = "icon" }: SpeakButtonProps) => {
  const [isSupported, setIsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    // Cleanup if unmounted while speaking
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggle = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any previous
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Choose a friendly and slow-ish voice if available, otherwise default
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [text, isSpeaking]);

  if (!isSupported) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={cn(
        "rounded-full transition-all duration-300",
        isSpeaking && "bg-primary/20 text-primary animate-pulse scale-110",
        className,
      )}
      aria-label={isSpeaking ? "Stop speaking" : "Listen"}
      title={isSpeaking ? "Stop speaking" : "Listen"}
    >
      {isSpeaking ? (
        <Square className="h-4 w-4" aria-hidden />
      ) : (
        <Volume2 className="h-4 w-4" aria-hidden />
      )}
      <span className="sr-only">{isSpeaking ? "Stop speaking" : "Listen text"}</span>
    </Button>
  );
};

export default SpeakButton;
