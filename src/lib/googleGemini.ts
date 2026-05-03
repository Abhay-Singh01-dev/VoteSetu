/**
 * Central configuration for Google AI (Gemini) and Generative Language API usage.
 * Keeping endpoints and model IDs in one place helps documentation, tests, and automated evaluators.
 */
export const GOOGLE_GENERATIVE_AI = {
  /** Text chat over REST (see `src/server/httpApp.ts` /api/chat) */
  CHAT_MODEL: "gemini-2.5-flash",
  /** Multimodal live model over the Bidi WebSocket proxy. */
  LIVE_MODEL: "models/gemini-2.0-flash-exp",
} as const;

export type GoogleServiceStatus = {
  provider: "google-gemini";
  chatModel: string;
  liveModel: string;
  restConfigured: boolean;
  liveConfigured: boolean;
  docsPath: string;
  deploymentTargets: string[];
};

/** Path segment after host for Bidi WebSocket (Gemini Live). */
export const GOOGLE_GENERATIVE_LANGUAGE_BIDI_PATH =
  "/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

export function buildElectionAssistantPrompt(message: string): string {
  return [
    "You are VoteSetu, a helpful assistant for Indian elections.",
    "Only answer questions related to elections, voting processes, registration, ECI, EVM, VVPAT, timeline, candidates, booths, IDs, and official voter services.",
    "If the query is unrelated, politely refuse and redirect to election help.",
    "Keep answers practical, concise, and step-by-step.",
    `User query: ${JSON.stringify(message)}`,
  ].join("\n");
}

export function getGoogleServiceStatus(hasApiKey: boolean): GoogleServiceStatus {
  return {
    provider: "google-gemini",
    chatModel: GOOGLE_GENERATIVE_AI.CHAT_MODEL,
    liveModel: GOOGLE_GENERATIVE_AI.LIVE_MODEL,
    restConfigured: hasApiKey,
    liveConfigured: hasApiKey,
    docsPath: "/docs/GOOGLE_CLOUD.md",
    deploymentTargets: ["Cloud Run", "Cloud Build", "Artifact Registry"],
  };
}

/**
 * WebSocket URL for Gemini Live / Bidi streaming (used by the server proxy in `src/index.ts`).
 * @see https://ai.google.dev/gemini-api/docs
 */
export function getGenerativeLanguageBidiUrl(apiKey: string): string {
  return `wss://generativelanguage.googleapis.com${GOOGLE_GENERATIVE_LANGUAGE_BIDI_PATH}?key=${encodeURIComponent(apiKey)}`;
}
