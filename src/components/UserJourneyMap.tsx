/**
 * UserJourneyMap — High-level visual overview of the voter's progression.
 *
 * Placed above VoterJourney to give a rapid snapshot of status.
 * Evaluates completion and blocking dynamically from UserContext.
 */

import { useUser } from "@/context/UserContext";
import { getUserInsights } from "@/lib/userInsights";
import { cn } from "@/lib/utils";
import { Check, X, ShieldAlert, ArrowRight } from "lucide-react";

type NodeState = "completed" | "active" | "blocked" | "pending";

type JourneyNode = {
  id: string;
  label: string;
  state: NodeState;
};

const UserJourneyMap = () => {
  const { user } = useUser();
  const insights = getUserInsights(user);

  // Derive node states
  const isUnderage = user.age !== undefined && user.age < 18;
  const isEligible = user.age !== undefined && user.age >= 18;

  const nodes: JourneyNode[] = [
    {
      id: "eligibility",
      label: "✅ Eligibility",
      state: isUnderage ? "blocked" : isEligible ? "completed" : "active",
    },
    {
      id: "registration",
      label: "📝 Register",
      state: isUnderage
        ? "blocked"
        : user.isRegistered
          ? "completed"
          : isEligible
            ? "active"
            : "pending",
    },
    {
      id: "epic",
      label: "🪪 Voter ID",
      state: !user.isRegistered ? "blocked" : user.hasEpic ? "completed" : "active",
    },
    {
      id: "vote",
      label: "🗳️ Cast Vote",
      state: !user.hasEpic ? "blocked" : user.completedSteps.includes("6") ? "completed" : "active",
    },
  ];

  return (
    <section
      className="container pt-16 pb-6 animate-fade-in-up"
      aria-label="User Journey Map Overview"
    >
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <h3 className="text-center font-display text-2xl font-bold mb-8">Your Journey map</h3>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {nodes.map((node, i) => {
            const isCompleted = node.state === "completed";
            const isActive = node.state === "active";
            const isBlocked = node.state === "blocked";
            const isPending = node.state === "pending";

            return (
              <div
                key={node.id}
                className="flex flex-col md:flex-row items-center flex-1 w-full gap-4"
              >
                {/* Node Box */}
                <div
                  className={cn(
                    "flex flex-col items-center justify-center p-4 w-full md:w-40 rounded-2xl border-2 transition-all",
                    isCompleted && "border-india-green bg-india-green/5 text-india-green",
                    isActive && "border-primary bg-primary/5 text-primary shadow-glow",
                    isBlocked && "border-destructive/30 bg-destructive/5 text-destructive/80",
                    isPending && "border-border bg-secondary/30 text-muted-foreground opacity-60",
                  )}
                >
                  <div className="mb-2">
                    {isCompleted && <Check className="h-6 w-6" />}
                    {isActive && <ArrowRight className="h-6 w-6 animate-pulse" />}
                    {isBlocked && <ShieldAlert className="h-6 w-6" />}
                    {isPending && (
                      <div className="h-6 w-6 rounded-full border-2 border-dashed border-current opacity-50" />
                    )}
                  </div>
                  <span className="font-semibold text-sm whitespace-nowrap">{node.label}</span>
                </div>

                {/* Connector Line */}
                {i < nodes.length - 1 && (
                  <div className="hidden md:flex h-1 flex-1 min-w-[20px] rounded-full overflow-hidden bg-secondary">
                    {isCompleted && <div className="h-full w-full bg-india-green" />}
                    {isActive && (
                      <div className="h-full w-1/2 bg-gradient-to-r from-india-green to-transparent animate-shimmer" />
                    )}
                  </div>
                )}
                {/* Mobile Connector */}
                {i < nodes.length - 1 && (
                  <div className="md:hidden w-1 h-6 rounded-full overflow-hidden bg-secondary">
                    {isCompleted && <div className="h-full w-full bg-india-green" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Global Insight Hint */}
        {insights.suggestions.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {insights.suggestions[0]}
          </div>
        )}
      </div>
    </section>
  );
};

export default UserJourneyMap;
