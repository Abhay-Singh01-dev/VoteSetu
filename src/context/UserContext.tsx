/**
 * UserContext — global voter state
 *
 * Persisted to localStorage under "votesetu.user".
 * Safe against corrupted JSON.
 * No `any` types.  Fully memoised to avoid unnecessary re-renders.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScreenType =
  | "hero"
  | "timeline"
  | "journey"
  | "epic"
  | "chat"
  | "simulation"
  | "faq"
  | "none";

export type UserState = {
  age?: number;
  isRegistered?: boolean;
  hasEpic?: boolean;
  state?: string;
  /** IDs of voter-journey steps that the user has explicitly completed. */
  completedSteps: string[];
  /** Interaction memory: track steps the user explicitly chose to skip. */
  skippedSteps: string[];
  /** Current active screen/section for context-aware assistance. */
  currentScreen?: ScreenType;
};

type UserContextValue = {
  user: UserState;
  /** Safely merge a partial update into the current user state. */
  setUser: (patch: Partial<UserState>) => void;
  /** Wipe all user state back to the empty default. */
  resetUser: () => void;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "votesetu.user" as const;

const DEFAULT_USER: UserState = {
  completedSteps: [],
  skippedSteps: [],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadFromStorage(): UserState {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER;
    const parsed: unknown = JSON.parse(raw);
    // Guard against completely invalid shapes
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_USER;
    const obj = parsed as Record<string, unknown>;
    return {
      age: typeof obj.age === "number" && obj.age > 0 ? obj.age : undefined,
      isRegistered: typeof obj.isRegistered === "boolean" ? obj.isRegistered : undefined,
      hasEpic: typeof obj.hasEpic === "boolean" ? obj.hasEpic : undefined,
      state: typeof obj.state === "string" && obj.state.length > 0 ? obj.state : undefined,
      completedSteps: Array.isArray(obj.completedSteps)
        ? (obj.completedSteps as unknown[]).filter((s): s is string => typeof s === "string")
        : [],
      skippedSteps: Array.isArray(obj.skippedSteps)
        ? (obj.skippedSteps as unknown[]).filter((s): s is string => typeof s === "string")
        : [],
    };
  } catch {
    return DEFAULT_USER;
  }
}

function saveToStorage(user: UserState): void {
  if (typeof window === "undefined") return;
  try {
    // Exclude transient state like currentScreen from persistence
    const { currentScreen, ...persistentState } = user;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentState));
  } catch {
    /* quota exceeded or private-browsing restrictions — silently ignore */
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const UserContext = createContext<UserContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Initialise from localStorage on mount only (safe for SSR-like pre-renders)
  const [user, setUserState] = useState<UserState>(DEFAULT_USER);

  useEffect(() => {
    setUserState(loadFromStorage());
  }, []);

  // Auto-persist on every change
  useEffect(() => {
    saveToStorage(user);
  }, [user]);

  const setUser = useCallback((patch: Partial<UserState>) => {
    setUserState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetUser = useCallback(() => {
    setUserState(DEFAULT_USER);
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({ user, setUser, resetUser }),
    [user, setUser, resetUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser() must be called inside <UserProvider>.");
  }
  return ctx;
}
