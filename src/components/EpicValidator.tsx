import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ExternalLink,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { validateEpic } from "@/data/electionData";
import { useT } from "@/i18n/LanguageProvider";
import { localizeEpicValidation } from "@/i18n/content";
import { cn } from "@/lib/utils";
import SourceList from "@/components/SourceList";
import { useUser } from "@/context/UserContext";

const STATUS_STYLES: Record<
  string,
  {
    ring: string;
    text: string;
    bg: string;
    Icon: typeof CheckCircle2;
    key:
      | "epic.input.statusOk"
      | "epic.input.statusWarn"
      | "epic.input.statusBad"
      | "epic.input.statusEmpty";
  }
> = {
  valid: {
    ring: "ring-india-green/40",
    text: "text-india-green",
    bg: "bg-india-green/10",
    Icon: CheckCircle2,
    key: "epic.input.statusOk",
  },
  warning: {
    ring: "ring-amber-500/40",
    text: "text-amber-600",
    bg: "bg-amber-500/10",
    Icon: AlertTriangle,
    key: "epic.input.statusWarn",
  },
  invalid: {
    ring: "ring-destructive/40",
    text: "text-destructive",
    bg: "bg-destructive/10",
    Icon: XCircle,
    key: "epic.input.statusBad",
  },
  empty: {
    ring: "ring-border",
    text: "text-muted-foreground",
    bg: "bg-secondary/60",
    Icon: Info,
    key: "epic.input.statusEmpty",
  },
};

const EpicValidator = () => {
  const { t, lang } = useT();
  const { user, setUser } = useUser();
  const [value, setValue] = useState("");
  const result = useMemo(() => localizeEpicValidation(validateEpic(value), lang), [value, lang]);
  const styles = STATUS_STYLES[result.status];
  const StatusIcon = styles.Icon;

  // Phase 8: Persist hasEpic=true when format validates. Guard prevents
  // duplicate writes and avoids an infinite re-render loop.
  useEffect(() => {
    if (result.status === "valid" && !user.hasEpic) {
      setUser({ hasEpic: true });
    }
  }, [result.status, user.hasEpic, setUser]);

  // Sanitise as the user types: uppercase, strip non-alphanumeric, cap length
  const onChange = (raw: string) => {
    const cleaned = raw
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 20);
    setValue(cleaned);
  };

  const searchUrl = value
    ? `https://electoralsearch.eci.gov.in/?epic=${encodeURIComponent(value)}`
    : "https://electoralsearch.eci.gov.in/";

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-xl font-bold">{t("epic.input.heading")}</h3>
        <p className="text-sm text-muted-foreground">{t("epic.input.help")}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr,auto]">
        <div className="grid gap-2">
          <Label
            htmlFor="epic-input"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            {t("epic.input.label")}
          </Label>
          <Input
            id="epic-input"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("epic.input.placeholder")}
            maxLength={20}
            aria-describedby="epic-status"
            className="font-mono tracking-[0.18em] uppercase"
          />
        </div>
        <div className="flex items-end">
          <Button
            asChild
            variant="hero"
            disabled={!value || result.status === "invalid"}
            className={cn(!value && "opacity-60")}
          >
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("epic.input.searchRoll")}
              onClick={(e) => {
                if (!value) e.preventDefault();
              }}
            >
              <Search className="h-4 w-4" />
              {t("epic.input.searchRoll")}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </Button>
        </div>
      </div>

      {/* Status card */}
      <div
        id="epic-status"
        role="status"
        aria-live="polite"
        className={cn("mt-5 rounded-2xl p-4 ring-1", styles.bg, styles.ring)}
      >
        <div className="flex items-start gap-3">
          <StatusIcon className={cn("mt-0.5 h-5 w-5 shrink-0", styles.text)} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className={cn("font-semibold", styles.text)}>
              {t(styles.key)} · <span className="text-foreground">{result.title}</span>
            </p>
            {result.checklist.length > 0 && (
              <ul className="mt-3 space-y-2.5">
                {result.checklist.map((c) => (
                  <li key={c.label} className="flex items-start gap-2 text-sm">
                    {c.ok ? (
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-india-green"
                        aria-hidden
                      />
                    ) : (
                      <XCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-destructive/80"
                        aria-hidden
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>
                        {c.label}
                      </span>
                      {c.sources && c.sources.length > 0 && (
                        <SourceList
                          sources={c.sources}
                          hideLabel
                          className="mt-1"
                          citationFor={c.label}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-sm text-muted-foreground">{result.guidance}</p>
            {result.checklist.some((item) => item.sources?.length) && (
              <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {t("epic.input.referenceHeading")}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("epic.input.referenceHelp")}
                </p>
                <ul className="mt-3 space-y-3">
                  {result.checklist.map((item) => (
                    <li key={item.label} className="rounded-xl bg-secondary/50 p-3">
                      <p className="text-xs font-medium text-foreground">{item.label}</p>
                      <SourceList
                        sources={item.sources}
                        hideLabel
                        className="mt-2"
                        citationFor={item.label}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification footer — where these checks come from */}
      {result.sources && result.sources.length > 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-secondary/40 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {t("epic.input.verifyHeading")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("epic.input.verifyHelp")}</p>
              <SourceList sources={result.sources} className="mt-2" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpicValidator;
