import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import SpeakButton from "./SpeakButton";

interface GuidedFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuidedFlow = ({ isOpen, onClose }: GuidedFlowProps) => {
  const { user, setUser } = useUser();
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reset to step 1 when reopened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  const advanceStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (step < 3) {
        setStep(step + 1);
      } else {
        onClose();
      }
      setIsTransitioning(false);
    }, 400); // Small delay to show the button press feedback
  };

  const handleAnswer = (questionId: number, answer: boolean) => {
    switch (questionId) {
      case 1:
        setUser({ age: answer ? 18 : 17 });
        break;
      case 2:
        setUser({ isRegistered: answer });
        break;
      case 3:
        setUser({ hasEpic: answer });
        break;
    }
    advanceStep();
  };

  if (!isOpen) return null;

  const currentQuestion = () => {
    switch (step) {
      case 1:
        return {
          id: 1,
          title: "Are you 18 years old or older?",
          voice: "Are you 18 years old or older?",
        };
      case 2:
        return {
          id: 2,
          title: "Are you registered to vote?",
          voice: "Are you registered to vote? This means your name is on the list.",
        };
      case 3:
        return {
          id: 3,
          title: "Do you have your Voter ID card?",
          voice: "Do you have your Voter ID card?",
        };
      default:
        return { id: 0, title: "", voice: "" };
    }
  };

  const q = currentQuestion();

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background animate-in slide-in-from-bottom-5 duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto w-full">
        {isTransitioning ? (
          <div className="flex flex-col items-center animate-fade-in">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground font-medium">Saving answer...</p>
          </div>
        ) : (
          <div className="w-full animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-8">
              <SpeakButton text={q.voice} size="lg" />
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-bold mb-12">{q.title}</h2>

            <div className="flex flex-col gap-4">
              <Button
                variant="hero"
                size="lg"
                onClick={() => handleAnswer(q.id, true)}
                className="w-full text-2xl py-8 rounded-2xl flex items-center justify-between px-6 focus-visible:ring-4 focus-visible:ring-ring"
              >
                <span>Yes</span>
                <CheckCircle2 className="h-8 w-8" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleAnswer(q.id, false)}
                className="w-full text-2xl py-8 rounded-2xl flex items-center justify-between px-6 border-2 border-transparent hover:border-border focus-visible:ring-4 focus-visible:ring-ring"
              >
                <span>No</span>
                <XCircle className="h-8 w-8 text-destructive" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuidedFlow;
