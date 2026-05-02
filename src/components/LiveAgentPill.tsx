import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, Mic, MicOff, Glasses, Loader2, Sparkles } from "lucide-react";

interface LiveAgentPillProps {
  open: boolean;
  onClose: () => void;
}

const LiveAgentPill = ({ open, onClose }: LiveAgentPillProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inactivityTimeout = useRef<number | null>(null);

  const resetInactivity = useCallback(() => {
    if (inactivityTimeout.current) window.clearTimeout(inactivityTimeout.current);
    if (!isMuted && open) {
      inactivityTimeout.current = window.setTimeout(onClose, 10000);
    }
  }, [isMuted, onClose, open]);

  const playOutputAudio = useCallback((base64: string) => {
    return new Promise<void>((resolve) => {
      if (!audioContextRef.current) return resolve();
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768;
      const buffer = audioContextRef.current.createBuffer(1, float32.length, 16000);
      buffer.getChannelData(0).set(float32);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => resolve();
      source.start();
    });
  }, []);

  const sendVisionFrame = useCallback(() => {
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!video) return;
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.3).split(",")[1];
    wsRef.current?.send(JSON.stringify({
      realtime_input: { media_chunks: [{ mime_type: "image/jpeg", data: base64 }] }
    }));
  }, []);

  const startMediaCapture = useCallback(async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (!videoRef.current) videoRef.current = document.createElement("video");
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play();

      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);

      processorRef.current.onaudioprocess = (e) => {
        if (isMuted) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
        }
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
          wsRef.current.send(JSON.stringify({
            realtime_input: { media_chunks: [{ mime_type: "audio/pcm;rate=16000", data: base64 }] }
          }));
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      const visionInterval = window.setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN && videoRef.current) {
          sendVisionFrame();
        } else {
          window.clearInterval(visionInterval);
        }
      }, 3000);
    } catch (e) {
      console.error(e);
    }
  }, [isMuted, sendVisionFrame]);

  const startLiveSession = useCallback(async () => {
    setIsConnecting(true);
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      wsRef.current = new WebSocket(`${protocol}//${host}/ws/multimodal-live`);

      wsRef.current.onopen = () => {
        setIsConnecting(false);
        // Correct snake_case for the Bidi API
        wsRef.current?.send(JSON.stringify({
          setup: {
            model: "models/gemini-2.5-flash",
            generation_config: { 
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: { prebuilt_voice_config: { voice_name: "Aoede" } }
              }
            },
            system_instruction: {
               parts: [{ text: "You are a helpful election assistant for India. Talk ONLY about elections. Be natural, concise, and professional like a real live assistant." }]
            }
          }
        }));
        startMediaCapture();
      };

      wsRef.current.onmessage = async (event) => {
        resetInactivity();
        const data = JSON.parse(event.data);
        // Handle server_content (snake_case)
        const serverContent = data.server_content || data.serverContent;
        if (serverContent?.model_turn?.parts?.[0]?.inline_data || serverContent?.modelTurn?.parts?.[0]?.inlineData) {
          setIsSpeaking(true);
          const part = (serverContent.model_turn || serverContent.modelTurn).parts[0];
          const base64Audio = (part.inline_data || part.inlineData).data;
          await playOutputAudio(base64Audio);
          setIsSpeaking(false);
        }
      };
    } catch (e) {
      console.error("Session error:", e);
      setIsConnecting(false);
    }
  }, [playOutputAudio, resetInactivity, startMediaCapture]);

  const stopLiveSession = useCallback(() => {
    wsRef.current?.close();
    processorRef.current?.disconnect();
    void audioContextRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (inactivityTimeout.current) window.clearTimeout(inactivityTimeout.current);
  }, []);

  useEffect(() => {
    if (open) {
      setIsActive(true);
      void startLiveSession();
      resetInactivity();
    } else {
      setIsActive(false);
      stopLiveSession();
    }
    return () => stopLiveSession();
  }, [open, resetInactivity, startLiveSession, stopLiveSession]);

  if (!open && !isActive) return null;

  return (
    <div
      onMouseMove={resetInactivity}
      className={cn(
        "fixed bottom-8 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-4 rounded-full bg-slate-950/95 p-1.5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-2xl border border-white/10 transition-all duration-700 ease-in-out",
        open ? "translate-y-0 opacity-100 scale-100" : "translate-y-40 opacity-0 scale-90 pointer-events-none"
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
          <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-widest text-primary/80">Vision</span>
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
              : "bg-gradient-to-br from-primary/30 to-primary/10 text-primary shadow-lg"
          )}
          aria-label={isMuted ? "Unmute live assistant microphone" : "Mute live assistant microphone"}
        >
          {!isMuted && isSpeaking && (
            <div className="absolute inset-0 bg-primary/20 animate-pulse rounded-full" />
          )}
          
          <div className="relative z-10">
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6 transition-transform group-hover:scale-110" />}
          </div>

          {!isMuted && (
            <div className="absolute inset-0 border border-primary/30 rounded-full animate-ping opacity-30" />
          )}
        </button>

        {/* Status Dot */}
        <div className={cn(
          "absolute -right-0.5 top-0 h-3 w-3 rounded-full border-2 border-slate-950 transition-all duration-500",
          isConnecting ? "bg-amber-500 animate-bounce" : isMuted ? "bg-rose-500" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        )} />
      </div>
    </div>
  );
};

export default LiveAgentPill;
