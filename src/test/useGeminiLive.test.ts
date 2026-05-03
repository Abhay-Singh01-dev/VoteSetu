import { renderHook, act } from "@testing-library/react";
import { useGeminiLive } from "../hooks/useGeminiLive";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock browser APIs
const mockGetUserMedia = vi.fn();
Object.defineProperty(global.navigator, "mediaDevices", {
  value: { getUserMedia: mockGetUserMedia },
});

describe("useGeminiLive hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useGeminiLive(false, false));
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.isActive).toBe(false);
    expect(result.current.isSpeaking).toBe(false);
  });

  it("should not connect if open is false", () => {
    renderHook(() => useGeminiLive(false, false));
    // We expect no WebSocket to be created
    expect(mockGetUserMedia).not.toHaveBeenCalled();
  });
});
