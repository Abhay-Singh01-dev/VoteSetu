import { useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { CreditCard, AlertCircle, ExternalLink } from "lucide-react";
import EpicValidator from "@/components/EpicValidator";
import SourceList from "@/components/SourceList";
import { useT } from "@/i18n/LanguageProvider";
import { getLocalizedEpicMissingActions, getLocalizedEpicSteps } from "@/i18n/content";
import { useUser } from "@/context/UserContext";

const EpicHelper = () => {
  const { t, lang } = useT();
  const { setUser } = useUser();
  const epicSteps = useMemo(() => getLocalizedEpicSteps(lang), [lang]);
  const epicMissingActions = useMemo(() => getLocalizedEpicMissingActions(lang), [lang]);

  useEffect(() => {
    setUser({ currentScreen: "epic" });
  }, [setUser]);

  return (
    <section id="epic" className="container py-20" aria-labelledby="epic-heading">
      <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
        <div className="tricolor-bar mx-auto w-24 mb-5" aria-hidden />
        <h2 id="epic-heading" className="font-display text-3xl font-bold md:text-4xl">
          {t("epic.heading")}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {t("epic.subtitle")}
        </p>
      </div>

      {/* EPIC validator */}
      <div className="mx-auto mt-10 max-w-3xl">
        <EpicValidator />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr,1fr]">
        {/* Steps to download */}
        <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-soft md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">{t("epic.download.title")}</h3>
              <p className="text-sm text-muted-foreground">{t("epic.download.subtitle")}</p>
            </div>
          </div>

          <ol className="mt-6 space-y-4" role="list">
            {epicSteps.map((s, i) => (
              <li key={s.title} className="relative flex gap-4 rounded-2xl bg-card p-4 shadow-soft">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-hero font-display text-sm font-bold text-primary-foreground shadow-soft"
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold">{s.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                  <SourceList sources={s.sources} citationFor={s.title} />
                </div>
              </li>
            ))}
          </ol>

          <a
            href="https://voters.eci.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-hero px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-bounce hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={`${t("epic.download.openPortal")} (opens in a new tab)`}
          >
            {t("epic.download.openPortal")}
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>

        {/* What if you don't have it */}
        <Card className="rounded-3xl border-border p-6 shadow-soft md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent" aria-hidden>
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">{t("epic.missing.title")}</h3>
              <p className="text-sm text-muted-foreground">{t("epic.missing.subtitle")}</p>
            </div>
          </div>

          <ul className="mt-6 space-y-3" role="list">
            {epicMissingActions.map((a) => (
              <li
                key={a.title}
                className="rounded-2xl border border-border/80 bg-secondary/40 p-4 transition-smooth hover:border-primary/40 hover:bg-secondary"
              >
                <h4 className="font-semibold text-foreground">{a.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                <SourceList sources={a.sources} citationFor={a.title} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
};

export default EpicHelper;
