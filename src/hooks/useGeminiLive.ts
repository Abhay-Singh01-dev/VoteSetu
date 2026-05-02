import { useState, useEffect, useRef, useCallback } from "react";

interface GeminiLiveConfig {
  onAudioOutput?: (base64: string) => void;
  systemInstruction?: string;
  model?: string;
}

export const useGeminiLive = (open: boolean, isMuted: boolean, config: GeminiLiveConfig = {}) => {
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
  
  // Audio Queueing System
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  // Safe Base64 Encoder to prevent Stack Overflow
  const safeBase64Encode = (pcmData: Int16Array): string => {
    // Convert Int16Array to Uint8Array safely in chunks
    const buffer = new ArrayBuffer(pcmData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < pcmData.length; i++) {
      view.setInt16(i * 2, pcmData[i], true); // true for little-endian
    }
    const uint8Array = new Uint8Array(buffer);
    
    // Chunked conversion to string to prevent stack overflow
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(uint8Array.subarray(i, i + chunkSize)));
    }
    return btoa(binary);
  };

  const playNextInQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const buffer = audioQueueRef.current.shift()!;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      playNextInQueue();
    };
    source.start();
  }, []);

  const playOutputAudio = useCallback((base64: string) => {
    if (!audioContextRef.current) return;
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768;
      
      const buffer = audioContextRef.current.createBuffer(1, float32.length, 16000);
      buffer.getChannelData(0).set(float32);
      
      audioQueueRef.current.push(buffer);
      if (!isPlayingRef.current) {
        playNextInQueue();
      }
    } catch (e) {
      console.error("Audio playback error", e);
    }
  }, [playNextInQueue]);

  const sendVisionFrame = useCallback(() => {
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!video || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.3).split(",")[1];
    
    wsRef.current.send(JSON.stringify({
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
          const base64 = safeBase64Encode(pcmData);
          wsRef.current.send(JSON.stringify({
            realtime_input: { media_chunks: [{ mime_type: "audio/pcm;rate=16000", data: base64 }] }
          }));
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      const visionInterval = window.setInterval(sendVisionFrame, 3000);
      return () => window.clearInterval(visionInterval);
    } catch (e) {
      console.error("Media capture error", e);
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
        wsRef.current?.send(JSON.stringify({
          setup: {
            model: config.model || "models/gemini-2.0-flash-exp",
            generation_config: { 
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: { prebuilt_voice_config: { voice_name: "Aoede" } }
              }
            },
            system_instruction: {
               parts: [{ text: config.systemInstruction || "You are a helpful election assistant for India." }]
            }
          }
        }));
        startMediaCapture();
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const serverContent = data.server_content || data.serverContent;
        if (serverContent?.model_turn?.parts?.[0]?.inline_data || serverContent?.modelTurn?.parts?.[0]?.inlineData) {
          const part = (serverContent.model_turn || serverContent.modelTurn).parts[0];
          const base64Audio = (part.inline_data || part.inlineData).data;
          if (config.onAudioOutput) {
            config.onAudioOutput(base64Audio);
          } else {
            playOutputAudio(base64Audio);
          }
        }
      };
      
      wsRef.current.onerror = (e) => console.error("WS Error", e);
      wsRef.current.onclose = () => stopLiveSession();

    } catch (e) {
      console.error("Session start error:", e);
      setIsConnecting(false);
    }
  }, [config, startMediaCapture, playOutputAudio, stopLiveSession]);

  const stopLiveSession = useCallback(() => {
    setIsActive(false);
    setIsConnecting(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (open && !isActive && !isConnecting) {
      setIsActive(true);
      startLiveSession();
    } else if (!open && isActive) {
      stopLiveSession();
    }
  }, [open, isActive, isConnecting, startLiveSession, stopLiveSession]);

  return {
    isConnecting,
    isActive,
    isSpeaking,
    resetInactivity: () => {
      if (inactivityTimeout.current) window.clearTimeout(inactivityTimeout.current);
    }
  };
};
