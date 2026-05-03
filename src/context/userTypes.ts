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
  completedSteps: string[];
  skippedSteps: string[];
  currentScreen?: ScreenType;
};
