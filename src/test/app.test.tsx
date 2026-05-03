import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          provider: "google-gemini",
          chatModel: "gemini-2.5-flash",
          liveModel: "models/gemini-2.0-flash-exp",
          restConfigured: false,
          liveConfigured: false,
          docsPath: "/docs/GOOGLE_CLOUD.md",
          deploymentTargets: ["Cloud Run", "Cloud Build", "Artifact Registry"],
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the application shell", () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByLabelText("VoteSetu home")).toBeInTheDocument();
  });
});
