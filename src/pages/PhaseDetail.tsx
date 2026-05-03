import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, Check, BookOpen, Vote, ListChecks } from "lucide-react";
import SourceList from "@/components/SourceList";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/LanguageProvider";
import { getLocalizedTimelinePhases } from "@/i18n/content";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Role labels are translated via t("phase.role.*") below.

const roleStyles: Record<string, string> = {
  voter: "bg-primary/10 text-primary",
  candidate: "bg-accent/10 text-accent",
  official: "bg-india-green/15 text-india-green",
};

const PhaseDetail = () => {
  const { phaseId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const timelinePhases = useMemo(() => getLocalizedTimelinePhases(lang), [lang]);
  const idx = timelinePhases.findIndex((p) => p.id === phaseId);
  const phase = timelinePhases[idx];
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setDone(new Set());
  }, [phaseId]);

  if (!phase) {
    return (
      <div className="container py-24 text-center">
        <h1 className="font-display text-3xl font-bold">{t("phase.notFound")}</h1>
        <Button asChild className="mt-6">
          <Link to="/">{t("phase.back")}</Link>
        </Button>
      </div>
    );
  }

  const prev = timelinePhases[idx - 1];
  const next = timelinePhases[idx + 1];
  const progress = Math.round((done.size / phase.checklist.length) * 100);

  const toggle = (i: number) =>
    setDone((prev) => {
      const s = new Set(prev);
      if (s.has(i)) {
        s.delete(i);
      } else {
        s.add(i);
      }
      return s;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Compact header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
              <Vote className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold">{t("brand.name")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/#timeline")}>
              <ArrowLeft className="h-4 w-4" /> {t("phase.allPhases")}
            </Button>
            <LanguageSwitcher variant="compact" />
          </div>
        </div>
        <div className="tricolor-bar rounded-none" />
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
          <div className="container relative py-12 md:py-16">
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground hover:underline">
                {t("phase.breadcrumb.home")}
              </Link>
              <span className="mx-2">/</span>
              <Link to="/#timeline" className="hover:text-foreground hover:underline">
                {t("phase.breadcrumb.timeline")}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{phase.title}</span>
            </nav>

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="animate-fade-in-up max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-soft">
                  {t("timeline.phaseLabel", { n: idx + 1, total: timelinePhases.length })} ·{" "}
                  {phase.duration}
                </span>
                <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight md:text-5xl">
                  <span className="mr-3">{phase.icon}</span>
                  {phase.title}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">{phase.summary}</p>
              </div>

              {/* Phase quick-nav */}
              <div className="flex flex-wrap gap-2">
                {timelinePhases.map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/phase/${p.id}`}
                    aria-label={`Go to phase ${i + 1}: ${p.title}`}
                    aria-current={i === idx ? "page" : undefined}
                    className={cn(
                      "h-10 w-10 rounded-full text-sm font-semibold transition-bounce flex items-center justify-center",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      i === idx
                        ? "bg-gradient-hero text-primary-foreground shadow-elegant scale-110"
                        : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {i + 1}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="container pb-16">
          <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
            {/* Left col: Checklist */}
            <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-soft md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ListChecks className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">{t("phase.checklist.title")}</h2>
                  <p className="text-sm text-muted-foreground">{t("phase.checklist.subtitle")}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="rounded-full bg-secondary p-1">
                  <div
                    className="h-2 rounded-full bg-gradient-hero transition-all duration-500"
                    style={{ width: `${Math.max(progress, 4)}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Phase checklist progress"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("phase.checklist.complete", {
                    done: done.size,
                    total: phase.checklist.length,
                  })}
                </p>
              </div>

              <ul className="mt-6 space-y-3">
                {phase.checklist.map((c, i) => {
                  const isDone = done.has(i);
                  return (
                    <li key={i}>
                      <button
                        onClick={() => toggle(i)}
                        aria-pressed={isDone}
                        className={cn(
                          "group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-smooth",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          isDone
                            ? "border-india-green/40 bg-india-green/5"
                            : "border-border bg-card hover:border-primary/40",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-bounce",
                            isDone
                              ? "border-india-green bg-india-green text-success-foreground"
                              : "border-border group-hover:border-primary",
                          )}
                        >
                          {isDone && <Check className="h-4 w-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                              roleStyles[c.for],
                            )}
                          >
                            {t(
                              `phase.role.${c.for}` as
                                | "phase.role.voter"
                                | "phase.role.candidate"
                                | "phase.role.official",
                            )}
                          </span>
                          <p className={cn("mt-1.5 text-sm", isDone && "line-through opacity-70")}>
                            {c.item}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* What happens */}
              <h3 className="mt-10 font-display text-xl font-bold">{t("phase.whatHappens")}</h3>
              <ul className="mt-4 space-y-2.5">
                {phase.details.map((d) => (
                  <li key={d} className="flex gap-3 rounded-xl bg-secondary/60 p-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-india-green" aria-hidden />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right col: Dates + Glossary */}
            <aside className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-bold">{t("phase.keyDates")}</h2>
                </div>
                <ul className="mt-4 divide-y divide-border">
                  {phase.keyDates.map((d) => (
                    <li key={d.label} className="flex items-center justify-between gap-4 py-3">
                      <span className="text-sm text-muted-foreground">{d.label}</span>
                      <span className="text-sm font-semibold text-foreground">{d.when}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-india-green/15 text-india-green">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-bold">{t("phase.glossary")}</h2>
                </div>
                <dl className="mt-4 space-y-4">
                  {phase.glossary.map((g) => (
                    <div key={g.term}>
                      <dt className="font-semibold text-foreground">{g.term}</dt>
                      <dd className="mt-1 text-sm text-muted-foreground">{g.definition}</dd>
                      <SourceList sources={g.sources} citationFor={g.term} />
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>

          {/* Prev / Next */}
          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:justify-between">
            {prev ? (
              <Button asChild variant="outline" className="justify-start">
                <Link to={`/phase/${prev.id}`} aria-label={`Previous phase: ${prev.title}`}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-left">
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("phase.previous")}
                    </span>
                    <span className="block font-semibold">{prev.title}</span>
                  </span>
                </Link>
              </Button>
            ) : (
              <span />
            )}
            {next ? (
              <Button asChild variant="hero" className="justify-end">
                <Link to={`/phase/${next.id}`} aria-label={`Next phase: ${next.title}`}>
                  <span className="text-right">
                    <span className="block text-[10px] uppercase tracking-wider text-primary-foreground/80">
                      {t("phase.next")}
                    </span>
                    <span className="block font-semibold">{next.title}</span>
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <span />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PhaseDetail;
