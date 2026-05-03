/**
 * StatusWarnings — Smart proactive warning system.
 *
 * Driven by the UserInsights engine. Replaces static rules with predictive logic,
 * mapping urgency to severity and offering immediate micro-actions.
 * Phase 2 & 9 implementation.
 */

import { AlertTriangle, Info, X, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { getUserInsights, type SeverityLevel } from "@/lib/userInsights";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SEVERITY_STYLES: Record<
  SeverityLevel,
  { bg: string; text: string; icon: React.ElementType }
> = {
  info: { bg: "bg-primary/10", text: "text-primary", icon: Info },
  warning: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    icon: AlertTriangle,
  },
  critical: { bg: "bg-destructive/10", text: "text-destructive", icon: ShieldAlert },
};

const StatusWarnings = () => {
  const { user, setUser } = useUser();
  const insights = getUserInsights(user);

  // Local session dismissals for specific risk messages
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const handleDismiss = (message: string) => {
    setDismissed((prev) => new Set([...prev, message]));

    // Memory Intelligence (Phase 8): If dismissing an actionable risk, log a generic 'skip_warning' locally.
    // We avoid over-poluting skippedSteps, but track that they ignored a nudge.
    if (!user.skippedSteps.includes("warning_dismissed")) {
      setUser({ skippedSteps: [...user.skippedSteps, "warning_dismissed"] });
    }
  };

  const handleMicroAction = (actionType: "register" | "epic") => {
    if (actionType === "register") {
      window.open("https://voters.eci.gov.in/form/Form6", "_blank");
    } else {
      window.open("https://voters.eci.gov.in/download-eepic", "_blank");
    }
  };

  const activeRisks = insights.risks.filter((r) => !dismissed.has(r.message));

  if (activeRisks.length === 0 && insights.suggestions.length === 0) return null;

  return (
    <div role="alert" aria-live="polite" className="space-y-1 border-b border-border/60">
      {activeRisks.map((risk, idx) => {
        const style = SEVERITY_STYLES[risk.severity];
        const Icon = style.icon;

        // Render micro-action buttons dynamically based on known risk signatures
        let actionBtn = null;
        if (risk.message.includes("not on the electoral roll")) {
          actionBtn = (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-7 text-xs border-current bg-transparent hover:bg-black/10 transition-colors ml-2",
              )}
              onClick={() => handleMicroAction("register")}
            >
              Start registration
            </Button>
          );
        } else if (risk.message.includes("lack a verified EPIC")) {
          actionBtn = (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-7 text-xs border-current bg-transparent hover:bg-black/10 transition-colors ml-2",
              )}
              onClick={() => handleMicroAction("epic")}
            >
              Download e-EPIC
            </Button>
          );
        }

        return (
          <div
            key={idx}
            className={cn(
              "flex items-start justify-between gap-3 px-4 py-3 text-sm transition-all",
              style.bg,
              style.text,
            )}
          >
            <div className="flex min-w-0 items-center justify-start max-w-full flex-wrap gap-2">
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="leading-snug font-medium">{risk.message}</span>
              {actionBtn}
            </div>
            <button
              onClick={() => handleDismiss(risk.message)}
              aria-label={`Dismiss warning: ${risk.message.slice(0, 60)}`}
              className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default StatusWarnings;
