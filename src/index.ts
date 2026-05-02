import express from "express";
import type { Request } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load dotenv only in development
if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

const app = express();
const server = createServer(app);
const MAX_MESSAGE_CHARS = 2000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const requestLog = new Map<string, number[]>();

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.socket.remoteAddress || "unknown";
}

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const current = requestLog.get(clientId) ?? [];
  const recent = current.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestLog.set(clientId, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(clientId, recent);
  return false;
}

// Essential middleware
app.disable("x-powered-by");
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((v) => v.trim()) : true,
  methods: ["GET", "POST"],
}));
app.use(express.json({ limit: "256kb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// Legacy/Basic WebSocket setup
const legacyWss = new WebSocketServer({ noServer: true });
legacyWss.on("connection", (ws) => {
  console.log("Client connected to legacy WS");
  ws.on("message", (message) => {
    ws.send(JSON.stringify({ status: "acknowledged", message: "Legacy WS active" }));
  });
});

// Multimodal Live API WebSocket bridge
const multimodalWss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const { pathname } = new URL(request.url || "", `http://${request.headers.host}`);
  
  if (pathname === "/ws/multimodal-live") {
    multimodalWss.handleUpgrade(request, socket, head, (ws) => {
      console.log("Client connected to multimodal bridge");
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        ws.close(1008, "API Key missing");
        return;
      }
      const googleWsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      const googleWs = new WebSocket(googleWsUrl);
      googleWs.on("message", (data) => ws.readyState === ws.OPEN && ws.send(data.toString()));
      ws.on("message", (data) => googleWs.readyState === googleWs.OPEN && googleWs.send(data.toString()));
      const cleanup = () => {
        if (googleWs.readyState <= 1) googleWs.close();
        if (ws.readyState <= 1) ws.close();
      };
      googleWs.on("close", cleanup);
      ws.on("close", cleanup);
      googleWs.on("error", cleanup);
      ws.on("error", cleanup);
    });
  } else if (pathname === "/ws/live") {
    legacyWss.handleUpgrade(request, socket, head, (ws) => {
      legacyWss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});


// API Routes
app.post("/api/chat", async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    if (isRateLimited(clientIp)) {
      return res.status(429).json({ error: "Too many requests. Please try again shortly." });
    }

    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      return res.status(400).json({ error: `Message too long. Max ${MAX_MESSAGE_CHARS} characters.` });
    }

    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = [
        "You are a helpful assistant for Indian elections.",
        "Only answer questions related to elections, voting processes, registration, ECI, EVM, VVPAT, timeline, and official voter services.",
        "If the query is unrelated, politely refuse and redirect to election help.",
        "Keep answers practical, concise, and step-by-step.",
        `User query: ${JSON.stringify(message)}`,
      ].join("\n");

      const result = await model.generateContentStream(prompt);

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-store");

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        res.write(chunkText);
      }
      return res.end();
    } else {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.write("This is a simulated backend response. Please configure GEMINI_API_KEY in your environment for real-time streaming AI answers!");
      return res.end();
    }
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/audio", (req, res) => {
  res.json({ status: "Audio endpoint placeholder" });
});

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

// Static frontend serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Because this file compiles to dist/index.js, __dirname is already the dist folder
const distPath = __dirname;

app.use(express.static(distPath));

// Fallback for React SPA Routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Start Server
const PORT = parseInt(process.env.PORT || "8080", 10);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
