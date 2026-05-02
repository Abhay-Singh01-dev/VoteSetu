import heroImage from "@/assets/hero-election.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import { useUser } from "@/context/UserContext";
import { getNextStep } from "@/lib/nextStep";
import { getUserInsights } from "@/lib/userInsights";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import GuidedFlow from "./GuidedFlow";
import PrimaryAction from "./PrimaryAction";
import SpeakButton from "./SpeakButton";

interface HeroProps {
  onStart: () => void;
  onChat: () => void;
}

const Hero = ({ onStart, onChat }: HeroProps) => {
  const { t } = useT();
  const { user } = useUser();
  const [isGuidedFlowOpen, setIsGuidedFlowOpen] = useState(false);
  const nextStep = useMemo(() => getNextStep(user), [user]);

  const hasAnyState =
    user.isRegistered !== undefined ||
    user.hasEpic !== undefined ||
    user.age !== undefined ||
    user.completedSteps.length > 0;

  // Status items to render in the voting status card
  const statusItems = useMemo(() => {
    const items: { label: string; ok: boolean | null }[] = [];
    if (user.age !== undefined) {
      items.push({
        label: user.age >= 18 ? `Age eligible (${user.age})` : `Under 18 — not yet eligible`,
        ok: user.age >= 18,
      });
    }
    items.push({
      label: user.isRegistered ? "Registered on electoral roll" : "Not yet registered",
      ok: user.isRegistered ?? false,
    });
    items.push({
      label: user.hasEpic ? "EPIC (Voter ID) confirmed" : "EPIC not yet verified",
      ok: user.hasEpic ?? false,
    });
    return items;
  }, [user.age, user.isRegistered, user.hasEpic]);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="container relative grid gap-10 py-16 md:py-24 lg:grid-cols-2 lg:items-center">

        {/* ---- LEFT: copy ------------------------------------------------ */}
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-soft">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {t("hero.badge")}
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            {t("hero.title.before")}{" "}
            <span className="text-gradient">{t("hero.title.highlight")}</span>{" "}
            {t("hero.title.after")}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t("hero.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" variant="hero" onClick={onStart} className="group">
              {t("hero.cta.explore")}
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={onChat}>
              <MessageCircle />
              {t("hero.cta.ask")}
            </Button>
          </div>

          {/* ---- Stats ----------------------------------------------------- */}
          {hasAnyState && (
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              {[
                { k: "97cr+", v: t("hero.stat.voters") },
                { k: "543", v: t("hero.stat.seats") },
                { k: "7", v: t("hero.stat.phases") },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-xl border border-border bg-card p-3 text-center shadow-soft"
                >
                  <div className="font-display text-xl font-bold text-foreground">{s.k}</div>
                  <div className="text-xs text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
          )}

          {/* ---- Command Center / Intro Banner ------------------------------ */}
          <div className="mt-10 max-w-md animate-fade-in-up">
            {!hasAnyState ? (
              <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 text-center shadow-soft">
                <h2 className="font-display text-2xl font-bold mb-2">Let's help you vote</h2>
                <p className="text-muted-foreground mb-6">Answer 3 simple questions to get your personalized guide.</p>
                <Button 
                  size="lg" 
                  variant="hero" 
                  onClick={() => setIsGuidedFlowOpen(true)}
                  className="w-full text-lg py-6 rounded-2xl"
                >
                  Start now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
                <PrimaryAction onAction={onStart} />
                
                <Button
                  variant="ghost"
                  className="mt-6 text-sm text-muted-foreground w-full"
                  onClick={() => setIsGuidedFlowOpen(true)}
                >
                  Update my details
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ---- RIGHT: image ---------------------------------------------- */}
        <div className="relative animate-fade-in">
          <div className="absolute -inset-6 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
            <img
              src={heroImage}
              alt={t("hero.imageAlt")}
              width={1536}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
          <div
            className="tricolor-bar mt-4 mx-8 animate-shimmer"
            style={{
              background:
                "linear-gradient(90deg, hsl(var(--saffron)), hsl(0 0% 100%), hsl(var(--india-green)), hsl(var(--saffron)))",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      </div>
      
      <GuidedFlow 
        isOpen={isGuidedFlowOpen} 
        onClose={() => setIsGuidedFlowOpen(false)} 
      />
    </section>
  );
};

export default Hero;
