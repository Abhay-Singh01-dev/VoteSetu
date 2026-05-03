import express from "express";
import type { RequestHandler } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GENERATIVE_AI } from "../lib/googleGemini";

const MAX_MESSAGE_CHARS = 2000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 50;

const isCiTest = process.env.VITEST === "true" || process.env.NODE_ENV === "test";

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

  app.disable("x-powered-by");

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((v) => v.trim())
        : true,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "256kb" }));

  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    next();
  });

  app.post("/api/chat", chatLimiter, async (req, res) => {
    try {
      const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      if (message.length > MAX_MESSAGE_CHARS) {
        return res
          .status(400)
          .json({ error: `Message too long. Max ${MAX_MESSAGE_CHARS} characters.` });
      }

      if (process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: GOOGLE_GENERATIVE_AI.CHAT_MODEL,
        });

        const prompt = [
          "You are a helpful assistant for Indian elections.",
          "Only answer questions related to elections, voting processes, registration, ECI, EVM, VVPAT, timeline, and official voter services.",
          "If the query is unrelated, politely refuse and redirect to election help.",
          "Keep answers practical, concise, and step-by-step.",
          `User query: ${JSON.stringify(message)}`,
        ].join("\n");

        const result = await model.generateContentStream(prompt);

        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          res.write(chunkText);
        }
        return res.end();
      }

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.write(
        "This is a simulated backend response. Please configure GEMINI_API_KEY in your environment for real-time streaming AI answers!",
      );
      return res.end();
    } catch (error) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
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
