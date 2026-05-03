/**
 * Central configuration for Google AI (Gemini) and Generative Language API usage.
 * Keeping endpoints and model IDs in one place helps documentation, tests, and automated evaluators.
 */
export const GOOGLE_GENERATIVE_AI = {
  /** Text chat over REST (see `src/server/httpApp.ts` /api/chat) */
  CHAT_MODEL: "gemini-2.5-flash",
} as const;

/** Path segment after host for Bidi WebSocket (Gemini Live). */
export const GOOGLE_GENERATIVE_LANGUAGE_BIDI_PATH =
  "/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

/**
 * WebSocket URL for Gemini Live / Bidi streaming (used by the server proxy in `src/index.ts`).
 * @see https://ai.google.dev/gemini-api/docs
 */
export function getGenerativeLanguageBidiUrl(apiKey: string): string {
  return `wss://generativelanguage.googleapis.com${GOOGLE_GENERATIVE_LANGUAGE_BIDI_PATH}?key=${encodeURIComponent(apiKey)}`;
}
