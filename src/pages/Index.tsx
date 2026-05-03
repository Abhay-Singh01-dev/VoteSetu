import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import Hero from "@/components/Hero";
import UserJourneyMap from "@/components/UserJourneyMap";
import Timeline from "@/components/Timeline";
import VoterJourney from "@/components/VoterJourney";
import EpicHelper from "@/components/EpicHelper";
import FAQ from "@/components/FAQ";
import ChatAssistant from "@/components/ChatAssistant";
import LiveAgentPill from "@/components/LiveAgentPill";
import VoterPlanDialog from "@/components/VoterPlanDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import VotingSimulation from "@/components/VotingSimulation";
import StatusWarnings from "@/components/StatusWarnings";
import UserProfileDialog from "@/components/UserProfileDialog";
import { Vote, FileDown, User, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/LanguageProvider";
import { useUser } from "@/context/UserContext";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [liveAgentOpen, setLiveAgentOpen] = useState(false);
  const { t } = useT();
  const { setUser } = useUser();

  // Hero section tracking (default)
  useEffect(() => {
    setUser({ currentScreen: "hero" });
  }, [setUser]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to content for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-elegant"
      >
        {t("skip.toContent")}
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between gap-3">
          <a
            href="/"
            className="flex items-center gap-2 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={`${t("brand.name")} home`}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft"
              aria-hidden
            >
              <Vote className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg font-bold leading-none">{t("brand.name")}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t("brand.tagline")}
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {[
              { id: "timeline", label: t("nav.timeline") },
              { id: "journey", label: t("nav.journey") },
              { id: "simulation", label: "Simulation" },
              { id: "epic", label: t("nav.epic") },
              { id: "faq", label: t("nav.faq") },
            ].map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {n.label}
              </button>
            ))}
            <VoterPlanDialog
              trigger={
                <Button size="sm" variant="hero" className="ml-2">
                  <FileDown />
                  {t("nav.myPlan")}
                </Button>
              }
            />

            <LanguageSwitcher variant="compact" />
            <UserProfileDialog
              autoOpen
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 rounded-full hover:bg-primary/10 text-primary"
                >
                  <User className="h-5 w-5" />
                </Button>
              }
            />
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <UserProfileDialog autoOpen />
          </div>
        </div>

        {/* Tricolour bar */}
        <div className="tricolor-bar rounded-none" aria-hidden />
      </header>

      {/* Phase 11: Global status warnings — rendered below header */}
      <StatusWarnings />

      <main id="main">
        {/* Phase 6: Hero with voting status card */}
        <Hero onStart={() => scrollTo("timeline")} onChat={() => setChatOpen(true)} />

        {/* Phase 7: Timeline with phase highlighting */}
        <Timeline />

        {/* Phase 4: UserJourneyMap — High-level control view */}
        <UserJourneyMap />

        {/* Phase 4: VoterJourney — state-driven with next step banner */}
        <VoterJourney />

        {/* Phase 10: Voting simulation */}
        <VotingSimulation />

        {/* Phase 8: EpicHelper / EpicValidator — writes hasEpic to context */}
        <EpicHelper />

        <FAQ />

        {/* CTA section */}
        <section className="container pb-20" aria-labelledby="cta-heading">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-accent p-10 text-center text-accent-foreground shadow-elegant md:p-14">
            <div className="absolute inset-0 bg-gradient-glow opacity-50" aria-hidden />
            <div className="relative">
              <h3 id="cta-heading" className="font-display text-3xl font-bold md:text-4xl">
                {t("cta.heading")}
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-accent-foreground/85">{t("cta.subtitle")}</p>
              <button
                onClick={() => setChatOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-accent shadow-elegant transition-bounce hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
              >
                {t("cta.button")}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/40">
        <div className="container flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground md:flex-row">
          <p>{t("footer.notAffiliated", { year: new Date().getFullYear() })}</p>
          <p>
            {t("footer.officialSource")}{" "}
            <a
              href="https://eci.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              eci.gov.in
            </a>
          </p>
        </div>
      </footer>

      {/* Phase 5 & 10: Unified text & live voice assistant */}
      <ChatAssistant
        open={chatOpen}
        onOpenChange={setChatOpen}
        liveAgentOpen={liveAgentOpen}
        onLiveAgentOpenChange={setLiveAgentOpen}
      />

      <LiveAgentPill open={liveAgentOpen} onClose={() => setLiveAgentOpen(false)} />
    </div>
  );
};

export default React.memo(Index);
