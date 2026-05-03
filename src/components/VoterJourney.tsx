import { useCallback, useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  ExternalLink,
  ChevronRight,
  Lock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VoterPlanDialog from "@/components/VoterPlanDialog";
import { useT } from "@/i18n/LanguageProvider";
import { getLocalizedVoterJourney } from "@/i18n/content";
import { useUser } from "@/context/UserContext";
import { getNextStep, isStepComplete } from "@/lib/nextStep";

// ---------------------------------------------------------------------------
// VoterJourney
// ---------------------------------------------------------------------------

const VoterJourney = () => {
  const { t, lang } = useT();
  const { user, setUser } = useUser();
  const voterJourney = useMemo(() => getLocalizedVoterJourney(lang), [lang]);
  const nextStep = useMemo(() => getNextStep(user), [user]);
  const [expandedDescId, setExpandedDescId] = useState<number | null>(null);

  useEffect(() => {
    setUser({ currentScreen: "journey" });
  }, [setUser]);

  // ----- Derived progress ------------------------------------------------

  const completedCount = useMemo(
    () => voterJourney.reduce((acc, step) => acc + (isStepComplete(step.id, user) ? 1 : 0), 0),
    [voterJourney, user],
  );

  const progress = Math.round((completedCount / voterJourney.length) * 100);

  // ----- Toggle a step ---------------------------------------------------

  const toggleStep = useCallback(
    (stepId: number) => {
      const idStr = String(stepId);
      const alreadyDone = isStepComplete(stepId, user);

      if (alreadyDone) {
        // Remove from completedSteps — cannot override derived state (age etc.)
        setUser({
          completedSteps: user.completedSteps.filter((s) => s !== idStr),
        });
      } else {
        // Add to completedSteps if not already there
        if (!user.completedSteps.includes(idStr)) {
          setUser({ completedSteps: [...user.completedSteps, idStr] });
        }
      }
    },
    [user, setUser],
  );

  // ----- Step state helpers ----------------------------------------------

  /**
   * A step is "active" when its id matches the next-step engine's suggestion.
   * We map the step engine IDs to numeric journey step IDs:
   *   eligibility → 1, registration → 2, epic → 3, booth → 4
   */
  const nextStepNumericId = useMemo(() => {
    const map: Record<string, number> = {
      eligibility: 1,
      registration: 2,
      epic: 3,
      booth: 4,
    };
    return map[nextStep.id] ?? 1;
  }, [nextStep.id]);

  return (
    <section id="journey" className="bg-secondary/40 py-20" aria-labelledby="journey-heading">
      <div className="container">
        {/* ---- Section header ------------------------------------------- */}
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <div className="tricolor-bar mx-auto w-24 mb-5" aria-hidden />
          <h2 id="journey-heading" className="font-display text-3xl font-bold md:text-4xl">
            {t("journey.heading")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("journey.subtitle")}</p>
        </div>

        {/* ---- Reassurance Layer & Removed noisy banner (Phase 4 & 6 & 7) ---------------------------------- */}
        <div className="mx-auto mt-6 text-center animate-fade-in text-muted-foreground font-medium">
          "Don't worry, we're here to guide you at every single step."
        </div>

        {/* ---- Progress bar -------------------------------------------- */}
        <div className="mx-auto mt-6 max-w-3xl">
          <div className="rounded-full bg-card p-1 shadow-soft">
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t("journey.progress", {
                done: completedCount,
                total: voterJourney.length,
                pct: progress,
              })}
              className="h-3 rounded-full bg-gradient-hero transition-all duration-500"
              style={{ width: `${Math.max(progress, 4)}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t("journey.progress", {
              done: completedCount,
              total: voterJourney.length,
              pct: progress,
            })}
          </p>
        </div>

        {/* ---- Steps grid ---------------------------------------------- */}
        <ul className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
          {voterJourney.map((step) => {
            const done = isStepComplete(step.id, user);
            const isActive = step.id === nextStepNumericId && !done;
            const isLocked = !done && !isActive && step.id > nextStepNumericId;
            const labelId = `journey-step-${step.id}`;

            return (
              <li
                key={step.id}
                className={cn(
                  "relative rounded-2xl border bg-card p-6 transition-smooth",
                  done
                    ? "border-india-green/40 shadow-soft"
                    : isActive
                      ? "border-primary/60 shadow-elegant ring-1 ring-primary/20"
                      : isLocked
                        ? "border-border opacity-60"
                        : "border-border hover:border-primary/30 hover:shadow-soft",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {/* Active pulse ring */}
                {isActive && (
                  <span
                    className="absolute -inset-px rounded-2xl border-2 border-primary/40 animate-pulse"
                    aria-hidden
                  />
                )}

                <div className="flex items-start gap-4">
                  {/* Step icon */}
                  <div
                    aria-hidden
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display font-bold transition-bounce",
                      done
                        ? "bg-india-green text-success-foreground"
                        : isActive
                          ? "bg-gradient-hero text-primary-foreground shadow-glow scale-110"
                          : isLocked
                            ? "bg-secondary text-muted-foreground"
                            : "bg-gradient-hero text-primary-foreground shadow-soft",
                    )}
                  >
                    {done ? (
                      <Check className="h-5 w-5" />
                    ) : isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3
                      id={labelId}
                      className={cn(
                        "font-display text-xl font-bold",
                        done && "line-through opacity-70",
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-2 font-medium text-foreground">{step.description}</p>

                    {/* Learn More Toggle */}
                    {step.advanced && (
                      <div className="mt-3">
                        <button
                          onClick={() =>
                            setExpandedDescId(expandedDescId === step.id ? null : step.id)
                          }
                          className="flex items-center gap-1 text-sm font-semibold text-primary/80 hover:text-primary transition-colors focus-visible:outline-none"
                          aria-expanded={expandedDescId === step.id}
                        >
                          {expandedDescId === step.id ? "Show less" : "Learn more"}
                          {expandedDescId === step.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        {expandedDescId === step.id && (
                          <div className="mt-2 p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground animate-fade-in border border-border">
                            {step.advanced}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CTA row */}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {/* Dynamic CTA button */}
                      {!isLocked && (
                        <Button
                          variant={done ? "outline" : isActive ? "hero" : "secondary"}
                          onClick={() => toggleStep(step.id)}
                          aria-pressed={done}
                          aria-labelledby={labelId}
                          className={cn("rounded-xl", isActive && "shadow-soft")}
                        >
                          {done ? (
                            t("journey.markUndone")
                          ) : isActive ? (
                            <>
                              Mark Step Done
                              <Check className="h-4 w-4 ml-1" aria-hidden />
                            </>
                          ) : (
                            t("journey.markDone")
                          )}
                        </Button>
                      )}

                      {/* External link */}
                      {step.link && !isLocked && (
                        <a
                          href={step.link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-secondary/80 px-3 py-2 text-sm font-semibold text-accent hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          aria-label={`${step.link.label} (opens in a new tab)`}
                        >
                          {step.link.label}
                          <ExternalLink className="h-4 w-4" aria-hidden />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* ---- Take-with-you CTA --------------------------------------- */}
        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 rounded-3xl border border-border bg-card p-6 text-center shadow-soft md:flex-row md:text-left">
          <div className="flex-1">
            <h3 className="font-display text-xl font-bold">{t("journey.takeWithYou.title")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("journey.takeWithYou.body")}</p>
          </div>
          <VoterPlanDialog />
        </div>
      </div>
    </section>
  );
};

export default VoterJourney;
