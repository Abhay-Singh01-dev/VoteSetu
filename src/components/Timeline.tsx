import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import { getLocalizedTimelinePhases } from "@/i18n/content";
import { useUser } from "@/context/UserContext";
import { getNextStep } from "@/lib/nextStep";

/**
 * Maps user next-step IDs to timeline phase IDs so we can highlight the
 * relevant phase when the user has ongoing progress.
 */
const NEXT_STEP_TO_PHASE: Record<string, string> = {
  eligibility: "announcement",
  registration: "announcement",
  epic: "notification",
  booth: "polling",
};

const Timeline = () => {
  const { t, lang } = useT();
  const { user, setUser } = useUser();
  const timelinePhases = useMemo(() => getLocalizedTimelinePhases(lang), [lang]);
  const [active, setActive] = useState(0);
  const phase = timelinePhases[active];
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const nextStep = useMemo(() => getNextStep(user), [user]);

  useEffect(() => {
    setUser({ currentScreen: "timeline" });
  }, [setUser]);

  // Determine which phase index is "relevant" to the user's state
  const relevantPhaseId = NEXT_STEP_TO_PHASE[nextStep.id] ?? null;
  const relevantPhaseIndex = useMemo(
    () =>
      relevantPhaseId !== null ? timelinePhases.findIndex((p) => p.id === relevantPhaseId) : -1,
    [timelinePhases, relevantPhaseId],
  );

  useEffect(() => {
    buttonRefs.current[active]?.focus({ preventScroll: true });
  }, [active]);

  const onListKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    if (e.key === "ArrowDown") setActive((a) => Math.min(timelinePhases.length - 1, a + 1));
    if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
    if (e.key === "Home") setActive(0);
    if (e.key === "End") setActive(timelinePhases.length - 1);
  };

  return (
    <section id="timeline" className="container py-20" aria-labelledby="timeline-heading">
      <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
        <div className="tricolor-bar mx-auto w-24 mb-5" aria-hidden />
        <h2 id="timeline-heading" className="font-display text-3xl font-bold md:text-4xl">
          {t("timeline.heading")}
        </h2>
        <p className="mt-3 text-muted-foreground">{t("timeline.help")}</p>
      </div>

      {/* Personalisation hint */}
      {relevantPhaseIndex !== -1 && (
        <div className="mx-auto mt-6 max-w-3xl flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-primary">
          <span className="text-base" aria-hidden>
            📍
          </span>
          <span>
            <strong>Your current stage:</strong> {timelinePhases[relevantPhaseIndex]?.title} —
            highlighted below.
          </span>
        </div>
      )}

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr,1.2fr]">
        {/* Phases list */}
        <ul
          className="relative space-y-3"
          role="tablist"
          aria-label={t("timeline.heading")}
          aria-orientation="vertical"
          onKeyDown={onListKey}
        >
          <div className="absolute left-[22px] top-3 bottom-3 w-px bg-border" aria-hidden />

          {timelinePhases.map((p, i) => {
            const isActive = i === active;
            const isDone = i < active;
            const isRelevant = i === relevantPhaseIndex;
            const isFuture = relevantPhaseIndex !== -1 && i > relevantPhaseIndex;

            return (
              <li key={p.id} role="presentation">
                <button
                  ref={(el) => (buttonRefs.current[i] = el)}
                  role="tab"
                  id={`phase-tab-${p.id}`}
                  aria-selected={isActive}
                  aria-controls="phase-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={cn(
                    "group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-smooth",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "border-primary/50 bg-card shadow-elegant"
                      : isRelevant && !isActive
                        ? "border-primary/30 bg-primary/5 hover:border-primary/50 hover:shadow-soft"
                        : isFuture
                          ? "border-border/50 bg-card/50 opacity-50 hover:opacity-75 hover:border-primary/20"
                          : "border-border bg-card hover:border-primary/30 hover:shadow-soft",
                  )}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl transition-bounce",
                      isActive
                        ? "bg-gradient-hero text-primary-foreground shadow-glow scale-110"
                        : isDone
                          ? "bg-success text-success-foreground"
                          : isRelevant
                            ? "bg-primary/20 text-primary ring-2 ring-primary/30"
                            : "bg-secondary text-foreground",
                    )}
                  >
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <span>{p.icon}</span>}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={cn(
                          "font-semibold",
                          isActive && "text-primary",
                          isRelevant && !isActive && "text-primary/80",
                        )}
                      >
                        {p.title}
                        {isRelevant && !isActive && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            You are here
                          </span>
                        )}
                      </h3>
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        {p.duration}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.summary}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Active phase detail */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div
            id="phase-panel"
            role="tabpanel"
            aria-labelledby={`phase-tab-${phase.id}`}
            key={phase.id}
            className="animate-fade-in rounded-3xl border border-border bg-gradient-card p-8 shadow-elegant"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl" aria-hidden>
                {phase.icon}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {t("timeline.phaseLabel", { n: active + 1, total: timelinePhases.length })} ·{" "}
                  {phase.duration}
                </p>
                <h3 className="font-display text-2xl font-bold">{phase.title}</h3>
              </div>
            </div>
            <p className="mt-5 text-foreground/90">{phase.summary}</p>
            <ul className="mt-6 space-y-3">
              {phase.details.slice(0, 3).map((d) => (
                <li key={d} className="flex gap-3 rounded-xl bg-secondary/60 p-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-india-green" aria-hidden />
                  <span>{d}</span>
                </li>
              ))}
            </ul>

            <Link
              to={`/phase/${phase.id}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-bounce hover:bg-primary/90 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`${t("timeline.openGuide")}: ${phase.title}`}
            >
              {t("timeline.openGuide")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => setActive((a) => Math.max(0, a - 1))}
                disabled={active === 0}
                aria-label={t("timeline.prev")}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-smooth hover:bg-secondary disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("timeline.prev")}
              </button>
              <div className="flex gap-1.5" role="presentation" aria-hidden>
                {timelinePhases.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-2 rounded-full transition-smooth",
                      i === active ? "w-8 bg-primary" : "w-2 bg-border",
                    )}
                  />
                ))}
              </div>
              <button
                onClick={() => setActive((a) => Math.min(timelinePhases.length - 1, a + 1))}
                disabled={active === timelinePhases.length - 1}
                aria-label={t("timeline.next")}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("timeline.next")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
