import express from "express";
import type { RequestHandler } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { getFallbackElectionAnswer } from "../lib/assistant";
import { isElectionQuery } from "../lib/voiceProcessor";
import {
  buildElectionAssistantPrompt,
  getGoogleServiceStatus,
  GOOGLE_GENERATIVE_AI,
} from "../lib/googleGemini";

const MAX_MESSAGE_CHARS = 2000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 50;

const isCiTest = process.env.VITEST === "true" || process.env.NODE_ENV === "test";

const chatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(MAX_MESSAGE_CHARS),
});

const passThrough: RequestHandler = (_req, _res, next) => next();

const chatLimiter: RequestHandler = isCiTest
  ? passThrough
  : rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX_REQUESTS,
      message: { error: "Too many requests. Please try again shortly." },
      standardHeaders: true,
      legacyHeaders: false,
    });

/**
 * Creates the Express application (HTTP only). WebSocket upgrade stays in `src/index.ts`.
 */
export function createHttpApp(): express.Application {
  const app = express();
  const hasGeminiApiKey = Boolean(process.env.GEMINI_API_KEY);
  const googleStatus = getGoogleServiceStatus(hasGeminiApiKey);
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((v) => v.trim())
    : null;

  app.disable("x-powered-by");

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
          connectSrc: [
            "'self'",
            "https://generativelanguage.googleapis.com",
            "wss://generativelanguage.googleapis.com",
            "ws:",
            "wss:",
          ],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          mediaSrc: ["'self'", "blob:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  if (allowedOrigins) {
    app.use(
      cors({
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    );
  }

  app.use(express.json({ limit: "256kb" }));

  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(self), microphone=(self), geolocation=(), payment=(), usb=()",
    );
    next();
  });

  app.post("/api/chat", chatLimiter, async (req, res) => {
    try {
      const parsed = chatRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
      }
      const { message } = parsed.data;

      if (!isElectionQuery(message)) {
        return res.status(400).json({
          error:
            "VoteSetu only answers election and voting questions. Ask about registration, EPIC, polling booths, EVM, VVPAT, or election timelines.",
        });
      }

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");

      if (hasGeminiApiKey) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({
          model: GOOGLE_GENERATIVE_AI.CHAT_MODEL,
        });

        const result = await model.generateContentStream(buildElectionAssistantPrompt(message));

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          res.write(chunkText);
        }
        return res.end();
      }

      res.write(getFallbackElectionAnswer(message));
      return res.end();
    } catch (error) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/google/status", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(googleStatus);
  });

  app.post("/api/audio", (_req, res) => {
    res.json({ status: "Audio endpoint placeholder" });
  });

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ ok: true, service: "votesetu" });
  });

  if (!isCiTest) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const distPath = path.join(__dirname, "..");

    app.use(express.static(distPath));

    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}
