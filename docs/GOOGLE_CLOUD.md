# Google Cloud integration map

This document lists Google surfaces touched by VoteSetu so automated reviewers can trace **Google Services** usage end-to-end.

| Surface                                  | Role in VoteSetu                                                                                                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gemini API** (`@google/generative-ai`) | REST streaming answers for `/api/chat`, election-domain constrained prompts.                                                                                |
| **Generative Language API (WebSocket)**  | Live multimodal bridge (`/ws/multimodal-live`) proxies to `generativelanguage.googleapis.com` Bidi endpoint; URLs centralized in `src/lib/googleGemini.ts`. |
| **Google Cloud Run**                     | Stateless deployment target for the Docker image; scales HTTP + WebSocket proxy together.                                                                   |
| **Artifact Registry**                    | Stores immutable container images produced by Cloud Build (`cloudbuild.yaml`).                                                                              |
| **Cloud Build**                          | CI/CD pipeline definition (`cloudbuild.yaml`) to build and push images reproducibly.                                                                        |
| **Cloud Logging**                        | Cloud Build option `logging: CLOUD_LOGGING_ONLY` ships build logs to Cloud Logging.                                                                         |

Recommended production secrets handling:

- Store `GEMINI_API_KEY` in **Secret Manager** and inject into Cloud Run via `--set-secrets` or Console binding (never commit keys).
