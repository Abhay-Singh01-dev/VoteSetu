import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GoogleServicesCard from "@/components/GoogleServicesCard";

const mockFetch = vi.fn();

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("GoogleServicesCard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mockFetch.mockReset();
  });

  it("renders connected Google service state from the backend", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        provider: "google-gemini",
        chatModel: "gemini-2.5-flash",
        liveModel: "models/gemini-2.0-flash-exp",
        restConfigured: true,
        liveConfigured: true,
        docsPath: "/docs/GOOGLE_CLOUD.md",
        deploymentTargets: ["Cloud Run", "Cloud Build", "Artifact Registry"],
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    renderWithQuery(<GoogleServicesCard />);

    await waitFor(() => {
      expect(screen.getByText("Google Gemini connected")).toBeInTheDocument();
    });

    expect(screen.getByText("Gemini chat")).toBeInTheDocument();
    expect(screen.getByText("Gemini Live")).toBeInTheDocument();
    expect(screen.getByText(/Cloud Run/)).toBeInTheDocument();
  });
});
