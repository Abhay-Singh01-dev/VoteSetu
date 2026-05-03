/**
 * VotingSimulation — Step-by-step EVM voting experience simulator.
 *
 * Lightweight state machine (no external libs).
 * Uses existing UI components exclusively.
 * Phase 10 implementation.
 */

import { useCallback, useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Vote,
  CreditCard,
  Fingerprint,
  RotateCcw,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SimStep = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  detail: string;
  cta: string;
};

type SimState = "idle" | "running" | "done";

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

const SIMULATION_STEPS: SimStep[] = [
  {
    id: "enter_booth",
    icon: <Vote className="h-7 w-7" />,
    title: "Enter the Polling Booth",
    description: "Walk to the polling station and join the queue. Show your EPIC or alternate ID.",
    detail:
      "The Presiding Officer verifies your name on the electoral roll and marks your index finger with indelible ink. You sign the register before entering the voting compartment.",
    cta: "Enter the booth →",
  },
  {
    id: "show_id",
    icon: <CreditCard className="h-7 w-7" />,
    title: "Show your ID & Get Inked",
    description:
      "Present your EPIC (or Aadhaar / Passport / PAN). The officer applies ink on your left index finger.",
    detail:
      "Indelible ink prevents double-voting. It stays for at least 72 hours. 12 alternative IDs are accepted if you don't have your EPIC.",
    cta: "Ink applied, proceed →",
  },
  {
    id: "press_evm",
    icon: <Fingerprint className="h-7 w-7" />,
    title: "Press the EVM Button",
    description:
      "In the voting compartment, press the blue button next to your chosen candidate's name and symbol.",
    detail:
      "A long beep and a red LED confirm your vote is recorded. The Control Unit is with the Polling Officer — you interact only with the Ballot Unit. You can also press NOTA (last option) to reject all candidates.",
    cta: "Vote cast ✓",
  },
  {
    id: "vvpat",
    icon: <Sparkles className="h-7 w-7" />,
    title: "Verify the VVPAT Slip",
    description:
      "A VVPAT slip showing your candidate's name, serial no. & symbol appears for 7 seconds.",
    detail:
      "The slip is visible through a sealed transparent window. After 7 seconds it drops into a sealed VVPAT box. You cannot take it out — it is for audit purposes only. Counting of VVPAT slips from 5 random booths per Assembly segment is mandatory on Counting Day.",
    cta: "Slip verified →",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const VotingSimulation = () => {
  const { user, setUser } = useUser();
  const [simState, setSimState] = useState<SimState>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    setUser({ currentScreen: "simulation" });
  }, [setUser]);

  const currentStep = SIMULATION_STEPS[currentIndex];
  const isLastStep = currentIndex === SIMULATION_STEPS.length - 1;
  const progress = Math.round((visitedSteps.size / SIMULATION_STEPS.length) * 100);

  const markCurrentVisited = useCallback(() => {
    setVisitedSteps((prev) => new Set([...prev, SIMULATION_STEPS[currentIndex].id]));
  }, [currentIndex]);

  const handleStart = () => {
    setSimState("running");
    setCurrentIndex(0);
    setVisitedSteps(new Set());
  };

  const handleNext = () => {
    markCurrentVisited();
    if (isLastStep) {
      markCurrentVisited();
      setSimState("done");
      // Phase 9/10: completing the simulation marks step 6 (Cast your vote) as done
      const idStr = "6";
      if (!user.completedSteps.includes(idStr)) {
        setUser({ completedSteps: [...user.completedSteps, idStr] });
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const handleReset = () => {
    setSimState("idle");
    setCurrentIndex(0);
    setVisitedSteps(new Set());
  };

  const stepDots = useMemo(
    () =>
      SIMULATION_STEPS.map((s, i) => ({
        id: s.id,
        visited: visitedSteps.has(s.id),
        active: i === currentIndex && simState === "running",
      })),
    [visitedSteps, currentIndex, simState],
  );

  return (
    <section id="simulation" className="container py-20" aria-labelledby="simulation-heading">
      <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
        <div className="tricolor-bar mx-auto w-24 mb-5" aria-hidden />
        <h2 id="simulation-heading" className="font-display text-3xl font-bold md:text-4xl">
          Voting Day Simulation
        </h2>
        <p className="mt-3 text-muted-foreground">
          Walk through every step of the polling booth experience — interactively.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        {/* ---- Idle state ------------------------------------------------ */}
        {simState === "idle" && (
          <div className="animate-fade-in-up text-center rounded-3xl border border-border bg-card p-10 shadow-soft">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-elegant">
              <Vote className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold">Ready to simulate?</h3>
            <p className="mt-3 text-muted-foreground">
              Experience the full polling booth process — from entering to verifying your VVPAT slip
              — in 4 guided steps.
            </p>
            <Button variant="hero" size="lg" className="mt-6" onClick={handleStart}>
              Start Simulation
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ---- Running state -------------------------------------------- */}
        {simState === "running" && (
          <div className="animate-fade-in">
            {/* Step dots */}
            <div className="mb-6 flex items-center justify-center gap-2" aria-hidden>
              {stepDots.map((dot) => (
                <span
                  key={dot.id}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    dot.active
                      ? "w-8 bg-primary"
                      : dot.visited
                        ? "w-2.5 bg-india-green"
                        : "w-2.5 bg-border",
                  )}
                />
              ))}
            </div>

            <div className="rounded-3xl border border-primary/20 bg-card p-8 shadow-elegant relative overflow-hidden">
              {/* Phase 6 Adaptive Branching: Block Unregistered Users early at Step 1 or 2 */}
              {user.isRegistered === false ? (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
                    <ShieldAlert className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-xl font-bold">Simulation Blocked</h3>
                  <p className="mt-3 text-muted-foreground">
                    The Presiding Officer cannot find your name on the electoral roll. Because you
                    are not registered, you are not allowed to cast a vote.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={handleReset}>
                    End Simulation
                  </Button>
                </div>
              ) : (
                <>
                  {/* Step header */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-soft">
                      {currentStep.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Step {currentIndex + 1} of {SIMULATION_STEPS.length}
                      </p>
                      <h3 className="font-display text-xl font-bold">{currentStep.title}</h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-5 text-base text-foreground/90 leading-relaxed">
                    {/* Phase 6: Adaptive string if no EPIC */}
                    {currentIndex === 1 && user.hasEpic === false
                      ? "Because you don't have an EPIC, you present your Aadhaar or driving licence instead."
                      : currentStep.description}
                  </p>

                  {/* Detail card */}
                  <div className="mt-4 rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground leading-relaxed">
                    {currentStep.detail}
                  </div>

                  {/* Navigation */}
                  <div className="mt-8 flex items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      aria-label="Previous step"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>

                    <Button variant="hero" onClick={handleNext} aria-label={currentStep.cta}>
                      {isLastStep ? "Complete Simulation ✓" : currentStep.cta}
                      {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ---- Done state ----------------------------------------------- */}
        {simState === "done" && (
          <div className="animate-fade-in-up text-center rounded-3xl border border-india-green/30 bg-india-green/5 p-10 shadow-soft">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-india-green text-white shadow-elegant">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-india-green">
              Simulation Complete!
            </h3>
            <p className="mt-3 text-muted-foreground">
              You've walked through all 4 steps of the polling booth experience.{" "}
              <strong className="text-foreground">Step 6 (Cast your vote)</strong> has been marked
              complete in your voter journey.
            </p>

            {/* Progress recap */}
            <div className="mx-auto mt-6 max-w-xs">
              <div className="rounded-full bg-secondary p-1 shadow-soft">
                <div
                  className="h-2.5 rounded-full bg-india-green transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{progress}% complete</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Run again
              </Button>
              <Button
                variant="hero"
                onClick={() =>
                  document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View Voter Journey
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default VotingSimulation;
