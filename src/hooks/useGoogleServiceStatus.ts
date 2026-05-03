import { useQuery } from "@tanstack/react-query";
import type { GoogleServiceStatus } from "@/lib/googleGemini";

async function fetchGoogleServiceStatus(): Promise<GoogleServiceStatus> {
  const response = await fetch("/api/google/status", {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to load Google service status");
  }

  return response.json() as Promise<GoogleServiceStatus>;
}

export function useGoogleServiceStatus() {
  return useQuery({
    queryKey: ["google-service-status"],
    queryFn: fetchGoogleServiceStatus,
    staleTime: 60_000,
    retry: 1,
  });
}
